import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MoneyV2 } from '@/types/shopify';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(money: MoneyV2): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPriceRange(min: MoneyV2, max: MoneyV2): string {
  if (min.amount === max.amount) return formatPrice(min);
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function getDiscountPercent(original: MoneyV2, sale: MoneyV2): number {
  const orig = parseFloat(original.amount);
  const sal = parseFloat(sale.amount);
  if (!orig || !sal || orig <= sal) return 0;
  return Math.round(((orig - sal) / orig) * 100);
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function extractBaseName(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function extractColorName(title: string): string | null {
  const match = title.match(/\(([^)]+)\)\s*$/);
  return match ? match[1] : null;
}
