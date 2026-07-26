import { useEffect } from "react";

type GeneralErrorDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void | Promise<void>;
};

export default function GeneralErrorDialog({
  open,
  title = "Παρουσιάστηκε πρόβλημα",
  message,
  onClose,
  onRetry,
}: GeneralErrorDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="general-error-title"
    >
      <button
        type="button"
        aria-label="Κλείσιμο"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-[101] w-full max-w-md rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-xl text-rose-700">
          !
        </div>

        <h2
          id="general-error-title"
          className="mt-4 text-xl font-semibold text-slate-900"
        >
          {title}
        </h2>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
          >
            Κλείσιμο
          </button>

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white"
            >
              Δοκιμή ξανά
            </button>
          )}
        </div>
      </div>
    </div>
  );
}