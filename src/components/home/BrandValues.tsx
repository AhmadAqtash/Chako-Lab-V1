const VALUES = [
  {
    icon: '◎',
    title: 'Thoughtful Design',
    description: 'Every curve, weight, and finish considered for the hand that holds it and the ritual it serves.',
  },
  {
    icon: '◈',
    title: 'Built to Last',
    description: 'Premium-grade materials that resist wear, retain temperature, and improve with use.',
  },
  {
    icon: '◇',
    title: 'Daily Joy',
    description: 'We believe the objects you use every day should bring you quiet, consistent delight.',
  },
  {
    icon: '◉',
    title: 'Ships to UAE',
    description: 'Priced in AED and shipped directly to your door across the UAE and GCC.',
  },
];

export default function BrandValues() {
  return (
    <section
      className="relative"
      style={{ backgroundImage: "url('/brand-banner.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-widest mb-2">Why Chako Lab</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Our Promise</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon, title, description }) => (
            <div
              key={title}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl text-white">{icon}</span>
              <h3 className="font-semibold text-base text-white">{title}</h3>
              <p className="text-sm text-white/70 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
