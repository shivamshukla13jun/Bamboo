import { promises as fs } from 'fs';
import path from 'path';
import { Setting } from './models';
import { StorageConfig, StorageProvider } from '../types';
import { DEFAULT_STORAGE_CONFIG } from './seed';

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

const VALID_PROVIDERS = Object.values(StorageProvider);

function envProvider(): StorageProvider {
  const p = process.env.STORAGE_PROVIDER as StorageProvider;
  return VALID_PROVIDERS.includes(p) ? p : StorageProvider.Mock;
}

/**
 * Internal storage config. The active provider is configured exclusively via
 * the STORAGE_PROVIDER env var and is never exposed to the app UI or API.
 */
async function getStorageConfig(): Promise<StorageConfig> {
  const doc = await Setting.findOne({ key: 'storage' }).lean();
  const value = (doc as any)?.value || {};
  return {
    ...DEFAULT_STORAGE_CONFIG,
    ...value,
    activeProvider: envProvider()
  };
}

export async function getUploadStats() {
  const doc = await Setting.findOne({ key: 'storage' }).lean();
  const stats = (doc as any)?.value?.uploadStats;
  return {
    totalFiles: stats?.totalFiles || 0,
    totalSizeBytes: stats?.totalSizeBytes || 0
  };
}

async function bumpUploadStats(sizeBytes: number) {
  const stats = await getUploadStats();
  await Setting.findOneAndUpdate(
    { key: 'storage' },
    {
      $set: {
        key: 'storage',
        'value.uploadStats.totalFiles': stats.totalFiles + 1,
        'value.uploadStats.totalSizeBytes': stats.totalSizeBytes + sizeBytes
      }
    },
    { upsert: true }
  );
}

export interface UploadResult {
  url: string;
  filename: string;
}

/**
 * Upload pipeline driven by STORAGE_PROVIDER env.
 * - mock: writes the file to public/uploads/<folder>/, served at /uploads/*
 * - aws / cloudinary: simulated URLs (no real network calls)
 */
export async function handleUpload(
  file: { name: string; type: string; size: number; bytes: Uint8Array },
  folder = 'products'
): Promise<UploadResult> {
  const config = await getStorageConfig();
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '') || 'misc';
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  switch (config.activeProvider) {
    case StorageProvider.Aws: {
      await bumpUploadStats(file.size);
      return {
        url: `https://${config.awsBucket}.s3.${config.awsRegion}.amazonaws.com/${safeFolder}/${filename}`,
        filename
      };
    }
    case StorageProvider.Cloudinary: {
      await bumpUploadStats(file.size);
      return {
        url: `https://res.cloudinary.com/${config.cloudinaryCloudName}/image/upload/v${Math.floor(Date.now() / 1000)}/${safeFolder}/${filename}`,
        filename
      };
    }
    case StorageProvider.Mock:
    default: {
      const dir = path.join(UPLOAD_ROOT, safeFolder);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, filename), Buffer.from(file.bytes));
      await bumpUploadStats(file.size);
      return { url: `/uploads/${safeFolder}/${filename}`, filename };
    }
  }
}
