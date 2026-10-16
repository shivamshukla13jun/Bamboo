import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { getUploadStats } from '../../../lib/storage';
import { requireAdmin } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const denied = await requireAdmin(request);
    if (denied) return denied;
    return NextResponse.json({ uploadStats: await getUploadStats() });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch storage stats' }, { status: 500 });
  }
}
