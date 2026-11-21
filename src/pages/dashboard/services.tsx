import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ProvidedServicesApi,
  type ProvidedServicesGetDto,
  type ProvidedServicesPostDto,
} from "@/api/ProvidedServicesController";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import BilingualSaveWarning from "@/components/admin/BilingualSaveWarning";
import ContentLanguageSwitch, { type ContentLanguage } from "@/components/admin/ContentLanguageSwitch";
import { useBilingualSaveGuard } from "@/components/admin/useBilingualSaveGuard";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import {
  addValidationError,
  errorInputClass,
  validateImageFile,
} from "@/lib/form-validation";
import type { ApiFieldErrors } from "@/api/_axios-client";
import PageHeaderEditor from "@/components/admin/PageHeaderEditor";

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

const EMPTY_CREATE_FORM: ProvidedServicesPostDto = {
  category: "",
  categoryEn: "",
  duration: 60,
  title: "",
  titleEn: "",
  description: "",
  descriptionEn: "",
  priceIncludingVAT: 0,
  imageFile: null,
  imageAssetId: null,
};

type ProvidedServiceDraft = ProvidedServicesGetDto & {
  imageFile?: File | null;
};

function validateService(value: ProvidedServicesPostDto): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  if (!value.title.trim()) {
    addValidationError(errors, "title", "Ο τίτλος είναι υποχρεωτικός.");
  }

  if (!value.category.trim()) {
    addValidationError(errors, "category", "Η κατηγορία είναι υποχρεωτική.");
  }

  if (Number(value.duration) <= 0) {
    addValidationError(
      errors,
      "duration",
      "Η διάρκεια πρέπει να είναι μεγαλύτερη από 0.",
    );
  }

  if (Number(value.priceIncludingVAT) < 0) {
    addValidationError(
      errors,
      "priceIncludingVAT",
      "Η τιμή δεν μπορεί να είναι αρνητική.",
    );
  }

  validateImageFile(value.imageFile, "imageFile", errors);

  return errors;
}

export default function ManagementServicesPage() {
  const [all, setAll] = useState<ProvidedServicesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] =
    useState<ProvidedServicesPostDto>(EMPTY_CREATE_FORM);
  const {
    generalError: pageGeneralError,
    applyApiError: applyPageApiError,
    closeGeneralError: closePageGeneralError,
  } = useFormErrors();

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);

      const data = await ProvidedServicesApi.list();
      setAll(data);

      setActiveCategory((current) => current || data[0]?.category || "");
    } catch (error: unknown) {
      console.error(error);

      applyPageApiError(error, "Δεν ήταν δυνατή η φόρτωση των υπηρεσιών.");
    } finally {
      setLoading(false);
    }
  }, [applyPageApiError]);

  const categories = useMemo(() => {
    return Array.from(new Set(all.map((s) => s.category).filter(Boolean)));
  }, [all]);

  const list = useMemo(() => {
    if (!activeCategory) return all;
    return all.filter((s) => s.category === activeCategory);
  }, [all, activeCategory]);

  function openCreateModal() {
    setCreateForm({
      ...EMPTY_CREATE_FORM,
      category: activeCategory || "",
    });

    setCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;

    setCreateModalOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
  }

  async function handleCreateSubmit() {
    try {
      setCreating(true);

      const payload: ProvidedServicesPostDto = {
        category: createForm.category.trim(),
        categoryEn: createForm.categoryEn?.trim() ?? "",
        duration: Number(createForm.duration),
        title: createForm.title.trim(),
        titleEn: createForm.titleEn?.trim() ?? "",
        description: createForm.description.trim(),
        descriptionEn: createForm.descriptionEn?.trim() ?? "",
        priceIncludingVAT: Number(createForm.priceIncludingVAT),
        imageFile: createForm.imageFile ?? null,
        imageAssetId: createForm.imageFile
          ? null
          : (createForm.imageAssetId ?? null),
      };

      const created = await ProvidedServicesApi.create(payload);

      setAll((prev) => [...prev, created]);

      if (!activeCategory) {
        setActiveCategory(created.category);
      }

      if (created.category) {
        setActiveCategory(created.category);
      }

      setCreateModalOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
      setToast("Δημιουργήθηκε η υπηρεσία.");
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(service: ProvidedServiceDraft) {
    try {
      setBusyId(service.id);

      const payload: ProvidedServicesPostDto = {
        category: service.category.trim(),
        categoryEn: service.categoryEn?.trim() ?? "",
        duration: Number(service.duration),
        title: service.title.trim(),
        titleEn: service.titleEn?.trim() ?? "",
        description: service.description.trim(),
        descriptionEn: service.descriptionEn?.trim() ?? "",
        priceIncludingVAT: Number(service.priceIncludingVAT),
        imageFile: service.imageFile ?? null,
        imageAssetId: service.imageFile ? null : (service.imageAssetId ?? null),
      };

      await ProvidedServicesApi.update(service.id, payload);

      const fresh = await ProvidedServicesApi.get(service.id);
      setAll((prev) => prev.map((x) => (x.id === service.id ? fresh : x)));
      setToast("Αποθηκεύτηκε.");
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή υπηρεσίας; Η ενέργεια δεν μπορεί να αναιρεθεί.")) {
      return;
    }

    try {
      setBusyId(id);

      await ProvidedServicesApi.remove(id);

      const remaining = all.filter((x) => x.id !== id);
      setAll(remaining);

      setActiveCategory((prev) => {
        if (remaining.some((x) => x.category === prev)) return prev;
        return remaining[0]?.category || "";
      });

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      applyPageApiError(error, "Δεν ήταν δυνατή η διαγραφή της υπηρεσίας.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Διαχείριση | ΥΠΗΡΕΣΙΕΣ</title>
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
                ΥΠΗΡΕΣΙΕΣ
              </h1>
            </div>

            <Link
              href="/services"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
            >
              Προβολή σελίδας
            </Link>
          </div>

          <PageHeaderEditor
            pageKey="services"
            fallbackTitle="Υπηρεσίες Διατροφής"
            fallbackDescription="Σε αυτή τη σελίδα θα βρείτε συγκεντρωμένες τις διαθέσιμες υπηρεσίες και τους βασικούς τρόπους επικοινωνίας."
          />

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map((category) => {
                    const sel = category === activeCategory;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={cx(
                          "px-3 md:px-4 py-2 rounded-full text-sm font-medium transition",
                          sel
                            ? "bg-[rgb(var(--primary))] text-white"
                            : "bg-white border border-slate-200 hover:border-[rgb(var(--primary))]",
                        )}
                      >
                        {category}
                      </button>
                    );
                  })
                ) : (
                  <span className="text-sm text-slate-500">
                    Δεν υπάρχουν ακόμη κατηγορίες.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="rounded-full px-4 py-2 text-sm font-semibold transition bg-[rgb(var(--primary))] text-white hover:shadow"
              >
                Νέα υπηρεσία
              </button>
            </div>
          </Card>

          {loading ? (
            <Card className="p-6">
              <p>Φόρτωση…</p>
            </Card>
          ) : list.length === 0 ? (
            <Card className="p-6 text-slate-600">
              Δεν υπάρχουν υπηρεσίες σε αυτή την κατηγορία.
            </Card>
          ) : (
            <div className="space-y-6">
              {list.map((svc) => (
                <ServiceEditorCard
                  key={svc.id}
                  svc={svc}
                  busy={busyId === svc.id}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {createModalOpen && (
          <CreateServiceModal
            form={createForm}
            setForm={setCreateForm}
            creating={creating}
            onClose={closeCreateModal}
            onSubmit={handleCreateSubmit}
          />
        )}

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg z-[70]">
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

function CreateServiceModal({
  form,
  setForm,
  creating,
  onClose,
  onSubmit,
}: {
  form: ProvidedServicesPostDto;
  setForm: React.Dispatch<React.SetStateAction<ProvidedServicesPostDto>>;
  creating: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  const {
    fieldErrors,
    generalError,
    clearFieldError,
    applyFrontendErrors,
    applyApiError,
    closeGeneralError,
  } = useFormErrors();

  const [language, setLanguage] = useState<ContentLanguage>("el");
  const saveGuard = useBilingualSaveGuard(setLanguage);

  async function performCreate() {
    const errors = validateService(form);

    if (!applyFrontendErrors(errors)) {
      return;
    }

    try {
      await onSubmit();
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η δημιουργία της υπηρεσίας.");
    }
  }

  function submitCreateForm() {
    saveGuard.requestSave(
      [form.title, form.category, form.description],
      [form.titleEn, form.categoryEn, form.descriptionEn],
      performCreate,
    );
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
      />

      <div className="relative z-[61] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Νέα υπηρεσία
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Συμπλήρωσε πρώτα τα στοιχεία και μετά δημιούργησε την υπηρεσία.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="space-y-5 px-5 py-5" data-bilingual-form tabIndex={-1}>
          <ContentLanguageSwitch value={language} onChange={setLanguage} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Τίτλος{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="text"
                value={language === "el" ? form.title : form.titleEn ?? ""}
                onChange={(e) => {
                  setForm((current) => ({
                    ...current,
                    [language === "el" ? "title" : "titleEn"]: e.target.value,
                  }));

                  clearFieldError("title");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.title),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.title} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Κατηγορία{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="text"
                value={language === "el" ? form.category : form.categoryEn ?? ""}
                onChange={(e) => {
                  setForm((d) => ({
                    ...d,
                    [language === "el" ? "category" : "categoryEn"]: e.target.value,
                  }));

                  clearFieldError("category");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.category),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.category} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Διάρκεια{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="number"
                min={0}
                value={form.duration}
                onChange={(e) => {
                  setForm((current) => ({
                    ...current,
                    duration: Number(e.target.value),
                  }));

                  clearFieldError("duration");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.duration),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.duration} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Τιμή με ΦΠΑ{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="number"
                min={0}
                step="0.01"
                value={form.priceIncludingVAT}
                onChange={(e) => {
                  setForm((current) => ({
                    ...current,
                    priceIncludingVAT: Number(e.target.value),
                  }));

                  clearFieldError("priceIncludingVAT");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.priceIncludingVAT),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.priceIncludingVAT} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Αρχείο εικόνας
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  setForm((current) => ({
                    ...current,
                    imageFile: e.target.files?.[0] ?? null,
                  }));

                  clearFieldError("imageFile");
                  clearFieldError("imageAssetId");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.imageFile || fieldErrors.imageAssetId),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              {form.imageFile && (
                <p className="mt-2 text-xs text-slate-500">
                  Επιλέχθηκε: {form.imageFile.name}
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Περιγραφή
            </label>

            <RichTextEditor
              value={language === "el" ? form.description : form.descriptionEn ?? ""}
              onChange={(html) => setForm((d) => ({ ...d, [language === "el" ? "description" : "descriptionEn"]: html }))}
              placeholder="Γράψε την περιγραφή της υπηρεσίας..."
              minHeight={180}
            />
          </div>

          {false && <EnglishServiceFields
            form={form}
            onChange={(key, value) =>
              setForm((current) => ({ ...current, [key]: value }))
            }
          />}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500 mb-2">
              Προεπισκόπηση περιγραφής
            </p>

            {form.description ? (
              <RichHtmlRenderer html={form.description} />
            ) : (
              <p className="text-sm text-slate-500">Δεν υπάρχει περιγραφή.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
          >
            Άκυρο
          </button>

          <button
            type="button"
            onClick={submitCreateForm}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating
                ? "bg-[rgba(var(--primary),0.7)] text-white cursor-wait"
                : "bg-[rgb(var(--primary))] text-white hover:shadow",
            )}
          >
            {creating ? "Δημιουργία…" : "Δημιουργία υπηρεσίας"}
          </button>
        </div>
      </div>
      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
        onRetry={submitCreateForm}
      />
      <BilingualSaveWarning {...saveGuard.warningProps} />
    </div>
  );
}

function ServiceEditorCard({
  svc,
  busy,
  onSave,
  onDelete,
}: {
  svc: ProvidedServicesGetDto;
  busy: boolean;
  onSave: (s: ProvidedServiceDraft) => void | Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState<ProvidedServiceDraft>({
    ...svc,
    imageFile: null,
  });
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<ContentLanguage>("el");
  const [localizedDirty, setLocalizedDirty] = useState(false);
  const saveGuard = useBilingualSaveGuard(setLanguage);
  const [fileInputKey, setFileInputKey] = useState(0);
  const {
    fieldErrors,
    generalError,
    clearFieldError,
    clearAllErrors,
    applyFrontendErrors,
    applyApiError,
    closeGeneralError,
  } = useFormErrors();

  async function performSaveService() {
    const payload: ProvidedServicesPostDto = {
      category: draft.category,
      duration: draft.duration,
      title: draft.title,
      description: draft.description,
      priceIncludingVAT: draft.priceIncludingVAT,
      imageFile: draft.imageFile ?? null,
      imageAssetId: draft.imageFile ? null : (draft.imageAssetId ?? null),
    };

    const errors = validateService(payload);

    if (!applyFrontendErrors(errors)) {
      setOpen(true);
      return;
    }

    try {
      await onSave(draft);
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η αποθήκευση της υπηρεσίας.");
    }
  }

  function saveService() {
    saveGuard.requestSave(
      [draft.title, draft.category, draft.description],
      [draft.titleEn, draft.categoryEn, draft.descriptionEn],
      performSaveService,
      localizedDirty,
    );
  }

  useEffect(() => {
    setDraft({
      ...svc,
      imageFile: null,
    });

    clearAllErrors();
    setLocalizedDirty(false);
  }, [svc, clearAllErrors]);

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.title || "(Χωρίς τίτλο)"}
          </h3>

          <p className="text-sm text-slate-600 mt-1">
            {draft.category || "(Χωρίς κατηγορία)"}
          </p>

          <p className="text-xs text-slate-500 mt-1">ID: {draft.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
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
        <div className="mt-5 space-y-6" data-bilingual-form tabIndex={-1}>
          <ContentLanguageSwitch value={language} onChange={setLanguage} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Τίτλος{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="text"
                value={language === "el" ? draft.title : draft.titleEn ?? ""}
                onChange={(e) => {
                  setDraft((current) => ({
                    ...current,
                    [language === "el" ? "title" : "titleEn"]: e.target.value,
                  }));
                  setLocalizedDirty(true);

                  clearFieldError("title");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.title),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.title} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Κατηγορία{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="text"
                value={language === "el" ? draft.category : draft.categoryEn ?? ""}
                onChange={(e) => {
                  setDraft((current) => ({
                    ...current,
                    [language === "el" ? "category" : "categoryEn"]: e.target.value,
                  }));
                  setLocalizedDirty(true);

                  clearFieldError("category");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.category),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.category} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Διάρκεια{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="number"
                min={0}
                value={draft.duration}
                onChange={(e) => {
                  setDraft((current) => ({
                    ...current,
                    duration: Number(e.target.value),
                  }));

                  clearFieldError("duration");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.duration),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.duration} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Τιμή με ΦΠΑ{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.priceIncludingVAT}
                onChange={(e) => {
                  setDraft((current) => ({
                    ...current,
                    priceIncludingVAT: Number(e.target.value),
                  }));

                  clearFieldError("priceIncludingVAT");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.priceIncludingVAT),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={fieldErrors.priceIncludingVAT} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Νέα εικόνα
              </label>

              <input
                key={fileInputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  setDraft((current) => ({
                    ...current,
                    imageFile: e.target.files?.[0] ?? null,
                  }));

                  clearFieldError("imageFile");
                  clearFieldError("imageAssetId");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.imageFile || fieldErrors.imageAssetId),
                  "mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              {draft.imageFile ? (
                <p className="mt-2 text-xs text-slate-500">
                  Νέα εικόνα: {draft.imageFile.name}
                </p>
              ) : draft.imageUrl ? (
                <p className="mt-2 text-xs text-slate-500">
                  Τρέχουσα εικόνα: {draft.imageUrl}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">
                  Δεν υπάρχει εικόνα.
                </p>
              )}

              {draft.imageFile || draft.imageUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft((current) => ({
                      ...current,
                      imageFile: null,
                      imageAssetId: null,
                      imageUrl: null,
                    }));

                    clearFieldError("imageFile");
                    clearFieldError("imageAssetId");
                    setFileInputKey((key) => key + 1);
                  }}
                  className="mt-3 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300"
                >
                  Αφαίρεση εικόνας
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Περιγραφή
            </label>

            <RichTextEditor
              value={language === "el" ? draft.description : draft.descriptionEn ?? ""}
              onChange={(html) => {
                setDraft((d) => ({ ...d, [language === "el" ? "description" : "descriptionEn"]: html }));
                setLocalizedDirty(true);
              }}
              placeholder="Γράψε την περιγραφή της υπηρεσίας..."
              minHeight={200}
            />
          </div>

          {false && <EnglishServiceFields
            form={draft}
            onChange={(key, value) =>
              setDraft((current) => ({ ...current, [key]: value }))
            }
          />}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500 mb-2">
              Προεπισκόπηση περιγραφής
            </p>

            {draft.description ? (
              <RichHtmlRenderer html={draft.description} />
            ) : (
              <p className="text-sm text-slate-500">Δεν υπάρχει περιγραφή.</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveService}
              disabled={busy}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                busy
                  ? "bg-[rgba(var(--primary),0.7)] text-white cursor-wait"
                  : "bg-[rgb(var(--primary))] text-white hover:shadow",
              )}
            >
              {busy ? "Αποθήκευση…" : "Αποθήκευση"}
            </button>
            <button
              type="button"
              onClick={() => {
                clearAllErrors();

                setDraft({
                  ...svc,
                  imageFile: null,
                });
                setLocalizedDirty(false);

                setFileInputKey((key) => key + 1);
              }}
              className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
            >
              Επαναφορά αλλαγών
            </button>
          </div>
        </div>
      )}
      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
        onRetry={saveService}
      />
      <BilingualSaveWarning {...saveGuard.warningProps} />
    </Card>
  );
}

function EnglishServiceFields({
  form,
  onChange,
}: {
  form: ProvidedServicesPostDto;
  onChange: (
    key: "titleEn" | "categoryEn" | "descriptionEn",
    value: string,
  ) => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-700">English</p>
      {([[
        "titleEn",
        "Title (EN)",
      ], ["categoryEn", "Category (EN)"]] as const).map(([key, label]) => (
        <label key={key} className="block text-sm font-medium text-slate-700">
          {label}
          <input
            value={form[key] ?? ""}
            onChange={(event) => onChange(key, event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </label>
      ))}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Description (EN)
        </label>
        <RichTextEditor
          value={form.descriptionEn ?? ""}
          onChange={(html) => onChange("descriptionEn", html)}
          placeholder="Write the service description in English..."
          minHeight={180}
        />
      </div>
    </div>
  );
}
