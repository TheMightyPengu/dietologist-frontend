import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ProvidedServicesApi,
  type ProvidedServicesGetDto,
  type ProvidedServicesPostDto,
} from "@/api/ProvidedServicesController";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50",
      className
    )}
  >
    {children}
  </div>
);

export default function ManagementServicesPage() {
  const [all, setAll] = useState<ProvidedServicesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await ProvidedServicesApi.list();
      setAll(data);

      if (!activeCategory && data.length > 0) {
        setActiveCategory(data[0].category);
      }
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία φόρτωσης υπηρεσιών.");
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const unique = Array.from(new Set(all.map((s) => s.category).filter(Boolean)));
    return unique;
  }, [all]);

  const list = useMemo(() => {
    if (!activeCategory) return all;
    return all.filter((s) => s.category === activeCategory);
  }, [all, activeCategory]);

  async function handleCreate() {
    try {
      setCreating(true);

      const payload: ProvidedServicesPostDto = {
        category: activeCategory || "General",
        duration: 60,
        description: "",
        priceIncludingVAT: 0,
        intervalInDays: 7,
      };

      const created = await ProvidedServicesApi.create(payload);
      setAll((prev) => [...prev, created]);

      if (!activeCategory) {
        setActiveCategory(created.category);
      }

      setToast("Δημιουργήθηκε η υπηρεσία.");
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία δημιουργίας υπηρεσίας.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(service: ProvidedServicesGetDto) {
    try {
      setBusyId(service.id);

      const payload: ProvidedServicesPostDto = {
        category: service.category,
        duration: service.duration,
        description: service.description,
        priceIncludingVAT: service.priceIncludingVAT,
        intervalInDays: service.intervalInDays,
      };

      await ProvidedServicesApi.update(service.id, payload);

      setAll((prev) =>
        prev.map((x) => (x.id === service.id ? service : x))
      );

      setToast("Αποθηκεύτηκε.");
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία αποθήκευσης.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή υπηρεσίας; Η ενέργεια δεν μπορεί να αναιρεθεί.")) {
      return;
    }

    try {
      setBusyId(id);
      await ProvidedServicesApi.remove(id);
      setAll((prev) => prev.filter((x) => x.id !== id));
      setToast("Διαγράφηκε.");

      setTimeout(() => {
        setActiveCategory((prev) => {
          const remaining = all.filter((x) => x.id !== id);
          if (remaining.some((x) => x.category === prev)) return prev;
          return remaining[0]?.category || "";
        });
      }, 0);
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία διαγραφής.");
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
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
            >
              ← Πίσω στο Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              ΥΠΗΡΕΣΙΕΣ
            </h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map((category) => {
                    const sel = category === activeCategory;
                    return (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={cx(
                          "px-3 md:px-4 py-2 rounded-full text-sm font-medium transition",
                          sel
                            ? "bg-[#8484d1] text-white"
                            : "bg-white border border-slate-200 hover:border-[#8484d1]"
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
                onClick={handleCreate}
                disabled={creating}
                className={cx(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  creating
                    ? "bg-[#8484d1]/70 text-white cursor-wait"
                    : "bg-[#8484d1] text-white hover:shadow"
                )}
              >
                {creating ? "Δημιουργία…" : "Νέα υπηρεσία"}
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

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
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
  onSave: (s: ProvidedServicesGetDto) => void;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState<ProvidedServicesGetDto>(svc);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setDraft(svc);
  }, [svc]);

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.category || "(Χωρίς κατηγορία)"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">ID: {draft.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
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
        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Κατηγορία
              </label>
              <input
                type="text"
                value={draft.category}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, category: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Διάρκεια
              </label>
              <input
                type="number"
                min={0}
                value={draft.duration}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    duration: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Τιμή με ΦΠΑ
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.priceIncludingVAT}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    priceIncludingVAT: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Interval σε ημέρες
              </label>
              <input
                type="number"
                min={0}
                value={draft.intervalInDays}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    intervalInDays: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Περιγραφή
            </label>
            <textarea
              rows={5}
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500 mb-2">
              Προεπισκόπηση JSON για API
            </p>
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(
                {
                  category: draft.category,
                  duration: draft.duration,
                  description: draft.description,
                  priceIncludingVAT: draft.priceIncludingVAT,
                  intervalInDays: draft.intervalInDays,
                },
                null,
                2
              )}
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSave(draft)}
              disabled={busy}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                busy
                  ? "bg-[#8484d1]/70 text-white cursor-wait"
                  : "bg-[#8484d1] text-white hover:shadow"
              )}
            >
              {busy ? "Αποθήκευση…" : "Αποθήκευση"}
            </button>

            <button
              onClick={() => setDraft(svc)}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
            >
              Επαναφορά αλλαγών
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}