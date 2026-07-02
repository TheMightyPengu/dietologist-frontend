import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  MainPagesApi,
  type MainPageGetDto,
  type MainPagePostDto,
} from "@/api/MainPagesController";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";

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

type HomeFormState = {
  id: number | null;
  title: string;
  info: string;
  biography: string;
  phylosophy: string;
  mainPictureId?: number | null;
  mainPictureUrl?: string | null;
  bioPictureId?: number | null;
  bioPictureUrl?: string | null;
  mainSmallPicture1Id?: number | null;
  mainSmallPicture1Url?: string | null;
  mainSmallPicture2Id?: number | null;
  mainSmallPicture2Url?: string | null;
  mainSmallPicture3Id?: number | null;
  mainSmallPicture3Url?: string | null;
  smallCardsSectionTitle?: string | null;
  smallCard1Title?: string | null;
  smallCard1Text?: string | null;
  smallCard2Title?: string | null;
  smallCard2Text?: string | null;
  smallCard3Title?: string | null;
  smallCard3Text?: string | null;
};

const EMPTY_HOME: HomeFormState = {
  id: null,
  title: "",
  info: "",
  biography: "",
  phylosophy: "",
  mainPictureId: null,
  mainPictureUrl: null,
  bioPictureId: null,
  bioPictureUrl: null,
  mainSmallPicture1Id: null,
  mainSmallPicture1Url: null,
  mainSmallPicture2Id: null,
  mainSmallPicture2Url: null,
  mainSmallPicture3Id: null,
  mainSmallPicture3Url: null,
  smallCardsSectionTitle: "",
  smallCard1Title: "",
  smallCard1Text: "",
  smallCard2Title: "",
  smallCard2Text: "",
  smallCard3Title: "",
  smallCard3Text: "",
};

type ImageFieldKey =
  | "mainPicture"
  | "bioPicture"
  | "mainSmallPicture1"
  | "mainSmallPicture2"
  | "mainSmallPicture3";

type ImageFilesState = Record<ImageFieldKey, File | null>;
type ImagePreviewsState = Record<ImageFieldKey, string | null>;

const EMPTY_IMAGE_FILES: ImageFilesState = {
  mainPicture: null,
  bioPicture: null,
  mainSmallPicture1: null,
  mainSmallPicture2: null,
  mainSmallPicture3: null,
};

const EMPTY_IMAGE_PREVIEWS: ImagePreviewsState = {
  mainPicture: null,
  bioPicture: null,
  mainSmallPicture1: null,
  mainSmallPicture2: null,
  mainSmallPicture3: null,
};

const IMAGE_FIELDS: {
  key: ImageFieldKey;
  label: string;
  idKey:
    | "mainPictureId"
    | "bioPictureId"
    | "mainSmallPicture1Id"
    | "mainSmallPicture2Id"
    | "mainSmallPicture3Id";
  urlKey:
    | "mainPictureUrl"
    | "bioPictureUrl"
    | "mainSmallPicture1Url"
    | "mainSmallPicture2Url"
    | "mainSmallPicture3Url";
}[] = [
  {
    key: "mainPicture",
    label: "Κεντρική Εικόνα",
    idKey: "mainPictureId",
    urlKey: "mainPictureUrl",
  },
  {
    key: "bioPicture",
    label: "Εικόνα Βιογραφικού",
    idKey: "bioPictureId",
    urlKey: "bioPictureUrl",
  },
  {
    key: "mainSmallPicture1",
    label: "Μικρή Εικόνα 1",
    idKey: "mainSmallPicture1Id",
    urlKey: "mainSmallPicture1Url",
  },
  {
    key: "mainSmallPicture2",
    label: "Μικρή Εικόνα 2",
    idKey: "mainSmallPicture2Id",
    urlKey: "mainSmallPicture2Url",
  },
  {
    key: "mainSmallPicture3",
    label: "Μικρή Εικόνα 3",
    idKey: "mainSmallPicture3Id",
    urlKey: "mainSmallPicture3Url",
  },
];

type SmallCardTitleKey =
  | "smallCard1Title"
  | "smallCard2Title"
  | "smallCard3Title";

type SmallCardTextKey =
  | "smallCard1Text"
  | "smallCard2Text"
  | "smallCard3Text";

const SMALL_CARD_TEXT_FIELDS: {
  titleKey: SmallCardTitleKey;
  textKey: SmallCardTextKey;
  label: string;
}[] = [
  {
    titleKey: "smallCard1Title",
    textKey: "smallCard1Text",
    label: "Κάρτα 1",
  },
  {
    titleKey: "smallCard2Title",
    textKey: "smallCard2Text",
    label: "Κάρτα 2",
  },
  {
    titleKey: "smallCard3Title",
    textKey: "smallCard3Text",
    label: "Κάρτα 3",
  },
];

function mapDtoToState(dto: MainPageGetDto): HomeFormState {
  return {
    id: dto.id,
    title: dto.title ?? "",
    info: dto.info ?? "",
    biography: dto.biography ?? "",
    phylosophy: dto.phylosophy ?? "",
    mainPictureId: dto.mainPictureId ?? null,
    mainPictureUrl: dto.mainPictureUrl ?? null,
    bioPictureId: dto.bioPictureId ?? null,
    bioPictureUrl: dto.bioPictureUrl ?? null,
    mainSmallPicture1Id: dto.mainSmallPicture1Id ?? null,
    mainSmallPicture1Url: dto.mainSmallPicture1Url ?? null,
    mainSmallPicture2Id: dto.mainSmallPicture2Id ?? null,
    mainSmallPicture2Url: dto.mainSmallPicture2Url ?? null,
    mainSmallPicture3Id: dto.mainSmallPicture3Id ?? null,
    mainSmallPicture3Url: dto.mainSmallPicture3Url ?? null,
    smallCardsSectionTitle: dto.smallCardsSectionTitle ?? "",
    smallCard1Title: dto.smallCard1Title ?? "",
    smallCard1Text: dto.smallCard1Text ?? "",
    smallCard2Title: dto.smallCard2Title ?? "",
    smallCard2Text: dto.smallCard2Text ?? "",
    smallCard3Title: dto.smallCard3Title ?? "",
    smallCard3Text: dto.smallCard3Text ?? "",
  };
}

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

export default function ManagementHomePage() {
  const [data, setData] = useState<HomeFormState>(EMPTY_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<ImageFilesState>(EMPTY_IMAGE_FILES);

  const [filePreviews, setFilePreviews] =
    useState<ImagePreviewsState>(EMPTY_IMAGE_PREVIEWS);

  const loadHome = async () => {
    try {
      setLoading(true);

      const items = await MainPagesApi.list();
      const first = items?.[0];

      if (!first) {
        setData(EMPTY_HOME);
        return;
      }

      setData(mapDtoToState(first));
    } catch {
      setToast("Αποτυχία φόρτωσης.");
      setData(EMPTY_HOME);
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

  const getPreviewSrc = (field: (typeof IMAGE_FIELDS)[number]) => {
    return normalizeImageUrl(filePreviews[field.key] || data[field.urlKey]);
  };

  const clearSelectedImage = (key: ImageFieldKey) => {
    setSelectedFiles((s) => ({ ...s, [key]: null }));
    setFilePreviews((s) => ({ ...s, [key]: null }));
  };

  const onSelectImage = (key: ImageFieldKey, file: File) => {
    setSelectedFiles((s) => ({ ...s, [key]: file }));

    const reader = new FileReader();

    reader.onload = () => {
      setFilePreviews((s) => ({
        ...s,
        [key]: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);

    setToast("Τοπική προεπισκόπηση εικόνας.");
  };

  const onSave = async () => {
    try {
      setSaving(true);

      const payload: MainPagePostDto = {
        title: data.title,
        info: data.info,
        biography: data.biography,
        phylosophy: data.phylosophy,

        mainPicture: selectedFiles.mainPicture,
        mainPictureId: data.mainPictureId ?? null,

        bioPicture: selectedFiles.bioPicture,
        bioPictureId: data.bioPictureId ?? null,

        smallCardsSectionTitle: data.smallCardsSectionTitle ?? "",

        smallCard1Title: data.smallCard1Title ?? "",
        smallCard1Text: data.smallCard1Text ?? "",
        mainSmallPicture1: selectedFiles.mainSmallPicture1,
        mainSmallPicture1Id: data.mainSmallPicture1Id ?? null,

        smallCard2Title: data.smallCard2Title ?? "",
        smallCard2Text: data.smallCard2Text ?? "",
        mainSmallPicture2: selectedFiles.mainSmallPicture2,
        mainSmallPicture2Id: data.mainSmallPicture2Id ?? null,

        smallCard3Title: data.smallCard3Title ?? "",
        smallCard3Text: data.smallCard3Text ?? "",
        mainSmallPicture3: selectedFiles.mainSmallPicture3,
        mainSmallPicture3Id: data.mainSmallPicture3Id ?? null,
      };

      if (data.id) {
        await MainPagesApi.update(data.id, payload);
      } else {
        const created = await MainPagesApi.create(payload);
        setData(mapDtoToState(created));
      }

      await loadHome();
      setSelectedFiles(EMPTY_IMAGE_FILES);
      setFilePreviews(EMPTY_IMAGE_PREVIEWS);
      setToast("Αποθηκεύτηκε!");
    } catch {
      setToast("Αποτυχία αποθήκευσης.");
    } finally {
      setSaving(false);
    }
  };

  const onResetLocal = () => {
    setData(EMPTY_HOME);
    setSelectedFiles(EMPTY_IMAGE_FILES);
    setFilePreviews(EMPTY_IMAGE_PREVIEWS);
    setToast("Τοπική επαναφορά.");
  };

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
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
            >
              ← Πίσω στο Dashboard
            </Link>

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              ΑΡΧΙΚΗ
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-5 md:p-6">
              <h2 className="text-lg font-semibold">
                Επεξεργασία Περιεχομένου
              </h2>

              {loading ? (
                <p className="mt-3 text-slate-600">Φόρτωση…</p>
              ) : (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700">
                      Εικόνες Αρχικής
                    </label>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {IMAGE_FIELDS.map((field) => {
                        const src = getPreviewSrc(field);
                        const canRender = isSafeImageSrc(src);
                        const hasLocalSelection = Boolean(selectedFiles[field.key]);

                        return (
                          <div
                            key={field.key}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >
                            <p className="mb-2 text-sm font-medium text-slate-700">
                              {field.label}
                            </p>

                            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-slate-200 bg-white">
                              {canRender && src ? (
                                <Image
                                  alt={field.label}
                                  src={src}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                                  Δεν υπάρχει εικόνα
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <label className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs cursor-pointer hover:border-[rgb(var(--primary))]">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (!f) return;

                                    onSelectImage(field.key, f);
                                    e.target.value = "";
                                  }}
                                />
                                Επιλογή αρχείου
                              </label>

                              {hasLocalSelection && (
                                <button
                                  type="button"
                                  className="text-xs underline underline-offset-2"
                                  onClick={() => clearSelectedImage(field.key)}
                                >
                                  Καθαρισμός επιλογής
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">
                      Τίτλος ενότητας μικρών καρτών
                    </label>

                    <input
                      type="text"
                      value={data.smallCardsSectionTitle ?? ""}
                      onChange={(e) =>
                        setData((s) => ({
                          ...s,
                          smallCardsSectionTitle: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {SMALL_CARD_TEXT_FIELDS.map((card) => (
                      <div
                        key={card.label}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="mb-3 text-sm font-semibold text-slate-700">
                          {card.label}
                        </p>

                        <label className="block text-sm font-medium text-slate-700">
                          Τίτλος
                        </label>

                        <input
                          type="text"
                          value={data[card.titleKey] ?? ""}
                          onChange={(e) =>
                            setData((s) => ({
                              ...s,
                              [card.titleKey]: e.target.value,
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                        />

                        <label className="mt-3 block text-sm font-medium text-slate-700">
                          Κείμενο
                        </label>

                        <textarea
                          value={data[card.textKey] ?? ""}
                          onChange={(e) =>
                            setData((s) => ({
                              ...s,
                              [card.textKey]: e.target.value,
                            }))
                          }
                          rows={4}
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700">
                      Τίτλος
                    </label>

                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) =>
                        setData((s) => ({ ...s, title: e.target.value }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Πληροφορίες
                    </label>

                    <RichTextEditor
                      value={data.info}
                      onChange={(html) =>
                        setData((s) => ({ ...s, info: html }))
                      }
                      placeholder="Γράψε τις βασικές πληροφορίες της αρχικής..."
                      minHeight={160}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Βιογραφικό
                    </label>

                    <RichTextEditor
                      value={data.biography}
                      onChange={(html) =>
                        setData((s) => ({ ...s, biography: html }))
                      }
                      placeholder="Γράψε το βιογραφικό..."
                      minHeight={220}
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Φιλοσοφία
                    </label>

                    <RichTextEditor
                      value={data.phylosophy}
                      onChange={(html) =>
                        setData((s) => ({ ...s, phylosophy: html }))
                      }
                      placeholder="Γράψε τη φιλοσοφία..."
                      minHeight={220}
                    />
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                        saving
                          ? "bg-[rgba(var(--primary),0.7)] text-white cursor-wait"
                          : "bg-[rgb(var(--primary))] text-white hover:shadow"
                      )}
                    >
                      {saving ? "ΑΠΟΘΗΚΕΥΣΗ…" : "ΑΠΟΘΗΚΕΥΣΗ"}
                    </button>

                    <button
                      type="button"
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
                <div className="grid grid-cols-1 gap-3">
                  {IMAGE_FIELDS.map((field) => {
                    const src = getPreviewSrc(field);
                    const canRender = isSafeImageSrc(src);

                    return (
                      <div key={field.key}>
                        <p className="mb-1 text-xs font-medium text-slate-600">
                          {field.label}
                        </p>

                        <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 relative">
                          {canRender && src ? (
                            <Image
                              alt={field.label}
                              src={src}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                              Δεν υπάρχει εικόνα
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div>
                  <h4 className="text-xl font-semibold">
                    {data.title || "Χωρίς τίτλο"}
                  </h4>

                  {data.info ? (
                    <RichHtmlRenderer
                      html={data.info}
                      className="mt-1 text-slate-600"
                    />
                  ) : (
                    <p className="mt-1 text-slate-600">Χωρίς πληροφορίες</p>
                  )}
                </div>

                <div>
                  <h5 className="font-semibold">Βιογραφικό</h5>

                  {data.biography ? (
                    <RichHtmlRenderer
                      html={data.biography}
                      className="mt-1 text-slate-600"
                    />
                  ) : (
                    <p className="mt-1 text-slate-600">—</p>
                  )}
                </div>

                <div>
                  <h5 className="font-semibold">Φιλοσοφία</h5>

                  {data.phylosophy ? (
                    <RichHtmlRenderer
                      html={data.phylosophy}
                      className="mt-1 text-slate-600"
                    />
                  ) : (
                    <p className="mt-1 text-slate-600">—</p>
                  )}
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