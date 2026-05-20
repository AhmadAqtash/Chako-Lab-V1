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
    <section className="bg-chako-accent">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-chako-dark/40 uppercase tracking-widest mb-2">Why Chako Lab</p>
          <h2 className="text-2xl md:text-3xl font-bold">Our Promise</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon, title, description }) => (
            <div
              key={title}
              className="bg-chako-bg rounded-2xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl">{icon}</span>
              <h3 className="font-semibold text-base">{title}</h3>
              <p className="text-sm text-chako-dark/55 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
