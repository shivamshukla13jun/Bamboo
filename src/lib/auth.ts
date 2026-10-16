import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { User, clean } from './models';
import { AuthUser } from '../types';

export const SESSION_COOKIE = 'store_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.AUTH_SECRET || 'bamboorise-dev-secret-change-me';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('hex');
}

export function createSessionToken(userId: string, role: string): string {
  const ts = Date.now();
  const payload = `${userId}.${role}.${ts}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): { userId: string; role: string } | null {
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [userId, role, ts, sig] = parts;
  const payload = `${userId}.${role}.${ts}`;
  const expected = sign(payload);
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age > SESSION_MAX_AGE_SEC * 1000) return null;
  return { userId, role };
}

export function sessionCookieHeader(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SEC}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readSession(request: NextRequest): { userId: string; role: string } | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionUser(request: NextRequest): Promise<AuthUser | null> {
  const session = readSession(request);
  if (!session) return null;
  const user = await User.findOne({ id: session.userId }).lean();
  if (!user) return null;
  const { passwordHash, ...rest } = clean<any>(user);
  return rest as AuthUser;
}

/**
 * Guard for admin-only routes. Returns null when the request carries a valid
 * admin session, otherwise a ready-to-return 401/403 response.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = readSession(request);
  if (!session) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }
  return null;
}

export function toPublicUser(doc: any): AuthUser {
  const { passwordHash, ...rest } = clean<any>(doc);
  return rest as AuthUser;
}
