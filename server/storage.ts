import fs from 'fs';
import path from 'path';
import { StorageConfig, StorageProviderType } from '../src/types';

export class StorageService {
  private activeProvider: StorageProviderType = (process.env.STORAGE_PROVIDER as StorageProviderType) || 'cloudinary';

  public getConfig(): StorageConfig {
    return {
      activeProvider: this.activeProvider,
      awsBucket: process.env.AWS_S3_BUCKET || 'bamboorise-uploads',
      awsRegion: process.env.AWS_REGION || 'us-east-1',
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'bamboorise-cloud',
      minioEndpoint: process.env.MINIO_ENDPOINT || 'play.min.io:9000',
      minioBucket: process.env.MINIO_BUCKET || 'bamboorise-bucket',
      uploadStats: {
        totalFiles: 24,
        totalSizeBytes: 15420000
      }
    };
  }

  public setProvider(provider: StorageProviderType): StorageConfig {
    this.activeProvider = provider;
    process.env.STORAGE_PROVIDER = provider;
    return this.getConfig();
  }

  public async uploadFile(file: Express.Multer.File, customFolder = 'products'): Promise<{ url: string; provider: StorageProviderType; filename: string }> {
    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    switch (this.activeProvider) {
      case 'aws': {
        const bucket = process.env.AWS_S3_BUCKET || 'bamboorise-uploads';
        const region = process.env.AWS_REGION || 'us-east-1';
        // Simulates AWS S3 upload output format using AWS standard URL pattern
        const awsUrl = `https://${bucket}.s3.${region}.amazonaws.com/${customFolder}/${filename}`;
        return {
          url: awsUrl,
          provider: 'aws',
          filename
        };
      }
      case 'cloudinary': {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'bamboorise-cloud';
        // Simulates Cloudinary upload output format
        const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1726400000/${customFolder}/${filename}`;
        return {
          url: cloudinaryUrl,
          provider: 'cloudinary',
          filename
        };
      }
      case 'minio': {
        const endpoint = process.env.MINIO_ENDPOINT || 'play.min.io:9000';
        const bucket = process.env.MINIO_BUCKET || 'bamboorise-bucket';
        // Simulates MinIO S3-compatible URL format
        const minioUrl = `http://${endpoint}/${bucket}/${customFolder}/${filename}`;
        return {
          url: minioUrl,
          provider: 'minio',
          filename
        };
      }
      case 'mock':
      default: {
        // Local Data URL or local uploads fallback
        const base64 = file.buffer.toString('base64');
        const mime = file.mimetype || 'image/jpeg';
        const dataUrl = `data:${mime};base64,${base64}`;
        return {
          url: dataUrl,
          provider: 'mock',
          filename
        };
      }
    }
  }
}

export const storageService = new StorageService();
