import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArticlesApi, type ArticlesGetDto } from "@/api/ArticlesController";
import { toMediaUrl } from "@/api/_axios-client";
import { usePageHeader } from "@/lib/usePageHeader";

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  dateISO: string;
  hero: string;
};

type Props = {
  articles: Article[];
  loadError?: string;
};

type SortKey = "newest" | "oldest" | "az";
type DatePreset = "all" | "30d" | "6m" | "12m" | "custom";

const DEFAULT_PAGE_HEADER = {
  title: "Άρθρα",
  description:
    "Επιμελημένο περιεχόμενο για υγιεινή, απολαυστική και ισορροπημένη καθημερινότητα. Αναζητήστε θέματα που σας ενδιαφέρουν ή περιηγηθείτε στις κατηγορίες.",
};

const PER_PAGE = 9;

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

function stripHtml(value?: string | null) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveArticleImage(image?: string | null): string {
  const value = image?.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return toMediaUrl(value);
}

function mapArticleDtoToUi(dto: ArticlesGetDto): Article {
  const content = dto.content ?? "";

  return {
    id: dto.id,
    slug: slugifyArticle(dto.title ?? "", dto.id),
    title: dto.title ?? "",

    excerpt: dto.subtitle?.trim() || stripHtml(content).slice(0, 160),

    // Use the real category stored in the database.
    category: dto.category?.trim() || "Χωρίς κατηγορία",

    dateISO: dto.publishedAt ?? "",
    hero: resolveArticleImage(dto.imageUrl),
  };
}

function formatDateISOToEl(iso: string) {
  if (!iso) {
    return "—";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function paginateNumbers(
  totalPages: number,
  currentPage: number,
): Array<number | "…"> {
  const maxVisible = 7;

  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "…"> = [];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  pages.push(1);

  if (left > 2) {
    pages.push("…");
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < totalPages - 1) {
    pages.push("…");
  }

  pages.push(totalPages);

  return pages;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const data = await ArticlesApi.list();

    return {
      props: {
        articles: Array.isArray(data) ? data.map(mapArticleDtoToUi) : [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch articles:", error);

    return {
      props: {
        articles: [],
        loadError: "Δεν ήταν δυνατή η φόρτωση των άρθρων.",
      },
    };
  }
};

export default function ArticlesIndex({ articles, loadError }: Props) {
  const pageHeader = usePageHeader("articles", DEFAULT_PAGE_HEADER);

  const [query, setQuery] = useState("");
  const [categorySet, setCategorySet] = useState<Set<string>>(new Set());

  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        articles.map((article) => article.category.trim()).filter(Boolean),
      ),
    ).sort((first, second) => first.localeCompare(second, "el-GR"));
  }, [articles]);

  const toggleCategory = useCallback((category: string) => {
    setCategorySet((current) => {
      const next = new Set(current);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });
  }, []);

  function clearFilters() {
    setQuery("");
    setCategorySet(new Set());
    setDatePreset("all");
    setDateFrom("");
    setDateTo("");
    setSortKey("newest");
    setPage(1);
  }

  const filteredSorted = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("el-GR");
    const now = new Date();

    const dateCutoff = (() => {
      if (datePreset === "all" || datePreset === "custom") {
        return null;
      }

      const date = new Date(now);

      if (datePreset === "30d") {
        date.setDate(date.getDate() - 30);
      }

      if (datePreset === "6m") {
        date.setMonth(date.getMonth() - 6);
      }

      if (datePreset === "12m") {
        date.setFullYear(date.getFullYear() - 1);
      }

      return date;
    })();

    const customFrom =
      datePreset === "custom" && dateFrom
        ? new Date(`${dateFrom}T00:00:00`)
        : null;

    const customTo =
      datePreset === "custom" && dateTo ? new Date(`${dateTo}T23:59:59`) : null;

    const filtered = articles.filter((article) => {
      if (search) {
        const searchableText = [
          article.title,
          article.excerpt,
          article.category,
        ]
          .join(" ")
          .toLocaleLowerCase("el-GR");

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      if (categorySet.size > 0 && !categorySet.has(article.category)) {
        return false;
      }

      const publishedAt = new Date(article.dateISO);

      if (!Number.isNaN(publishedAt.getTime())) {
        if (dateCutoff && publishedAt < dateCutoff) {
          return false;
        }

        if (customFrom && publishedAt < customFrom) {
          return false;
        }

        if (customTo && publishedAt > customTo) {
          return false;
        }
      }

      return true;
    });

    return filtered.sort((first, second) => {
      if (sortKey === "az") {
        return first.title.localeCompare(second.title, "el-GR");
      }

      const firstDate = new Date(first.dateISO).getTime();
      const secondDate = new Date(second.dateISO).getTime();

      const safeFirst = Number.isNaN(firstDate) ? 0 : firstDate;

      const safeSecond = Number.isNaN(secondDate) ? 0 : secondDate;

      if (sortKey === "oldest") {
        return safeFirst - safeSecond || first.id - second.id;
      }

      return safeSecond - safeFirst || second.id - first.id;
    });
  }, [articles, query, categorySet, datePreset, dateFrom, dateTo, sortKey]);

  useEffect(() => {
    setPage(1);
  }, [query, categorySet, datePreset, dateFrom, dateTo, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PER_PAGE));

  const pageClamped = Math.min(totalPages, Math.max(1, page));

  const pagedArticles = filteredSorted.slice(
    (pageClamped - 1) * PER_PAGE,
    pageClamped * PER_PAGE,
  );

  const activeFilters = useMemo(() => {
    const filters: Array<{
      key: string;
      label: string;
      onRemove: () => void;
    }> = [];

    const search = query.trim();

    if (search) {
      filters.push({
        key: "query",
        label: `Αναζήτηση: ${search}`,
        onRemove: () => setQuery(""),
      });
    }

    Array.from(categorySet).forEach((category) => {
      filters.push({
        key: `category-${category}`,
        label: `Κατηγορία: ${category}`,
        onRemove: () => toggleCategory(category),
      });
    });

    if (datePreset !== "all") {
      let label = "";

      if (datePreset === "30d") {
        label = "Τελευταίος μήνας";
      }

      if (datePreset === "6m") {
        label = "Τελευταίο εξάμηνο";
      }

      if (datePreset === "12m") {
        label = "Τελευταίος χρόνος";
      }

      if (datePreset === "custom") {
        label = `Ημερομηνία: ${dateFrom || "—"} έως ${dateTo || "—"}`;
      }

      filters.push({
        key: "date",
        label,
        onRemove: () => {
          setDatePreset("all");
          setDateFrom("");
          setDateTo("");
        },
      });
    }

    return filters;
  }, [query, categorySet, datePreset, dateFrom, dateTo, toggleCategory]);

  const renderFilterSidebar = (inDrawer = false) => (
    <aside
      className={classNames(
        "rounded-2xl bg-white p-5 ring-1 ring-slate-200",
        !inDrawer && "h-fit self-start lg:sticky lg:top-24",
      )}
      aria-label="Φίλτρα άρθρων"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Φίλτρα</h2>

        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-semibold text-primary transition hover:text-primary/80"
        >
          Καθαρισμός φίλτρων
        </button>
      </div>

      <div className="mb-5">
        <label
          htmlFor={inDrawer ? "article-query-drawer" : "article-query"}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Αναζήτηση
        </label>

        <input
          id={inDrawer ? "article-query-drawer" : "article-query"}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Αναζήτηση άρθρων..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
        />
      </div>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Κατηγορίες
        </legend>

        <div className="flex flex-col gap-1.5">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500">Δεν υπάρχουν κατηγορίες.</p>
          ) : (
            categories.map((category) => {
              const checked = categorySet.has(category);

              return (
                <label
                  key={category}
                  className={classNames(
                    "flex cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-50",
                    checked && "bg-primary/5",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />

                  <span className="text-sm text-slate-800">{category}</span>
                </label>
              );
            })
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Ημερομηνία
        </legend>

        <div className="flex flex-col gap-1.5">
          <RadioRow
            label="Όλο το εύρος"
            name={inDrawer ? "article-date-drawer" : "article-date"}
            checked={datePreset === "all"}
            onChange={() => setDatePreset("all")}
          />

          <RadioRow
            label="Τελευταίος μήνας"
            name={inDrawer ? "article-date-drawer" : "article-date"}
            checked={datePreset === "30d"}
            onChange={() => setDatePreset("30d")}
          />

          <RadioRow
            label="Τελευταίο εξάμηνο"
            name={inDrawer ? "article-date-drawer" : "article-date"}
            checked={datePreset === "6m"}
            onChange={() => setDatePreset("6m")}
          />

          <RadioRow
            label="Τελευταίος χρόνος"
            name={inDrawer ? "article-date-drawer" : "article-date"}
            checked={datePreset === "12m"}
            onChange={() => setDatePreset("12m")}
          />

          <RadioRow
            label="Προσαρμοσμένο εύρος"
            name={inDrawer ? "article-date-drawer" : "article-date"}
            checked={datePreset === "custom"}
            onChange={() => setDatePreset("custom")}
          />
        </div>

        {datePreset === "custom" && (
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-xs text-slate-600">Από</label>

              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-600">Έως</label>

              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              />
            </div>
          </div>
        )}
      </fieldset>
    </aside>
  );

  return (
    <>
      <Head>
        <title>Άρθρα — Διατροφή & Ευεξία</title>

        <meta
          name="description"
          content="Άρθρα για τη διατροφή, την ευεξία και την καθημερινότητα."
        />

        <link rel="canonical" href="https://example.com/articles" />
      </Head>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {pageHeader.title}
          </h1>

          <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
            {pageHeader.description}
          </p>
        </header>

        <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Φίλτρα
            {activeFilters.length > 0 && (
              <span className="inline-flex min-w-6 justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {activeFilters.length}
              </span>
            )}
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-600 sm:inline">
              Ταξινόμηση:
            </span>

            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="rounded-xl bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Νεότερα</option>
              <option value="oldest">Παλαιότερα</option>
              <option value="az">Αλφαβητικά (Α–Ω)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <div className="hidden lg:block">{renderFilterSidebar()}</div>

          <main>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="text-sm text-slate-600">
                Βρέθηκαν{" "}
                <span className="font-semibold text-slate-900">
                  {filteredSorted.length}
                </span>{" "}
                άρθρα
              </div>

              <div className="hidden items-center gap-2 lg:flex">
                <span className="text-sm text-slate-600">Ταξινόμηση:</span>

                <select
                  value={sortKey}
                  onChange={(event) =>
                    setSortKey(event.target.value as SortKey)
                  }
                  className="rounded-xl bg-white px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="newest">Νεότερα</option>

                  <option value="oldest">Παλαιότερα</option>

                  <option value="az">Αλφαβητικά (Α–Ω)</option>
                </select>
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={filter.onRemove}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
                  >
                    {filter.label}
                    <span className="text-slate-400">×</span>
                  </button>
                ))}
              </div>
            )}

            {loadError ? (
              <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
                <h2 className="font-semibold text-slate-900">
                  Σφάλμα φόρτωσης
                </h2>

                <p className="mt-2 text-sm text-slate-600">{loadError}</p>
              </div>
            ) : filteredSorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                <h2 className="font-semibold text-slate-800">
                  Δεν βρέθηκαν άρθρα
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Δοκιμάστε να αλλάξετε ή να καθαρίσετε τα φίλτρα.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white"
                >
                  Καθαρισμός φίλτρων
                </button>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pagedArticles.map((article, index) => (
                    <li key={article.id} className="group h-full">
                      <Link
                        href={`/articles/${encodeURIComponent(article.slug)}`}
                        className="block h-full rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      >
                        <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                            {article.hero ? (
                              <Image
                                src={article.hero}
                                alt={article.title}
                                fill
                                unoptimized
                                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/15 via-accent/10 to-warm/15">
                                <div className="flex flex-col items-center gap-2 text-slate-600">
                                  <ImagePlaceholderIcon />

                                  <span className="text-xs font-medium">
                                    Χωρίς εικόνα
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                            <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 ring-1 ring-black/10 backdrop-blur">
                              {article.category}
                            </span>
                          </div>

                          <div className="flex grow flex-col gap-3 p-5">
                            <div className="flex items-start gap-2">
                              <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
                                {article.title}
                              </h2>

                              {index === 0 && pageClamped === 1 && (
                                <span className="mt-0.5 shrink-0 rounded-full bg-warm/25 px-2 py-0.5 text-[11px] font-semibold text-slate-800 ring-1 ring-warm/50">
                                  ⭐ Προτεινόμενο
                                </span>
                              )}
                            </div>

                            {article.excerpt && (
                              <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
                                {article.excerpt}
                              </p>
                            )}

                            <div className="mt-auto pt-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <span aria-hidden>📅</span>

                                {formatDateISOToEl(article.dateISO)}
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    disabled={pageClamped === 1}
                    className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 shadow-sm transition hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Προηγούμενη
                  </button>

                  <div className="hidden items-center gap-2 sm:flex">
                    {paginateNumbers(totalPages, pageClamped).map(
                      (pageNumber, index) =>
                        pageNumber === "…" ? (
                          <span
                            key={`dots-${index}`}
                            className="px-2 text-slate-500"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={pageNumber}
                            type="button"
                            onClick={() => setPage(pageNumber)}
                            className={classNames(
                              "min-w-10 rounded-full px-3 py-2 text-sm ring-1 transition",
                              pageNumber === pageClamped
                                ? "bg-primary text-white ring-primary shadow-sm"
                                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                            )}
                          >
                            {pageNumber}
                          </button>
                        ),
                    )}
                  </div>

                  <div className="px-2 text-sm text-slate-700 sm:hidden">
                    <span className="font-semibold">{pageClamped}</span> /{" "}
                    {totalPages}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={pageClamped === totalPages}
                    className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 shadow-sm transition hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Επόμενη
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </section>

      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Φίλτρα άρθρων"
        >
          <button
            type="button"
            onClick={() => setFiltersOpen(false)}
            className="absolute inset-0 bg-slate-900/50"
            aria-label="Κλείσιμο φίλτρων"
          />

          <div className="absolute right-0 top-0 h-full w-[min(92vw,380px)] overflow-y-auto bg-slate-50 p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Φίλτρα</h2>

              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm"
              >
                Κλείσιμο
              </button>
            </div>

            {renderFilterSidebar(true)}

            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white"
            >
              Εφαρμογή
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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
    <label className="flex cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-50">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
      />

      <span className="text-sm text-slate-800">{label}</span>
    </label>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg
      width="28"
      height="28"
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
