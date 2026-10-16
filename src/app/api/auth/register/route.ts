import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { hashPassword, toPublicUser, createSessionToken, sessionCookieHeader } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const { name, email, password } = await request.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { message: 'Name, email and password are required' },
        { status: 400 }
      );
    }
    if (String(password).length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const doc = {
      id: `user-${Date.now()}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(String(password)),
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    const created = await User.create(doc);

    const token = createSessionToken(doc.id, 'customer');
    const res = NextResponse.json(toPublicUser(created.toObject()), { status: 201 });
    res.headers.set('Set-Cookie', sessionCookieHeader(token));
    return res;
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Registration failed' }, { status: 500 });
  }
}
