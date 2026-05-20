import { Product } from '@/types/shopify';

const VENDOR = 'Chako Lab';

// Palette per product type — used in placeholder image backgrounds
const TYPE_COLOR: Record<string, string> = {
  'LinLin Kettle': 'c9b99a/ffffff',
  'Kada Bottle':   'a8c5be/ffffff',
  'Thermos Cup':   '8faac3/ffffff',
  'Bawang Cup':    'd4a5a5/ffffff',
  'Pot':           'b5b09a/ffffff',
  'Coffee Mug':    'c4a882/ffffff',
  'Milk Pod':      'c8d8c8/ffffff',
  'Food Cup':      'e8c9a0/ffffff',
  'PangPang Cup':  'b8c4cc/ffffff',
  'Square Cup':    'c5bdd4/ffffff',
};

function img(productType: string, label: string): string {
  const palette = TYPE_COLOR[productType] ?? 'e0e0e0/666666';
  const text = encodeURIComponent(label);
  return `https://placehold.co/800x800/${palette}?text=${text}`;
}

function makeProduct(
  num: number,
  productType: string,
  title: string,
  handle: string,
  price: string,
  compareAt: string | null,
  options: { name: string; values: string[] }[],
  description: string,
  extraImages?: string[]
): Product {
  const firstOpt = options[0];
  const secondOpt = options[1];

  const variants = firstOpt.values.flatMap((v1) => {
    if (secondOpt) {
      return secondOpt.values.map((v2, j) => ({
        id: `gid://shopify/ProductVariant/${num}${firstOpt.values.indexOf(v1)}${j}`,
        title: `${v1} / ${v2}`,
        availableForSale: !(num % 7 === 0 && j === 0),
        quantityAvailable: num % 7 === 0 && j === 0 ? 0 : ((num * 7 + j) % 8) + 2,
        price: { amount: price, currencyCode: 'AED' },
        compareAtPrice: compareAt ? { amount: compareAt, currencyCode: 'AED' } : null,
        selectedOptions: [
          { name: firstOpt.name, value: v1 },
          { name: secondOpt.name, value: v2 },
        ],
      }));
    }
    return [{
      id: `gid://shopify/ProductVariant/${num}${firstOpt.values.indexOf(v1)}`,
      title: v1,
      availableForSale: true,
      quantityAvailable: ((num * 3 + firstOpt.values.indexOf(v1)) % 9) + 1,
      price: { amount: price, currencyCode: 'AED' },
      compareAtPrice: compareAt ? { amount: compareAt, currencyCode: 'AED' } : null,
      selectedOptions: [{ name: firstOpt.name, value: v1 }],
    }];
  });

  const imageLabels = [title, ...(extraImages ?? [])];
  const images = imageLabels.map((label) => ({
    url: img(productType, label),
    altText: label,
    width: 800,
    height: 800,
  }));

  return {
    id: `gid://shopify/Product/${num}`,
    handle,
    title,
    description,
    descriptionHtml: `<p>${description}</p>`,
    productType,
    vendor: VENDOR,
    tags: [productType.toLowerCase().replace(' ', '-'), 'drinkware', 'chako-lab'],
    featuredImage: images[0],
    images: { nodes: images },
    priceRange: {
      minVariantPrice: { amount: price, currencyCode: 'AED' },
      maxVariantPrice: { amount: price, currencyCode: 'AED' },
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: compareAt ?? price, currencyCode: 'AED' },
    },
    variants: { nodes: variants },
    options,
  };
}

export const MOCK_PRODUCTS: Product[] = [
  // ── LinLin Kettles ──────────────────────────────────────────────────────────
  makeProduct(1001, 'LinLin Kettle', 'LinLin Kettle — Matte Black', 'linlin-kettle-matte-black',
    '185', '220',
    [{ name: 'Color', values: ['Matte Black', 'Pearl White', 'Sage Green'] }],
    'A precision-pour kettle with a gooseneck spout and dual-wall insulation. Keeps water hot for 12 hours.',
    ['Side view', 'Pour detail']),

  makeProduct(1002, 'LinLin Kettle', 'LinLin Kettle Mini — 600ml', 'linlin-kettle-mini',
    '145', '175',
    [{ name: 'Color', values: ['Chalk White', 'Rust', 'Slate'] }],
    'The compact version of the LinLin, perfect for a single serve. Same gooseneck precision in a smaller form.',
    ['Handle close-up']),

  makeProduct(1003, 'LinLin Kettle', 'LinLin Kettle Pro — Temperature Control', 'linlin-kettle-pro',
    '245', null,
    [{ name: 'Color', values: ['Obsidian', 'Brushed Steel'] }],
    'Variable temperature control from 60°C to 100°C. LED display, keep-warm mode, and auto-shutoff.',
    ['Display detail', 'Base view']),

  // ── Kada Bottles ────────────────────────────────────────────────────────────
  makeProduct(2001, 'Kada Bottle', 'Kada Bottle — 500ml', 'kada-bottle-500ml',
    '95', '120',
    [
      { name: 'Color', values: ['Forest', 'Dusk', 'Sand', 'Onyx'] },
      { name: 'Size', values: ['500ml'] },
    ],
    'Vacuum-insulated stainless steel bottle. Cold 24h, hot 12h. Leakproof lid, one-handed open.',
    ['Cap detail', 'Bottom view']),

  makeProduct(2002, 'Kada Bottle', 'Kada Bottle — 750ml', 'kada-bottle-750ml',
    '115', '140',
    [
      { name: 'Color', values: ['Forest', 'Dusk', 'Sand', 'Onyx'] },
      { name: 'Size', values: ['750ml'] },
    ],
    'The full-day companion. Same premium insulation in a larger format with a wide-mouth opening.',
    ['Wide mouth detail']),

  makeProduct(2003, 'Kada Bottle', 'Kada Bottle Sport — 600ml', 'kada-bottle-sport',
    '105', null,
    [{ name: 'Color', values: ['Electric Blue', 'Coral', 'Carbon'] }],
    'Built for active use — rubberised grip, carabiner loop, and a leak-proof sport nozzle.',
    ['Nozzle detail', 'Grip texture']),

  // ── BoBo Tumblers (Thermos Cup) ─────────────────────────────────────────────
  makeProduct(3001, 'Thermos Cup', 'BoBo Tumbler — 350ml', 'bobo-tumbler-350ml',
    '75', '95',
    [{ name: 'Color', values: ['Rose Blush', 'Midnight', 'Eucalyptus', 'Cream'] }],
    'Slim double-wall tumbler with a secure lid. Perfect for coffee, tea, or a cold smoothie.',
    ['Lid detail', 'Size comparison']),

  makeProduct(3002, 'Thermos Cup', 'BoBo Tumbler Wide — 480ml', 'bobo-tumbler-wide',
    '85', null,
    [{ name: 'Color', values: ['Caramel', 'Stone Grey', 'Sage'] }],
    'Wide-mouth variant for bulkier drinks. Fits standard ice cubes. Straw included.',
    ['With straw', 'Open lid']),

  makeProduct(3003, 'Thermos Cup', 'BoBo Tumbler Gradient Series', 'bobo-tumbler-gradient',
    '99', '125',
    [{ name: 'Colorway', values: ['Sunset', 'Ocean', 'Forest Mist'] }],
    'Limited gradient finish applied by hand. Each piece is slightly unique. Same vacuum insulation.',
    ['Gradient close-up']),

  // ── Bawang Cups ─────────────────────────────────────────────────────────────
  makeProduct(4001, 'Bawang Cup', 'Bawang Cup — Ceramic Inner', 'bawang-cup-ceramic',
    '65', '80',
    [{ name: 'Color', values: ['Ivory', 'Charcoal', 'Terracotta'] }],
    'Stainless outer shell with a food-grade ceramic inner coating. No metallic taste. 280ml.',
    ['Ceramic inner', 'Lid off']),

  makeProduct(4002, 'Bawang Cup', 'Bawang Cup Set of 2', 'bawang-cup-set-2',
    '115', '150',
    [{ name: 'Set', values: ['Ivory + Charcoal', 'Terracotta + Sage', 'Matching Pair'] }],
    'Two Bawang Cups packaged as a gift set. Ideal for couples or sharing a brew.',
    ['Gift box', 'Both cups']),

  // ── Pots ────────────────────────────────────────────────────────────────────
  makeProduct(5001, 'Pot', 'Chako Pour-Over Pot — 600ml', 'chako-pour-over-pot',
    '155', '190',
    [{ name: 'Finish', values: ['Matte Black', 'Brushed Steel'] }],
    'A hand-pour pot designed for pour-over coffee. Precision gooseneck, heat-resistant handle, 600ml.',
    ['Gooseneck detail', 'Handle close-up']),

  makeProduct(5002, 'Pot', 'Chako Stovetop Pot — 1L', 'chako-stovetop-pot',
    '195', null,
    [{ name: 'Finish', values: ['Matte Black', 'Polished Silver'] }],
    'Induction-compatible stovetop pot. Tri-ply base for even heat distribution. 1-litre capacity.',
    ['Induction base', 'Side pour']),

  // ── Mugs ────────────────────────────────────────────────────────────────────
  makeProduct(6001, 'Coffee Mug', 'Chako Double-Wall Mug — 300ml', 'chako-double-wall-mug',
    '55', '70',
    [{ name: 'Color', values: ['Warm White', 'Matte Black', 'Sage Green', 'Dusty Rose'] }],
    'Borosilicate glass double-wall mug. Keeps hands cool, drink hot. Visible layering effect.',
    ['Side view', 'Handle detail']),

  makeProduct(6002, 'Coffee Mug', 'Chako Ceramic Mug — 350ml', 'chako-ceramic-mug',
    '45', null,
    [{ name: 'Color', values: ['Speckled White', 'Midnight Blue', 'Terracotta'] }],
    'Handcrafted ceramic mug with a comfortable C-handle and a weighty feel. Microwave safe.',
    ['Speckle texture', 'Bottom stamp']),

  // ── Milk Pods ───────────────────────────────────────────────────────────────
  makeProduct(7001, 'Milk Pod', 'MilkPod Frother Flask — 250ml', 'milkpod-frother',
    '85', '105',
    [{ name: 'Color', values: ['White', 'Black', 'Dusty Pink'] }],
    'Insulated flask with a built-in frother lid. Create café-quality milk foam at home or on the go.',
    ['Frother lid', 'Foam demo']),

  makeProduct(7002, 'Milk Pod', 'MilkPod Mini — 180ml', 'milkpod-mini',
    '65', null,
    [{ name: 'Color', values: ['Oat', 'Charcoal', 'Blush'] }],
    'Single-serve milk pod. Perfect size for a flat white or latte. Fits most espresso machine steaming wands.',
    ['Scale view']),

  // ── Baobao Food Cups ────────────────────────────────────────────────────────
  makeProduct(8001, 'Food Cup', 'Baobao Food Cup — 500ml', 'baobao-food-cup-500ml',
    '75', '90',
    [
      { name: 'Color', values: ['Natural', 'Slate', 'Rust'] },
      { name: 'Lid', values: ['Standard', 'Vented'] },
    ],
    'Vacuum-insulated food cup keeps meals hot for 6 hours. Wide mouth for easy filling and eating.',
    ['Open lid', 'Meal inside']),

  makeProduct(8002, 'Food Cup', 'Baobao Food Cup — 800ml', 'baobao-food-cup-800ml',
    '95', null,
    [{ name: 'Color', values: ['Natural', 'Slate'] }],
    'Family-sized food cup. Bring a full portion of soup, rice, or pasta anywhere.',
    ['Size comparison']),

  // ── PangPang Cups ───────────────────────────────────────────────────────────
  makeProduct(9001, 'PangPang Cup', 'PangPang Cup — Collapsible 250ml', 'pangpang-cup-collapsible',
    '45', '60',
    [{ name: 'Color', values: ['Mint', 'Coral', 'Sky', 'Sand'] }],
    'Collapsible silicone cup that folds flat. Clip onto your bag. Leak-proof snap closure.',
    ['Folded', 'Clip detail']),

  makeProduct(9002, 'PangPang Cup', 'PangPang Cup Stainless — 300ml', 'pangpang-cup-stainless',
    '65', null,
    [{ name: 'Color', values: ['Silver', 'Rose Gold', 'Matte Black'] }],
    'Compact stainless steel cup with a foldable handle. Great for camping, hiking, or office use.',
    ['Handle folded', 'With lid']),

  // ── Square Cups ─────────────────────────────────────────────────────────────
  makeProduct(10001, 'Square Cup', 'Square Cup — Geometric 350ml', 'square-cup-geometric',
    '70', '88',
    [{ name: 'Color', values: ['Warm Black', 'Cream', 'Olive'] }],
    'The signature Square Cup — angular design with rounded interior. Double-wall insulated. A conversation piece.',
    ['Angle view', 'Interior shot']),

  makeProduct(10002, 'Square Cup', 'Square Cup Tall — 450ml', 'square-cup-tall',
    '85', null,
    [{ name: 'Color', values: ['Graphite', 'Sand Stone', 'Deep Teal'] }],
    'Taller format of the Square Cup. Perfect for iced drinks or a generous pour. Lid sold separately.',
    ['Tall view', 'No lid']),
];

export function getMockProducts({
  productType,
  first = 48,
  query,
}: {
  productType?: string;
  first?: number;
  query?: string;
} = {}): Product[] {
  let list = [...MOCK_PRODUCTS];

  if (productType) {
    list = list.filter((p) => p.productType === productType);
  }

  if (query) {
    const q = query.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return list.slice(0, first);
}

export function getMockProduct(handle: string): Product | null {
  return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null;
}
