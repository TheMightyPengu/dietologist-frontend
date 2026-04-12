import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  EbooksApi,
  type EbooksGetDto,
  type EbooksPostDto,
} from "@/api/EbooksController";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

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

type EbookDraft = EbooksGetDto & {
  file?: File | null;
};

type CreateEbookDraft = EbooksPostDto;

function fmtDateHuman(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

function toInputDate(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function draftToPayload(draft: EbookDraft): EbooksPostDto {
  return {
    title: draft.title,
    author: draft.author,
    tableOfContents: draft.tableOfContents,
    coverImageUrl: draft.coverImageUrl,
    price: Number(draft.price) || 0,
    fileUrl: draft.fileUrl ?? "",
    publishedAt: draft.publishedAt,
    file: draft.file ?? null,
  };
}

function getEmptyCreateDraft(): CreateEbookDraft {
  return {
    title: "",
    author: "",
    tableOfContents: "",
    coverImageUrl: "",
    price: 0,
    fileUrl: "",
    publishedAt: new Date().toISOString(),
    file: null,
  };
}

export default function ManagementEbookPage() {
  const [all, setAll] = useState<EbookDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<CreateEbookDraft>(getEmptyCreateDraft());

  async function loadEbooks() {
    try {
      setLoading(true);
      const data = await EbooksApi.list();
      setAll(data.map((x) => ({ ...x, file: null })));
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία φόρτωσης ebooks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEbooks();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;

    return all.filter((e) =>
      [e.title, e.author, e.tableOfContents, e.coverImageUrl, e.fileUrl ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [all, query]);

  function openCreateModal() {
    setCreateDraft(getEmptyCreateDraft());
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setIsCreateOpen(false);
  }

  async function handleCreateSubmit() {
    if (!createDraft.title.trim()) {
      setToast("Συμπλήρωσε τίτλο.");
      return;
    }

    if (!createDraft.author.trim()) {
      setToast("Συμπλήρωσε συγγραφέα.");
      return;
    }

    try {
      setCreating(true);
      const created = await EbooksApi.create(createDraft);
      setAll((prev) => [{ ...created, file: null }, ...prev]);
      setIsCreateOpen(false);
      setCreateDraft(getEmptyCreateDraft());
      setToast("Δημιουργήθηκε.");
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία δημιουργίας.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(draft: EbookDraft) {
    try {
      setBusyId(draft.id);
      await EbooksApi.update(draft.id, draftToPayload(draft));

      const refreshed = await EbooksApi.get(draft.id);
      setAll((prev) =>
        prev.map((x) => (x.id === draft.id ? { ...refreshed, file: null } : x))
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
    if (!confirm("Διαγραφή ebook;")) return;

    try {
      setBusyId(id);
      await EbooksApi.remove(id);
      setAll((prev) => prev.filter((x) => x.id !== id));
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
        <title>Διαχείριση | Ebooks</title>
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
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">EBOOKS</h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Αναζήτηση ebooks…"
                className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
              <button
                onClick={openCreateModal}
                className="rounded-full px-4 py-2 text-sm font-semibold transition bg-[#8484d1] text-white hover:shadow"
              >
                Νέο ebook
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
              {filtered.map((ebook) => (
                <EbookEditorCard
                  key={ebook.id}
                  eb={ebook}
                  busy={busyId === ebook.id}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {isCreateOpen && (
          <CreateEbookModal
            draft={createDraft}
            setDraft={setCreateDraft}
            creating={creating}
            onClose={closeCreateModal}
            onSubmit={handleCreateSubmit}
          />
        )}

        {toast && (
          <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}

function CreateEbookModal({
  draft,
  setDraft,
  creating,
  onClose,
  onSubmit,
}: {
  draft: CreateEbookDraft;
  setDraft: React.Dispatch<React.SetStateAction<CreateEbookDraft>>;
  creating: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Κλείσιμο modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-xl font-semibold">Νέο ebook</h2>
            <p className="text-sm text-slate-500 mt-1">
              Συμπλήρωσε πρώτα τα στοιχεία και μετά δημιούργησέ το.
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={creating}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1] disabled:opacity-60"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Συγγραφέας</label>
                <input
                  value={draft.author}
                  onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Πίνακας περιεχομένων</label>
              <textarea
                rows={8}
                value={draft.tableOfContents}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, tableOfContents: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τιμή (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Ημερομηνία δημοσίευσης</label>
                <input
                  type="date"
                  value={toInputDate(draft.publishedAt)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDraft((d) => ({
                      ...d,
                      publishedAt: value
                        ? new Date(`${value}T00:00:00`).toISOString()
                        : new Date().toISOString(),
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Αρχείο ebook</label>
                <input
                  type="file"
                  accept=".pdf,.epub,.doc,.docx"
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                  className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#8484d1] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Cover image URL</label>
                <input
                  value={draft.coverImageUrl}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, coverImageUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">File URL</label>
                <input
                  value={draft.fileUrl ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, fileUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
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
                {creating ? "Δημιουργία…" : "Δημιουργία"}
              </button>

              <button
                onClick={onClose}
                disabled={creating}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#8484d1] disabled:opacity-60"
              >
                Ακύρωση
              </button>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[4/5] bg-slate-100 relative">
                {draft.coverImageUrl ? (
                  <Image
                    src={draft.coverImageUrl}
                    alt={draft.title || "ebook cover"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                    Δεν υπάρχει cover image URL
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="text-2xl font-bold">EBOOK</h4>
              <h5 className="mt-1 text-xl font-semibold">{draft.title || "Τίτλος"}</h5>
              <p className="mt-1 text-slate-600">{draft.author || "Συγγραφέας"}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {draft.price}€
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {fmtDateHuman(draft.publishedAt)}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-slate-700 mb-2">
                  Πίνακας περιεχομένων
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 whitespace-pre-wrap">
                  {draft.tableOfContents || "Δεν υπάρχουν περιεχόμενα."}
                </div>
              </div>

              {(draft.fileUrl || draft.file) && (
                <div className="mt-4 text-sm text-slate-600">
                  {draft.file ? "Έχει επιλεγεί αρχείο για upload." : "Υπάρχει file URL."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EbookEditorCard({
  eb,
  busy,
  onSave,
  onDelete,
}: {
  eb: EbookDraft;
  busy: boolean;
  onSave: (e: EbookDraft) => void;
  onDelete: (id: number) => void;
}) {
  const [draft, setDraft] = useState<EbookDraft>(eb);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setDraft(eb);
  }, [eb]);

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {draft.author || "Χωρίς συγγραφέα"} • {fmtDateHuman(draft.publishedAt)}
          </p>
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
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Συγγραφέας</label>
                <input
                  value={draft.author}
                  onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Πίνακας περιεχομένων</label>
              <textarea
                rows={8}
                value={draft.tableOfContents}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, tableOfContents: e.target.value }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τιμή (€)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Ημερομηνία δημοσίευσης</label>
                <input
                  type="date"
                  value={toInputDate(draft.publishedAt)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDraft((d) => ({
                      ...d,
                      publishedAt: value
                        ? new Date(`${value}T00:00:00`).toISOString()
                        : new Date().toISOString(),
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Αρχείο ebook</label>
                <input
                  type="file"
                  accept=".pdf,.epub,.doc,.docx"
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                  className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[#8484d1] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Cover image URL</label>
                <input
                  value={draft.coverImageUrl}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, coverImageUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">File URL</label>
                <input
                  value={draft.fileUrl ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, fileUrl: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
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
                    ? "bg-[#8484d1]/70 text-white cursor-wait"
                    : "bg-[#8484d1] text-white hover:shadow"
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

          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[4/5] bg-slate-100 relative">
                {draft.coverImageUrl ? (
                  <Image
                    src={draft.coverImageUrl}
                    alt={draft.title || "ebook cover"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-slate-400 text-sm">
                    Δεν υπάρχει cover image URL
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="text-2xl font-bold">EBOOK</h4>
              <h5 className="mt-1 text-xl font-semibold">{draft.title || "Τίτλος"}</h5>
              <p className="mt-1 text-slate-600">{draft.author || "Συγγραφέας"}</p>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {draft.price}€
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {fmtDateHuman(draft.publishedAt)}
                </span>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium text-slate-700 mb-2">
                  Πίνακας περιεχομένων
                </div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 whitespace-pre-wrap">
                  {draft.tableOfContents || "Δεν υπάρχουν περιεχόμενα."}
                </div>
              </div>

              {(draft.fileUrl || draft.file) && (
                <div className="mt-4 text-sm text-slate-600">
                  {draft.file ? "Έχει επιλεγεί νέο αρχείο για upload." : "Υπάρχει αποθηκευμένο file URL."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}