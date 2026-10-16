import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { requireUser, toPublicUser } from '../../../../lib/auth';

/**
 * PUT /api/auth/profile — update the signed-in user's profile fields.
 * Only `name` is editable for now; role/email are immutable here.
 */
export async function PUT(request: NextRequest) {
  try {
    await ensureSeeded();
    const session = requireUser(request);
    if (session instanceof NextResponse) return session;

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const updated = await User.findOneAndUpdate(
      { id: session.userId },
      { $set: { name: String(name).trim() } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(toPublicUser(updated));
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update profile' }, { status: 500 });
  }
}
