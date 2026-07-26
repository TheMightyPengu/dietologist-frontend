import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createSeminar,
  deleteSeminar,
  getSeminarById,
  getSeminars,
  updateSeminar,
  type Seminar,
  type SeminarPayload,
} from "@/api/SeminarsController";
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
      "rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-[rgba(var(--border),0.8)]",
      className,
    )}
  >
    {children}
  </div>
);

function fmtDateHuman(iso: string) {
  const d = new Date(iso);

  if (!iso || isNaN(d.getTime())) {
    return "Ημερομηνία σύντομα";
  }

  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function toDateTimeLocalValue(iso: string) {
  const d = new Date(iso);

  if (!iso || isNaN(d.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function dateTimeLocalToIso(value: string) {
  if (!value) return "";

  const d = new Date(value);

  if (isNaN(d.getTime())) {
    return "";
  }

  return d.toISOString();
}

function createEmptySeminar(): Seminar {
  return {
    id: 0,
    title: "",
    description: "",
    content: "",
    imageUrl: null,
    imageAssetId: null,
    imageAltText: "",
    price: 0,
    duration: 60,
    dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    type: "Online",
  } as Seminar;
}

function toPayload(sem: Seminar, imageFile: File | null): SeminarPayload {
  return {
    title: sem.title,
    description: sem.description,
    content: sem.content,

    imageFile,
    imageAssetId: sem.imageAssetId ?? null,

    price: Number(sem.price) || 0,
    duration: Number(sem.duration) || 0,
    dateTime: sem.dateTime || new Date().toISOString(),
    type: sem.type,
  };
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function validateSeminar(
  seminar: Seminar,
  imageFile: File | null,
): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  if (!seminar.title.trim()) {
    addValidationError(errors, "title", "Ο τίτλος είναι υποχρεωτικός.");
  }

  if (isRichTextBlank(seminar.description)) {
    addValidationError(
      errors,
      "description",
      "Η σύντομη περιγραφή είναι υποχρεωτική.",
    );
  }

  if (isRichTextBlank(seminar.content)) {
    addValidationError(
      errors,
      "content",
      "Το αναλυτικό περιεχόμενο είναι υποχρεωτικό.",
    );
  }

  if (Number(seminar.price) < 0) {
    addValidationError(errors, "price", "Η τιμή δεν μπορεί να είναι αρνητική.");
  }

  if (Number(seminar.duration) <= 0) {
    addValidationError(
      errors,
      "duration",
      "Η διάρκεια πρέπει να είναι μεγαλύτερη από 0.",
    );
  }

  if (!seminar.dateTime || Number.isNaN(new Date(seminar.dateTime).getTime())) {
    addValidationError(
      errors,
      "dateTime",
      "Η ημερομηνία και ώρα είναι υποχρεωτική.",
    );
  }

  if (!["Online", "Office", "Both"].includes(seminar.type)) {
    addValidationError(errors, "type", "Επιλέξτε έγκυρο τύπο σεμιναρίου.");
  }

  validateImageFile(imageFile, "imageFile", errors);

  return errors;
}
export default function ManagementSeminarsPage() {
  const [all, setAll] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const {
    generalError: pageGeneralError,
    applyApiError: applyPageApiError,
    closeGeneralError: closePageGeneralError,
  } = useFormErrors();

  async function loadSeminars() {
    try {
      setLoading(true);

      const data = await getSeminars();

      setAll(data);
    } catch (error: unknown) {
      console.error(error);

      applyPageApiError(error, "Δεν ήταν δυνατή η φόρτωση των σεμιναρίων.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSeminars();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (!query.trim()) return all;

    const q = query.toLowerCase();

    return all.filter((s) =>
      [
        s.title,
        stripHtml(s.description),
        stripHtml(s.content),
        s.type,
        String(s.price),
        String(s.duration),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [all, query]);

  async function handleCreate(seminar: Seminar, imageFile: File | null) {
    try {
      setCreating(true);

      const created = await createSeminar(toPayload(seminar, imageFile));

      setAll((previous) => [created, ...previous]);

      setToast("Δημιουργήθηκε.");
      setCreateOpen(false);
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(seminar: Seminar, imageFile: File | null) {
    try {
      setBusyId(seminar.id);

      await updateSeminar(seminar.id, toPayload(seminar, imageFile));

      const fresh = await getSeminarById(seminar.id);

      setAll((previous) =>
        previous.map((item) => (item.id === seminar.id ? fresh : item)),
      );

      setToast("Αποθηκεύτηκε.");
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή σεμιναρίου;")) {
      return;
    }

    try {
      setBusyId(id);

      await deleteSeminar(id);

      setAll((previous) => previous.filter((item) => item.id !== id));

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      applyPageApiError(error, "Δεν ήταν δυνατή η διαγραφή του σεμιναρίου.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Διαχείριση | ΣΕΜΙΝΑΡΙΑ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-[rgb(var(--bg))] text-[rgb(var(--ink))]">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
              >
                ← Πίσω στο Dashboard
              </Link>

              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                ΣΕΜΙΝΑΡΙΑ
              </h1>
            </div>

            <Link
              href="/seminars"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
            >
              Προβολή σελίδας
            </Link>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Αναζήτηση σεμιναρίων…"
                className="w-full md:w-80 rounded-xl border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
              />

              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[rgb(var(--primary-dark))]"
              >
                Νέο σεμινάριο
              </button>
            </div>
          </Card>

          {loading ? (
            <Card className="p-6">
              <p>Φόρτωση…</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-6 text-[rgb(var(--muted))]">Καμία εγγραφή.</Card>
          ) : (
            <div className="space-y-6">
              {filtered.map((sem) => (
                <SeminarEditorCard
                  key={sem.id}
                  sem={sem}
                  busy={busyId === sem.id}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
        {createOpen && (
          <CreateSeminarModal
            creating={creating}
            onClose={() => {
              if (!creating) {
                setCreateOpen(false);
              }
            }}
            onSubmit={handleCreate}
          />
        )}
        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
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

function CreateSeminarModal({
  creating,
  onClose,
  onSubmit,
}: {
  creating: boolean;
  onClose: () => void;
  onSubmit: (seminar: Seminar, imageFile: File | null) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<Seminar>(createEmptySeminar);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    fieldErrors,
    generalError,
    clearFieldError,
    applyFrontendErrors,
    applyApiError,
    closeGeneralError,
  } = useFormErrors();

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);

    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  async function submitSeminar() {
    const errors = validateSeminar(draft, selectedImage);

    if (!applyFrontendErrors(errors)) {
      return;
    }

    try {
      await onSubmit(draft, selectedImage);
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η δημιουργία του σεμιναρίου.");
    }
  }

  const imageHasError = Boolean(
    fieldErrors.imageFile || fieldErrors.imageAssetId,
  );

  const priceText = Number(draft.price) > 0 ? `${draft.price}€` : "ΔΩΡΕΑΝ";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Νέο σεμινάριο"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
        onClick={onClose}
        disabled={creating}
        aria-label="Κλείσιμο"
      />

      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[rgba(var(--border),0.9)] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[rgba(var(--border),0.9)] px-5 py-4">
          <h3 className="text-lg font-semibold">Νέο σεμινάριο</h3>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-5 lg:col-span-2">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
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
                    "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                  )}
                />

                <FormFieldError errors={fieldErrors.title} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                    Τιμή{" "}
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
                      "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                    )}
                  />

                  <FormFieldError errors={fieldErrors.price} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                    Διάρκεια σε λεπτά{" "}
                    <span className="text-rose-600" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={draft.duration}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        duration: Number(event.target.value),
                      }));

                      clearFieldError("duration");
                    }}
                    className={errorInputClass(
                      Boolean(fieldErrors.duration),
                      "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                    )}
                  />

                  <FormFieldError errors={fieldErrors.duration} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                    Τύπος{" "}
                    <span className="text-rose-600" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <select
                    value={draft.type}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        type: event.target.value,
                      }));

                      clearFieldError("type");
                    }}
                    className={errorInputClass(
                      Boolean(fieldErrors.type),
                      "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                    )}
                  >
                    <option value="Online">Online</option>
                    <option value="Office">Στο γραφείο</option>
                    <option value="Both">Και τα δύο</option>
                  </select>

                  <FormFieldError errors={fieldErrors.type} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                    Ημερομηνία και ώρα{" "}
                    <span className="text-rose-600" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(draft.dateTime)}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        dateTime: dateTimeLocalToIso(event.target.value),
                      }));

                      clearFieldError("dateTime");
                    }}
                    className={errorInputClass(
                      Boolean(fieldErrors.dateTime),
                      "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                    )}
                  />

                  <FormFieldError errors={fieldErrors.dateTime} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Εικόνα σεμιναρίου
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;

                    setSelectedImage(file);

                    clearFieldError("imageFile");
                    clearFieldError("imageAssetId");

                    event.target.value = "";
                  }}
                  className={cx(
                    "mt-1 block w-full rounded-lg border-2 border-dashed bg-slate-50 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(var(--primary))] file:px-3 file:py-1.5 file:text-white",
                    imageHasError ? "border-rose-500" : "border-slate-300",
                  )}
                />

                {selectedImage && (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="break-all text-xs text-[rgb(var(--muted))]">
                      Επιλέχθηκε: {selectedImage.name}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      className="text-xs text-rose-700 underline underline-offset-2"
                    >
                      Αφαίρεση
                    </button>
                  </div>
                )}

                <FormFieldError
                  errors={[
                    ...(fieldErrors.imageFile ?? []),
                    ...(fieldErrors.imageAssetId ?? []),
                  ]}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--ink))]">
                  Σύντομη περιγραφή{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
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
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        description: value,
                      }));

                      clearFieldError("description");
                    }}
                    placeholder="Σύντομη περιγραφή του σεμιναρίου..."
                    minHeight={160}
                  />
                </div>

                <FormFieldError errors={fieldErrors.description} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[rgb(var(--ink))]">
                  Αναλυτικό περιεχόμενο{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </label>

                <div
                  className={
                    fieldErrors.content ? "rounded-xl ring-2 ring-rose-400" : ""
                  }
                >
                  <RichTextEditor
                    value={draft.content}
                    onChange={(value) => {
                      setDraft((current) => ({
                        ...current,
                        content: value,
                      }));

                      clearFieldError("content");
                    }}
                    placeholder="Αναλυτικό περιεχόμενο σεμιναρίου..."
                    minHeight={240}
                  />
                </div>

                <FormFieldError errors={fieldErrors.content} />
              </div>

              <FormFieldError errors={fieldErrors.form} />
            </div>

            <div className="lg:col-span-1">
              <div className="overflow-hidden rounded-2xl border border-[rgba(var(--border),0.9)] bg-white shadow-sm">
                <div className="relative aspect-[16/10] bg-[rgba(var(--primary),0.08)]">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={draft.title || "Εικόνα σεμιναρίου"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center text-sm text-[rgb(var(--muted))]">
                      Δεν έχει επιλεγεί εικόνα
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
                    <span>{draft.type}</span>
                    <span>•</span>
                    <span>{draft.duration || 0}′</span>
                  </div>

                  <h4 className="mt-2 text-base font-semibold">
                    {draft.title || "Τίτλος σεμιναρίου"}
                  </h4>

                  {draft.description ? (
                    <RichHtmlRenderer
                      html={draft.description}
                      className="mt-2 line-clamp-3 text-sm text-[rgb(var(--muted))]"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                      Η σύντομη περιγραφή θα εμφανιστεί εδώ.
                    </p>
                  )}

                  <p className="mt-3 text-sm font-semibold">{priceText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[rgba(var(--border),0.9)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
          >
            Άκυρο
          </button>

          <button
            type="button"
            onClick={submitSeminar}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating
                ? "cursor-wait bg-[rgba(var(--primary),0.65)] text-white"
                : "bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-dark))]",
            )}
          >
            {creating ? "Δημιουργία…" : "Δημιουργία"}
          </button>
        </div>
      </div>

      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
        onRetry={submitSeminar}
      />
    </div>
  );
}

function SeminarEditorCard({
  sem,
  busy,
  onSave,
  onDelete,
}: {
  sem: Seminar;
  busy: boolean;
  onSave: (seminar: Seminar, imageFile: File | null) => void | Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState<Seminar>(sem);

  const [open, setOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    setDraft(sem);
    setSelectedImage(null);
    setImagePreview(null);
    clearAllErrors();
  }, [sem, clearAllErrors]);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);

    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  const priceText = draft.price > 0 ? `${draft.price}€` : "ΔΩΡΕΑΝ";

  const existingImage = draft.imageUrl?.trim()
    ? toMediaUrl(draft.imageUrl)
    : null;

  const displayedImage = imagePreview || existingImage;

  function handleImageSelection(file: File) {
    clearFieldError("imageFile");
    clearFieldError("imageAssetId");
    setSelectedImage(file);
  }

  function clearSelectedImage() {
    clearFieldError("imageFile");
    clearFieldError("imageAssetId");
    setSelectedImage(null);
    setImagePreview(null);
  }

  function resetChanges() {
    clearAllErrors();
    setDraft(sem);
    setSelectedImage(null);
    setImagePreview(null);
  }

  async function saveSeminar() {
    const errors = validateSeminar(draft, selectedImage);

    if (!applyFrontendErrors(errors)) {
      setOpen(true);
      return;
    }

    try {
      await onSave(draft, selectedImage);
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η αποθήκευση του σεμιναρίου.");
    }
  }

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.title || "(Χωρίς τίτλο)"}
          </h3>

          <p className="mt-1 text-xs text-[rgb(var(--muted))]">
            {draft.type || "Τύπος σύντομα"} • {fmtDateHuman(draft.dateTime)} •{" "}
            {draft.duration || 0}′ • {priceText}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
          >
            {open ? "Σύμπτυξη" : "Επέκταση"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(draft.id)}
            disabled={busy}
            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            Διαγραφή
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--ink))]">
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
                  "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.title} />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgb(var(--ink))]">
                Σύντομη περιγραφή{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
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
                  onChange={(value) => {
                    setDraft((current) => ({
                      ...current,
                      description: value,
                    }));

                    clearFieldError("description");
                  }}
                  placeholder="Σύντομη περιγραφή του σεμιναρίου..."
                  minHeight={150}
                />
              </div>

              <FormFieldError errors={fieldErrors.description} />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[rgb(var(--ink))]">
                Αναλυτικό περιεχόμενο{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <div
                className={
                  fieldErrors.content ? "rounded-xl ring-2 ring-rose-400" : ""
                }
              >
                <RichTextEditor
                  value={draft.content}
                  onChange={(value) => {
                    setDraft((current) => ({
                      ...current,
                      content: value,
                    }));

                    clearFieldError("content");
                  }}
                  placeholder="Αναλυτικό περιεχόμενο σεμιναρίου..."
                  minHeight={240}
                />
              </div>

              <FormFieldError errors={fieldErrors.content} />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                Εικόνα σεμιναρίου
              </label>

              <div
                className={cx(
                  "mt-2 rounded-xl border bg-[rgba(var(--surface-soft),0.5)] p-4",
                  fieldErrors.imageFile || fieldErrors.imageAssetId
                    ? "border-rose-400"
                    : "border-[rgba(var(--border),0.9)]",
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-4 py-2 text-sm font-medium hover:border-[rgb(var(--primary))]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                          return;
                        }

                        handleImageSelection(file);
                        event.target.value = "";
                      }}
                    />
                    Επιλογή εικόνας
                  </label>

                  {selectedImage && (
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="text-sm text-[rgb(var(--muted))] underline underline-offset-2"
                    >
                      Καθαρισμός επιλογής
                    </button>
                  )}
                </div>

                {selectedImage ? (
                  <p className="mt-3 break-all text-xs text-[rgb(var(--muted))]">
                    Επιλεγμένο αρχείο: {selectedImage.name}
                  </p>
                ) : draft.imageUrl ? (
                  <p className="mt-3 text-xs text-[rgb(var(--muted))]">
                    Χρησιμοποιείται η ήδη αποθηκευμένη εικόνα.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-[rgb(var(--muted))]">
                    Δεν έχει επιλεγεί εικόνα.
                  </p>
                )}

                <FormFieldError
                  errors={[
                    ...(fieldErrors.imageFile ?? []),
                    ...(fieldErrors.imageAssetId ?? []),
                  ]}
                />
              </div>
            </div>

            {/* Numeric and date fields */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Τιμή{" "}
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
                    "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                  )}
                />

                <FormFieldError errors={fieldErrors.price} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Διάρκεια λεπτά{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </label>

                <input
                  type="number"
                  min={0}
                  value={draft.duration}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      duration: Number(event.target.value),
                    }));

                    clearFieldError("duration");
                  }}
                  className={errorInputClass(
                    Boolean(fieldErrors.duration),
                    "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                  )}
                />

                <FormFieldError errors={fieldErrors.duration} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Τύπος{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </label>

                <select
                  value={draft.type}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      type: event.target.value,
                    }));

                    clearFieldError("type");
                  }}
                  className={errorInputClass(
                    Boolean(fieldErrors.type),
                    "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                  )}
                >
                  <option value="Online">Online</option>

                  <option value="Office">Στο γραφείο</option>

                  <option value="Both">Και τα δύο</option>
                </select>

                <FormFieldError errors={fieldErrors.type} />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Ημερομηνία και ώρα{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </label>

                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(draft.dateTime)}
                  onChange={(event) => {
                    setDraft((current) => ({
                      ...current,
                      dateTime: dateTimeLocalToIso(event.target.value),
                    }));

                    clearFieldError("dateTime");
                  }}
                  className={errorInputClass(
                    Boolean(fieldErrors.dateTime),
                    "mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                  )}
                />

                <FormFieldError errors={fieldErrors.dateTime} />
              </div>
            </div>

            <FormFieldError errors={fieldErrors.form} />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveSeminar}
                disabled={busy}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  busy
                    ? "cursor-wait bg-[rgba(var(--primary),0.65)] text-white"
                    : "bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-dark))]",
                )}
              >
                {busy ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>

              <button
                type="button"
                onClick={resetChanges}
                disabled={busy}
                className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
              >
                Επαναφορά αλλαγών
              </button>

              <button
                type="button"
                onClick={() => onDelete(draft.id)}
                disabled={busy}
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
              >
                Διαγραφή
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-[rgba(var(--border),0.9)] bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-[rgba(var(--primary),0.08)]">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt={
                      draft.imageAltText || draft.title || "Εικόνα σεμιναρίου"
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center px-4 text-center text-sm text-[rgb(var(--muted))]">
                    Δεν υπάρχει εικόνα
                  </div>
                )}
              </div>

              <div className="border-t border-[rgba(var(--border),0.9)] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[rgb(var(--muted))]">
                  <span className="rounded-full bg-[rgba(var(--accent-soft),0.7)] px-2 py-0.5">
                    {draft.type || "Τύπος"}
                  </span>

                  <span>•</span>

                  <span>{fmtDateHuman(draft.dateTime)}</span>

                  <span>•</span>

                  <span>{draft.duration || 0}’</span>
                </div>

                <h4 className="mt-2 text-base font-semibold">
                  {draft.title || "Τίτλος"}
                </h4>

                <RichHtmlRenderer
                  html={draft.description}
                  className="mt-1 line-clamp-3 text-sm text-[rgb(var(--muted))]"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{priceText}</span>

                  <button
                    type="button"
                    className="rounded-full bg-[rgb(var(--primary))] px-3 py-1.5 text-xs text-white"
                  >
                    Κράτηση θέσης
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
        onRetry={saveSeminar}
      />
    </Card>
  );
}
