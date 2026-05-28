'use client';

/*
  Button — Phase 1 primitive
  ────────────────────────────────────────────────────────
  Variants:
    solid-ink    — dark background, cream text   (primary CTA)
    solid-orange — orange accent, ink text       (highlighted CTA)
    outline      — transparent + ink border      (secondary)
    white        — cream/white bg, ink text      (on dark backgrounds)
    ghost        — no bg, no border, ink text    (tertiary / inline)

  Sizes:
    sm  → min-h-[40px]  px-4  py-2   text-xs
    md  → min-h-[48px]  px-6  py-3   text-sm   (default)
    lg  → min-h-[56px]  px-8  py-4   text-base

  Shape:
    pill  → rounded-full  (default, bold + playful)
    soft  → rounded-2xl   (slightly softer)
    sharp → rounded-lg

  All variants: bold General Sans, springy active:scale press,
  touch-manipulation for zero tap delay.
*/

import { cn } from '@/lib/utils';
import React from 'react';

type ButtonVariant = 'solid-ink' | 'solid-orange' | 'outline' | 'white' | 'ghost';
type ButtonSize    = 'sm' | 'md' | 'lg';
type ButtonShape   = 'pill' | 'soft' | 'sharp';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?:    ButtonSize;
  shape?:   ButtonShape;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  'solid-ink':    'bg-chako-ink text-chako-cream hover:bg-chako-ink/90',
  'solid-orange': 'bg-chako-orange text-chako-ink hover:bg-chako-orange/90',
  'outline':      'border-2 border-chako-ink text-chako-ink bg-transparent hover:bg-chako-ink/5',
  'white':        'bg-chako-cream text-chako-ink hover:bg-chako-cream/90',
  'ghost':        'bg-transparent text-chako-ink hover:bg-chako-ink/8',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm:  'min-h-[40px] px-4 py-2 text-xs',
  md:  'min-h-[48px] px-6 py-3 text-sm',
  lg:  'min-h-[56px] px-8 py-4 text-base',
};

const shapeClasses: Record<ButtonShape, string> = {
  pill:  'rounded-full',
  soft:  'rounded-2xl',
  sharp: 'rounded-lg',
};

export function Button({
  variant = 'solid-ink',
  size    = 'md',
  shape   = 'pill',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-sans font-semibold tracking-tight',
        'transition-all duration-150 touch-manipulation',
        'active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed',
        'select-none cursor-pointer',
        variantClasses[variant],
        sizeClasses[size],
        shapeClasses[shape],
        loading && 'cursor-wait',
        className
      )}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
      )}
      {children}
    </button>
  );
}

export default Button;
