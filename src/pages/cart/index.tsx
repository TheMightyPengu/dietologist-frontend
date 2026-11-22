import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import CeramicImage from "@/components/ceramics/CeramicImage";
import { useCart } from "@/components/cart/CartProvider";
import { useTranslations } from "@/components/hooks/useTranslations";
import { localizedContent } from "@/lib/localized-content";
import { ceramicPrice } from "@/lib/ceramics";
import {
  cartHref, cartKey, cartLimit, cartProductMissing, cartSubtotal,
  lineCents, loadCartProduct, type CartProduct, type CartReference,
} from "@/lib/cart";

type Lookup = CartProduct | "missing" | "error";

const placeholders = {
  ceramic: "/images/ceramicplaceholder.jpg",
  ebook: "/images/ebook-placeholder.jpg",
  seminar: "/images/seminar-placeholder.jpg",
};

const quantityButton = "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-primary hover:border-primary disabled:opacity-40";

export default function CartPage() {
  const router = useRouter();
  const { cart: copy } = useTranslations();
  const { items, ready, count, storageUnavailable, remove, update, clear } = useCart();
  const [lookups, setLookups] = useState<ReadonlyMap<string, Lookup>>(new Map());
  const [revision, setRevision] = useState(0);
  const references = JSON.stringify(items.map(({ type, id }) => ({ type, id })));
  const prices = new Map<string, CartProduct>();

  for (const item of items) {
    const key = cartKey(item);
    const lookup = lookups.get(key);
    if (lookup && typeof lookup === "object") prices.set(key, lookup);
  }

  const loading = items.some((item) => !lookups.has(cartKey(item)));
  const excluded = items.some((item) => {
    const lookup = lookups.get(cartKey(item));
    return lookup !== undefined && (typeof lookup !== "object" || item.quantity > cartLimit(lookup));
  });

  useEffect(() => {
    if (!ready) return;
    let active = true;
    const requested = JSON.parse(references) as CartReference[];
    void Promise.all(requested.map(async (item): Promise<[string, Lookup]> => {
      try {
        return [cartKey(item), await loadCartProduct(item)];
      } catch (error) {
        return [cartKey(item), cartProductMissing(error) ? "missing" : "error"];
      }
    })).then((results) => {
      if (active) setLookups(new Map(results));
    });
    return () => { active = false; };
  }, [ready, references, revision]);

  useEffect(() => {
    function refresh() {
      setRevision((value) => value + 1);
    }
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const money = (cents: number) => ceramicPrice(cents / 100, router.locale);
  const subtotal = cartSubtotal(items, prices);

  return (
    <section className="mx-auto min-h-[65vh] max-w-6xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
      <Head><title>{copy.title}</title></Head>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-[rgb(var(--primary-dark))] md:text-4xl">{copy.title}</h1>
        {items.length > 0 && (
          <button type="button" onClick={() => { if (window.confirm(copy.clearConfirm)) clear(); }}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >{copy.clear}</button>
        )}
      </div>
      {storageUnavailable && <p role="alert" className="mb-4 text-sm text-rose-700">{copy.storageUnavailable}</p>}
      {!ready ? <p role="status">{copy.loading}</p> : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-6 py-12 text-center shadow-sm">
          <ShoppingBag className="mx-auto mb-4 text-primary" size={30} aria-hidden="true" />
          <p className="mb-5 text-slate-700">{copy.empty}</p>
          <Link href="/ceramics" className="btn-primary text-sm">{copy.continueShopping}</Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white/85 px-4 shadow-sm sm:px-6">
            {items.map((item) => {
              const key = cartKey(item);
              const lookup = lookups.get(key);
              const product = prices.get(key);
              const limit = product ? cartLimit(product) : 0;
              const title = product ? localizedContent(router.locale, product.title, product.titleEn) : copy.types[item.type];
              const date = product?.dateTime ? new Date(product.dateTime) : null;
              const valid = !!product && item.quantity <= limit;
              const hasPrice = product && Number.isFinite(product.price) && product.price >= 0;

              return (
                <li key={key} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[6rem_minmax(0,1fr)_auto]">
                  <div className="relative aspect-square self-start overflow-hidden rounded-xl bg-slate-100">
                    <CeramicImage url={product?.imageUrl} fallback={placeholders[item.type]} alt="" sizes="96px" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-semibold text-slate-600">{copy.types[item.type]}</p>
                    {product ? (
                      <Link href={cartHref(item)} className="block break-words font-semibold text-[rgb(var(--primary-dark))] hover:underline">{title}</Link>
                    ) : <p className="font-semibold">{title}</p>}
                    {date && Number.isFinite(date.getTime()) && (
                      <p className="text-sm text-slate-600">
                        {new Intl.DateTimeFormat(router.locale === "en" ? "en-GB" : "el-GR", { dateStyle: "medium", timeStyle: "short" }).format(date)}
                      </p>
                    )}
                    {hasPrice && <p className="text-sm text-slate-600">{copy.unitPrice} · {ceramicPrice(product.price, router.locale)}</p>}
                    {lookup === undefined && <p role="status" className="text-sm text-slate-600">{copy.loading}</p>}
                    {lookup === "error" && (
                      <p className="text-sm text-rose-700">
                        {copy.loadError} <button type="button" onClick={() => setRevision((value) => value + 1)} className="underline">{copy.retry}</button>
                      </p>
                    )}
                    {(lookup === "missing" || (product && !limit)) && (
                      <p className="text-sm font-medium text-rose-700">
                        {product && item.type === "ceramic" ? copy.soldOut : copy.unavailable}
                      </p>
                    )}
                    {product && limit > 0 && item.quantity > limit && (
                      <p className="text-sm font-medium text-rose-700">{copy.stockChanged.replace("{quantity}", String(limit))}</p>
                    )}
                  </div>
                  <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-2" aria-label={copy.quantity} role="group">
                      {item.type === "ceramic" && (
                        <button type="button" aria-label={copy.decrease} disabled={item.quantity <= 1 || !limit}
                          onClick={() => update(item, Math.min(item.quantity - 1, limit), limit)} className={quantityButton}>
                          <Minus size={16} aria-hidden="true" />
                        </button>
                      )}
                      <span className="min-w-5 text-center text-sm tabular-nums">{item.quantity}</span>
                      {item.type === "ceramic" && (
                        <button type="button" aria-label={copy.increase} disabled={item.quantity >= limit}
                          onClick={() => update(item, item.quantity + 1, limit)} className={quantityButton}>
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-[rgb(var(--primary-dark))]">
                      <span className="sr-only">{copy.itemSubtotal}: </span>
                      {valid && product ? money(lineCents(product.price, item.quantity)) : "—"}
                    </p>
                    <button type="button" onClick={() => remove(item)} aria-label={`${copy.remove}: ${title}`}
                      className="text-sm font-medium text-primary underline underline-offset-4">{copy.remove}</button>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[rgb(var(--primary-dark))]">{copy.summary}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt>{copy.itemCount}</dt><dd className="tabular-nums">{count}</dd></div>
              <div className="flex justify-between gap-3"><dt>{copy.subtotal}</dt><dd className="tabular-nums">{loading ? "—" : money(subtotal)}</dd></div>
              <div className="flex justify-between gap-3 border-t border-slate-200 pt-3 font-semibold"><dt>{copy.total}</dt><dd className="tabular-nums">{loading ? "—" : money(subtotal)}</dd></div>
            </dl>
            {excluded && <p className="mt-3 text-xs leading-relaxed text-slate-600">{copy.partialTotal}</p>}
            <p className="mt-5 rounded-xl bg-[rgb(var(--surface-soft))] p-3 text-sm text-slate-700">{copy.paymentsUnavailable}</p>
          </aside>
        </div>
      )}
    </section>
  );
}
