import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { handleUpload } from '../../../../lib/storage';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await ensureSeeded();
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'products');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const uploadFile = file as File;
    if (uploadFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'File exceeds 10MB limit' }, { status: 413 });
    }

    const bytes = new Uint8Array(await uploadFile.arrayBuffer());
    const result = await handleUpload(
      { name: uploadFile.name, type: uploadFile.type, size: uploadFile.size, bytes },
      folder
    );
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'File upload failed' }, { status: 500 });
  }
}
