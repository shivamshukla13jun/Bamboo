import { siteConfig } from '../config/site';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Base branded layout — dark stone/emerald palette pulled from
 * site.config.json theme so emails match the storefront.
 */
function baseLayout(opts: {
  heading: string;
  bodyHtml: string;
  ctaUrl?: string;
  ctaText?: string;
  footerNote?: string;
}): string {
  const t = siteConfig.theme;
  const primary = t.primary['600'];
  const primaryDark = t.primary['700'];
  const bg = t.neutral['950'];
  const card = t.neutral['900'];
  const border = t.neutral['800'];
  const text = t.neutral['100'];
  const muted = t.neutral['400'];
  const accent = t.accent['400'];

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bg};font-family:Segoe UI,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="background:${card};border:1px solid ${border};border-radius:16px;overflow:hidden;">
      <div style="padding:24px 28px;border-bottom:1px solid ${border};">
        <span style="display:inline-block;width:32px;height:32px;line-height:32px;text-align:center;border-radius:8px;background:${primaryDark};color:#fff;font-size:16px;">${siteConfig.logoEmoji}</span>
        <span style="font-size:18px;font-weight:800;color:${text};margin-left:8px;vertical-align:middle;">${siteConfig.siteName}</span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:${text};">${opts.heading}</h1>
        <div style="font-size:14px;line-height:1.6;color:${muted};">${opts.bodyHtml}</div>
        ${
          opts.ctaUrl
            ? `<div style="margin:28px 0;text-align:center;">
                 <a href="${opts.ctaUrl}" style="display:inline-block;background:${primary};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">${opts.ctaText}</a>
               </div>
               <p style="font-size:12px;color:${muted};word-break:break-all;">Or paste this link into your browser:<br><a href="${opts.ctaUrl}" style="color:${accent};">${opts.ctaUrl}</a></p>`
            : ''
        }
      </div>
      <div style="padding:18px 28px;border-top:1px solid ${border};font-size:11px;color:${muted};">
        ${opts.footerNote || `${siteConfig.footer.copyright}`}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function passwordResetEmail(opts: {
  userName: string;
  resetUrl: string;
  expiryMinutes: number;
}): EmailTemplate {
  const { siteName } = siteConfig;
  return {
    subject: `${siteName} — Reset your password`,
    html: baseLayout({
      heading: 'Reset your password',
      bodyHtml: `<p>Hi ${opts.userName || 'there'},</p>
        <p>We received a request to reset the password for your ${siteName} account.
        This link is valid for <strong>${opts.expiryMinutes} minutes</strong>.</p>
        <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>`,
      ctaUrl: opts.resetUrl,
      ctaText: 'Reset Password',
      footerNote: `This reset link expires in ${opts.expiryMinutes} minutes. ${siteConfig.contact.email}`
    }),
    text: [
      `Hi ${opts.userName || 'there'},`,
      ``,
      `Reset your ${siteName} password (valid ${opts.expiryMinutes} min):`,
      opts.resetUrl,
      ``,
      `If you didn't request this, ignore this email.`
    ].join('\n')
  };
}

export function welcomeEmail(opts: { userName: string }): EmailTemplate {
  const { siteName } = siteConfig;
  return {
    subject: `Welcome to ${siteName}`,
    html: baseLayout({
      heading: `Welcome, ${opts.userName}!`,
      bodyHtml: `<p>Your ${siteName} account is ready. Browse the catalog, configure a custom home blueprint, and check out securely.</p>`,
      ctaUrl: siteConfig.siteUrl,
      ctaText: `Visit ${siteName}`
    }),
    text: `Welcome to ${siteName}, ${opts.userName}! Visit us at ${siteConfig.siteUrl}`
  };
}
