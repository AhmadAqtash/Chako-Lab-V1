export const revalidate = 60;

import Hero from '@/components/home/Hero';
import CategoryBar from '@/components/home/CategoryBar';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import Marquee from '@/components/home/Marquee';
import BrandValues from '@/components/home/BrandValues';
import FAQ from '@/components/home/FAQ';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryBar />
      <Marquee />
      <FeaturedProducts />
      <BrandValues />
      <FAQ />
    </>
  );
}
