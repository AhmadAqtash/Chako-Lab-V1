'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ShopifyImage } from '@/types/shopify';
import { cn } from '@/lib/utils';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  images: ShopifyImage[];
  title: string;
}

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => { setActive((i) => (i - 1 + images.length) % images.length); setZoomed(false); }, [images.length]);
  const next = useCallback(() => { setActive((i) => (i + 1) % images.length); setZoomed(false); }, [images.length]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current || !zoomed) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [zoomed]);

  // Swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (!images.length) {
    return <div className="aspect-square bg-chako-accent rounded-3xl" />;
  }

  const activeImage = images[active];
  const isWide = activeImage.width > 0 && activeImage.height > 0 && activeImage.width / activeImage.height > 1.1;

  return (
    <>
      <div className="flex flex-col-reverse md:flex-row gap-3">
        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[560px] scrollbar-hide scroll-momentum md:w-[72px] flex-shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={cn(
                  'flex-shrink-0 relative w-16 h-16 md:w-full md:h-[72px] rounded-xl overflow-hidden border-2 transition-all touch-manipulation active:scale-95',
                  i === active
                    ? 'border-chako-dark shadow-sm'
                    : 'border-transparent opacity-60 hover:opacity-100 hover:border-black/15'
                )}
              >
                <Image
                  src={img.url}
                  alt={img.altText || `${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 relative">
          <div
            ref={imgRef}
            className={cn(
              'relative aspect-[4/5] md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-chako-accent select-none',
              zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            )}
            onClick={() => setZoomed(!zoomed)}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomed(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={activeImage.url}
              alt={activeImage.altText || title}
              fill
              priority
              quality={90}
              className={cn(
                isWide ? 'object-contain' : 'object-cover',
                'transition-transform duration-200',
                zoomed ? 'scale-[2]' : 'scale-100'
              )}
              style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
              sizes="(max-width: 768px) 100vw, 50vw"
              draggable={false}
            />

            {!zoomed && (
              <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full text-chako-dark/50 hover:text-chako-dark transition-colors pointer-events-none">
                <ZoomIn size={14} />
              </button>
            )}

            {/* Prev/next arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur-sm w-11 h-11 rounded-full shadow-sm hover:bg-white active:scale-95 transition-[transform,background-color] duration-150 flex items-center justify-center touch-manipulation"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 backdrop-blur-sm w-11 h-11 rounded-full shadow-sm hover:bg-white active:scale-95 transition-[transform,background-color] duration-150 flex items-center justify-center touch-manipulation"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="flex justify-center gap-0 mt-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="p-2.5 touch-manipulation"
                  aria-label={`Image ${i + 1}`}
                >
                  <span className={cn(
                    'block rounded-full transition-all duration-300',
                    i === active ? 'bg-chako-dark w-5 h-2' : 'bg-black/20 w-2 h-2'
                  )} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
