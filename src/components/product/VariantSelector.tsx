'use client';

import { ProductVariant } from '@/types/shopify';
import { cn } from '@/lib/utils';

interface Props {
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  selected: Record<string, string>;
  onChange: (option: string, value: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  black: '#1a1a1a',
  white: '#f5f5f5',
  gray: '#9ca3af',
  grey: '#9ca3af',
  silver: '#c0c0c0',
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  pink: '#ec4899',
  yellow: '#eab308',
  orange: '#f97316',
  purple: '#a855f7',
  teal: '#14b8a6',
  cream: '#f5f0e8',
  beige: '#d4b896',
  brown: '#92400e',
  rose: '#f43f5e',
  mint: '#86efac',
  sage: '#84cc16',
};

function isColorOption(name: string) {
  return name.toLowerCase().includes('color') || name.toLowerCase().includes('colour');
}

function getColorValue(value: string): string | null {
  const lower = value.toLowerCase().replace(/\s+/g, '');
  return COLOR_MAP[lower] || null;
}

export default function VariantSelector({ options, variants, selected, onChange }: Props) {
  function isAvailable(optionName: string, value: string): boolean {
    const testSelection = { ...selected, [optionName]: value };
    return variants.some((v) => {
      const matches = Object.entries(testSelection).every(([name, val]) =>
        v.selectedOptions.some((o) => o.name === name && o.value === val)
      );
      return matches && v.availableForSale;
    });
  }

  return (
    <div className="space-y-4">
      {options.map((option) => {
        const isColor = isColorOption(option.name);
        return (
          <div key={option.name}>
            <p className="text-sm font-semibold mb-2.5">
              {option.name}
              {selected[option.name] && (
                <span className="font-normal text-chako-ink/50 ml-2">{selected[option.name]}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const available = isAvailable(option.name, value);
                const active = selected[option.name] === value;
                const colorHex = isColor ? getColorValue(value) : null;

                if (isColor && colorHex) {
                  return (
                    <button
                      key={value}
                      onClick={() => onChange(option.name, value)}
                      disabled={!available}
                      title={value}
                      className={cn(
                        'w-11 h-11 rounded-full border-2 transition-all relative touch-manipulation active:scale-95',
                        active ? 'border-chako-ink scale-105' : 'border-transparent hover:border-black/20',
                        !available && 'opacity-30 cursor-not-allowed'
                      )}
                      style={{ backgroundColor: colorHex }}
                    >
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <line x1="4" y1="4" x2="20" y2="20" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    onClick={() => onChange(option.name, value)}
                    disabled={!available}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-sm font-medium border transition-all min-h-[44px] touch-manipulation active:scale-95',
                      active
                        ? 'bg-chako-ink text-chako-cream border-chako-ink'
                        : 'border-black/10 hover:border-black/25 text-chako-ink',
                      !available && 'opacity-30 cursor-not-allowed line-through'
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
