import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CeramicsApi, type CeramicCategory, type CeramicProduct, type CeramicProductCard, type CeramicProductPage } from "@/api/CeramicsController";
import { toApiError } from "@/api/_axios-client";
import CeramicCategoryManager from "@/components/admin/ceramics/CeramicCategoryManager";
import CeramicProductEditor from "@/components/admin/ceramics/CeramicProductEditor";
import { action, danger, panel, primary } from "@/components/admin/ceramics/styles";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useTranslations } from "@/components/hooks/useTranslations";
import CeramicGallery from "@/components/ceramics/CeramicGallery";
import CeramicImage from "@/components/ceramics/CeramicImage";
import { getAdminSession } from "@/lib/admin-auth";
import { ceramicPrice } from "@/lib/ceramics";

type ProductPanel =
  | { mode: "create" }
  | { mode: "view" | "edit"; product: CeramicProduct };

const date = new Intl.DateTimeFormat("el-GR", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Athens",
});

export default function CeramicDashboardPage() {
  const { common } = useTranslations();
  const [authorized, setAuthorized] = useState<boolean>();
  const [sessionAttempt, setSessionAttempt] = useState(0);
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [categories, setCategories] = useState<CeramicCategory[]>();
  const [categoryError, setCategoryError] = useState(false);
  const [categoryRevision, setCategoryRevision] = useState(0);
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<CeramicProductPage>();
  const [productError, setProductError] = useState(false);
  const [productRevision, setProductRevision] = useState(0);
  const [selection, setSelection] = useState<ProductPanel>();
  const [busy, setBusy] = useState(false);
  const [editorBusy, setEditorBusy] = useState(false);
  const [editorDirty, setEditorDirty] = useState(false);
  const actionsBusy = busy || editorBusy;
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getAdminSession().then((session) => {
      if (active) setAuthorized(session?.authenticated === true);
    });
    return () => { active = false; };
  }, [sessionAttempt]);

  useEffect(() => {
    if (!authorized) return;
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
  }, [authorized, categoryRevision]);

  useEffect(() => {
    if (!authorized) return;
    const request = new AbortController();
    CeramicsApi.products({ page }, request.signal).then(
      (data) => {
        if (request.signal.aborted) return;
        if (page > 1 && data.items.length === 0) {
          setPage(page - 1);
          return;
        }
        setProducts(data);
        setProductError(false);
      },
      () => { if (!request.signal.aborted) setProductError(true); },
    );
    return () => request.abort();
  }, [authorized, page, productRevision]);

  function refreshProducts() {
    setProductError(false);
    setProductRevision((current) => current + 1);
  }

  function refreshCategories() {
    setCategoryError(false);
    setCategoryRevision((current) => current + 1);
  }

  function confirmDiscard() {
    return !editorDirty || window.confirm("Να απορριφθούν οι μη αποθηκευμένες αλλαγές;");
  }

  function closeEditor() {
    setSelection(undefined);
    setEditorDirty(false);
  }

  function changeTab(next: "products" | "categories") {
    if (actionsBusy || next === tab || !confirmDiscard()) return;
    closeEditor();
    setTab(next);
    setNotice("");
  }

  function changePage(next: number) {
    if (actionsBusy || !confirmDiscard()) return;
    closeEditor();
    setProducts(undefined);
    setPage(next);
  }

  async function openProduct(id: number, mode: "view" | "edit") {
    if (actionsBusy || (selection?.mode === mode && selection.product.id === id) || !confirmDiscard()) return;
    setBusy(true);
    setNotice("");
    try {
      setSelection({ mode, product: await CeramicsApi.product(id) });
      setEditorDirty(false);
    } catch (reason) {
      setError(toApiError(reason).message);
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(product: CeramicProductCard) {
    const deletingEditedProduct = selection?.mode === "edit" && selection.product.id === product.id;
    const discardNotice = deletingEditedProduct && editorDirty ? " Οι μη αποθηκευμένες αλλαγές θα χαθούν." : "";
    if (actionsBusy || !window.confirm(`Διαγραφή προϊόντος «${product.title}»;${discardNotice}`)) return;
    setBusy(true);
    setNotice("");
    try {
      await CeramicsApi.removeProduct(product.id);
      if (deletingEditedProduct) closeEditor();
      refreshProducts();
      setNotice("Το προϊόν διαγράφηκε.");
    } catch (reason) {
      setError(toApiError(reason).message);
    } finally {
      setBusy(false);
    }
  }

  function renderEditor(product?: CeramicProduct) {
    if (!categories) return null;
    return (
      <CeramicProductEditor
        key={product?.id ?? "new"}
        product={product}
        categories={categories}
        requestBusy={busy}
        onDirtyChange={setEditorDirty}
        onSavingChange={setEditorBusy}
        onClose={closeEditor}
        onPartialSave={refreshProducts}
        onSaved={() => {
          closeEditor();
          refreshProducts();
          setNotice("Το προϊόν αποθηκεύτηκε.");
        }}
      />
    );
  }

  return (
    <section className="mx-auto min-h-[70vh] max-w-6xl space-y-5 px-4 py-8 text-slate-800 md:px-6 md:py-12 lg:px-8">
      <Head>
        <title>{`${common.nav.ceramics} | Dashboard`}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <header>
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
          >
            ← Πίσω στο Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {common.nav.ceramics}
          </h1>
        </div>
        {authorized && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ενότητες κεραμικών">
            <button type="button" disabled={actionsBusy} aria-pressed={tab === "products"} className={tab === "products" ? primary : action} onClick={() => changeTab("products")}>Προϊόντα</button>
            <button type="button" disabled={actionsBusy} aria-pressed={tab === "categories"} className={tab === "categories" ? primary : action} onClick={() => changeTab("categories")}>Κατηγορίες</button>
          </div>
        )}
      </header>

      {authorized === undefined && <p role="status">Έλεγχος σύνδεσης…</p>}
      {authorized === false && (
        <p role="alert">
          Δεν επιβεβαιώθηκε η σύνδεση διαχειριστή.{" "}
          <button type="button" className="underline" onClick={() => { setAuthorized(undefined); setSessionAttempt((current) => current + 1); }}>Δοκιμή ξανά</button>
        </p>
      )}
      {authorized && (categoryError || !categories) && (
        categoryError
          ? <p role="alert">Δεν ήταν δυνατή η φόρτωση των κατηγοριών. <button type="button" className="underline" onClick={refreshCategories}>Δοκιμή ξανά</button></p>
          : <p role="status">Φόρτωση κατηγοριών…</p>
      )}
      {authorized && tab === "categories" && categories && (
        <CeramicCategoryManager categories={categories} onDirtyChange={setEditorDirty} onBusyChange={setEditorBusy} onChange={() => { refreshCategories(); refreshProducts(); }} />
      )}
      {authorized && tab === "products" && (
        <>
          {notice && <p role="status" className="text-sm font-medium text-[rgb(var(--primary-dark))]">{notice}</p>}
          {selection?.mode === "view" && (
            <section className={panel}>
              <div className="mb-4 flex flex-wrap gap-2">
                <button type="button" className={action} onClick={() => setSelection(undefined)}>← Προϊόντα</button>
                <button type="button" className={primary} disabled={!categories} onClick={() => setSelection({ ...selection, mode: "edit" })}>Επεξεργασία</button>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <CeramicGallery images={selection.product.images} title={selection.product.title} labels={{ previous: "Προηγούμενη εικόνα", next: "Επόμενη εικόνα", image: "Εικόνα" }} />
                <div className="min-w-0 space-y-2 break-words">
                  <p className="text-sm text-primary">{selection.product.category.name}</p>
                  <h2 className="text-2xl font-semibold">{selection.product.title}</h2>
                  <p>{ceramicPrice(selection.product.price)}</p>
                  <p className="text-sm text-slate-600">{date.format(new Date(selection.product.createdAt))}</p>
                  <p className="whitespace-pre-wrap">{selection.product.description}</p>
                </div>
              </div>
            </section>
          )}
          {selection?.mode !== "view" && (
            <section className={panel} aria-busy={actionsBusy || (!products && !productError)}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Προϊόντα</h2>
                <button type="button" className={primary} disabled={actionsBusy || !categories?.length} aria-expanded={selection?.mode === "create"} onClick={() => {
                  if (selection?.mode === "create" || !confirmDiscard()) return;
                  closeEditor();
                  setNotice("");
                  setSelection({ mode: "create" });
                }}>Νέο προϊόν</button>
              </div>
              {selection?.mode === "create" && <div className="mt-4">{renderEditor()}</div>}
              {categories?.length === 0 && <p className="mt-3 text-sm">Προσθέστε πρώτα μια κατηγορία.</p>}
              {productError && <p role="alert" className="mt-3">Δεν ήταν δυνατή η φόρτωση των προϊόντων. <button type="button" className="underline" onClick={refreshProducts}>Δοκιμή ξανά</button></p>}
              {!products && !productError && <p role="status" className="mt-3">Φόρτωση προϊόντων…</p>}
              {products?.items.length === 0 && <p className="mt-3">Δεν υπάρχουν προϊόντα.</p>}
              <ul className="mt-4 divide-y divide-slate-200">
                {products?.items.map((product) => (
                  <li key={product.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 py-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto]">
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                      <CeramicImage url={product.primaryImageUrl} alt="" sizes="64px" />
                    </div>
                    <div className="min-w-0 break-words">
                      <p className="font-semibold">{product.title}</p>
                      <p className="text-sm text-slate-600">{product.category.name} · {ceramicPrice(product.price)} · {date.format(new Date(product.createdAt))}</p>
                      <p className="text-sm text-slate-600">
                        {product.stockQuantity > 0 ? `Διαθέσιμα: ${product.stockQuantity}` : "Εξαντλήθηκε"}
                      </p>
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1">
                      <button type="button" disabled={actionsBusy} className={action} onClick={() => void openProduct(product.id, "view")}>Προβολή</button>
                      <button type="button" disabled={actionsBusy || !categories} aria-expanded={selection?.mode === "edit" && selection.product.id === product.id} className={action} onClick={() => void openProduct(product.id, "edit")}>Επεξεργασία</button>
                      <button type="button" disabled={actionsBusy} className={danger} onClick={() => void removeProduct(product)}>Διαγραφή</button>
                    </div>
                    {selection?.mode === "edit" && selection.product.id === product.id && (
                      <div className="col-span-full min-w-0">{renderEditor(selection.product)}</div>
                    )}
                  </li>
                ))}
              </ul>
              {(page > 1 || products?.hasNextPage) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button type="button" className={action} disabled={actionsBusy || page <= 1} onClick={() => changePage(page - 1)}>← Προηγούμενη</button>
                  <span className="text-sm">Σελίδα {page}</span>
                  <button type="button" className={action} disabled={actionsBusy || !products?.hasNextPage} onClick={() => changePage(page + 1)}>Επόμενη →</button>
                </div>
              )}
            </section>
          )}
        </>
      )}
      <GeneralErrorDialog open={!!error} message={error} onClose={() => setError("")} />
    </section>
  );
}
