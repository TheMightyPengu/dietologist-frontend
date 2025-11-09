export type EbookFeature = { id: string; title: string; desc: string };

export type Ebook = {
  id: string;
  coverUrl: string;
  title: string;        // e.g. "Καθημερινή Διατροφή στην Πράξη"
  subtitle?: string;    // short sub-headline under EBOOK heading
  description: string;  // small paragraph under title
  pages: number;        // 148
  format: string;       // "PDF", "EPUB", etc.
  lastUpdatedISO: string; // "2025-10-10T00:00:00+02:00"
  priceEuro: number;    // 12
  previewUrl: string;   // link to preview
  buyUrl: string;       // link to purchase
  buyCta?: string;      // default: "Αγορά"
  previewCta?: string;  // default: "Προεπισκόπηση"
  features: EbookFeature[];  // the three white cards (title + desc)
  contents: string[];   // bullet list “Τι θα βρείτε μέσα”
  published: boolean;
};

const KEY = "api:ebooks";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const DEFAULTS: Ebook[] = [
  {
    id: "eb-1",
    coverUrl:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1600&auto=format&fit=crop",
    title: "Καθημερινή Διατροφή στην Πράξη",
    subtitle: "",
    description:
      "Ένας πρακτικός οδηγός με έτοιμα templates, λίστες, και απλές μεθόδους εφαρμογής.",
    pages: 148,
    format: "PDF",
    lastUpdatedISO: "2025-10-10T00:00:00+02:00",
    priceEuro: 12,
    previewUrl: "/files/ebook-sample.pdf",
    buyUrl: "/contact#ebook",
    buyCta: "Αγορά",
    previewCta: "Προεπισκόπηση",
    features: [
      { id: "f1", title: "Πρακτικά Templates", desc: "Έτοιμα φύλλα για μενού, λίστες αγορών και οργάνωση εβδομάδας." },
      { id: "f2", title: "Εστίαση στην Πράξη", desc: "Κανένα «μαγικό» μυστικό—μόνο βήματα που εφαρμόζονται εύκολα." },
      { id: "f3", title: "Επιστημονικά Τεκμηριωμένο", desc: "Σαφείς αναφορές και καθαρές οδηγίες όπου χρειάζεται." },
    ],
    contents: [
      "Εισαγωγή: Τι σημαίνει «στην πράξη»",
      "Στήσιμο πιάτου & βασικές αρχές",
      "Meal prep & λίστες αγορών",
      "Διαχείριση ενέργειας & κορεσμού",
      "Mindful Eating & συνήθειες",
      "Συχνές ερωτήσεις",
    ],
    published: true,
  },
];

function readLS(): Ebook[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Ebook[]) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}
function writeLS(all: Ebook[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(all));
}

/** API-like methods — swap to real fetch later with same signatures */
export async function fetchEbooks(): Promise<Ebook[]> {
  await delay(300);
  return readLS();
}
export async function createEbook(input: Omit<Ebook, "id">): Promise<Ebook> {
  await delay(300);
  const all = readLS();
  const id = `eb-${Date.now().toString(36)}`;
  const eb: Ebook = { id, ...input };
  all.unshift(eb);
  writeLS(all);
  return eb;
}
export async function updateEbook(input: Ebook): Promise<Ebook> {
  await delay(300);
  const all = readLS();
  const i = all.findIndex(e => e.id === input.id);
  if (i !== -1) all[i] = input;
  writeLS(all);
  return input;
}
export async function deleteEbook(id: string): Promise<void> {
  await delay(300);
  writeLS(readLS().filter(e => e.id !== id));
}
