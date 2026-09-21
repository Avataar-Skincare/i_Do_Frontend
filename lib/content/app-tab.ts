export const NAV_TABS: Array<{ key: string; label: string; icon: "home" | "spark" | "chat" | "moon" | "people" }> = [
  { key: "home", label: "Home", icon: "home" },
  { key: "scores", label: "Scores", icon: "spark" },
  { key: "coach", label: "Coach", icon: "chat" },
  { key: "journey", label: "Journey", icon: "moon" },
  { key: "circle", label: "Circle", icon: "people" },
];

export const HOME_SCREEN = {
  greeting: "Afternoon, Sanvi.",
  date: "Wednesday 9 September",
  glowScore: 86,
  glowDelta: "0 vs yesterday",
  watchChips: ["Glow", "Barrier", "Skin Age", "Glow & Collagen climb"],
  cycleLabel: "Cycle day 9 · Follicular phase · Days 6–13",
  cycleNote: "Oestrogen rising — skin calmest, most resilient and collagen-supportive; highest active-tolerance.",
  lunaNote: "Your prescribed routine will appear here — it isn't set yet.",
};

/** The other six of the eight scores (Glow and Barrier already headline the Home screen). */
export const SCORES_SCREEN_KEYS = [
  "Inflammation Risk",
  "Acne Trigger",
  "Collagen Protection",
  "Pigmentation Risk",
  "Hair Vitality",
  "Skin Age vs Bio Age",
];

export const ROUTINE_SCREEN = {
  days: [
    { dow: "Sun", d: 6 },
    { dow: "Mon", d: 7 },
    { dow: "Tue", d: 8 },
    { dow: "Today", d: 9, active: true },
  ],
  streak: "1-day streak",
  status: "Just getting started",
  percent: 44,
  breakdown: [
    { label: "Topicals", value: "3 / 6" },
    { label: "Supplements", value: "1 / 3" },
    { label: "Treatment", value: "0 / 0" },
  ],
  summary: "4 done · 9 planned today",
  morning: [
    { name: "Vitamin C serum", note: "Before sunscreen", done: true },
    { name: "Sunscreen SPF 50", note: "Reapply midday", done: true },
    { name: "Ceramide moisturizer", note: "", done: true },
  ],
  evening: [
    { name: "Gentle AHA toner", note: "Three nights a week", done: false },
    { name: "Ceramide moisturiser", note: "On damp skin", done: false },
  ],
};

export const PLATE_SCREEN = {
  tabs: ["Daily", "Weekly", "Monthly"],
  weekLabel: "7–13 Sep",
  days: [
    { dow: "M", d: 7 },
    { dow: "T", d: 8 },
    { dow: "W", d: 9, active: true },
    { dow: "T", d: 10 },
    { dow: "F", d: 11 },
    { dow: "S", d: 12 },
    { dow: "S", d: 13 },
  ],
  badge: "2 meals logged",
  heading: "Welcome back, let's glow!",
  body: "It's great to see you back logging today! Your meals so far have been nutritious, and for your evening snack, let's focus on protein and antioxidants to support a brighter glow.",
  suggestionsLabel: "For your evening snack",
  suggestions: [
    { name: "Greek yogurt with berries", note: "Protein-rich for glow, antioxidants for skin." },
    { name: "Hard-boiled egg", note: "Easy protein boost for skin health." },
  ],
  calories: 370,
  calorieGoal: 1690,
  caloriesLeft: 1320,
};

export const CIRCLE_SCREEN = {
  articles: [
    { tag: "Sleep", title: "Social Jetlag: Why Monday Skin Looks Tired" },
    { tag: "Movement", title: "Face Massage + Movement: The De-Puff Duo" },
  ],
};

export const PHONE_CAPTIONS = [
  "Home · your Glow",
  "Scores · all eight",
  "Routine · AM/PM, kept",
  "Plate · eat for glow",
  "Circle · learn & share",
];

export const LUNA_FEATURES: Array<{ icon: "chat" | "list"; title: string; body: string }> = [
  { icon: "chat", title: "Ask anything", body: "“Why am I breaking out this week?” Luna answers in the context of your data." },
  { icon: "list", title: "Daily picks", body: "Three things to do today, ranked — never an overwhelming to-do list." },
];

export const AVAILABILITY_CHIPS: Array<{ label: string; icon: "check" | "lock" }> = [
  { label: "iOS 12+", icon: "check" },
  { label: "Android 5.0+", icon: "check" },
  { label: "Bluetooth 5.1", icon: "check" },
  { label: "Data on-device", icon: "lock" },
];
