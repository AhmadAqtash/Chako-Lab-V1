const ITEMS = [
  '✦ LinLin Kettles',
  '✦ Kada Bottles',
  '✦ BoBo Tumblers',
  '✦ Bawang Cups',
  '✦ Baobao Food Cups',
  '✦ PangPang Cups',
  '✦ Pots',
  '✦ Mugs',
  '✦ Milk Pods',
  '✦ Square Cups',
];

export default function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="bg-chako-highlight py-3.5 overflow-hidden border-y border-[#F0C89E]">
      <div className="flex animate-marquee gap-6 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="text-chako-dark font-semibold text-sm tracking-wide flex-shrink-0">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
