import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchArticles, createArticle, updateArticle, deleteArticle,
  fetchRecipes,  createRecipe,  updateRecipe,  deleteRecipe,
  type Article, type ArticleCategory, type ContentBlock,
  type Recipe,  type RecipeCategory
} from "@/lib/mgmtBlogAPI";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cx("rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50", className)}>
    {children}
  </div>
);

type Tab = "articles" | "recipes";

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("el-GR", {
      day: "2-digit", month: "2-digit", year: "numeric"
    }).format(d);
  } catch { return iso; }
}

/* ================== Page ================== */
export default function ManagementBlogPage() {
  const [active, setActive] = useState<Tab>("articles");
  return (
    <>
      <Head>
        <title>Διαχείριση | BLOG</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-[#F7F7EF] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
            >
              ← Πίσω στο Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">BLOG</h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex gap-2">
              {[
                { key: "articles", label: "Άρθρα" },
                { key: "recipes",  label: "Συνταγές" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key as Tab)}
                  className={cx(
                    "px-4 py-2 rounded-full text-sm font-medium transition",
                    active === t.key ? "bg-[#7a7ac4] text-white" : "bg-white border border-slate-200 hover:border-[#7a7ac4]"
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

/* ================== Articles ================== */
const CAT_OPTIONS: ArticleCategory[] = ["Ευεξία", "Επιστήμη", "Διατροφή", "Συνταγές", "Άλλο"];

function ArticlesManager() {
  const [all, setAll] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { (async () => {
    setLoading(true);
    setAll(await fetchArticles());
    setLoading(false);
  })(); }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(a => [a.title, a.excerpt, a.tags.join(" ")].some(t => t.toLowerCase().includes(s)));
  }, [all, q]);

  async function onCreate() {
    setCreating(true);
    const now = new Date().toISOString();
    const row: Omit<Article, "id"> = {
      slug: "neo-arthro-" + Date.now().toString(36),
      title: "Νέο άρθρο",
      imageUrl: "",
      category: "Διατροφή",
      excerpt: "",
      dateISO: now,
      readingMin: 6,
      tags: [],
      content: [{ type: "p", text: "Περιεχόμενο…" }],
      published: false,
    };
    const created = await createArticle(row);
    setAll(prev => [created, ...prev]);
    setCreating(false);
    setToast("Δημιουργήθηκε.");
  }

  async function onSave(a: Article) {
    setBusyId(a.id);
    const upd = await updateArticle(a);
    setAll(prev => prev.map(x => (x.id === upd.id ? upd : x)));
    setBusyId(null);
    setToast("Αποθηκεύτηκε.");
  }

  async function onDelete(id: string) {
    if (!confirm("Διαγραφή άρθρου;")) return;
    setBusyId(id);
    await deleteArticle(id);
    setAll(prev => prev.filter(x => x.id !== id));
    setBusyId(null);
    setToast("Διαγράφηκε.");
  }

  return (
    <>
      <Card className="p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Αναζήτηση άρθρων…"
            className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
          />
          <button
            onClick={onCreate}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating ? "bg-[#7a7ac4]/70 text-white cursor-wait" : "bg-[#7a7ac4] text-white hover:shadow"
            )}
          >
            {creating ? "Δημιουργία…" : "Νέο άρθρο"}
          </button>
        </div>
      </Card>

      {loading ? (
        <Card className="p-6"><p>Φόρτωση…</p></Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-slate-600">Καμία εγγραφή.</Card>
      ) : (
        <div className="space-y-6">
          {filtered.map(a => (
            <ArticleEditorCard key={a.id} row={a} busy={busyId === a.id} onSave={onSave} onDelete={onDelete} />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function ArticleEditorCard({
  row, busy, onSave, onDelete,
}: { row: Article; busy: boolean; onSave: (a: Article)=>void; onDelete:(id:string)=>void }) {
  const [draft, setDraft] = useState<Article>(row);
  const [open, setOpen] = useState(true);
  useEffect(() => setDraft(row), [row.id]);

  const addTag = () => {
    const v = prompt("Νέα ετικέτα (χωρίς #):");
    if (!v) return;
    setDraft(d => ({ ...d, tags: [...d.tags, `#${v.trim()}`] }));
  };
  const removeTag = (t: string) => setDraft(d => ({ ...d, tags: d.tags.filter(x => x !== t) }));

  const addBlock = (type: ContentBlock["type"]) => {
    if (type === "ul") setDraft(d => ({ ...d, content: [...d.content, { type: "ul", items: [""] }] }));
    if (type === "p")  setDraft(d => ({ ...d, content: [...d.content, { type: "p", text: "" }] }));
    if (type === "h3") setDraft(d => ({ ...d, content: [...d.content, { type: "h3", text: "" }] }));
  };
  const updateBlock = (i: number, b: ContentBlock) =>
    setDraft(d => ({ ...d, content: d.content.map((x, idx) => (idx === i ? b : x)) }));
  const removeBlock = (i: number) =>
    setDraft(d => ({ ...d, content: d.content.filter((_, idx) => idx !== i) }));

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {draft.category} • {fmtDate(draft.dateISO)} • {draft.readingMin}’ ανάγνωση • {draft.published ? "Δημοσιευμένο" : "Προσχέδιο"}
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
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
                <input
                  value={draft.title}
                  onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Slug</label>
                <input
                  value={draft.slug}
                  onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Εικόνα (URL)</label>
              <input
                value={draft.imageUrl}
                onChange={e => setDraft(d => ({ ...d, imageUrl: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Κατηγορία</label>
                <select
                  value={draft.category}
                  onChange={e => setDraft(d => ({ ...d, category: e.target.value as ArticleCategory }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                >
                  {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Ημ/νία δημοσίευσης</label>
                <input
                  type="date"
                  value={draft.dateISO.slice(0,10)}
                  onChange={e => setDraft(d => ({ ...d, dateISO: new Date(e.target.value).toISOString() }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Χρόνος ανάγνωσης (’)</label>
                <input
                  type="number"
                  min={1}
                  value={draft.readingMin}
                  onChange={e => setDraft(d => ({ ...d, readingMin: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  id={`pub-${draft.id}`}
                  type="checkbox"
                  checked={draft.published}
                  onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))}
                />
                <label htmlFor={`pub-${draft.id}`} className="text-sm">Δημοσιευμένο</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Σύντομη περιγραφή</label>
              <textarea
                rows={3}
                value={draft.excerpt}
                onChange={e => setDraft(d => ({ ...d, excerpt: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>

            {/* Content blocks */}
            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Περιεχόμενο</div>
                <div className="flex gap-2">
                  <button onClick={() => addBlock("h3")} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]">+ H3</button>
                  <button onClick={() => addBlock("p")}  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]">+ Παράγραφος</button>
                  <button onClick={() => addBlock("ul")} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]">+ Λίστα</button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                {draft.content.map((b, i) => (
                  <div key={i} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase text-slate-500">{b.type}</span>
                      <button onClick={() => removeBlock(i)} className="text-xs text-rose-700">Διαγραφή</button>
                    </div>
                    {b.type === "h3" && (
                      <input
                        value={b.text}
                        onChange={e => updateBlock(i, { type: "h3", text: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                      />
                    )}
                    {b.type === "p" && (
                      <textarea
                        rows={3}
                        value={b.text}
                        onChange={e => updateBlock(i, { type: "p", text: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                      />
                    )}
                    {b.type === "ul" && (
                      <div className="space-y-2">
                        {b.items.map((it, j) => (
                          <div key={j} className="flex gap-2">
                            <span className="text-slate-500">•</span>
                            <input
                              value={it}
                              onChange={e => {
                                const items = [...b.items];
                                items[j] = e.target.value;
                                updateBlock(i, { type: "ul", items });
                              }}
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                            />
                            <button
                              onClick={() => {
                                const items = b.items.filter((_, idx) => idx !== j);
                                updateBlock(i, { type: "ul", items });
                              }}
                              className="text-xs text-rose-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateBlock(i, { type: "ul", items: [...b.items, ""] })}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
                        >
                          + στοιχείο
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {draft.content.length === 0 && (
                  <p className="text-sm text-slate-500">Δεν υπάρχουν μπλοκ περιεχομένου.</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Ετικέτες</label>
                <button onClick={addTag} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]">
                  + Προσθήκη ετικέτας
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
                    {t}
                    <button onClick={() => removeTag(t)} className="text-slate-500">✕</button>
                  </span>
                ))}
                {draft.tags.length === 0 && <span className="text-sm text-slate-500">Καμία ετικέτα.</span>}
              </div>
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
                onClick={() => setDraft(row)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#7a7ac4]"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          {/* Preview card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {draft.imageUrl ? <img src={draft.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="px-4 py-3">
                <span className="inline-block text-[11px] rounded-full bg-[#7a7ac4]/15 text-[#2b2b6f] px-2 py-0.5 mb-2">{draft.category}</span>
                <h4 className="text-base font-semibold">{draft.title}</h4>
                <p className="mt-1 text-sm text-slate-600 line-clamp-3">{draft.excerpt}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                  <span>{fmtDate(draft.dateISO)}</span>
                  <span>⏱ {draft.readingMin}’ ανάγνωση</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {draft.tags.slice(0, 3).map(t => (
                    <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{t.replace(/^#/, "")}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ================== Recipes ================== */
const REC_CATS: RecipeCategory[] = ["Πρωινό","Κυρίως","Σνακ","Ρόφημα","Γλυκό","Σαλάτα","Άλλο"];

function RecipesManager() {
  const [all, setAll] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { (async () => {
    setLoading(true);
    setAll(await fetchRecipes());
    setLoading(false);
  })(); }, []);

  useEffect(() => { if (!toast) return; const t = setTimeout(()=>setToast(null),1600); return ()=>clearTimeout(t); }, [toast]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return all;
    return all.filter(r =>
      [r.title, r.category, r.tags.join(" ")].some(t => t.toLowerCase().includes(s))
    );
  }, [all, q]);

  async function onCreate() {
    setCreating(true);
    const row: Omit<Recipe, "id"> = {
      slug: "nea-syntagi-" + Date.now().toString(36),
      title: "Νέα συνταγή",
      hero: "",
      category: "Σνακ",
      minutes: 30,
      rating: 4.5,
      ingredients: [],
      steps: [],
      tags: [],
      published: false,
    };
    const created = await createRecipe(row);
    setAll(prev => [created, ...prev]);
    setCreating(false);
    setToast("Δημιουργήθηκε.");
  }

  async function onSave(r: Recipe) {
    setBusyId(r.id);
    const upd = await updateRecipe(r);
    setAll(prev => prev.map(x => (x.id === upd.id ? upd : x)));
    setBusyId(null);
    setToast("Αποθηκεύτηκε.");
  }

  async function onDelete(id: string) {
    if (!confirm("Διαγραφή συνταγής;")) return;
    setBusyId(id);
    await deleteRecipe(id);
    setAll(prev => prev.filter(x => x.id !== id));
    setBusyId(null);
    setToast("Διαγράφηκε.");
  }

  return (
    <>
      <Card className="p-4 md:p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Αναζήτηση συνταγών…"
            className="w-full md:w-80 rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
          />
          <button
            onClick={onCreate}
            disabled={creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating ? "bg-[#7a7ac4]/70 text-white cursor-wait" : "bg-[#7a7ac4] text-white hover:shadow"
            )}
          >
            {creating ? "Δημιουργία…" : "Νέα συνταγή"}
          </button>
        </div>
      </Card>

      {loading ? (
        <Card className="p-6"><p>Φόρτωση…</p></Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-slate-600">Καμία εγγραφή.</Card>
      ) : (
        <div className="space-y-6">
          {filtered.map(r => (
            <RecipeEditorCard key={r.id} row={r} busy={busyId === r.id} onSave={onSave} onDelete={onDelete} />
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function RecipeEditorCard({
  row, busy, onSave, onDelete,
}: { row: Recipe; busy: boolean; onSave: (r: Recipe)=>void; onDelete:(id:string)=>void }) {
  const [draft, setDraft] = useState<Recipe>(row);
  const [open, setOpen] = useState(true);
  useEffect(() => setDraft(row), [row.id]);

  const addTag = () => {
    const v = prompt("Νέα ετικέτα:");
    if (!v) return;
    setDraft(d => ({ ...d, tags: [...d.tags, v.trim()] }));
  };
  const removeTag = (t: string) => setDraft(d => ({ ...d, tags: d.tags.filter(x => x !== t) }));

  const addIngredient = () => setDraft(d => ({ ...d, ingredients: [...d.ingredients, ""] }));
  const removeIngredient = (i: number) =>
    setDraft(d => ({ ...d, ingredients: d.ingredients.filter((_, idx) => idx !== i) }));

  const addStep = () => setDraft(d => ({ ...d, steps: [...d.steps, ""] }));
  const removeStep = (i: number) =>
    setDraft(d => ({ ...d, steps: d.steps.filter((_, idx) => idx !== i) }));

  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{draft.title || "(Χωρίς τίτλο)"}</h3>
          <p className="text-xs text-slate-500 mt-1">
            {draft.category} • {draft.minutes}’ • {draft.published ? "Δημοσιευμένη" : "Προσχέδιο"}
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
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
                <input
                  value={draft.title}
                  onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Slug</label>
                <input
                  value={draft.slug}
                  onChange={e => setDraft(d => ({ ...d, slug: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Εικόνα (URL)</label>
              <input
                value={draft.hero}
                onChange={e => setDraft(d => ({ ...d, hero: e.target.value }))}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Κατηγορία</label>
                <select
                  value={draft.category}
                  onChange={e => setDraft(d => ({ ...d, category: e.target.value as RecipeCategory }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                >
                  {REC_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Χρόνος (λεπτά)</label>
                <input
                  type="number"
                  min={0}
                  value={draft.minutes}
                  onChange={e => setDraft(d => ({ ...d, minutes: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Βαθμολογία (προαιρετική)</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5}
                  value={draft.rating ?? ""}
                  onChange={e => setDraft(d => ({ ...d, rating: e.target.value === "" ? undefined : Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                />
              </div>
              <div className="flex items-end gap-2">
                <input
                  id={`pub-r-${draft.id}`}
                  type="checkbox"
                  checked={draft.published}
                  onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))}
                />
                <label htmlFor={`pub-r-${draft.id}`} className="text-sm">Δημοσιευμένη</label>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Υλικά</label>
                <button
                  onClick={addIngredient}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
                >
                  + Υλικό
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {draft.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-500">•</span>
                    <input
                      value={ing}
                      onChange={e => setDraft(d => {
                        const arr = [...d.ingredients]; arr[i] = e.target.value; return { ...d, ingredients: arr };
                      })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                    />
                    <button
                      onClick={() => removeIngredient(i)}
                      className="text-xs text-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {draft.ingredients.length === 0 && <p className="text-sm text-slate-500">Κανένα υλικό.</p>}
              </div>
            </div>

            {/* Steps (optional) */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Βήματα (προαιρετικά)</label>
                <button
                  onClick={addStep}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
                >
                  + Βήμα
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {draft.steps.map((st, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-slate-500">{i + 1}.</span>
                    <textarea
                      rows={2}
                      value={st}
                      onChange={e => setDraft(d => {
                        const arr = [...d.steps]; arr[i] = e.target.value; return { ...d, steps: arr };
                      })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
                    />
                    <button
                      onClick={() => removeStep(i)}
                      className="text-xs text-rose-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {draft.steps.length === 0 && <p className="text-sm text-slate-500">Κανένα βήμα.</p>}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Ετικέτες</label>
                <button
                  onClick={addTag}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
                >
                  + Ετικέτα
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {draft.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
                    {t}
                    <button onClick={() => removeTag(t)} className="text-slate-500">✕</button>
                  </span>
                ))}
                {draft.tags.length === 0 && <span className="text-sm text-slate-500">Καμία ετικέτα.</span>}
              </div>
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
                onClick={() => setDraft(row)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#7a7ac4]"
              >
                Επαναφορά αλλαγών
              </button>
            </div>
          </div>

          {/* Preview card */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="aspect-[16/10] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {draft.hero ? <img src={draft.hero} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5">{draft.category}</span>
                  <span>•</span>
                  <span>{draft.minutes}’</span>
                </div>
                <h4 className="mt-2 text-base font-semibold">{draft.title}</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {draft.tags.slice(0, 3).map(t => (
                    <span key={t} className="rounded-full bg-green-100/70 px-2 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
