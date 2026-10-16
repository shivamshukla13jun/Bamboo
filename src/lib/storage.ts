import { promises as fs } from 'fs';
import path from 'path';
import { Setting } from './models';
import { StorageConfig, StorageProviderType } from '../types';
import { DEFAULT_STORAGE_CONFIG } from './seed';

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

export async function getStorageConfig(): Promise<StorageConfig> {
  const doc = await Setting.findOne({ key: 'storage' }).lean();
  const value = (doc as any)?.value || {};
  return {
    ...DEFAULT_STORAGE_CONFIG,
    ...value,
    activeProvider:
      (value.activeProvider as StorageProviderType) ||
      (process.env.STORAGE_PROVIDER as StorageProviderType) ||
      'mock'
  };
}

export async function setStorageProvider(provider: StorageProviderType): Promise<StorageConfig> {
  const current = await getStorageConfig();
  const next = { ...current, activeProvider: provider };
  await Setting.findOneAndUpdate(
    { key: 'storage' },
    { $set: { key: 'storage', value: next } },
    { upsert: true }
  );
  return next;
}

async function bumpUploadStats(sizeBytes: number) {
  const current = await getStorageConfig();
  const next = {
    ...current,
    uploadStats: {
      totalFiles: (current.uploadStats?.totalFiles || 0) + 1,
      totalSizeBytes: (current.uploadStats?.totalSizeBytes || 0) + sizeBytes
    }
  };
  await Setting.findOneAndUpdate(
    { key: 'storage' },
    { $set: { key: 'storage', value: next } },
    { upsert: true }
  );
}

export interface UploadResult {
  url: string;
  provider: StorageProviderType;
  filename: string;
}

/**
 * Upload pipeline.
 * - mock: writes the file to public/uploads/<folder>/ and serves it at /uploads/*
 * - aws / cloudinary / minio: simulated URLs (no real network calls)
 */
export async function handleUpload(
  file: { name: string; type: string; size: number; bytes: Uint8Array },
  folder = 'products'
): Promise<UploadResult> {
  const config = await getStorageConfig();
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'misc';
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  switch (config.activeProvider) {
    case 'aws': {
      const url = `https://${config.awsBucket}.s3.${config.awsRegion}.amazonaws.com/${safeFolder}/${filename}`;
      await bumpUploadStats(file.size);
      return { url, provider: 'aws', filename };
    }
    case 'cloudinary': {
      const url = `https://res.cloudinary.com/${config.cloudinaryCloudName}/image/upload/v${Math.floor(Date.now() / 1000)}/${safeFolder}/${filename}`;
      await bumpUploadStats(file.size);
      return { url, provider: 'cloudinary', filename };
    }
    case 'minio': {
      const url = `http://${config.minioEndpoint}/${config.minioBucket}/${safeFolder}/${filename}`;
      await bumpUploadStats(file.size);
      return { url, provider: 'minio', filename };
    }
    case 'mock':
    default: {
      const dir = path.join(UPLOAD_ROOT, safeFolder);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), Buffer.from(file.bytes));
      await bumpUploadStats(file.size);
      return { url: `/uploads/${safeFolder}/${filename}`, provider: 'mock', filename };
    }
  }
}
