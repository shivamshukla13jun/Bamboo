import {
  CategoryMaster,
  SpeciesMaster,
  TreatmentMaster,
  RoofStyleMaster,
  HomeTypeMaster,
  StorageProviderMaster,
  Product,
  BambooHomeConfig,
  Order,
  SeoConfig
} from '../types';
import { MasterType } from './models';

export const INITIAL_CATEGORIES: CategoryMaster[] = [
  { id: 'cat-homes', name: 'Bamboo Homes & Prefabs', slug: 'homes', description: 'Custom architectural bamboo villas, prefab cabins, and eco suites.', icon: '🏡' },
  { id: 'cat-flooring', name: 'Flooring & Beams', slug: 'flooring_beams', description: 'Strand-woven bamboo planks, heavy structural poles, and rafters.', icon: '🪵' },
  { id: 'cat-furniture', name: 'Furniture & Living', slug: 'furniture', description: 'Solid bamboo dining sets, bed frames, lounge chairs, and desks.', icon: '🪑' },
  { id: 'cat-kitchen', name: 'Kitchen & Decor', slug: 'decor_kitchen', description: 'Food-safe bamboo kitchenware, woven pendant lamps, and utensils.', icon: '🍽️' },
  { id: 'cat-garden', name: 'Garden & Outdoor', slug: 'garden_outdoor', description: 'Weatherproof privacy fencing panels, gazebos, and landscape poles.', icon: '🌿' }
];

export const INITIAL_SPECIES: SpeciesMaster[] = [
  { id: 'spec-petung', name: 'Giant Petung Bamboo', scientificName: 'Dendrocalamus asper', tensileGrade: 'Grade A+ (300 MPa)', origin: 'Indonesia / Bali', description: 'The largest and strongest structural bamboo on earth. Ideal for multi-story load-bearing villa posts.' },
  { id: 'spec-guadua', name: 'Iron Guadua Bamboo', scientificName: 'Guadua angustifolia', tensileGrade: 'Grade A (250 MPa)', origin: 'Colombia / S. America', description: 'Extremely thick-walled structural bamboo renowned for high seismic resilience.' },
  { id: 'spec-moso', name: 'Moso Fiber Bamboo', scientificName: 'Phyllostachys edulis', tensileGrade: 'Grade B+ (180 MPa)', origin: 'East Asia', description: 'High-density fiber bamboo perfect for strand-woven flooring, furniture, and kitchenware.' },
  { id: 'spec-black', name: 'Timor Black Bamboo', scientificName: 'Bambusa Lako', tensileGrade: 'Grade B (160 MPa)', origin: 'Timor Islands', description: 'Naturally chocolate-black ornamental and architectural accent bamboo.' }
];

export const INITIAL_TREATMENTS: TreatmentMaster[] = [
  { id: 'treat-boron', name: 'Borax Vacuum Pressure Bath', methodType: 'Dip & Pressure Immersion', lifespanYears: 50, description: 'Natural Boron salt solution penetrates 100% of bamboo pores, permanently preventing insect infestation.' },
  { id: 'treat-kiln', name: 'Smokeless Thermal Carbonization', methodType: 'High Heat Kiln Seasoned', lifespanYears: 40, description: 'Caramelizes natural sugars in bamboo fiber to enhance moisture resistance and rich deep coloration.' },
  { id: 'treat-beeswax', name: 'Food-Safe Organic Beeswax Polish', methodType: 'Hand Rubbed Botanical Polish', lifespanYears: 15, description: 'Non-toxic FDA compliant finish preserving natural grain for kitchenware and dining tables.' }
];

export const INITIAL_ROOF_STYLES: RoofStyleMaster[] = [
  { id: 'roof-hyperbolic', name: 'Hyperbolic Paraboloid Shell', priceMultiplier: 1.25, description: 'Sweeping double-curved bamboo roof structure providing extreme wind resistance and iconic aesthetic.' },
  { id: 'roof-thatch', name: 'Natural Balinese Thatch (Alang-Alang)', priceMultiplier: 1.0, description: 'Traditional tropical thatch over woven bamboo sub-layer for high thermal insulation.' },
  { id: 'roof-shingle', name: 'Integrated Bamboo Solar Shingles', priceMultiplier: 1.35, description: 'Carbonized bamboo tile array embedded with off-grid photovoltaic micro-cells.' },
  { id: 'roof-tile', name: 'Strand Carbonized Bamboo Tiles', priceMultiplier: 1.15, description: 'Precision interlocking bamboo tiles sealed against heavy rainfall.' }
];

export const INITIAL_HOME_TYPES: HomeTypeMaster[] = [
  { id: 'ht-villa', name: 'Aura Eco-Villa Mansion', code: 'eco_villa', basePricePerSqFt: 48.0, description: 'Multi-story open-air luxury bamboo villa architecture.' },
  { id: 'ht-cabin', name: 'Zenith Modular Prefab Cabin', code: 'prefab_cabin', basePricePerSqFt: 38.0, description: 'Rapid assembly modular kit home or guest house.' },
  { id: 'ht-treehouse', name: 'Canopy Elevated Treehouse Suite', code: 'treehouse_suite', basePricePerSqFt: 55.0, description: 'Suspended bamboo treehouse with panoramic deck.' },
  { id: 'ht-studio', name: 'Bamboo Gazebo Work Studio', code: 'gazebo_studio', basePricePerSqFt: 32.0, description: 'Compact backyard pavilion or creative sanctuary.' }
];

// Storage providers are managed via the STORAGE_PROVIDER env var and are
// intentionally not seeded/exposed as master data in the app.
export const INITIAL_STORAGE_PROVIDERS: StorageProviderMaster[] = [];

export function initialMasters(): Array<Record<string, any> & { type: MasterType }> {
  return [
    ...INITIAL_CATEGORIES.map((m) => ({ ...m, type: 'category' as const })),
    ...INITIAL_SPECIES.map((m) => ({ ...m, type: 'species' as const })),
    ...INITIAL_TREATMENTS.map((m) => ({ ...m, type: 'treatment' as const })),
    ...INITIAL_ROOF_STYLES.map((m) => ({ ...m, type: 'roof_style' as const })),
    ...INITIAL_HOME_TYPES.map((m) => ({ ...m, type: 'home_type' as const })),
    ...INITIAL_STORAGE_PROVIDERS.map((m) => ({ ...m, type: 'storage_provider' as const }))
  ];
}

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aura Eco-Villa Structural Bamboo Home',
    slug: 'aura-eco-villa-bamboo-home',
    categoryId: 'cat-homes',
    speciesId: 'spec-petung',
    treatmentId: 'treat-boron',
    price: 115000,
    originalPrice: 130000,
    rating: 4.95,
    reviewsCount: 38,
    stock: 8,
    isFeatured: true,
    isCustomHome: true,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Ultra-luxurious 3-bedroom curved bamboo eco-mansion constructed with Grade-A Petung Structural Bamboo poles.',
    dimensions: '2,400 sq. ft (2 Levels)',
    variants: [
      { id: 'var-101', productId: 'prod-1', sku: 'AURA-2400-PET', name: '2,400 sq.ft / Petung Giant Culm', price: 115000, originalPrice: 130000, stock: 5, attributes: { size: '2,400 sq.ft', species: 'Petung', solar: 'Standard Grid' }, isDefault: true },
      { id: 'var-102', productId: 'prod-1', sku: 'AURA-3200-SOLAR', name: '3,200 sq.ft / Off-Grid Solar Package', price: 142000, originalPrice: 160000, stock: 3, attributes: { size: '3,200 sq.ft', species: 'Petung', solar: '10kW Off-Grid' }, isDefault: false }
    ],
    seoTitle: 'Aura Eco-Villa Bamboo Home - Luxury Sustainable Prefab Living',
    seoDescription: 'Discover the Aura Eco-Villa bamboo home. Crafted from structural Petung bamboo.',
    seoKeywords: ['bamboo home', 'eco villa', 'bamboo architecture']
  },
  {
    id: 'prod-2',
    name: 'Zenith Prefab Modular Bamboo Cabin',
    slug: 'zenith-prefab-bamboo-cabin',
    categoryId: 'cat-homes',
    speciesId: 'spec-guadua',
    treatmentId: 'treat-kiln',
    price: 28500,
    originalPrice: 32000,
    rating: 4.88,
    reviewsCount: 64,
    stock: 18,
    isFeatured: true,
    isCustomHome: true,
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Minimalist guest cabin or studio office built with Guadua bamboo columns and insulated bamboo ply walls.',
    dimensions: '450 sq. ft',
    variants: [
      { id: 'var-201', productId: 'prod-2', sku: 'ZEN-450-STD', name: '450 sq.ft / Single Floor Studio', price: 28500, originalPrice: 32000, stock: 12, attributes: { size: '450 sq.ft', layout: 'Studio Loft' }, isDefault: true },
      { id: 'var-202', productId: 'prod-2', sku: 'ZEN-600-SUITE', name: '600 sq.ft / 1-Bed Guest Suite', price: 36000, originalPrice: 41000, stock: 6, attributes: { size: '600 sq.ft', layout: '1-Bedroom Suite' }, isDefault: false }
    ],
    seoTitle: 'Zenith Prefab Bamboo Cabin - Modern Eco Studio',
    seoDescription: 'Modular 450 sq ft prefab bamboo cabin kit for guest suite or office.',
    seoKeywords: ['bamboo cabin', 'tiny home bamboo']
  },
  {
    id: 'prod-3',
    name: 'Dendro Heavy Load Structural Bamboo Beams',
    slug: 'dendro-structural-bamboo-beams',
    categoryId: 'cat-flooring',
    speciesId: 'spec-petung',
    treatmentId: 'treat-boron',
    price: 680,
    originalPrice: 750,
    rating: 4.9,
    reviewsCount: 112,
    stock: 65,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'High-tensile structural load-bearing bamboo beams engineered for column posts, roof rafters, and deck supports.',
    dimensions: '12ft or 16ft Length',
    variants: [
      { id: 'var-301', productId: 'prod-3', sku: 'BEAM-12FT-PK6', name: '12 ft Length (Pack of 6 Beams)', price: 680, originalPrice: 750, stock: 45, attributes: { length: '12 ft', diameter: '4.5 in', pack: '6 Beams' }, isDefault: true },
      { id: 'var-302', productId: 'prod-3', sku: 'BEAM-16FT-PK6', name: '16 ft Length Heavy Beam (Pack of 6)', price: 890, originalPrice: 980, stock: 20, attributes: { length: '16 ft', diameter: '5.5 in', pack: '6 Beams' }, isDefault: false }
    ],
    seoTitle: 'Dendro Heavy Load Structural Bamboo Beams',
    seoDescription: 'Engineered structural load-bearing bamboo beams.',
    seoKeywords: ['bamboo beams', 'structural posts']
  },
  {
    id: 'prod-4',
    name: 'Stranded Woven Solid Bamboo Flooring Planks',
    slug: 'stranded-woven-bamboo-flooring',
    categoryId: 'cat-flooring',
    speciesId: 'spec-moso',
    treatmentId: 'treat-kiln',
    price: 490,
    originalPrice: 560,
    rating: 4.82,
    reviewsCount: 89,
    stock: 190,
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Industrial-grade strand woven bamboo floor planks with Janka hardness rating of 3,500 (3x harder than Red Oak).',
    dimensions: '100 sq ft pack',
    variants: [
      { id: 'var-401', productId: 'prod-4', sku: 'FLR-100-NAT', name: 'Natural Honey Amber (100 sq.ft Box)', price: 490, originalPrice: 560, stock: 120, attributes: { finish: 'Natural Amber', coverage: '100 sq.ft' }, isDefault: true },
      { id: 'var-402', productId: 'prod-4', sku: 'FLR-100-CARB', name: 'Dark Espresso Carbonized (100 sq.ft Box)', price: 530, originalPrice: 610, stock: 70, attributes: { finish: 'Espresso Carbonized', coverage: '100 sq.ft' }, isDefault: false }
    ],
    seoTitle: 'Strand Woven Bamboo Flooring Pack 100 sq ft',
    seoDescription: 'High density carbonized strand woven bamboo flooring plank sets.',
    seoKeywords: ['bamboo flooring', 'strand woven floor']
  },
  {
    id: 'prod-5',
    name: 'Artisan Solid Bamboo Dining Table Set',
    slug: 'artisan-bamboo-dining-table-set',
    categoryId: 'cat-furniture',
    speciesId: 'spec-moso',
    treatmentId: 'treat-beeswax',
    price: 1450,
    originalPrice: 1650,
    rating: 4.93,
    reviewsCount: 42,
    stock: 28,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Handcrafted solid bamboo dining table paired with ergonomically curved bamboo chairs.',
    dimensions: '78" L x 38" W',
    variants: [
      { id: 'var-501', productId: 'prod-5', sku: 'TBL-6CHAIR-NAT', name: '6-Seater Table + 6 Chairs (Natural Satin)', price: 1450, originalPrice: 1650, stock: 18, attributes: { capacity: '6-Seater', finish: 'Natural Satin' }, isDefault: true },
      { id: 'var-502', productId: 'prod-5', sku: 'TBL-8CHAIR-CARB', name: '8-Seater Table + 8 Chairs (Dark Carbon)', price: 1890, originalPrice: 2150, stock: 10, attributes: { capacity: '8-Seater', finish: 'Dark Carbonized' }, isDefault: false }
    ],
    seoTitle: 'Artisan Solid Bamboo Dining Table Set',
    seoDescription: 'Handcrafted sustainable solid bamboo dining table set.',
    seoKeywords: ['bamboo furniture', 'bamboo dining table']
  },
  {
    id: 'prod-6',
    name: 'Eco-Living Organic Bamboo Kitchenware Starter Set',
    slug: 'bamboo-kitchenware-starter-set',
    categoryId: 'cat-kitchen',
    speciesId: 'spec-moso',
    treatmentId: 'treat-beeswax',
    price: 45,
    originalPrice: 60,
    rating: 4.78,
    reviewsCount: 310,
    stock: 370,
    images: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Everyday eco-friendly kitchen essentials including cutting boards, salad bowls, and utensils.',
    variants: [
      { id: 'var-601', productId: 'prod-6', sku: 'KIT-18PCS-STD', name: '18-Piece Essential Utensil & Bowl Set', price: 45, originalPrice: 60, stock: 250, attributes: { pcs: '18 Pcs', packaging: 'Eco Gift Box' }, isDefault: true },
      { id: 'var-602', productId: 'prod-6', sku: 'KIT-32PCS-CHEF', name: '32-Piece Deluxe Chef & Serving Set', price: 78, originalPrice: 95, stock: 120, attributes: { pcs: '32 Pcs', packaging: 'Deluxe Wooden Crate' }, isDefault: false }
    ],
    seoTitle: '18-Piece Organic Bamboo Kitchenware Set',
    seoDescription: 'Complete non-toxic food safe organic bamboo kitchenware kit.',
    seoKeywords: ['bamboo kitchenware', 'eco utensils']
  },
  {
    id: 'prod-7',
    name: 'Sustainable Bamboo Fiber Cutlery Pack',
    slug: 'bamboo-fiber-cutlery-pack',
    categoryId: 'cat-kitchen',
    speciesId: 'spec-moso',
    treatmentId: 'treat-beeswax',
    price: 18,
    originalPrice: 25,
    rating: 4.91,
    reviewsCount: 520,
    stock: 1100,
    images: [
      'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=80'
    ],
    description: '100% compostable bamboo fiber forks, spoons, knives, and drinking straws.',
    variants: [
      { id: 'var-701', productId: 'prod-7', sku: 'CUT-100PK', name: '100-Pack Compostable Cutlery + Straws', price: 18, originalPrice: 25, stock: 600, attributes: { packSize: '100 Pack' }, isDefault: true },
      { id: 'var-702', productId: 'prod-7', sku: 'CUT-300PK-BULK', name: '300-Pack Catering Bulk Box', price: 42, originalPrice: 58, stock: 500, attributes: { packSize: '300 Pack Bulk' }, isDefault: false }
    ],
    seoTitle: 'Compostable Bamboo Cutlery & Straws Set',
    seoDescription: 'Eco-friendly biodegradable bamboo fiber cutlery set.',
    seoKeywords: ['bamboo cutlery', 'bamboo straws']
  },
  {
    id: 'prod-8',
    name: 'Timor Black Bamboo Privacy Fence Panel',
    slug: 'timor-black-bamboo-fence-panel',
    categoryId: 'cat-garden',
    speciesId: 'spec-black',
    treatmentId: 'treat-boron',
    price: 240,
    originalPrice: 290,
    rating: 4.7,
    reviewsCount: 76,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Weatherproof ornamental black bamboo privacy fencing panel for gardens and patios.',
    dimensions: '6ft H x 8ft W',
    variants: [
      { id: 'var-801', productId: 'prod-8', sku: 'FENCE-6X8-BLK', name: '6x8 ft Black Bamboo Panel', price: 240, originalPrice: 290, stock: 30, attributes: { size: '6ft x 8ft', finish: 'Natural Black' }, isDefault: true },
      { id: 'var-802', productId: 'prod-8', sku: 'FENCE-4X8-BLK', name: '4x8 ft Black Bamboo Panel', price: 185, originalPrice: 220, stock: 15, attributes: { size: '4ft x 8ft', finish: 'Natural Black' }, isDefault: false }
    ],
    seoTitle: 'Timor Black Bamboo Privacy Fence Panel',
    seoDescription: 'Weatherproof black bamboo fencing for eco gardens.',
    seoKeywords: ['bamboo fence', 'garden privacy']
  }
];

export const DEFAULT_SEO_CONFIG: SeoConfig = {
  siteTitle: 'Bamboorise - Sustainable Bamboo Homes & Eco-Living Platform',
  siteDescription: 'Discover luxury custom bamboo homes, modular prefab eco-cabins, structural bamboo beams, strand woven flooring, and eco-friendly products at all price points.',
  keywords: 'bamboo home, bamboo house price, prefab bamboo cabin, bamboo flooring, eco friendly home, sustainable architecture, bamboo furniture',
  ogImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  twitterHandle: '@bamboorise_homes',
  canonicalUrl: 'https://bamboorise.ai.studio',
  jsonLdSchema: JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'Bamboorise',
      description: 'Shopify-style e-commerce & bamboo eco-home customizer',
      url: 'https://bamboorise.ai.studio',
      priceRange: '$ - $$$$$'
    },
    null,
    2
  )
};

export const INITIAL_QUOTES: BambooHomeConfig[] = [
  {
    id: 'quote-101',
    clientName: 'Sarah Jenkins',
    clientEmail: 'sarah@example.com',
    clientPhone: '+1 (555) 234-5678',
    homeTypeId: 'ht-villa',
    homeTypeName: 'Aura Eco-Villa Mansion',
    speciesId: 'spec-petung',
    speciesName: 'Giant Petung Bamboo',
    floorAreaSqFt: 1800,
    stories: 2,
    roofStyleId: 'roof-hyperbolic',
    roofStyleName: 'Hyperbolic Paraboloid Shell',
    offGridSolar: true,
    interiorFinish: 'luxury_teak_bamboo',
    estimatedPrice: 94500,
    notes: 'Looking to build on a coastal slope property in Northern California.',
    status: 'quote_requested',
    createdAt: new Date().toISOString()
  }
];

export function initialOrders(): Order[] {
  return [
    {
      id: 'ord-8801',
      customerName: 'Marcus Vance',
      customerEmail: 'marcus.v@example.com',
      address: '742 Bamboo Ridge Trail',
      city: 'Austin',
      postalCode: '78701',
      country: 'United States',
      items: [
        { product: INITIAL_PRODUCTS[2], variant: INITIAL_PRODUCTS[2].variants[0], quantity: 2 },
        { product: INITIAL_PRODUCTS[3], variant: INITIAL_PRODUCTS[3].variants[0], quantity: 3 }
      ],
      subtotal: 2830,
      shipping: 150,
      discount: 100,
      total: 2880,
      paymentMethod: 'credit_card',
      status: 'processing',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];
}
