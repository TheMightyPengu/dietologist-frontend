import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createEbook,
  deleteEbook,
  fetchEbooks,
  updateEbook,
  type Ebook,
  type EbookFeature,
} from "@/lib/mgmtEbooksAPI";
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
    return new Intl.DateTimeFormat("el-GR", { day: "2-digit", month: "long", year: "numeric" }).format(d);
  } catch {
    return iso;
  }
}

export default function ManagementEbookPage() {
  const [all, setAll] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchEbooks();
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
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(e =>
      [e.title, e.subtitle ?? "", e.description].some(t => t.toLowerCase().includes(q))
    );
  }, [all, query]);

  async function handleCreate() {
    setCreating(true);
    const empty: Omit<Ebook, "id"> = {
      coverUrl: "",
      title: "Νέο Ebook",
      subtitle: "",
      description: "",
      pages: 100,
      format: "PDF",
      lastUpdatedISO: new Date().toISOString(),
      priceEuro: 0,
      previewUrl: "/files/ebook-sample.pdf",
      buyUrl: "/contact#ebook",
      buyCta: "Αγορά",
      previewCta: "Προεπισκόπηση",
      features: [],
      contents: [],
      published: false,
    };
    const created = await createEbook(empty);
    setAll(prev => [created, ...prev]);
    setCreating(false);
    setToast("Δημιουργήθηκε.");
  }

  async function handleSave(eb: Ebook) {
    setBusyId(eb.id);
    const updated = await updateEbook(eb);
    setAll(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    setBusyId(null);
    setToast("Αποθηκεύτηκε.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Διαγραφή ebook;")) return;
    setBusyId(id);
    await deleteEbook(id);
    setAll(prev => prev.filter(x => x.id !== id));
    setBusyId(null);
    setToast("Διαγράφηκε.");
  }

  return (
    <>
      <Head>
        <title>Διαχείριση | EBOOK</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
            >
              ← Πίσω στο Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">EBOOK</h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Αναζήτηση ebooks…"
                className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
              <button
                onClick={handleCreate}
                disabled={creating}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  creating ? "bg-[#8484d1]/70 text-white cursor-wait" : "bg-[#8484d1] text-white hover:shadow"
                )}
              >
                {creating ? "Δημιουργία…" : "Νέο ebook"}
              </button>
            </div>
          </Card>

          {loading ? (
            <Card className="p-6"><p>Φόρτωση…</p></Card>
          ) : filtered.length === 0 ? (
            <Card className="p-6 text-slate-600">Καμία εγγραφή.</Card>
          ) : (
            <div className="space-y-6">
              {filtered.map(eb => (
                <EbookEditorCard
                  key={eb.id}
                  eb={eb}
                  busy={busyId === eb.id}
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
function EbookEditorCard({
  eb,
  busy,
  onSave,
  onDelete,
}: {
  eb: Ebook;
  busy: boolean;
  onSave: (e: Ebook) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState<Ebook>(eb);
  const [open, setOpen] = useState(true);

  useEffect(() => setDraft(eb), [eb]);

  const addFeature = () =>
    setDraft(d => ({ ...d, features: [...d.features, { id: `f-${Date.now().toString(36)}`, title: "", desc: "" }] }));
  const updateFeature = (id: string, patch: Partial<EbookFeature>) =>
    setDraft(d => ({ ...d, features: d.features.map(f => (f.id === id ? { ...f, ...patch } : f)) }));
  const removeFeature = (id: string) =>
    setDraft(d => ({ ...d, features: d.features.filter(f => f.id !== id) }));

  const addContent = () => setDraft(d => ({ ...d, contents: [...d.contents, ""] }));
  const removeContent = (i: number) =>
    setDraft(d => ({ ...d, contents: d.contents.filter((_, idx) => idx !== i) }));

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {draft.published ? "Δημοσιευμένο" : "Προσχέδιο"} • {draft.pages} σελίδες • Μορφή: {draft.format}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(o => !o)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
                <input
                  value={draft.title}
                  onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Υπότιτλος (προαιρετικό)</label>
                <input
                  value={draft.subtitle ?? ""}
                  onChange={e => setDraft(d => ({ ...d, subtitle: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Περιγραφή</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Σελίδες</label>
                <input
                  type="number"
                  min={1}
                  value={draft.pages}
                  onChange={e => setDraft(d => ({ ...d, pages: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Μορφή</label>
                <input
                  value={draft.format}
                  onChange={e => setDraft(d => ({ ...d, format: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Τελευταία ενημέρωση</label>
                <input
                  type="date"
                  value={draft.lastUpdatedISO.slice(0, 10)}
                  onChange={e => {
                    const dt = new Date(e.target.value);
                    setDraft(d => ({ ...d, lastUpdatedISO: dt.toISOString() }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Τιμή (€)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={draft.priceEuro}
                  onChange={e => setDraft(d => ({ ...d, priceEuro: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Σύνδεσμος Προεπισκόπησης</label>
                <input
                  value={draft.previewUrl}
                  onChange={e => setDraft(d => ({ ...d, previewUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">CTA Προεπισκόπησης</label>
                  <input
                    value={draft.previewCta ?? "Προεπισκόπηση"}
                    onChange={e => setDraft(d => ({ ...d, previewCta: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">CTA Αγοράς</label>
                  <input
                    value={draft.buyCta ?? "Αγορά"}
                    onChange={e => setDraft(d => ({ ...d, buyCta: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Σύνδεσμος Αγοράς</label>
                <input
                  value={draft.buyUrl}
                  onChange={e => setDraft(d => ({ ...d, buyUrl: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
              <div className="flex items-end gap-3">
                <input
                  id={`published-${draft.id}`}
                  type="checkbox"
                  checked={draft.published}
                  onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))}
                />
                <label htmlFor={`published-${draft.id}`} className="text-sm">Δημοσιευμένο</label>
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Κάρτες χαρακτηριστικών</label>
                <button
                  onClick={addFeature}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
                >
                  + Προσθήκη κάρτας
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {draft.features.map(f => (
                  <div key={f.id} className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <input
                      placeholder="Τίτλος"
                      value={f.title}
                      onChange={e => updateFeature(f.id, { title: e.target.value })}
                      className="md:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                    <input
                      placeholder="Περιγραφή"
                      value={f.desc}
                      onChange={e => updateFeature(f.id, { desc: e.target.value })}
                      className="md:col-span-3 rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                    <div className="md:col-span-5 flex justify-end">
                      <button
                        onClick={() => removeFeature(f.id)}
                        className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300"
                      >
                        Διαγραφή
                      </button>
                    </div>
                  </div>
                ))}
                {draft.features.length === 0 && (
                  <p className="text-sm text-slate-500">Δεν υπάρχουν κάρτες ακόμη.</p>
                )}
              </div>
            </div>

            {/* Contents list */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Τι θα βρείτε μέσα (bullets)</label>
                <button
                  onClick={addContent}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
                >
                  + Προσθήκη στοιχείου
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {draft.contents.map((c, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-2 text-slate-500 select-none">•</span>
                    <textarea
                      rows={2}
                      value={c}
                      onChange={e => setDraft(d => {
                        const arr = [...d.contents];
                        arr[i] = e.target.value;
                        return { ...d, contents: arr };
                      })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                    <button
                      onClick={() => removeContent(i)}
                      className="shrink-0 rounded-full border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700 hover:border-rose-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {draft.contents.length === 0 && (
                  <p className="text-sm text-slate-500">Καμία καταχώριση ακόμη.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSave(draft)}
                disabled={busy}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  busy ? "bg-[#8484d1]/70 text-white cursor-wait" : "bg-[#8484d1] text-white hover:shadow"
                )}
              >
                {busy ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>
              <button
                onClick={() => setDraft(eb)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
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

          {/* Live preview (layout inspired by your screenshots) */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[4/5] bg-slate-100 relative">
                {draft.coverUrl ? (
                  <>
                    <Image src={draft.coverUrl} alt="" fill className="object-cover" />
                  </>
                ) : (
                  <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                    Προσθέστε εικόνα (URL)
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="text-2xl font-bold">EBOOK</h4>
              <h5 className="mt-1 text-xl font-semibold">{draft.title || "Τίτλος"}</h5>
              {draft.subtitle && <p className="text-slate-600">{draft.subtitle}</p>}
              <p className="mt-2 text-slate-600">{draft.description}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-2 py-1">{draft.pages} σελίδες</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">Μορφή: {draft.format}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Τελευταία ενημέρωση: {fmtDateHuman(draft.lastUpdatedISO)}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <a className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm">
                  {draft.previewCta || "Προεπισκόπηση"} →
                </a>
                <a className="rounded-full bg-[#8484d1] text-white px-3 py-1.5 text-sm">
                  {(draft.buyCta || "Αγορά") + ` — ${draft.priceEuro}€`}
                </a>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3">
              {draft.features.slice(0, 3).map(f => (
                <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-semibold">{f.title || "Τίτλος"}</div>
                  <div className="text-sm text-slate-600">{f.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-[#8484d1] text-white p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Τι θα βρείτε μέσα</div>
                <div className="rounded-full bg-white/20 px-3 py-1 text-sm">
                  Αγορά τώρα — {draft.priceEuro}€
                </div>
              </div>
              <ul className="mt-3 list-disc pl-5 space-y-1 text-sm">
                {draft.contents.slice(0, 8).map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-white/90">Ασφαλής πληρωμή — Άμεση πρόσβαση.</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
