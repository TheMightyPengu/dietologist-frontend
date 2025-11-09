export type SeminarMode = "online" | "in_person";

export type Seminar = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  mode: SeminarMode;             // "online" | "in_person"
  dateISO: string;               // e.g. "2025-12-12T17:00:00+02:00"
  durationMin: number;           // 60, 75, 90...
  priceEuro: number | null;      // null => ΔΩΡΕΑΝ
  ctaLabel: string;              // "Κράτηση θέσης"
  ctaUrl: string;                // link to booking
  published: boolean;
};

const KEY = "api:seminars";
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const DEFAULTS: Seminar[] = [
  {
    id: "sem-1",
    title: "Διατροφή & Ενέργεια στην Καθημερινότητα",
    excerpt:
      "Πρακτικά βήματα για σταθερή ενέργεια, βελτίωση συγκέντρωσης και ισορροπία γευμάτων.",
    imageUrl:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?q=80&w=1600&auto=format&fit=crop",
    mode: "online",
    dateISO: "2025-12-12T17:00:00+02:00",
    durationMin: 90,
    priceEuro: 15,
    ctaLabel: "Κράτηση θέσης",
    ctaUrl: "/contact#booking",
    published: true,
  },
  {
    id: "sem-2",
    title: "Meal Prep για Απασχολημένους",
    excerpt:
      "Πώς οργανώνουμε εβδομαδιαία μενού, λίστες και συστήματα για εύκολη προετοιμασία.",
    imageUrl:
      "https://images.unsplash.com/photo-1505575972945-3347042b106b?q=80&w=1600&auto=format&fit=crop",
    mode: "in_person",
    dateISO: "2026-01-20T18:30:00+02:00",
    durationMin: 75,
    priceEuro: 20,
    ctaLabel: "Κράτηση θέσης",
    ctaUrl: "/contact#booking",
    published: true,
  },
  {
    id: "sem-3",
    title: "Mindful Eating: Απόλαυση χωρίς Ενοχές",
    excerpt:
      "Τεχνικές προσοχής και σήματα πείνας/κορεσμού για καλύτερη σχέση με το φαγητό.",
    imageUrl:
      "https://images.unsplash.com/photo-1558980664-10eaaffc9a89?q=80&w=1600&auto=format&fit=crop",
    mode: "online",
    dateISO: "2026-02-10T19:00:00+02:00",
    durationMin: 60,
    priceEuro: null, // ΔΩΡΕΑΝ
    ctaLabel: "Κράτηση θέσης",
    ctaUrl: "/contact#booking",
    published: true,
  },
];

function readLS(): Seminar[] {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Seminar[]) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}
function writeLS(all: Seminar[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(all));
}

/* -------- API-like methods (swap to real fetch later) -------- */
export async function fetchSeminars(): Promise<Seminar[]> {
  await delay(300);
  return readLS();
}
export async function createSeminar(input: Omit<Seminar, "id">): Promise<Seminar> {
  await delay(300);
  const all = readLS();
  const id = `sem-${Date.now().toString(36)}`;
  const sem: Seminar = { id, ...input };
  all.push(sem);
  writeLS(all);
  return sem;
}
export async function updateSeminar(input: Seminar): Promise<Seminar> {
  await delay(300);
  const all = readLS();
  const i = all.findIndex(s => s.id === input.id);
  if (i !== -1) all[i] = input;
  writeLS(all);
  return input;
}
export async function deleteSeminar(id: string): Promise<void> {
  await delay(300);
  writeLS(readLS().filter(s => s.id !== id));
}
