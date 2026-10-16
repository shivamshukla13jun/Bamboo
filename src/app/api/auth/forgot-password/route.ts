import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { createPasswordResetToken } from '../../../../lib/auth';
import { siteConfig } from '../../../../config/site';

/**
 * POST /api/auth/forgot-password
 * Generates a password-reset token stored hashed on the user (30 min expiry).
 * Always returns a generic success message so account existence isn't leaked.
 *
 * No SMTP is configured for this app — in development the reset link/token is
 * included in the response so the flow is testable. In production wire this up
 * to your email provider and only return the generic message.
 */
export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    const message =
      'If an account with that email exists, a password reset link has been generated.';

    if (!user) {
      return NextResponse.json({ message });
    }

    const reset = createPasswordResetToken();
    user.resetTokenHash = reset.hash;
    user.resetTokenExpires = reset.expires;
    await user.save();

    const resetUrl = `${siteConfig.siteUrl.replace(/\/$/, '')}/?reset-token=${reset.token}`;

    // TODO: send `resetUrl` via email provider (SMTP) in production.
    console.log(`[password-reset] token for ${normalizedEmail}: ${reset.token}`);

    const body: Record<string, string> = { message };
    if (process.env.NODE_ENV !== 'production') {
      // Dev helper — lets the UI surface the link without an email provider.
      body.devResetToken = reset.token;
      body.devResetUrl = resetUrl;
    }

    return NextResponse.json(body);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Request failed' }, { status: 500 });
  }
}
