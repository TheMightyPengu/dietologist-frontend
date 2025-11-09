/* ========== Types ========== */
export type ArticleCategory = "Ευεξία" | "Επιστήμη" | "Διατροφή" | "Συνταγές" | "Άλλο";
export type ContentBlock =
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type Article = {
  id: string;
  slug: string;
  title: string;
  imageUrl: string;
  category: ArticleCategory;
  excerpt: string;
  dateISO: string;         // e.g. "2025-10-15T00:00:00+02:00"
  readingMin: number;      // 5, 7, 9...
  tags: string[];          // e.g. ["#μεσογειακή", "#καθημερινότητα"]
  content: ContentBlock[]; // simple rich content
  published: boolean;
};

export type RecipeCategory =
  | "Πρωινό"
  | "Κυρίως"
  | "Σνακ"
  | "Ρόφημα"
  | "Γλυκό"
  | "Σαλάτα"
  | "Άλλο";

export type Recipe = {
  id: string;
  slug: string;
  title: string;
  hero: string;            // image URL
  category: RecipeCategory;
  minutes: number;         // preparation time
  rating?: number;         // optional (e.g., 4.5)
  ingredients: string[];
  steps: string[];         // keep it simple (optional in your UI)
  tags: string[];          // pills like “Meal prep”, “Αλμυρό”
  published: boolean;
};

/* ========== Mock storage (localStorage) ========== */
const KEY_ART = "api:blog:articles";
const KEY_REC = "api:blog:recipes";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const DEFAULT_ARTICLES: Article[] = [
  {
    id: "a-1",
    slug: "mesogeiaki-diatrofi-stin-praxi-apla-vimata",
    title: "Μεσογειακή διατροφή στην πράξη: απλά βήματα",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
    category: "Διατροφή",
    excerpt:
      "Πώς εφαρμόζουμε τη μεσογειακή διατροφή στην καθημερινότητα χωρίς υπερβολές.",
    dateISO: "2025-10-15T00:00:00+02:00",
    readingMin: 9,
    tags: ["#μεσογειακή", "#απλά-βήματα", "#καθημερινότητα"],
    content: [
      { type: "h3", text: "Πυλώνες" },
      {
        type: "p",
        text:
          "Έμφαση σε λαχανικά, φρούτα, όσπρια, δημητριακά ολικής και ελαιόλαδο.",
      },
      { type: "h3", text: "Σταδιακή υιοθέτηση" },
      { type: "ul", items: ["Μικρές αλλαγές", "Meal prep", "Ποιότητα λίπους"] },
      {
        type: "p",
        text:
          "Μικρά βήματα που διατηρούνται στον χρόνο φέρνουν το καλύτερο αποτέλεσμα.",
      },
    ],
    published: true,
  },
  {
    id: "a-2",
    slug: "posi-proteini-chreiazomaste-xoris-upervoles",
    title: "Πόση πρωτεΐνη χρειαζόμαστε πραγματικά χωρίς υπερβολές",
    imageUrl:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
    category: "Επιστήμη",
    excerpt:
      "Ξεδιαλύνουμε μύθους και προτείνουμε ρεαλιστικές ποσότητες πρωτεΐνης.",
    dateISO: "2025-10-07T00:00:00+02:00",
    readingMin: 8,
    tags: ["#πρωτεΐνη", "#μύθοι", "#πόσο"],
    content: [{ type: "p", text: "Περιεχόμενο άρθρου…" }],
    published: true,
  },
];

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: "r-1",
    slug: "spitika-kritsinia",
    title: "Σπιτικά Κριτσίνια",
    hero:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1600&auto=format&fit=crop",
    category: "Σνακ",
    minutes: 120,
    rating: 4.5,
    ingredients: [
      "αλεύρι ολικής",
      "αλεύρι για όλες τις χρήσεις",
      "ελαιόλαδο",
      "αλάτι",
      "σουσάμι",
    ],
    steps: ["Ανακατεύουμε τα υλικά", "Πλάθουμε", "Ψήνουμε"],
    tags: ["Αλμυρό", "Meal prep"],
    published: true,
  },
  {
    id: "r-2",
    slug: "cookies-amygdalou",
    title: "Cookies Αμυγδάλου",
    hero:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1600&auto=format&fit=crop",
    category: "Γλυκό",
    minutes: 30,
    rating: 4.8,
    ingredients: ["αμύγδαλο", "αλεύρι", "ζάχαρη", "βανίλια"],
    steps: ["Προθερμαίνουμε τον φούρνο", "Ανακατεύουμε", "Ψήνουμε 12-15’"],
    tags: ["Γρήγορο"],
    published: true,
  },
];

/* utils */
function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS<T>(key: string, value: T) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
}

/* ========== Articles API ========== */
export async function fetchArticles(): Promise<Article[]> {
  await delay(300);
  return readLS(KEY_ART, DEFAULT_ARTICLES);
}
export async function createArticle(input: Omit<Article, "id">): Promise<Article> {
  await delay(300);
  const all = readLS(KEY_ART, DEFAULT_ARTICLES);
  const id = `a-${Date.now().toString(36)}`;
  const row: Article = { id, ...input };
  writeLS(KEY_ART, [row, ...all]);
  return row;
}
export async function updateArticle(input: Article): Promise<Article> {
  await delay(300);
  const all = readLS(KEY_ART, DEFAULT_ARTICLES);
  const i = all.findIndex(a => a.id === input.id);
  if (i !== -1) all[i] = input;
  writeLS(KEY_ART, all);
  return input;
}
export async function deleteArticle(id: string): Promise<void> {
  await delay(300);
  writeLS(KEY_ART, readLS(KEY_ART, DEFAULT_ARTICLES).filter(a => a.id !== id));
}

/* ========== Recipes API ========== */
export async function fetchRecipes(): Promise<Recipe[]> {
  await delay(300);
  return readLS(KEY_REC, DEFAULT_RECIPES);
}
export async function createRecipe(input: Omit<Recipe, "id">): Promise<Recipe> {
  await delay(300);
  const all = readLS(KEY_REC, DEFAULT_RECIPES);
  const id = `r-${Date.now().toString(36)}`;
  const row: Recipe = { id, ...input };
  writeLS(KEY_REC, [row, ...all]);
  return row;
}
export async function updateRecipe(input: Recipe): Promise<Recipe> {
  await delay(300);
  const all = readLS(KEY_REC, DEFAULT_RECIPES);
  const i = all.findIndex(r => r.id === input.id);
  if (i !== -1) all[i] = input;
  writeLS(KEY_REC, all);
  return input;
}
export async function deleteRecipe(id: string): Promise<void> {
  await delay(300);
  writeLS(KEY_REC, readLS(KEY_REC, DEFAULT_RECIPES).filter(r => r.id !== id));
}
