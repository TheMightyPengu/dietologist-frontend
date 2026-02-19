import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_HOME,
  fetchHomeContent,
  updateHomeContent,
  type HomeContent,
} from "@/lib/mgmtHomeAPI";
import Image
 from "next/image";
const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cx("rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50", className)}>
    {children}
  </div>
);

export default function ManagementHomePage() {
  const [data, setData] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Load from "API"
  useEffect(() => {
    (async () => {
      setLoading(true);
      const payload = await fetchHomeContent();
      setData(payload);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const onSave = async () => {
    setSaving(true);
    // pretend API call
    await updateHomeContent(data);
    setSaving(false);
    setToast("Αποθηκεύτηκε!");
  };

  const onResetDefaults = () => {
    setData(DEFAULT_HOME);
    setFilePreview(null);
    setToast("Επαναφορά προεπιλογών.");
  };

  const onReloadFromApi = async () => {
    setLoading(true);
    const payload = await fetchHomeContent();
    setData(payload);
    setFilePreview(null);
    setLoading(false);
    setToast("Φόρτωση από το API.");
  };

  const previewSrc = filePreview || data.heroImageUrl;

  return (
    <>
      <Head>
        <title>Διαχείριση | ΑΡΧΙΚΗ</title>
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
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">ΑΡΧΙΚΗ</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Editor */}
            <Card className="lg:col-span-2 p-5 md:p-6">
              <h2 className="text-lg font-semibold">Επεξεργασία Περιεχομένου</h2>

              {loading ? (
                <p className="mt-3 text-slate-600">Φόρτωση…</p>
              ) : (
                <>
                  {/* Image */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">Εικόνα Αρχικής (URL)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={data.heroImageUrl}
                      onChange={e => setData(s => ({ ...s, heroImageUrl: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                    <div className="mt-3 flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm cursor-pointer hover:border-[#8484d1]">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const r = new FileReader();
                            r.onload = () => setFilePreview(r.result as string);
                            r.readAsDataURL(f);
                            setToast("Τοπική προεπισκόπηση εικόνας (δεν ανεβαίνει στο API).");
                          }}
                        />
                        Επιλογή αρχείου για προεπισκόπηση
                      </label>
                      {filePreview && (
                        <button className="text-xs underline underline-offset-2" onClick={() => setFilePreview(null)}>
                          Καθαρισμός προεπισκόπησης
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Welcome */}
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Τίτλος Καλωσορίσματος</label>
                      <input
                        type="text"
                        value={data.welcomeTitle}
                        onChange={e => setData(s => ({ ...s, welcomeTitle: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Κείμενο Καλωσορίσματος</label>
                      <textarea
                        rows={3}
                        value={data.welcomeParagraph}
                        onChange={e => setData(s => ({ ...s, welcomeParagraph: e.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Βιογραφικό — Παράγραφος</label>
                    <textarea
                      rows={4}
                      value={data.bioParagraph}
                      onChange={e => setData(s => ({ ...s, bioParagraph: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                  </div>

                  {/* Philosophy */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Φιλοσοφία — Παράγραφος</label>
                    <textarea
                      rows={4}
                      value={data.philosophyParagraph}
                      onChange={e => setData(s => ({ ...s, philosophyParagraph: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                        saving ? "bg-[#8484d1]/70 text-white cursor-wait" : "bg-[#8484d1] text-white hover:shadow"
                      )}
                    >
                      {saving ? "ΑΠΟΘΗΚΕΥΣΗ…" : "ΑΠΟΘΗΚΕΥΣΗ"}
                    </button>

                    <button
                      onClick={onReloadFromApi}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[#8484d1] transition"
                    >
                      Φόρτωση από API
                    </button>

                    <button
                      onClick={onResetDefaults}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 hover:border-rose-300 transition"
                    >
                      Επαναφορά προεπιλογών
                    </button>
                  </div>
                </>
              )}
            </Card>

            {/* Live preview */}
            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold">Ζωντανή Προεπισκόπηση</h3>
              <div className="mt-3 space-y-4">
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 relative">
                  <Image alt="Hero preview" src={previewSrc} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold">{data.welcomeTitle}</h4>
                  <p className="mt-1 text-slate-600">{data.welcomeParagraph}</p>
                </div>
                <div>
                  <h5 className="font-semibold">Βιογραφικό</h5>
                  <p className="mt-1 text-slate-600">{data.bioParagraph}</p>
                </div>
                <div>
                  <h5 className="font-semibold">Φιλοσοφία</h5>
                  <p className="mt-1 text-slate-600">{data.philosophyParagraph}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="mb-1 font-medium">JSON (για API):</p>
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              </div>
            </Card>
          </div>
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
