/* eslint-disable @typescript-eslint/no-unused-expressions */

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArticlesApi, type ArticlesGetDto } from "@/api/ArticlesController";
import { toMediaUrl } from "@/api/_axios-client";
import LeafBurstButton from "@/components/decorative/LeafBurstButton";

/**
 * ΑΡΘΡΑ — Κεντρική σελίδα καταλόγου
 * - Ελληνικό UI
 * - Εικονική "κλήση API" με dummy δεδομένα
 * - Sidebar φίλτρων (sticky σε desktop, drawer σε tablet/mobile)
 * - Πλέγμα καρτών ίσου ύψους με line-clamp
 * - Active filters chips πάνω από τα αποτελέσματα
 * - Range slider για χρόνο ανάγνωσης
 * - Presets + custom range για ημερομηνία
 * - Results count
 * - Load more + loading state + skeletons + empty state με reset
 */

// ---------------- Mock "API" ----------------
export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: "Διατροφή" | "Ευεξία" | "Συνταγές" | "Επιστήμη";
  dateISO: string;
  readMinutes: number;
  hero: string;
  tags: string[];
};

function slugifyArticle(title: string, id: number) {
  const base = (title || `article-${id}`)
    .toLowerCase()
    .trim()
    .replace(/ά/g, "α")
    .replace(/έ/g, "ε")
    .replace(/ή/g, "η")
    .replace(/ί/g, "ι")
    .replace(/ό/g, "ο")
    .replace(/ύ/g, "υ")
    .replace(/ώ/g, "ω")
    .replace(/ϊ|ΐ/g, "ι")
    .replace(/ϋ|ΰ/g, "υ")
    .replace(/ς/g, "σ")
    .replace(/[^a-z0-9α-ω\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${base || "article"}-${id}`;
}

function estimateReadMinutes(text: string) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mapArticleDtoToUi(dto: ArticlesGetDto): Article {
  return {
    id: dto.id,
    slug: slugifyArticle(dto.title, dto.id),

    title: dto.title,

    // Το backend δεν δίνει excerpt.
    // Μέχρι να προστεθεί, χρησιμοποιούμε subtitle ή μικρό κομμάτι από content.
    excerpt:
      dto.subtitle?.trim() ||
      dto.content?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      "",

    // Το backend δεν δίνει category.
    // Placeholder μέχρι να προστεθεί σχετικό πεδίο.
    category: "Διατροφή",

    dateISO: dto.publishedAt,

    // Το backend δεν δίνει readMinutes.
    // Πρόχειρος υπολογισμός από το content.
    readMinutes: estimateReadMinutes(dto.content),

    // Το backend δίνει imageUrl.
    // Fallback placeholder αν λείπει.
    hero:
      (dto.imageUrl ? toMediaUrl(dto.imageUrl) : null) ||
      "https://via.placeholder.com/1200x750?text=Article+Image",

    // Το backend δεν δίνει tags.
    // Placeholder μέχρι να προστεθούν.
    tags: [],
  };
}

// ---------------- Page ----------------
type Props = {
  articles?: Article[];
  categories?: string[];
  tags?: string[];
  minRead?: number;
  maxRead?: number;
};

export async function getServerSideProps() {
  try {
    const data = await ArticlesApi.list();
    const articles = data.map(mapArticleDtoToUi);

    const categories = Array.from(new Set(articles.map((a) => a.category)));
    const tags = Array.from(new Set(articles.flatMap((a) => a.tags))).sort((a, b) =>
      a.localeCompare(b, "el"),
    );

    const readMinutesAll = articles.map((a) => a.readMinutes);
    const minRead = readMinutesAll.length ? Math.min(...readMinutesAll) : 1;
    const maxRead = readMinutesAll.length ? Math.max(...readMinutesAll) : 10;

    return {
      props: {
        articles,
        categories,
        tags,
        minRead,
        maxRead,
      },
    };
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }

    return {
      props: {
        articles: [],
        categories: [],
        tags: [],
        minRead: 1,
        maxRead: 10,
      },
    };
  }
}

type SortKey = "newest" | "oldest" | "readAsc" | "readDesc";
type DatePreset = "all" | "30d" | "6m" | "12m" | "custom";

function formatDateISOToEl(iso: string) {
  return new Date(iso).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ArticlesIndex(props: Props) {
  const [articles, setArticles] = useState<Article[]>(props.articles ?? []);
  const [pageLoading, setPageLoading] = useState(!props.articles?.length);

  useEffect(() => {
    let active = true;

    async function loadArticles() {
      try {
        const data = await ArticlesApi.list();
        if (!active) return;
        const mapped = data.map(mapArticleDtoToUi);
        setArticles(mapped);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        if (!active) return;
        setArticles(props.articles ?? []);
      } finally {
        if (!active) return;
        setPageLoading(false);
      }
    }

    loadArticles();
    return () => { active = false; };
  }, [props.articles]);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.category))),
    [articles],
  );
  const tags = useMemo(
    () => Array.from(new Set(articles.flatMap((a) => a.tags))).sort((a, b) => a.localeCompare(b, "el")),
    [articles],
  );
  const readMinutesAll = useMemo(() => articles.map((a) => a.readMinutes), [articles]);
  const minRead = readMinutesAll.length ? Math.min(...readMinutesAll) : 1;
  const maxRead = readMinutesAll.length ? Math.max(...readMinutesAll) : 10;

  // Αναζήτηση
  const [query, setQuery] = useState("");

  // Κατηγορίες & Ετικέτες
  const [catSet, setCatSet] = useState<Set<string>>(new Set());
  const [tagSet, setTagSet] = useState<Set<string>>(new Set());

  // Mini search για ετικέτες
  const [tagQuery, setTagQuery] = useState("");

  // Χρόνος ανάγνωσης (range)
  const [readRange, setReadRange] = useState<[number, number]>([minRead, maxRead]);

  // Ημερομηνία
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [dateFrom, setDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>(""); // YYYY-MM-DD

  // Ταξινόμηση
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  // Responsive drawer
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Pagination / Load more
  const PAGE_SIZE = 9;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Loading / skeleton simulation
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    setReadRange([minRead, maxRead]);
  }, [minRead, maxRead]);

  // Helpers αλλαγών
  const toggleCat = (c: string) =>
    setCatSet((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const toggleTag = (t: string) =>
    setTagSet((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const resetAll = () => {
    setQuery("");
    setCatSet(new Set());
    setTagSet(new Set());
    setTagQuery("");
    setReadRange([minRead, maxRead]);
    setDatePreset("all");
    setDateFrom("");
    setDateTo("");
    setSortKey("newest");
    setVisibleCount(PAGE_SIZE);
  };

  // Φιλτραρισμένες ετικέτες στο sidebar
  const visibleTags = useMemo(() => {
    const q = tagQuery.trim().toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.toLowerCase().includes(q));
  }, [tags, tagQuery]);

  // Υπολογισμός φίλτρων & ταξινόμησης
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();

    const dateCutoff = (() => {
      if (datePreset === "all" || datePreset === "custom") return null;
      const d = new Date(now);
      if (datePreset === "30d") d.setDate(d.getDate() - 30);
      if (datePreset === "6m") d.setMonth(d.getMonth() - 6);
      if (datePreset === "12m") d.setFullYear(d.getFullYear() - 1);
      return d;
    })();

    const customFrom = datePreset === "custom" && dateFrom ? new Date(dateFrom) : null;
    const customTo = datePreset === "custom" && dateTo ? new Date(dateTo) : null;

    let list = articles.filter((a) => {
      // Αναζήτηση
      if (q) {
        const hay = (a.title + " " + a.excerpt + " " + a.tags.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Κατηγορίες
      if (catSet.size > 0 && !catSet.has(a.category)) return false;

      // Ετικέτες (OR)
      if (tagSet.size > 0) {
        const hasAny = a.tags.some((t) => tagSet.has(t));
        if (!hasAny) return false;
      }

      // Χρόνος ανάγνωσης
      if (a.readMinutes < readRange[0] || a.readMinutes > readRange[1]) return false;

      // Ημερομηνία
      const pub = new Date(a.dateISO);
      if (dateCutoff && pub < dateCutoff) return false;

      if (datePreset === "custom") {
        if (customFrom && pub < customFrom) return false;
        if (customTo) {
          const end = new Date(customTo);
          end.setHours(23, 59, 59, 999);
          if (pub > end) return false;
        }
      }

      return true;
    });

    // Ταξινόμηση
    list = list.sort((a, b) => {
      switch (sortKey) {
        case "newest": {
          const diff =
            new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
          return diff !== 0 ? diff : b.id - a.id;
        }

        case "oldest": {
          const diff =
            new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
          return diff !== 0 ? diff : a.id - b.id;
        }

        case "readAsc": {
          const diff = a.readMinutes - b.readMinutes;
          return diff !== 0 ? diff : a.id - b.id;
        }

        case "readDesc": {
          const diff = b.readMinutes - a.readMinutes;
          return diff !== 0 ? diff : b.id - a.id;
        }

        default:
          return 0;
      }
    });

    return list;
  }, [articles, query, catSet, tagSet, readRange, datePreset, dateFrom, dateTo, sortKey]);

  // Active filters chips
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    const q = query.trim();
    if (q) {
      chips.push({
        key: "q",
        label: `Αναζήτηση: “${q}”`,
        onRemove: () => setQuery(""),
      });
    }

    if (catSet.size > 0) {
      Array.from(catSet).forEach((c) => {
        chips.push({
          key: `cat:${c}`,
          label: c,
          onRemove: () => toggleCat(c),
        });
      });
    }

    if (tagSet.size > 0) {
      Array.from(tagSet).forEach((t) => {
        chips.push({
          key: `tag:${t}`,
          label: `#${t}`,
          onRemove: () => toggleTag(t),
        });
      });
    }

    if (!(readRange[0] === minRead && readRange[1] === maxRead)) {
      chips.push({
        key: "read",
        label: `Χρόνος: ${readRange[0]}–${readRange[1]}′`,
        onRemove: () => setReadRange([minRead, maxRead]),
      });
    }

    if (datePreset !== "all") {
      if (datePreset === "30d") {
        chips.push({ key: "date:30d", label: "Τελευταίος μήνας", onRemove: () => setDatePreset("all") });
      } else if (datePreset === "6m") {
        chips.push({ key: "date:6m", label: "Τελευταίο 6μηνο", onRemove: () => setDatePreset("all") });
      } else if (datePreset === "12m") {
        chips.push({ key: "date:12m", label: "Τελευταίος χρόνος", onRemove: () => setDatePreset("all") });
      } else if (datePreset === "custom") {
        const fromLabel = dateFrom ? formatDateISOToEl(dateFrom) : "—";
        const toLabel = dateTo ? formatDateISOToEl(dateTo) : "—";
        chips.push({
          key: "date:custom",
          label: `Ημερομηνία: ${fromLabel} → ${toLabel}`,
          onRemove: () => {
            setDatePreset("all");
            setDateFrom("");
            setDateTo("");
          },
        });
      }
    }

    return chips;
  }, [query, catSet, tagSet, readRange, minRead, maxRead, datePreset, dateFrom, dateTo]);

  // Reset pagination + show loading when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, catSet, tagSet, readRange, datePreset, dateFrom, dateTo, sortKey]);

  const shownArticles = useMemo(() => {
    return filteredSorted.slice(0, visibleCount);
  }, [filteredSorted, visibleCount]);

  const canLoadMore = shownArticles.length < filteredSorted.length;

  const onLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise((r) => setTimeout(r, 300));
    setVisibleCount((v) => v + PAGE_SIZE);
    setIsLoadingMore(false);
  };

  const openFilters = () => setFiltersOpen(true);
  const closeFilters = () => setFiltersOpen(false);

  const renderFilterSidebar = (inDrawer = false) => (
    <aside
      className={[
        "rounded-2xl bg-white ring-1 ring-slate-200",
        "p-5",
        inDrawer ? "" : "h-fit lg:sticky lg:top-24 self-start",
      ].join(" ")}
      aria-label="Φίλτρα"
    >
      {/* Αναζήτηση */}
      <div className="mb-5">
        <label htmlFor={inDrawer ? "q-drawer" : "q"} className="block text-sm font-medium text-slate-700 mb-2">
          Αναζήτηση
        </label>
        <input
          id={inDrawer ? "q-drawer" : "q"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Αναζήτηση άρθρων..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-primary/20"
        />
      </div>

      {/* Κατηγορίες */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-slate-700 mb-2">Κατηγορίες</legend>
        <div className="flex flex-col gap-1.5">
          {categories.map((c) => {
            const checked = catSet.has(c);
            return (
              <label
                key={c}
                className={[
                  "flex items-center gap-2 rounded-xl px-2.5 py-2",
                  "hover:bg-slate-50 transition",
                  "cursor-pointer select-none",
                  checked ? "bg-primary/5" : "",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  checked={checked}
                  onChange={() => toggleCat(c)}
                />
                <span className="text-sm text-slate-800">{c}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Ετικέτες (chips + mini search) */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-slate-700 mb-2">Ετικέτες</legend>

        <div className="mb-2">
          <label htmlFor={inDrawer ? "tag-q-drawer" : "tag-q"} className="sr-only">
            Αναζήτηση ετικέτας
          </label>
          <input
            id={inDrawer ? "tag-q-drawer" : "tag-q"}
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="Αναζήτηση ετικέτας…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
          />
        </div>

        <div className="max-h-44 overflow-auto rounded-xl border border-slate-200 p-2">
          <div className="flex flex-wrap gap-2">
            {visibleTags.length === 0 ? (
              <div className="w-full py-3 text-sm text-slate-600 text-center">
                Δεν βρέθηκαν ετικέτες.
              </div>
            ) : (
              visibleTags.map((t) => {
                const active = tagSet.has(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={[
                      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                      "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                      active
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary hover:bg-primary/15",
                    ].join(" ")}
                    aria-pressed={active}
                  >
                    #{t}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </fieldset>

      {/* Χρόνος ανάγνωσης (range slider) */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-slate-700 mb-2">
          Χρόνος ανάγνωσης (λεπτά)
        </legend>

        <div className="flex items-center justify-between text-sm text-slate-700">
          <span className="font-medium tabular-nums">{readRange[0]}′</span>
          <span className="text-slate-400">—</span>
          <span className="font-medium tabular-nums">{readRange[1]}′</span>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="sr-only">Ελάχιστος χρόνος</label>
            <input
              type="range"
              min={minRead}
              max={maxRead}
              value={readRange[0]}
              onChange={(e) => {
                const v = clamp(Number(e.target.value), minRead, readRange[1]);
                setReadRange([v, readRange[1]]);
              }}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="sr-only">Μέγιστος χρόνος</label>
            <input
              type="range"
              min={minRead}
              max={maxRead}
              value={readRange[1]}
              onChange={(e) => {
                const v = clamp(Number(e.target.value), readRange[0], maxRead);
                setReadRange([readRange[0], v]);
              }}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min={minRead}
              max={maxRead}
              value={readRange[0]}
              onChange={(e) => {
                const v = clamp(Number(e.target.value), minRead, readRange[1]);
                setReadRange([v, readRange[1]]);
              }}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              aria-label="Ελάχιστα λεπτά"
            />
            <input
              type="number"
              min={minRead}
              max={maxRead}
              value={readRange[1]}
              onChange={(e) => {
                const v = clamp(Number(e.target.value), readRange[0], maxRead);
                setReadRange([readRange[0], v]);
              }}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              aria-label="Μέγιστα λεπτά"
            />
          </div>
        </div>
      </fieldset>

      {/* Ημερομηνία (presets + custom) */}
      <fieldset className="mb-5">
        <legend className="text-sm font-medium text-slate-700 mb-2">Ημερομηνία</legend>
        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label="Όλο το εύρος"
            name={inDrawer ? "datePresetDrawer" : "datePreset"}
            checked={datePreset === "all"}
            onChange={() => setDatePreset("all")}
          />
          <RadioRow
            label="Τελευταίος μήνας"
            name={inDrawer ? "datePresetDrawer" : "datePreset"}
            checked={datePreset === "30d"}
            onChange={() => setDatePreset("30d")}
          />
          <RadioRow
            label="Τελευταίο 6μηνο"
            name={inDrawer ? "datePresetDrawer" : "datePreset"}
            checked={datePreset === "6m"}
            onChange={() => setDatePreset("6m")}
          />
          <RadioRow
            label="Τελευταίος χρόνος"
            name={inDrawer ? "datePresetDrawer" : "datePreset"}
            checked={datePreset === "12m"}
            onChange={() => setDatePreset("12m")}
          />
          <RadioRow
            label="Προσαρμοσμένο εύρος"
            name={inDrawer ? "datePresetDrawer" : "datePreset"}
            checked={datePreset === "custom"}
            onChange={() => setDatePreset("custom")}
          />
        </div>

        {datePreset === "custom" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Από</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Έως</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Ταξινόμηση */}
      <fieldset className="mb-6">
        <legend className="text-sm font-medium text-slate-700 mb-2">Ταξινόμηση</legend>
        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label="Νεότερα πρώτα"
            name={inDrawer ? "sortKeyDrawer" : "sortKey"}
            checked={sortKey === "newest"}
            onChange={() => setSortKey("newest")}
          />
          <RadioRow
            label="Παλαιότερα πρώτα"
            name={inDrawer ? "sortKeyDrawer" : "sortKey"}
            checked={sortKey === "oldest"}
            onChange={() => setSortKey("oldest")}
          />
          <RadioRow
            label="Χρόνος ανάγνωσης (αύξουσα)"
            name={inDrawer ? "sortKeyDrawer" : "sortKey"}
            checked={sortKey === "readAsc"}
            onChange={() => setSortKey("readAsc")}
          />
          <RadioRow
            label="Χρόνος ανάγνωσης (φθίνουσα)"
            name={inDrawer ? "sortKeyDrawer" : "sortKey"}
            checked={sortKey === "readDesc"}
            onChange={() => setSortKey("readDesc")}
          />
        </div>
      </fieldset>

      {/* Ενέργειες */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={resetAll}
          className="w-full rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20 transition font-medium focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          Επαναφορά φίλτρων
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <Head>
        <title>Άρθρα — Διατροφή & Ευεξία</title>
        <meta
          name="description"
          content="Όλα τα άρθρα σχετικά με διατροφή, ευεξία και επιστημονικά ευρήματα. Αναζητήστε και φιλτράρετε εύκολα."
        />
        <link rel="canonical" href="https://example.com/articles" />
      </Head>

      <section className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-10">
        {/* Hero (πιο σφιχτό + max-width κειμένου) */}
        <div className="mb-7 rounded-2xl bg-accent/10 px-6 py-5 md:px-10 md:py-7">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
            Άρθρα
          </h1>
          <p className="text-slate-700 max-w-[60ch] leading-relaxed">
            Επιμελημένο περιεχόμενο για υγιεινή, απολαυστική και ισορροπημένη καθημερινότητα. Αναζητήστε θέματα που σας ενδιαφέρουν ή περιηγηθείτε στις κατηγορίες.
          </p>
        </div>

        {/* Top bar (mobile/tablet): Filters button */}
        <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={openFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-white ring-1 ring-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            Φίλτρα
            {activeChips.length > 0 && (
              <span className="inline-flex min-w-[1.5rem] justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary tabular-nums">
                {activeChips.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            Reset
          </button>
        </div>

        {/* Layout: Sidebar + Grid (με μεγαλύτερο gap) */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          {/* Sidebar (desktop) */}
          <div className="hidden lg:block">
            {renderFilterSidebar()}
          </div>

          {/* Results */}
          <div>
            {/* Active filters chips + results count */}
            <div className="mb-4">
              <div className="flex items-end justify-between gap-4">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-slate-800 tabular-nums">
                    {filteredSorted.length}
                  </span>{" "}
                  άρθρα
                </div>

                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="hidden sm:inline-flex rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  >
                    Καθαρισμός φίλτρων
                  </button>
                )}
              </div>

              {activeChips.length > 0 && (
                <div
                  className={[
                    "mt-3 flex gap-2",
                    "overflow-x-auto pb-1",
                    "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                  ].join(" ")}
                  aria-label="Ενεργά φίλτρα"
                >
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className={[
                        "shrink-0 inline-flex items-center gap-2 rounded-full",
                        "bg-white ring-1 ring-slate-200",
                        "px-3 py-1.5 text-xs font-medium text-slate-800",
                        "hover:bg-slate-50 transition",
                        "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                      ].join(" ")}
                      title="Αφαίρεση φίλτρου"
                    >
                      <span className="whitespace-nowrap">{chip.label}</span>
                      <span className="text-slate-400">✕</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Empty state */}
            {pageLoading ? (
              <div className="rounded-2xl border border-slate-200 p-10 text-center text-slate-600">
                Φόρτωση άρθρων...
              </div>
            ) : filteredSorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <div className="text-slate-800 font-semibold mb-2">
                  Δεν βρέθηκαν άρθρα με αυτά τα κριτήρια.
                </div>
                <div className="text-slate-600 mb-5">
                  Δοκιμάστε να αφαιρέσετε κάποια φίλτρα ή να αλλάξετε την αναζήτηση.
                </div>
                <LeafBurstButton
                  text="Καθαρισμός φίλτρων"
                  onClick={resetAll}
                  disabled={false}
                  buttonClassName="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                />
              </div>
            ) : (
              <>
                {/* Grid */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {shownArticles.map((a, idx) => (
                        <li key={a.id} className="group h-full">
                          <Link
                            href={`/articles/${encodeURIComponent(a.slug)}`}
                            className={[
                              "block h-full",
                              "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 rounded-2xl",
                            ].join(" ")}
                          >
                            <article
                              className={[
                                "flex h-full flex-col overflow-hidden rounded-2xl bg-white",
                                "ring-1 ring-slate-200",
                                "shadow-sm",
                                "transition",
                                "group-hover:-translate-y-0.5 group-hover:shadow-lg",
                              ].join(" ")}
                            >
                              {/* Image + scrim + category pill */}
                              <div className="relative aspect-[16/10] overflow-hidden rounded-t-2xl">
                                <Image
                                  src={a.hero}
                                  alt={a.title}
                                  width={800}
                                  height={500}
                                  className="object-cover transition duration-300 group-hover:scale-[1.03] h-full w-full"
                                  unoptimized
                                />
                                {/* Scrim για contrast */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                                {/* Category pill (consistent style) */}
                                <span
                                  className={[
                                    "absolute left-3 top-3",
                                    "inline-flex items-center rounded-full",
                                    "bg-white/90 text-slate-900",
                                    "px-3 py-1 text-xs font-semibold",
                                    "ring-1 ring-black/10",
                                    "backdrop-blur",
                                  ].join(" ")}
                                >
                                  {a.category}
                                </span>
                              </div>

                              {/* Body */}
                              <div className="p-5 flex flex-col gap-3 grow">
                                <header className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <h3 className="text-lg font-semibold leading-relaxed line-clamp-2 text-slate-900">
                                      {a.title}
                                    </h3>

                                    {/* Προτεινόμενο: μικρό badge δίπλα στον τίτλο (όχι pill πάνω στην εικόνα) */}
                                    {idx === 0 && (
                                      <span
                                        className={[
                                          "mt-0.5 shrink-0",
                                          "inline-flex items-center rounded-full",
                                          "bg-warm/25 text-slate-800",
                                          "ring-1 ring-warm/50",
                                          "px-2 py-0.5 text-[11px] font-semibold",
                                        ].join(" ")}
                                      >
                                        ⭐ Προτεινόμενο
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                    {a.excerpt}
                                  </p>
                                </header>

                                {/* Footer */}
                                <div className="mt-auto space-y-3">
                                  {/* Meta (ήσυχα + ίδια baseline) */}
                                  <div className="flex items-center justify-between text-xs text-slate-500 tabular-nums">
                                    <span className="inline-flex items-center gap-1.5">
                                      <span aria-hidden>📅</span>
                                      {formatDateISOToEl(a.dateISO)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                      <span aria-hidden>⏱</span>
                                      {a.readMinutes}′ ανάγνωση
                                    </span>
                                  </div>

                                  {/* Tags (max 2 + +N) */}
                                  <div className="flex flex-wrap gap-2">
                                    {a.tags.slice(0, 2).map((t) => (
                                      <span
                                        key={t}
                                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium"
                                      >
                                        #{t}
                                      </span>
                                    ))}
                                    {a.tags.length > 2 && (
                                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 font-medium">
                                        +{a.tags.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </article>
                          </Link>
                        </li>
                      ))}
                </ul>

                {/* Load more */}
                {filteredSorted.length > 0 && (
                  <div className="mt-8 flex justify-center">
                    {canLoadMore ? (
                      <LeafBurstButton
                        text={isLoadingMore ? "Φόρτωση…" : "Φόρτωσε περισσότερα"}
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        buttonClassName={[
                          "rounded-xl px-5 py-2.5 text-sm font-medium",
                          "bg-primary text-white hover:opacity-95 transition",
                          "disabled:opacity-60 disabled:cursor-not-allowed",
                          "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                        ].join(" ")}
                      />
                    ) : (
                      <div className="text-sm text-slate-500">Τέλος αποτελεσμάτων.</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Drawer (tablet/mobile) */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={closeFilters}
            className="absolute inset-0 bg-black/40"
            aria-label="Κλείσιμο φίλτρων"
          />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-[420px] bg-slate-50 p-4 overflow-auto">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-900">Φίλτρα</div>
              <button
                type="button"
                onClick={closeFilters}
                className="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                Κλείσιμο
              </button>
            </div>

            {renderFilterSidebar(true)}

            <div className="mt-4 flex gap-2">
              <LeafBurstButton
                text="Εφαρμογή"
                onClick={() => {
                  closeFilters();
                }}
                buttonClassName="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-95 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              />
              <button
                type="button"
                onClick={resetAll}
                className="w-full rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------------- Small UI bits ---------------- */
function RadioRow({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={[
        "flex items-center gap-2 rounded-xl px-2.5 py-2 cursor-pointer select-none",
        "hover:bg-slate-50 transition",
      ].join(" ")}
    >
      <input
        type="radio"
        name={name}
        className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
        checked={checked}
        onChange={onChange}
      />
      <span className="text-slate-800">{label}</span>
    </label>
  );
}

