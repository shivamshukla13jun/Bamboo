import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { HomeQuote, Master, cleanList } from '../../../lib/models';
import { requireAdmin } from '../../../lib/auth';
import { siteConfig } from '../../../config/site';
import { QuoteStatus } from '../../../types';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    const quotes = await HomeQuote.find().sort({ _id: -1 }).lean();
    return NextResponse.json(cleanList(quotes));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const body = await request.json();

    // Server-side price estimate from masters (authoritative calculation)
    const [homeType, roofStyle, species] = await Promise.all([
      Master.findOne({ type: 'home_type', $or: [{ id: body.homeTypeId }, { code: body.homeTypeId }] }).lean(),
      Master.findOne({ type: 'roof_style', id: body.roofStyleId }).lean(),
      Master.findOne({ type: 'species', id: body.speciesId }).lean()
    ]);

    const area = Number(body.floorAreaSqFt) || 0;
    const basePerSqFt = homeType?.basePricePerSqFt ?? 45;
    const roofMultiplier = roofStyle?.priceMultiplier ?? 1.0;
    let estimated = area * basePerSqFt * roofMultiplier;
    if ((body.stories || 1) > 1) estimated += (body.stories - 1) * siteConfig.customizer.extraStoryCost;
    if (body.offGridSolar) estimated += siteConfig.customizer.solarAddonCost;

    const quote = {
      ...body,
      id: `quote-${Date.now()}`,
      homeTypeName: homeType?.name || body.homeTypeName,
      speciesName: species?.name || body.speciesName,
      roofStyleName: roofStyle?.name || body.roofStyleName,
      estimatedPrice: Math.round(estimated),
      status: QuoteStatus.QuoteRequested,
      statusHistory: [
        {
          status: QuoteStatus.QuoteRequested,
          changedAt: new Date().toISOString(),
          note: 'Quote request received'
        }
      ],
      createdAt: new Date().toISOString()
    };

    const created = await HomeQuote.create(quote);
    const { _id, __v, ...rest } = created.toObject();
    return NextResponse.json(rest, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to submit home quote' }, { status: 500 });
  }
}
