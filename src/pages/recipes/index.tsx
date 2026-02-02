import Head from "next/head";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

/*
  Σελίδα λίστας συνταγών (UI στα ελληνικά).
  - Τα εσωτερικά keys (κατηγορίες/αλλεργιογόνα) παραμένουν αγγλικά για μελλοντικό API.
*/

// -------------------- Types --------------------
export type Category = "Breakfast" | "Main" | "Snack" | "Drink" | "Dessert" | "Salad";

export type Recipe = {
  id: number;
  slug: string;          // API/internal slug (EN)
  title: string;         // Used to derive Greek pretty slug for the UI
  category: Category;
  minutes: number;
  rating: number;
  tags: string[];
  allergensFree: string[]; // tokens π.χ. ["gluten", "dairy"]
  ingredients: string[];
  image: string;
  createdAt: string; // ISO για sort=new
};

// -------------------- Labels (UI) --------------------
const CATEGORY_LABELS: Record<Category, string> = {
  Breakfast: "Πρωινό",
  Main: "Κυρίως",
  Snack: "Σνακ",
  Drink: "Ρόφημα",
  Dessert: "Γλυκό",
  Salad: "Σαλάτα",
};

const CATEGORIES: Category[] = ["Breakfast", "Main", "Snack", "Drink", "Dessert", "Salad"] as const;

const ALLERGENS = ["gluten", "dairy", "egg", "soy", "peanut", "tree nut", "sesame"] as const;

const ALLERGEN_LABELS: Record<(typeof ALLERGENS)[number], string> = {
  gluten: "Γλουτένη",
  dairy: "Γαλακτοκομικά",
  egg: "Αυγό",
  soy: "Σόγια",
  peanut: "Φυστίκι",
  "tree nut": "Ξηροί καρποί",
  sesame: "Σουσάμι",
};

// -------------------- Data (demo) --------------------
const RECIPES: Recipe[] = [
  {
    id: 3001,
    slug: "strawberry-brownies",
    title: "Brownies Φράουλας",
    category: "Dessert",
    minutes: 60,
    rating: 4.7,
    tags: ["Σοκολάτα", "Φράουλα"],
    allergensFree: [],
    ingredients: [
      "φράουλες",
      "μέλι",
      "κακάο",
      "αλεύρι",
      "αυγά",
      "baking powder",
      "εκχύλισμα βανίλιας",
      "μαργαρίνη",
      "αλάτι",
      "κουβερτούρα",
      "γάλα",
    ],
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 3002,
    slug: "banana-bread",
    title: "Banana Bread",
    category: "Dessert",
    minutes: 60,
    rating: 4.8,
    tags: ["Ολικής", "Ξηροί καρποί"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "μπανάνες",
      "ζάχαρη καστανή",
      "χουρμαδόπαστα",
      "αυγά",
      "ελαιόλαδο",
      "χυμός πορτοκάλι",
      "γιαούρτι",
      "καρύδια",
      "αμύγδαλα",
      "μπέικιν πάουντερ",
      "κανέλα",
      "μοσχοκάρυδο",
      "γαρύφαλλο",
      "βανίλια",
    ],
    image:
      "https://images.unsplash.com/photo-1604335399105-a0c64b754bf1?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-02-01T09:30:00Z",
  },
  {
    id: 3003,
    slug: "chocolate-muffins",
    title: "Chocolate Muffins",
    category: "Dessert",
    minutes: 50,
    rating: 4.6,
    tags: ["Χωρίς ζάχαρη", "Βρώμη"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "βρώμη",
      "κακάο",
      "baking powder",
      "ξύσμα πορτοκαλιού",
      "βανίλια",
      "ελαιόλαδο",
      "χυμός πορτοκάλι",
      "πουρές μήλου",
      "γάλα",
      "χουρμάδες",
      "κουβερτούρα",
    ],
    image:
      "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-02-12T14:00:00Z",
  },
  {
    id: 3004,
    slug: "no-bake-cereal-bars",
    title: "Cereal Bars",
    category: "Snack",
    minutes: 60,
    rating: 4.4,
    tags: ["Χωρίς ψήσιμο", "Υγιεινό"],
    allergensFree: [],
    ingredients: [
      "νιφάδες βρώμης",
      "ξηροί καρποί",
      "χουρμαδόπαστα",
      "κακάο",
      "μέλι",
      "βανίλια",
      "πρωτεΐνη",
      "κουβερτούρα",
    ],
    image:
      "https://images.unsplash.com/photo-1559160580-55d1a6fd4ec4?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-03-05T11:15:00Z",
  },
  {
    id: 3005,
    slug: "carrot-cake",
    title: "Carrot Cake",
    category: "Dessert",
    minutes: 60,
    rating: 4.7,
    tags: ["Καρότο", "Ολικής"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "καρότα",
      "ζάχαρη καστανή",
      "χουρμαδόπαστα",
      "αυγά",
      "ελαιόλαδο",
      "γάλα",
      "γιαούρτι",
      "καρύδια",
      "αμύγδαλα",
      "μπέικιν πάουντερ",
      "κανέλα",
      "μοσχοκάρυδο",
      "γαρύφαλλο",
      "βανίλια",
      "αλάτι",
    ],
    image:
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b72?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-03-18T16:40:00Z",
  },
  {
    id: 3006,
    slug: "carrot-cake-frosting",
    title: "Carrot Cake Frosting (γιαούρτι & τυρί κρέμα)",
    category: "Dessert",
    minutes: 30,
    rating: 4.5,
    tags: ["Frosting", "Επικάλυψη"],
    allergensFree: [],
    ingredients: ["γιαούρτι", "τυρί κρέμα", "ξύσμα λεμονιού", "βανίλια"],
    image:
      "https://images.unsplash.com/photo-1601972599720-b82e67fce78b?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-03-18T17:00:00Z",
  },
  {
    id: 3007,
    slug: "apple-tart",
    title: "Μηλόπιτα Τάρτα",
    category: "Dessert",
    minutes: 80,
    rating: 4.6,
    tags: ["Τάρτα", "Μήλο"],
    allergensFree: [],
    ingredients: [
      "αλεύρι που φουσκώνει μόνο του",
      "αλεύρι ολικής",
      "μπέικιν πάουντερ",
      "αλάτι",
      "ελαιόλαδο",
      "χυμός πορτοκαλιού",
      "νερό",
      "μήλα",
      "κανέλα",
      "ζάχαρη",
    ],
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-04-02T12:20:00Z",
  },
  {
    id: 3008,
    slug: "raw-chocolate-bites",
    title: "Ωμά Σοκολατάκια",
    category: "Dessert",
    minutes: 30,
    rating: 4.3,
    tags: ["Χωρίς ψήσιμο", "Χουρμάδες"],
    allergensFree: [],
    ingredients: [
      "χουρμάδες",
      "βρώμη",
      "αμύγδαλα",
      "κακάο",
      "βανίλια",
      "μαύρη σοκολάτα",
    ],
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-04-20T08:10:00Z",
  },
  {
    id: 3009,
    slug: "almond-cookies",
    title: "Cookies Αμυγδάλου",
    category: "Dessert",
    minutes: 30,
    rating: 4.4,
    tags: ["Αμύγδαλο", "Γρήγορο"],
    allergensFree: [],
    ingredients: [
      "αλεύρι αμυγδάλου",
      "ινδική καρύδα",
      "σταγόνες σοκολάτας",
      "χουρμάδες",
      "baking powder",
      "βανίλια",
      "αλάτι",
      "ελαιόλαδο",
      "αυγό",
    ],
    image:
      "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-05-03T09:00:00Z",
  },
  {
    id: 3010,
    slug: "homemade-breadsticks",
    title: "Σπιτικά Κριτσίνια",
    category: "Snack",
    minutes: 120,
    rating: 4.5,
    tags: ["Αλμυρό", "Meal prep"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "αλεύρι για όλες τις χρήσεις",
      "ελαιόλαδο",
      "ρετσίνα",
      "μπέικιν",
      "αλάτι",
      "ζάχαρη",
      "σουσάμι",
      "ρίγανη",
      "βασιλικός",
      "ελιά",
      "καρότο",
      "φέτα",
    ],
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-06-10T13:45:00Z",
  },
];

// -------------------- Helpers --------------------
const PER_PAGE = 12;

function formatMin(m: number) {
  return m <= 60 ? `${m}′` : `${Math.floor(m / 60)} ώ ${m % 60}′`;
}

function stripGreekAccents(s: string) {
  // remove tonos/dialytika but keep letters
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ"); // final sigma → sigma for consistency
}
function toGreekSlug(s: string) {
  return stripGreekAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03FF\s-]/g, "") // allow greek letters
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function arrFromQuery(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap((s) => s.split(",").filter(Boolean));
  return v.split(",").filter(Boolean);
}
type QueryInputValue = string | number | string[] | undefined;

function setQuery(
  pathname: string,
  q: Record<string, QueryInputValue>
) {
  const query: Record<string, string | number> = {};

  Object.entries(q).forEach(([k, v]) => {
    if (v == null) return;

    if (Array.isArray(v)) {
      if (v.length) {
        query[k] = v.join(",");
      }
    } else if (v !== "" && !(typeof v === "number" && Number.isNaN(v))) {
      query[k] = v;
    }
  });

  return { pathname, query } as const;
}

// -------------------- UI Primitives --------------------
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

// -------------------- Page --------------------
export default function RecipesIndex() {
  const router = useRouter();
  const { query } = router;

  // Κρατάμε φίλτρα στο URL ώστε να είναι shareable
  const [search, setSearch] = useState<string>((query.q as string) || "");
  const [cats, setCats] = useState<string[]>(arrFromQuery(query.cat));
  const [free, setFree] = useState<string[]>(arrFromQuery(query.free));
  const [include, setInclude] = useState<string[]>(arrFromQuery(query.inc));
  const [exclude, setExclude] = useState<string[]>(arrFromQuery(query.exc));
  const [time, setTime] = useState<string>((query.time as string) || "");
  const [sort, setSort] = useState<string>((query.sort as string) || "new");
  const [page, setPage] = useState<number>(Number(query.page || 1));

  useEffect(() => {
    setSearch((query.q as string) || "");
    setCats(arrFromQuery(query.cat));
    setFree(arrFromQuery(query.free));
    setInclude(arrFromQuery(query.inc));
    setExclude(arrFromQuery(query.exc));
    setTime((query.time as string) || "");
    setSort((query.sort as string) || "new");
    setPage(Number(query.page || 1));
  }, [query.q, query.cat, query.free, query.inc, query.exc, query.time, query.sort, query.page]);

  const filtered = useMemo(() => {
    let list = RECIPES.slice();
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          r.ingredients.some((i) => i.toLowerCase().includes(s))
      );
    }
    if (cats.length) list = list.filter((r) => cats.includes(r.category));
    if (free.length) list = list.filter((r) => free.every((a) => r.allergensFree.includes(a)));
    if (include.length) list = list.filter((r) => include.every((i) => r.ingredients.includes(i)));
    if (exclude.length) list = list.filter((r) => exclude.every((i) => !r.ingredients.includes(i)));
    if (time) {
      list = list.filter((r) => {
        if (time === "t15") return r.minutes <= 15;
        if (time === "t30") return r.minutes > 15 && r.minutes <= 30;
        if (time === "t60") return r.minutes > 30 && r.minutes <= 60;
        if (time === "t61") return r.minutes > 60;
        return true;
      });
    }
    if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else list.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return list;
  }, [search, cats, free, include, exclude, time, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(totalPages, Math.max(1, page));
  const paged = filtered.slice((pageClamped - 1) * PER_PAGE, pageClamped * PER_PAGE);

  function applyFilters(nextPage = 1) {
    const dest = setQuery("/recipes", {
      q: search || undefined,
      cat: cats,
      free,
      inc: include,
      exc: exclude,
      time: time || undefined,
      sort,
      page: nextPage,
    });
    router.push(dest, undefined, { shallow: true });
  }

  useEffect(() => {
    applyFilters(pageClamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, cats.join(","), free.join(","), include.join(","), exclude.join(","), time, sort]);

  useEffect(() => {
    applyFilters(pageClamped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageClamped]);

  return (
    <>
      <Head>
        <title>Συνταγές — NutriClinic</title>
        <meta
          name="description"
          content="Αναζήτηση και φιλτράρισμα συνταγών (demo) — όλα στα ελληνικά."
        />
        <link rel="canonical" href="https://example.gr/recipes" />
      </Head>

      <main className="bg-[#fcfcfa] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
          <header className="py-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Συνταγές</h1>
            <p className="mt-2 text-slate-600">
              Demo σελίδα με αναζήτηση, φίλτρα, ταξινόμηση και σελιδοποίηση.
            </p>
          </header>

          <section className="grid gap-8 md:grid-cols-12">
            {/* Filters */}
            <aside className="md:col-span-4 lg:col-span-3 space-y-6">
              {/* Search */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="text-sm font-medium mb-2">Αναζήτηση</div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters(1)}
                  placeholder="όνομα ή υλικό…"
                  className="w-full rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>

              {/* Categories */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="text-sm font-medium mb-2">Κατηγορία</div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <label key={c} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300"
                        checked={cats.includes(c)}
                        onChange={(e) =>
                          setCats((prev) =>
                            e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                          )
                        }
                      />
                      <span>{CATEGORY_LABELS[c]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time to make */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="text-sm font-medium mb-2">Χρόνος προετοιμασίας</div>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Όλοι</option>
                  <option value="t15">≤ 15 λεπτά</option>
                  <option value="t30">15–30 λεπτά</option>
                  <option value="t60">30–60 λεπτά</option>
                  <option value="t61">&gt; 60 λεπτά</option>
                </select>
              </div>

              {/* Allergens free */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="text-sm font-medium mb-2">Χωρίς</div>
                <div className="flex flex-wrap gap-2">
                  {ALLERGENS.map((a) => (
                    <button
                      key={a}
                      onClick={() =>
                        setFree((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
                      }
                      className={`px-3 py-1 rounded-full text-xs ring-1 ${
                        free.includes(a)
                          ? "bg-sky-600 text-white ring-sky-600"
                          : "bg-sky-50 text-sky-700 ring-sky-200"
                      }`}
                    >
                      {ALLERGEN_LABELS[a]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include / Exclude ingredients */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Να περιέχει</div>
                  <TagInput value={include} setValue={setInclude} placeholder="π.χ. βρώμη, σοκολάτα" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Να μην περιέχει</div>
                  <TagInput value={exclude} setValue={setExclude} placeholder="π.χ. φιστίκι, γλουτένη" />
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="md:col-span-8 lg:col-span-9">
              {/* Sort + count */}
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Βρέθηκαν <span className="font-semibold text-slate-900">{filtered.length}</span> συνταγές
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Ταξινόμηση:</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="new">Νεότερα</option>
                    <option value="az">Αλφαβητικά (A–Z)</option>
                    <option value="rating">Βαθμολογία</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paged.map((r, idx) => {
                  const pretty = toGreekSlug(r.title);
                  return (
                    <Link
                      key={r.id}
                      href={{ pathname: "/recipes/[slug]", query: { slug: r.slug } }} // real route uses API slug
                      as={`/recipes/${pretty}`} // UI shows Greek pretty slug
                      className={`group rounded-2xl ${idx === 0 ? 'ring-2 ring-warm/50 hover:shadow-[0_10px_25px_rgba(255,230,150,0.12)]' : 'ring-1 ring-black/5'} bg-white/90 p-3 shadow-sm hover:shadow transition flex flex-col`}
                    >
                      <div className="relative overflow-hidden rounded-xl">
                        <Image
                          src={r.image}
                          alt={r.title}
                          className="h-44 w-full object-cover group-hover:scale-[1.02] transition"
                        />
                        <div className={`absolute top-2 left-2 inline-flex items-center gap-2 rounded-full ${idx === 0 ? 'bg-warm/90 text-slate-800' : 'bg-white/90 text-slate-700'} px-3 py-1 text-xs ring-1 ${idx === 0 ? 'ring-warm/40' : 'ring-black/5'}`}>
                          <ClockIcon /> {formatMin(r.minutes)}
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-warm/30 border border-warm/60 px-2.5 py-1 text-xs font-medium text-slate-800">
                            ✨ Δημοφιλής
                          </span>
                        )}
                      </div>
                      <div className="pt-3 flex flex-col flex-grow">
                        <div className="font-medium leading-snug line-clamp-2">{r.title}</div>
                        <div className="text-xs text-slate-600 mt-1">{CATEGORY_LABELS[r.category]}</div>
                        <div className="flex flex-wrap gap-2 mt-auto pt-1">
                          {r.tags.slice(0, 2).map((t) => (
                            <Chip key={t}>{t}</Chip>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="px-3 py-2 text-sm rounded-xl ring-1 ring-slate-200 bg-white disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageClamped === 1}
                >
                  Προηγούμενη
                </button>
                <div className="text-sm">
                  Σελίδα <span className="font-semibold">{pageClamped}</span> από {totalPages}
                </div>
                <button
                  className="px-3 py-2 text-sm rounded-xl ring-1 ring-slate-200 bg-white disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={pageClamped === totalPages}
                >
                  Επόμενη
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

// -------------------- Small components --------------------
function TagInput({
  value,
  setValue,
  placeholder,
}: {
  value: string[];
  setValue: (v: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  function addTagFromText() {
    const parts = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const v = Array.from(new Set([...value, ...parts]));
    setValue(v);
    setText("");
  }
  return (
    <div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addTagFromText();
          }}
          placeholder={placeholder}
          className="w-full rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
        <button onClick={addTagFromText} className="rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm">
          Προσθήκη
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 ring-1 ring-slate-200 px-3 py-1 text-xs"
            >
              {t}
              <button onClick={() => setValue(value.filter((x) => x !== t))} className="text-slate-500">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
