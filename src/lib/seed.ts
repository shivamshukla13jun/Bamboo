import { connectDb } from './db';
import { Product, Master, Order, HomeQuote, Setting, User } from './models';
import { hashPassword } from './auth';
import {
  initialMasters,
  INITIAL_PRODUCTS,
  INITIAL_QUOTES,
  initialOrders,
  DEFAULT_SEO_CONFIG
} from './seed-data';
import { StorageProviderType } from '../types';

declare global {
  // eslint-disable-next-line no-var
  var _bambooriseSeedPromise: Promise<void> | undefined;
}

export const DEFAULT_STORAGE_CONFIG = {
  activeProvider: (process.env.STORAGE_PROVIDER || 'mock') as StorageProviderType,
  awsBucket: process.env.AWS_S3_BUCKET || 'bamboorise-uploads',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'bamboorise-cloud',
  uploadStats: { totalFiles: 0, totalSizeBytes: 0 }
};

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@bamboorise.com').toLowerCase();

export async function seedDatabase() {
  await connectDb();

  const masterCount = await Master.countDocuments();
  if (masterCount === 0) {
    await Master.insertMany(initialMasters());
  }

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.insertMany(INITIAL_PRODUCTS);
  }

  const quoteCount = await HomeQuote.countDocuments();
  if (quoteCount === 0) {
    await HomeQuote.insertMany(INITIAL_QUOTES);
  }

  const orderCount = await Order.countDocuments();
  if (orderCount === 0) {
    await Order.insertMany(initialOrders());
  }

  await Setting.findOneAndUpdate(
    { key: 'seo' },
    { $setOnInsert: { key: 'seo', value: DEFAULT_SEO_CONFIG } },
    { upsert: true }
  );

  await Setting.findOneAndUpdate(
    { key: 'storage' },
    { $setOnInsert: { key: 'storage', value: DEFAULT_STORAGE_CONFIG } },
    { upsert: true }
  );

  await ensureAdminUser();
}

/** Idempotent admin upsert — also called by the login route for self-healing. */
export async function ensureAdminUser() {
  await connectDb();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $setOnInsert: {
        id: 'user-admin',
        name: 'Store Administrator',
        email: ADMIN_EMAIL,
        passwordHash: await hashPassword(adminPassword),
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    },
    { upsert: true }
  );
}

/**
 * Lazy, process-deduped seeding: the first API call seeds an empty database
 * so the storefront works without running `npm run seed` first.
 */
export function ensureSeeded(): Promise<void> {
  if (!global._bambooriseSeedPromise) {
    global._bambooriseSeedPromise = seedDatabase().catch((err) => {
      global._bambooriseSeedPromise = undefined;
      throw err;
    });
  }
  return global._bambooriseSeedPromise;
}
