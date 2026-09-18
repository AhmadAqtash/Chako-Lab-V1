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

/**
 * formatPrice ROUNDS to whole dirhams, which is right for catalogue prices
 * (all whole today) but wrong next to the free-shipping bar: a AED 249.60
 * subtotal would print "AED 250" beside a bar that still says locked. Use this
 * for cart totals — no decimals when whole, two when not.
 */
export function formatPriceExact(money: MoneyV2): string {
  const amount = parseFloat(money.amount);
  const whole = Math.abs(amount - Math.round(amount)) < 0.005;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
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
