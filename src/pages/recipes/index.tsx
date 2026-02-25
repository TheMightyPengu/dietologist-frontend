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
export type Category =
  | "Breakfast"
  | "Main"
  | "Snack"
  | "Drink"
  | "Dessert"
  | "Salad";

export type Recipe = {
  id: number;
  slug: string; // API/internal slug (EN)
  title: string; // Used to derive Greek pretty slug for the UI
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

const CATEGORIES: Category[] = [
  "Breakfast",
  "Main",
  "Snack",
  "Drink",
  "Dessert",
  "Salad",
] as const;

const ALLERGENS = [
  "gluten",
  "dairy",
  "egg",
  "soy",
  "peanut",
  "tree nut",
  "sesame",
] as const;

const ALLERGEN_LABELS: Record<(typeof ALLERGENS)[number], string> = {
  gluten: "Γλουτένη",
  dairy: "Γαλακτομικά",
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
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ");
}
function toGreekSlug(s: string) {
  return stripGreekAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03FF\s-]/g, "")
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

function setQuery(pathname: string, q: Record<string, QueryInputValue>) {
  const query: Record<string, string | number> = {};

  Object.entries(q).forEach(([k, v]) => {
    if (v == null) return;

    if (Array.isArray(v)) {
      if (v.length) query[k] = v.join(",");
    } else if (v !== "" && !(typeof v === "number" && Number.isNaN(v))) {
      query[k] = v;
    }
  });

  return { pathname, query } as const;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function paginateNumbers(totalPages: number, current: number) {
  const max = 7;
  if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: Array<number | "…"> = [];
  const showLeft = Math.max(2, current - 1);
  const showRight = Math.min(totalPages - 1, current + 1);

  pages.push(1);
  if (showLeft > 2) pages.push("…");
  for (let p = showLeft; p <= showRight; p++) pages.push(p);
  if (showRight < totalPages - 1) pages.push("…");
  pages.push(totalPages);

  // Ensure current is present (edge cases)
  if (!pages.includes(current)) {
    const insertAt = pages.indexOf("…");
    if (insertAt !== -1) pages.splice(insertAt, 0, current);
  }

  return pages;
}

// -------------------- UI Primitives --------------------
function Chip({
  children,
  tone = "soft",
}: {
  children: React.ReactNode;
  tone?: "soft" | "active" | "muted";
}) {
  const base =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 transition";
  const tones: Record<typeof tone, string> = {
    soft: "bg-accent/10 text-accent ring-accent/30",
    active: "bg-primary text-white ring-primary",
    muted: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  return <span className={classNames(base, tones[tone])}>{children}</span>;
}

function GlassBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        "bg-white/70 text-slate-800 ring-1 ring-black/10 backdrop-blur",
        "shadow-sm"
      )}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {right}
      </div>
      <div className="px-4 pb-4 pt-3">{children}</div>
    </div>
  );
}

// -------------------- Page --------------------
export default function RecipesIndex() {
  const router = useRouter();
  const { query } = router;

  // Applied state (URL-synced)
  const [search, setSearch] = useState<string>((query.q as string) || "");
  const [cats, setCats] = useState<string[]>(arrFromQuery(query.cat));
  const [free, setFree] = useState<string[]>(arrFromQuery(query.free));
  const [include, setInclude] = useState<string[]>(arrFromQuery(query.inc));
  const [exclude, setExclude] = useState<string[]>(arrFromQuery(query.exc));
  const [time, setTime] = useState<string>((query.time as string) || "");
  const [sort, setSort] = useState<string>((query.sort as string) || "new");
  const [page, setPage] = useState<number>(Number(query.page || 1));

  // Mobile drawer draft state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCats, setDraftCats] = useState<string[]>(cats);
  const [draftFree, setDraftFree] = useState<string[]>(free);
  const [draftInclude, setDraftInclude] = useState<string[]>(include);
  const [draftExclude, setDraftExclude] = useState<string[]>(exclude);
  const [draftTime, setDraftTime] = useState(time);

  const [isLoading, setIsLoading] = useState(false);

  // Sync from URL
  useEffect(() => {
    setSearch((query.q as string) || "");
    setCats(arrFromQuery(query.cat));
    setFree(arrFromQuery(query.free));
    setInclude(arrFromQuery(query.inc));
    setExclude(arrFromQuery(query.exc));
    setTime((query.time as string) || "");
    setSort((query.sort as string) || "new");
    setPage(Number(query.page || 1));
  }, [
    query.q,
    query.cat,
    query.free,
    query.inc,
    query.exc,
    query.time,
    query.sort,
    query.page,
  ]);

  // Fake loading (for skeletons) on query changes
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 220);
    return () => clearTimeout(t);
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
    if (free.length)
      list = list.filter((r) => free.every((a) => r.allergensFree.includes(a)));
    if (include.length)
      list = list.filter((r) => include.every((i) => r.ingredients.includes(i)));
    if (exclude.length)
      list = list.filter((r) => exclude.every((i) => !r.ingredients.includes(i)));

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
  const paged = filtered.slice(
    (pageClamped - 1) * PER_PAGE,
    pageClamped * PER_PAGE
  );

  function pushToUrl(next: {
    q: string;
    cat: string[];
    free: string[];
    inc: string[];
    exc: string[];
    time: string;
    sort: string;
    page: number;
  }) {
    const dest = setQuery("/recipes", {
      q: next.q || undefined,
      cat: next.cat,
      free: next.free,
      inc: next.inc,
      exc: next.exc,
      time: next.time || undefined,
      sort: next.sort,
      page: next.page,
    });
    router.push(dest, undefined, { shallow: true });
  }

  // When applied state changes, update URL (single place)
  useEffect(() => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    pushToUrl({
      q: search,
      cat: cats,
      free,
      inc: include,
      exc: exclude,
      time,
      sort,
      page: nextPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    cats.join(","),
    free.join(","),
    include.join(","),
    exclude.join(","),
    time,
    sort,
    page,
  ]);

  function clearAll() {
    setSearch("");
    setCats([]);
    setFree([]);
    setInclude([]);
    setExclude([]);
    setTime("");
    setSort("new");
    setPage(1);
  }

  function openFilters() {
    setDraftSearch(search);
    setDraftCats(cats);
    setDraftFree(free);
    setDraftInclude(include);
    setDraftExclude(exclude);
    setDraftTime(time);
    setFiltersOpen(true);
  }

  function applyDrawerFilters() {
    setSearch(draftSearch);
    setCats(draftCats);
    setFree(draftFree);
    setInclude(draftInclude);
    setExclude(draftExclude);
    setTime(draftTime);
    setPage(1);
    setFiltersOpen(false);
  }

  const activeFilters = useMemo(() => {
    const parts: Array<{ key: string; label: string }> = [];

    if (cats.length) {
      parts.push({
        key: "cat",
        label: `Κατηγορία: ${cats
          .map((c) => CATEGORY_LABELS[c as Category] ?? c)
          .join(", ")}`,
      });
    }
    if (free.length) {
      parts.push({
        key: "free",
        label: `Χωρίς: ${free.map((a) => ALLERGEN_LABELS[a as (typeof ALLERGENS)[number]] ?? a).join(", ")}`,
      });
    }
    if (time) {
      const t =
        time === "t15"
          ? "≤ 15′"
          : time === "t30"
          ? "15–30′"
          : time === "t60"
          ? "30–60′"
          : time === "t61"
          ? "> 60′"
          : "";
      if (t) parts.push({ key: "time", label: `Χρόνος: ${t}` });
    }
    if (include.length) parts.push({ key: "inc", label: `Να περιέχει: ${include.join(", ")}` });
    if (exclude.length) parts.push({ key: "exc", label: `Να μην περιέχει: ${exclude.join(", ")}` });
    if (search.trim()) parts.push({ key: "q", label: `Αναζήτηση: ${search.trim()}` });

    return parts;
  }, [cats, free, time, include, exclude, search]);

  const mobileActiveCount =
    cats.length + free.length + include.length + exclude.length + (time ? 1 : 0) + (search.trim() ? 1 : 0);

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

      <main className="bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
          <header className="py-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Συνταγές
            </h1>
            <p className="mt-2 text-slate-600">
              Demo σελίδα με αναζήτηση, φίλτρα, ταξινόμηση και σελιδοποίηση.
            </p>
          </header>

          {/* Mobile controls */}
          <div className="md:hidden mb-5 flex items-center justify-between gap-3">
            <button
              onClick={openFilters}
              className={classNames(
                "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                "bg-white/90 ring-1 ring-black/10 shadow-[0_10px_24px_rgba(15,23,42,0.06)]",
                "hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <FilterIcon />
              Φίλτρα
              {mobileActiveCount > 0 && (
                <span className="ml-1 inline-flex items-center rounded-full bg-primary text-white px-2 py-0.5 text-xs ring-1 ring-primary">
                  {mobileActiveCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Ταξινόμηση:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className={classNames(
                  "rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-800",
                  "ring-1 ring-black/10 shadow-sm",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
              >
                <option value="new">Νεότερα</option>
                <option value="az">Αλφαβητικά (A–Z)</option>
                <option value="rating">Βαθμολογία</option>
              </select>
            </div>
          </div>

          <section className="grid gap-8 md:grid-cols-12">
            {/* Filters (desktop) */}
            <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6">
              {isLoading ? (
                <SidebarSkeleton />
              ) : (
                <>
                  <SectionCard
                    title="Φίλτρα"
                    right={
                      <button
                        onClick={clearAll}
                        className={classNames(
                          "text-xs font-semibold text-primary",
                          "hover:text-primary/80 transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
                        )}
                      >
                        Καθαρισμός
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {/* Search */}
                      <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">
                          Αναζήτηση
                        </div>
                        <SearchInput
                          value={search}
                          onChange={(v) => {
                            setSearch(v);
                            setPage(1);
                          }}
                          placeholder="όνομα ή υλικό…"
                        />
                      </div>

                      {/* Categories */}
                      <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">
                          Κατηγορία
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {CATEGORIES.map((c) => {
                            const active = cats.includes(c);
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setPage(1);
                                  setCats((prev) =>
                                    prev.includes(c)
                                      ? prev.filter((x) => x !== c)
                                      : [...prev, c]
                                  );
                                }}
                                className={classNames(
                                  "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                                  active
                                    ? "bg-primary text-white ring-primary"
                                    : "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                )}
                              >
                                {CATEGORY_LABELS[c]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time */}
                      <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">
                          Χρόνος προετοιμασίας
                        </div>
                        <select
                          value={time}
                          onChange={(e) => {
                            setTime(e.target.value);
                            setPage(1);
                          }}
                          className={classNames(
                            "w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-800",
                            "ring-1 ring-black/10 shadow-sm",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          )}
                        >
                          <option value="">Όλοι</option>
                          <option value="t15">≤ 15 λεπτά</option>
                          <option value="t30">15–30 λεπτά</option>
                          <option value="t60">30–60 λεπτά</option>
                          <option value="t61">&gt; 60 λεπτά</option>
                        </select>
                      </div>

                      {/* Allergens free */}
                      <div>
                        <div className="text-xs font-semibold text-slate-700 mb-2">
                          Χωρίς
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ALLERGENS.map((a) => {
                            const active = free.includes(a);
                            return (
                              <button
                                key={a}
                                type="button"
                                onClick={() => {
                                  setPage(1);
                                  setFree((prev) =>
                                    prev.includes(a)
                                      ? prev.filter((x) => x !== a)
                                      : [...prev, a]
                                  );
                                }}
                                className={classNames(
                                  "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                                  active
                                    ? "bg-primary text-white ring-primary"
                                    : "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                )}
                              >
                                {ALLERGEN_LABELS[a]}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Include/Exclude */}
                      <div className="grid gap-4">
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-2">
                            Να περιέχει
                          </div>
                          <TagInput
                            value={include}
                            setValue={(v) => {
                              setInclude(v);
                              setPage(1);
                            }}
                            placeholder="π.χ. βρώμη, σοκολάτα"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-2">
                            Να μην περιέχει
                          </div>
                          <TagInput
                            value={exclude}
                            setValue={(v) => {
                              setExclude(v);
                              setPage(1);
                            }}
                            placeholder="π.χ. φιστίκι, γλουτένη"
                          />
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                </>
              )}
            </aside>

            {/* Results */}
            <div className="md:col-span-8 lg:col-span-9">
              {/* Header row aligned */}
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-slate-600">
                    Βρέθηκαν{" "}
                    <span className="font-semibold text-slate-900">
                      {filtered.length}
                    </span>{" "}
                    συνταγές
                  </div>

                  {/* Active filters summary */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {activeFilters.map((f) => (
                        <span
                          key={f.key}
                          className={classNames(
                            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
                            "bg-white/90 ring-1 ring-black/10 shadow-sm"
                          )}
                        >
                          <span className="text-slate-700">{f.label}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (f.key === "cat") setCats([]);
                              if (f.key === "free") setFree([]);
                              if (f.key === "time") setTime("");
                              if (f.key === "inc") setInclude([]);
                              if (f.key === "exc") setExclude([]);
                              if (f.key === "q") setSearch("");
                              setPage(1);
                            }}
                            className={classNames(
                              "inline-flex h-5 w-5 items-center justify-center rounded-full",
                              "text-slate-600 hover:text-slate-900 hover:bg-black/5 transition",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            )}
                            aria-label="Αφαίρεση φίλτρου"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={clearAll}
                        className={classNames(
                          "text-xs font-semibold text-primary",
                          "hover:text-primary/80 transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
                        )}
                      >
                        Καθαρισμός
                      </button>
                    </div>
                  )}
                </div>

                {/* Sort (desktop) */}
                <div className="hidden md:flex items-end gap-2">
                  <span className="text-sm text-slate-600 pb-2">
                    Ταξινόμηση:
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value);
                      setPage(1);
                    }}
                    className={classNames(
                      "rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-800",
                      "ring-1 ring-black/10 shadow-sm",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    <option value="new">Νεότερα</option>
                    <option value="az">Αλφαβητικά (A–Z)</option>
                    <option value="rating">Βαθμολογία</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {isLoading ? (
                <GridSkeleton />
              ) : filtered.length === 0 ? (
                <EmptyState onClear={clearAll} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                  {paged.map((r) => {
                    const pretty = toGreekSlug(r.title);
                    const hasImage = Boolean(r.image);

                    const shownTags = r.tags.slice(0, 3);
                    const extra = Math.max(0, r.tags.length - shownTags.length);

                    return (
                      <Link
                        key={r.id}
                        href={{ pathname: "/recipes/[slug]", query: { slug: r.slug } }}
                        as={`/recipes/${pretty}`}
                        className={classNames(
                          "group relative flex flex-col overflow-hidden rounded-2xl",
                          "bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]",
                          "transition will-change-transform",
                          "hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] hover:ring-black/10",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        )}
                      >
                        {/* Fixed aspect ratio image area */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          {hasImage ? (
                            <Image
                              src={r.image}
                              alt={r.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-warm/15">
                              <div className="absolute inset-0 grid place-items-center">
                                <div className="flex flex-col items-center gap-2 text-slate-600">
                                  <ImagePlaceholderIcon />
                                  <div className="text-xs font-medium">Χωρίς εικόνα</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Badges: consistent position + glass */}
                          <div className="absolute left-3 top-3">
                            <GlassBadge>
                              <ClockIcon />
                              {formatMin(r.minutes)}
                            </GlassBadge>
                          </div>
                        </div>

                        {/* Unified padding + spacing */}
                        <div className="flex flex-col p-4 gap-3 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <Chip tone="muted">{CATEGORY_LABELS[r.category]}</Chip>
                          </div>

                          <div className="min-h-[2.75rem]">
                            <div className="font-semibold leading-snug line-clamp-2 text-slate-900">
                              {r.title}
                            </div>
                          </div>

                          <div className="mt-auto flex flex-wrap gap-2 pt-1">
                            {shownTags.map((t) => (
                              <Chip key={t} tone="soft">
                                {t}
                              </Chip>
                            ))}
                            {extra > 0 && (
                              <Chip tone="muted">+{extra}</Chip>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {filtered.length > 0 && !isLoading && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    className={classNames(
                      "px-3 py-2 text-sm rounded-xl bg-white/90 ring-1 ring-black/10 shadow-sm transition",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      "hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={pageClamped === 1}
                  >
                    Προηγούμενη
                  </button>

                  <div className="hidden sm:flex items-center gap-2">
                    {paginateNumbers(totalPages, pageClamped).map((p, i) =>
                      p === "…" ? (
                        <span key={`dots-${i}`} className="px-2 text-slate-500">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={classNames(
                            "min-w-[40px] rounded-full px-3 py-2 text-sm ring-1 transition",
                            p === pageClamped
                              ? "bg-primary text-white ring-primary shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
                              : "bg-white/90 text-slate-700 ring-black/10 hover:bg-black/5",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <div className="sm:hidden text-sm text-slate-700 px-2">
                    <span className="font-semibold">{pageClamped}</span> / {totalPages}
                  </div>

                  <button
                    className={classNames(
                      "px-3 py-2 text-sm rounded-xl bg-white/90 ring-1 ring-black/10 shadow-sm transition",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      "hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={pageClamped === totalPages}
                  >
                    Επόμενη
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Mobile Filters Drawer */}
        {filtersOpen && (
          <div
            className="fixed inset-0 z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Φίλτρα"
          >
            <button
              className="absolute inset-0 bg-black/30"
              onClick={() => setFiltersOpen(false)}
              aria-label="Κλείσιμο"
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.18)]">
              <div className="mx-auto max-w-6xl px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-base font-semibold text-slate-900">
                    Φίλτρα
                  </div>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className={classNames(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full",
                      "bg-black/5 text-slate-700 hover:bg-black/10 transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                    aria-label="Κλείσιμο"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 space-y-4 overflow-auto pb-24 max-h-[70vh]">
                  <SectionCard
                    title="Αναζήτηση"
                    right={
                      draftSearch ? (
                        <button
                          onClick={() => setDraftSearch("")}
                          className={classNames(
                            "text-xs font-semibold text-primary",
                            "hover:text-primary/80 transition",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
                          )}
                        >
                          Καθαρισμός
                        </button>
                      ) : null
                    }
                  >
                    <SearchInput
                      value={draftSearch}
                      onChange={setDraftSearch}
                      placeholder="όνομα ή υλικό…"
                    />
                  </SectionCard>

                  <SectionCard title="Κατηγορία">
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((c) => {
                        const active = draftCats.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              setDraftCats((prev) =>
                                prev.includes(c)
                                  ? prev.filter((x) => x !== c)
                                  : [...prev, c]
                              )
                            }
                            className={classNames(
                              "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                              active
                                ? "bg-primary text-white ring-primary"
                                : "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            )}
                          >
                            {CATEGORY_LABELS[c]}
                          </button>
                        );
                      })}
                    </div>
                  </SectionCard>

                  <SectionCard title="Χρόνος προετοιμασίας">
                    <select
                      value={draftTime}
                      onChange={(e) => setDraftTime(e.target.value)}
                      className={classNames(
                        "w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-800",
                        "ring-1 ring-black/10 shadow-sm",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      )}
                    >
                      <option value="">Όλοι</option>
                      <option value="t15">≤ 15 λεπτά</option>
                      <option value="t30">15–30 λεπτά</option>
                      <option value="t60">30–60 λεπτά</option>
                      <option value="t61">&gt; 60 λεπτά</option>
                    </select>
                  </SectionCard>

                  <SectionCard title="Χωρίς">
                    <div className="flex flex-wrap gap-2">
                      {ALLERGENS.map((a) => {
                        const active = draftFree.includes(a);
                        return (
                          <button
                            key={a}
                            type="button"
                            onClick={() =>
                              setDraftFree((prev) =>
                                prev.includes(a)
                                  ? prev.filter((x) => x !== a)
                                  : [...prev, a]
                              )
                            }
                            className={classNames(
                              "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                              active
                                ? "bg-primary text-white ring-primary"
                                : "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            )}
                          >
                            {ALLERGEN_LABELS[a]}
                          </button>
                        );
                      })}
                    </div>
                  </SectionCard>

                  <SectionCard title="Να περιέχει">
                    <TagInput
                      value={draftInclude}
                      setValue={setDraftInclude}
                      placeholder="π.χ. βρώμη, σοκολάτα"
                    />
                  </SectionCard>

                  <SectionCard title="Να μην περιέχει">
                    <TagInput
                      value={draftExclude}
                      setValue={setDraftExclude}
                      placeholder="π.χ. φιστίκι, γλουτένη"
                    />
                  </SectionCard>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 border-t border-black/5 bg-white">
                <div className="mx-auto max-w-6xl px-4 py-3 flex gap-3">
                  <button
                    onClick={() => {
                      setDraftSearch("");
                      setDraftCats([]);
                      setDraftFree([]);
                      setDraftInclude([]);
                      setDraftExclude([]);
                      setDraftTime("");
                    }}
                    className={classNames(
                      "flex-1 rounded-xl px-4 py-3 text-sm font-semibold",
                      "bg-white ring-1 ring-black/10 shadow-sm",
                      "hover:bg-black/5 transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    Καθαρισμός
                  </button>
                  <button
                    onClick={applyDrawerFilters}
                    className={classNames(
                      "flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white",
                      "bg-primary shadow-[0_16px_34px_rgba(15,23,42,0.10)]",
                      "hover:opacity-95 transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    )}
                  >
                    Εφαρμογή
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

// -------------------- Small components --------------------
function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <SearchIcon />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={classNames(
          "w-full rounded-xl bg-white pl-9 pr-9 py-2 text-sm text-slate-800",
          "ring-1 ring-black/10 shadow-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={classNames(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "h-7 w-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-black/5 transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Καθαρισμός αναζήτησης"
        >
          ×
        </button>
      )}
    </div>
  );
}

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
    const v = uniq([...value, ...parts]);
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
          className={classNames(
            "w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-800",
            "ring-1 ring-black/10 shadow-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        />
        <button
          onClick={addTagFromText}
          className={classNames(
            "rounded-xl px-3 text-sm font-semibold",
            "bg-primary/10 text-primary ring-1 ring-primary/30",
            "hover:bg-primary/15 transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
        >
          Προσθήκη
        </button>
      </div>

      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((t) => (
            <span
              key={t}
              className={classNames(
                "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
                "bg-primary/10 text-primary ring-1 ring-primary/30"
              )}
            >
              {t}
              <button
                onClick={() => setValue(value.filter((x) => x !== t))}
                className={classNames(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full",
                  "text-primary/70 hover:text-primary hover:bg-primary/10 transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                )}
                aria-label="Αφαίρεση"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// -------------------- Skeletons / Empty --------------------
function SidebarSkeleton() {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] p-4">
      <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
      <div className="mt-4 space-y-3">
        <div className="h-10 w-full rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-7 w-24 rounded-full bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] overflow-hidden"
        >
          <div className="aspect-[16/10] bg-slate-200 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-6 w-20 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-7 w-16 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
              <div className="h-7 w-14 rounded-full bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <SearchIcon />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">
        Δεν βρέθηκαν συνταγές
      </h3>
      <p className="mt-2 text-sm text-slate-600">
        Δοκίμασε να αλλάξεις φίλτρα ή να καθαρίσεις τα κριτήρια αναζήτησης.
      </p>
      <button
        onClick={onClear}
        className={classNames(
          "mt-5 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
          "bg-primary text-white shadow-[0_16px_34px_rgba(15,23,42,0.10)]",
          "hover:opacity-95 transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        )}
      >
        Καθαρισμός φίλτρων
      </button>
    </div>
  );
}

// -------------------- Icons --------------------
function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 14.5 10.5 12l3 3 2-2.2 2.5 2.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.2a1.2 1.2 0 1 0 0 .01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}