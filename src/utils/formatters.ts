import { currencyRates, currencySymbols, siteConfig } from '../config/site';

export function formatPrice(
  amount: number,
  currency: string = siteConfig.commerce.defaultCurrency,
  rates: Record<string, number> = currencyRates
): string {
  const rate = rates[currency] || 1;
  const converted = amount * rate;
  const symbol = currencySymbols[currency] || '$';

  if (converted >= 1000) {
    return `${symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
}

/** Compute a cart discount value from a configured coupon */
export function computeDiscount(
  subtotal: number,
  discountAmount: number,
  discountType: 'percentage' | 'fixed' | null
): number {
  if (!discountType || discountAmount <= 0) return 0;
  return discountType === 'percentage' ? (subtotal * discountAmount) / 100 : discountAmount;
}

/** Compute freight shipping from site config thresholds */
export function computeShipping(subtotal: number): number {
  if (subtotal === 0 || subtotal > siteConfig.commerce.freeShippingThreshold) return 0;
  return siteConfig.commerce.shippingCost;
}

export function getCategoryLabel(category: string): string {
  switch (category) {
    case 'homes':
      return 'Bamboo Homes & Prefabs';
    case 'furniture':
      return 'Eco Bamboo Furniture';
    case 'flooring_beams':
      return 'Flooring & Beams';
    case 'decor_kitchen':
      return 'Kitchenware & Decor';
    case 'garden_outdoor':
      return 'Garden & Fencing';
    default:
      return 'All Bamboo Products';
  }
}
