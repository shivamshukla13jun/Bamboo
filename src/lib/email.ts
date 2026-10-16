import nodemailer, { Transporter } from 'nodemailer';
import { siteConfig } from '../config/site';
import type { EmailTemplate } from './email-templates';

/**
 * SMTP email service — fully env-driven, secrets never in code:
 *   SMTP_HOST, SMTP_PORT (default 587), SMTP_SECURE (true for 465),
 *   SMTP_USER, SMTP_PASS, SMTP_FROM (default: "<sitename> <noreply@host>")
 */

let cachedTransporter: Transporter | null = null;
let transporterVerified = false;

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return cachedTransporter;
}

export async function verifyEmailConnection(): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    if (!transporterVerified) {
      await getTransporter().verify();
      transporterVerified = true;
    }
    return true;
  } catch (err) {
    console.error('[email] SMTP verification failed:', err);
    return false;
  }
}

export async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log(`[email] SMTP not configured — skipped "${template.subject}" to ${to}`);
    return false;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM || `${siteConfig.siteName} <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
    return true;
  } catch (err) {
    console.error(`[email] send failed to ${to}:`, err);
    return false;
  }
}
