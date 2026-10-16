import mongoose, { Schema, Model, models } from 'mongoose';

export const MASTER_TYPES = [
  'category',
  'species',
  'treatment',
  'roof_style',
  'home_type',
  'storage_provider'
] as const;

export type MasterType = (typeof MASTER_TYPES)[number];

// URL plural key -> stored `type` field (stamped server-side)
export const MASTER_URL_TO_TYPE: Record<string, MasterType> = {
  categories: 'category',
  species: 'species',
  treatments: 'treatment',
  roof_styles: 'roof_style',
  home_types: 'home_type',
  storage_providers: 'storage_provider'
};

export const MASTER_TYPE_TO_URL: Record<MasterType, string> = {
  category: 'categories',
  species: 'species',
  treatment: 'treatments',
  roof_style: 'roof_styles',
  home_type: 'home_types',
  storage_provider: 'storage_providers'
};

// Response grouping key for GET /api/masters
export const MASTER_TYPE_TO_GROUP: Record<MasterType, string> = {
  category: 'categories',
  species: 'species',
  treatment: 'treatments',
  roof_style: 'roofStyles',
  home_type: 'homeTypes',
  storage_provider: 'storageProviders'
};

const VariantSchema = new Schema(
  {
    id: { type: String, required: true },
    productId: String,
    sku: String,
    name: String,
    price: Number,
    originalPrice: Number,
    stock: { type: Number, default: 0 },
    attributes: { type: Schema.Types.Mixed, default: {} },
    image: String,
    isDefault: Boolean
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: String,
    slug: { type: String, index: true },
    categoryId: String,
    speciesId: String,
    treatmentId: String,
    price: Number,
    originalPrice: Number,
    rating: Number,
    reviewsCount: Number,
    stock: { type: Number, default: 0 },
    variants: { type: [VariantSchema], default: [] },
    isFeatured: Boolean,
    isCustomHome: Boolean,
    images: { type: [String], default: [] },
    description: String,
    dimensions: String,
    weight: String,
    ecoCertifications: [String],
    seoTitle: String,
    seoDescription: String,
    seoKeywords: [String]
  },
  { strict: false, timestamps: true }
);

const MasterSchema = new Schema(
  {
    id: { type: String, required: true },
    type: { type: String, required: true, enum: MASTER_TYPES, index: true },
    name: String,
    slug: String,
    description: String,
    icon: String,
    scientificName: String,
    tensileGrade: String,
    origin: String,
    methodType: String,
    lifespanYears: Number,
    priceMultiplier: Number,
    code: String,
    basePricePerSqFt: Number,
    isDefault: Boolean,
    status: String
  },
  { strict: false, timestamps: true }
);
MasterSchema.index({ type: 1, id: 1 }, { unique: true });

const OrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: String,
    customerEmail: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
    items: { type: [Schema.Types.Mixed], default: [] },
    subtotal: Number,
    shipping: Number,
    discount: Number,
    total: Number,
    paymentMethod: String,
    status: { type: String, default: 'pending' },
    createdAt: String
  },
  { strict: false }
);

const HomeQuoteSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    clientName: String,
    clientEmail: String,
    clientPhone: String,
    homeTypeId: String,
    homeTypeName: String,
    speciesId: String,
    speciesName: String,
    floorAreaSqFt: Number,
    stories: Number,
    roofStyleId: String,
    roofStyleName: String,
    offGridSolar: Boolean,
    interiorFinish: String,
    estimatedPrice: Number,
    notes: String,
    status: { type: String, default: 'quote_requested' },
    createdAt: String
  },
  { strict: false }
);

const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: String,
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
    createdAt: String
  },
  { strict: false }
);

// Generic key/value store for singleton configs: 'seo', 'storage'
const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const Product: Model<any> = models.Product || mongoose.model('Product', ProductSchema);
export const Master: Model<any> = models.Master || mongoose.model('Master', MasterSchema);
export const Order: Model<any> = models.Order || mongoose.model('Order', OrderSchema);
export const HomeQuote: Model<any> =
  models.HomeQuote || mongoose.model('HomeQuote', HomeQuoteSchema);
export const Setting: Model<any> = models.Setting || mongoose.model('Setting', SettingSchema);
export const User: Model<any> = models.User || mongoose.model('User', UserSchema);

/** Strip mongoose internals from lean docs */
export function clean<T = any>(doc: any): T {
  if (!doc) return doc;
  const { _id, __v, updatedAt: _u, ...rest } = doc;
  return rest as T;
}

export function cleanList<T = any>(docs: any[]): T[] {
  return docs.map((d) => clean<T>(d));
}
