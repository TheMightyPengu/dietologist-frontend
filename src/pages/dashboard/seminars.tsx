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
import { toMediaUrl } from "@/api/_axios-client";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop";

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-[rgba(var(--border),0.8)]",
      className
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

function toPayload(sem: Seminar): SeminarPayload {
  return {
    title: sem.title,
    description: sem.description,
    content: sem.content,
    imageUrl: sem.imageUrl,
    price: Number(sem.price) || 0,
    duration: Number(sem.duration) || 0,
    dateTime: sem.dateTime || new Date().toISOString(),
    type: sem.type,
  };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ManagementSeminarsPage() {
  const [all, setAll] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadSeminars() {
    try {
      setLoading(true);
      setError(null);

      const data = await getSeminars();

      setAll(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η φόρτωση των σεμιναρίων."
      );
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
        .includes(q)
    );
  }, [all, query]);

  async function handleCreate() {
    try {
      setCreating(true);
      setError(null);

      const created = await createSeminar({
        title: "Νέο σεμινάριο",
        description: "",
        content: "",
        imageUrl: "",
        price: 0,
        duration: 60,
        dateTime: new Date().toISOString(),
        type: "Online",
      });

      setAll((prev) => [created, ...prev]);
      setToast("Δημιουργήθηκε.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η δημιουργία."
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(sem: Seminar) {
    try {
      setBusyId(sem.id);
      setError(null);

      await updateSeminar(sem.id, toPayload(sem));

      const fresh = await getSeminarById(sem.id);

      setAll((prev) => prev.map((x) => (x.id === sem.id ? fresh : x)));
      setToast("Αποθηκεύτηκε.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η αποθήκευση."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή σεμιναρίου;")) return;

    try {
      setBusyId(id);
      setError(null);

      await deleteSeminar(id);

      setAll((prev) => prev.filter((x) => x.id !== id));
      setToast("Διαγράφηκε.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η διαγραφή."
      );
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
          <div className="mb-6 flex items-center gap-3">
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

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Αναζήτηση σεμιναρίων…"
                className="w-full md:w-80 rounded-xl border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
              />

              <button
                onClick={handleCreate}
                disabled={creating}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  creating
                    ? "bg-[rgba(var(--primary),0.65)] text-white cursor-wait"
                    : "bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-dark))]"
                )}
              >
                {creating ? "Δημιουργία…" : "Νέο σεμινάριο"}
              </button>
            </div>
          </Card>

          {error && (
            <Card className="mb-6 p-4 border-rose-200 bg-rose-50">
              <p className="text-sm text-rose-700">{error}</p>
            </Card>
          )}

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

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
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
  onSave: (s: Seminar) => void;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState<Seminar>(sem);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft(sem);
  }, [sem]);

  const priceText = draft.price > 0 ? `${draft.price}€` : "ΔΩΡΕΑΝ";
  const image = draft.imageUrl || IMAGE_FALLBACK;

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.title || "(Χωρίς τίτλο)"}
          </h3>

          <p className="text-xs text-[rgb(var(--muted))] mt-1">
            {draft.type || "Τύπος σύντομα"} • {fmtDateHuman(draft.dateTime)} •{" "}
            {draft.duration || 0}′ • {priceText}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
          >
            {open ? "Σύμπτυξη" : "Επέκταση"}
          </button>

          <button
            onClick={() => onDelete(draft.id)}
            disabled={busy}
            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300"
          >
            Διαγραφή
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                Τίτλος
              </label>

              <input
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                Σύντομη περιγραφή
              </label>

              <RichTextEditor
                value={draft.description}
                onChange={(value) =>
                  setDraft((d) => ({ ...d, description: value }))
                }
                placeholder="Σύντομη περιγραφή του σεμιναρίου..."
                minHeight={150}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                Αναλυτικό περιεχόμενο
              </label>

              <RichTextEditor
                value={draft.content}
                onChange={(value) =>
                  setDraft((d) => ({ ...d, content: value }))
                }
                placeholder="Αναλυτικό περιεχόμενο σεμιναρίου..."
                minHeight={240}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                Image URL
              </label>

              <input
                value={draft.imageUrl}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, imageUrl: e.target.value }))
                }
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Τιμή
                </label>

                <input
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Διάρκεια λεπτά
                </label>

                <input
                  type="number"
                  min={0}
                  value={draft.duration}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      duration: Number(e.target.value) || 0,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Τύπος
                </label>

                <input
                  value={draft.type}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, type: e.target.value }))
                  }
                  placeholder="Online ή Δια ζώσης"
                  className="mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--ink))]">
                  Ημερομηνία και ώρα
                </label>

                <input
                  type="datetime-local"
                  value={toDateTimeLocalValue(draft.dateTime)}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      dateTime: dateTimeLocalToIso(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[rgba(var(--border),0.9)] bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSave(draft)}
                disabled={busy}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  busy
                    ? "bg-[rgba(var(--primary),0.65)] text-white cursor-wait"
                    : "bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-dark))]"
                )}
              >
                {busy ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>

              <button
                onClick={() => setDraft(sem)}
                className="rounded-full border border-[rgba(var(--border),0.9)] bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
              >
                Επαναφορά αλλαγών
              </button>

              <button
                onClick={() => onDelete(draft.id)}
                disabled={busy}
                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 hover:border-rose-300"
              >
                Διαγραφή
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-[rgba(var(--primary),0.08)] relative">
                {image ? (
                  <img
                    src={image.startsWith("/media") ? toMediaUrl(image) : image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                    Προσθέστε εικόνα URL
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-[rgba(var(--border),0.9)]">
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
                  className="mt-1 text-sm text-[rgb(var(--muted))] line-clamp-3"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{priceText}</span>

                  <button className="rounded-full bg-[rgb(var(--primary))] text-white text-xs px-3 py-1.5">
                    Κράτηση θέσης
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}