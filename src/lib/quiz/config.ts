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
// 6. Q4 kitchen: pangpang +2 → +3 (1 Sep 2026). Adding Split Cup scoring had
//    silently made PangPang unwinnable outside the matcha override; one point
//    restores the brief-intended kitchen+straw route. Full 86,400-path sweep
//    re-run after the change.
//
// ─── ARABIC ──────────────────────────────────────────────────────────────────
// Drafted by Claude at Ahmad's explicit request (1 Sep 2026, "please draft the
// arabic for me"), overriding the brief's human-write rule — he owns the brief.
// Written as a copy pass, not a literal translation: MSA with the site's warm,
// plain-spoken voice, the canonical series names from translations.ts (باوانج،
// بانج بانج، كادا…), and Arabic-Indic numerals matching the site chrome.
// PENDING AHMAD'S REVIEW before this reads as final.

export type SeriesKey =
  | 'kada' | 'bawang' | 'milkpod' | 'bobo' | 'pangpang'
  | 'linlin' | 'twist' | 'baba' | 'carrygo' | 'split';

export type LiningKey = 'steel' | 'ceramic' | 'titanium';
export type CapKey = 'small' | 'mid' | 'large';
export type TierKey = 'low' | 'mid' | 'high' | 'open';
export type AgeKey = 'toddler' | 'young' | 'kid';
export type NeedKey = 'light' | 'cold' | 'tough' | 'cool';

/** A localised string. `ar: null` is allowed (renders the English fallback). */
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
  prompt: { en: 'Who are we finding a Chako for?', ar: 'لمن نبحث عن شاكو؟' },
  options: [
    { id: 'me', label: { en: 'Me', ar: 'لي' }, path: 'main' },
    { id: 'kid', label: { en: 'My kid', ar: 'لطفلي' }, path: 'kids' },
    { id: 'gift', label: { en: 'A gift for someone else', ar: 'هدية لشخص آخر' }, path: 'main', gift: true },
  ],
};

// ─── Kids path — K1..K3 ───────────────────────────────────────────────────────

export const KIDS_QUESTIONS: readonly Question[] = [
  {
    id: 'k1',
    prompt: { en: 'How old are they?', ar: 'كم العمر؟' },
    options: [
      { id: 'toddler', label: { en: 'Under 3', ar: 'أقل من ٣ سنوات' }, age: 'toddler' },
      { id: 'young', label: { en: '3 to 6', ar: 'من ٣ إلى ٦' }, age: 'young' },
      { id: 'kid', label: { en: '7 to 12', ar: 'من ٧ إلى ١٢' }, age: 'kid' },
      // Drops back into the main path at Q2, per the brief's flow diagram.
      { id: 'teen', label: { en: '13 or older', ar: '١٣ أو أكبر' }, path: 'main' },
    ],
  },
  {
    id: 'k2',
    prompt: { en: 'Where does it go every day?', ar: 'أين يذهب كل يوم؟' },
    options: [
      { id: 'nursery', label: { en: 'Nursery or daycare', ar: 'الحضانة أو الروضة' } },
      { id: 'school', label: { en: 'School bag', ar: 'شنطة المدرسة' } },
      { id: 'car', label: { en: 'Car seat and errands', ar: 'كرسي السيارة والمشاوير' } },
      { id: 'everywhere', label: { en: 'Everywhere, it never leaves their hand', ar: 'في كل مكان، لا يفارق يده' } },
    ],
  },
  {
    id: 'k3',
    prompt: { en: 'What matters most?', ar: 'ما الأهم عندك؟' },
    sub: { en: 'Pick the one you would not compromise on.', ar: 'اختر الشيء الذي لن تتنازل عنه.' },
    options: [
      { id: 'light', label: { en: 'Light enough for small hands', ar: 'خفيف يناسب الأيادي الصغيرة' }, need: 'light' },
      { id: 'cold', label: { en: 'Stays cold through a hot school day', ar: 'يبقى بارداً طوال يوم مدرسي حار' }, need: 'cold' },
      { id: 'tough', label: { en: 'Survives being dropped, daily', ar: 'يتحمّل الوقوع… يومياً' }, need: 'tough' },
      { id: 'cool', label: { en: 'They have to think it looks cool', ar: 'يجب أن يعجبه شكله أولاً' }, need: 'cool' },
    ],
  },
];

// ─── Main path — Q2..Q11 ──────────────────────────────────────────────────────

export const QUESTIONS: readonly Question[] = [
  {
    id: 'q2',
    prompt: { en: 'What are we filling it with?', ar: 'ماذا ستضع فيه؟' },
    sub: {
      en: 'Think about the everyday drink, not the occasional one. This is the answer that picks your lining.',
      ar: 'فكّر في مشروبك اليومي، لا العَرَضي. هذه الإجابة هي التي تحدد نوع البطانة.',
    },
    options: [
      { id: 'water', label: { en: 'Water. Just water.', ar: 'ماء. فقط ماء.' }, lining: { steel: 3 } },
      { id: 'coffee', label: { en: 'Coffee, karak, tea with milk', ar: 'قهوة، كرك، شاي بالحليب' }, lining: { ceramic: 4 } },
      {
        id: 'brew',
        label: { en: 'Matcha, loose leaf, things I actually brew', ar: 'ماتشا، شاي ورق، أشياء أحضّرها بنفسي' },
        series: { pangpang: 6 },
        brew: true,
      },
      {
        id: 'juice',
        // +2 split: its second straw is sized for boba pearls and fruit pieces.
        label: { en: 'Juice, smoothies, iced drinks with colour', ar: 'عصائر، سموذي، مشروبات مثلّجة ملوّنة' },
        lining: { ceramic: 4 },
        series: { bawang: 1, split: 2 },
      },
      {
        id: 'all',
        label: { en: 'Genuinely all of the above', ar: 'كل ما سبق، بصراحة' },
        lining: { steel: 1, ceramic: 1 },
      },
    ],
  },
  {
    id: 'q3',
    prompt: { en: 'How much before you refill?', ar: 'كم تشرب قبل إعادة التعبئة؟' },
    options: [
      {
        id: 'small',
        label: { en: 'Small, I refill often (~500ml)', ar: 'حجم صغير، أعبّئ كثيراً (~٥٠٠ مل)' },
        series: { milkpod: 3, bobo: 2, twist: 1, split: 1 },
        cap: 'small',
      },
      {
        // Widened from 550–700 to 550–900 so CarryGo's 870ml has a bucket.
        id: 'mid',
        label: { en: 'A solid daily size (550–900ml)', ar: 'حجم يومي مناسب (٥٥٠–٩٠٠ مل)' },
        series: { kada: 3, pangpang: 1, linlin: 1, carrygo: 2, split: 2 },
        cap: 'mid',
      },
      {
        id: 'large',
        label: { en: 'Big — fill once and forget (1L+)', ar: 'كبير — تعبئة واحدة وانتهينا (لتر فأكثر)' },
        series: { baba: 4, bawang: 3 },
        cap: 'large',
      },
    ],
  },
  {
    id: 'q4',
    prompt: { en: 'Where does it spend the day?', ar: 'أين يقضي يومه؟' },
    options: [
      {
        id: 'cupholder-desk',
        label: { en: 'Car cup holder and my desk', ar: 'حامل الأكواب في السيارة ومكتبي' },
        series: { bawang: 2, bobo: 2, twist: 2, carrygo: 2 },
      },
      {
        // CarryGo's PDP names driving, walking and training explicitly.
        id: 'gym',
        label: { en: 'Gym bag, or on the move', ar: 'شنطة الجيم، أو دائم الحركة' },
        series: { kada: 3, baba: 1, carrygo: 2 },
      },
      { id: 'tote', label: { en: 'In my tote, around the city', ar: 'في حقيبتي، أتنقل به في المدينة' }, series: { milkpod: 2, kada: 1 } },
      {
        // pangpang +3 (brief said +2): adding Split Cup scoring had silently
        // made PangPang unwinnable outside the matcha override — Split's Q3-mid
        // +2 and Q6-straw +4 always outran PangPang's non-brew maximum of 5.
        // One point here restores the brief-intended kitchen+straw route
        // (PangPang also outranks Split on ties). Authorized by Ahmad
        // 31 Aug 2026; full 86,400-path sweep re-run after the change.
        id: 'kitchen',
        label: { en: 'On the kitchen counter at home', ar: 'على طاولة المطبخ في البيت' },
        series: { linlin: 3, pangpang: 3, bobo: 1 },
      },
      { id: 'office', label: { en: 'On my office desk, all day', ar: 'على مكتبي طوال اليوم' }, series: { bobo: 3, twist: 2, baba: 1 } },
    ],
  },
  {
    id: 'q5',
    prompt: { en: 'How do you want to carry it?', ar: 'كيف تحب أن تحمله؟' },
    options: [
      {
        // +3 carrygo: the oversized carry handle is its signature.
        id: 'handle',
        label: { en: 'By a handle', ar: 'من المقبض' },
        series: { kada: 2, bawang: 2, linlin: 3, baba: 2, carrygo: 3 },
      },
      { id: 'strap', label: { en: 'Shoulder strap', ar: 'بحزام كتف' }, series: { kada: 2, milkpod: 2, twist: 1 } },
      {
        // +1 split: it stays sealed inverted, which is the bag-safety argument.
        id: 'bag',
        label: { en: 'Just tossed in my bag', ar: 'أرميه في الحقيبة وحسب' },
        series: { milkpod: 2, bobo: 2, split: 1 },
      },
      {
        id: 'cupholder',
        label: { en: 'It lives in a cup holder', ar: 'مكانه الدائم حامل الأكواب' },
        series: { bawang: 3, twist: 1, carrygo: 2 },
      },
    ],
  },
  {
    id: 'q6',
    prompt: { en: 'Straw, or no straw?', ar: 'شفاطة أم بدون؟' },
    options: [
      {
        // +4 split: it is the straw specialist — the straw comes fully apart
        // and it ships with two of them.
        id: 'straw',
        label: { en: 'Straw. Always.', ar: 'شفاطة. دائماً.' },
        series: { bawang: 2, milkpod: 2, pangpang: 2, split: 4 },
      },
      { id: 'lid', label: { en: 'Straight from the lid', ar: 'مباشرة من الغطاء' }, series: { kada: 2, bobo: 2, linlin: 1 } },
      {
        // Twist keeps +4 and so still owns this answer; CarryGo also sells
        // mode-switching without swapping parts, so it scores +3 and the tie
        // resolves on drink (ceramic → Twist) and size (870ml → CarryGo).
        id: 'switch',
        label: { en: 'I want to switch between the two', ar: 'أريد التبديل بين الاثنين' },
        series: { twist: 4, carrygo: 3, bawang: 1, kada: 1 },
      },
    ],
  },
  {
    id: 'q7',
    prompt: { en: 'How much does weight matter?', ar: 'كم يهمّك الوزن؟' },
    options: [
      { id: 'no', label: { en: 'Not at all', ar: 'لا يهمني إطلاقاً' } },
      { id: 'prefer', label: { en: 'I would prefer something light', ar: 'أفضّل شيئاً خفيفاً' }, lining: { steel: 1 } },
      {
        id: 'lightest',
        label: { en: 'I notice every gram. Lightest possible.', ar: 'ألاحظ كل غرام. الأخف على الإطلاق.' },
        lining: { titanium: 5 },
      },
    ],
  },
  {
    id: 'q8',
    prompt: { en: 'Be honest about washing up.', ar: 'كن صريحاً بخصوص الغسيل.' },
    sub: {
      en: 'Ceramic and glass linings reward a proper daily rinse. Steel forgives you.',
      ar: 'بطانات السيراميك والزجاج تكافئ الشطف اليومي الجيد. أما الفولاذ فيسامحك.',
    },
    options: [
      {
        // +1 split: a straw you can take apart and inspect is a product for
        // someone who actually cleans things.
        id: 'rinse',
        label: { en: 'I rinse it properly every single day', ar: 'أشطفه جيداً كل يوم دون استثناء' },
        lining: { ceramic: 1 },
        series: { split: 1 },
      },
      {
        // The negative is load-bearing: sending a self-declared neglecter a
        // ceramic lining produces a stained bottle and a bad review.
        id: 'neglect',
        label: { en: 'It needs to survive some neglect', ar: 'يجب أن يتحمّل بعض الإهمال' },
        lining: { steel: 2, ceramic: -3 },
      },
    ],
  },
  {
    id: 'q9',
    prompt: { en: 'What look are you after?', ar: 'أي إطلالة تناسبك؟' },
    sub: {
      en: 'Mostly this picks the colourway on your result card.',
      ar: 'هذا السؤال يحدد غالباً لون النتيجة التي سنعرضها لك.',
    },
    options: [
      { id: 'loud', label: { en: 'Loud colour, make it a personality', ar: 'لون جريء، اجعله شخصية قائمة بذاتها' } },
      { id: 'pastel', label: { en: 'Soft pastel', ar: 'باستيل هادئ' } },
      { id: 'neutral', label: { en: 'Clean and neutral', ar: 'نظيف ومحايد' }, series: { bobo: 1, twist: 1 } },
      { id: 'metallic', label: { en: 'Quiet premium, metallic', ar: 'فخامة هادئة، معدني' }, lining: { titanium: 2 } },
    ],
  },
  {
    id: 'q10',
    prompt: { en: 'And the budget?', ar: 'والميزانية؟' },
    options: [
      { id: 'low', label: { en: 'Under AED 120', ar: 'أقل من ١٢٠ درهماً' }, tier: 'low' },
      { id: 'mid', label: { en: 'AED 140 to 200', ar: 'من ١٤٠ إلى ٢٠٠ درهم' }, lining: { steel: 1, ceramic: 1 }, tier: 'mid' },
      { id: 'high', label: { en: 'AED 250 to 350', ar: 'من ٢٥٠ إلى ٣٥٠ درهماً' }, lining: { titanium: 3 }, tier: 'high' },
      {
        id: 'open',
        label: { en: 'Show me the best one. Price is second.', ar: 'أرني الأفضل. السعر يأتي ثانياً.' },
        lining: { titanium: 1 },
        tier: 'open',
      },
    ],
  },
  {
    id: 'q11',
    prompt: { en: 'Anything else true about you?', ar: 'هل ينطبق عليك شيء آخر؟' },
    sub: {
      en: 'Optional. Pick any that fit — this only adds to your pairings.',
      ar: 'اختياري. اختر ما يناسبك — يضيف اقتراحات فقط ولا يغيّر نتيجتك.',
    },
    multi: true,
    options: [
      {
        id: 'host',
        label: { en: 'I make tea or coffee for people at home', ar: 'أحضّر الشاي أو القهوة للناس في البيت' },
        pairing: {
          en: 'LinLin Kettle (from AED 149) or a Sharing Pot (AED 169)',
          ar: 'غلاية لين لين (ابتداءً من ١٤٩ درهماً) أو وعاء المشاركة (١٦٩ درهماً)',
        },
      },
      {
        id: 'food',
        label: { en: 'I take food to work', ar: 'آخذ طعامي إلى العمل' },
        pairing: {
          en: 'Baobao Food Cup (AED 129) or a Lunch Box (AED 149)',
          ar: 'كوب باوباو للطعام (١٢٩ درهماً) أو صندوق الغداء (١٤٩ درهماً)',
        },
      },
      {
        id: 'matching',
        label: { en: 'I want my kid to have a matching one', ar: 'أريد لطفلي واحدة مطابقة' },
        pairing: { en: 'Kada Bottle 550ml PPSU (AED 99)', ar: 'زجاجة كادا ٥٥٠ مل PPSU (٩٩ درهماً)' },
      },
      {
        id: 'sticker',
        label: { en: 'I would put a silly face sticker on it', ar: 'سألصق عليه ملصق وجه مضحك' },
        pairing: { en: 'A face sticker set (AED 15)', ar: 'طقم ملصقات الوجوه (١٥ درهماً)' },
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

const p = (en: string, ar: string): L => ({ en, ar });

export const RESULTS: Readonly<Record<string, Result>> = {
  'long-hauler': {
    id: 'long-hauler',
    persona: p('The Long-Hauler', 'النَفَس الطويل'),
    product: p('BaWang Cup 1100ml, stainless steel', 'كوب باوانج ١١٠٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 149', '١٤٩ درهماً'),
    pills: [
      p('1100ML', '١١٠٠ مل'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('SUS 316', 'فولاذ SUS 316'),
    ],
    verdict: p(
      'You do not want to think about your bottle again until tomorrow.',
      'لا تريد أن تفكر في زجاجتك مرة أخرى حتى الغد.'
    ),
    points: [
      {
        label: p('Size', 'الحجم'),
        body: p(
          '1.1 litres is most of your daily water in one fill. No refill runs, no mid-afternoon rationing.',
          '١٫١ لتر يغطي معظم حاجتك اليومية من الماء بتعبئة واحدة. لا جولات إعادة تعبئة، ولا تقنين بعد الظهر.'
        ),
      },
      {
        label: p('Carry', 'الحمل'),
        body: p(
          'It fits a car cup holder and has the chunky tube handle, so it moves desk to car to desk without a bag.',
          'يناسب حامل أكواب السيارة، وبمقبضه الأنبوبي العريض يتنقل من المكتب إلى السيارة وبالعكس دون حقيبة.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Steel, because plain water in steel tastes like plain water and survives being ignored in a hot car.',
          'فولاذ، لأن الماء في الفولاذ يبقى بطعم الماء، ويتحمّل النسيان في سيارة حارة.'
        ),
      },
      {
        label: p('Lid', 'الغطاء'),
        body: p(
          'Two-way: straw when you are driving, straight sip when you are not.',
          'وضعان: شفاطة وأنت تقود، ورشفة مباشرة عندما لا تقود.'
        ),
      },
    ],
    pairWith: p(
      'A mesh cup sleeve (AED 29) if you want to carry it hands-free, and a face sticker set (AED 15) because at 1.1 litres it is basically a pet.',
      'غلاف شبكي للكوب (٢٩ درهماً) إن أردت حمله دون يدين، وطقم ملصقات وجوه (١٥ درهماً) لأنه بسعة ١٫١ لتر أصبح عملياً حيواناً أليفاً.'
    ),
    shareLine: p(
      'I got THE LONG-HAULER. 1.1 litres and zero refills.',
      'حصلت على «النَفَس الطويل». ١٫١ لتر وصفر إعادة تعبئة.'
    ),
    collection: 'bawang-cups',
    series: 'bawang',
    lining: 'steel',
  },

  'daily-driver': {
    id: 'daily-driver',
    persona: p('The Daily Driver', 'رفيق كل يوم'),
    product: p('Kada Bottle 550ml, stainless steel', 'زجاجة كادا ٥٥٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 169', '١٦٩ درهماً'),
    pills: [
      p('550ML', '٥٥٠ مل'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('2-WAY SIP', 'طريقتا شرب'),
    ],
    verdict: p(
      'One bottle. Every day. Nothing clever, everything right.',
      'زجاجة واحدة. كل يوم. لا شيء متذاكٍ، وكل شيء في مكانه.'
    ),
    points: [
      {
        label: p('Size', 'الحجم'),
        body: p(
          '550ml is the size you actually finish. There is a 700ml (AED 179) if you want more runway.',
          '٥٥٠ مل هو الحجم الذي تنهيه فعلاً. وهناك نسخة ٧٠٠ مل (١٧٩ درهماً) إن أردت مساحة أكبر.'
        ),
      },
      {
        label: p('Carry', 'الحمل'),
        body: p(
          'Built-in handle, strap-ready, shaped for a side pocket: gym bag, backpack, car door.',
          'مقبض مدمج، جاهز للحزام، وشكل يناسب الجيب الجانبي: شنطة الجيم، حقيبة الظهر، باب السيارة.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Steel for water-first drinking, with a wide mouth that actually cleans.',
          'فولاذ لمن الماء مشروبه الأول، مع فوهة واسعة تُغسل فعلاً.'
        ),
      },
      {
        label: p('Lid', 'الغطاء'),
        body: p(
          'Secure-lock, one-hand open, two-way sip so you can chug or sip.',
          'قفل محكم يُفتح بيد واحدة، وطريقتا شرب: جرعات كبيرة أو رشفات.'
        ),
      },
    ],
    pairWith: p(
      'The 700ml in the same finish for long days, so you can rotate one while the other dries.',
      'نسخة الـ٧٠٠ مل بنفس اللون للأيام الطويلة، فتناوب على واحدة بينما تجف الأخرى.'
    ),
    shareLine: p(
      'I got THE DAILY DRIVER. Reliable. Slightly smug about it.',
      'حصلت على «رفيق كل يوم». موثوق. وفخور بذلك قليلاً.'
    ),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'steel',
  },

  'cafe-ritualist-large': {
    id: 'cafe-ritualist-large',
    persona: p('The Café Ritualist', 'صاحب طقوس القهوة'),
    product: p('BaWang Ceramic Tumbler, ceramic-lined', 'تمبلر باوانج سيراميك، بطانة سيراميك'),
    price: p('AED 169', '١٦٩ درهماً'),
    pills: [
      p('CERAMIC LINED', 'بطانة سيراميك'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('NO CARRY-OVER', 'بلا أثر للأمس'),
    ],
    verdict: p(
      'Your drink has a flavour and you would like to keep it that way.',
      'لمشروبك نكهة، وتريدها أن تبقى كما هي.'
    ),
    points: [
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Ceramic is the whole point. Coffee, karak and juice leave no stain, no smell and no ghost of yesterday in tomorrow.',
          'السيراميك هو الفكرة كلها. القهوة والكرك والعصير لا تترك بقعة ولا رائحة ولا شبح الأمس في كوب اليوم.'
        ),
      },
      {
        label: p('Why not steel', 'لماذا ليس الفولاذ'),
        body: p(
          'Steel is superb for water and merely fine for milk drinks. You are not a water person.',
          'الفولاذ ممتاز للماء ومقبول فقط لمشروبات الحليب. وأنت لست من فريق الماء.'
        ),
      },
      {
        label: p('Size', 'الحجم'),
        body: p(
          'Big enough for an iced latte with the ice, which is the format most people actually order.',
          'يتسع للاتيه المثلج بثلجه، وهذا ما يطلبه معظم الناس فعلاً.'
        ),
      },
      {
        label: p('Care', 'العناية'),
        body: p(
          'Rinse it the day you use it and it stays factory-fresh. That is the deal.',
          'اشطفه في يوم استخدامه ويبقى كأنه خرج من المصنع للتو. هذا هو الاتفاق.'
        ),
      },
    ],
    pairWith: p(
      'A MilkPod Ceramic (AED 179) as the small one — same lining, handbag scale, for the days you only want one coffee.',
      'ميلك بود سيراميك (١٧٩ درهماً) كخيار صغير — نفس البطانة بحجم حقيبة اليد، لأيام القهوة الواحدة.'
    ),
    shareLine: p(
      'I got THE CAFÉ RITUALIST. My karak deserves better and now it has it.',
      'حصلت على «صاحب طقوس القهوة». كركي يستحق الأفضل وقد ناله.'
    ),
    collection: 'bawang-cups',
    series: 'bawang',
    lining: 'ceramic',
  },

  'cafe-ritualist-small': {
    id: 'cafe-ritualist-small',
    persona: p('The Café Ritualist', 'صاحب طقوس القهوة'),
    product: p('MilkPod Ceramic 520ml, ceramic-lined', 'ميلك بود سيراميك ٥٢٠ مل، بطانة سيراميك'),
    price: p('AED 179', '١٧٩ درهماً'),
    pills: [
      p('520ML', '٥٢٠ مل'),
      p('CERAMIC LINED', 'بطانة سيراميك'),
      p('10H COLD', 'برودة ١٠ ساعات'),
      p('8H HOT', 'حرارة ٨ ساعات'),
    ],
    verdict: p(
      'One good coffee, carried properly, in something the size of your hand.',
      'قهوة واحدة جيدة، محمولة كما يجب، في شيء بحجم كفّك.'
    ),
    points: [
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Ceramic, so the milk drinks taste like themselves and nothing carries over between them.',
          'سيراميك، فتبقى مشروبات الحليب بطعمها الحقيقي ولا ينتقل شيء بينها.'
        ),
      },
      {
        label: p('Size', 'الحجم'),
        body: p(
          '520ml is a flat white and a bit. It is a drink, not a reservoir.',
          '٥٢٠ مل تعني فلات وايت وزيادة بسيطة. إنه مشروب، لا خزّان.'
        ),
      },
      {
        label: p('Carry', 'الحمل'),
        body: p(
          'Rubber handle, leak-proof pod lid. It goes in a tote and stays where you put it.',
          'مقبض مطاطي وغطاء محكم مانع للتسريب. يدخل الحقيبة ويبقى حيث وضعته.'
        ),
      },
      {
        label: p('Extras', 'الإضافات'),
        body: p(
          'Detachable straw included, for when it turns into an iced day.',
          'شفاطة قابلة للفصل ضمن العلبة، ليوم يتحوّل فيه المزاج إلى المثلّج.'
        ),
      },
    ],
    pairWith: p(
      'A MilkMate handle (AED 19) in a clashing colour, which is the correct way to do it.',
      'مقبض ميلك ميت (١٩ درهماً) بلون مخالف عمداً — هذه هي الطريقة الصحيحة.'
    ),
    shareLine: p(
      'I got THE CAFÉ RITUALIST. Small pod. Serious about coffee.',
      'حصلت على «صاحب طقوس القهوة». بود صغير. جدّي في القهوة.'
    ),
    collection: 'milk-pods',
    series: 'milkpod',
    lining: 'ceramic',
  },

  'switch-up': {
    id: 'switch-up',
    persona: p('The Switch-Up', 'المتحوّل'),
    product: p('Twist Tumbler 530ml, ceramic-coated steel', 'تويست تمبلر ٥٣٠ مل، فولاذ بطلاء سيراميك'),
    price: p('AED 169', '١٦٩ درهماً'),
    pills: [
      p('530ML', '٥٣٠ مل'),
      p('TWIST LID', 'غطاء تويست'),
      p('CERAMIC COATED', 'طلاء سيراميك'),
      p('SUS 316', 'فولاذ SUS 316'),
    ],
    verdict: p(
      'Hot in the morning, iced by afternoon. You want one cup that does both properly.',
      'ساخن في الصباح، مثلّج بعد الظهر. تريد كوباً واحداً يجيد الاثنين.'
    ),
    points: [
      {
        label: p('The lid', 'الغطاء'),
        body: p(
          'A knob you twist between a direct spout and a straw opening. Spout for hot, so you get the aroma without scalding yourself. Straw for iced. No swapping parts, no second lid to lose.',
          'قرص تدوّره بين فوهة مباشرة وفتحة شفاطة. الفوهة للساخن فتشمّ الرائحة دون أن تحرق نفسك، والشفاطة للمثلّج. لا قطع تُستبدل ولا غطاء ثانٍ يضيع.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Ceramic-coated SUS 316, which is why it handles coffee as well as it handles water: no residue, no lingering aftertaste.',
          'فولاذ SUS 316 بطلاء سيراميك، ولهذا يتعامل مع القهوة كما يتعامل مع الماء: لا رواسب ولا طعم عالق.'
        ),
      },
      {
        label: p('Fit', 'المقاس'),
        body: p(
          '530ml, sized for a car cup holder, with a non-slip silicone base and a detachable strap.',
          '٥٣٠ مل بمقاس حامل أكواب السيارة، مع قاعدة سيليكون مانعة للانزلاق وحزام قابل للفصل.'
        ),
      },
      {
        label: p('Honest note', 'ملاحظة صريحة'),
        body: p(
          'It holds temperature for around 8 hours, not the 36 the vacuum-insulated bottles manage. It is built around the lid, not the insulation.',
          'يحفظ الحرارة نحو ٨ ساعات، لا ٣٦ كما في الزجاجات المعزولة تفريغياً. صُمم حول غطائه، لا حول عزله.'
        ),
      },
    ],
    pairWith: p(
      'A Twist Tumbler Handle (AED 29) if you would rather carry it than pocket-hunt for it.',
      'مقبض تويست تمبلر (٢٩ درهماً) إن كنت تفضّل حمله بدل البحث عنه في الجيوب.'
    ),
    shareLine: p(
      'I got THE SWITCH-UP. Hot at 8am, iced by 2pm, same cup.',
      'حصلت على «المتحوّل». ساخن في الثامنة، مثلّج في الثانية، نفس الكوب.'
    ),
    collection: 'twist',
    series: 'twist',
    lining: 'ceramic',
  },

  // REWRITTEN. See deviation 4 at the top of this file — BaBa is Tritan with a
  // built-in tea strainer, not the steel the brief describes.
  reservoir: {
    id: 'reservoir',
    persona: p('The Reservoir', 'الخزّان'),
    product: p('BaBa Cup 1180ml, Tritan with a built-in tea strainer', 'كوب بابا ١١٨٠ مل، تريتان مع مصفاة شاي مدمجة'),
    price: p('AED 169', '١٦٩ درهماً'),
    pills: [
      p('1180ML', '١١٨٠ مل'),
      p('BUILT-IN TEA STRAINER', 'مصفاة شاي مدمجة'),
      p('BPA-FREE TRITAN', 'تريتان خالٍ من BPA'),
      p('ALSO IN 960ML', 'متوفر أيضاً ٩٦٠ مل'),
    ],
    verdict: p(
      'The biggest thing in the range, and it brews.',
      'أكبر قطعة في التشكيلة، وتُحضّر الشاي أيضاً.'
    ),
    points: [
      {
        label: p('The strainer', 'المصفاة'),
        body: p(
          'A tea strainer built into the cup. Loose leaf, mint, sliced fruit — put it in, fill it, and drink it all afternoon without carrying a separate infuser.',
          'مصفاة شاي مدمجة في الكوب. شاي ورق، نعناع، شرائح فاكهة — ضعها واملأه واشرب طوال العصر دون أداة نقع منفصلة.'
        ),
      },
      {
        label: p('Size', 'الحجم'),
        body: p(
          '1180ml, the largest capacity Chako Lab makes. There is a 960ml if that is a step too far.',
          '١١٨٠ مل، أكبر سعة تصنعها شاكو لاب. وهناك نسخة ٩٦٠ مل إن كانت هذه خطوة أبعد مما يجب.'
        ),
      },
      {
        label: p('Material', 'الخامة'),
        body: p(
          'BPA-free Tritan rather than steel, which makes it noticeably lighter than a 1.1-litre steel bottle when full. At this size that is the point.',
          'تريتان خالٍ من BPA بدل الفولاذ، ولهذا هو أخف بوضوح من زجاجة فولاذية بلتر كامل عند امتلائها. وفي هذا الحجم، هذه هي الفكرة.'
        ),
      },
      {
        label: p('Honest note', 'ملاحظة صريحة'),
        body: p(
          'Tritan is not vacuum insulated. It is built for cold drinks and short-term warm ones, not for ice at 6pm. If all-day cold is the real requirement, the BaWang at AED 149 is the honest answer.',
          'التريتان ليس معزولاً تفريغياً. صُنع للمشروبات الباردة والدافئة لوقت قصير، لا لثلج يصمد حتى السادسة مساءً. إن كانت البرودة طوال اليوم مطلبك الحقيقي، فالباوانج بـ١٤٩ درهماً هو الجواب الصادق.'
        ),
      },
    ],
    pairWith: p(
      'A Chubby Teapot (AED 169) if the tea habit is turning into a setup.',
      'إبريق تشابي (١٦٩ درهماً) إذا كانت عادة الشاي تتحول إلى طقس كامل.'
    ),
    shareLine: p(
      'I got THE RESERVOIR. 1.18 litres with a tea strainer in it.',
      'حصلت على «الخزّان». ١٫١٨ لتر وبداخله مصفاة شاي.'
    ),
    collection: 'more',
    series: 'baba',
    lining: 'tritan',
  },

  'desk-setter-ceramic': {
    id: 'desk-setter-ceramic',
    persona: p('The Desk Setter', 'نجم المكتب'),
    product: p('BoBo Ceramic Cup, ceramic-lined', 'كوب بوبو سيراميك، بطانة سيراميك'),
    price: p('AED 149', '١٤٩ درهماً'),
    pills: [
      p('CERAMIC LINED', 'بطانة سيراميك'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('SEALED LID', 'غطاء محكم'),
    ],
    verdict: p(
      'Coffee at the desk, in the cleanest shape in the range.',
      'قهوة على المكتب، في أنظف شكل في التشكيلة.'
    ),
    points: [
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Ceramic, so the third coffee of the day does not taste faintly like the first two.',
          'سيراميك، فلا تحمل قهوة الثالثة طعماً خافتاً من الأولى والثانية.'
        ),
      },
      {
        label: p('Format', 'الشكل'),
        body: p(
          'No handle, no strap, nothing to catch on anything. It sits next to the keyboard and behaves.',
          'بلا مقبض ولا حزام ولا شيء يعلق بشيء. يجلس بجانب لوحة المفاتيح ويحسن التصرف.'
        ),
      },
      {
        label: p('Price', 'السعر'),
        body: p(
          'AED 149, the same as the steel BoBo. The lining is a choice, not an upgrade charge.',
          '١٤٩ درهماً، نفس سعر البوبو الفولاذي. البطانة خيار، لا رسم ترقية.'
        ),
      },
      {
        label: p('Care', 'العناية'),
        body: p(
          'Rinse it before you leave the office and it stays looking new.',
          'اشطفه قبل مغادرة المكتب ويبقى بمظهر الجديد.'
        ),
      },
    ],
    pairWith: p(
      'A Twist Tumbler (AED 169) for the days the desk cup has to leave the building.',
      'تويست تمبلر (١٦٩ درهماً) للأيام التي يجب أن يغادر فيها كوب المكتب المبنى.'
    ),
    shareLine: p(
      'I got THE DESK SETTER. My desk has a whole aesthetic now.',
      'حصلت على «نجم المكتب». صار لمكتبي طابعه الخاص.'
    ),
    collection: 'bobo-tumblers',
    series: 'bobo',
    lining: 'ceramic',
  },

  brewer: {
    id: 'brewer',
    persona: p('The Brewer', 'صانع المشروب'),
    product: p('PangPang Cup, borosilicate glass in steel', 'كوب بانج بانج، زجاج بوروسيليكات داخل فولاذ'),
    price: p('AED 159', '١٥٩ درهماً'),
    pills: [
      p('570ML GLASS', 'زجاج ٥٧٠ مل'),
      p('600ML STEEL', 'فولاذ ٦٠٠ مل'),
      p('2 STRAWS', 'شفاطتان'),
      p('−10°C TO 109°C', 'يتحمّل حتى ١٠٩°م'),
    ],
    verdict: p(
      'You make the drink. You do not just buy it.',
      'أنت تصنع مشروبك. لا تكتفي بشرائه جاهزاً.'
    ),
    points: [
      {
        label: p('Build', 'البنية'),
        body: p(
          'A borosilicate glass inner cup inside a stainless outer cup. Two vessels, one object.',
          'كوب داخلي من زجاج البوروسيليكات داخل كوب خارجي من الفولاذ. وعاءان في قطعة واحدة.'
        ),
      },
      {
        label: p('Why glass', 'لماذا الزجاج'),
        body: p(
          'Matcha, loose leaf and anything you whisk or steep belongs in glass: no lining to pick up the flavour, and you can see the colour.',
          'الماتشا وشاي الورق وكل ما يُخفق أو يُنقع مكانه الزجاج: لا بطانة تلتقط النكهة، وترى اللون بعينك.'
        ),
      },
      {
        label: p('Heat', 'الحرارة'),
        body: p(
          'Rated from −10°C to 109°C, so freshly boiled water is not a problem.',
          'مصنّف من ١٠° تحت الصفر إلى ١٠٩° مئوية، فالماء المغلي للتو ليس مشكلة.'
        ),
      },
      {
        label: p('Straws', 'الشفاطات'),
        body: p(
          'Two interchangeable straws, because a thick drink and a thin one are not the same job.',
          'شفاطتان قابلتان للتبديل، لأن المشروب الكثيف والخفيف ليسا المهمة نفسها.'
        ),
      },
    ],
    pairWith: p(
      'A LinLin Ceramic Kettle (from AED 169) if the ritual is heading toward a full setup.',
      'غلاية لين لين سيراميك (ابتداءً من ١٦٩ درهماً) إذا كان الطقس يتجه نحو تجهيزات كاملة.'
    ),
    shareLine: p(
      'I got THE BREWER. Yes I own a whisk. Yes I use it.',
      'حصلت على «صانع المشروب». نعم أملك مخفقة. ونعم أستخدمها.'
    ),
    collection: 'pangpang-cups',
    series: 'pangpang',
    lining: 'glass',
  },

  'pocket-pod': {
    id: 'pocket-pod',
    persona: p('The Pocket Pod', 'رفيق الجيب'),
    product: p('MilkPod 520ml, stainless steel', 'ميلك بود ٥٢٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 149', '١٤٩ درهماً'),
    pills: [
      p('520ML', '٥٢٠ مل'),
      p('10H COLD', 'برودة ١٠ ساعات'),
      p('8H HOT', 'حرارة ٨ ساعات'),
      p('SUS 316', 'فولاذ SUS 316'),
    ],
    verdict: p(
      'Small, sealed, and it disappears into whatever bag you already carry.',
      'صغير، محكم، ويختفي في أي حقيبة تحملها أصلاً.'
    ),
    points: [
      {
        label: p('Size', 'الحجم'),
        body: p(
          '520ml. Compact enough that you will actually bring it, which beats a big bottle left at home.',
          '٥٢٠ مل. صغير بما يكفي لتأخذه معك فعلاً، وهذا يتفوق على زجاجة كبيرة منسية في البيت.'
        ),
      },
      {
        label: p('Carry', 'الحمل'),
        body: p(
          'Integrated rubber handle plus a pod lid that locks tight. Bag-safe with no second thoughts.',
          'مقبض مطاطي مدمج وغطاء بود يقفل بإحكام. آمن في الحقيبة دون تفكير مرتين.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Steel, matte finish that resists stains, odours and fingerprints.',
          'فولاذ بلمسة نهائية مطفأة تقاوم البقع والروائح والبصمات.'
        ),
      },
      {
        label: p('Extras', 'الإضافات'),
        body: p(
          'Detachable straw in the box for iced days.',
          'شفاطة قابلة للفصل في العلبة لأيام المثلّج.'
        ),
      },
    ],
    pairWith: p(
      'A mesh cup sleeve (AED 29) turns it into a crossbody, which is how half of Dubai carries theirs.',
      'الغلاف الشبكي (٢٩ درهماً) يحوّله إلى كروس بودي — وهكذا يحمله نصف دبي.'
    ),
    shareLine: p(
      'I got THE POCKET POD. Small bottle, large personality.',
      'حصلت على «رفيق الجيب». زجاجة صغيرة، شخصية كبيرة.'
    ),
    collection: 'milk-pods',
    series: 'milkpod',
    lining: 'steel',
  },

  'desk-setter': {
    id: 'desk-setter',
    persona: p('The Desk Setter', 'نجم المكتب'),
    product: p('BoBo Tumbler, stainless steel', 'بوبو تمبلر، فولاذ مقاوم للصدأ'),
    price: p('AED 149', '١٤٩ درهماً'),
    pills: [
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('DESK-SIZED', 'بمقاس المكتب'),
      p('SEALED LID', 'غطاء محكم'),
    ],
    verdict: p(
      'It does not need to travel. It needs to look right next to your keyboard.',
      'لا يحتاج إلى السفر. يحتاج فقط إلى أن يبدو صحيحاً بجانب لوحة مفاتيحك.'
    ),
    points: [
      {
        label: p('Format', 'الشكل'),
        body: p(
          'The simplest thing in the range. No handle to catch, no strap to dangle. It just sits there beautifully.',
          'أبسط قطعة في التشكيلة. لا مقبض يعلق ولا حزام يتدلى. يجلس هناك بجمال وحسب.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Steel as standard. There is a ceramic BoBo at the same AED 149 if you are a coffee-at-the-desk person.',
          'فولاذ كخيار أساسي. وهناك بوبو سيراميك بنفس الـ١٤٩ درهماً إن كنت من أهل قهوة المكتب.'
        ),
      },
      {
        label: p('Insulation', 'العزل'),
        body: p(
          'Double wall, so the 3pm sip is the same temperature as the 11am one.',
          'جدار مزدوج، فتكون رشفة الثالثة عصراً بنفس حرارة رشفة الحادية عشرة.'
        ),
      },
      {
        label: p('Range', 'التشكيلة'),
        body: p(
          'Comes in a plastic version too, if you want it even lighter.',
          'يأتي أيضاً بنسخة بلاستيكية إن أردته أخف.'
        ),
      },
    ],
    pairWith: p(
      'A Twist Tumbler (AED 169) for the days the desk cup needs to leave the building.',
      'تويست تمبلر (١٦٩ درهماً) للأيام التي يجب أن يغادر فيها كوب المكتب المبنى.'
    ),
    shareLine: p(
      'I got THE DESK SETTER. My desk has a whole aesthetic now.',
      'حصلت على «نجم المكتب». صار لمكتبي طابعه الخاص.'
    ),
    collection: 'bobo-tumblers',
    series: 'bobo',
    lining: 'steel',
  },

  featherweight: {
    id: 'featherweight',
    persona: p('The Featherweight', 'وزن الريشة'),
    product: p('Titanium Series, titanium', 'سلسلة التيتانيوم، تيتانيوم'),
    price: p('from AED 249', 'ابتداءً من ٢٤٩ درهماً'),
    pills: [
      p('TITANIUM', 'تيتانيوم'),
      p('FROSTED FINISH', 'لمسة فروستي'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
    ],
    verdict: p(
      'You want the lightest thing in the room and you want it to look expensive.',
      'تريد أخف شيء في الغرفة، وتريده أن يبدو ثميناً.'
    ),
    points: [
      {
        label: p('Material', 'الخامة'),
        body: p(
          'Titanium: dramatically lighter than steel at the same capacity, and it will not corrode or hold flavour.',
          'تيتانيوم: أخف من الفولاذ بفارق واضح عند السعة نفسها، ولا يصدأ ولا يحتفظ بالنكهات.'
        ),
      },
      {
        label: p('Options', 'الخيارات'),
        body: p(
          'Dual-Layer Ti Tumbler AED 249, MilkPod Titanium 520ml AED 279, Frosty MilkPod AED 299, BaWang Ti Tumbler AED 349.',
          'تمبلر Ti بطبقتين ٢٤٩ درهماً، ميلك بود تيتانيوم ٥٢٠ مل ٢٧٩ درهماً، ميلك بود فروستي ٢٩٩ درهماً، باوانج Ti تمبلر ٣٤٩ درهماً.'
        ),
      },
      {
        label: p('Finish', 'اللمسة'),
        body: p(
          'The Frosty glitter finish is the one people stop you about. Matte black exists if you would rather they did not.',
          'لمسة فروستي اللامعة هي التي يوقفك الناس ليسألوا عنها. والأسود المطفأ موجود إن كنت تفضّل ألا يفعلوا.'
        ),
      },
      {
        label: p('Trade-off', 'المقابل'),
        body: p(
          'It is the top of the range and priced like it. If weight is not genuinely your issue, steel does the same job for AED 149.',
          'هذه قمة التشكيلة وسعرها كذلك. إن لم يكن الوزن قضيتك فعلاً، فالفولاذ يؤدي المهمة نفسها بـ١٤٩ درهماً.'
        ),
      },
    ],
    pairWith: p(
      'Start with the MilkPod Titanium 520ml — it is the one where the weight difference is most obvious in the hand.',
      'ابدأ بميلك بود تيتانيوم ٥٢٠ مل — فيه يظهر فرق الوزن في اليد بأوضح صورة.'
    ),
    shareLine: p(
      'I got THE FEATHERWEIGHT. Barely there. Extremely present.',
      'حصلت على «وزن الريشة». بالكاد تشعر به. وحضوره طاغٍ.'
    ),
    collection: 'titanium',
    series: 'titanium',
    lining: 'titanium',
  },

  host: {
    id: 'host',
    persona: p('The Host', 'المِضياف'),
    product: p('LinLin Kettle, steel or ceramic', 'غلاية لين لين، فولاذ أو سيراميك'),
    price: p('from AED 149', 'ابتداءً من ١٤٩ درهماً'),
    pills: [
      p('KETTLE FORM', 'شكل غلاية'),
      p('STEEL / CERAMIC', 'فولاذ / سيراميك'),
      p('CARRY HANDLE', 'مقبض حمل'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
    ],
    verdict: p(
      'You are the one who pours for everyone. You should own the thing that pours.',
      'أنت من يصبّ للجميع. يجدر بك أن تملك ما يُصبّ منه.'
    ),
    points: [
      {
        label: p('Format', 'الشكل'),
        body: p(
          'The kettle silhouette with a proper carry handle. The most recognisable shape in the range.',
          'قالب الغلاية بمقبض حمل حقيقي. الشكل الأكثر تميزاً في التشكيلة.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Stainless AED 149 for water, ceramic from AED 169 if it is going to be full of tea and karak.',
          'فولاذ بـ١٤٩ درهماً للماء، وسيراميك ابتداءً من ١٦٩ درهماً إن كانت ستمتلئ بالشاي والكرك.'
        ),
      },
      {
        label: p('Setting', 'المكان'),
        body: p(
          'Reads as a table object as much as a bottle. It belongs on a counter and at a picnic.',
          'تُقرأ كقطعة طاولة بقدر ما هي زجاجة. مكانها الطاولة والنزهة معاً.'
        ),
      },
      {
        label: p('Family', 'العائلة'),
        body: p(
          'Sharing Pot and Hanging Pot (AED 169) round out the set if you host properly.',
          'وعاء المشاركة والوعاء المعلّق (١٦٩ درهماً) يكملان الطقم إن كنت مضيافاً فعلاً.'
        ),
      },
    ],
    pairWith: p(
      'A Chubby Teapot (AED 169) and a stainless strap (AED 19). Now it is a whole table.',
      'إبريق تشابي (١٦٩ درهماً) وحزام ستانلس (١٩ درهماً). الآن صارت طاولة كاملة.'
    ),
    shareLine: p(
      'I got THE HOST. I pour for everyone and I have accepted it.',
      'حصلت على «المِضياف». أصبّ للجميع وقد تصالحت مع ذلك.'
    ),
    collection: 'linlin-kettles',
    series: 'linlin',
    lining: 'steel',
  },

  'sensible-one': {
    id: 'sensible-one',
    persona: p('The Sensible One', 'العملي'),
    product: p('Kada Bottle 700ml, PPSU / plastic', 'زجاجة كادا ٧٠٠ مل، PPSU / بلاستيك'),
    price: p('AED 99', '٩٩ درهماً'),
    pills: [
      p('700ML', '٧٠٠ مل'),
      p('LIGHTWEIGHT', 'خفيفة الوزن'),
      p('2-WAY SIP', 'طريقتا شرب'),
      p('CARRY HANDLE', 'مقبض حمل'),
    ],
    verdict: p(
      'The right shape at the right price. You are not paying for insulation you were never going to use.',
      'الشكل الصحيح بالسعر الصحيح. لن تدفع مقابل عزل لن تستخدمه أصلاً.'
    ),
    points: [
      {
        label: p('Price', 'السعر'),
        body: p(
          'AED 99. The entry point to the range, in the same Kada silhouette as the AED 169 steel version.',
          '٩٩ درهماً. نقطة الدخول إلى التشكيلة، بنفس قالب كادا الفولاذية ذات الـ١٦٩ درهماً.'
        ),
      },
      {
        label: p('Weight', 'الوزن'),
        body: p(
          'PPSU and plastic are far lighter than steel once full, which matters more over a long day than most people expect.',
          'الـPPSU والبلاستيك أخف بكثير من الفولاذ عند الامتلاء، وهذا يهم على مدار يوم طويل أكثر مما يتوقع معظم الناس.'
        ),
      },
      {
        label: p('Trade-off', 'المقابل'),
        body: p(
          'No vacuum insulation, so it will not hold ice through the afternoon. If cold-at-4pm is the real requirement, the steel Kada at AED 169 is the honest answer and worth the difference.',
          'بلا عزل تفريغي، فلن يصمد الثلج حتى العصر. إن كانت البرودة عند الرابعة مطلبك الحقيقي، فكادا الفولاذية بـ١٦٩ درهماً هي الجواب الصادق وتستحق الفرق.'
        ),
      },
      {
        label: p('Sip', 'الشرب'),
        body: p(
          'Same two-way lid and carry handle as the rest of the Kada family.',
          'نفس الغطاء بطريقتي الشرب ونفس مقبض الحمل كبقية عائلة كادا.'
        ),
      },
    ],
    pairWith: p(
      'Face stickers (AED 15) — the cheapest way to make it unmistakably yours in a row of identical bottles.',
      'ملصقات وجوه (١٥ درهماً) — أرخص طريقة تجعلها لا تُخطئها العين في صف من الزجاجات المتطابقة.'
    ),
    shareLine: p(
      'I got THE SENSIBLE ONE. Zero regrets, ninety-nine dirhams.',
      'حصلت على «العملي». صفر ندم، وتسعة وتسعون درهماً.'
    ),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'ppsu',
  },

  // ─── New in this revision (CarryGo + Split Cup) ─────────────────────────────

  'one-hander': {
    id: 'one-hander',
    persona: p('The One-Hander', 'اليد الواحدة'),
    product: p('CarryGo Tumbler 870ml, stainless steel', 'تمبلر كاري جو ٨٧٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 169', '١٦٩ درهماً'),
    pills: [
      p('870ML', '٨٧٠ مل'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('ONE-TOUCH LID', 'غطاء بلمسة واحدة'),
    ],
    verdict: p(
      'One hand on the handle, one press on the lid, and you are drinking.',
      'يد على المقبض، وضغطة على الغطاء، وأنت تشرب.'
    ),
    points: [
      {
        label: p('Size', 'الحجم'),
        body: p(
          '870ml. More than a daily bottle, short of a commitment — it clears most of a day without becoming something you carry with both arms.',
          '٨٧٠ مل. أكثر من زجاجة يومية وأقل من التزام ثقيل — يكفي معظم يومك دون أن يصبح شيئاً تحمله بذراعيك.'
        ),
      },
      {
        label: p('The lid', 'الغطاء'),
        body: p(
          'Straw or wide mouth, switched without swapping parts. Straw at the desk; wide mouth when you actually need to drink properly after training.',
          'شفاطة أو فوهة واسعة، تبدّل بينهما دون استبدال قطع. الشفاطة على المكتب، والفوهة عندما تحتاج شرباً حقيقياً بعد التمرين.'
        ),
      },
      {
        label: p('One-handed', 'بيد واحدة'),
        body: p(
          'One-touch open with a safety lock, so it opens when you press it and never inside your bag.',
          'فتح بلمسة واحدة مع قفل أمان، فيفتح حين تضغط أنت ولا يفتح أبداً داخل حقيبتك.'
        ),
      },
      {
        label: p('Carry', 'الحمل'),
        body: p(
          'An oversized handle you can hook a finger through, and it still drops into a car cup holder.',
          'مقبض كبير تعلّق فيه إصبعك، ومع ذلك ينزل في حامل أكواب السيارة.'
        ),
      },
    ],
    pairWith: p(
      'A face sticker set (AED 15). At 870ml it has enough flat surface to deserve one.',
      'طقم ملصقات وجوه (١٥ درهماً). بسعة ٨٧٠ مل لديه مساحة تستحقها.'
    ),
    shareLine: p(
      'I got THE ONE-HANDER. 870ml, one hand, no negotiation.',
      'حصلت على «اليد الواحدة». ٨٧٠ مل، يد واحدة، بلا نقاش.'
    ),
    collection: 'carrygo-tumblers',
    series: 'carrygo',
    lining: 'steel',
  },

  'straw-purist': {
    id: 'straw-purist',
    persona: p('The Straw Purist', 'عاشق الشفاطة'),
    product: p('Split Cup 570ml, stainless steel', 'كوب سبليت ٥٧٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 159', '١٥٩ درهماً'),
    pills: [
      p('570ML', '٥٧٠ مل'),
      p('STRAW COMES APART', 'شفاطة تنفصل'),
      p('2 STRAWS', 'شفاطتان'),
      p('SUS 316', 'فولاذ SUS 316'),
    ],
    verdict: p(
      'You drink through a straw, and you have thought about what is inside it.',
      'تشرب بالشفاطة، وقد فكرت فعلاً بما بداخلها.'
    ),
    points: [
      {
        label: p('The straw', 'الشفاطة'),
        body: p(
          'It splits completely apart, so you can rinse it through and check it by eye. That is the one part of a straw cup nobody can normally reach.',
          'تنفصل بالكامل، فتشطفها من الداخل وتفحصها بعينك. هذا هو الجزء الوحيد من كوب الشفاطة الذي لا يصل إليه أحد عادة.'
        ),
      },
      {
        label: p('Two of them', 'اثنتان منها'),
        body: p(
          'A flat mouthpiece for everyday sipping, and a wider round one sized for boba pearls and fruit.',
          'فوهة مسطحة للرشف اليومي، وأخرى دائرية أوسع بمقاس حبات البوبا والفاكهة.'
        ),
      },
      {
        label: p('Sealed', 'محكم'),
        body: p(
          'It stays shut upside down, so it goes in a bag without a contingency plan.',
          'يبقى مغلقاً وهو مقلوب، فيدخل الحقيبة دون خطة طوارئ.'
        ),
      },
      {
        label: p('Lining', 'البطانة'),
        body: p(
          'Insulated SUS 316, with a mouth wide enough to take ice cubes and to wash properly by hand.',
          'فولاذ SUS 316 معزول، بفوهة تتسع لمكعبات الثلج وتُغسل باليد بسهولة.'
        ),
      },
    ],
    pairWith: p(
      'A face sticker set (AED 15), and the Silver at AED 169 if you want the quieter finish.',
      'طقم ملصقات وجوه (١٥ درهماً)، والفضي بـ١٦٩ درهماً إن أردت اللمسة الأهدأ.'
    ),
    shareLine: p(
      'I got THE STRAW PURIST. My straw comes apart. Yours does not.',
      'حصلت على «عاشق الشفاطة». شفاطتي تنفصل. وشفاطتك لا.'
    ),
    collection: 'split-cups',
    series: 'split',
    lining: 'steel',
  },

  // ─── Kids ───────────────────────────────────────────────────────────────────

  'little-one-ppsu': {
    id: 'little-one-ppsu',
    persona: p('The Little One', 'الصغير'),
    product: p('Kada Bottle 550ml PPSU', 'زجاجة كادا ٥٥٠ مل PPSU'),
    price: p('AED 99', '٩٩ درهماً'),
    pills: [
      p('550ML', '٥٥٠ مل'),
      p('PPSU', 'PPSU'),
      p('2-WAY SIP', 'طريقتا شرب'),
      p('CARRY HANDLE', 'مقبض حمل'),
    ],
    verdict: p(
      'Light enough for small hands, tough enough for what small hands do.',
      'خفيفة تناسب الأيادي الصغيرة، ومتينة تناسب ما تفعله الأيادي الصغيرة.'
    ),
    points: [
      {
        label: p('Material', 'الخامة'),
        body: p(
          'PPSU is the material used in baby bottles: light, impact-resistant, takes repeat sterilising without clouding.',
          'الـPPSU هي خامة رضّاعات الأطفال: خفيفة، مقاومة للصدمات، وتتحمّل التعقيم المتكرر دون أن تتغيّم.'
        ),
      },
      {
        label: p('Weight', 'الوزن'),
        body: p(
          'Far lighter than steel when full, which is the whole argument at this age.',
          'أخف بكثير من الفولاذ عند الامتلاء، وهذه هي الحجة كلها في هذا العمر.'
        ),
      },
      {
        label: p('Lid', 'الغطاء'),
        body: p(
          'Two-way lid works while they are learning and after they have it figured out.',
          'غطاء بطريقتي شرب يعمل وهم يتعلمون، وبعد أن يتقنوا الأمر.'
        ),
      },
      {
        label: p('Price', 'السعر'),
        body: p(
          'AED 99, which matters when it gets left at nursery.',
          '٩٩ درهماً، وهذا مهم حين تُنسى في الحضانة.'
        ),
      },
    ],
    pairWith: p(
      'Face stickers (AED 15) — they will pick the eyebrows, and it makes theirs identifiable in a row of twenty.',
      'ملصقات وجوه (١٥ درهماً) — سيختارون الحواجب، وستجعل زجاجتهم مميزة في صف من عشرين.'
    ),
    shareLine: p(
      'My kid got THE LITTLE ONE. Indestructible, mercifully.',
      'طفلي حصل على «الصغير». غير قابلة للتدمير، لحسن الحظ.'
    ),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'ppsu',
  },

  'little-one-steel': {
    id: 'little-one-steel',
    persona: p('The Little One', 'الصغير'),
    product: p('Kada Bottle 550ml, stainless steel', 'زجاجة كادا ٥٥٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 169', '١٦٩ درهماً'),
    pills: [
      p('550ML', '٥٥٠ مل'),
      p('36H COLD', 'برودة ٣٦ ساعة'),
      p('18H HOT', 'حرارة ١٨ ساعة'),
      p('2-WAY SIP', 'طريقتا شرب'),
    ],
    verdict: p(
      'Old enough for the real thing. Cold water at 2pm in a UAE school.',
      'كبر بما يكفي للنسخة الحقيقية. ماء بارد عند الثانية ظهراً في مدرسة إماراتية.'
    ),
    points: [
      {
        label: p('Why steel', 'لماذا الفولاذ'),
        body: p(
          'Steel holds cold through a full school day in a hot bag. PPSU will not.',
          'الفولاذ يحفظ البرودة يوماً دراسياً كاملاً داخل شنطة حارة. والـPPSU لا.'
        ),
      },
      {
        label: p('Carry', 'الحمل'),
        body: p(
          'Handle and strap point, sized for a school bag side pocket.',
          'مقبض ونقطة حزام، بمقاس الجيب الجانبي لشنطة المدرسة.'
        ),
      },
      {
        label: p('Finish', 'اللمسة'),
        body: p(
          'SUS 316 with a matte finish that hides the scuffs of school life.',
          'فولاذ SUS 316 بلمسة مطفأة تخفي خدوش الحياة المدرسية.'
        ),
      },
      {
        label: p('Size up', 'حجم أكبر'),
        body: p(
          'There is a 700ml (AED 179) if they play sport after school.',
          'هناك نسخة ٧٠٠ مل (١٧٩ درهماً) إن كان يتمرن بعد المدرسة.'
        ),
      },
    ],
    pairWith: p(
      'Face stickers (AED 15). Non-negotiable at this age, apparently.',
      'ملصقات وجوه (١٥ درهماً). غير قابلة للتفاوض في هذا العمر، على ما يبدو.'
    ),
    shareLine: p(
      'My kid got THE LITTLE ONE. Upgraded to the real steel.',
      'طفلي حصل على «الصغير». ترقّى إلى الفولاذ الحقيقي.'
    ),
    collection: 'kada-bottles',
    series: 'kada',
    lining: 'steel',
  },

  'little-one-milkpod': {
    id: 'little-one-milkpod',
    persona: p('The Little One', 'الصغير'),
    product: p('MilkPod 520ml, stainless steel', 'ميلك بود ٥٢٠ مل، فولاذ مقاوم للصدأ'),
    price: p('AED 149', '١٤٩ درهماً'),
    pills: [
      p('520ML', '٥٢٠ مل'),
      p('10H COLD', 'برودة ١٠ ساعات'),
      p('8H HOT', 'حرارة ٨ ساعات'),
      p('STRAW INCLUDED', 'شفاطة ضمن العلبة'),
    ],
    verdict: p(
      'The one they will actually carry, because they think it looks good.',
      'الزجاجة التي سيحملونها فعلاً، لأنهم يرونها جميلة.'
    ),
    points: [
      {
        label: p('Why this one', 'لماذا هذه'),
        body: p(
          'The best kids bottle is the one that does not get left in a locker. This is the one they choose.',
          'أفضل زجاجة للطفل هي التي لا تُترك في الخزانة. وهذه هي التي يختارونها بأنفسهم.'
        ),
      },
      {
        label: p('Size', 'الحجم'),
        body: p(
          '520ml, compact and light, sized for a smaller bag.',
          '٥٢٠ مل، صغيرة وخفيفة بمقاس شنطة أصغر.'
        ),
      },
      {
        label: p('Finish', 'اللمسة'),
        body: p(
          'Steel with a matte finish that resists stains and fingerprints.',
          'فولاذ بلمسة مطفأة تقاوم البقع والبصمات.'
        ),
      },
      {
        label: p('Extras', 'الإضافات'),
        body: p(
          'Detachable straw and a rubber handle they can clip or hold.',
          'شفاطة قابلة للفصل ومقبض مطاطي يشبكونه أو يمسكونه.'
        ),
      },
    ],
    pairWith: p(
      'A MilkMate handle (AED 19) in a colour that clashes on purpose. That is the point.',
      'مقبض ميلك ميت (١٩ درهماً) بلون متنافر عمداً. هذه هي الفكرة.'
    ),
    shareLine: p(
      'My kid got THE LITTLE ONE. Chosen entirely on looks. Fair enough.',
      'طفلي حصل على «الصغير». اختارها بالشكل فقط. وهذا عدل تماماً.'
    ),
    collection: 'milk-pods',
    series: 'milkpod',
    lining: 'steel',
  },
};

/** Every result id, for the reachability sweep. */
export const ALL_RESULT_IDS = Object.keys(RESULTS);
