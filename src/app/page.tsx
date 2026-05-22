export const revalidate = 60;

import HeroSlideshow from '@/components/home/HeroSlideshow';
import SeriesBanners from '@/components/home/SeriesBanners';
import HotCategories from '@/components/home/HotCategories';
import BrandVideo from '@/components/home/BrandVideo';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryBar from '@/components/home/CategoryBar';
import Marquee from '@/components/home/Marquee';
import BrandValues from '@/components/home/BrandValues';
import ProductHotspot from '@/components/home/ProductHotspot';
import FAQ from '@/components/home/FAQ';

export default function HomePage() {
  return (
    <>
      <HeroSlideshow />
      <SeriesBanners />
      <HotCategories />
      <BrandVideo />
      <FeaturedProducts />
      <CategoryBar />
      <Marquee />
      <BrandValues />
      <ProductHotspot />
      <FAQ />
    </>
  );
}
