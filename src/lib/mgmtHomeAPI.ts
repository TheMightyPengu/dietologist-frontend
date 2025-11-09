export type HomeContent = {
  heroImageUrl: string;
  welcomeTitle: string;
  welcomeParagraph: string;
  bioParagraph: string;
  philosophyParagraph: string;
};

export const DEFAULT_HOME: HomeContent = {
  heroImageUrl:
    "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
  welcomeTitle: "Καλώς ήρθατε!",
  welcomeParagraph:
    "Προσωποκεντρική προσέγγιση στη διατροφή με πρακτικές συμβουλές και ρεαλιστικούς στόχους.",
  bioParagraph:
    "Είμαι κλινική διαιτολόγος–διατροφολόγος. Μαζί χτίζουμε υγιεινές συνήθειες που ταιριάζουν στον ρυθμό της ζωής σας.",
  philosophyParagraph:
    "Ισορροπία, απόλαυση και βιωσιμότητα. Μικρά, σταθερά βήματα που φέρνουν αποτέλεσμα.",
};

const KEY = "api:home";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function fetchHomeContent(): Promise<HomeContent> {
  await delay(300); // simulate latency
  if (typeof window === "undefined") return DEFAULT_HOME;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_HOME, ...JSON.parse(raw) } : DEFAULT_HOME;
  } catch {
    return DEFAULT_HOME;
  }
}

export async function updateHomeContent(payload: HomeContent): Promise<HomeContent> {
  await delay(500); // simulate server work
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(payload));
  }
  return payload;
}
