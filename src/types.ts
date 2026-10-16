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

export enum StorageProvider {
  Cloudinary = 'cloudinary',
  Aws = 'aws',
  Mock = 'mock'
}

export enum EntityStatus {
  Active = 'active',
  Inactive = 'inactive'
}

export interface StorageProviderMaster {
  id: string;
  name: string;
  code: StorageProvider;
  isDefault: boolean;
  status: EntityStatus;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
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

export interface QuoteStatusEvent {
  status: QuoteStatus;
  changedAt: string;
  note?: string;
}

export interface HomeQuote {
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
  status?: QuoteStatus;
  statusHistory?: QuoteStatusEvent[];
  /** When the engagement/build started */
  startDate?: string;
  /** Planned duration of the engagement */
  estimatedDurationWeeks?: number;
  /** Auto-derived: startDate + estimatedDurationWeeks (or manually set) */
  estimatedCompletionDate?: string;
  /** Actual completion timestamp */
  completedAt?: string;
  /** Negotiated final price (vs estimatedPrice) */
  finalPrice?: number;
  /** Internal admin notes on the quote/project */
  adminNotes?: string;
  createdAt?: string;
}

export enum QuoteStatus {
  QuoteRequested = 'quote_requested',
  BlueprintDrafted = 'blueprint_drafted',
  Approved = 'approved',
  InConstruction = 'in_construction',
  OnHold = 'on_hold',
  Completed = 'completed',
  Cancelled = 'cancelled'
}

export type ProductCategory = string;

export enum AdminTab {
  Dashboard = 'dashboard',
  Products = 'products',
  Inventory = 'inventory',
  Masters = 'masters',
  Homes = 'homes',
  Seo = 'seo',
  Storage = 'storage',
  Orders = 'orders',
  ReduxConsole = 'redux_console'
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info'
}

export enum SortBy {
  Featured = 'featured',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
  Rating = 'rating'
}

export enum PricePreset {
  All = 'all',
  Under25 = 'under_25',
  Mid25to200 = '25_200',
  Mid200to2000 = '200_2000',
  High2000to25000 = '2000_25000',
  Premium25000Plus = '25000_plus'
}

export enum StockFilter {
  All = 'all',
  Low = 'low',
  Out = 'out'
}

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
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export enum PaymentMethod {
  CreditCard = 'credit_card',
  StripeMock = 'stripe_mock',
  Crypto = 'crypto',
  Installments = 'installments'
}

export enum OrderStatus {
  Pending = 'pending',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered'
}

export enum CouponType {
  Percentage = 'percentage',
  Fixed = 'fixed'
}

export enum MasterEntityType {
  Category = 'category',
  Species = 'species',
  Treatment = 'treatment',
  RoofStyle = 'roof_style',
  HomeType = 'home_type',
  StorageProvider = 'storage_provider'
}

export interface StorageConfig {
  activeProvider: StorageProvider;
  awsBucket?: string;
  awsRegion?: string;
  cloudinaryCloudName?: string;
  uploadStats: {
    totalFiles: number;
    totalSizeBytes: number;
  };
}

/** Public shape of /api/storage — provider internals are never exposed to the app */
export interface StoragePublicConfig {
  uploadStats: {
    totalFiles: number;
    totalSizeBytes: number;
  };
}

export enum UserRole {
  Admin = 'admin',
  Customer = 'customer'
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
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
