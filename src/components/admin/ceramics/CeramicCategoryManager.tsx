import { useEffect, useRef, useState, type FormEvent } from "react";
import { CeramicsApi, type CeramicCategory } from "@/api/CeramicsController";
import { toApiError } from "@/api/_axios-client";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import { action, danger, input, panel, primary } from "./styles";

const empty = { name: "", nameEn: "" };
const nameFields = [
  { key: "name", label: "Όνομα (Ελληνικά)", lang: "el" },
  { key: "nameEn", label: "Name (English)", lang: "en" },
] as const;

export default function CeramicCategoryManager({ categories, onChange, onDirtyChange, onBusyChange }: {
  categories: CeramicCategory[];
  onChange: () => void;
  onDirtyChange: (dirty: boolean) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [editing, setEditing] = useState<CeramicCategory | "create">();
  const [draft, setDraft] = useState(empty);
  const [busy, setBusy] = useState(false);
  const requestPending = useRef(false);
  const errors = useFormErrors();
  const category = editing === "create" ? undefined : editing;
  const dirty = draft.name !== (category?.name ?? "") || draft.nameEn !== (category?.nameEn ?? "");

  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  function setRequestPending(pending: boolean) {
    requestPending.current = pending;
    setBusy(pending);
    onBusyChange(pending);
  }

  function reset(next?: CeramicCategory | "create") {
    setEditing(next);
    setDraft(next && next !== "create" ? { name: next.name, nameEn: next.nameEn ?? "" } : empty);
    errors.clearAllErrors();
  }

  function openForm(next: CeramicCategory | "create") {
    if (requestPending.current || (next === "create" ? editing === "create" : category?.id === next.id)) return;
    if (dirty && !window.confirm("Να απορριφθούν οι μη αποθηκευμένες αλλαγές;")) return;
    reset(next);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (requestPending.current || !editing) return;
    const values = { name: draft.name.trim(), nameEn: draft.nameEn.trim() };
    if (!values.name || !values.nameEn) {
      errors.applyFrontendErrors({
        ...(!values.name && { name: ["Συμπληρώστε το ελληνικό όνομα."] }),
        ...(!values.nameEn && { nameEn: ["Συμπληρώστε το αγγλικό όνομα."] }),
      });
      return;
    }
    errors.clearAllErrors();
    setRequestPending(true);
    try {
      await CeramicsApi.saveCategory(values, category?.id);
      reset();
      onChange();
    } catch (error) {
      const parsed = toApiError(error);
      if ((editing === "create" && parsed.status === 409) || parsed.fieldErrors.nameEn) {
        errors.addFieldError("nameEn", parsed.status === 409
          ? "Υπάρχει ήδη κατηγορία με ίδιο ή παρόμοιο αγγλικό όνομα. Επιλέξτε διαφορετικό όνομα."
          : "Χρησιμοποιήστε αγγλικό όνομα με λατινικά γράμματα ή αριθμούς.");
      } else {
        errors.applyApiError(error);
      }
    } finally {
      setRequestPending(false);
    }
  }

  async function remove(item: CeramicCategory) {
    const discardNotice = category?.id === item.id && dirty ? " Οι μη αποθηκευμένες αλλαγές θα χαθούν." : "";
    if (requestPending.current || !window.confirm(`Διαγραφή κατηγορίας «${item.name}»;${discardNotice}`)) return;
    errors.clearAllErrors();
    setRequestPending(true);
    try {
      await CeramicsApi.removeCategory(item.id);
      if (category?.id === item.id) reset();
      onChange();
    } catch (error) {
      if (toApiError(error).status === 409) {
        errors.showGeneralError("Η κατηγορία δεν μπορεί να διαγραφεί όσο περιέχει προϊόντα. Μεταφέρετε πρώτα τα προϊόντα σε άλλη κατηγορία.");
      } else {
        errors.applyApiError(error);
      }
    } finally {
      setRequestPending(false);
    }
  }

  return (
    <section className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Κατηγορίες</h2>
        <button type="button" className={primary} disabled={busy} aria-expanded={editing === "create"} onClick={() => openForm("create")}>
          + Προσθήκη κατηγορίας
        </button>
      </div>
      {editing && (
        <form onSubmit={save} noValidate className="my-4 border-y border-slate-200 py-4">
          <h3 className="mb-3 break-words font-semibold">{category ? `Επεξεργασία κατηγορίας: ${category.name}` : "Νέα κατηγορία"}</h3>
          <fieldset disabled={busy} className="grid items-start gap-3 sm:grid-cols-2">
            {nameFields.map(({ key, label, lang }) => (
              <div key={key}>
                <label className="block text-sm font-medium">
                  {label}
                  <input className={input} required lang={lang} maxLength={150} value={draft[key]} onChange={(event) => {
                    setDraft((current) => ({ ...current, [key]: event.target.value }));
                    errors.clearFieldError(key);
                  }} />
                </label>
                <FormFieldError errors={errors.fieldErrors[key]} />
              </div>
            ))}
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" className={primary}>{busy ? "Αναμονή…" : "Αποθήκευση"}</button>
              <button type="button" className={action} onClick={() => reset()}>Ακύρωση</button>
            </div>
          </fieldset>
        </form>
      )}
      {categories.length === 0 && <p className="text-sm text-slate-600">Δεν υπάρχουν κατηγορίες.</p>}
      <ul className="mt-3 divide-y divide-slate-200">
        {categories.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0 break-words">
              <p className="font-semibold">{item.name}</p>
              {item.nameEn && <p className="text-sm text-slate-600" lang="en">{item.nameEn}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button className={action} type="button" disabled={busy} aria-expanded={category?.id === item.id} onClick={() => openForm(item)}>Επεξεργασία</button>
              <button className={danger} type="button" disabled={busy} onClick={() => void remove(item)}>Διαγραφή</button>
            </div>
          </li>
        ))}
      </ul>
      <GeneralErrorDialog open={!!errors.generalError} title={errors.generalError?.title} message={errors.generalError?.message ?? ""} onClose={errors.closeGeneralError} />
    </section>
  );
}
