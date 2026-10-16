import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { checkEntityReferences } from '../../../lib/refs';
import { MASTER_URL_TO_TYPE } from '../../../lib/models';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ message: 'Missing type or id parameter' }, { status: 400 });
    }

    // Accept both plural URL keys (categories) and singular types (category)
    const normalized = MASTER_URL_TO_TYPE[type] || type;
    const result = await checkEntityReferences(normalized, id);
    return NextResponse.json(result, { status: result.canDelete ? 200 : 409 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Reference check failed' }, { status: 500 });
  }
}
