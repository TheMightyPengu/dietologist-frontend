import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createService,
  deleteService,
  fetchServices,
  updateService,
  type Service,
  type ServiceCategory,
  type ServiceChip,
} from "@/lib/mgmtServicesAPI";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cx("rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50", className)}>
    {children}
  </div>
);

const CATEGORIES: { key: ServiceCategory; label: string }[] = [
  { key: "individual", label: "Ατομικές συνεδρίες (1:1)" },
  { key: "group", label: "Ομαδικές συνεδρίες" },
];

export default function ManagementServicesPage() {
  const [all, setAll] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<ServiceCategory>("individual");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchServices();
      setAll(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const list = useMemo(
    () => all.filter(s => s.category === activeCat),
    [all, activeCat]
  );

  async function handleCreate() {
    setCreating(true);
    const empty: Omit<Service, "id"> = {
      category: activeCat,
      title: activeCat === "individual" ? "Νέα ατομική υπηρεσία" : "Νέα ομαδική υπηρεσία",
      intro: "",
      points: [],
      chips: [],
    };
    const created = await createService(empty);
    setAll(prev => [...prev, created]);
    setCreating(false);
    setToast("Δημιουργήθηκε η υπηρεσία.");
  }

  async function handleSave(svc: Service) {
    setBusyId(svc.id);
    const updated = await updateService(svc);
    setAll(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    setBusyId(null);
    setToast("Αποθηκεύτηκε.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Διαγραφή υπηρεσίας; Η ενέργεια δεν μπορεί να αναιρεθεί.")) return;
    setBusyId(id);
    await deleteService(id);
    setAll(prev => prev.filter(x => x.id !== id));
    setBusyId(null);
    setToast("Διαγράφηκε.");
  }

  return (
    <>
      <Head>
        <title>Διαχείριση | ΥΠΗΡΕΣΙΕΣ</title>
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
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">ΥΠΗΡΕΣΙΕΣ</h1>
          </div>

          {/* Category tabs + create */}
          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => {
                  const sel = c.key === activeCat;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setActiveCat(c.key)}
                      className={cx(
                        "px-3 md:px-4 py-2 rounded-full text-sm font-medium transition",
                        sel ? "bg-[#7a7ac4] text-white" : "bg-white border border-slate-200 hover:border-[#7a7ac4]"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleCreate}
                disabled={creating}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  creating ? "bg-[#7a7ac4]/70 text-white cursor-wait" : "bg-[#7a7ac4] text-white hover:shadow"
                )}
              >
                {creating ? "Δημιουργία…" : "Νέα υπηρεσία"}
              </button>
            </div>
          </Card>

          {/* List */}
          {loading ? (
            <Card className="p-6"><p>Φόρτωση…</p></Card>
          ) : list.length === 0 ? (
            <Card className="p-6 text-slate-600">Δεν υπάρχουν υπηρεσίες σε αυτή την κατηγορία.</Card>
          ) : (
            <div className="space-y-6">
              {list.map(svc => (
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

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}

/* ------------ Editor Card ------------ */
function ServiceEditorCard({
  svc,
  busy,
  onSave,
  onDelete,
}: {
  svc: Service;
  busy: boolean;
  onSave: (s: Service) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Service>(svc);
  const [open, setOpen] = useState(true);

  useEffect(() => setDraft(svc), [svc]); // reset when row props change

  const addPoint = () => setDraft(d => ({ ...d, points: [...d.points, ""] }));
  const removePoint = (i: number) =>
    setDraft(d => ({ ...d, points: d.points.filter((_, idx) => idx !== i) }));

  const addChip = () =>
    setDraft(d => ({
      ...d,
      chips: [...d.chips, { id: `chip-${Date.now().toString(36)}`, label: "", value: "" }],
    }));
  const updateChip = (id: string, patch: Partial<ServiceChip>) =>
    setDraft(d => ({ ...d, chips: d.chips.map(c => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeChip = (id: string) =>
    setDraft(d => ({ ...d, chips: d.chips.filter(c => c.id !== id) }));

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Κατηγορία: {draft.category === "individual" ? "Ατομικές" : "Ομαδικές"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(o => !o)}
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
        <div className="mt-5 space-y-6">
          {/* Title & Intro */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
              <input
                type="text"
                value={draft.title}
                onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Εισαγωγική παράγραφος (προαιρετικό)
              </label>
              <textarea
                rows={3}
                value={draft.intro || ""}
                onChange={e => setDraft(d => ({ ...d, intro: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>
          </div>

          {/* Points */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                Σημεία/ενότητες (λίστα)
              </label>
              <button
                onClick={addPoint}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
              >
                + Προσθήκη σημείου
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {draft.points.map((p, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-2 text-slate-500 select-none">{i + 1}.</span>
                  <textarea
                    rows={2}
                    value={p}
                    onChange={e =>
                      setDraft(d => {
                        const pts = [...d.points];
                        pts[i] = e.target.value;
                        return { ...d, points: pts };
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                  />
                  <button
                    onClick={() => removePoint(i)}
                    className="shrink-0 rounded-full border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700 hover:border-rose-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {draft.points.length === 0 && (
                <p className="text-sm text-slate-500">Καμία καταχώριση ακόμη.</p>
              )}
            </div>
          </div>

          {/* Chips */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">
                Ετικέτες/χαρακτηριστικά (chips)
              </label>
              <button
                onClick={addChip}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
              >
                + Προσθήκη ετικέτας
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {draft.chips.map(ch => (
                <div key={ch.id} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input
                    placeholder="Ετικέτα (π.χ. Διάρκεια)"
                    value={ch.label}
                    onChange={e => updateChip(ch.id, { label: e.target.value })}
                    className="md:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                  />
                  <input
                    placeholder="Τιμή (π.χ. 60’)"
                    value={ch.value}
                    onChange={e => updateChip(ch.id, { value: e.target.value })}
                    className="md:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                  />
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => removeChip(ch.id)}
                      className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300"
                    >
                      Διαγραφή
                    </button>
                  </div>
                </div>
              ))}
              {draft.chips.length === 0 && (
                <p className="text-sm text-slate-500">Καμία ετικέτα ακόμη.</p>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500 mb-2">Προεπισκόπηση JSON (για API):</p>
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(draft, null, 2)}
            </pre>
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
              onClick={() => setDraft(svc)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#7a7ac4]"
            >
              Επαναφορά αλλαγών
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
