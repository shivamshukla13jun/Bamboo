import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.txt': 'text/plain'
};

type Ctx = { params: Promise<{ path: string[] }> };

/**
 * Serves files written to public/uploads/<folder>/ at runtime.
 * Route handlers take precedence over public/ static files, so uploads
 * created after `next build` are still served correctly in production.
 */
export async function GET(_request: NextRequest, ctx: Ctx) {
  try {
    const { path: segments } = await ctx.params;
    const rel = segments.map((s) => s.replace(/\.\./g, '')).join('/');
    const filePath = path.join(process.cwd(), 'public', 'uploads', rel);
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads');

    if (!filePath.startsWith(uploadsRoot)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    return NextResponse.json({ message: 'File not found' }, { status: 404 });
  }
}
