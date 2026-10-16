/**
 * Bamboo E-Commerce & Homes Types - Full Next.js & Master Data System
 */

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  originalPrice?: number;
  stock: number;
  attributes: Record<string, string>; // e.g. { size: '2400 sq.ft', species: 'Petung', finish: 'Gloss' }
  image?: string;
  isDefault?: boolean;
}

export interface CategoryMaster {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface SpeciesMaster {
  id: string;
  name: string;
  scientificName: string;
  tensileGrade: string;
  origin: string;
  description: string;
}

export interface TreatmentMaster {
  id: string;
  name: string;
  methodType: string;
  lifespanYears: number;
  description: string;
}

export interface RoofStyleMaster {
  id: string;
  name: string;
  priceMultiplier: number;
  description: string;
}

export interface HomeTypeMaster {
  id: string;
  name: string;
  code: string;
  basePricePerSqFt: number;
  description: string;
}

export interface StorageProviderMaster {
  id: string;
  name: string;
  code: StorageProviderType;
  isDefault: boolean;
  status: 'active' | 'inactive';
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  speciesId?: string;
  speciesName?: string;
  treatmentId?: string;
  treatmentName?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  stock: number; // Aggregated stock of all variants
  variants: ProductVariant[]; // MANDATORY: Every product has variants!
  isFeatured?: boolean;
  isCustomHome?: boolean;
  images: string[];
  description: string;
  dimensions?: string;
  weight?: string;
  ecoCertifications?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface BambooHomeConfig {
  id?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  homeTypeId: string;
  homeTypeName?: string;
  speciesId: string;
  speciesName?: string;
  floorAreaSqFt: number;
  stories: number;
  roofStyleId: string;
  roofStyleName?: string;
  offGridSolar: boolean;
  interiorFinish: string;
  estimatedPrice: number;
  notes?: string;
  status?: 'quote_requested' | 'blueprint_drafted' | 'approved' | 'in_construction' | 'completed';
  createdAt?: string;
}

export type ProductCategory = string;

export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  selectedOption?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: 'credit_card' | 'stripe_mock' | 'crypto' | 'bamboo_installments';
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export type StorageProviderType = 'cloudinary' | 'aws' | 'minio' | 'mock';

export interface StorageConfig {
  activeProvider: StorageProviderType;
  awsBucket?: string;
  awsRegion?: string;
  cloudinaryCloudName?: string;
  minioEndpoint?: string;
  minioBucket?: string;
  uploadStats: {
    totalFiles: number;
    totalSizeBytes: number;
  };
}

export interface ReferenceCheckResult {
  canDelete: boolean;
  targetEntity: {
    type: string;
    id: string;
    name: string;
  };
  references: Array<{
    entityType: string;
    id: string;
    name: string;
    detail: string;
  }>;
  suggestedActions: string[];
  message: string;
}

export interface SeoConfig {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImageUrl: string;
  twitterHandle: string;
  canonicalUrl: string;
  jsonLdSchema: string;
}

export interface FormErrorEntry {
  formId: string;
  fieldName: string;
  errorType: string;
  errorMessage: string;
  timestamp: string;
}
