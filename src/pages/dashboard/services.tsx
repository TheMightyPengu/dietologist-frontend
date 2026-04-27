import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const EMPTY_CREATE_FORM: ProvidedServicesPostDto = {
  category: "",
  duration: 60,
  title: "",
  description: "",
  priceIncludingVAT: 0,
};

export default function ManagementServicesPage() {
  const [all, setAll] = useState<ProvidedServicesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("");

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] =
    useState<ProvidedServicesPostDto>(EMPTY_CREATE_FORM);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const loadServices = useCallback(async () => {
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
  }, [activeCategory]);

  const categories = useMemo(() => {
    return Array.from(new Set(all.map((s) => s.category).filter(Boolean)));
  }, [all]);

  const list = useMemo(() => {
    if (!activeCategory) return all;
    return all.filter((s) => s.category === activeCategory);
  }, [all, activeCategory]);

  function openCreateModal() {
    setCreateForm({
      ...EMPTY_CREATE_FORM,
      category: activeCategory || "",
    });
    setCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateModalOpen(false);
    setCreateForm(EMPTY_CREATE_FORM);
  }

  async function handleCreateSubmit() {
    try {
      setCreating(true);

      const payload: ProvidedServicesPostDto = {
        category: createForm.category.trim(),
        duration: Number(createForm.duration),
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        priceIncludingVAT: Number(createForm.priceIncludingVAT),
      };

      const created = await ProvidedServicesApi.create(payload);

      setAll((prev) => [...prev, created]);

      if (!activeCategory) {
        setActiveCategory(created.category);
      }

      if (created.category) {
        setActiveCategory(created.category);
      }

      setCreateModalOpen(false);
      setCreateForm(EMPTY_CREATE_FORM);
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
        title: service.title,
        description: service.description,
        priceIncludingVAT: service.priceIncludingVAT,
      };

      await ProvidedServicesApi.update(service.id, payload);

      setAll((prev) => prev.map((x) => (x.id === service.id ? service : x)));
      setToast("Αποθηκεύτηκε.");
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία αποθήκευσης.");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή υπηρεσίας; Η ενέργεια δεν μπορεί να αναιρεθεί.")) {
      return;
    }

    try {
      setBusyId(id);

      await ProvidedServicesApi.remove(id);

      const remaining = all.filter((x) => x.id !== id);
      setAll(remaining);

      setActiveCategory((prev) => {
        if (remaining.some((x) => x.category === prev)) return prev;
        return remaining[0]?.category || "";
      });

      setToast("Διαγράφηκε.");
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
                onClick={openCreateModal}
                className="rounded-full px-4 py-2 text-sm font-semibold transition bg-[#8484d1] text-white hover:shadow"
              >
                Νέα υπηρεσία
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

        {createModalOpen && (
          <CreateServiceModal
            form={createForm}
            setForm={setCreateForm}
            creating={creating}
            onClose={closeCreateModal}
            onSubmit={handleCreateSubmit}
          />
        )}

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg z-[70]">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}

function CreateServiceModal({
  form,
  setForm,
  creating,
  onClose,
  onSubmit,
}: {
  form: ProvidedServicesPostDto;
  setForm: React.Dispatch<React.SetStateAction<ProvidedServicesPostDto>>;
  creating: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
      />

      <div className="relative z-[61] w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Νέα υπηρεσία
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Συμπλήρωσε πρώτα τα στοιχεία και μετά δημιούργησε την υπηρεσία.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1] disabled:opacity-60"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Τίτλος
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Κατηγορία
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  setForm((d) => ({ ...d, category: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Διάρκεια
              </label>
              <input
                type="number"
                min={0}
                value={form.duration}
                onChange={(e) =>
                  setForm((d) => ({
                    ...d,
                    duration: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
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
                value={form.priceIncludingVAT}
                onChange={(e) =>
                  setForm((d) => ({
                    ...d,
                    priceIncludingVAT: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Περιγραφή
            </label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm((d) => ({ ...d, description: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500 mb-2">
              Προεπισκόπηση JSON για API
            </p>
            <pre className="text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(form, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[#8484d1] disabled:opacity-60"
          >
            Άκυρο
          </button>

          <button
            onClick={onSubmit}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating
                ? "bg-[#8484d1]/70 text-white cursor-wait"
                : "bg-[#8484d1] text-white hover:shadow"
            )}
          >
            {creating ? "Δημιουργία…" : "Δημιουργία υπηρεσίας"}
          </button>
        </div>
      </div>
    </div>
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft(svc);
  }, [svc]);

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {draft.title || "(Χωρίς τίτλο)"}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {draft.category || "(Χωρίς κατηγορία)"}
          </p>
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
            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            Διαγραφή
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Τίτλος
              </label>
              <input
                type="text"
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

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
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
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
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
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
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
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
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
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
                  title: draft.title,
                  description: draft.description,
                  priceIncludingVAT: draft.priceIncludingVAT,
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
              className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
            >
              Επαναφορά αλλαγών
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}
