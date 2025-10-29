import Head from "next/head";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

/*
  Drop this file at: pages/recipes/index.tsx
  - Mimics Pick Up Limes listing UX with faceted filters
  - Dummy data + external photos for now
  - Uses query params so the URL is shareable (SSR/ISR can be added later)
  - No next/image (plain <img>)
*/

// -------------------- Dummy Data --------------------
export type Recipe = {
  id: number;
  slug: string;
  title: string;
  category: "Breakfast" | "Main" | "Snack" | "Drink" | "Dessert" | "Salad";
  minutes: number;
  rating: number;
  tags: string[];
  allergensFree: string[]; // e.g., ["gluten", "dairy"]
  ingredients: string[];
  image: string;
  createdAt: string; // ISO for sort=new
};

const RECIPES: Recipe[] = [
  {
    id: 1185,
    slug: "pumpkin-spice-oat-latte",
    title: "Pumpkin Spice Oat Latte",
    category: "Drink",
    minutes: 10,
    rating: 4.8,
    tags: ["10 ingredients or less", "No cook"],
    allergensFree: ["gluten", "egg", "dairy"],
    ingredients: ["oat milk", "espresso", "pumpkin", "maple", "vanilla"],
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1960&auto=format&fit=crop",
    createdAt: "2024-10-04T12:00:00Z",
  },
  {
    id: 1042,
    slug: "iced-vanilla-oat-latte",
    title: "Iced Vanilla Oat Latte",
    category: "Drink",
    minutes: 5,
    rating: 4.4,
    tags: ["No cook"],
    allergensFree: ["gluten", "egg"],
    ingredients: ["oat milk", "espresso", "vanilla", "ice"],
    image:
      "https://images.unsplash.com/photo-1494314671902-399b18174975?q=80&w=1887&auto=format&fit=crop",
    createdAt: "2024-08-16T08:00:00Z",
  },
  {
    id: 1179,
    slug: "spiced-chai-latte",
    title: "Spiced Chai Latte",
    category: "Drink",
    minutes: 12,
    rating: 4.9,
    tags: ["Vegetarian"],
    allergensFree: ["gluten", "egg"],
    ingredients: ["black tea", "spices", "milk", "sweetener"],
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2070&auto=format&fit=crop",
    createdAt: "2024-11-01T10:00:00Z",
  },
  {
    id: 912,
    slug: "creamy-matcha-latte",
    title: "Creamy Matcha Latte",
    category: "Drink",
    minutes: 7,
    rating: 4.6,
    tags: ["Vegan"],
    allergensFree: ["gluten", "egg", "dairy"],
    ingredients: ["matcha", "milk", "sweetener"],
    image:
      "https://images.unsplash.com/photo-1522844990619-4951c40f7eda?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2024-07-21T09:00:00Z",
  },
  {
    id: 1337,
    slug: "mediterranean-chickpea-salad",
    title: "Mediterranean Chickpea Salad",
    category: "Salad",
    minutes: 15,
    rating: 4.7,
    tags: ["Quick & Easy", "High fiber"],
    allergensFree: ["dairy", "egg"],
    ingredients: ["chickpeas", "tomato", "cucumber", "olive", "parsley"],
    image:
      "https://images.unsplash.com/photo-1568158879083-c428b8d17554?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2024-09-13T15:20:00Z",
  },
  {
    id: 2030,
    slug: "chocolate-avocado-mousse",
    title: "Chocolate Avocado Mousse",
    category: "Dessert",
    minutes: 8,
    rating: 4.5,
    tags: ["No cook", "5 ingredients"],
    allergensFree: ["gluten", "egg", "dairy"],
    ingredients: ["avocado", "cocoa", "maple", "vanilla"],
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2024-06-02T18:40:00Z",
  },
];

const CATEGORIES = ["Breakfast", "Main", "Snack", "Drink", "Dessert", "Salad"] as const;
const ALLERGENS = ["gluten", "dairy", "egg", "soy", "peanut", "tree nut", "sesame"] as const;

// -------------------- Helpers --------------------
const PER_PAGE = 12;
function formatMin(m: number) {
  return m <= 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
function arrFromQuery(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.flatMap((s) => s.split(",").filter(Boolean));
  return v.split(",").filter(Boolean);
}
function setQuery(router: ReturnType<typeof useRouter>["push"], pathname: string, q: Record<string, any>) {
  const query: Record<string, any> = {};
  Object.entries(q).forEach(([k, v]) => {
    if (v == null) return;
    if (Array.isArray(v)) {
      if (v.length) query[k] = v.join(",");
    } else if (v !== "" && !(typeof v === "number" && isNaN(v))) {
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
  const { pathname, query } = router;

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
    const dest = setQuery(router.push, pathname, {
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
        <meta name="description" content="Αναζήτηση και φιλτράρισμα συνταγών (demo)." />
        <link rel="canonical" href="https://example.gr/recipes" />
      </Head>

      <main className="bg-[#F7F7EF] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
          <header className="py-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Συνταγές</h1>
            <p className="mt-2 text-slate-600">Demo σελίδα με αναζήτηση, φίλτρα, ταξινόμηση και σελιδοποίηση.</p>
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
                          setCats((prev) => (e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)))
                        }
                      />
                      <span>{c}</span>
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
                  <option value="t61"> 60 λεπτά</option>
                </select>
              </div>

              {/* Allergens free */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="text-sm font-medium mb-2">Χωρίς (free from)</div>
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
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include / Exclude ingredients */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Να περιέχει</div>
                  <TagInput value={include} setValue={setInclude} placeholder="π.χ. oat milk, espresso" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Να μην περιέχει</div>
                  <TagInput value={exclude} setValue={setExclude} placeholder="π.χ. peanut, walnut" />
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
                {paged.map((r) => (
                  <Link
                    key={r.id}
                    href={
                      // When your dynamic detail page is ready, switch to `/recipes/${r.slug}-${r.id}`
                      "/recipes/demo"
                    }
                    className="group rounded-2xl bg-white/90 ring-1 ring-black/5 p-3 shadow-sm hover:shadow transition block"
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      <img src={r.image} alt={r.title} className="h-44 w-full object-cover group-hover:scale-[1.02] transition" />
                      <div className="absolute top-2 left-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-black/5">
                        <ClockIcon /> {formatMin(r.minutes)}
                      </div>
                    </div>
                    <div className="pt-3 space-y-1">
                      <div className="font-medium leading-snug line-clamp-2">{r.title}</div>
                      <div className="text-xs text-slate-600">{r.category}</div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {r.tags.slice(0, 2).map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
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
function TagInput({ value, setValue, placeholder }: { value: string[]; setValue: (v: string[]) => void; placeholder?: string; }) {
  const [text, setText] = useState("");
  function addTagFromText() {
    const parts = text.split(",").map((s) => s.trim()).filter(Boolean);
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
          onKeyDown={(e) => { if (e.key === "Enter") addTagFromText(); }}
          placeholder={placeholder}
          className="w-full rounded-xl ring-1 ring-slate-200 bg-white px-3 py-2 text-sm outline-none"
        />
        <button onClick={addTagFromText} className="rounded-xl bg-white ring-1 ring-slate-200 px-3 text-sm">Προσθήκη</button>
      </div>
      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {value.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-full bg-slate-100 ring-1 ring-slate-200 px-3 py-1 text-xs">
              {t}
              <button onClick={() => setValue(value.filter((x) => x !== t))} className="text-slate-500">×</button>
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
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
