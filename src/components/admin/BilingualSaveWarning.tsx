import { useEffect } from "react";
import type { ContentLanguage } from "./ContentLanguageSwitch";

type Props = {
  open: boolean;
  missingLanguage: ContentLanguage | null;
  onContinueEditing: () => void;
  onSaveAnyway: () => void | Promise<void>;
  onCancel: () => void;
};

export default function BilingualSaveWarning({
  open,
  missingLanguage,
  onContinueEditing,
  onSaveAnyway,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open || !missingLanguage) return null;

  const languageName = missingLanguage === "en" ? "Αγγλικά" : "Ελληνικά";
  const title =
    missingLanguage === "en"
      ? "Η αγγλική έκδοση δεν έχει συμπληρωθεί"
      : "Η ελληνική έκδοση δεν έχει συμπληρωθεί";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bilingual-warning-title"
    >
      <button
        type="button"
        aria-label="Κλείσιμο"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-[121] w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
          !
        </div>
        <h2 id="bilingual-warning-title" className="mt-4 text-xl font-semibold text-slate-900">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Μπορείτε να αποθηκεύσετε το περιεχόμενο όπως είναι ή να συνεχίσετε στα {languageName} και να το συμπληρώσετε πριν την αποθήκευση.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Ακύρωση
          </button>
          <button type="button" onClick={onContinueEditing} className="rounded-full border border-[rgb(var(--primary))] bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--primary))]">
            Συνέχεια στα {languageName}
          </button>
          <button type="button" onClick={onSaveAnyway} className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white">
            Αποθήκευση ούτως ή άλλως
          </button>
        </div>
      </div>
    </div>
  );
}
