import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { User } from '../../../../lib/models';
import { createPasswordResetToken, RESET_TOKEN_TTL_MS } from '../../../../lib/auth';
import { sendEmail, isEmailConfigured } from '../../../../lib/email';
import { passwordResetEmail } from '../../../../lib/email-templates';
import { siteConfig } from '../../../../config/site';

/**
 * POST /api/auth/forgot-password
 * Generates a password-reset token (stored hashed, 30 min expiry) and emails
 * the reset link via SMTP. Always returns a generic message so account
 * existence isn't leaked.
 *
 * When SMTP_* env vars are not configured (local dev), the response includes
 * devResetToken/devResetUrl so the flow stays testable without an email
 * provider.
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

    const genericMessage =
      'If an account with that email exists, a password reset link has been sent.';

    if (!user) {
      return NextResponse.json({ message: genericMessage });
    }

    const reset = createPasswordResetToken();
    user.resetTokenHash = reset.hash;
    user.resetTokenExpires = reset.expires;
    await user.save();

    const resetUrl = `${siteConfig.siteUrl.replace(/\/$/, '')}/?reset-token=${reset.token}`;

    const body: Record<string, string> = { message: genericMessage };

    if (isEmailConfigured()) {
      const sent = await sendEmail(
        normalizedEmail,
        passwordResetEmail({
          userName: user.name,
          resetUrl,
          expiryMinutes: Math.round(RESET_TOKEN_TTL_MS / 60000)
        })
      );
      if (!sent) {
        console.error(`[password-reset] email delivery failed for ${normalizedEmail}`);
      }
    } else {
      // No SMTP configured — dev helper keeps the flow testable.
      console.log(`[password-reset] token for ${normalizedEmail}: ${reset.token}`);
      if (process.env.NODE_ENV !== 'production') {
        body.devResetToken = reset.token;
        body.devResetUrl = resetUrl;
      }
    }

    return NextResponse.json(body);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Request failed' }, { status: 500 });
  }
}
