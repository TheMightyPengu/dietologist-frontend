import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createSeminar,
  deleteSeminar,
  fetchSeminars,
  updateSeminar,
  type Seminar,
  type SeminarMode,
} from "@/lib/mgmtSeminarsAPI";
import Image from "next/image";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cx("rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50", className)}>
    {children}
  </div>
);

function fmtDateHuman(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

export default function ManagementSeminarsPage() {
  const [all, setAll] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchSeminars();
      setAll(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((s) => [s.title, s.excerpt].some((t) => t.toLowerCase().includes(q)));
  }, [all, query]);

  async function handleCreate() {
    setCreating(true);
    const empty: Omit<Seminar, "id"> = {
      title: "Νέο σεμινάριο",
      excerpt: "",
      imageUrl: "",
      mode: "online",
      dateISO: new Date().toISOString(),
      durationMin: 60,
      priceEuro: null,
      ctaLabel: "Κράτηση θέσης",
      ctaUrl: "/contact#booking",
      published: false,
    };
    const created = await createSeminar(empty);
    setAll((prev) => [created, ...prev]);
    setCreating(false);
    setToast("Δημιουργήθηκε.");
  }

  async function handleSave(sem: Seminar) {
    setBusyId(sem.id);
    const updated = await updateSeminar(sem);
    setAll((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    setBusyId(null);
    setToast("Αποθηκεύτηκε.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Διαγραφή σεμιναρίου;")) return;
    setBusyId(id);
    await deleteSeminar(id);
    setAll((prev) => prev.filter((x) => x.id !== id));
    setBusyId(null);
    setToast("Διαγράφηκε.");
  }

  return (
    <>
      <Head>
        <title>Διαχείριση | ΣΕΜΙΝΑΡΙΑ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-[#fcfcfa] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
            >
              ← Πίσω στο Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">ΣΕΜΙΝΑΡΙΑ</h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Αναζήτηση σεμιναρίων…"
                className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  creating ? "bg-[#7a7ac4]/70 text-white cursor-wait" : "bg-[#7a7ac4] text-white hover:shadow"
                )}
              >
                {creating ? "Δημιουργία…" : "Νέο σεμινάριο"}
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

/* ---------------- Editor Card ---------------- */
function SeminarEditorCard({
  sem,
  busy,
  onSave,
  onDelete,
}: {
  sem: Seminar;
  busy: boolean;
  onSave: (s: Seminar) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Seminar>(sem);
  const [open, setOpen] = useState(true);

  // reset when row changes
  useEffect(() => {
    setDraft(sem);
  }, [sem]);

  const priceText = draft.priceEuro === null ? "ΔΩΡΕΑΝ" : `${draft.priceEuro}€`;

  return (
    <Card className="p-5 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {draft.published ? "Δημοσιευμένο" : "Προσχέδιο"} • {draft.mode === "online" ? "Online" : "Δια ζώσης"} •{" "}
            {fmtDateHuman(draft.dateISO)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
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
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Περιγραφή (excerpt)</label>
              <textarea
                rows={3}
                value={draft.excerpt}
                onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τρόπος</label>
                <select
                  value={draft.mode}
                  onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value as SeminarMode }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                >
                  <option value="online">Online</option>
                  <option value="in_person">Δια ζώσης</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Ημερομηνία & ώρα</label>
                <input
                  type="datetime-local"
                  value={draft.dateISO.slice(0, 16)}
                  onChange={(e) => {
                    // keep timezone offset if any: declare as local and convert to ISO
                    const local = new Date(e.target.value);
                    setDraft((d) => ({ ...d, dateISO: local.toISOString() }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Διάρκεια (λεπτά)</label>
                <input
                  type="number"
                  min={15}
                  step={15}
                  value={draft.durationMin}
                  onChange={(e) => setDraft((d) => ({ ...d, durationMin: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τιμή (€) — αφήστε κενό για ΔΩΡΕΑΝ</label>
                <input
                  type="number"
                  min={0}
                  value={draft.priceEuro ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      priceEuro: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">CTA κείμενο</label>
                <input
                  value={draft.ctaLabel}
                  onChange={(e) => setDraft((d) => ({ ...d, ctaLabel: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">CTA σύνδεσμος</label>
                <input
                  value={draft.ctaUrl}
                  onChange={(e) => setDraft((d) => ({ ...d, ctaUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Εικόνα (URL)</label>
              <input
                value={draft.imageUrl}
                onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id={`published-${draft.id}`}
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
              />
              <label htmlFor={`published-${draft.id}`} className="text-sm">
                Δημοσιευμένο
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSave(draft)}
                disabled={busy}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  busy ? "bg-[#7a7ac4]/70 text-white cursor-wait" : "bg-[#7a7ac4] text-white hover:shadow"
                )}
              >
                {busy ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>
              <button
                onClick={() => setDraft(sem)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#7a7ac4]"
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

          {/* Live preview card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-slate-100">
                {draft.imageUrl ? (
                  <>
                    <Image src={draft.imageUrl} alt="" className="h-full w-full object-cover" />
                  </>
                ) : (
                  <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                    Προσθέστε εικόνα (URL)
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">
                    {draft.mode === "online" ? "Online" : "Δια ζώσης"}
                  </span>
                  <span>•</span>
                  <span>{fmtDateHuman(draft.dateISO)}</span>
                  <span>•</span>
                  <span>{draft.durationMin}’</span>
                </div>
                <h4 className="mt-2 text-base font-semibold">{draft.title || "Τίτλος"}</h4>
                <p className="mt-1 text-sm text-slate-600">{draft.excerpt}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold">{priceText}</span>
                  <button className="rounded-full bg-[#7a7ac4] text-white text-xs px-3 py-1.5">
                    {draft.ctaLabel || "Κράτηση θέσης"}
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