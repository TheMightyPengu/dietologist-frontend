import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { CeramicsApi, type CeramicProduct } from "@/api/CeramicsController";
import { toApiError } from "@/api/_axios-client";
import CeramicGallery from "@/components/ceramics/CeramicGallery";
import AddToCart from "@/components/cart/AddToCart";
import { useTranslations } from "@/components/hooks/useTranslations";
import { ceramicPrice } from "@/lib/ceramics";
import { localizedContent } from "@/lib/localized-content";

export default function CeramicProductPage() {
  const router = useRouter();
  const { ceramics: copy } = useTranslations();
  const id = Number(router.query.id);
  const validId = Number.isInteger(id) && id > 0 && id <= 2_147_483_647;
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ id: number; attempt: number; product?: CeramicProduct; missing?: boolean }>();
  const current = result?.id === id && result.attempt === attempt ? result : undefined;
  const product = current?.product;
  const title = localizedContent(router.locale, product?.title, product?.titleEn);
  const missing = (router.isReady && !validId) || current?.missing;

  useEffect(() => {
    if (!router.isReady || !validId) return;
    const request = new AbortController();
    CeramicsApi.product(id, request.signal).then(
      (product) => { if (!request.signal.aborted) setResult({ id, attempt, product }); },
      (error: unknown) => {
        if (!request.signal.aborted) setResult({ id, attempt, missing: toApiError(error).status === 404 });
      },
    );
    return () => request.abort();
  }, [router.isReady, validId, id, attempt]);

  return (
    <section className="mx-auto min-h-[65vh] max-w-7xl px-4 pb-12 pt-7 sm:px-8 sm:pb-16 sm:pt-9 lg:px-10">
      <Head><title>{product ? `${title} | ${copy.title}` : copy.title}</title></Head>
      <Link
        href="/ceramics"
        className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[rgb(var(--primary-dark))] transition-colors hover:text-[rgb(var(--ink))] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {copy.back}
      </Link>
      <div className="mt-3 sm:mt-5">
        {missing && <h1 className="text-2xl font-semibold">{copy.notFound}</h1>}
        {!missing && !current && <p role="status">{copy.loading}</p>}
        {current && !product && !missing && (
          <p role="alert" className="text-rose-700">
            {copy.detailError} <button className="underline" onClick={() => setAttempt((value) => value + 1)}>{copy.retry}</button>
          </p>
        )}
        {product && (
          <div className="grid items-start gap-7 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:gap-9 lg:gap-12">
            <CeramicGallery key={product.id} images={product.images} title={title} labels={copy} showcase={copy.lightbox} />
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold tracking-wide text-[rgb(var(--primary-dark))]">
                <span>{copy.handmade}</span>
                <span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span className="min-w-0 break-words">{localizedContent(router.locale, product.category.name, product.category.nameEn)}</span>
              </p>
              <h1 className="mt-3 break-words text-3xl font-semibold leading-[1.12] tracking-tight text-[rgb(var(--primary-dark))] sm:text-4xl lg:text-5xl">{title}</h1>
              <p className="mt-4 text-xl font-medium tabular-nums text-[rgb(var(--ink))] lg:text-2xl">{ceramicPrice(product.price, router.locale)}</p>
              <p className="mt-5 max-w-[42ch] whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 sm:text-base">
                {localizedContent(router.locale, product.description, product.descriptionEn)}
              </p>
              <div className="mt-6 border-t border-[rgb(var(--border))] pt-6 sm:mt-8">
                {product.stockQuantity > 0 ? (
                  <div className="space-y-3">
                    <AddToCart key={product.id} type="ceramic" id={product.id} limit={product.stockQuantity} />
                    <Link href="/contact/form" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                      {copy.inquire}
                      <ArrowUpRight size={16} className="shrink-0" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <p className="inline-flex rounded-full border border-[rgb(var(--border))] px-4 py-2 text-sm font-semibold text-slate-700">
                    {copy.soldOut}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
