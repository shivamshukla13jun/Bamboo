import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { getSessionUser } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    await ensureSeeded();
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Session check failed' }, { status: 500 });
  }
}
