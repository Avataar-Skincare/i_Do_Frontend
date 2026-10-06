export type ArticleBlock = { p: string } | { h: string };

export type Article = {
  slug: string;
  tag: string;
  read: string;
  glyphWord: string;
  title: string;
  dek: string;
  body: ArticleBlock[];
};

/** Decorative words standing in for card photography (see components/ui/ImagePlaceholder.tsx
 * for the same pattern elsewhere) — six are used below, two are spares for future articles. */
export const JOURNAL_GLYPH_WORDS = [
  "Rhythm",
  "Vitality",
  "Balance",
  "Renewal",
  "Clarity",
  "Glow",
  "Radiance",
  "Barrier",
] as const;

export const JOURNAL_ARTICLES: Article[] = [
  {
    slug: "social-jetlag",
    tag: "Sleep",
    read: "3 min",
    glyphWord: "Rhythm",
    title: "Social Jetlag: Why Monday Skin Looks Tired",
    dek: "When your weekend sleep drifts far from your weekday rhythm, your skin's overnight repair shift gets thrown off.",
    body: [
      {
        p: "Your skin does most of its repair work while you sleep — rebuilding the barrier, clearing inflammation, resetting for the day. When your weekend bedtime drifts two or three hours later than your weekday one, your body experiences something close to jet lag without ever leaving the city.",
      },
      { h: "What i do notices" },
      {
        p: "On a Monday after a late weekend, your ring often logs a later sleep midpoint, a higher resting heart rate and a warmer skin temperature overnight. In the app, that tends to show up as a small dip in your Barrier and Glow scores — the visible version of skin that had a shorter repair window.",
      },
      { h: "What helps" },
      {
        p: "Keep your wake time within an hour of your weekday one, even after a late night — waking consistently matters more than sleeping in. Get daylight early, go gentle on strong actives while your barrier recovers, and let your scores climb back over the next day or two.",
      },
    ],
  },
  {
    slug: "depuff-duo",
    tag: "Movement",
    read: "4 min",
    glyphWord: "Vitality",
    title: "Face Massage + Movement: The De-Puff Duo",
    dek: "Lymphatic flow responds to two things you already have: your hands and a short walk.",
    body: [
      {
        p: "Morning puffiness is mostly fluid that pooled overnight. It moves when you move. A couple of minutes of upward, outward facial massage paired with light movement does more than either alone.",
      },
      { h: "The two-minute routine" },
      {
        p: "Start at the centre of the face and sweep outward toward the ears, then down the sides of the neck. Keep the pressure light — you are moving fluid, not muscle. Follow it with a brisk five-minute walk to get circulation going.",
      },
      {
        p: "i do users who log morning movement tend to see steadier Glow scores through the week, especially in the days before their period when fluid retention naturally rises.",
      },
    ],
  },
  {
    slug: "perimenopause-protein",
    tag: "Hormones",
    read: "5 min",
    glyphWord: "Balance",
    title: "Strength + Protein: The Perimenopause Playbook",
    dek: "As oestrogen shifts, skin firmness and collagen need a little more support from the outside.",
    body: [
      {
        p: "Perimenopause brings a gradual decline in oestrogen, and with it changes in skin firmness, hydration and how quickly collagen renews. The good news: the two most effective levers are also two of the simplest.",
      },
      { h: "Protein first" },
      {
        p: "Aim to anchor each meal around protein. It supplies the building blocks for collagen and helps preserve the lean muscle that supports skin from underneath.",
      },
      { h: "Resistance matters" },
      {
        p: "Two or three short strength sessions a week support bone, muscle and metabolic health during this transition. In i do, this phase is where your Collagen Protection score becomes especially worth watching.",
      },
    ],
  },
  {
    slug: "follicular-luteal",
    tag: "Cycle",
    read: "4 min",
    glyphWord: "Renewal",
    title: "Follicular vs Luteal: When to Push Actives",
    dek: "Your skin's tolerance for strong ingredients rises and falls with your cycle. Time your routine to it.",
    body: [
      {
        p: "Skin is not the same all month. In the follicular phase, rising oestrogen tends to make it calmer, more resilient and more tolerant of active ingredients. In the luteal phase, it can turn more reactive and oil-prone.",
      },
      { h: "Follicular (roughly days 6–13)" },
      {
        p: "This is your window to introduce or step up actives like retinoids, exfoliating acids and vitamin C. Your barrier is at its strongest and most forgiving.",
      },
      { h: "Luteal (roughly days 20–28)" },
      {
        p: "Ease off. Focus on barrier support, hydration and calming ingredients, and expect a little more oil. i do flags your phase each day so you are never guessing.",
      },
    ],
  },
  {
    slug: "eight-scores",
    tag: "Product",
    read: "6 min",
    glyphWord: "Clarity",
    title: "The Eight Scores, Explained",
    dek: "A plain-language guide to every number i do shows you each morning.",
    body: [
      {
        p: "i do turns the signals from your ring into eight skin scores. None of them is a medical reading — they are a way to see patterns and act on them. Here is what each one means.",
      },
      { h: "The radiance scores" },
      {
        p: "Glow is your overall radiance in a single number. Barrier reflects how well your skin is holding moisture and defending itself. Collagen Protection tracks the conditions for firmness and bounce over time.",
      },
      { h: "The risk scores" },
      {
        p: "Inflammation Risk, Acne Trigger and Pigmentation Risk are early-warning numbers — lower is better. They rise before problems show on the surface, so you can adjust in time. Hair Vitality and Skin Age round out the picture.",
      },
    ],
  },
  {
    slug: "glow-plate",
    tag: "Nutrition",
    read: "4 min",
    glyphWord: "Glow",
    title: "Protein First: Building a Glow-Friendly Plate",
    dek: "What you eat shows up on your skin. Here is how to build a plate that works for it.",
    body: [
      {
        p: "Skin is a fast-renewing organ, and it draws on what you eat to rebuild. A glow-friendly plate is less about restriction and more about what you add first.",
      },
      { h: "The order that helps" },
      {
        p: "Start with protein, add colour from vegetables and fruit for antioxidants, then round out with whole-grain carbohydrates and healthy fats. The protein-first habit steadies energy and supports collagen.",
      },
      {
        p: "In i do, the Nutrition tab nudges you toward the gaps — an evening snack rich in protein and antioxidants on a day your Glow score dipped, for instance.",
      },
    ],
  },
];
