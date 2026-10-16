export function formatPrice(amount: number, currency: 'USD' | 'EUR' | 'GBP' | 'AUD' = 'USD', rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.78, AUD: 1.52 }): string {
  const rate = rates[currency] || 1;
  const converted = amount * rate;

  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    AUD: 'A$'
  };

  const symbol = symbolMap[currency] || '$';

  if (converted >= 1000) {
    return `${symbol}${converted.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }
  return `${symbol}${converted.toFixed(2)}`;
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
