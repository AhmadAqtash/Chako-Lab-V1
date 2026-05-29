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

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />
      <Marquee />
      <SeriesBanners />
      <HotCategories />
      <FeaturedProducts />
      <LifestyleGallery />
      <BrandValues />
      <ProductHotspot />
      <FAQ />
    </>
  );
}
