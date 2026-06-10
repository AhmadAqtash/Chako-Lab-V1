export const revalidate = 60;

import HeroSlideshow from '@/components/home/HeroSlideshow';
import Marquee from '@/components/home/Marquee';
import SeriesBanners from '@/components/home/SeriesBanners';
import HotCategories from '@/components/home/HotCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LifestyleGallery from '@/components/home/LifestyleGallery';
import BrandValues from '@/components/home/BrandValues';
import ProductHotspot from '@/components/home/ProductHotspot';
import FAQ from '@/components/home/FAQ';
import type { Locale } from '@/lib/locale';
import { localeAlternates } from '@/lib/seo';
import type { Metadata } from 'next';

export function generateMetadata({ params }: { params: { locale: Locale } }): Metadata {
  return { alternates: localeAlternates(params.locale) };
}

export default function HomePage({ params }: { params: { locale: Locale } }) {
  return (
    <>
      <HeroSlideshow />
      <Marquee />
      <SeriesBanners />
      <HotCategories />
      <FeaturedProducts locale={params.locale} />
      <LifestyleGallery />
      <BrandValues />
      <ProductHotspot />
      <FAQ />
    </>
  );
}
