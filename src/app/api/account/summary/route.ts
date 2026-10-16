import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { Order, HomeQuote, User, cleanList } from '../../../../lib/models';
import { requireUser } from '../../../../lib/auth';

/**
 * GET /api/account/summary — the signed-in customer's own orders + quotes.
 */
export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const session = requireUser(request);
    if (session instanceof NextResponse) return session;

    const user = await User.findOne({ id: session.userId }).lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const email = String(user.email).toLowerCase();
    const [orders, quotes] = await Promise.all([
      Order.find({ customerEmail: email }).sort({ createdAt: -1 }).lean(),
      HomeQuote.find({ clientEmail: email }).sort({ createdAt: -1 }).lean()
    ]);

    return NextResponse.json({ orders: cleanList(orders), quotes: cleanList(quotes) });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch account data' }, { status: 500 });
  }
}
