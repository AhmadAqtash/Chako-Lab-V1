import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[85vh] flex items-center">
      <Image
        src="/hero-banner.jpg"
        alt="Chako Lab drinkware"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-white/20" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 py-24 w-full">
        <div className="max-w-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/chako-lab-logo.png"
            alt="Chako Lab"
            style={{ height: '32px', width: 'auto', marginBottom: '16px' }}
          />
          <p className="text-chako-dark text-sm font-semibold tracking-widest uppercase mb-6">
            Chako Lab × UAE
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-chako-dark">
            Drink
            <br />
            <span className="text-chako-dark/70">beautifully.</span>
          </h1>
          <p className="text-chako-dark/60 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
            Thoughtfully designed drinkware for your morning ritual, afternoon focus, and evening wind-down.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-chako-dark text-chako-bg font-semibold rounded-2xl hover:bg-chako-dark/90 transition-colors text-sm"
            >
              Shop All Products
            </Link>
            <Link
              href="/collections/linlin-kettles"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-chako-dark/20 text-chako-dark font-semibold rounded-2xl hover:bg-chako-dark/10 transition-colors text-sm"
            >
              View Kettles
            </Link>
          </div>

          <div className="flex gap-8 mt-14">
            {[
              { number: '10+', label: 'Product lines' },
              { number: 'UAE', label: 'Based In' },
              { number: '100%', label: 'Quality assured' },
            ].map(({ number, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-chako-dark">{number}</p>
                <p className="text-xs text-chako-dark/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
