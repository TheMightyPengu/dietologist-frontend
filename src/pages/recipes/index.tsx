import Head from "next/head";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

// Αν το path του controller σου είναι αλλού, άλλαξέ το εδώ.
import { RecipesApi, type RecipesGetDto } from "@/api/RecipesController";
import { toMediaUrl } from "@/api/_axios-client";

/*
  Σελίδα λίστας συνταγών συνδεδεμένη με backend.
  Χρησιμοποιούμε μόνο ό,τι υπάρχει στο backend:
  - title
  - ingredients
  - category
  - instructions
  - timeToPrepare
  - description
  - imageUrl
  - createdAt

  Δεν χρησιμοποιούμε πλέον:
  - rating
  - tags
  - allergensFree
  - exclude
*/

// -------------------- Types --------------------
export type Recipe = {
  id: number;
  slug: string;
  title: string;
  category: string;
  minutes: number;
  description: string;
  instructions: string;
  ingredients: string[];
  image: string;
  createdAt: string;
};

// -------------------- Labels (UI) --------------------
const CATEGORY_LABELS: Record<string, string> = {
  Breakfast: "Πρωινό",
  Main: "Κυρίως",
  Snack: "Σνακ",
  Drink: "Ρόφημα",
  Dessert: "Γλυκό",
  Salad: "Σαλάτα",
};

// -------------------- Helpers --------------------
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

function parseIngredients(value: string | null | undefined): string[] {
  const plain = stripHtml(value);

  if (!plain) return [];

  return plain
    .split(/[\n,;•]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function mapRecipe(dto: RecipesGetDto): Recipe {
  const title = dto.title ?? "";

  return {
    id: dto.id,
    slug: `${toGreekSlug(title) || "recipe"}-${dto.id}`,
    title,
    category: dto.category ?? "",
    minutes: dto.timeToPrepare ?? 0,
    description: dto.description ?? "",
    instructions: dto.instructions ?? "",
    ingredients: parseIngredients(dto.ingredients),
    image: dto.imageUrl ?? "",
    createdAt: dto.createdAt ?? "",
  };
}

function stripHtml(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PER_PAGE = 12;

type SortKey = "new" | "old" | "az" | "timeAsc" | "timeDesc";

function parseSortKey(value: string | string[] | undefined): SortKey {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (
    rawValue === "old" ||
    rawValue === "az" ||
    rawValue === "timeAsc" ||
    rawValue === "timeDesc"
  ) {
    return rawValue;
  }

  return "new";
}

// -------------------- Helpers --------------------
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

function resolveRecipeImage(image?: string | null): string {
  const value = image?.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return toMediaUrl(value);
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function paginateNumbers(totalPages: number, current: number) {
  const max = 7;
  if (totalPages <= max)
    return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: Array<number | "…"> = [];
  const showLeft = Math.max(2, current - 1);
  const showRight = Math.min(totalPages - 1, current + 1);

  pages.push(1);
  if (showLeft > 2) pages.push("…");
  for (let p = showLeft; p <= showRight; p++) pages.push(p);
  if (showRight < totalPages - 1) pages.push("…");
  pages.push(totalPages);

  if (!pages.includes(current)) {
    const insertAt = pages.indexOf("…");
    if (insertAt !== -1) pages.splice(insertAt, 0, current);
  }

  return pages;
}

// -------------------- UI Primitives --------------------
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

export default function RecipesIndex() {
  const router = useRouter();
  const { query } = router;

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fetchError, setFetchError] = useState<string>("");

  const [search, setSearch] = useState<string>((query.q as string) || "");
  const [cats, setCats] = useState<string[]>(arrFromQuery(query.cat));
  const [include, setInclude] = useState<string[]>(arrFromQuery(query.inc));
  const [time, setTime] = useState<string>((query.time as string) || "");
  const [sort, setSort] = useState<SortKey>(() => parseSortKey(query.sort));
  const [page, setPage] = useState<number>(Number(query.page || 1));

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCats, setDraftCats] = useState<string[]>(cats);
  const [draftInclude, setDraftInclude] = useState<string[]>(include);
  const [draftTime, setDraftTime] = useState(time);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRecipes() {
      try {
        setIsLoading(true);
        setFetchError("");

        const data = await RecipesApi.list();

        if (!mounted) return;

        const mapped = Array.isArray(data) ? data.map(mapRecipe) : [];
        setRecipes(mapped);
      } catch (error) {
        if (!mounted) return;
        setRecipes([]);
        setFetchError("Δεν ήταν δυνατή η φόρτωση των συνταγών.");
        console.error(error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadRecipes();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSearch((query.q as string) || "");
    setCats(arrFromQuery(query.cat));
    setInclude(arrFromQuery(query.inc));
    setTime((query.time as string) || "");
    setSort(parseSortKey(query.sort));
    setPage(Number(query.page || 1));
  }, [query.q, query.cat, query.inc, query.time, query.sort, query.page]);

  const categories = useMemo(
    () => uniq(recipes.map((r) => r.category).filter(Boolean)),
    [recipes],
  );

  const filtered = useMemo(() => {
    let list = recipes.slice();

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          stripHtml(r.description).toLowerCase().includes(s) ||
          r.ingredients.some((i) => i.toLowerCase().includes(s)),
      );
    }

    if (cats.length) {
      list = list.filter((r) => cats.includes(r.category));
    }

    if (include.length) {
      list = list.filter((r) =>
        include.every((wanted) =>
          r.ingredients.some((ing) =>
            ing.toLowerCase().includes(wanted.toLowerCase()),
          ),
        ),
      );
    }

    if (time) {
      list = list.filter((r) => {
        if (time === "t15") return r.minutes <= 15;
        if (time === "t30") return r.minutes > 15 && r.minutes <= 30;
        if (time === "t60") return r.minutes > 30 && r.minutes <= 60;
        if (time === "t61") return r.minutes > 60;
        return true;
      });
    }

    list.sort((a, b) => {
      const aCreatedAt = Date.parse(a.createdAt);
      const bCreatedAt = Date.parse(b.createdAt);

      const safeACreatedAt = Number.isNaN(aCreatedAt) ? 0 : aCreatedAt;

      const safeBCreatedAt = Number.isNaN(bCreatedAt) ? 0 : bCreatedAt;

      switch (sort) {
        case "old": {
          const difference = safeACreatedAt - safeBCreatedAt;

          return difference !== 0 ? difference : a.id - b.id;
        }

        case "az": {
          const difference = a.title.localeCompare(b.title, "el-GR", {
            sensitivity: "base",
          });

          return difference !== 0 ? difference : a.id - b.id;
        }

        case "timeAsc": {
          const difference = Number(a.minutes) - Number(b.minutes);

          if (difference !== 0) {
            return difference;
          }

          return a.title.localeCompare(b.title, "el-GR", {
            sensitivity: "base",
          });
        }

        case "timeDesc": {
          const difference = Number(b.minutes) - Number(a.minutes);

          if (difference !== 0) {
            return difference;
          }

          return a.title.localeCompare(b.title, "el-GR", {
            sensitivity: "base",
          });
        }

        case "new":
        default: {
          const difference = safeBCreatedAt - safeACreatedAt;

          return difference !== 0 ? difference : b.id - a.id;
        }
      }
    });

    return list;
  }, [recipes, search, cats, include, time, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(totalPages, Math.max(1, page));
  const paged = filtered.slice(
    (pageClamped - 1) * PER_PAGE,
    pageClamped * PER_PAGE,
  );

  function pushToUrl(next: {
    q: string;
    cat: string[];
    inc: string[];
    time: string;
    sort: SortKey;
    page: number;
  }) {
    const dest = setQuery("/recipes", {
      q: next.q || undefined,
      cat: next.cat,
      inc: next.inc,
      time: next.time || undefined,
      sort: next.sort,
      page: next.page,
    });

    router.push(dest, undefined, { shallow: true });
  }

  useEffect(() => {
    if (!router.isReady) return;

    const nextPage = Math.min(totalPages, Math.max(1, page));

    pushToUrl({
      q: search,
      cat: cats,
      inc: include,
      time,
      sort,
      page: nextPage,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    router.isReady,
    search,
    cats.join(","),
    include.join(","),
    time,
    sort,
    page,
    totalPages,
  ]);

  function clearAll() {
    setSearch("");
    setCats([]);
    setInclude([]);
    setTime("");
    setSort("new");
    setPage(1);
  }

  function openFilters() {
    setDraftSearch(search);
    setDraftCats(cats);
    setDraftInclude(include);
    setDraftTime(time);
    setFiltersOpen(true);
  }

  function applyDrawerFilters() {
    setSearch(draftSearch);
    setCats(draftCats);
    setInclude(draftInclude);
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
          .map((c) => CATEGORY_LABELS[c] ?? c)
          .join(", ")}`,
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

    if (include.length) {
      parts.push({ key: "inc", label: `Με: ${include.join(", ")}` });
    }

    if (search.trim()) {
      parts.push({ key: "q", label: `Αναζήτηση: ${search.trim()}` });
    }

    return parts;
  }, [cats, time, include, search]);

  const mobileActiveCount =
    cats.length + include.length + (time ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <>
      <Head>
        <title>Συνταγές — NutriClinic</title>
        <meta
          name="description"
          content="Αναζήτηση και φιλτράρισμα συνταγών."
        />
        <link rel="canonical" href="https://example.gr/recipes" />
      </Head>

      <main className="bg-bg text-slate-800">
        <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
          <header className="mb-7">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Συνταγές
            </h1>

            <p className="mt-2 text-slate-600">
              Αναζήτηση, φίλτρα, ταξινόμηση και σελιδοποίηση.
            </p>
          </header>

          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <button
              onClick={openFilters}
              className={classNames(
                "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                "bg-white/90 ring-1 ring-black/10 shadow-[0_10px_24px_rgba(15,23,42,0.06)]",
                "hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                  setSort(e.target.value as SortKey);
                  setPage(1);
                }}
                className={classNames(
                  "rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-800",
                  "ring-1 ring-black/10 shadow-sm",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                )}
              >
                <option value="new">Νεότερα</option>
                <option value="old">Παλαιότερα</option>
                <option value="az">Αλφαβητικά (Α–Ω)</option>
                <option value="timeAsc">Χρόνος: μικρότερος</option>
                <option value="timeDesc">Χρόνος: μεγαλύτερος</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden h-fit self-start space-y-6 lg:sticky lg:top-24 lg:block">
              {isLoading ? (
                <SidebarSkeleton />
              ) : (
                <SectionCard
                  title="Φίλτρα"
                  right={
                    <button
                      onClick={clearAll}
                      className={classNames(
                        "text-xs font-semibold text-primary",
                        "hover:text-primary/80 transition",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1",
                      )}
                    >
                      Καθαρισμός φίλτρων
                    </button>
                  }
                >
                  <div className="space-y-4">
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
                        placeholder="Αναζήτηση συνταγών…"
                      />
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        Κατηγορία
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((c) => {
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
                                    : [...prev, c],
                                );
                              }}
                              className={classNames(
                                "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                                active
                                  ? "bg-primary text-white ring-primary"
                                  : "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                              )}
                            >
                              {CATEGORY_LABELS[c] ?? c}
                            </button>
                          );
                        })}
                      </div>
                    </div>

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
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        )}
                      >
                        <option value="">Όλοι</option>
                        <option value="t15">≤ 15 λεπτά</option>
                        <option value="t30">15–30 λεπτά</option>
                        <option value="t60">30–60 λεπτά</option>
                        <option value="t61">&gt; 60 λεπτά</option>
                      </select>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-2">
                        Με
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
                  </div>
                </SectionCard>
              )}
            </aside>

            <div className="min-w-0">
              <div className="mb-4 flex min-h-10 items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Βρέθηκαν{" "}
                  <span className="font-semibold text-slate-900">
                    {filtered.length}
                  </span>{" "}
                  συνταγές
                </div>

                <div className="hidden items-center gap-2 lg:flex">
                  <span className="text-sm text-slate-600">Ταξινόμηση:</span>

                  <select
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value as SortKey);
                      setPage(1);
                    }}
                    className={classNames(
                      "rounded-xl bg-white/90 px-3 py-2 text-sm text-slate-800",
                      "ring-1 ring-black/10 shadow-sm",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    )}
                  >
                    <option value="new">Νεότερα</option>
                    <option value="old">Παλαιότερα</option>
                    <option value="az">Αλφαβητικά (Α–Ω)</option>
                    <option value="timeAsc">Χρόνος: μικρότερος</option>
                    <option value="timeDesc">Χρόνος: μεγαλύτερος</option>
                  </select>
                </div>
              </div>

              {activeFilters.length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.key}
                      className={classNames(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs",
                        "bg-white/90 ring-1 ring-black/10 shadow-sm",
                      )}
                    >
                      <span className="text-slate-700">{filter.label}</span>

                      <button
                        type="button"
                        onClick={() => {
                          if (filter.key === "cat") setCats([]);
                          if (filter.key === "time") setTime("");
                          if (filter.key === "inc") setInclude([]);
                          if (filter.key === "q") setSearch("");

                          setPage(1);
                        }}
                        className={classNames(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full",
                          "text-slate-600 transition hover:bg-black/5 hover:text-slate-900",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                      "rounded-lg px-2 py-1 text-xs font-semibold text-primary",
                      "transition hover:text-primary/80",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    )}
                  >
                    Καθαρισμός
                  </button>
                </div>
              )}

              {fetchError ? (
                <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] p-8 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Σφάλμα φόρτωσης
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{fetchError}</p>
                </div>
              ) : isLoading ? (
                <GridSkeleton />
              ) : filtered.length === 0 ? (
                <EmptyState onClear={clearAll} />
              ) : (
                <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paged.map((r) => {
                    // const pretty = toGreekSlug(r.title);
                    const imageUrl = resolveRecipeImage(r.image);
                    const hasImage = Boolean(imageUrl);
                    return (
                      <Link
                        key={r.id}
                        href={`/recipes/${r.slug}`}
                        className={classNames(
                          "group relative flex flex-col overflow-hidden rounded-2xl",
                          "bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]",
                          "transition will-change-transform",
                          "hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] hover:ring-black/10",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        )}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          {hasImage ? (
                            <Image
                              src={imageUrl}
                              alt={r.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                              unoptimized
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-warm/15">
                              <div className="absolute inset-0 grid place-items-center">
                                <div className="flex flex-col items-center gap-2 text-slate-600">
                                  <ImagePlaceholderIcon />
                                  <div className="text-xs font-medium">
                                    Χωρίς εικόνα
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="absolute left-3 top-3">
                            <GlassBadge>
                              <ClockIcon />
                              {formatMin(r.minutes)}
                            </GlassBadge>
                          </div>
                        </div>

                        <div className="flex flex-col p-4 gap-3 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <Chip tone="muted">
                              {CATEGORY_LABELS[r.category] ?? r.category}
                            </Chip>
                          </div>

                          <div className="min-h-[2.75rem]">
                            <div className="font-semibold leading-snug line-clamp-2 text-slate-900">
                              {r.title}
                            </div>
                          </div>

                          {stripHtml(r.description) && (
                            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                              {stripHtml(r.description)}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {filtered.length > 0 && !isLoading && !fetchError && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    className={classNames(
                      "px-3 py-2 text-sm rounded-xl bg-white/90 ring-1 ring-black/10 shadow-sm transition",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      "hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          )}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>

                  <div className="sm:hidden text-sm text-slate-700 px-2">
                    <span className="font-semibold">{pageClamped}</span> /{" "}
                    {totalPages}
                  </div>

                  <button
                    className={classNames(
                      "px-3 py-2 text-sm rounded-xl bg-white/90 ring-1 ring-black/10 shadow-sm transition",
                      "disabled:opacity-40 disabled:cursor-not-allowed",
                      "hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    )}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={pageClamped === totalPages}
                  >
                    Επόμενη
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

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
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1",
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
                      placeholder="όνομα, περιγραφή ή υλικό…"
                    />
                  </SectionCard>

                  <SectionCard title="Κατηγορία">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c) => {
                        const active = draftCats.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              setDraftCats((prev) =>
                                prev.includes(c)
                                  ? prev.filter((x) => x !== c)
                                  : [...prev, c],
                              )
                            }
                            className={classNames(
                              "rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
                              active
                                ? "bg-primary text-white ring-primary"
                                : "bg-primary/10 text-primary ring-primary/30 hover:bg-primary/15",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            )}
                          >
                            {CATEGORY_LABELS[c] ?? c}
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
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      )}
                    >
                      <option value="">Όλοι</option>
                      <option value="t15">≤ 15 λεπτά</option>
                      <option value="t30">15–30 λεπτά</option>
                      <option value="t60">30–60 λεπτά</option>
                      <option value="t61">&gt; 60 λεπτά</option>
                    </select>
                  </SectionCard>

                  <SectionCard title="Με">
                    <TagInput
                      value={draftInclude}
                      setValue={setDraftInclude}
                      placeholder="π.χ. βρώμη, σοκολάτα"
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
                      setDraftInclude([]);
                      setDraftTime("");
                    }}
                    className={classNames(
                      "flex-1 rounded-xl px-4 py-3 text-sm font-semibold",
                      "bg-white ring-1 ring-black/10 shadow-sm",
                      "hover:bg-black/5 transition",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
        "shadow-sm",
      )}
    >
      {children}
    </span>
  );
}

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
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className={classNames(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "h-7 w-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-black/5 transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
        />
        <button
          onClick={addTagFromText}
          className={classNames(
            "rounded-xl px-3 text-sm font-semibold",
            "bg-primary/10 text-primary ring-1 ring-primary/30",
            "hover:bg-primary/15 transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
                "bg-primary/10 text-primary ring-1 ring-primary/30",
              )}
            >
              {t}
              <button
                onClick={() => setValue(value.filter((x) => x !== t))}
                className={classNames(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full",
                  "text-primary/70 hover:text-primary hover:bg-primary/10 transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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

function SidebarSkeleton() {
  return (
    <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] p-4">
      <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
      <div className="mt-4 space-y-3">
        <div className="h-10 w-full rounded-xl bg-slate-200 animate-pulse" />
        <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 rounded-full bg-slate-200 animate-pulse"
            />
          ))}
        </div>
        <div className="h-3 w-32 rounded bg-slate-200 animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
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
