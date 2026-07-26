/* Keyword → category rules for auto-categorization.
   Mirrors the frontend live suggestion in ExpenseModal. Used server-side when a
   request reaches the API without a category (non-UI clients, bulk imports).

   Easy to extend: just add a `'keyword': 'Category'` line under the right group.
   Categories are the app's fixed set: Food, Grocery, Shopping, Travel, Other.
   Keep keywords distinctive (avoid 2–3 letter tokens) — matching is substring-based. */
const KEYWORD_CATEGORY: Record<string, string> = {
  /* ── Food & dining ── */
  swiggy: 'Food', zomato: 'Food', dominos: 'Food', "domino's": 'Food', 'burger king': 'Food',
  kfc: 'Food', mcdonalds: 'Food', "mcdonald's": 'Food', subway: 'Food', starbucks: 'Food',
  dunkin: 'Food', 'pizza hut': 'Food', faasos: 'Food', behrouz: 'Food', chaayos: 'Food',
  haldiram: 'Food', 'barbeque nation': 'Food', 'cafe coffee day': 'Food', 'wow momo': 'Food',
  eatsure: 'Food', 'third wave': 'Food',

  /* ── Grocery ── */
  bigbasket: 'Grocery', blinkit: 'Grocery', zepto: 'Grocery', dmart: 'Grocery', 'd-mart': 'Grocery',
  instamart: 'Grocery', grofers: 'Grocery', 'reliance fresh': 'Grocery', jiomart: 'Grocery',
  'more supermarket': 'Grocery', spencer: 'Grocery', licious: 'Grocery', 'country delight': 'Grocery',
  milkbasket: 'Grocery', 'nature basket': 'Grocery',

  /* ── Shopping ── */
  amazon: 'Shopping', flipkart: 'Shopping', myntra: 'Shopping', ajio: 'Shopping', nykaa: 'Shopping',
  meesho: 'Shopping', snapdeal: 'Shopping', tatacliq: 'Shopping', croma: 'Shopping',
  'reliance digital': 'Shopping', decathlon: 'Shopping', ikea: 'Shopping', lenskart: 'Shopping',
  firstcry: 'Shopping', pepperfry: 'Shopping', 'urban ladder': 'Shopping',

  /* ── Travel & transport ── */
  irctc: 'Travel', ola: 'Travel', uber: 'Travel', rapido: 'Travel', redbus: 'Travel',
  makemytrip: 'Travel', goibibo: 'Travel', yatra: 'Travel', cleartrip: 'Travel', ixigo: 'Travel',
  indigo: 'Travel', 'air india': 'Travel', vistara: 'Travel', spicejet: 'Travel', akasa: 'Travel',
  oyo: 'Travel', airbnb: 'Travel', 'indian oil': 'Travel', 'hp petrol': 'Travel',
  'bharat petroleum': 'Travel',

  /* ── Entertainment, subscriptions & utilities → Other
       (the app has no dedicated Entertainment category, so these fall under Other) ── */
  netflix: 'Other', spotify: 'Other', hotstar: 'Other', youtube: 'Other', 'disney+': 'Other',
  'prime video': 'Other', jiocinema: 'Other', 'sony liv': 'Other', zee5: 'Other',
  bookmyshow: 'Other', airtel: 'Other', vodafone: 'Other', 'act fibernet': 'Other',
};

export function inferCategory(text: string): string {
  const lower = text.toLowerCase();
  const match = Object.entries(KEYWORD_CATEGORY).find(([keyword]) => lower.includes(keyword));
  return match?.[1] ?? 'Other';
}
