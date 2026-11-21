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
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import BilingualSaveWarning from "@/components/admin/BilingualSaveWarning";
import ContentLanguageSwitch, { type ContentLanguage } from "@/components/admin/ContentLanguageSwitch";
import { useBilingualSaveGuard } from "@/components/admin/useBilingualSaveGuard";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import {
  addValidationError,
  errorInputClass,
  isRichTextBlank,
  validateImageFile,
} from "@/lib/form-validation";
import type { ApiFieldErrors } from "@/api/_axios-client";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50",
      className,
    )}
  >
    {children}
  </div>
);

type HomeFormState = {
  id: number | null;
  title: string;
  titleEn?: string | null;
  info: string;
  infoEn?: string | null;
  biography: string;
  biographyEn?: string | null;
  phylosophy: string;
  phylosophyEn?: string | null;
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
  smallCardsSectionTitleEn?: string | null;
  newsletterTitle?: string | null;
  newsletterTitleEn?: string | null;
  newsletterDetails?: string | null;
  newsletterDetailsEn?: string | null;
  smallCard1Title?: string | null;
  smallCard1TitleEn?: string | null;
  smallCard1Text?: string | null;
  smallCard1TextEn?: string | null;
  smallCard2Title?: string | null;
  smallCard2TitleEn?: string | null;
  smallCard2Text?: string | null;
  smallCard2TextEn?: string | null;
  smallCard3Title?: string | null;
  smallCard3TitleEn?: string | null;
  smallCard3Text?: string | null;
  smallCard3TextEn?: string | null;
};

const EMPTY_HOME: HomeFormState = {
  id: null,
  title: "",
  titleEn: "",
  info: "",
  infoEn: "",
  biography: "",
  biographyEn: "",
  phylosophy: "",
  phylosophyEn: "",
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
  smallCardsSectionTitleEn: "",
  newsletterTitle: "",
  newsletterTitleEn: "",
  newsletterDetails: "",
  newsletterDetailsEn: "",
  smallCard1Title: "",
  smallCard1TitleEn: "",
  smallCard1Text: "",
  smallCard1TextEn: "",
  smallCard2Title: "",
  smallCard2TitleEn: "",
  smallCard2Text: "",
  smallCard2TextEn: "",
  smallCard3Title: "",
  smallCard3TitleEn: "",
  smallCard3Text: "",
  smallCard3TextEn: "",
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

type SmallCardTextKey = "smallCard1Text" | "smallCard2Text" | "smallCard3Text";

const SMALL_CARD_TEXT_FIELDS: {
  titleKey: SmallCardTitleKey;
  textKey: SmallCardTextKey;
  titleEnKey: "smallCard1TitleEn" | "smallCard2TitleEn" | "smallCard3TitleEn";
  textEnKey: "smallCard1TextEn" | "smallCard2TextEn" | "smallCard3TextEn";
  label: string;
}[] = [
  {
    titleKey: "smallCard1Title",
    textKey: "smallCard1Text",
    titleEnKey: "smallCard1TitleEn",
    textEnKey: "smallCard1TextEn",
    label: "Κάρτα 1",
  },
  {
    titleKey: "smallCard2Title",
    textKey: "smallCard2Text",
    titleEnKey: "smallCard2TitleEn",
    textEnKey: "smallCard2TextEn",
    label: "Κάρτα 2",
  },
  {
    titleKey: "smallCard3Title",
    textKey: "smallCard3Text",
    titleEnKey: "smallCard3TitleEn",
    textEnKey: "smallCard3TextEn",
    label: "Κάρτα 3",
  },
];

function mapDtoToState(dto: MainPageGetDto): HomeFormState {
  return {
    id: dto.id,
    title: dto.title ?? "",
    titleEn: dto.titleEn ?? "",
    info: dto.info ?? "",
    infoEn: dto.infoEn ?? "",
    biography: dto.biography ?? "",
    biographyEn: dto.biographyEn ?? "",
    phylosophy: dto.phylosophy ?? "",
    phylosophyEn: dto.phylosophyEn ?? "",
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
    smallCardsSectionTitleEn: dto.smallCardsSectionTitleEn ?? "",
    newsletterTitle: dto.newsletterTitle ?? "",
    newsletterTitleEn: dto.newsletterTitleEn ?? "",
    newsletterDetails: dto.newsletterDetails ?? "",
    newsletterDetailsEn: dto.newsletterDetailsEn ?? "",
    smallCard1Title: dto.smallCard1Title ?? "",
    smallCard1TitleEn: dto.smallCard1TitleEn ?? "",
    smallCard1Text: dto.smallCard1Text ?? "",
    smallCard1TextEn: dto.smallCard1TextEn ?? "",
    smallCard2Title: dto.smallCard2Title ?? "",
    smallCard2TitleEn: dto.smallCard2TitleEn ?? "",
    smallCard2Text: dto.smallCard2Text ?? "",
    smallCard2TextEn: dto.smallCard2TextEn ?? "",
    smallCard3Title: dto.smallCard3Title ?? "",
    smallCard3TitleEn: dto.smallCard3TitleEn ?? "",
    smallCard3Text: dto.smallCard3Text ?? "",
    smallCard3TextEn: dto.smallCard3TextEn ?? "",
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
  const [language, setLanguage] = useState<ContentLanguage>("el");
  const [localizedDirty, setLocalizedDirty] = useState(false);
  const saveGuard = useBilingualSaveGuard(setLanguage);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] =
    useState<ImageFilesState>(EMPTY_IMAGE_FILES);

  const [filePreviews, setFilePreviews] =
    useState<ImagePreviewsState>(EMPTY_IMAGE_PREVIEWS);

  const {
    fieldErrors,
    generalError,
    clearFieldError,
    applyFrontendErrors,
    applyApiError,
    closeGeneralError,
    clearAllErrors,
  } = useFormErrors();

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
      setLocalizedDirty(false);
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η φόρτωση της αρχικής σελίδας.");

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
    clearFieldError(key);
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

  const performSave = async () => {
    const errors = validateHome();

    if (!applyFrontendErrors(errors)) {
      return;
    }

    try {
      setSaving(true);
      clearAllErrors();

      const payload: MainPagePostDto = {
        title: data.title.trim(),
        titleEn: data.titleEn?.trim() ?? "",
        info: data.info.trim(),
        infoEn: data.infoEn?.trim() ?? "",
        biography: data.biography.trim(),
        biographyEn: data.biographyEn?.trim() ?? "",
        phylosophy: data.phylosophy.trim(),
        phylosophyEn: data.phylosophyEn?.trim() ?? "",

        mainPicture: selectedFiles.mainPicture,
        mainPictureId: selectedFiles.mainPicture
          ? null
          : (data.mainPictureId ?? null),

        bioPicture: selectedFiles.bioPicture,
        bioPictureId: selectedFiles.bioPicture
          ? null
          : (data.bioPictureId ?? null),

        smallCardsSectionTitle: data.smallCardsSectionTitle?.trim() ?? "",
        smallCardsSectionTitleEn: data.smallCardsSectionTitleEn?.trim() ?? "",
        newsletterTitle: data.newsletterTitle?.trim() ?? "",
        newsletterTitleEn: data.newsletterTitleEn?.trim() ?? "",
        newsletterDetails: data.newsletterDetails?.trim() ?? "",
        newsletterDetailsEn: data.newsletterDetailsEn?.trim() ?? "",

        smallCard1Title: data.smallCard1Title?.trim() ?? "",
        smallCard1TitleEn: data.smallCard1TitleEn?.trim() ?? "",
        smallCard1Text: data.smallCard1Text?.trim() ?? "",
        smallCard1TextEn: data.smallCard1TextEn?.trim() ?? "",
        mainSmallPicture1: selectedFiles.mainSmallPicture1,
        mainSmallPicture1Id: selectedFiles.mainSmallPicture1
          ? null
          : (data.mainSmallPicture1Id ?? null),

        smallCard2Title: data.smallCard2Title?.trim() ?? "",
        smallCard2TitleEn: data.smallCard2TitleEn?.trim() ?? "",
        smallCard2Text: data.smallCard2Text?.trim() ?? "",
        smallCard2TextEn: data.smallCard2TextEn?.trim() ?? "",
        mainSmallPicture2: selectedFiles.mainSmallPicture2,
        mainSmallPicture2Id: selectedFiles.mainSmallPicture2
          ? null
          : (data.mainSmallPicture2Id ?? null),

        smallCard3Title: data.smallCard3Title?.trim() ?? "",
        smallCard3TitleEn: data.smallCard3TitleEn?.trim() ?? "",
        smallCard3Text: data.smallCard3Text?.trim() ?? "",
        smallCard3TextEn: data.smallCard3TextEn?.trim() ?? "",
        mainSmallPicture3: selectedFiles.mainSmallPicture3,
        mainSmallPicture3Id: selectedFiles.mainSmallPicture3
          ? null
          : (data.mainSmallPicture3Id ?? null),
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
      setLocalizedDirty(false);
      setToast("Αποθηκεύτηκε!");
    } catch (error: unknown) {
      applyApiError(error, "Δεν ήταν δυνατή η αποθήκευση της αρχικής σελίδας.");
    } finally {
      setSaving(false);
    }
  };

  const onSave = () => {
    saveGuard.requestSave(
      [data.title, data.info, data.biography, data.phylosophy, data.newsletterTitle, data.newsletterDetails],
      [data.titleEn, data.infoEn, data.biographyEn, data.phylosophyEn, data.newsletterTitleEn, data.newsletterDetailsEn],
      performSave,
      localizedDirty,
    );
  };

  function validateHome(): ApiFieldErrors {
    const errors: ApiFieldErrors = {};

    if (!data.title.trim()) {
      addValidationError(errors, "title", "Ο τίτλος είναι υποχρεωτικός.");
    }

    if (isRichTextBlank(data.info)) {
      addValidationError(errors, "info", "Οι πληροφορίες είναι υποχρεωτικές.");
    }

    if (isRichTextBlank(data.biography)) {
      addValidationError(
        errors,
        "biography",
        "Το βιογραφικό είναι υποχρεωτικό.",
      );
    }

    if (isRichTextBlank(data.phylosophy)) {
      addValidationError(
        errors,
        "phylosophy",
        "Η φιλοσοφία είναι υποχρεωτική.",
      );
    }

    for (const field of IMAGE_FIELDS) {
      validateImageFile(selectedFiles[field.key], field.key, errors);
    }

    return errors;
  }

  const onResetLocal = async () => {
    clearAllErrors();
    setSelectedFiles(EMPTY_IMAGE_FILES);
    setFilePreviews(EMPTY_IMAGE_PREVIEWS);
    await loadHome();
    setToast("Έγινε επαναφορά αλλαγών.");
  };

  return (
    <>
      <Head>
        <title>Διαχείριση | ΑΡΧΙΚΗ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
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

            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
            >
              Προβολή σελίδας
            </Link>
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
                  <div className="mt-4" data-bilingual-form tabIndex={-1}>
                    <ContentLanguageSwitch value={language} onChange={setLanguage} />
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-700">
                      Ενότητα μικρών καρτών
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Τίτλος ενότητας μικρών καρτών
                      </label>

                      <input
                        type="text"
                        value={(language === "el" ? data.smallCardsSectionTitle : data.smallCardsSectionTitleEn) ?? ""}
                        onChange={(e) => {
                          setData((s) => ({
                            ...s,
                            [language === "el" ? "smallCardsSectionTitle" : "smallCardsSectionTitleEn"]: e.target.value,
                          }));
                          setLocalizedDirty(true);
                        }}
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.15)]"
                      />
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Εικόνες Αρχικής
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {IMAGE_FIELDS.map((field) => {
                          const src = getPreviewSrc(field);
                          const canRender = isSafeImageSrc(src);
                          const hasLocalSelection = Boolean(
                            selectedFiles[field.key],
                          );

                          return (
                            <div
                              key={field.key}
                              className={cx(
                                "rounded-xl border bg-white p-3",
                                fieldErrors[field.key] ||
                                  fieldErrors[field.idKey]
                                  ? "border-rose-400"
                                  : "border-slate-200",
                              )}
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
                                    onClick={() =>
                                      clearSelectedImage(field.key)
                                    }
                                  >
                                    Καθαρισμός επιλογής
                                  </button>
                                )}
                              </div>

                              <FormFieldError
                                errors={[
                                  ...(fieldErrors[field.key] ?? []),
                                  ...(fieldErrors[field.idKey] ?? []),
                                ]}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Περιεχόμενο καρτών
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {SMALL_CARD_TEXT_FIELDS.map((card) => (
                          <div
                            key={card.label}
                            className="rounded-xl border border-slate-200 bg-white p-4"
                          >
                            <p className="mb-3 text-sm font-semibold text-slate-700">
                              {card.label}
                            </p>

                            <label className="block text-sm font-medium text-slate-700">
                              Τίτλος
                            </label>

                            <input
                              type="text"
                              value={data[language === "el" ? card.titleKey : card.titleEnKey] ?? ""}
                              onChange={(e) => {
                                setData((s) => ({
                                  ...s,
                                  [language === "el" ? card.titleKey : card.titleEnKey]: e.target.value,
                                }));
                                setLocalizedDirty(true);
                              }}
                              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                            />

                            <label className="mt-3 block text-sm font-medium text-slate-700">
                              Κείμενο
                            </label>

                            <textarea
                              value={data[language === "el" ? card.textKey : card.textEnKey] ?? ""}
                              onChange={(e) => {
                                setData((s) => ({
                                  ...s,
                                  [language === "el" ? card.textKey : card.textEnKey]: e.target.value,
                                }));
                                setLocalizedDirty(true);
                              }}
                              rows={4}
                              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-700">
                      Κεντρικό Περιεχόμενο
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Κεντρικός Τίτλος{" "}
                        <span className="text-rose-600" aria-hidden="true">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        value={language === "el" ? data.title : data.titleEn ?? ""}
                        onChange={(e) => {
                          const key = language === "el" ? "title" : "titleEn";
                          setData((s) => ({ ...s, [key]: e.target.value }));
                          clearFieldError(key);
                          setLocalizedDirty(true);
                        }}
                        className={errorInputClass(
                          Boolean(fieldErrors.title),
                          "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.15)]",
                        )}
                      />

                      <FormFieldError errors={fieldErrors.title} />
                    </div>

                    <div className="mt-5">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Πληροφορίες{" "}
                        <span className="text-rose-600" aria-hidden="true">
                          *
                        </span>
                      </label>

                      <div
                        className={
                          fieldErrors.info
                            ? "rounded-xl ring-2 ring-rose-400"
                            : ""
                        }
                      >
                        <RichTextEditor
                          value={language === "el" ? data.info : data.infoEn ?? ""}
                          onChange={(html) => {
                            setData((s) => ({
                              ...s,
                              [language === "el" ? "info" : "infoEn"]: html,
                            }));

                            clearFieldError(language === "el" ? "info" : "infoEn");
                            setLocalizedDirty(true);
                          }}
                          placeholder="Γράψε τις βασικές πληροφορίες της αρχικής..."
                          minHeight={160}
                        />
                      </div>

                      <FormFieldError errors={fieldErrors.info} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Newsletter
                    </p>

                    <label className="block text-sm font-medium text-slate-700">
                      Τίτλος Newsletter
                    </label>

                    <input
                      type="text"
                      value={(language === "el" ? data.newsletterTitle : data.newsletterTitleEn) ?? ""}
                      onChange={(e) => {
                        setData((s) => ({
                          ...s,
                          [language === "el" ? "newsletterTitle" : "newsletterTitleEn"]: e.target.value,
                        }));
                        setLocalizedDirty(true);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                    />

                    <label className="mt-3 block text-sm font-medium text-slate-700 mb-2">
                      Λεπτομέρειες Newsletter
                    </label>

                    <div
                      className={
                        fieldErrors.newsletterDetails
                          ? "rounded-xl ring-2 ring-rose-400"
                          : ""
                      }
                    >
                      <RichTextEditor
                        value={(language === "el" ? data.newsletterDetails : data.newsletterDetailsEn) ?? ""}
                        onChange={(html) => {
                          setData((s) => ({
                            ...s,
                            [language === "el" ? "newsletterDetails" : "newsletterDetailsEn"]: html,
                          }));

                          clearFieldError(language === "el" ? "newsletterDetails" : "newsletterDetailsEn");
                          setLocalizedDirty(true);
                        }}
                        placeholder="Γράψε τις λεπτομέρειες του newsletter..."
                        minHeight={160}
                      />
                    </div>

                    <FormFieldError errors={fieldErrors.newsletterDetails} />
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-700">
                      Βιογραφικό
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Περιεχόμενο Βιογραφικού{" "}
                        <span className="text-rose-600" aria-hidden="true">
                          *
                        </span>
                      </label>

                      <div
                        className={
                          fieldErrors.biography
                            ? "rounded-xl ring-2 ring-rose-400"
                            : ""
                        }
                      >
                        <RichTextEditor
                          value={language === "el" ? data.biography : data.biographyEn ?? ""}
                          onChange={(html) => {
                            setData((s) => ({
                              ...s,
                              [language === "el" ? "biography" : "biographyEn"]: html,
                            }));

                            clearFieldError(language === "el" ? "biography" : "biographyEn");
                            setLocalizedDirty(true);
                          }}
                          placeholder="Γράψε το βιογραφικό..."
                          minHeight={220}
                        />
                      </div>

                      <FormFieldError errors={fieldErrors.biography} />
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                    <p className="mb-4 text-sm font-semibold text-slate-700">
                      Φιλοσοφία
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Περιεχόμενο Φιλοσοφίας{" "}
                        <span className="text-rose-600" aria-hidden="true">
                          *
                        </span>
                      </label>

                      <div
                        className={
                          fieldErrors.phylosophy
                            ? "rounded-xl ring-2 ring-rose-400"
                            : ""
                        }
                      >
                        <RichTextEditor
                          value={language === "el" ? data.phylosophy : data.phylosophyEn ?? ""}
                          onChange={(html) => {
                            setData((s) => ({
                              ...s,
                              [language === "el" ? "phylosophy" : "phylosophyEn"]: html,
                            }));

                            clearFieldError(language === "el" ? "phylosophy" : "phylosophyEn");
                            setLocalizedDirty(true);
                          }}
                          placeholder="Γράψε τη φιλοσοφία..."
                          minHeight={220}
                        />
                      </div>

                      <FormFieldError errors={fieldErrors.phylosophy} />
                    </div>
                  </div>

                  {false && <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">English content</p>
                    {([
                      ["titleEn", "Title (EN)"],
                      ["smallCardsSectionTitleEn", "Small cards section title (EN)"],
                      ["newsletterTitleEn", "Newsletter title (EN)"],
                      ["smallCard1TitleEn", "Small card 1 title (EN)"],
                      ["smallCard1TextEn", "Small card 1 text (EN)"],
                      ["smallCard2TitleEn", "Small card 2 title (EN)"],
                      ["smallCard2TextEn", "Small card 2 text (EN)"],
                      ["smallCard3TitleEn", "Small card 3 title (EN)"],
                      ["smallCard3TextEn", "Small card 3 text (EN)"],
                    ] as Array<[keyof HomeFormState, string]>).map(([key, label]) => (
                      <label key={key} className="block text-sm font-medium text-slate-700">
                        {label}
                        <input
                          value={String(data[key] ?? "")}
                          onChange={(event) =>
                            setData((current) => ({ ...current, [key]: event.target.value }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
                        />
                      </label>
                    ))}

                    {([
                      ["infoEn", "Information (EN)", 160],
                      ["biographyEn", "Biography (EN)", 220],
                      ["phylosophyEn", "Philosophy (EN)", 220],
                      ["newsletterDetailsEn", "Newsletter details (EN)", 160],
                    ] as Array<[keyof HomeFormState, string, number]>).map(([key, label, minHeight]) => (
                      <div key={key}>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                          {label}
                        </label>
                        <RichTextEditor
                          value={String(data[key] ?? "")}
                          onChange={(html) => {
                            setData((current) => ({ ...current, [key]: html }));
                            clearFieldError(String(key));
                          }}
                          placeholder={`Write ${label.toLowerCase()}...`}
                          minHeight={minHeight}
                        />
                      </div>
                    ))}
                  </div>}

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className={cx(
                        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition",
                        saving
                          ? "bg-[rgba(var(--primary),0.7)] text-white cursor-wait"
                          : "bg-[rgb(var(--primary))] text-white hover:shadow",
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

        <GeneralErrorDialog
          open={Boolean(generalError)}
          title={generalError?.title}
          message={generalError?.message ?? ""}
          onClose={closeGeneralError}
        />
        <BilingualSaveWarning {...saveGuard.warningProps} />
      </div>
    </>
  );
}
