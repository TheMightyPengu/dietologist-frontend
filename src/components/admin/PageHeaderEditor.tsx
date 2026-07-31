import { useEffect, useState } from "react";
import { PageHeaderApi } from "@/api/PageHeaderController";
import type { ApiFieldErrors } from "@/api/_axios-client";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import {
  addValidationError,
  errorInputClass,
} from "@/lib/form-validation";

type PageHeaderEditorProps = {
  pageKey: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

const fieldClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 " +
  "text-slate-900 outline-none transition " +
  "focus:border-[rgb(var(--primary))] " +
  "focus:ring-4 focus:ring-[rgba(var(--primary),0.18)]";

function validatePageHeader(
  title: string,
  description: string,
): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  const cleanTitle = title.trim();
  const cleanDescription = description.trim();

  if (!cleanTitle) {
    addValidationError(
      errors,
      "title",
      "Ο τίτλος είναι υποχρεωτικός.",
    );
  } else if (cleanTitle.length > 1000) {
    addValidationError(
      errors,
      "title",
      "Ο τίτλος δεν μπορεί να ξεπερνά τους 1000 χαρακτήρες.",
    );
  }

  if (!cleanDescription) {
    addValidationError(
      errors,
      "description",
      "Η περιγραφή είναι υποχρεωτική.",
    );
  } else if (cleanDescription.length > 10000) {
    addValidationError(
      errors,
      "description",
      "Η περιγραφή δεν μπορεί να ξεπερνά τους 10000 χαρακτήρες.",
    );
  }

  return errors;
}

export default function PageHeaderEditor({
  pageKey,
  fallbackTitle,
  fallbackDescription,
}: PageHeaderEditorProps) {
  const [title, setTitle] = useState(fallbackTitle);
  const [description, setDescription] =
    useState(fallbackDescription);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    let mounted = true;

    async function loadPageHeader() {
      try {
        setLoading(true);
        setSaved(false);
        clearAllErrors();

        const pageHeader = await PageHeaderApi.get(pageKey);

        if (!mounted) {
          return;
        }

        setTitle(pageHeader.title || fallbackTitle);
        setDescription(
          pageHeader.description || fallbackDescription,
        );
      } catch (error: unknown) {
        if (!mounted) {
          return;
        }

        setTitle(fallbackTitle);
        setDescription(fallbackDescription);

        const status = (error as { status?: number })?.status;

        /*
         * If the record does not exist yet, the PUT endpoint
         * will create it when the user saves.
         */
        if (status !== 404) {
          applyApiError(
            error,
            "Δεν ήταν δυνατή η φόρτωση του κειμένου της σελίδας.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadPageHeader();

    return () => {
      mounted = false;
    };
  }, [
    pageKey,
    fallbackTitle,
    fallbackDescription,
    applyApiError,
    clearAllErrors,
  ]);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaved(false);
    }, 2000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [saved]);

  async function savePageHeader() {
    const errors = validatePageHeader(title, description);

    if (!applyFrontendErrors(errors)) {
      setOpen(true);
      return;
    }

    try {
      setSaving(true);
      setSaved(false);

      const cleanTitle = title.trim();
      const cleanDescription = description.trim();

      await PageHeaderApi.update(pageKey, {
        title: cleanTitle,
        description: cleanDescription,
      });

      setTitle(cleanTitle);
      setDescription(cleanDescription);

      clearAllErrors();
      setSaved(true);
    } catch (error: unknown) {
      applyApiError(
        error,
        "Δεν ήταν δυνατή η αποθήκευση του κειμένου της σελίδας.",
      );
    } finally {
      setSaving(false);
    }
  }

  function resetValues() {
    clearAllErrors();

    setTitle(fallbackTitle);
    setDescription(fallbackDescription);

    setSaved(false);
  }

  return (
    <>
    <section className="mb-6 rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur-sm border border-[rgba(var(--border),0.8)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900">
              Κείμενο κορυφής δημόσιας σελίδας
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Φόρτωση κειμένου…"
                : title || fallbackTitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm transition hover:border-[rgb(var(--primary))]"
          >
            {open ? "Σύμπτυξη" : "Επέκταση"}
          </button>
        </div>

        {open && (
          <>
            <p className="mt-4 text-sm text-slate-600">
              Επεξεργαστείτε τον τίτλο και την περιγραφή που
              εμφανίζονται στην κορυφή της δημόσιας σελίδας.
            </p>

            {loading ? (
              <div className="mt-5 space-y-4 animate-pulse">
                <div className="h-11 rounded-xl bg-slate-100" />
                <div className="h-28 rounded-xl bg-slate-100" />
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Τίτλος σελίδας{" "}
                    <span
                      className="text-rose-600"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>

                  <input
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setSaved(false);
                      clearFieldError("title");
                    }}
                    className={errorInputClass(
                      Boolean(fieldErrors.title),
                      fieldClass,
                    )}
                    placeholder="Τίτλος δημόσιας σελίδας"
                  />

                  <FormFieldError errors={fieldErrors.title} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Περιγραφή σελίδας{" "}
                    <span
                      className="text-rose-600"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>

                  <textarea
                    value={description}
                    rows={4}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      setSaved(false);
                      clearFieldError("description");
                    }}
                    className={errorInputClass(
                      Boolean(fieldErrors.description),
                      `${fieldClass} resize-y`,
                    )}
                    placeholder="Σύντομη περιγραφή της δημόσιας σελίδας"
                  />

                  <FormFieldError
                    errors={fieldErrors.description}
                  />
                </div>

                <FormFieldError errors={fieldErrors.form} />

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={savePageHeader}
                    disabled={saving}
                    className={[
                      "rounded-full px-4 py-2 text-sm font-semibold text-white transition",
                      saving
                        ? "cursor-wait bg-[rgba(var(--primary),0.7)]"
                        : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]",
                    ].join(" ")}
                  >
                    {saving
                      ? "Αποθήκευση…"
                      : "Αποθήκευση κειμένου"}
                  </button>

                  <button
                    type="button"
                    onClick={resetValues}
                    disabled={saving}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm transition hover:border-[rgb(var(--primary))] disabled:opacity-60"
                  >
                    Επαναφορά αρχικού κειμένου
                  </button>

                  {saved && (
                    <span className="text-sm font-medium text-[rgb(var(--primary))]">
                      Αποθηκεύτηκε.
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <GeneralErrorDialog
        open={Boolean(generalError)}
        title={generalError?.title}
        message={generalError?.message ?? ""}
        onClose={closeGeneralError}
        onRetry={savePageHeader}
      />
    </>
  );
}