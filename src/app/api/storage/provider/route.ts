import { NextRequest, NextResponse } from 'next/server';
import { ensureSeeded } from '../../../../lib/seed';
import { setStorageProvider } from '../../../../lib/storage';
import { StorageProviderType } from '../../../../types';

const VALID: StorageProviderType[] = ['cloudinary', 'aws', 'minio', 'mock'];

export async function PUT(request: NextRequest) {
  try {
    await ensureSeeded();
    const { provider } = (await request.json()) as { provider: StorageProviderType };
    if (!VALID.includes(provider)) {
      return NextResponse.json({ message: 'Invalid storage provider' }, { status: 400 });
    }
    const updated = await setStorageProvider(provider);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to update storage provider' }, { status: 500 });
  }
}
