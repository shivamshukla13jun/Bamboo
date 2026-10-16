import { NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { Master, cleanList, MASTER_TYPE_TO_GROUP, MASTER_TYPES } from '../../../lib/models';

export async function GET() {
  try {
    await ensureSeeded();
    const all = cleanList<any>(await Master.find().sort({ type: 1, id: 1 }).lean());

    const grouped: Record<string, any[]> = {};
    for (const t of MASTER_TYPES) grouped[MASTER_TYPE_TO_GROUP[t]] = [];
    for (const m of all) {
      const group = MASTER_TYPE_TO_GROUP[m.type as keyof typeof MASTER_TYPE_TO_GROUP];
      if (group) grouped[group].push(m);
    }

    return NextResponse.json(grouped);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch masters' }, { status: 500 });
  }
}
