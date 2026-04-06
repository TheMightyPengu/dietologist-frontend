import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  MainPagesApi,
  type MainPageGetDto,
  type MainPagePostDto,
} from "@/api/MainPagesController";

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

type HomeFormState = {
  id: number | null;
  title: string;
  info: string;
  biography: string;
  phylosophy: string;
  mainPictureId?: number | null;
};

const EMPTY_HOME: HomeFormState = {
  id: null,
  title: "",
  info: "",
  biography: "",
  phylosophy: "",
  mainPictureId: null,
};

function mapDtoToState(dto: MainPageGetDto): HomeFormState {
  return {
    id: dto.id,
    title: dto.title ?? "",
    info: dto.info ?? "",
    biography: dto.biography ?? "",
    phylosophy: dto.phylosophy ?? "",
    mainPictureId: dto.mainPictureId ?? null,
  };
}

export default function ManagementHomePage() {
  const [data, setData] = useState<HomeFormState>(EMPTY_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [remoteImageUrl, setRemoteImageUrl] = useState<string | null>(null);

  const hasValidPreview = useMemo(() => {
    return Boolean(filePreview || remoteImageUrl);
  }, [filePreview, remoteImageUrl]);

  const loadHome = async () => {
    try {
      setLoading(true);

      const items = await MainPagesApi.list();
      const first = items?.[0];

      if (!first) {
        setData(EMPTY_HOME);
        setRemoteImageUrl(null);
        return;
      }

      setData(mapDtoToState(first));

      try {
        const imageRes = await MainPagesApi.getMainPictureUrl(first.id);
        const url = imageRes?.url?.trim();
        setRemoteImageUrl(url ? url : null);
      } catch {
        setRemoteImageUrl(null);
      }
    } catch {
      setToast("Αποτυχία φόρτωσης.");
      setData(EMPTY_HOME);
      setRemoteImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHome();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const onSave = async () => {
    try {
      setSaving(true);

      const payload: MainPagePostDto = {
        title: data.title,
        info: data.info,
        biography: data.biography,
        phylosophy: data.phylosophy,
        mainPicture: selectedFile,
        mainPictureId: data.mainPictureId ?? null,
      };

      if (data.id) {
        await MainPagesApi.update(data.id, payload);
      } else {
        const created = await MainPagesApi.create(payload);
        setData(mapDtoToState(created));
      }

      await loadHome();
      setSelectedFile(null);
      setFilePreview(null);
      setToast("Αποθηκεύτηκε!");
    } catch {
      setToast("Αποτυχία αποθήκευσης.");
    } finally {
      setSaving(false);
    }
  };

  const onResetLocal = () => {
    setData(EMPTY_HOME);
    setSelectedFile(null);
    setFilePreview(null);
    setRemoteImageUrl(null);
    setToast("Τοπική επαναφορά.");
  };

  const onReloadFromApi = async () => {
    setSelectedFile(null);
    setFilePreview(null);
    await loadHome();
    setToast("Φόρτωση από API.");
  };

  function normalizeImageUrl(url?: string | null) {
    if (!url) return null;

    const clean = url.trim();
    if (!clean) return null;

    if (
      clean.startsWith("http://") ||
      clean.startsWith("https://") ||
      clean.startsWith("data:")
    ) {
      return clean;
    }

    if (clean.startsWith("/")) {
      return clean;
    }

    return `/${clean}`;
  }

  function isSafeImageSrc(src?: string | null) {
    if (!src) return false;

    return (
      src.startsWith("/") ||
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("data:")
    );
  }

  const previewSrc = normalizeImageUrl(filePreview || remoteImageUrl);
  const canRenderImage = isSafeImageSrc(previewSrc);

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
            <Card className="lg:col-span-2 p-5 md:p-6">
              <h2 className="text-lg font-semibold">Επεξεργασία Περιεχομένου</h2>

              {loading ? (
                <p className="mt-3 text-slate-600">Φόρτωση…</p>
              ) : (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">
                      Κεντρική Εικόνα
                    </label>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm cursor-pointer hover:border-[#8484d1]">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;

                            setSelectedFile(f);

                            const reader = new FileReader();
                            reader.onload = () => setFilePreview(reader.result as string);
                            reader.readAsDataURL(f);

                            setToast("Τοπική προεπισκόπηση εικόνας.");
                          }}
                        />
                        Επιλογή αρχείου
                      </label>

                      {(filePreview || selectedFile) && (
                        <button
                          type="button"
                          className="text-xs underline underline-offset-2"
                          onClick={() => {
                            setSelectedFile(null);
                            setFilePreview(null);
                          }}
                        >
                          Καθαρισμός επιλογής
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Τίτλος</label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => setData((s) => ({ ...s, title: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Πληροφορίες</label>
                    <textarea
                      rows={4}
                      value={data.info}
                      onChange={(e) => setData((s) => ({ ...s, info: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Βιογραφικό</label>
                    <textarea
                      rows={5}
                      value={data.biography}
                      onChange={(e) => setData((s) => ({ ...s, biography: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">Φιλοσοφία</label>
                    <textarea
                      rows={5}
                      value={data.phylosophy}
                      onChange={(e) => setData((s) => ({ ...s, phylosophy: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={onSave}
                      disabled={saving}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                        saving
                          ? "bg-[#8484d1]/70 text-white cursor-wait"
                          : "bg-[#8484d1] text-white hover:shadow"
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
                      onClick={onResetLocal}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 hover:border-rose-300 transition"
                    >
                      Τοπική επαναφορά
                    </button>
                  </div>
                </>
              )}
            </Card>

            <Card className="p-5 md:p-6">
              <h3 className="text-lg font-semibold">Ζωντανή Προεπισκόπηση</h3>

              <div className="mt-3 space-y-4">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 relative">
                  {canRenderImage && previewSrc ? (
                    <Image
                      alt="Hero preview"
                      src={previewSrc}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      Δεν υπάρχει εικόνα
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xl font-semibold">{data.title || "Χωρίς τίτλο"}</h4>
                  <p className="mt-1 text-slate-600">{data.info || "Χωρίς πληροφορίες"}</p>
                </div>

                <div>
                  <h5 className="font-semibold">Βιογραφικό</h5>
                  <p className="mt-1 text-slate-600">{data.biography || "—"}</p>
                </div>

                <div>
                  <h5 className="font-semibold">Φιλοσοφία</h5>
                  <p className="mt-1 text-slate-600">{data.phylosophy || "—"}</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="mb-1 font-medium">JSON προς backend:</p>
                  <pre className="whitespace-pre-wrap break-words">
                    {JSON.stringify(
                      {
                        id: data.id,
                        title: data.title,
                        info: data.info,
                        biography: data.biography,
                        phylosophy: data.phylosophy,
                        mainPictureId: data.mainPictureId,
                        selectedFileName: selectedFile?.name ?? null,
                      },
                      null,
                      2
                    )}
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