import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArticlesApi,
  type ArticlesGetDto,
  type ArticlesPostDto,
} from "@/api/ArticlesController";
import {
  RecipesApi,
  type RecipesGetDto,
  type RecipesPostDto,
} from "@/api/RecipesController";
import { toMediaUrl, type ApiFieldErrors } from "@/api/_axios-client";
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
import PageHeaderEditor from "@/components/admin/PageHeaderEditor";

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const fieldClass =
  "mt-1 w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 shadow-sm outline-none transition " +
  "placeholder:text-slate-400 focus:border-[rgb(var(--primary))] focus:ring-4 focus:ring-[rgba(var(--primary),0.2)]";

const fileClass =
  "mt-1 block w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm " +
  "file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(var(--primary))] file:px-3 file:py-1.5 file:text-white";

const searchClass =
  "w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2 shadow-sm outline-none transition " +
  "placeholder:text-slate-400 focus:border-[rgb(var(--primary))] focus:ring-4 focus:ring-[rgba(var(--primary),0.2)] md:w-80";

const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={cx(
      "rounded-2xl border border-[rgba(var(--border),0.8)] bg-white/80 shadow-sm backdrop-blur-sm",
      className,
    )}
  >
    {children}
  </div>
);

const NEW_CATEGORY_OPTION = "__new_category__";

function getUniqueCategories(
  values: Array<string | null | undefined>,
): string[] {
  const categories = new Map<string, string>();

  values.forEach((value) => {
    const trimmed = value?.trim();

    if (!trimmed) {
      return;
    }

    const normalized = trimmed.toLocaleLowerCase("el-GR");

    if (!categories.has(normalized)) {
      categories.set(normalized, trimmed);
    }
  });

  return Array.from(categories.values()).sort((first, second) =>
    first.localeCompare(second, "el-GR"),
  );
}

function CategoryField({
  categories,
  value,
  onChange,
  error,
  required = false,
}: {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string[];
  required?: boolean;
}) {
  const trimmedValue = value.trim();

  const valueExists = categories.some(
    (category) =>
      category.toLocaleLowerCase("el-GR") ===
      trimmedValue.toLocaleLowerCase("el-GR"),
  );

  const [creatingNew, setCreatingNew] = useState(
    Boolean(trimmedValue && !valueExists),
  );

  useEffect(() => {
    if (!trimmedValue) {
      return;
    }

    setCreatingNew(!valueExists);
  }, [trimmedValue, valueExists]);

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedValue = event.target.value;

    if (selectedValue === NEW_CATEGORY_OPTION) {
      setCreatingNew(true);
      onChange("");
      return;
    }

    setCreatingNew(false);
    onChange(selectedValue);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        Κατηγορία{" "}
        {required && (
          <span className="text-rose-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <select
        value={
          creatingNew
            ? NEW_CATEGORY_OPTION
            : valueExists
              ? categories.find(
                  (category) =>
                    category.toLocaleLowerCase("el-GR") ===
                    trimmedValue.toLocaleLowerCase("el-GR"),
                )
              : ""
        }
        onChange={handleSelectChange}
        className={errorInputClass(Boolean(error), fieldClass)}
      >
        <option value="">Επιλέξτε κατηγορία</option>

        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}

        <option value={NEW_CATEGORY_OPTION}>
          + Δημιουργία νέας κατηγορίας
        </option>
      </select>

      {creatingNew && (
        <input
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Γράψτε τη νέα κατηγορία"
          className={errorInputClass(Boolean(error), fieldClass)}
        />
      )}

      <FormFieldError errors={error} />
    </div>
  );
}

type Tab = "articles" | "recipes";

function fmtDate(iso?: string | null) {
  if (!iso) {
    return "—";
  }

  try {
    const date = new Date(iso);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

function toDateInput(iso?: string | null): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function dateInputToIso(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function createEmptyArticle(): ArticlesPostDto {
  return {
    title: "",
    subtitle: "",
    heading: "",
    content: "",
    publishedAt: new Date().toISOString(),
    category: "",
    imageFile: null,
  };
}

function createEmptyRecipe(): RecipesPostDto {
  return {
    title: "",
    ingredients: "",
    category: "",
    instructions: "",
    timeToPrepare: 0,
    description: "",
    createdAt: new Date().toISOString(),
    imageFile: null,
  };
}

function articleToDraft(row: ArticlesGetDto): ArticlesPostDto {
  return {
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    heading: row.heading ?? "",
    content: row.content ?? "",
    publishedAt: row.publishedAt ?? new Date().toISOString(),
    category: row.category ?? "",
    imageFile: null,
  };
}

function recipeToDraft(row: RecipesGetDto): RecipesPostDto {
  return {
    title: row.title ?? "",
    ingredients: row.ingredients ?? "",
    category: row.category ?? "",
    instructions: row.instructions ?? "",
    timeToPrepare: row.timeToPrepare ?? 0,
    description: row.description ?? "",
    createdAt: row.createdAt ?? new Date().toISOString(),
    imageFile: null,
  };
}

function validateArticle(value: ArticlesPostDto): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  const title = value.title?.trim() ?? "";

  const category = value.category?.trim() ?? "";

  if (!title) {
    addValidationError(errors, "title", "Ο τίτλος είναι υποχρεωτικός.");
  } else if (title.length > 300) {
    addValidationError(
      errors,
      "title",
      "Ο τίτλος δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.",
    );
  }

  if (!category) {
    addValidationError(errors, "category", "Η κατηγορία είναι υποχρεωτική.");
  } else if (category.length > 100) {
    addValidationError(
      errors,
      "category",
      "Η κατηγορία δεν μπορεί να ξεπερνά τους 100 χαρακτήρες.",
    );
  }

  if (isRichTextBlank(value.content)) {
    addValidationError(errors, "content", "Το περιεχόμενο είναι υποχρεωτικό.");
  }

  if (
    !value.publishedAt ||
    Number.isNaN(new Date(value.publishedAt).getTime())
  ) {
    addValidationError(
      errors,
      "publishedAt",
      "Επιλέξτε έγκυρη ημερομηνία δημοσίευσης.",
    );
  }

  validateImageFile(value.imageFile, "imageFile", errors);

  return errors;
}

function validateRecipe(value: RecipesPostDto): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  const title = value.title?.trim() ?? "";

  if (!title) {
    addValidationError(errors, "title", "Ο τίτλος είναι υποχρεωτικός.");
  } else if (title.length > 300) {
    addValidationError(
      errors,
      "title",
      "Ο τίτλος δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.",
    );
  }

  if (isRichTextBlank(value.description)) {
    addValidationError(errors, "description", "Η περιγραφή είναι υποχρεωτική.");
  }

  if (isRichTextBlank(value.ingredients)) {
    addValidationError(errors, "ingredients", "Τα υλικά είναι υποχρεωτικά.");
  }

  if (isRichTextBlank(value.instructions)) {
    addValidationError(
      errors,
      "instructions",
      "Οι οδηγίες είναι υποχρεωτικές.",
    );
  }

  if (Number(value.timeToPrepare) <= 0) {
    addValidationError(
      errors,
      "timeToPrepare",
      "Ο χρόνος προετοιμασίας πρέπει να είναι μεγαλύτερος από 0.",
    );
  }

  validateImageFile(value.imageFile, "imageFile", errors);

  return errors;
}

export default function ManagementBlogPage() {
  const [active, setActive] = useState<Tab>("articles");

  return (
    <>
      <Head>
        <title>Διαχείριση | BLOG</title>

        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
              >
                ← Πίσω στο Dashboard
              </Link>

              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                BLOG
              </h1>
            </div>

            <Link
              href={active === "articles" ? "/articles" : "/recipes"}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
            >
              Προβολή σελίδας
            </Link>
          </div>

          <Card className="mb-6 p-4 md:p-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActive("articles")}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active === "articles"
                    ? "bg-[rgb(var(--primary))] text-white"
                    : "border border-slate-200 bg-white hover:border-[rgb(var(--primary))]",
                )}
              >
                Άρθρα
              </button>

              <button
                type="button"
                onClick={() => setActive("recipes")}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active === "recipes"
                    ? "bg-[rgb(var(--primary))] text-white"
                    : "border border-slate-200 bg-white hover:border-[rgb(var(--primary))]",
                )}
              >
                Συνταγές
              </button>
            </div>
          </Card>

          {active === "articles" ? (
            <PageHeaderEditor
              key="articles"
              pageKey="articles"
              fallbackTitle="Άρθρα"
              fallbackDescription="Επιμελημένο περιεχόμενο για υγιεινή, απολαυστική και ισορροπημένη καθημερινότητα. Αναζητήστε θέματα που σας ενδιαφέρουν ή περιηγηθείτε στις κατηγορίες."
            />
          ) : (
            <PageHeaderEditor
              key="recipes"
              pageKey="recipes"
              fallbackTitle="Συνταγές"
              fallbackDescription="Αναζήτηση, φίλτρα, ταξινόμηση και σελιδοποίηση."
            />
          )}

          {active === "articles" ? <ArticlesManager /> : <RecipesManager />}
        </div>
      </div>
    </>
  );
}

/* ================= ARTICLES ================= */

function ArticlesManager() {
  const [all, setAll] = useState<ArticlesGetDto[]>([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [busyId, setBusyId] = useState<number | null>(null);

  const [query, setQuery] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [createDraft, setCreateDraft] =
    useState<ArticlesPostDto>(createEmptyArticle);

  const { generalError, applyApiError, closeGeneralError } = useFormErrors();

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await ArticlesApi.list();

      setAll(data);
    } catch (error: unknown) {
      console.error(error);

      applyApiError(error, "Δεν ήταν δυνατή η φόρτωση των άρθρων.");
    } finally {
      setLoading(false);
    }
  }, [applyApiError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return all;
    }

    return all.filter((article) =>
      [
        article.title,
        article.subtitle,
        article.heading,
        article.content,
        article.category,
      ]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [all, query]);

  const categories = useMemo(
    () => getUniqueCategories(all.map((article) => article.category)),
    [all],
  );

  async function onCreateSubmit() {
    try {
      setCreating(true);

      const created = await ArticlesApi.create({
        ...createDraft,
        title: createDraft.title.trim(),
        subtitle: createDraft.subtitle.trim(),
        heading: createDraft.heading.trim(),
        content: createDraft.content.trim(),
        category: createDraft.category.trim(),
      });

      setAll((current) => [created, ...current]);

      setToast("Δημιουργήθηκε.");
      setCreateOpen(false);
      setCreateDraft(createEmptyArticle());
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setCreating(false);
    }
  }

  async function onSave(id: number, payload: ArticlesPostDto) {
    try {
      setBusyId(id);

      await ArticlesApi.update(id, {
        ...payload,
        title: payload.title.trim(),
        subtitle: payload.subtitle.trim(),
        heading: payload.heading.trim(),
        content: payload.content.trim(),
        category: payload.category.trim(),
      });

      const fresh = await ArticlesApi.get(id);

      setAll((current) =>
        current.map((article) => (article.id === id ? fresh : article)),
      );

      setToast("Αποθηκεύτηκε.");
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Διαγραφή άρθρου;")) {
      return;
    }

    try {
      setBusyId(id);

      await ArticlesApi.remove(id);

      setAll((current) => current.filter((article) => article.id !== id));

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      applyApiError(error, "Δεν ήταν δυνατή η διαγραφή του άρθρου.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="mb-6 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Αναζήτηση άρθρων…"
            className={searchClass}
          />

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:shadow"
          >
            Νέο άρθρο
          </button>
        </div>
      </Card>

      {loading ? (
        <Card className="p-6">
          <p>Φόρτωση…</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-slate-600">Καμία εγγραφή.</Card>
      ) : (
        <div className="space-y-6">
          {filtered.map((article) => (
            <ArticleEditorCard
              key={article.id}
              row={article}
              categories={categories}
              busy={busyId === article.id}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateArticleModal
          draft={createDraft}
          setDraft={setCreateDraft}
          categories={categories}
          creating={creating}
          onClose={() => {
            if (creating) {
              return;
            }

            setCreateOpen(false);
            setCreateDraft(createEmptyArticle());
          }}
          onSubmit={onCreateSubmit}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
      />
    </>
  );
}

function CreateArticleModal({
  draft,
  setDraft,
  categories,
  creating,
  onClose,
  onSubmit,
}: {
  draft: ArticlesPostDto;
  setDraft: React.Dispatch<React.SetStateAction<ArticlesPostDto>>;
  categories: string[];
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

  async function submitArticle() {
    const errors = validateArticle(draft);

    if (!applyFrontendErrors(errors)) {
      return;
    }

    try {
      await onSubmit();
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η δημιουργία του άρθρου.");
    }
  }

  const imageHasError = Boolean(
    fieldErrors.imageFile || fieldErrors.imageAssetId,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Νέο άρθρο</h3>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
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
                fieldClass,
              )}
            />

            <FormFieldError errors={fieldErrors.title} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Υπότιτλος
            </label>

            <input
              value={draft.subtitle}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  subtitle: event.target.value,
                }));

                clearFieldError("subtitle");
              }}
              className={errorInputClass(
                Boolean(fieldErrors.subtitle),
                fieldClass,
              )}
            />

            <FormFieldError errors={fieldErrors.subtitle} />
          </div>

          <CategoryField
            categories={categories}
            value={draft.category}
            required
            error={fieldErrors.category}
            onChange={(category) => {
              setDraft((current) => ({
                ...current,
                category,
              }));

              clearFieldError("category");
            }}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Heading
            </label>

            <input
              value={draft.heading}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  heading: event.target.value,
                }));

                clearFieldError("heading");
              }}
              className={errorInputClass(
                Boolean(fieldErrors.heading),
                fieldClass,
              )}
            />

            <FormFieldError errors={fieldErrors.heading} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Ημ/νία δημοσίευσης{" "}
              <span className="text-rose-600" aria-hidden="true">
                *
              </span>
            </label>

            <input
              type="date"
              value={toDateInput(draft.publishedAt)}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  publishedAt: dateInputToIso(event.target.value),
                }));

                clearFieldError("publishedAt");
              }}
              className={errorInputClass(
                Boolean(fieldErrors.publishedAt),
                fieldClass,
              )}
            />

            <FormFieldError errors={fieldErrors.publishedAt} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Αρχείο εικόνας
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;

                setDraft((current) => ({
                  ...current,
                  imageFile: file,
                }));

                clearFieldError("imageFile");

                clearFieldError("imageAssetId");

                event.target.value = "";
              }}
              className={cx(fileClass, imageHasError && "border-rose-500")}
            />

            {draft.imageFile && (
              <p className="mt-2 text-xs text-slate-500">
                Επιλέχθηκε: {draft.imageFile.name}
              </p>
            )}

            <FormFieldError
              errors={[
                ...(fieldErrors.imageFile ?? []),
                ...(fieldErrors.imageAssetId ?? []),
              ]}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Περιεχόμενο{" "}
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
                onChange={(html) => {
                  setDraft((current) => ({
                    ...current,
                    content: html,
                  }));

                  clearFieldError("content");
                }}
                placeholder="Γράψε το περιεχόμενο του άρθρου..."
                minHeight={300}
              />
            </div>

            <FormFieldError errors={fieldErrors.content} />
          </div>

          <FormFieldError errors={fieldErrors.form} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
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
            onClick={submitArticle}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating
                ? "cursor-wait bg-[rgba(var(--primary),0.7)] text-white"
                : "bg-[rgb(var(--primary))] text-white hover:shadow",
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
        onRetry={submitArticle}
      />
    </div>
  );
}

function ArticleEditorCard({
  row,
  categories,
  busy,
  onSave,
  onDelete,
}: {
  row: ArticlesGetDto;
  categories: string[];
  busy: boolean;
  onSave: (id: number, payload: ArticlesPostDto) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ArticlesPostDto>(() =>
    articleToDraft(row),
  );

  const [open, setOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    row.imageUrl ? toMediaUrl(row.imageUrl) : null,
  );

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
    setDraft(articleToDraft(row));
    clearAllErrors();
  }, [row, clearAllErrors]);

  useEffect(() => {
    if (draft.imageFile) {
      const objectUrl = URL.createObjectURL(draft.imageFile);

      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setPreviewUrl(row.imageUrl ? toMediaUrl(row.imageUrl) : null);
  }, [draft.imageFile, row.imageUrl]);

  function resetChanges() {
    clearAllErrors();
    setDraft(articleToDraft(row));
  }

  async function saveArticle() {
    const errors = validateArticle(draft);

    if (!applyFrontendErrors(errors)) {
      setOpen(true);
      return;
    }

    try {
      await onSave(row.id, draft);
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η αποθήκευση του άρθρου.");
    }
  }

  const imageHasError = Boolean(
    fieldErrors.imageFile || fieldErrors.imageAssetId,
  );

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.title || "(Χωρίς τίτλο)"}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {fmtDate(draft.publishedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
          >
            {open ? "Σύμπτυξη" : "Επέκταση"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(row.id)}
            disabled={busy}
            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            Διαγραφή
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
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
                  fieldClass,
                )}
              />

              <FormFieldError errors={fieldErrors.title} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Υπότιτλος
              </label>

              <input
                value={draft.subtitle}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    subtitle: event.target.value,
                  }));

                  clearFieldError("subtitle");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.subtitle),
                  fieldClass,
                )}
              />

              <FormFieldError errors={fieldErrors.subtitle} />
            </div>

            <CategoryField
              categories={categories}
              value={draft.category}
              required
              error={fieldErrors.category}
              onChange={(category) => {
                setDraft((current) => ({
                  ...current,
                  category,
                }));

                clearFieldError("category");
              }}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Heading
              </label>

              <input
                value={draft.heading}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    heading: event.target.value,
                  }));

                  clearFieldError("heading");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.heading),
                  fieldClass,
                )}
              />

              <FormFieldError errors={fieldErrors.heading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ημ/νία δημοσίευσης{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="date"
                value={toDateInput(draft.publishedAt)}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    publishedAt: dateInputToIso(event.target.value),
                  }));

                  clearFieldError("publishedAt");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.publishedAt),
                  fieldClass,
                )}
              />

              <FormFieldError errors={fieldErrors.publishedAt} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Αρχείο εικόνας
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  setDraft((current) => ({
                    ...current,
                    imageFile: file,
                  }));

                  clearFieldError("imageFile");

                  clearFieldError("imageAssetId");

                  event.target.value = "";
                }}
                className={cx(fileClass, imageHasError && "border-rose-500")}
              />

              {draft.imageFile && (
                <p className="mt-2 text-xs text-slate-500">
                  Επιλέχθηκε: {draft.imageFile.name}
                </p>
              )}

              <FormFieldError
                errors={[
                  ...(fieldErrors.imageFile ?? []),
                  ...(fieldErrors.imageAssetId ?? []),
                ]}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Περιεχόμενο{" "}
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
                  onChange={(html) => {
                    setDraft((current) => ({
                      ...current,
                      content: html,
                    }));

                    clearFieldError("content");
                  }}
                  placeholder="Γράψε το περιεχόμενο του άρθρου..."
                  minHeight={320}
                />
              </div>

              <FormFieldError errors={fieldErrors.content} />
            </div>

            <FormFieldError errors={fieldErrors.form} />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={saveArticle}
                disabled={busy}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  busy
                    ? "cursor-wait bg-[rgba(var(--primary),0.7)] text-white"
                    : "bg-[rgb(var(--primary))] text-white hover:shadow",
                )}
              >
                {busy ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>

              <button
                type="button"
                onClick={resetChanges}
                disabled={busy}
                className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-slate-100">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={draft.title || "Εικόνα άρθρου"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="px-4 py-3">
                <h4 className="text-base font-semibold">
                  {draft.title || "Τίτλος"}
                </h4>

                {draft.subtitle && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {draft.subtitle}
                  </p>
                )}

                {draft.heading && (
                  <p className="mt-2 text-xs text-slate-500">{draft.heading}</p>
                )}

                {draft.content && (
                  <RichHtmlRenderer
                    html={draft.content}
                    className="article-rich-content mt-3 line-clamp-4 text-sm text-slate-700"
                  />
                )}

                <div className="mt-3 text-xs text-slate-600">
                  {fmtDate(draft.publishedAt)}
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
        onRetry={saveArticle}
      />
    </Card>
  );
}

/* ================= RECIPES ================= */

function RecipesManager() {
  const [all, setAll] = useState<RecipesGetDto[]>([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [busyId, setBusyId] = useState<number | null>(null);

  const [query, setQuery] = useState("");

  const [toast, setToast] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [createDraft, setCreateDraft] =
    useState<RecipesPostDto>(createEmptyRecipe);

  const { generalError, applyApiError, closeGeneralError } = useFormErrors();

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const data = await RecipesApi.list();

      setAll(data);
    } catch (error: unknown) {
      console.error(error);

      applyApiError(error, "Δεν ήταν δυνατή η φόρτωση των συνταγών.");
    } finally {
      setLoading(false);
    }
  }, [applyApiError]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToast(null);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return all;
    }

    return all.filter((recipe) =>
      [
        recipe.title,
        recipe.category,
        recipe.description,
        recipe.ingredients,
        recipe.instructions,
      ]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [all, query]);

  const categories = useMemo(
    () => getUniqueCategories(all.map((recipe) => recipe.category)),
    [all],
  );

  async function onCreateSubmit() {
    try {
      setCreating(true);

      const created = await RecipesApi.create({
        ...createDraft,
        title: createDraft.title.trim(),
        ingredients: createDraft.ingredients.trim(),
        category: createDraft.category.trim(),
        instructions: createDraft.instructions.trim(),
        description: createDraft.description.trim(),
      });

      setAll((current) => [created, ...current]);

      setToast("Δημιουργήθηκε.");
      setCreateOpen(false);
      setCreateDraft(createEmptyRecipe());
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setCreating(false);
    }
  }

  async function onSave(id: number, payload: RecipesPostDto) {
    try {
      setBusyId(id);

      await RecipesApi.update(id, {
        ...payload,
        title: payload.title.trim(),
        ingredients: payload.ingredients.trim(),
        category: payload.category.trim(),
        instructions: payload.instructions.trim(),
        description: payload.description.trim(),
      });

      const fresh = await RecipesApi.get(id);

      setAll((current) =>
        current.map((recipe) => (recipe.id === id ? fresh : recipe)),
      );

      setToast("Αποθηκεύτηκε.");
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Διαγραφή συνταγής;")) {
      return;
    }

    try {
      setBusyId(id);

      await RecipesApi.remove(id);

      setAll((current) => current.filter((recipe) => recipe.id !== id));

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      applyApiError(error, "Δεν ήταν δυνατή η διαγραφή της συνταγής.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="mb-6 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Αναζήτηση συνταγών…"
            className={searchClass}
          />

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white transition hover:shadow"
          >
            Νέα συνταγή
          </button>
        </div>
      </Card>

      {loading ? (
        <Card className="p-6">
          <p>Φόρτωση…</p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-slate-600">Καμία εγγραφή.</Card>
      ) : (
        <div className="space-y-6">
          {filtered.map((recipe) => (
            <RecipeEditorCard
              key={recipe.id}
              row={recipe}
              categories={categories}
              busy={busyId === recipe.id}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateRecipeModal
          draft={createDraft}
          setDraft={setCreateDraft}
          categories={categories}
          creating={creating}
          onClose={() => {
            if (creating) {
              return;
            }

            setCreateOpen(false);
            setCreateDraft(createEmptyRecipe());
          }}
          onSubmit={onCreateSubmit}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
      />
    </>
  );
}

function CreateRecipeModal({
  draft,
  setDraft,
  categories,
  creating,
  onClose,
  onSubmit,
}: {
  draft: RecipesPostDto;
  setDraft: React.Dispatch<React.SetStateAction<RecipesPostDto>>;
  creating: boolean;
  categories: string[];
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

  async function submitRecipe() {
    const errors = validateRecipe(draft);

    if (!applyFrontendErrors(errors)) {
      return;
    }

    try {
      await onSubmit();
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η δημιουργία της συνταγής.");
    }
  }

  const imageHasError = Boolean(
    fieldErrors.imageFile || fieldErrors.imageAssetId,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Νέα συνταγή</h3>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="max-h-[80vh] space-y-4 overflow-y-auto p-5">
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
                fieldClass,
              )}
            />

            <FormFieldError errors={fieldErrors.title} />
          </div>

          <CategoryField
            categories={categories}
            value={draft.category}
            error={fieldErrors.category}
            onChange={(category) => {
              setDraft((current) => ({
                ...current,
                category,
              }));

              clearFieldError("category");
            }}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Χρόνος προετοιμασίας{" "}
              <span className="text-rose-600" aria-hidden="true">
                *
              </span>
            </label>

            <input
              type="number"
              min={0}
              value={draft.timeToPrepare}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  timeToPrepare: Number(event.target.value),
                }));

                clearFieldError("timeToPrepare");
              }}
              className={errorInputClass(
                Boolean(fieldErrors.timeToPrepare),
                fieldClass,
              )}
            />

            <FormFieldError errors={fieldErrors.timeToPrepare} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Αρχείο εικόνας
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;

                setDraft((current) => ({
                  ...current,
                  imageFile: file,
                }));

                clearFieldError("imageFile");

                clearFieldError("imageAssetId");

                event.target.value = "";
              }}
              className={cx(fileClass, imageHasError && "border-rose-500")}
            />

            {draft.imageFile && (
              <p className="mt-2 text-xs text-slate-500">
                Επιλέχθηκε: {draft.imageFile.name}
              </p>
            )}

            <FormFieldError
              errors={[
                ...(fieldErrors.imageFile ?? []),
                ...(fieldErrors.imageAssetId ?? []),
              ]}
            />
          </div>

          <RichEditorField
            label="Περιγραφή"
            value={draft.description}
            error={fieldErrors.description}
            placeholder="Γράψε τη σύντομη περιγραφή της συνταγής..."
            minHeight={180}
            onChange={(html) => {
              setDraft((current) => ({
                ...current,
                description: html,
              }));

              clearFieldError("description");
            }}
          />

          <RichEditorField
            label="Υλικά"
            value={draft.ingredients}
            error={fieldErrors.ingredients}
            placeholder="Γράψε τα υλικά της συνταγής..."
            minHeight={220}
            onChange={(html) => {
              setDraft((current) => ({
                ...current,
                ingredients: html,
              }));

              clearFieldError("ingredients");
            }}
          />

          <RichEditorField
            label="Οδηγίες"
            value={draft.instructions}
            error={fieldErrors.instructions}
            placeholder="Γράψε τις οδηγίες εκτέλεσης..."
            minHeight={260}
            onChange={(html) => {
              setDraft((current) => ({
                ...current,
                instructions: html,
              }));

              clearFieldError("instructions");
            }}
          />

          <FormFieldError errors={fieldErrors.form} />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
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
            onClick={submitRecipe}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating
                ? "cursor-wait bg-[rgba(var(--primary),0.7)] text-white"
                : "bg-[rgb(var(--primary))] text-white hover:shadow",
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
        onRetry={submitRecipe}
      />
    </div>
  );
}

function RecipeEditorCard({
  row,
  busy,
  categories,
  onSave,
  onDelete,
}: {
  row: RecipesGetDto;
  categories: string[];
  busy: boolean;
  onSave: (id: number, payload: RecipesPostDto) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<RecipesPostDto>(() => recipeToDraft(row));

  const [open, setOpen] = useState(false);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    row.imageUrl ? toMediaUrl(row.imageUrl) : null,
  );

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
    setDraft(recipeToDraft(row));
    clearAllErrors();
  }, [row, clearAllErrors]);

  useEffect(() => {
    if (draft.imageFile) {
      const objectUrl = URL.createObjectURL(draft.imageFile);

      setPreviewUrl(objectUrl);

      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }

    setPreviewUrl(row.imageUrl ? toMediaUrl(row.imageUrl) : null);
  }, [draft.imageFile, row.imageUrl]);

  function resetChanges() {
    clearAllErrors();
    setDraft(recipeToDraft(row));
  }

  async function saveRecipe() {
    const errors = validateRecipe(draft);

    if (!applyFrontendErrors(errors)) {
      setOpen(true);
      return;
    }

    try {
      await onSave(row.id, draft);
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η αποθήκευση της συνταγής.");
    }
  }

  const imageHasError = Boolean(
    fieldErrors.imageFile || fieldErrors.imageAssetId,
  );

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.title || "(Χωρίς τίτλο)"}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {draft.category || "Χωρίς κατηγορία"} • {draft.timeToPrepare || 0}′
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
          >
            {open ? "Σύμπτυξη" : "Επέκταση"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(row.id)}
            disabled={busy}
            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            Διαγραφή
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
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
                  fieldClass,
                )}
              />

              <FormFieldError errors={fieldErrors.title} />
            </div>

            <CategoryField
              categories={categories}
              value={draft.category}
              error={fieldErrors.category}
              onChange={(category) => {
                setDraft((current) => ({
                  ...current,
                  category,
                }));

                clearFieldError("category");
              }}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Χρόνος προετοιμασίας{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="number"
                min={0}
                value={draft.timeToPrepare}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    timeToPrepare: Number(event.target.value),
                  }));

                  clearFieldError("timeToPrepare");
                }}
                className={errorInputClass(
                  Boolean(fieldErrors.timeToPrepare),
                  fieldClass,
                )}
              />

              <FormFieldError errors={fieldErrors.timeToPrepare} />
            </div>

            <RichEditorField
              label="Περιγραφή"
              value={draft.description}
              error={fieldErrors.description}
              placeholder="Γράψε τη σύντομη περιγραφή της συνταγής..."
              minHeight={180}
              onChange={(html) => {
                setDraft((current) => ({
                  ...current,
                  description: html,
                }));

                clearFieldError("description");
              }}
            />

            <RichEditorField
              label="Υλικά"
              value={draft.ingredients}
              error={fieldErrors.ingredients}
              placeholder="Γράψε τα υλικά της συνταγής..."
              minHeight={220}
              onChange={(html) => {
                setDraft((current) => ({
                  ...current,
                  ingredients: html,
                }));

                clearFieldError("ingredients");
              }}
            />

            <RichEditorField
              label="Οδηγίες"
              value={draft.instructions}
              error={fieldErrors.instructions}
              placeholder="Γράψε τις οδηγίες εκτέλεσης..."
              minHeight={280}
              onChange={(html) => {
                setDraft((current) => ({
                  ...current,
                  instructions: html,
                }));

                clearFieldError("instructions");
              }}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Αρχείο εικόνας
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  setDraft((current) => ({
                    ...current,
                    imageFile: file,
                  }));

                  clearFieldError("imageFile");

                  clearFieldError("imageAssetId");

                  event.target.value = "";
                }}
                className={cx(fileClass, imageHasError && "border-rose-500")}
              />

              {draft.imageFile && (
                <p className="mt-2 text-xs text-slate-500">
                  Επιλέχθηκε: {draft.imageFile.name}
                </p>
              )}

              <FormFieldError
                errors={[
                  ...(fieldErrors.imageFile ?? []),
                  ...(fieldErrors.imageAssetId ?? []),
                ]}
              />
            </div>

            <FormFieldError errors={fieldErrors.form} />

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={saveRecipe}
                disabled={busy}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  busy
                    ? "cursor-wait bg-[rgba(var(--primary),0.7)] text-white"
                    : "bg-[rgb(var(--primary))] text-white hover:shadow",
                )}
              >
                {busy ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>

              <button
                type="button"
                onClick={resetChanges}
                disabled={busy}
                className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/10] bg-slate-100">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt={draft.title || "Εικόνα συνταγής"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="px-4 py-3">
                <h4 className="text-base font-semibold">
                  {draft.title || "Τίτλος"}
                </h4>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span>{draft.category}</span>

                  <span>{draft.timeToPrepare || 0}′</span>
                </div>

                {draft.description ? (
                  <RichHtmlRenderer
                    html={draft.description}
                    className="recipe-rich-content mt-3 line-clamp-4 text-sm text-slate-700"
                  />
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    Δεν υπάρχει περιγραφή.
                  </p>
                )}
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
        onRetry={saveRecipe}
      />
    </Card>
  );
}

function RichEditorField({
  label,
  value,
  error,
  placeholder,
  minHeight,
  onChange,
}: {
  label: string;
  value: string;
  error?: string[];
  placeholder: string;
  minHeight: number;
  onChange: (html: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}{" "}
        <span className="text-rose-600" aria-hidden="true">
          *
        </span>
      </label>

      <div className={error ? "rounded-xl ring-2 ring-rose-400" : ""}>
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minHeight={minHeight}
        />
      </div>

      <FormFieldError errors={error} />
    </div>
  );
}
