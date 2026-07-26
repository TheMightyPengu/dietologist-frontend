import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  EbooksApi,
  type EbooksGetDto,
  type EbooksPostDto,
} from "@/api/EbooksController";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import {
  addValidationError,
  errorInputClass,
  isRichTextBlank,
  validateImageFile,
  validatePdfFile,
} from "@/lib/form-validation";
import { toMediaUrl, type ApiFieldErrors } from "@/api/_axios-client";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50",
      className,
    )}
  >
    {children}
  </div>
);

type EbookFormDraft = {
  id?: number;

  title: string;
  author: string;
  description: string;
  tableOfContents: string;
  price: number;
  publishedAt: string;

  coverImageAssetId?: number | null;
  coverImageUrl?: string | null;
  coverImageFile: File | null;

  pdfAssetId?: number | null;
  fileUrl?: string | null;
  fileName?: string | null;
  file: File | null;
};

function fmtDateHuman(iso: string) {
  try {
    const d = new Date(iso);

    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

function toInputDate(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function getEmptyDraft(): EbookFormDraft {
  return {
    title: "",
    author: "",
    description: "",
    tableOfContents: "",
    price: 0,
    publishedAt: new Date().toISOString(),

    coverImageAssetId: null,
    coverImageUrl: null,
    coverImageFile: null,

    pdfAssetId: null,
    fileUrl: null,
    fileName: null,
    file: null,
  };
}

function ebookToDraft(ebook: EbooksGetDto): EbookFormDraft {
  return {
    id: ebook.id,

    title: ebook.title ?? "",
    author: ebook.author ?? "",
    description: ebook.description ?? "",
    tableOfContents: ebook.tableOfContents ?? "",
    price: Number(ebook.price) || 0,
    publishedAt: ebook.publishedAt || new Date().toISOString(),

    coverImageAssetId: ebook.coverImageAssetId ?? null,
    coverImageUrl: ebook.coverImageUrl ?? null,
    coverImageFile: null,

    pdfAssetId: ebook.pdfAssetId ?? null,
    fileUrl: ebook.fileUrl ?? null,
    fileName: ebook.fileName ?? null,
    file: null,
  };
}

function draftToPayload(draft: EbookFormDraft): EbooksPostDto {
  return {
    title: draft.title.trim(),
    author: draft.author.trim(),
    description: draft.description.trim(),
    tableOfContents: draft.tableOfContents.trim(),
    price: Number(draft.price),
    publishedAt: draft.publishedAt,

    coverImageFile: draft.coverImageFile,
    coverImageAssetId: draft.coverImageFile
      ? null
      : (draft.coverImageAssetId ?? null),

    file: draft.file,
    pdfAssetId: draft.file ? null : (draft.pdfAssetId ?? null),
  };
}

function validateEbook(draft: EbookFormDraft): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  const title = draft.title.trim();
  const author = draft.author.trim();

  if (!title) {
    addValidationError(errors, "title", "Ο τίτλος είναι υποχρεωτικός.");
  } else if (title.length > 300) {
    addValidationError(
      errors,
      "title",
      "Ο τίτλος δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.",
    );
  }

  if (author.length > 200) {
    addValidationError(
      errors,
      "author",
      "Ο συγγραφέας δεν μπορεί να ξεπερνά τους 200 χαρακτήρες.",
    );
  }

  if (isRichTextBlank(draft.tableOfContents)) {
    addValidationError(
      errors,
      "tableOfContents",
      "Ο πίνακας περιεχομένων είναι υποχρεωτικός.",
    );
  }

  if (!Number.isFinite(Number(draft.price)) || Number(draft.price) < 0) {
    addValidationError(errors, "price", "Η τιμή δεν μπορεί να είναι αρνητική.");
  }

  if (
    !draft.publishedAt ||
    Number.isNaN(new Date(draft.publishedAt).getTime())
  ) {
    addValidationError(
      errors,
      "publishedAt",
      "Επιλέξτε έγκυρη ημερομηνία δημοσίευσης.",
    );
  }

  validateImageFile(draft.coverImageFile, "coverImageFile", errors);

  validatePdfFile(draft.file, "file", errors);

  return errors;
}

export default function ManagementEbookPage() {
  const [ebooks, setEbooks] = useState<EbooksGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const {
    generalError: pageGeneralError,
    applyApiError: applyPageApiError,
    closeGeneralError: closePageGeneralError,
  } = useFormErrors();

  const loadEbooks = useCallback(async () => {
    try {
      setLoading(true);

      const data = await EbooksApi.list();

      setEbooks(data);
    } catch (error: unknown) {
      console.error(error);

      applyPageApiError(error, "Δεν ήταν δυνατή η φόρτωση των ebooks.");
    } finally {
      setLoading(false);
    }
  }, [applyPageApiError]);

  useEffect(() => {
    void loadEbooks();
  }, [loadEbooks]);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSubmit(draft: EbookFormDraft) {
    try {
      setSavingId(draft.id ?? "new");

      const payload = draftToPayload(draft);

      if (draft.id) {
        await EbooksApi.update(draft.id, payload);

        setToast("Αποθηκεύτηκε.");
      } else {
        await EbooksApi.create(payload);

        setShowCreateForm(false);
        setToast("Δημιουργήθηκε.");
      }

      await loadEbooks();
    } catch (error: unknown) {
      console.error(error);

      /*
       * SingleEbookForm catches this and displays
       * field errors or its general popup.
       */
      throw error;
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή ebook;")) {
      return;
    }

    try {
      setDeletingId(id);

      await EbooksApi.remove(id);

      setEbooks((current) => current.filter((ebook) => ebook.id !== id));

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      applyPageApiError(error, "Δεν ήταν δυνατή η διαγραφή του ebook.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Διαχείριση | Ebook</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
              >
                ← Πίσω στο Dashboard
              </Link>

              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                EBOOK
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm((current) => !current)}
                className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white hover:bg-[rgb(var(--primary-dark))]"
              >
                {showCreateForm ? "Ακύρωση δημιουργίας" : "Νέο ebook"}
              </button>

              {ebooks.length > 0 && (
                <Link
                  href="/ebook"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
                >
                  Προβολή σελίδας
                </Link>
              )}
            </div>
          </div>

          {loading ? (
            <Card className="p-6">
              <p>Φόρτωση…</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {showCreateForm && (
                <SingleEbookForm
                  key="new"
                  initialDraft={getEmptyDraft()}
                  saving={savingId === "new"}
                  deleting={false}
                  isExisting={false}
                  onSubmit={handleSubmit}
                  onDelete={() => undefined}
                  onReset={() => setShowCreateForm(false)}
                />
              )}

              {ebooks.length === 0 && !showCreateForm ? (
                <Card className="p-6">
                  <p className="text-slate-600">Δεν υπάρχουν ebooks.</p>
                </Card>
              ) : (
                ebooks.map((ebook) => (
                  <SingleEbookForm
                    key={ebook.id}
                    initialDraft={ebookToDraft(ebook)}
                    saving={savingId === ebook.id}
                    deleting={deletingId === ebook.id}
                    isExisting
                    onSubmit={handleSubmit}
                    onDelete={() => handleDelete(ebook.id)}
                    onReset={loadEbooks}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {toast && (
          <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
            {toast}
          </div>
        )}

        <GeneralErrorDialog
          open={Boolean(pageGeneralError)}
          title={pageGeneralError?.title}
          message={pageGeneralError?.message ?? ""}
          onClose={closePageGeneralError}
        />
      </div>
    </>
  );
}

function SingleEbookForm({
  initialDraft,
  saving,
  deleting,
  isExisting,
  onSubmit,
  onDelete,
  onReset,
}: {
  initialDraft: EbookFormDraft;
  saving: boolean;
  deleting: boolean;
  isExisting: boolean;
  onSubmit: (draft: EbookFormDraft) => void | Promise<void>;
  onDelete: () => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<EbookFormDraft>(initialDraft);

  const [open, setOpen] = useState(!isExisting);

  const {
    fieldErrors,
    generalError,
    clearFieldError,
    clearAllErrors,
    applyFrontendErrors,
    applyApiError,
    closeGeneralError,
  } = useFormErrors();

  useEffect(() => {
    setDraft(initialDraft);
    clearAllErrors();
  }, [
    initialDraft.id,
    initialDraft.title,
    initialDraft.author,
    initialDraft.description,
    initialDraft.tableOfContents,
    initialDraft.price,
    initialDraft.publishedAt,
    initialDraft.coverImageAssetId,
    initialDraft.coverImageUrl,
    initialDraft.pdfAssetId,
    initialDraft.fileUrl,
    initialDraft.fileName,
    clearAllErrors,
  ]);

  function resetChanges() {
    clearAllErrors();
    setDraft(initialDraft);

    if (!isExisting) {
      onReset();
    }
  }

  async function submitForm() {
    const errors = validateEbook(draft);

    if (!applyFrontendErrors(errors)) {
      setOpen(true);
      return;
    }

    try {
      await onSubmit(draft);
    } catch (error: unknown) {
      applyApiError(
        error,
        isExisting
          ? "Δεν ήταν δυνατή η αποθήκευση του ebook."
          : "Δεν ήταν δυνατή η δημιουργία του ebook.",
      );
    }
  }

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {isExisting
              ? draft.title || "Ebook χωρίς τίτλο"
              : "Δημιουργία ebook"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isExisting
              ? `${draft.author || "Χωρίς συγγραφέα"} • ${fmtDateHuman(
                  draft.publishedAt,
                )}`
              : "Συμπλήρωσε τα στοιχεία για να δημιουργήσεις νέο ebook."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
          >
            {open ? "Σύμπτυξη" : "Επεξεργασία"}
          </button>

          {isExisting && (
            <button
              type="button"
              onClick={onDelete}
              disabled={saving || deleting}
              className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
            >
              {deleting ? "Διαγραφή…" : "Διαγραφή"}
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <BasicEbookFields
              draft={draft}
              setDraft={setDraft}
              fieldErrors={fieldErrors}
              clearFieldError={clearFieldError}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Περιγραφή ebook
              </label>

              <div
                className={
                  fieldErrors.description
                    ? "rounded-xl ring-2 ring-rose-400"
                    : ""
                }
              >
                <RichTextEditor
                  value={draft.description}
                  onChange={(html) => {
                    setDraft((current) => ({
                      ...current,
                      description: html,
                    }));

                    clearFieldError("description");
                  }}
                  placeholder="Περιγραφή του ebook..."
                  minHeight={180}
                />
              </div>

              <FormFieldError errors={fieldErrors.description} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Πίνακας περιεχομένων{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <div
                className={
                  fieldErrors.tableOfContents
                    ? "rounded-xl ring-2 ring-rose-400"
                    : ""
                }
              >
                <RichTextEditor
                  value={draft.tableOfContents}
                  onChange={(html) => {
                    setDraft((current) => ({
                      ...current,
                      tableOfContents: html,
                    }));

                    clearFieldError("tableOfContents");
                  }}
                  placeholder="Προσθέστε τις ενότητες και τα κεφάλαια του ebook..."
                  minHeight={180}
                />
              </div>

              <FormFieldError errors={fieldErrors.tableOfContents} />
            </div>

            <FormFieldError errors={fieldErrors.form} />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={submitForm}
                disabled={saving || deleting}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  saving
                    ? "cursor-wait bg-[rgba(var(--primary),0.7)] text-white"
                    : "bg-[rgb(var(--primary))] text-white hover:shadow",
                )}
              >
                {saving
                  ? isExisting
                    ? "Αποθήκευση…"
                    : "Δημιουργία…"
                  : isExisting
                    ? "Αποθήκευση"
                    : "Δημιουργία ebook"}
              </button>

              <button
                type="button"
                onClick={resetChanges}
                disabled={saving || deleting}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          <EbookPreview draft={draft} />
        </div>
      )}

      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
        onRetry={submitForm}
      />
    </Card>
  );
}

function BasicEbookFields({
  draft,
  setDraft,
  fieldErrors,
  clearFieldError,
}: {
  draft: EbookFormDraft;
  setDraft: React.Dispatch<React.SetStateAction<EbookFormDraft>>;
  fieldErrors: ApiFieldErrors;
  clearFieldError: (fieldName: string) => void;
}) {
  const pdfHasError = Boolean(fieldErrors.file || fieldErrors.pdfAssetId);

  const coverHasError = Boolean(
    fieldErrors.coverImageFile || fieldErrors.coverImageAssetId,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Τίτλος{" "}
            <span className="text-rose-600" aria-hidden="true">
              *
            </span>
          </label>

          <input
            value={draft.title}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                title: event.target.value,
              }));

              clearFieldError("title");
            }}
            className={errorInputClass(
              Boolean(fieldErrors.title),
              "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
            )}
          />

          <FormFieldError errors={fieldErrors.title} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Συγγραφέας
          </label>

          <input
            value={draft.author}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                author: event.target.value,
              }));

              clearFieldError("author");
            }}
            className={errorInputClass(
              Boolean(fieldErrors.author),
              "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
            )}
          />

          <FormFieldError errors={fieldErrors.author} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Τιμή (€){" "}
            <span className="text-rose-600" aria-hidden="true">
              *
            </span>
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.price}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                price: Number(event.target.value),
              }));

              clearFieldError("price");
            }}
            className={errorInputClass(
              Boolean(fieldErrors.price),
              "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
            )}
          />

          <FormFieldError errors={fieldErrors.price} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Ημερομηνία δημοσίευσης{" "}
            <span className="text-rose-600" aria-hidden="true">
              *
            </span>
          </label>

          <input
            type="date"
            value={toInputDate(draft.publishedAt)}
            onChange={(event) => {
              const value = event.target.value;

              setDraft((current) => ({
                ...current,
                publishedAt: value
                  ? new Date(`${value}T00:00:00`).toISOString()
                  : "",
              }));

              clearFieldError("publishedAt");
            }}
            className={errorInputClass(
              Boolean(fieldErrors.publishedAt),
              "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
            )}
          />

          <FormFieldError errors={fieldErrors.publishedAt} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Αρχείο ebook
          </label>

          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;

              setDraft((current) => ({
                ...current,
                file,
              }));

              clearFieldError("file");
              clearFieldError("pdfAssetId");

              event.target.value = "";
            }}
            className={cx(
              "mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(var(--primary))] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90",
              pdfHasError ? "border-rose-500" : "border-slate-300",
            )}
          />

          {draft.file ? (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-xs text-slate-500">
                Επιλεγμένο PDF: {draft.file.name}
              </p>

              <button
                type="button"
                onClick={() => {
                  setDraft((current) => ({
                    ...current,
                    file: null,
                  }));

                  clearFieldError("file");

                  clearFieldError("pdfAssetId");
                }}
                className="text-xs underline underline-offset-2"
              >
                Καθαρισμός επιλογής
              </button>
            </div>
          ) : draft.fileName ? (
            <p className="mt-2 text-xs text-slate-500">
              Υπάρχον PDF: {draft.fileName}
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">Δεν υπάρχει PDF.</p>
          )}

          <FormFieldError
            errors={[
              ...(fieldErrors.file ?? []),
              ...(fieldErrors.pdfAssetId ?? []),
            ]}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Εξώφυλλο ebook
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;

            setDraft((current) => ({
              ...current,
              coverImageFile: file,
            }));

            clearFieldError("coverImageFile");

            clearFieldError("coverImageAssetId");

            event.target.value = "";
          }}
          className={cx(
            "mt-1 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(var(--primary))] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90",
            coverHasError ? "border-rose-500" : "border-slate-300",
          )}
        />

        {draft.coverImageFile ? (
          <div className="mt-2 flex items-center gap-3">
            <p className="text-xs text-slate-500">
              Επιλεγμένο: {draft.coverImageFile.name}
            </p>

            <button
              type="button"
              onClick={() => {
                setDraft((current) => ({
                  ...current,
                  coverImageFile: null,
                }));

                clearFieldError("coverImageFile");

                clearFieldError("coverImageAssetId");
              }}
              className="text-xs underline underline-offset-2"
            >
              Καθαρισμός επιλογής
            </button>
          </div>
        ) : draft.coverImageUrl ? (
          <p className="mt-2 text-xs text-slate-500">
            Χρησιμοποιείται το υπάρχον εξώφυλλο.
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Δεν υπάρχει εξώφυλλο.</p>
        )}

        <FormFieldError
          errors={[
            ...(fieldErrors.coverImageFile ?? []),
            ...(fieldErrors.coverImageAssetId ?? []),
          ]}
        />
      </div>
    </>
  );
}

function EbookPreview({ draft }: { draft: EbookFormDraft }) {
  const [localCoverPreview, setLocalCoverPreview] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!draft.coverImageFile) {
      setLocalCoverPreview(null);
      return;
    }

    const url = URL.createObjectURL(draft.coverImageFile);
    setLocalCoverPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [draft.coverImageFile]);

  const existingCover = draft.coverImageUrl
    ? draft.coverImageUrl.startsWith("http://") ||
      draft.coverImageUrl.startsWith("https://")
      ? draft.coverImageUrl
      : toMediaUrl(draft.coverImageUrl)
    : null;

  const cover =
    localCoverPreview || existingCover || "/images/ebook-placeholder.jpg";

  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-[4/5] bg-slate-100">
          <Image
            src={cover}
            alt={draft.title || "ebook cover"}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 className="text-2xl font-bold">EBOOK</h4>

        <h5 className="mt-1 text-xl font-semibold">
          {draft.title || "Τίτλος"}
        </h5>

        <p className="mt-1 text-slate-600">{draft.author || "Συγγραφέας"}</p>

        {draft.description && (
          <RichHtmlRenderer
            html={draft.description}
            className="ebook-rich-content mt-3 text-sm text-slate-600"
          />
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
          <span className="rounded-full bg-slate-100 px-2 py-1">
            {draft.price}€
          </span>

          <span className="rounded-full bg-slate-100 px-2 py-1">
            {fmtDateHuman(draft.publishedAt)}
          </span>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">
            Πίνακας περιεχομένων
          </p>

          <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            {draft.tableOfContents || "Δεν υπάρχουν περιεχόμενα."}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          {draft.file
            ? `Νέο PDF: ${draft.file.name}`
            : draft.fileName
              ? `Υπάρχον PDF: ${draft.fileName}`
              : "Δεν υπάρχει PDF."}
        </div>
      </div>
    </div>
  );
}