// "Find Your Chako" — the complete quiz data.
//
// SINGLE SOURCE OF TRUTH. Every question, option, point value and result string
// lives here and nowhere else. No scoring value may appear in component logic —
// that is the rule that keeps this in step with the brief (v2.0) across edits.
//
// Structure mirrors the brief section for section:
//   §3 engine axes → SeriesKey / LiningKey
//   §4 questions   → QUESTIONS, KIDS_QUESTIONS
//   §5 resolution  → engine.ts (order is literal, do not reorder casually)
//   §6 results     → RESULTS
//
// ─── DEVIATIONS FROM THE BRIEF, ALL AUTHORISED BY AHMAD 31 Aug 2026 ──────────
//
// 1. CarryGo Tumbler + Split Cup added as series. They post-date brief v2.0.
//    All facts below were read off the live Shopify catalogue, not invented.
//
// 2. Q3's middle bucket widened from "550–700ml" to "550–900ml" so CarryGo
//    (870ml) has a home. 870ml is not a 1L+ commitment, so it tops the middle
//    bucket rather than joining the large one. The hard capacity constraint
//    stays exactly as validated: a stated "1L+" still resolves to BaWang/BaBa.
//
// 3. Q6's "switch between the two" now scores CarryGo +3 alongside Twist +4.
//    Both products genuinely sell mode-switching without swapping parts, so the
//    tie is broken downstream by drink and size: a coffee drinker lands on
//    Twist (ceramic-coated, 530ml), a water drinker wanting volume on CarryGo
//    (steel, 870ml). Twist keeps the higher score, so it still owns the answer.
//
// 4. THE RESERVOIR REWRITTEN. The brief calls BaBa "SUS 316 / stainless steel".
//    The live PDP says "Tritan Hydration Cup… BPA-Free… food-safe Tritan" and
//    "Built-In Tea Strainer". The brief's own ⚠️ predicted this and said to lead
//    with the strainer if the UAE variant has it. It does. Steel claims removed;
//    retention pills removed too, because site canon forbids retention claims on
//    plastic bodies (product-specs.ts) and a 36H COLD pill would contradict the
//    product's own page.
//
// 5. Three prices corrected against live Shopify: Mesh Cup Sleeve 19 → 29,
//    Twist Tumbler Handle 19 → 29, Twist floor 149 → 159. Everything else in
//    the brief matched live exactly (22 of 25 checked).
//
// ─── ARABIC ──────────────────────────────────────────────────────────────────
// `ar: null` means "awaiting a human write" and renders the English. This is
// deliberate per the brief §8 and the handoff rule 5: the copy is idiomatic and
// voice-specific, and must not be machine-translated. Do not fill these in with
// generated Arabic. Everything is externalised and ready for a translator.

export type SeriesKey =
  | 'kada' | 'bawang' | 'milkpod' | 'bobo' | 'pangpang'
  | 'linlin' | 'twist' | 'baba' | 'carrygo' | 'split';

export type LiningKey = 'steel' | 'ceramic' | 'titanium';
export type CapKey = 'small' | 'mid' | 'large';
export type TierKey = 'low' | 'mid' | 'high' | 'open';
export type AgeKey = 'toddler' | 'young' | 'kid';
export type NeedKey = 'light' | 'cold' | 'tough' | 'cool';

/** A localised string. `ar: null` = awaiting human translation, renders English. */
export interface L {
  readonly en: string;
  readonly ar: string | null;
}

export function text(l: L, locale: string): string {
  return (locale === 'ar' && l.ar) || l.en;
}

export interface QuizOption {
  readonly id: string;
  readonly label: L;
  readonly series?: Partial<Record<SeriesKey, number>>;
  readonly lining?: Partial<Record<LiningKey, number>>;
  readonly cap?: CapKey;
  readonly tier?: TierKey;
  /** Q2 matcha. Hard override — resolution step 2 short-circuits to PangPang. */
  readonly brew?: boolean;
  readonly gift?: boolean;
  readonly path?: 'kids' | 'main';
  readonly age?: AgeKey;
  readonly need?: NeedKey;
  /** Q11 only. Appends to the result's "Pair it with" block; never scores. */
  readonly pairing?: L;
}

export interface Question {
  readonly id: string;
  readonly prompt: L;
  readonly sub?: L;
  readonly multi?: boolean;
  readonly options: readonly QuizOption[];
}

// ─── Q1 — the fork ────────────────────────────────────────────────────────────

export const Q1: Question = {
  id: 'q1',
  prompt: { en: 'Who are we finding a Chako for?', ar: null },
  options: [
    { id: 'me', label: { en: 'Me', ar: null }, path: 'main' },
    { id: 'kid', label: { en: 'My kid', ar: null }, path: 'kids' },
    { id: 'gift', label: { en: 'A gift for someone else', ar: null }, path: 'main', gift: true },
  ],
};

// ─── Kids path — K1..K3 ───────────────────────────────────────────────────────

export const KIDS_QUESTIONS: readonly Question[] = [
  {
    id: 'k1',
    prompt: { en: 'How old are they?', ar: null },
    options: [
      { id: 'toddler', label: { en: 'Under 3', ar: null }, age: 'toddler' },
      { id: 'young', label: { en: '3 to 6', ar: null }, age: 'young' },
      { id: 'kid', label: { en: '7 to 12', ar: null }, age: 'kid' },
      // Drops back into the main path at Q2, per the brief's flow diagram.
      { id: 'teen', label: { en: '13 or older', ar: null }, path: 'main' },
    ],
  },
  {
    id: 'k2',
    prompt: { en: 'Where does it go every day?', ar: null },
    options: [
      { id: 'nursery', label: { en: 'Nursery or daycare', ar: null } },
      { id: 'school', label: { en: 'School bag', ar: null } },
      { id: 'car', label: { en: 'Car seat and errands', ar: null } },
      { id: 'everywhere', label: { en: 'Everywhere, it never leaves their hand', ar: null } },
    ],
  },
  {
    id: 'k3',
    prompt: { en: 'What matters most?', ar: null },
    sub: { en: 'Pick the one you would not compromise on.', ar: null },
    options: [
      { id: 'light', label: { en: 'Light enough for small hands', ar: null }, need: 'light' },
      { id: 'cold', label: { en: 'Stays cold through a hot school day', ar: null }, need: 'cold' },
      { id: 'tough', label: { en: 'Survives being dropped, daily', ar: null }, need: 'tough' },
      { id: 'cool', label: { en: 'They have to think it looks cool', ar: null }, need: 'cool' },
    ],
  },
];

// ─── Main path — Q2..Q11 ──────────────────────────────────────────────────────

export const QUESTIONS: readonly Question[] = [
  {
    id: 'q2',
    prompt: { en: 'What are we filling it with?', ar: null },
    sub: {
      en: 'Think about the everyday drink, not the occasional one. This is the answer that picks your lining.',
      ar: null,
    },
    options: [
      { id: 'water', label: { en: 'Water. Just water.', ar: null }, lining: { steel: 3 } },
      { id: 'coffee', label: { en: 'Coffee, karak, tea with milk', ar: null }, lining: { ceramic: 4 } },
      {
        id: 'brew',
        label: { en: 'Matcha, loose leaf, things I actually brew', ar: null },
        series: { pangpang: 6 },
        brew: true,
      },
      {
        id: 'juice',
        // +2 split: its second straw is sized for boba pearls and fruit pieces.
        label: { en: 'Juice, smoothies, iced drinks with colour', ar: null },
        lining: { ceramic: 4 },
        series: { bawang: 1, split: 2 },
      },
      {
        id: 'all',
        label: { en: 'Genuinely all of the above', ar: null },
        lining: { steel: 1, ceramic: 1 },
      },
    ],
  },
  {
    id: 'q3',
    prompt: { en: 'How much before you refill?', ar: null },
    options: [
      {
        id: 'small',
        label: { en: 'Small, I refill often (~500ml)', ar: null },
        series: { milkpod: 3, bobo: 2, twist: 1, split: 1 },
        cap: 'small',
      },
      {
        // Widened from 550–700 to 550–900 so CarryGo's 870ml has a bucket.
        id: 'mid',
        label: { en: 'A solid daily size (550–900ml)', ar: null },
        series: { kada: 3, pangpang: 1, linlin: 1, carrygo: 2, split: 2 },
        cap: 'mid',
      },
      {
        id: 'large',
        label: { en: 'Big — fill once and forget (1L+)', ar: null },
        series: { baba: 4, bawang: 3 },
        cap: 'large',
      },
    ],
  },
  {
    id: 'q4',
    prompt: { en: 'Where does it spend the day?', ar: null },
    options: [
      {
        id: 'cupholder-desk',
        label: { en: 'Car cup holder and my desk', ar: null },
        series: { bawang: 2, bobo: 2, twist: 2, carrygo: 2 },
      },
      {
        // CarryGo's PDP names driving, walking and training explicitly.
        id: 'gym',
        label: { en: 'Gym bag, or on the move', ar: null },
        series: { kada: 3, baba: 1, carrygo: 2 },
      },
      { id: 'tote', label: { en: 'In my tote, around the city', ar: null }, series: { milkpod: 2, kada: 1 } },
      {
        id: 'kitchen',
        label: { en: 'On the kitchen counter at home', ar: null },
        series: { linlin: 3, pangpang: 2, bobo: 1 },
      },
      { id: 'office', label: { en: 'On my office desk, all day', ar: null }, series: { bobo: 3, twist: 2, baba: 1 } },
    ],
  },
  {
    id: 'q5',
    prompt: { en: 'How do you want to carry it?', ar: null },
    options: [
      {
        // +3 carrygo: the oversized carry handle is its signature.
        id: 'handle',
        label: { en: 'By a handle', ar: null },
        series: { kada: 2, bawang: 2, linlin: 3, baba: 2, carrygo: 3 },
      },
      { id: 'strap', label: { en: 'Shoulder strap', ar: null }, series: { kada: 2, milkpod: 2, twist: 1 } },
      {
        // +1 split: it stays sealed inverted, which is the bag-safety argument.
        id: 'bag',
        label: { en: 'Just tossed in my bag', ar: null },
        series: { milkpod: 2, bobo: 2, split: 1 },
      },
      {
        id: 'cupholder',
        label: { en: 'It lives in a cup holder', ar: null },
        series: { bawang: 3, twist: 1, carrygo: 2 },
      },
    ],
  },
  {
    id: 'q6',
    prompt: { en: 'Straw, or no straw?', ar: null },
    options: [
      {
        // +4 split: it is the straw specialist — the straw comes fully apart
        // and it ships with two of them.
        id: 'straw',
        label: { en: 'Straw. Always.', ar: null },
        series: { bawang: 2, milkpod: 2, pangpang: 2, split: 4 },
      },
      { id: 'lid', label: { en: 'Straight from the lid', ar: null }, series: { kada: 2, bobo: 2, linlin: 1 } },
      {
        // Twist keeps +4 and so still owns this answer; CarryGo also sells
        // mode-switching without swapping parts, so it scores +3 and the tie
        // resolves on drink (ceramic → Twist) and size (870ml → CarryGo).
        id: 'switch',
        label: { en: 'I want to switch between the two', ar: null },
        series: { twist: 4, carrygo: 3, bawang: 1, kada: 1 },
      },
    ],
  },
  {
    id: 'q7',
    prompt: { en: 'How much does weight matter?', ar: null },
    options: [
      { id: 'no', label: { en: 'Not at all', ar: null } },
      { id: 'prefer', label: { en: 'I would prefer something light', ar: null }, lining: { steel: 1 } },
      {
        id: 'lightest',
        label: { en: 'I notice every gram. Lightest possible.', ar: null },
        lining: { titanium: 5 },
      },
    ],
  },
  {
    id: 'q8',
    prompt: { en: 'Be honest about washing up.', ar: null },
    sub: { en: 'Ceramic and glass linings reward a proper daily rinse. Steel forgives you.', ar: null },
    options: [
      {
        // +1 split: a straw you can take apart and inspect is a product for
        // someone who actually cleans things.
        id: 'rinse',
        label: { en: 'I rinse it properly every single day', ar: null },
        lining: { ceramic: 1 },
        series: { split: 1 },
      },
      {
        // The negative is load-bearing: sending a self-declared neglecter a
        // ceramic lining produces a stained bottle and a bad review.
        id: 'neglect',
        label: { en: 'It needs to survive some neglect', ar: null },
        lining: { steel: 2, ceramic: -3 },
      },
    ],
  },
  {
    id: 'q9',
    prompt: { en: 'What look are you after?', ar: null },
    sub: { en: 'Mostly this picks the colourway on your result card.', ar: null },
    options: [
      { id: 'loud', label: { en: 'Loud colour, make it a personality', ar: null } },
      { id: 'pastel', label: { en: 'Soft pastel', ar: null } },
      { id: 'neutral', label: { en: 'Clean and neutral', ar: null }, series: { bobo: 1, twist: 1 } },
      { id: 'metallic', label: { en: 'Quiet premium, metallic', ar: null }, lining: { titanium: 2 } },
    ],
  },
  {
    id: 'q10',
    prompt: { en: 'And the budget?', ar: null },
    options: [
      { id: 'low', label: { en: 'Under AED 120', ar: null }, tier: 'low' },
      { id: 'mid', label: { en: 'AED 140 to 200', ar: null }, lining: { steel: 1, ceramic: 1 }, tier: 'mid' },
      { id: 'high', label: { en: 'AED 250 to 350', ar: null }, lining: { titanium: 3 }, tier: 'high' },
      {
        id: 'open',
        label: { en: 'Show me the best one. Price is second.', ar: null },
        lining: { titanium: 1 },
        tier: 'open',
      },
    ],
  },
  {
    id: 'q11',
    prompt: { en: 'Anything else true about you?', ar: null },
    sub: { en: 'Optional. Pick any that fit — this only adds to your pairings.', ar: null },
    multi: true,
    options: [
      {
        id: 'host',
        label: { en: 'I make tea or coffee for people at home', ar: null },
        pairing: { en: 'LinLin Kettle (from AED 149) or a Sharing Pot (AED 169)', ar: null },
      },
      {
        id: 'food',
        label: { en: 'I take food to work', ar: null },
        pairing: { en: 'Baobao Food Cup (AED 129) or a Lunch Box (AED 149)', ar: null },
      },
      {
        id: 'matching',
        label: { en: 'I want my kid to have a matching one', ar: null },
        pairing: { en: 'Kada Bottle 550ml PPSU (AED 99)', ar: null },
      },
      {
        id: 'sticker',
        label: { en: 'I would put a silly face sticker on it', ar: null },
        pairing: { en: 'A face sticker set (AED 15)', ar: null },
      },
    ],
  },
];

// ─── Results ──────────────────────────────────────────────────────────────────

export interface Result {
  readonly id: string;
  readonly persona: L;
  readonly product: L;
  readonly price: L;
  readonly pills: readonly L[];
  readonly verdict: L;
  readonly points: readonly { readonly label: L; readonly body: L }[];
  readonly pairWith: L;
  readonly shareLine: L;
  /** Collection handle. NEVER a product handle — colourways sell out. */
  readonly collection: string;
  readonly series: SeriesKey | 'titanium';
  readonly lining: LiningKey | 'glass' | 'tritan' | 'ppsu';
}

const p = (en: string): L => ({ en, ar: null });

export const RESULTS: Readonly<Record<string, Result>> = {
  'long-hauler': {
    id: 'long-hauler',
    persona: p('The Long-Hauler'),
    product: p('BaWang Cup 1100ml, stainless steel'),
    price: p('AED 149'),
    pills: [p('1100ML'), p('36H COLD'), p('18H HOT'), p('SUS 316')],
    verdict: p('You do not want to think about your bottle again until tomorrow.'),
    points: [
      { label: p('Size'), body: p('1.1 litres is most of your daily water in one fill. No refill runs, no mid-afternoon rationing.') },
      { label: p('Carry'), body: p('It fits a car cup holder and has the chunky tube handle, so it moves desk to car to desk without a bag.') },
      { label: p('Lining'), body: p('Steel, because plain water in steel tastes like plain water and survives being ignored in a hot car.') },
      { label: p('Lid'), body: p('Two-way: straw when you are driving, straight sip when you are not.') },
    ],
    pairWith: p('A mesh cup sleeve (AED 29) if you want to carry it hands-free, and a face sticker set (AED 15) because at 1.1 litres it is basically a pet.'),
    shareLine: p('I got THE LONG-HAULER. 1.1 litres and zero refills.'),
    collection: 'bawang-cups',
    series: 'bawang',
    lining: 'steel',
  },

  'daily-driver': {
    id: 'daily-driver',
    persona: p('The Daily Driver'),
    product: p('Kada Bottle 550ml, stainless steel'),
    price: p('AED 169'),
    pills: [p('550ML'), p('36H COLD'), p('18H HOT'), p('2-WAY SIP')],
    verdict: p('One bottle. Every day. Nothing clever, everything right.'),
    points: [
      { label: p('Size'), body: p('550ml is the size you actually finish. There is a 700ml (AED 179) if you want more runway.') },
      { label: p('Carry'), body: p('Built-in handle, strap-ready, shaped for a side pocket: gym bag, backpack, car door.') },
      { label: p('Lining'), body: p('Steel for water-first drinking, with a wide mouth that actually cleans.') },
      { label: p('Lid'), body: p('Secure-lock, one-hand open, two-way sip so you can chug or sip.') },
    ],
    pairWith: p('The 700ml in the same finish for long days, so you can rotate one while the other dries.'),
    shareLine: p('I got THE DAILY DRIVER. Reliable. Slightly smug about it.'),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'steel',
  },

  'cafe-ritualist-large': {
    id: 'cafe-ritualist-large',
    persona: p('The Café Ritualist'),
    product: p('BaWang Ceramic Tumbler, ceramic-lined'),
    price: p('AED 169'),
    pills: [p('CERAMIC LINED'), p('36H COLD'), p('18H HOT'), p('NO CARRY-OVER')],
    verdict: p('Your drink has a flavour and you would like to keep it that way.'),
    points: [
      { label: p('Lining'), body: p('Ceramic is the whole point. Coffee, karak and juice leave no stain, no smell and no ghost of yesterday in tomorrow.') },
      { label: p('Why not steel'), body: p('Steel is superb for water and merely fine for milk drinks. You are not a water person.') },
      { label: p('Size'), body: p('Big enough for an iced latte with the ice, which is the format most people actually order.') },
      { label: p('Care'), body: p('Rinse it the day you use it and it stays factory-fresh. That is the deal.') },
    ],
    pairWith: p('A MilkPod Ceramic (AED 179) as the small one — same lining, handbag scale, for the days you only want one coffee.'),
    shareLine: p('I got THE CAFÉ RITUALIST. My karak deserves better and now it has it.'),
    collection: 'bawang-cups',
    series: 'bawang',
    lining: 'ceramic',
  },

  'cafe-ritualist-small': {
    id: 'cafe-ritualist-small',
    persona: p('The Café Ritualist'),
    product: p('MilkPod Ceramic 520ml, ceramic-lined'),
    price: p('AED 179'),
    pills: [p('520ML'), p('CERAMIC LINED'), p('10H COLD'), p('8H HOT')],
    verdict: p('One good coffee, carried properly, in something the size of your hand.'),
    points: [
      { label: p('Lining'), body: p('Ceramic, so the milk drinks taste like themselves and nothing carries over between them.') },
      { label: p('Size'), body: p('520ml is a flat white and a bit. It is a drink, not a reservoir.') },
      { label: p('Carry'), body: p('Rubber handle, leak-proof pod lid. It goes in a tote and stays where you put it.') },
      { label: p('Extras'), body: p('Detachable straw included, for when it turns into an iced day.') },
    ],
    pairWith: p('A MilkMate handle (AED 19) in a clashing colour, which is the correct way to do it.'),
    shareLine: p('I got THE CAFÉ RITUALIST. Small pod. Serious about coffee.'),
    collection: 'milk-pods',
    series: 'milkpod',
    lining: 'ceramic',
  },

  'switch-up': {
    id: 'switch-up',
    persona: p('The Switch-Up'),
    product: p('Twist Tumbler 530ml, ceramic-coated steel'),
    price: p('AED 169'),
    pills: [p('530ML'), p('TWIST LID'), p('CERAMIC COATED'), p('SUS 316')],
    verdict: p('Hot in the morning, iced by afternoon. You want one cup that does both properly.'),
    points: [
      { label: p('The lid'), body: p('A knob you twist between a direct spout and a straw opening. Spout for hot, so you get the aroma without scalding yourself. Straw for iced. No swapping parts, no second lid to lose.') },
      { label: p('Lining'), body: p('Ceramic-coated SUS 316, which is why it handles coffee as well as it handles water: no residue, no lingering aftertaste.') },
      { label: p('Fit'), body: p('530ml, sized for a car cup holder, with a non-slip silicone base and a detachable strap.') },
      { label: p('Honest note'), body: p('It holds temperature for around 8 hours, not the 36 the vacuum-insulated bottles manage. It is built around the lid, not the insulation.') },
    ],
    pairWith: p('A Twist Tumbler Handle (AED 29) if you would rather carry it than pocket-hunt for it.'),
    shareLine: p('I got THE SWITCH-UP. Hot at 8am, iced by 2pm, same cup.'),
    collection: 'twist',
    series: 'twist',
    lining: 'ceramic',
  },

  // REWRITTEN. See deviation 4 at the top of this file — BaBa is Tritan with a
  // built-in tea strainer, not the steel the brief describes.
  reservoir: {
    id: 'reservoir',
    persona: p('The Reservoir'),
    product: p('BaBa Cup 1180ml, Tritan with a built-in tea strainer'),
    price: p('AED 169'),
    pills: [p('1180ML'), p('BUILT-IN TEA STRAINER'), p('BPA-FREE TRITAN'), p('ALSO IN 960ML')],
    verdict: p('The biggest thing in the range, and it brews.'),
    points: [
      { label: p('The strainer'), body: p('A tea strainer built into the cup. Loose leaf, mint, sliced fruit — put it in, fill it, and drink it all afternoon without carrying a separate infuser.') },
      { label: p('Size'), body: p('1180ml, the largest capacity Chako Lab makes. There is a 960ml if that is a step too far.') },
      { label: p('Material'), body: p('BPA-free Tritan rather than steel, which makes it noticeably lighter than a 1.1-litre steel bottle when full. At this size that is the point.') },
      { label: p('Honest note'), body: p('Tritan is not vacuum insulated. It is built for cold drinks and short-term warm ones, not for ice at 6pm. If all-day cold is the real requirement, the BaWang at AED 149 is the honest answer.') },
    ],
    pairWith: p('A Chubby Teapot (AED 169) if the tea habit is turning into a setup.'),
    shareLine: p('I got THE RESERVOIR. 1.18 litres with a tea strainer in it.'),
    collection: 'more',
    series: 'baba',
    lining: 'tritan',
  },

  'desk-setter-ceramic': {
    id: 'desk-setter-ceramic',
    persona: p('The Desk Setter'),
    product: p('BoBo Ceramic Cup, ceramic-lined'),
    price: p('AED 149'),
    pills: [p('CERAMIC LINED'), p('36H COLD'), p('18H HOT'), p('SEALED LID')],
    verdict: p('Coffee at the desk, in the cleanest shape in the range.'),
    points: [
      { label: p('Lining'), body: p('Ceramic, so the third coffee of the day does not taste faintly like the first two.') },
      { label: p('Format'), body: p('No handle, no strap, nothing to catch on anything. It sits next to the keyboard and behaves.') },
      { label: p('Price'), body: p('AED 149, the same as the steel BoBo. The lining is a choice, not an upgrade charge.') },
      { label: p('Care'), body: p('Rinse it before you leave the office and it stays looking new.') },
    ],
    pairWith: p('A Twist Tumbler (AED 169) for the days the desk cup has to leave the building.'),
    shareLine: p('I got THE DESK SETTER. My desk has a whole aesthetic now.'),
    collection: 'bobo-tumblers',
    series: 'bobo',
    lining: 'ceramic',
  },

  brewer: {
    id: 'brewer',
    persona: p('The Brewer'),
    product: p('PangPang Cup, borosilicate glass in steel'),
    price: p('AED 159'),
    pills: [p('570ML GLASS'), p('600ML STEEL'), p('2 STRAWS'), p('−10°C TO 109°C')],
    verdict: p('You make the drink. You do not just buy it.'),
    points: [
      { label: p('Build'), body: p('A borosilicate glass inner cup inside a stainless outer cup. Two vessels, one object.') },
      { label: p('Why glass'), body: p('Matcha, loose leaf and anything you whisk or steep belongs in glass: no lining to pick up the flavour, and you can see the colour.') },
      { label: p('Heat'), body: p('Rated from −10°C to 109°C, so freshly boiled water is not a problem.') },
      { label: p('Straws'), body: p('Two interchangeable straws, because a thick drink and a thin one are not the same job.') },
    ],
    pairWith: p('A LinLin Ceramic Kettle (from AED 169) if the ritual is heading toward a full setup.'),
    shareLine: p('I got THE BREWER. Yes I own a whisk. Yes I use it.'),
    collection: 'pangpang-cups',
    series: 'pangpang',
    lining: 'glass',
  },

  'pocket-pod': {
    id: 'pocket-pod',
    persona: p('The Pocket Pod'),
    product: p('MilkPod 520ml, stainless steel'),
    price: p('AED 149'),
    pills: [p('520ML'), p('10H COLD'), p('8H HOT'), p('SUS 316')],
    verdict: p('Small, sealed, and it disappears into whatever bag you already carry.'),
    points: [
      { label: p('Size'), body: p('520ml. Compact enough that you will actually bring it, which beats a big bottle left at home.') },
      { label: p('Carry'), body: p('Integrated rubber handle plus a pod lid that locks tight. Bag-safe with no second thoughts.') },
      { label: p('Lining'), body: p('Steel, matte finish that resists stains, odours and fingerprints.') },
      { label: p('Extras'), body: p('Detachable straw in the box for iced days.') },
    ],
    pairWith: p('A mesh cup sleeve (AED 29) turns it into a crossbody, which is how half of Dubai carries theirs.'),
    shareLine: p('I got THE POCKET POD. Small bottle, large personality.'),
    collection: 'milk-pods',
    series: 'milkpod',
    lining: 'steel',
  },

  'desk-setter': {
    id: 'desk-setter',
    persona: p('The Desk Setter'),
    product: p('BoBo Tumbler, stainless steel'),
    price: p('AED 149'),
    pills: [p('36H COLD'), p('18H HOT'), p('DESK-SIZED'), p('SEALED LID')],
    verdict: p('It does not need to travel. It needs to look right next to your keyboard.'),
    points: [
      { label: p('Format'), body: p('The simplest thing in the range. No handle to catch, no strap to dangle. It just sits there beautifully.') },
      { label: p('Lining'), body: p('Steel as standard. There is a ceramic BoBo at the same AED 149 if you are a coffee-at-the-desk person.') },
      { label: p('Insulation'), body: p('Double wall, so the 3pm sip is the same temperature as the 11am one.') },
      { label: p('Range'), body: p('Comes in a plastic version too, if you want it even lighter.') },
    ],
    pairWith: p('A Twist Tumbler (AED 169) for the days the desk cup needs to leave the building.'),
    shareLine: p('I got THE DESK SETTER. My desk has a whole aesthetic now.'),
    collection: 'bobo-tumblers',
    series: 'bobo',
    lining: 'steel',
  },

  featherweight: {
    id: 'featherweight',
    persona: p('The Featherweight'),
    product: p('Titanium Series, titanium'),
    price: p('from AED 249'),
    pills: [p('TITANIUM'), p('FROSTED FINISH'), p('36H COLD'), p('18H HOT')],
    verdict: p('You want the lightest thing in the room and you want it to look expensive.'),
    points: [
      { label: p('Material'), body: p('Titanium: dramatically lighter than steel at the same capacity, and it will not corrode or hold flavour.') },
      { label: p('Options'), body: p('Dual-Layer Ti Tumbler AED 249, MilkPod Titanium 520ml AED 279, Frosty MilkPod AED 299, BaWang Ti Tumbler AED 349.') },
      { label: p('Finish'), body: p('The Frosty glitter finish is the one people stop you about. Matte black exists if you would rather they did not.') },
      { label: p('Trade-off'), body: p('It is the top of the range and priced like it. If weight is not genuinely your issue, steel does the same job for AED 149.') },
    ],
    pairWith: p('Start with the MilkPod Titanium 520ml — it is the one where the weight difference is most obvious in the hand.'),
    shareLine: p('I got THE FEATHERWEIGHT. Barely there. Extremely present.'),
    collection: 'titanium',
    series: 'titanium',
    lining: 'titanium',
  },

  host: {
    id: 'host',
    persona: p('The Host'),
    product: p('LinLin Kettle, steel or ceramic'),
    price: p('from AED 149'),
    pills: [p('KETTLE FORM'), p('STEEL / CERAMIC'), p('CARRY HANDLE'), p('36H COLD')],
    verdict: p('You are the one who pours for everyone. You should own the thing that pours.'),
    points: [
      { label: p('Format'), body: p('The kettle silhouette with a proper carry handle. The most recognisable shape in the range.') },
      { label: p('Lining'), body: p('Stainless AED 149 for water, ceramic from AED 169 if it is going to be full of tea and karak.') },
      { label: p('Setting'), body: p('Reads as a table object as much as a bottle. It belongs on a counter and at a picnic.') },
      { label: p('Family'), body: p('Sharing Pot and Hanging Pot (AED 169) round out the set if you host properly.') },
    ],
    pairWith: p('A Chubby Teapot (AED 169) and a stainless strap (AED 19). Now it is a whole table.'),
    shareLine: p('I got THE HOST. I pour for everyone and I have accepted it.'),
    collection: 'linlin-kettles',
    series: 'linlin',
    lining: 'steel',
  },

  'sensible-one': {
    id: 'sensible-one',
    persona: p('The Sensible One'),
    product: p('Kada Bottle 700ml, PPSU / plastic'),
    price: p('AED 99'),
    pills: [p('700ML'), p('LIGHTWEIGHT'), p('2-WAY SIP'), p('CARRY HANDLE')],
    verdict: p('The right shape at the right price. You are not paying for insulation you were never going to use.'),
    points: [
      { label: p('Price'), body: p('AED 99. The entry point to the range, in the same Kada silhouette as the AED 169 steel version.') },
      { label: p('Weight'), body: p('PPSU and plastic are far lighter than steel once full, which matters more over a long day than most people expect.') },
      { label: p('Trade-off'), body: p('No vacuum insulation, so it will not hold ice through the afternoon. If cold-at-4pm is the real requirement, the steel Kada at AED 169 is the honest answer and worth the difference.') },
      { label: p('Sip'), body: p('Same two-way lid and carry handle as the rest of the Kada family.') },
    ],
    pairWith: p('Face stickers (AED 15) — the cheapest way to make it unmistakably yours in a row of identical bottles.'),
    shareLine: p('I got THE SENSIBLE ONE. Zero regrets, ninety-nine dirhams.'),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'ppsu',
  },

  // ─── New in this revision (CarryGo + Split Cup) ─────────────────────────────

  'one-hander': {
    id: 'one-hander',
    persona: p('The One-Hander'),
    product: p('CarryGo Tumbler 870ml, stainless steel'),
    price: p('AED 169'),
    pills: [p('870ML'), p('36H COLD'), p('18H HOT'), p('ONE-TOUCH LID')],
    verdict: p('One hand on the handle, one press on the lid, and you are drinking.'),
    points: [
      { label: p('Size'), body: p('870ml. More than a daily bottle, short of a commitment — it clears most of a day without becoming something you carry with both arms.') },
      { label: p('The lid'), body: p('Straw or wide mouth, switched without swapping parts. Straw at the desk; wide mouth when you actually need to drink properly after training.') },
      { label: p('One-handed'), body: p('One-touch open with a safety lock, so it opens when you press it and never inside your bag.') },
      { label: p('Carry'), body: p('An oversized handle you can hook a finger through, and it still drops into a car cup holder.') },
    ],
    pairWith: p('A face sticker set (AED 15). At 870ml it has enough flat surface to deserve one.'),
    shareLine: p('I got THE ONE-HANDER. 870ml, one hand, no negotiation.'),
    collection: 'carrygo-tumblers',
    series: 'carrygo',
    lining: 'steel',
  },

  'straw-purist': {
    id: 'straw-purist',
    persona: p('The Straw Purist'),
    product: p('Split Cup 570ml, stainless steel'),
    price: p('AED 159'),
    pills: [p('570ML'), p('STRAW COMES APART'), p('2 STRAWS'), p('SUS 316')],
    verdict: p('You drink through a straw, and you have thought about what is inside it.'),
    points: [
      { label: p('The straw'), body: p('It splits completely apart, so you can rinse it through and check it by eye. That is the one part of a straw cup nobody can normally reach.') },
      { label: p('Two of them'), body: p('A flat mouthpiece for everyday sipping, and a wider round one sized for boba pearls and fruit.') },
      { label: p('Sealed'), body: p('It stays shut upside down, so it goes in a bag without a contingency plan.') },
      { label: p('Lining'), body: p('Insulated SUS 316, with a mouth wide enough to take ice cubes and to wash properly by hand.') },
    ],
    pairWith: p('A face sticker set (AED 15), and the Silver at AED 169 if you want the quieter finish.'),
    shareLine: p('I got THE STRAW PURIST. My straw comes apart. Yours does not.'),
    collection: 'split-cups',
    series: 'split',
    lining: 'steel',
  },

  // ─── Kids ───────────────────────────────────────────────────────────────────

  'little-one-ppsu': {
    id: 'little-one-ppsu',
    persona: p('The Little One'),
    product: p('Kada Bottle 550ml PPSU'),
    price: p('AED 99'),
    pills: [p('550ML'), p('PPSU'), p('2-WAY SIP'), p('CARRY HANDLE')],
    verdict: p('Light enough for small hands, tough enough for what small hands do.'),
    points: [
      { label: p('Material'), body: p('PPSU is the material used in baby bottles: light, impact-resistant, takes repeat sterilising without clouding.') },
      { label: p('Weight'), body: p('Far lighter than steel when full, which is the whole argument at this age.') },
      { label: p('Lid'), body: p('Two-way lid works while they are learning and after they have it figured out.') },
      { label: p('Price'), body: p('AED 99, which matters when it gets left at nursery.') },
    ],
    pairWith: p('Face stickers (AED 15) — they will pick the eyebrows, and it makes theirs identifiable in a row of twenty.'),
    shareLine: p('My kid got THE LITTLE ONE. Indestructible, mercifully.'),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'ppsu',
  },

  'little-one-steel': {
    id: 'little-one-steel',
    persona: p('The Little One'),
    product: p('Kada Bottle 550ml, stainless steel'),
    price: p('AED 169'),
    pills: [p('550ML'), p('36H COLD'), p('18H HOT'), p('2-WAY SIP')],
    verdict: p('Old enough for the real thing. Cold water at 2pm in a UAE school.'),
    points: [
      { label: p('Why steel'), body: p('Steel holds cold through a full school day in a hot bag. PPSU will not.') },
      { label: p('Carry'), body: p('Handle and strap point, sized for a school bag side pocket.') },
      { label: p('Finish'), body: p('SUS 316 with a matte finish that hides the scuffs of school life.') },
      { label: p('Size up'), body: p('There is a 700ml (AED 179) if they play sport after school.') },
    ],
    pairWith: p('Face stickers (AED 15). Non-negotiable at this age, apparently.'),
    shareLine: p('My kid got THE LITTLE ONE. Upgraded to the real steel.'),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'steel',
  },

  'little-one-milkpod': {
    id: 'little-one-milkpod',
    persona: p('The Little One'),
    product: p('MilkPod 520ml, stainless steel'),
    price: p('AED 149'),
    pills: [p('520ML'), p('10H COLD'), p('8H HOT'), p('STRAW INCLUDED')],
    verdict: p('The one they will actually carry, because they think it looks good.'),
    points: [
      { label: p('Why this one'), body: p('The best kids bottle is the one that does not get left in a locker. This is the one they choose.') },
      { label: p('Size'), body: p('520ml, compact and light, sized for a smaller bag.') },
      { label: p('Finish'), body: p('Steel with a matte finish that resists stains and fingerprints.') },
      { label: p('Extras'), body: p('Detachable straw and a rubber handle they can clip or hold.') },
    ],
    pairWith: p('A MilkMate handle (AED 19) in a colour that clashes on purpose. That is the point.'),
    shareLine: p('My kid got THE LITTLE ONE. Chosen entirely on looks. Fair enough.'),
    collection: 'milk-pods',
    series: 'milkpod',
    lining: 'steel',
  },
};

/** Every result id, for the reachability sweep. */
export const ALL_RESULT_IDS = Object.keys(RESULTS);
