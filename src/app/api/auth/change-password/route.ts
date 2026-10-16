import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { requireUser, verifyPassword, hashPassword } from '../../../../lib/auth';

/**
 * POST /api/auth/change-password — signed-in user changes their own password.
 * Body: { currentPassword, newPassword }
 */
export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const session = requireUser(request);
    if (session instanceof NextResponse) return session;

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current and new password are required' },
        { status: 400 }
      );
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json(
        { message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ id: session.userId });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!(await verifyPassword(String(currentPassword), user.passwordHash))) {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
    }

    user.passwordHash = await hashPassword(String(newPassword));
    await user.save();

    return NextResponse.json({ message: 'Password updated' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to change password' }, { status: 500 });
  }
}
