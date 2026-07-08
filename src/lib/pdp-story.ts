// ============================================================================
// PDP story content — series-level templates (EN + AR), keyed by collection
// handle. This powers the below-the-fold ProductStory section on every PDP.
//
// EDITING COPY: each series has narrative / features (3 posters with callout
// chips) / inBox / faqs. Copy is intentionally benefit-led and factually
// conservative — hard numbers (capacity, retention hours) are NEVER baked
// here; they are extracted per-product from the live Shopify title +
// description by extractSpecs(), so we can't claim a spec a product
// doesn't state.
// ============================================================================

type L = { en: string; ar: string };

export interface PosterFeature {
  title: L;
  body: L;
  callouts: L[];
}

export interface SeriesStory {
  /** Poster background (series candy color) */
  accent: string;
  /** Light tint for the what's-in-the-box card */
  accentSoft: string;
  /** Text color that survives on the accent */
  posterInk: 'light' | 'dark';
  narrative: L;
  features: PosterFeature[];
  inBox: L[];
  faqs: { q: L; a: L }[];
}

const COMMON_FAQS: { q: L; a: L }[] = [
  {
    q: { en: 'Are the materials food-safe?', ar: 'هل المواد آمنة للطعام؟' },
    a: {
      en: 'Yes — every Chako Lab piece is made from food-grade, BPA-free materials.',
      ar: 'نعم — كل قطعة من شاكو لاب مصنوعة من مواد آمنة للطعام وخالية من BPA.',
    },
  },
  {
    q: { en: 'How should I clean it?', ar: 'كيف أنظّفها؟' },
    a: {
      en: 'Hand-wash with warm soapy water and let it air-dry with the lid off. Avoid harsh abrasives on the matte finish.',
      ar: 'اغسلها يدويًا بماء دافئ وصابون واتركها تجف والغطاء مفتوح. تجنّب المواد الكاشطة على السطح المطفي.',
    },
  },
  {
    q: { en: 'Do you deliver across the UAE?', ar: 'هل توصلون لجميع أنحاء الإمارات؟' },
    a: {
      en: 'Yes — we deliver UAE-wide. Standard and express options are shown at checkout.',
      ar: 'نعم — نوصل لجميع أنحاء الإمارات. خيارات التوصيل العادي والسريع تظهر عند إتمام الطلب.',
    },
  },
];

const CARE_CARD: L = { en: 'Care instructions card', ar: 'بطاقة تعليمات العناية' };
const LEAK_LID: L = { en: 'Leak-resistant lid', ar: 'غطاء مقاوم للتسرب' };
const STRAW: L = { en: 'Detachable straw', ar: 'شفاطة قابلة للفصل' };

const SERIES: Record<string, SeriesStory> = {
  'linlin-kettles': {
    accent: '#FFD100',
    accentSoft: '#FFFDE6',
    posterInk: 'dark',
    narrative: {
      en: 'LinLin carries your whole day — one big, friendly kettle of hydration.',
      ar: 'لين لين يحمل يومك كاملًا — إبريق كبير وودود من الانتعاش.',
    },
    features: [
      {
        title: { en: 'Big on hydration.', ar: 'سعة كبيرة للانتعاش.' },
        body: {
          en: 'One fill keeps you going through work, workouts and everything between — no refill anxiety.',
          ar: 'تعبئة واحدة تكفيك للعمل والتمارين وكل ما بينهما — دون قلق إعادة التعبئة.',
        },
        callouts: [
          { en: 'All-day capacity', ar: 'سعة ليوم كامل' },
          { en: 'Double-wall insulated', ar: 'عزل بجدار مزدوج' },
        ],
      },
      {
        title: { en: 'Carries like a charm.', ar: 'حملها متعة بحد ذاتها.' },
        body: {
          en: 'The signature soft-arch handle makes the big capacity feel light — grab it and go.',
          ar: 'المقبض المقوّس الناعم المميز يجعل السعة الكبيرة تبدو خفيفة — أمسكه وانطلق.',
        },
        callouts: [
          { en: 'Soft-touch handle', ar: 'مقبض ناعم الملمس' },
          { en: 'Leak-resistant lid', ar: 'غطاء مقاوم للتسرب' },
        ],
      },
      {
        title: { en: 'Sip or pour. Your call.', ar: 'ارشف أو اسكب. القرار لك.' },
        body: {
          en: 'Drink straight through the spout or pour into a cup — LinLin plays both ways.',
          ar: 'اشرب مباشرة من الفوهة أو اسكب في كوب — لين لين يناسب الطريقتين.',
        },
        callouts: [
          { en: '2-way drinking', ar: 'طريقتان للشرب' },
          { en: 'Food-grade materials', ar: 'مواد آمنة للطعام' },
        ],
      },
    ],
    inBox: [
      { en: 'LinLin Kettle', ar: 'إبريق لين لين' },
      LEAK_LID,
      { en: 'Fitted carry handle', ar: 'مقبض حمل مثبّت' },
      CARE_CARD,
    ],
    faqs: COMMON_FAQS,
  },

  'bawang-cups': {
    accent: '#F43F5E',
    accentSoft: '#FFF0F4',
    posterInk: 'light',
    narrative: {
      en: 'BaWang is the long-haul companion — built for the longest sips.',
      ar: 'باوانج رفيق المشوار الطويل — صُنع لأطول الرشفات.',
    },
    features: [
      {
        title: { en: 'Goes the distance.', ar: 'يرافقك للنهاية.' },
        body: {
          en: 'A serious capacity in a body that still fits your car cup holder and your routine.',
          ar: 'سعة كبيرة في جسم يناسب حامل الأكواب في سيارتك وروتينك اليومي.',
        },
        callouts: [
          { en: 'Cup-holder friendly', ar: 'يناسب حامل الأكواب' },
          { en: 'Double-wall insulated', ar: 'عزل بجدار مزدوج' },
        ],
      },
      {
        title: { en: 'A handle you’ll hold onto.', ar: 'مقبض لن تفلته.' },
        body: {
          en: 'The chunky tube handle is the BaWang signature — comfortable, confident, unmistakable.',
          ar: 'المقبض الأنبوبي الممتلئ هو توقيع باوانج — مريح وواثق ولا يُخطئه أحد.',
        },
        callouts: [
          { en: 'Tube grip handle', ar: 'مقبض أنبوبي مريح' },
          { en: 'Ring charm included', ar: 'حلقة زينة مرفقة' },
        ],
      },
      {
        title: { en: 'Straw up. No spills.', ar: 'الشفاطة جاهزة. بلا انسكاب.' },
        body: {
          en: 'Sip through the straw or straight from the lid — sealed tight for bags and desks.',
          ar: 'ارشف عبر الشفاطة أو مباشرة من الغطاء — إغلاق محكم يناسب الحقائب والمكاتب.',
        },
        callouts: [
          { en: '2-way sip lid', ar: 'غطاء بطريقتي شرب' },
          { en: 'Leak-resistant seal', ar: 'إحكام مقاوم للتسرب' },
        ],
      },
    ],
    inBox: [
      { en: 'BaWang Cup', ar: 'كوب باوانج' },
      LEAK_LID,
      STRAW,
      CARE_CARD,
    ],
    faqs: COMMON_FAQS,
  },

  'bobo-tumblers': {
    accent: '#0D9488',
    accentSoft: '#E6FAF9',
    posterInk: 'light',
    narrative: {
      en: 'BoBo keeps it simple — your everyday tumbler, done joyfully right.',
      ar: 'بوبو يبقيها بسيطة — تمبلر يومك، بصنعة مبهجة.',
    },
    features: [
      {
        title: { en: 'Everyday easy.', ar: 'سهل لكل يوم.' },
        body: {
          en: 'The right size for desks, commutes and couch time — light enough to live in your hand.',
          ar: 'الحجم المناسب للمكتب والمشاوير وأوقات الاسترخاء — خفيف ليبقى في يدك.',
        },
        callouts: [
          { en: 'Daily-size capacity', ar: 'سعة مثالية يوميًا' },
          { en: 'Double-wall insulated', ar: 'عزل بجدار مزدوج' },
        ],
      },
      {
        title: { en: 'Temperature, held.', ar: 'حرارة مضبوطة.' },
        body: {
          en: 'Double-wall steel keeps cold drinks cold and hot drinks hot, sip after sip.',
          ar: 'الفولاذ مزدوج الجدار يحافظ على برودة البارد وحرارة الساخن، رشفة بعد رشفة.',
        },
        callouts: [
          { en: 'Hot & cold ready', ar: 'للمشروبات الساخنة والباردة' },
          { en: 'Stainless steel body', ar: 'جسم من الفولاذ المقاوم' },
        ],
      },
      {
        title: { en: 'Spill-checked.', ar: 'مؤمَّن ضد الانسكاب.' },
        body: {
          en: 'A sealed lid that survives bags, car rides and enthusiastic gestures.',
          ar: 'غطاء محكم يتحمّل الحقائب ورحلات السيارة والإيماءات الحماسية.',
        },
        callouts: [
          { en: 'Leak-resistant lid', ar: 'غطاء مقاوم للتسرب' },
          { en: 'Easy-clean parts', ar: 'قطع سهلة التنظيف' },
        ],
      },
    ],
    inBox: [
      { en: 'BoBo Tumbler', ar: 'تمبلر بوبو' },
      LEAK_LID,
      STRAW,
      CARE_CARD,
    ],
    faqs: COMMON_FAQS,
  },

  'kada-bottles': {
    accent: '#F97316',
    accentSoft: '#FFF3E8',
    posterInk: 'light',
    narrative: {
      en: 'Kada moves with you — the on-the-go bottle with serious personality.',
      ar: 'كادا تتحرك معك — قارورة الانطلاق بشخصية لا تُنسى.',
    },
    features: [
      {
        title: { en: 'Built to move.', ar: 'صُنعت للحركة.' },
        body: {
          en: 'Gym bag, school bag, side pocket — Kada is shaped for life in motion.',
          ar: 'حقيبة الرياضة أو المدرسة أو الجيب الجانبي — كادا مصممة لحياة لا تتوقف.',
        },
        callouts: [
          { en: 'Carry strap ready', ar: 'جاهزة لحزام الحمل' },
          { en: 'Pocket-friendly shape', ar: 'شكل يناسب الجيوب' },
        ],
      },
      {
        title: { en: 'Locked, not leaking.', ar: 'مقفلة، لا تسرّب.' },
        body: {
          en: 'A secure lid keeps every drop inside the bottle and out of your bag.',
          ar: 'غطاء آمن يبقي كل قطرة داخل القارورة وخارج حقيبتك.',
        },
        callouts: [
          { en: 'Secure-lock lid', ar: 'غطاء بإغلاق آمن' },
          { en: 'One-hand open', ar: 'فتح بيد واحدة' },
        ],
      },
      {
        title: { en: 'Fresh, every refill.', ar: 'انتعاش مع كل تعبئة.' },
        body: {
          en: 'Food-grade materials and wide-mouth cleaning keep every sip tasting like the first.',
          ar: 'مواد آمنة للطعام وفوهة واسعة للتنظيف تجعل كل رشفة كأنها الأولى.',
        },
        callouts: [
          { en: 'Food-grade materials', ar: 'مواد آمنة للطعام' },
          { en: 'Easy-clean wide mouth', ar: 'فوهة واسعة سهلة التنظيف' },
        ],
      },
    ],
    inBox: [
      { en: 'Kada Bottle', ar: 'قارورة كادا' },
      LEAK_LID,
      CARE_CARD,
    ],
    faqs: COMMON_FAQS,
  },

  'milk-pods': {
    accent: '#9333EA',
    accentSoft: '#F5EEFF',
    posterInk: 'light',
    narrative: {
      en: 'Milk Pod is the compact one — small body, big charm.',
      ar: 'ميلك بود هو الصغير اللطيف — جسم مدمج وسحر كبير.',
    },
    features: [
      {
        title: { en: 'Small. Mighty.', ar: 'صغير. جبّار.' },
        body: {
          en: 'A pocketable pod for coffee runs, commutes and little hands alike.',
          ar: 'حجم يناسب الجيب لمشاوير القهوة والتنقل وحتى الأيدي الصغيرة.',
        },
        callouts: [
          { en: 'Compact daily size', ar: 'حجم مدمج يومي' },
          { en: 'Lightweight build', ar: 'وزن خفيف' },
        ],
      },
      {
        title: { en: 'Keeps its cool (and heat).', ar: 'يحفظ البرودة (والحرارة).' },
        body: {
          en: 'Double-wall insulation holds your drink at drinking temperature, not room temperature.',
          ar: 'عزل مزدوج الجدار يبقي مشروبك بحرارة الشرب المثالية لا بحرارة الغرفة.',
        },
        callouts: [
          { en: 'Double-wall insulated', ar: 'عزل بجدار مزدوج' },
          { en: 'Hot & cold ready', ar: 'للساخن والبارد' },
        ],
      },
      {
        title: { en: 'Cute, sealed tight.', ar: 'لطيف ومحكم الإغلاق.' },
        body: {
          en: 'The pod lid locks in tight — toss it in any bag with zero second thoughts.',
          ar: 'غطاء البود يقفل بإحكام — ضعه في أي حقيبة دون تفكير مرتين.',
        },
        callouts: [
          { en: 'Leak-resistant lid', ar: 'غطاء مقاوم للتسرب' },
          { en: 'Bag-safe design', ar: 'آمن داخل الحقيبة' },
        ],
      },
    ],
    inBox: [
      { en: 'Milk Pod', ar: 'ميلك بود' },
      LEAK_LID,
      CARE_CARD,
    ],
    faqs: COMMON_FAQS,
  },

  'pangpang-cups': {
    accent: '#EC4899',
    accentSoft: '#FFF0F8',
    posterInk: 'light',
    narrative: {
      en: 'PangPang is double-layered delight — a cup that hugs your drink.',
      ar: 'بانج بانج متعة بطبقتين — كوب يحتضن مشروبك.',
    },
    features: [
      {
        title: { en: 'Two layers. One vibe.', ar: 'طبقتان. إحساس واحد.' },
        body: {
          en: 'The dual-layer body keeps the outside comfortable to hold whatever is inside.',
          ar: 'الجسم مزدوج الطبقات يبقي السطح الخارجي مريحًا للإمساك مهما كان في الداخل.',
        },
        callouts: [
          { en: 'Dual-layer body', ar: 'جسم مزدوج الطبقات' },
          { en: 'Cool-touch exterior', ar: 'سطح خارجي معتدل' },
        ],
      },
      {
        title: { en: 'Round, soft, friendly.', ar: 'مستدير وناعم وودود.' },
        body: {
          en: 'PangPang’s puffed silhouette is pure Chako — playful curves you’ll want on your desk.',
          ar: 'قوام بانج بانج المنفوخ هو روح شاكو — انحناءات مرحة تليق بمكتبك.',
        },
        callouts: [
          { en: 'Signature puffed shape', ar: 'شكل منفوخ مميز' },
          { en: 'Matte soft finish', ar: 'لمسة نهائية مطفية' },
        ],
      },
      {
        title: { en: 'Ready when you are.', ar: 'جاهز متى ما كنت جاهزًا.' },
        body: {
          en: 'Sealed lid, easy-clean parts, grab-and-go size — zero ceremony, all comfort.',
          ar: 'غطاء محكم وقطع سهلة التنظيف وحجم يناسب الانطلاق — راحة كاملة بلا تكلّف.',
        },
        callouts: [
          { en: 'Leak-resistant lid', ar: 'غطاء مقاوم للتسرب' },
          { en: 'Easy-clean parts', ar: 'قطع سهلة التنظيف' },
        ],
      },
    ],
    inBox: [
      { en: 'PangPang Cup', ar: 'كوب بانج بانج' },
      LEAK_LID,
      CARE_CARD,
    ],
    faqs: COMMON_FAQS,
  },
};

// Accessories: handles, straps, sleeves, towels, heating pads. NOT drinkware —
// this story makes zero capacity/insulation claims (mix-and-match + color only).
SERIES['accessories'] = {
  accent: '#F5A623',
  accentSoft: '#FFF3E0',
  posterInk: 'dark',
  narrative: {
    en: 'Little add-ons. Big personality.',
    ar: 'إضافات صغيرة. شخصية كبيرة.',
  },
  features: [
    {
      title: { en: 'Mix. Match. Yours.', ar: 'نسّق وبدّل على ذوقك.' },
      body: {
        en: 'Collect handles, straps and cup sleeves in every candy color — and dress each Chako piece your way.',
        ar: 'اجمع المقابض والأحزمة وأكمام الأكواب بكل الألوان المبهجة — وزيّن كل قطعة شاكو على طريقتك.',
      },
      callouts: [
        { en: 'Designed by Chako Lab', ar: 'بتصميم شاكو لاب' },
        { en: 'Candy color range', ar: 'تشكيلة ألوان مبهجة' },
      ],
    },
    {
      title: { en: 'The details do the talking.', ar: 'التفاصيل تتحدث عنك.' },
      body: {
        en: 'Playful shapes, joyful colors and that unmistakable Chako charm — down to the smallest piece.',
        ar: 'أشكال مرحة وألوان مبهجة وسحر شاكو المميز — حتى في أصغر قطعة.',
      },
      callouts: [
        { en: 'Signature Chako look', ar: 'طابع شاكو المميز' },
        { en: 'Cheerful, giftable details', ar: 'تفاصيل مبهجة تصلح للإهداء' },
      ],
    },
    {
      title: { en: 'Small gifts, big smiles.', ar: 'هدايا صغيرة وابتسامات كبيرة.' },
      body: {
        en: 'The easiest way to gift Chako — or to treat your own bottle to something new.',
        ar: 'أسهل طريقة لإهداء شاكو — أو لتدليل قارورتك بشيء جديد.',
      },
      callouts: [
        { en: 'Gift-friendly price', ar: 'سعر مثالي للهدايا' },
        { en: 'UAE-wide delivery', ar: 'توصيل لكل الإمارات' },
      ],
    },
  ],
  // Single item only — packaging varies per accessory, so we claim nothing else
  inBox: [{ en: 'Your Chako Lab accessory', ar: 'إكسسوار شاكو لاب الخاص بك' }],
  // Bespoke FAQs — the drinkware COMMON_FAQS talk about lids and food-grade
  // materials, which reads wrong on towels/straps/pads.
  faqs: [
    {
      q: { en: 'Will it fit my Chako piece?', ar: 'هل يناسب قطعة شاكو الخاصة بي؟' },
      a: {
        en: 'Handles, straps and cup sleeves are made for the series in their product name (e.g. a MilkMate handle fits MilkMate tumblers). Towels and heating pads are one-size — no matching needed. Not sure? Message us before ordering.',
        ar: 'المقابض والأحزمة وأكمام الأكواب مصممة للسلسلة المذكورة في اسم المنتج (مثلاً مقبض ميلك ميت يناسب تمبلر ميلك ميت). أما المناشف ووسادة التسخين فمقاس واحد يناسب الجميع — دون حاجة للمطابقة. لست متأكدًا؟ راسلنا قبل الطلب.',
      },
    },
    {
      q: { en: 'How do I care for it?', ar: 'كيف أعتني به؟' },
      a: {
        en: 'Towels, sleeves, straps and handles: a gentle hand-wash and air-dry keeps them looking their best — avoid harsh cleaners on printed surfaces. The Heating Pad is electric: never immerse it in water. Unplug it and wipe with a soft, slightly damp cloth only.',
        ar: 'المناشف وأكمام الأكواب والأحزمة والمقابض: اغسلها يدويًا بلطف وجففها بالهواء، وتجنّب المنظفات القاسية على الأسطح المطبوعة. أما وسادة التسخين فهي كهربائية: لا تغمرها في الماء أبدًا — افصلها عن الكهرباء وامسحها بقطعة قماش ناعمة رطبة قليلًا فقط.',
      },
    },
    {
      q: { en: 'Do you deliver across the UAE?', ar: 'هل توصلون لجميع أنحاء الإمارات؟' },
      a: {
        en: 'Yes — we deliver UAE-wide. Standard and express options are shown at checkout.',
        ar: 'نعم — نوصل لجميع أنحاء الإمارات. خيارات التوصيل العادي والسريع تظهر عند إتمام الطلب.',
      },
    },
  ],
};

// Series aliases — multiple collections share one story
SERIES['bobo-cup'] = SERIES['bobo-tumblers'];
SERIES['tumbler'] = SERIES['bobo-tumblers'];

const GENERIC: SeriesStory = {
  accent: '#F5A623',
  accentSoft: '#FFF3E0',
  posterInk: 'dark',
  narrative: {
    en: 'Thoughtfully designed drinkware for your daily ritual.',
    ar: 'أدوات شرب مصممة بعناية لطقوسك اليومية.',
  },
  features: [
    {
      title: { en: 'Made for every day.', ar: 'صُنعت لكل يوم.' },
      body: {
        en: 'Designed to live in your routine — desk, commute, gym and back again.',
        ar: 'صُممت لتعيش في روتينك — المكتب والمشوار والنادي والعودة.',
      },
      callouts: [
        { en: 'Daily-friendly design', ar: 'تصميم يومي عملي' },
        { en: 'Double-wall insulated', ar: 'عزل بجدار مزدوج' },
      ],
    },
    {
      title: { en: 'Sealed with care.', ar: 'إغلاق بعناية.' },
      body: {
        en: 'Leak-resistant lids and food-grade materials in every piece.',
        ar: 'أغطية مقاومة للتسرب ومواد آمنة للطعام في كل قطعة.',
      },
      callouts: [
        { en: 'Leak-resistant lid', ar: 'غطاء مقاوم للتسرب' },
        { en: 'Food-grade materials', ar: 'مواد آمنة للطعام' },
      ],
    },
    {
      title: { en: 'Color you can hold.', ar: 'لون تمسكه بيدك.' },
      body: {
        en: 'Joyful palettes and matte finishes — drinkware with personality.',
        ar: 'ألوان مبهجة ولمسات مطفية — أدوات شرب بشخصية.',
      },
      callouts: [
        { en: 'Signature Chako colors', ar: 'ألوان شاكو المميزة' },
        { en: 'Matte soft-touch finish', ar: 'لمسة نهائية ناعمة' },
      ],
    },
  ],
  inBox: [
    { en: 'Your Chako Lab piece', ar: 'قطعتك من شاكو لاب' },
    LEAK_LID,
    CARE_CARD,
  ],
  faqs: COMMON_FAQS,
};

const TITANIUM_OVERRIDE: Pick<SeriesStory, 'accent' | 'accentSoft' | 'posterInk'> = {
  accent: '#6366F1',
  accentSoft: '#EEF2FF',
  posterInk: 'light',
};

// Canonical retention FAQ — insulated products only (36h cold / 18h hot)
const RETENTION_FAQ: { q: L; a: L } = {
  q: { en: 'How long does it keep drinks cold or hot?', ar: 'كم تدوم برودة أو حرارة المشروبات؟' },
  a: {
    en: 'Double-wall insulation keeps drinks cold for up to 36 hours and hot for up to 18 hours.',
    ar: 'العزل مزدوج الجدار يحافظ على المشروبات باردة حتى ٣٦ ساعة وساخنة حتى ١٨ ساعة.',
  },
};

// Plastic-bodied (Tritan/PPSU) products must never carry insulation claims
const PLASTIC_FAQ: { q: L; a: L } = {
  q: { en: 'Is this bottle insulated?', ar: 'هل هذه القارورة معزولة؟' },
  a: {
    en: 'This is a lightweight BPA-free plastic bottle built for everyday hydration — it isn’t vacuum-insulated. For temperature retention, check our stainless and ceramic series.',
    ar: 'هذه قارورة بلاستيكية خفيفة خالية من BPA للترطيب اليومي — وهي غير معزولة. لحفظ الحرارة، تصفّح سلاسلنا الفولاذية والسيراميك.',
  },
};

const INSULATION_CHIP_RE = /double-wall|insulated|عزل|الساخنة والباردة|للساخن والبارد|hot & cold/i;
const PLASTIC_CHIP: L = { en: 'Featherlight BPA-free body', ar: 'جسم خفيف خالٍ من BPA' };

export function getSeriesStory(
  collectionHandle?: string,
  isTitanium?: boolean,
  isPlastic?: boolean
): SeriesStory {
  let story = (collectionHandle && SERIES[collectionHandle]) || GENERIC;
  if (isTitanium) story = { ...story, ...TITANIUM_OVERRIDE };

  // Accessories carry their own FAQs (incl. fit guidance) and make no
  // drinkware claims — neither the retention nor the plastic FAQ applies.
  if (collectionHandle === 'accessories') return story;

  if (isPlastic) {
    // Strip every insulation-flavored callout and swap in plastic-safe ones
    story = {
      ...story,
      features: story.features.map((f) => ({
        ...f,
        callouts: f.callouts.map((c) =>
          INSULATION_CHIP_RE.test(`${c.en} ${c.ar}`) ? PLASTIC_CHIP : c
        ),
      })),
      faqs: [PLASTIC_FAQ, ...story.faqs],
    };
  } else {
    story = { ...story, faqs: [RETENTION_FAQ, ...story.faqs] };
  }

  return story;
}

// ── Per-product spec extraction ────────────────────────────────────────────
// Reads hard numbers from the product's own title + description so we never
// display a spec the product doesn't claim. Handles Arabic-Indic digits.

export interface ExtractedSpec {
  value: number;
  suffix: string;
  label: L;
}

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
function normalizeDigits(s: string): string {
  return s.replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export function extractSpecs(text: string): ExtractedSpec[] {
  const t = normalizeDigits(text);
  const specs: ExtractedSpec[] = [];

  // Capacity: "1000ML", "520 ml", "1.5L", "1 liter"
  const ml = t.match(/(\d{3,4})\s*ml\b/i);
  const liters = t.match(/(\d(?:[.,]\d)?)\s*(?:l\b|liter|litre|لتر)/i);
  if (ml) {
    specs.push({ value: parseInt(ml[1], 10), suffix: 'ml', label: { en: 'Capacity', ar: 'السعة' } });
  } else if (liters) {
    specs.push({
      value: Math.round(parseFloat(liters[1].replace(',', '.')) * 1000),
      suffix: 'ml',
      label: { en: 'Capacity', ar: 'السعة' },
    });
  }

  // Retention: "hot for 24 hours", "24 hours hot", "keeps ... cold for 36 hours",
  // Arabic: "ساخن لمدة ٢٤ ساعة" (after digit normalization: numbers are western)
  const hot =
    t.match(/hot[^.]{0,40}?(\d{1,2})\s*(?:hours?|hrs?|ساعة|ساعات)/i) ||
    t.match(/(\d{1,2})\s*(?:hours?|hrs?|ساعة|ساعات)[^.]{0,20}?(?:hot|ساخن)/i) ||
    t.match(/(?:ساخن|الساخنة)[^.]{0,40}?(\d{1,2})\s*(?:ساعة|ساعات)/);
  if (hot) {
    specs.push({ value: parseInt(hot[1], 10), suffix: 'h', label: { en: 'Stays hot', ar: 'يبقى ساخنًا' } });
  }
  const cold =
    t.match(/cold[^.]{0,40}?(\d{1,2})\s*(?:hours?|hrs?|ساعة|ساعات)/i) ||
    t.match(/(\d{1,2})\s*(?:hours?|hrs?|ساعة|ساعات)[^.]{0,20}?(?:cold|بارد)/i) ||
    t.match(/(?:بارد|الباردة)[^.]{0,40}?(\d{1,2})\s*(?:ساعة|ساعات)/);
  if (cold) {
    specs.push({ value: parseInt(cold[1], 10), suffix: 'h', label: { en: 'Stays cold', ar: 'يبقى باردًا' } });
  }

  // Weight: "510 grams" / "510g"
  const weight = t.match(/(\d{2,4})\s*(?:g\b|grams?|جرام|غرام)/i);
  if (weight) {
    specs.push({ value: parseInt(weight[1], 10), suffix: 'g', label: { en: 'Weight', ar: 'الوزن' } });
  }

  return specs.slice(0, 4);
}
