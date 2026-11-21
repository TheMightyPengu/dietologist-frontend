import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { CeramicsApi, type CeramicCategory, type CeramicProductPage, type CeramicSort } from "@/api/CeramicsController";
import CeramicImage from "@/components/ceramics/CeramicImage";
import { useTranslations } from "@/components/hooks/useTranslations";
import { ceramicPrice, ceramicSorts } from "@/lib/ceramics";
import { localizedContent } from "@/lib/localized-content";

const control = "rounded-full border border-accent/25 bg-white px-4 py-2 text-sm text-[rgb(var(--primary-dark))] hover:border-primary focus-visible:ring-2 focus-visible:ring-primary";
const pageSize = 24;
const maxPage = Math.floor(2_147_483_647 / pageSize) + 1;

export default function CeramicsPage() {
  const router = useRouter();
  const { ceramics: copy } = useTranslations();
  const category = typeof router.query.category === "string" ? router.query.category : "";
  const requestedSort = router.query.sort as CeramicSort;
  const sort = ceramicSorts.includes(requestedSort) ? requestedSort : "newest";
  const requestedPage = Number(router.query.page);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= maxPage ? requestedPage : 1;
  const [categories, setCategories] = useState<CeramicCategory[]>([]);
  const [categoryError, setCategoryError] = useState(false);
  const [categoryAttempt, setCategoryAttempt] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const requestKey = JSON.stringify([category, sort, page, attempt]);
  const [result, setResult] = useState<{ key: string; data?: CeramicProductPage }>();
  const currentResult = result?.key === requestKey ? result : undefined;

  useEffect(() => {
    const request = new AbortController();
    CeramicsApi.categories(request.signal).then(
      (data) => {
        if (!request.signal.aborted) {
          setCategories(data);
          setCategoryError(false);
        }
      },
      () => { if (!request.signal.aborted) setCategoryError(true); },
    );
    return () => request.abort();
  }, [categoryAttempt]);

  useEffect(() => {
    function refreshCategories() {
      setCategoryAttempt((value) => value + 1);
    }
    window.addEventListener("focus", refreshCategories);
    return () => window.removeEventListener("focus", refreshCategories);
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const request = new AbortController();
    CeramicsApi.products({ category: category || undefined, sort, page, pageSize }, request.signal).then(
      (data) => { if (!request.signal.aborted) setResult({ key: requestKey, data }); },
      () => { if (!request.signal.aborted) setResult({ key: requestKey }); },
    );
    return () => request.abort();
  }, [router.isReady, category, sort, page, requestKey]);

  function catalogLink(nextCategory: string, nextSort: CeramicSort, nextPage = 1) {
    return {
      pathname: "/ceramics",
      query: {
        ...(nextCategory && { category: nextCategory }),
        ...(nextSort !== "newest" && { sort: nextSort }),
        ...(nextPage > 1 && { page: nextPage }),
      },
    };
  }

  function selectCategory(slug: string) {
    void router.push(catalogLink(slug, sort), undefined, { shallow: true, scroll: false });
  }

  function renderCategories(group: string) {
    return (
      <fieldset className="min-w-0">
        <legend className="mb-2 text-sm font-medium text-slate-700">{copy.category}</legend>
        <div className="flex flex-col gap-1.5">
          {[{ slug: "", name: copy.all, nameEn: null }, ...categories].map((item) => (
            <label
              key={item.slug}
              className={`flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-50 ${item.slug === category ? "bg-primary/5" : ""}`}
            >
              <input
                type="radio"
                name={group}
                checked={item.slug === category}
                onChange={() => selectCategory(item.slug)}
                className="h-4 w-4 shrink-0 accent-primary focus-visible:ring-2 focus-visible:ring-primary"
              />
              <span className="min-w-0 break-words text-sm text-slate-800">{localizedContent(router.locale, item.name, item.nameEn)}</span>
            </label>
          ))}
        </div>
        {categoryError && (
          <p role="alert" className="mt-3 text-sm text-rose-700">
            {copy.categoryError} <button type="button" className="underline" onClick={() => setCategoryAttempt((value) => value + 1)}>{copy.retry}</button>
          </p>
        )}
      </fieldset>
    );
  }

  const resetCategory = category && (
    <button type="button" onClick={() => selectCategory("")} className="text-xs font-semibold text-primary transition hover:text-primary/80">
      {copy.clearFilters}
    </button>
  );

  return (
    <section className="mx-auto min-h-[65vh] max-w-6xl px-4 py-8 md:px-6 md:py-10 lg:px-8">
      <Head><title>{copy.title}</title></Head>
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--primary-dark))] md:text-4xl">{copy.heading}</h1>
      </header>
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <aside aria-labelledby="ceramic-filters-title" className="hidden rounded-2xl bg-white p-5 ring-1 ring-slate-200 lg:sticky lg:top-36 lg:block">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 id="ceramic-filters-title" className="text-sm font-semibold text-slate-900">{copy.filters}</h2>
            {resetCategory}
          </div>
          {renderCategories("ceramic-category-desktop")}
        </aside>
        <details className="min-w-0 rounded-xl bg-white ring-1 ring-slate-200 lg:hidden">
          <summary className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary">
            {copy.filters}
            {category && <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">1</span>}
          </summary>
          <div className="space-y-3 border-t border-slate-200 p-4">
            {resetCategory}
            {renderCategories("ceramic-category-mobile")}
          </div>
        </details>
        <div className="min-w-0 space-y-4">
          <label className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-600">
            {copy.sort}
            <select
              className="max-w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-800 shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-primary"
              value={sort}
              onChange={(event) => void router.push(catalogLink(category, event.target.value as CeramicSort), undefined, { shallow: true, scroll: false })}
            >
              {ceramicSorts.map((item) => <option key={item} value={item}>{copy[item]}</option>)}
            </select>
          </label>
          {!currentResult && <p role="status" className="text-sm text-slate-600">{copy.loading}</p>}
          {currentResult && !currentResult.data && (
            <p role="alert" className="text-rose-700">
              {copy.error} <button className="underline" onClick={() => setAttempt((value) => value + 1)}>{copy.retry}</button>
            </p>
          )}
          {currentResult?.data && (
            <>
              {currentResult.data.items.length === 0 && (
                <p role="status" className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm font-semibold text-slate-800">{copy.empty}</p>
              )}
              <ul className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentResult.data.items.map((product) => (
                  <li key={product.id} className="group min-w-0">
                    <Link
                      href={`/ceramics/${product.id}`}
                      className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition motion-safe:group-hover:-translate-y-0.5 group-hover:shadow-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <CeramicImage url={product.primaryImageUrl} alt="" sizes="(min-width: 1152px) 254px, (min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw" />
                      </div>
                      <div className="flex grow flex-col gap-2 p-5">
                        <h2 className="break-words text-lg font-semibold leading-snug text-slate-900">{localizedContent(router.locale, product.title, product.titleEn)}</h2>
                        <p className="mt-auto text-sm text-slate-700">{ceramicPrice(product.price, router.locale)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {(page > 1 || currentResult.data.hasNextPage) && (
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  {page > 1 && <Link href={catalogLink(category, sort, page - 1)} shallow className={control}>← {copy.previous}</Link>}
                  <span className="text-sm">{page}</span>
                  {currentResult.data.hasNextPage && <Link href={catalogLink(category, sort, page + 1)} shallow className={control}>{copy.next} →</Link>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
