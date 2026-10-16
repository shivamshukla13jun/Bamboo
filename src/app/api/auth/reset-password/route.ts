import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { hashPassword, hashResetToken } from '../../../../lib/auth';

/**
 * POST /api/auth/reset-password
 * Body: { token, password } — validates the reset token hash + expiry and
 * replaces the user's password hash.
 */
export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Reset token and new password are required' },
        { status: 400 }
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      resetTokenHash: hashResetToken(token),
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token. Request a new link.' },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(String(password));
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    return NextResponse.json({ message: 'Password updated. You can sign in now.' });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Reset failed' }, { status: 500 });
  }
}
