import { currencyRates, currencySymbols, siteConfig } from '../config/site';
import { CouponType } from '../types';

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
  discountType: CouponType | null
): number {
  if (!discountType || discountAmount <= 0) return 0;
  return discountType === CouponType.Percentage
    ? (subtotal * discountAmount) / 100
    : discountAmount;
}

/** Compute freight shipping from site config thresholds */
export function computeShipping(subtotal: number): number {
  if (subtotal === 0 || subtotal > siteConfig.commerce.freeShippingThreshold) return 0;
  return siteConfig.commerce.shippingCost;
}

