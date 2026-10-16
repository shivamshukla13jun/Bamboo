import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { verifyPassword, toPublicUser, createSessionToken, sessionCookieHeader } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const { email, password } = await request.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() }).lean();
    if (!user || !(await verifyPassword(String(password), user.passwordHash))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = createSessionToken(user.id, user.role);
    const res = NextResponse.json(toPublicUser(user));
    res.headers.set('Set-Cookie', sessionCookieHeader(token));
    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Login failed' }, { status: 500 });
  }
}
