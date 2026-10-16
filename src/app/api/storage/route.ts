import { NextResponse } from 'next/server';
import { ensureSeeded } from '../../../lib/seed';
import { getStorageConfig } from '../../../lib/storage';

export async function GET() {
  try {
    await ensureSeeded();
    return NextResponse.json(await getStorageConfig());
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch storage config' }, { status: 500 });
  }
}
