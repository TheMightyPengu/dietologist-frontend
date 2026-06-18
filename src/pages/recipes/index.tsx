import Head from "next/head";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

// Αν το path του controller σου είναι αλλού, άλλαξέ το εδώ.
import { ArticlesApi, type ArticlesGetDto } from "@/api/ArticlesController";
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
export type Article = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  heading: string;
  content: string;
  image: string;
  publishedAt: string;
};

// -------------------- Labels (UI) --------------------
const SORT_OPTIONS = {
  new: "Νεότερα",
  az: "Αλφαβητικά (A–Z)",
} as const;

const PER_PAGE = 12;

// -------------------- Helpers --------------------
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

  if (!pages.includes(current)) {
    const insertAt = pages.indexOf("…");
    if (insertAt !== -1) pages.splice(insertAt, 0, current);
  }

  return pages;
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}
  const title = dto.title ?? "";

  return {
    id: dto.id,
    slug: `${toGreekSlug(title) || "article"}-${dto.id}`,
    title,
    subtitle: dto.subtitle ?? "",
    heading: dto.heading ?? "",
    content: dto.content ?? "",
    image: dto.imageUrl ?? "",
    publishedAt: dto.publishedAt ?? "",
  };
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

  const [articles, setArticles] = useState<Article[]>([]);
  const [fetchError, setFetchError] = useState<string>("");

  const [search, setSearch] = useState<string>((query.q as string) || "");
  const [cats, setCats] = useState<string[]>(arrFromQuery(query.cat));
  const [include, setInclude] = useState<string[]>(arrFromQuery(query.inc));
  const [time, setTime] = useState<string>((query.time as string) || "");
  const [sort, setSort] = useState<string>((query.sort as string) || "new");
  const [page, setPage] = useState<number>(Number(query.page || 1));

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftSearch, setDraftSearch] = useState(search);
  const [draftCats, setDraftCats] = useState<string[]>(cats);
  const [draftInclude, setDraftInclude] = useState<string[]>(include);
  const [draftTime, setDraftTime] = useState(time);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      try {
        setIsLoading(true);
        setFetchError("");

        const data = await ArticlesApi.list();

        if (!mounted) return;

        const mapped = Array.isArray(data) ? data.map(mapArticle) : [];
        setArticles(mapped);
      } catch (error) {
        if (!mounted) return;
        setArticles([]);
        setFetchError("Δεν ήταν δυνατή η φόρτωση των άρθρων.");
        console.error(error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadArticles();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSearch((query.q as string) || "");
    setCats(arrFromQuery(query.cat));
    setInclude(arrFromQuery(query.inc));
    setTime((query.time as string) || "");
    setSort((query.sort as string) || "new");
    setPage(Number(query.page || 1));
  }, [query.q, query.cat, query.inc, query.time, query.sort, query.page]);

  const categories = useMemo(
    () => uniq(articles.map((a) => a.heading).filter(Boolean)),
    [articles]
  );

  const filtered = useMemo(() => {
    let list = articles.slice();

    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(s) ||
          a.subtitle.toLowerCase().includes(s) ||
          a.heading.toLowerCase().includes(s) ||
          a.content.toLowerCase().includes(s)
      );
    }

    if (cats.length) {
      list = list.filter((a) => cats.includes(a.heading));
    }

    if (sort === "az") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list.sort(
        (a, b) =>
          Date.parse(b.publishedAt || "1970-01-01") -
          Date.parse(a.publishedAt || "1970-01-01")
      );
    }

    return list;
  }, [articles, search, cats, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageClamped = Math.min(totalPages, Math.max(1, page));
  const paged = filtered.slice(
    (pageClamped - 1) * PER_PAGE,
    pageClamped * PER_PAGE
  );

  function pushToUrl(next: {
    q: string;
    cat: string[];
    inc: string[];
    time: string;
    sort: string;
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
  }, [router.isReady, search, cats.join(","), include.join(","), time, sort, page, totalPages]);

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
    setFiltersOpen(true);
  }

  function applyDrawerFilters() {
    setSearch(draftSearch);
    setPage(1);
    setFiltersOpen(false);
  }

  const activeFilters = useMemo(() => {
    const parts: Array<{ key: string; label: string }> = [];

    if (search.trim()) {
      parts.push({ key: "q", label: `Αναζήτηση: ${search.trim()}` });
    }

    return parts;
  }, [search]);

  return (
    <>
      <Head>
        <title>Άρθρα — NutriClinic</title>
        <meta
          name="description"
          content="Αναζήτηση άρθρων και συμβουλών."
        />
        <link rel="canonical" href="https://example.gr/recipes" />
      </Head>

      <main className="bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
          <header className="py-6">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Άρθρα
            </h1>
            <p className="mt-2 text-slate-600">
              Αναζήτηση και ανακάλυψη άρθρων.
            </p>
          </header>

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
              {search.trim() ? (
                <span className="ml-1 inline-flex items-center rounded-full bg-primary text-white px-2 py-0.5 text-xs ring-1 ring-primary">
                  1
                </span>
              ) : null}
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
              </select>
            </div>
          </div>

          <section className="grid gap-8 md:grid-cols-12">
            <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6">
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
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-2 py-1"
                      )}
                    >
                      Καθαρισμός
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
                        placeholder="τίτλος, υπότιτλος…"
                      />
                    </div>
                  </div>
                </SectionCard>
              )}
            </aside>

            <div className="md:col-span-8 lg:col-span-9">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-slate-600">
                    Βρέθηκαν{" "}
                    <span className="font-semibold text-slate-900">
                      {filtered.length}
                    </span>{" "}
                    άρθρα
                  </div>

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
                  </select>
                </div>
              </div>

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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                  {paged.map((a) => {
                    const hasImage = Boolean(a.image);

                    return (
                      <Link
                        key={a.id}
                        href={`/recipes/${a.slug}`}
                        className={classNames(
                          "group relative flex flex-col overflow-hidden rounded-2xl",
                          "bg-white/90 ring-1 ring-black/5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]",
                          "transition will-change-transform",
                          "hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] hover:ring-black/10",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        )}
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          {hasImage ? (
                            <Image
                              src={a.image.startsWith("/media") ? toMediaUrl(a.image) : a.image}
                              alt={a.title}
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
                        </div>

                        <div className="flex flex-col p-4 gap-3 flex-1">
                          <div className="min-h-[2.75rem]">
                            <div className="font-semibold leading-snug line-clamp-2 text-slate-900">
                              {a.title}
                            </div>
                          </div>

                          {a.subtitle && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {a.subtitle}
                            </p>
                          )}

                          {a.heading && (
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {a.heading}
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
                      placeholder="τίτλος, υπότιτλος…"
                    />
                  </SectionCard>
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 border-t border-black/5 bg-white">
                <div className="mx-auto max-w-6xl px-4 py-3 flex gap-3">
                  <button
                    onClick={() => {
                      setDraftSearch("");
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
        Δεν βρέθηκαν άρθρα
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