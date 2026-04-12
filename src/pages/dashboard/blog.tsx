import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArticlesApi,
  type ArticlesGetDto,
  type ArticlesPostDto,
} from "@/api/ArticlesController";
import {
  RecipesApi,
  type RecipesGetDto,
  type RecipesPostDto,
} from "@/api/RecipesController";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const fieldClass =
  "mt-1 w-full rounded-lg border-2 border-black-500 bg-white px-3 py-2 shadow-sm outline-none transition " +
  "placeholder:text-slate-400 focus:border-[#8484d1] focus:ring-4 focus:ring-[#8484d1]/20";

const fileClass =
  "mt-1 block w-full rounded-lg border-2 border-dashed border-black-400 bg-slate-50 px-3 py-2 text-sm " +
  "file:mr-3 file:rounded-full file:border-0 file:bg-[#8484d1] file:px-3 file:py-1.5 file:text-white";

const searchClass =
  "w-full md:w-80 rounded-xl border-2 border-black-500 bg-white px-3 py-2 shadow-sm outline-none transition " +
  "placeholder:text-slate-400 focus:border-[#8484d1] focus:ring-4 focus:ring-[#8484d1]/20";

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

type Tab = "articles" | "recipes";

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  } catch {
    return iso;
  }
}

export default function ManagementBlogPage() {
  const [active, setActive] = useState<Tab>("articles");

  return (
    <>
      <Head>
        <title>Διαχείριση | BLOG</title>
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
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">BLOG</h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex gap-2">
              {[
                { key: "articles", label: "Άρθρα" },
                { key: "recipes", label: "Συνταγές" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key as Tab)}
                  className={cx(
                    "px-4 py-2 rounded-full text-sm font-medium transition",
                    active === t.key
                      ? "bg-[#8484d1] text-white"
                      : "bg-white border border-slate-200 hover:border-[#8484d1]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          {active === "articles" ? <ArticlesManager /> : <RecipesManager />}
        </div>
      </div>
    </>
  );
}

/* ========================= ARTICLES ========================= */

function ArticlesManager() {
  const [all, setAll] = useState<ArticlesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const emptyArticle: ArticlesPostDto = {
    title: "",
    subtitle: "",
    heading: "",
    content: "",
    imageUrl: "",
    publishedAt: new Date().toISOString(),
    imageFile: null,
  };

  const [createDraft, setCreateDraft] = useState<ArticlesPostDto>(emptyArticle);

  async function load() {
    try {
      setLoading(true);
      const data = await ArticlesApi.list();
      setAll(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;

    return all.filter((a) =>
      [a.title, a.subtitle, a.heading, a.content]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(s))
    );
  }, [all, q]);

  async function onCreateSubmit() {
    try {
      setCreating(true);
      const created = await ArticlesApi.create(createDraft);
      setAll((prev) => [created, ...prev]);
      setToast("Δημιουργήθηκε.");
      setCreateOpen(false);
      setCreateDraft({
        ...emptyArticle,
        publishedAt: new Date().toISOString(),
      });
    } finally {
      setCreating(false);
    }
  }

  async function onSave(id: number, payload: ArticlesPostDto) {
    try {
      setBusyId(id);
      await ArticlesApi.update(id, payload);
      const fresh = await ArticlesApi.get(id);
      setAll((prev) => prev.map((x) => (x.id === id ? fresh : x)));
      setToast("Αποθηκεύτηκε.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Διαγραφή άρθρου;")) return;

    try {
      setBusyId(id);
      await ArticlesApi.remove(id);
      setAll((prev) => prev.filter((x) => x.id !== id));
      setToast("Διαγράφηκε.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση άρθρων…"
            className={searchClass}
          />
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-full px-4 py-2 text-sm font-semibold transition bg-[#8484d1] text-white hover:shadow"
          >
            Νέο άρθρο
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
          {filtered.map((a) => (
            <ArticleEditorCard
              key={a.id}
              row={a}
              busy={busyId === a.id}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateArticleModal
          draft={createDraft}
          setDraft={setCreateDraft}
          creating={creating}
          onClose={() => {
            if (creating) return;
            setCreateOpen(false);
          }}
          onSubmit={onCreateSubmit}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function CreateArticleModal({
  draft,
  setDraft,
  creating,
  onClose,
  onSubmit,
}: {
  draft: ArticlesPostDto;
  setDraft: React.Dispatch<React.SetStateAction<ArticlesPostDto>>;
  creating: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Νέο άρθρο</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Υπότιτλος</label>
            <input
              value={draft.subtitle}
              onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Heading</label>
            <input
              value={draft.heading}
              onChange={(e) => setDraft((d) => ({ ...d, heading: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ημ/νία δημοσίευσης</label>
            <input
              type="date"
              value={draft.publishedAt.slice(0, 10)}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  publishedAt: new Date(e.target.value).toISOString(),
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Εικόνα URL</label>
            <input
              value={draft.imageUrl ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Αρχείο εικόνας</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  imageFile: e.target.files?.[0] ?? null,
                }))
              }
              className={fileClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Περιεχόμενο</label>
            <textarea
              rows={10}
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
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
            {creating ? "Δημιουργία…" : "Δημιουργία"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleEditorCard({
  row,
  busy,
  onSave,
  onDelete,
}: {
  row: ArticlesGetDto;
  busy: boolean;
  onSave: (id: number, payload: ArticlesPostDto) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<ArticlesPostDto>({
    title: row.title,
    subtitle: row.subtitle,
    heading: row.heading,
    content: row.content,
    imageUrl: row.imageUrl ?? "",
    publishedAt: row.publishedAt,
    imageFile: null,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft({
      title: row.title,
      subtitle: row.subtitle,
      heading: row.heading,
      content: row.content,
      imageUrl: row.imageUrl ?? "",
      publishedAt: row.publishedAt,
      imageFile: null,
    });
  }, [row]);

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">{fmtDate(draft.publishedAt)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
          >
            {open ? "Σύμπτυξη" : "Επέκταση"}
          </button>
          <button
            onClick={() => onDelete(row.id)}
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
            <div>
              <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Υπότιτλος</label>
              <input
                value={draft.subtitle}
                onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Heading</label>
              <input
                value={draft.heading}
                onChange={(e) => setDraft((d) => ({ ...d, heading: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Ημ/νία δημοσίευσης</label>
              <input
                type="date"
                value={draft.publishedAt.slice(0, 10)}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    publishedAt: new Date(e.target.value).toISOString(),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Εικόνα (URL)</label>
              <input
                value={draft.imageUrl ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Αρχείο εικόνας</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    imageFile: e.target.files?.[0] ?? null,
                  }))
                }
                className={fileClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Περιεχόμενο</label>
              <textarea
                rows={10}
                value={draft.content}
                onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSave(row.id, draft)}
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
                onClick={() =>
                  setDraft({
                    title: row.title,
                    subtitle: row.subtitle,
                    heading: row.heading,
                    content: row.content,
                    imageUrl: row.imageUrl ?? "",
                    publishedAt: row.publishedAt,
                    imageFile: null,
                  })
                }
                className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-slate-100 relative">
                {draft.imageUrl ? (
                  <Image src={draft.imageUrl} alt="" fill className="object-cover" />
                ) : null}
              </div>
              <div className="px-4 py-3">
                <h4 className="text-base font-semibold">{draft.title}</h4>
                {draft.subtitle && (
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{draft.subtitle}</p>
                )}
                {draft.heading && (
                  <p className="mt-2 text-xs text-slate-500">{draft.heading}</p>
                )}
                <div className="mt-3 text-xs text-slate-600">{fmtDate(draft.publishedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ========================= RECIPES ========================= */

function RecipesManager() {
  const [all, setAll] = useState<RecipesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const emptyRecipe: RecipesPostDto = {
    title: "",
    ingredients: "",
    category: "",
    instructions: "",
    timeToPrepare: 0,
    description: "",
    imageUrl: "",
    createdAt: new Date().toISOString(),
    imageFile: null,
  };

  const [createDraft, setCreateDraft] = useState<RecipesPostDto>(emptyRecipe);

  async function load() {
    try {
      setLoading(true);
      const data = await RecipesApi.list();
      setAll(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;

    return all.filter((r) =>
      [r.title, r.category, r.description, r.ingredients, r.instructions]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(s))
    );
  }, [all, q]);

  async function onCreateSubmit() {
    try {
      setCreating(true);
      const created = await RecipesApi.create(createDraft);
      setAll((prev) => [created, ...prev]);
      setToast("Δημιουργήθηκε.");
      setCreateOpen(false);
      setCreateDraft({
        ...emptyRecipe,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setCreating(false);
    }
  }

  async function onSave(id: number, payload: RecipesPostDto) {
    try {
      setBusyId(id);
      await RecipesApi.update(id, payload);
      const fresh = await RecipesApi.get(id);
      setAll((prev) => prev.map((x) => (x.id === id ? fresh : x)));
      setToast("Αποθηκεύτηκε.");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Διαγραφή συνταγής;")) return;

    try {
      setBusyId(id);
      await RecipesApi.remove(id);
      setAll((prev) => prev.filter((x) => x.id !== id));
      setToast("Διαγράφηκε.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση συνταγών…"
            className={searchClass}
          />
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded-full px-4 py-2 text-sm font-semibold transition bg-[#8484d1] text-white hover:shadow"
          >
            Νέα συνταγή
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
          {filtered.map((r) => (
            <RecipeEditorCard
              key={r.id}
              row={r}
              busy={busyId === r.id}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateRecipeModal
          draft={createDraft}
          setDraft={setCreateDraft}
          creating={creating}
          onClose={() => {
            if (creating) return;
            setCreateOpen(false);
          }}
          onSubmit={onCreateSubmit}
        />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function CreateRecipeModal({
  draft,
  setDraft,
  creating,
  onClose,
  onSubmit,
}: {
  draft: RecipesPostDto;
  setDraft: React.Dispatch<React.SetStateAction<RecipesPostDto>>;
  creating: boolean;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">Νέα συνταγή</h3>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
          >
            Κλείσιμο
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Κατηγορία</label>
              <input
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Χρόνος προετοιμασίας</label>
              <input
                type="number"
                min={0}
                value={draft.timeToPrepare}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    timeToPrepare: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Περιγραφή</label>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Υλικά</label>
            <textarea
              rows={6}
              value={draft.ingredients}
              onChange={(e) => setDraft((d) => ({ ...d, ingredients: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Οδηγίες</label>
            <textarea
              rows={8}
              value={draft.instructions}
              onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Ημ/νία δημιουργίας</label>
            <input
              type="date"
              value={draft.createdAt.slice(0, 10)}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  createdAt: new Date(e.target.value).toISOString(),
                }))
              }
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Εικόνα URL</label>
            <input
              value={draft.imageUrl ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Αρχείο εικόνας</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  imageFile: e.target.files?.[0] ?? null,
                }))
              }
              className={fileClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
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
            {creating ? "Δημιουργία…" : "Δημιουργία"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecipeEditorCard({
  row,
  busy,
  onSave,
  onDelete,
}: {
  row: RecipesGetDto;
  busy: boolean;
  onSave: (id: number, payload: RecipesPostDto) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState<RecipesPostDto>({
    title: row.title,
    ingredients: row.ingredients,
    category: row.category,
    instructions: row.instructions,
    timeToPrepare: row.timeToPrepare,
    description: row.description,
    imageUrl: row.imageUrl ?? "",
    createdAt: row.createdAt,
    imageFile: null,
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft({
      title: row.title,
      ingredients: row.ingredients,
      category: row.category,
      instructions: row.instructions,
      timeToPrepare: row.timeToPrepare,
      description: row.description,
      imageUrl: row.imageUrl ?? "",
      createdAt: row.createdAt,
      imageFile: null,
    });
  }, [row]);

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {draft.category} • {draft.timeToPrepare}’
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
            onClick={() => onDelete(row.id)}
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
            <div>
              <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Κατηγορία</label>
                <input
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Χρόνος προετοιμασίας</label>
                <input
                  type="number"
                  min={0}
                  value={draft.timeToPrepare}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      timeToPrepare: Number(e.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Περιγραφή</label>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Υλικά</label>
              <textarea
                rows={6}
                value={draft.ingredients}
                onChange={(e) => setDraft((d) => ({ ...d, ingredients: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                placeholder="Βάλε τα υλικά όπως τα δέχεται το backend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Οδηγίες</label>
              <textarea
                rows={8}
                value={draft.instructions}
                onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                placeholder="Βάλε τα βήματα όπως τα δέχεται το backend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Ημ/νία δημιουργίας</label>
              <input
                type="date"
                value={draft.createdAt.slice(0, 10)}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    createdAt: new Date(e.target.value).toISOString(),
                  }))
                }
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Εικόνα (URL)</label>
              <input
                value={draft.imageUrl ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Αρχείο εικόνας</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    imageFile: e.target.files?.[0] ?? null,
                  }))
                }
                className={fileClass}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSave(row.id, draft)}
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
                onClick={() =>
                  setDraft({
                    title: row.title,
                    ingredients: row.ingredients,
                    category: row.category,
                    instructions: row.instructions,
                    timeToPrepare: row.timeToPrepare,
                    description: row.description,
                    imageUrl: row.imageUrl ?? "",
                    createdAt: row.createdAt,
                    imageFile: null,
                  })
                }
                className="rounded-full border border-slate-400 bg-white px-4 py-2 text-sm hover:border-[#8484d1]"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-slate-100 relative">
                {draft.imageUrl ? (
                  <Image src={draft.imageUrl} alt="" fill className="object-cover" />
                ) : null}
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{draft.category}</span>
                  <span>•</span>
                  <span>{draft.timeToPrepare}’</span>
                </div>
                <h4 className="mt-2 text-base font-semibold">{draft.title}</h4>
                {draft.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3">{draft.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
