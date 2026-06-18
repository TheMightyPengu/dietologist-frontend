import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  EbooksApi,
  type EbooksGetDto,
  type EbooksPostDto,
} from "@/api/EbooksController";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import { toMediaUrl } from "@/api/_axios-client";

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

type EbookDraft = EbooksGetDto & {
  file?: File | null;
};

type EbookFormDraft = EbooksPostDto & {
  id?: number;
};

type EditableEbookContent = {
  description: string;
  toc: string;
  bonusTemplates: string;
  card1Title: string;
  card1Description: string;
  card2Title: string;
  card2Description: string;
  card3Title: string;
  card3Description: string;
};

const DEFAULT_CONTENT: EditableEbookContent = {
  description: "",
  toc: "",
  bonusTemplates: "Πρακτικό υλικό\nΟδηγός εφαρμογής",
  card1Title: "Πρακτικός Οδηγός",
  card1Description:
    "Καθαρή δομή και εύκολη ανάγνωση για άμεση εφαρμογή στην καθημερινότητα.",
  card2Title: "Άμεση Χρήση",
  card2Description:
    "Χρήσιμο περιεχόμενο που μπορεί να αξιοποιηθεί χωρίς περιττή θεωρία.",
  card3Title: "Οργανωμένο Περιεχόμενο",
  card3Description:
    "Το ebook έρχεται οργανωμένο με σαφή ενότητες και εύχρηστο υλικό.",
};

function parseTextList(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean).join("\n");
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
}

function parseEditableContent(raw?: string | null): EditableEbookContent {
  if (!raw || !raw.trim()) {
    return { ...DEFAULT_CONTENT };
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        description: String(parsed.description || ""),
        toc: parseTextList(parsed.toc),
        bonusTemplates:
          parseTextList(parsed.bonusTemplates) || DEFAULT_CONTENT.bonusTemplates,
        card1Title: String(
          parsed.cards?.[0]?.title || DEFAULT_CONTENT.card1Title
        ),
        card1Description: String(
          parsed.cards?.[0]?.description || DEFAULT_CONTENT.card1Description
        ),
        card2Title: String(
          parsed.cards?.[1]?.title || DEFAULT_CONTENT.card2Title
        ),
        card2Description: String(
          parsed.cards?.[1]?.description || DEFAULT_CONTENT.card2Description
        ),
        card3Title: String(
          parsed.cards?.[2]?.title || DEFAULT_CONTENT.card3Title
        ),
        card3Description: String(
          parsed.cards?.[2]?.description || DEFAULT_CONTENT.card3Description
        ),
      };
    }

    if (Array.isArray(parsed)) {
      return {
        ...DEFAULT_CONTENT,
        toc: parsed.map(String).filter(Boolean).join("\n"),
      };
    }
  } catch {
    return {
      ...DEFAULT_CONTENT,
      toc: raw,
    };
  }

  return { ...DEFAULT_CONTENT };
}

function buildEditableContent(c: EditableEbookContent): string {
  return JSON.stringify(
    {
      description: c.description,
      toc: c.toc
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean),
      bonusTemplates: c.bonusTemplates
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean),
      cards: [
        { title: c.card1Title, description: c.card1Description },
        { title: c.card2Title, description: c.card2Description },
        { title: c.card3Title, description: c.card3Description },
      ],
    },
    null,
    2
  );
}

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

function getEmptyDraft(): EbookFormDraft {
  return {
    title: "",
    author: "",
    tableOfContents: buildEditableContent(DEFAULT_CONTENT),
    coverImageUrl: "",
    price: 0,
    fileUrl: "",
    publishedAt: new Date().toISOString(),
    file: null,
  };
}

function ebookToDraft(ebook: EbookDraft): EbookFormDraft {
  return {
    id: ebook.id,
    title: ebook.title || "",
    author: ebook.author || "",
    tableOfContents: ebook.tableOfContents || "",
    coverImageUrl: ebook.coverImageUrl || "",
    price: Number(ebook.price) || 0,
    fileUrl: ebook.fileUrl ?? "",
    publishedAt: ebook.publishedAt || new Date().toISOString(),
    file: null,
  };
}

function draftToPayload(
  draft: EbookFormDraft,
  content: EditableEbookContent
): EbooksPostDto {
  return {
    title: draft.title,
    author: draft.author,
    tableOfContents: buildEditableContent(content),
    coverImageUrl: draft.coverImageUrl,
    price: Number(draft.price) || 0,
    fileUrl: draft.fileUrl ?? "",
    publishedAt: draft.publishedAt,
    file: draft.file ?? null,
  };
}

export default function ManagementEbookPage() {
  const [ebook, setEbook] = useState<EbookDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function loadEbook() {
    try {
      setLoading(true);

      const data = await EbooksApi.list();

      if (data.length > 0) {
        setEbook({ ...data[0], file: null });
      } else {
        setEbook(null);
      }
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία φόρτωσης ebook.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEbook();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSubmit(
    draft: EbookFormDraft,
    content: EditableEbookContent
  ) {
    if (!draft.title.trim()) {
      setToast("Συμπλήρωσε τίτλο.");
      return;
    }

    if (!draft.author.trim()) {
      setToast("Συμπλήρωσε συγγραφέα.");
      return;
    }

    try {
      setSaving(true);

      const payload = draftToPayload(draft, content);

      if (draft.id) {
        await EbooksApi.update(draft.id, payload);
        const refreshed = await EbooksApi.get(draft.id);
        setEbook({ ...refreshed, file: null });
        setToast("Αποθηκεύτηκε.");
      } else {
        const created = await EbooksApi.create(payload);
        setEbook({ ...created, file: null });
        setToast("Δημιουργήθηκε.");
      }
    } catch (error) {
      console.error(error);
      setToast(draft.id ? "Αποτυχία αποθήκευσης." : "Αποτυχία δημιουργίας.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!ebook) return;
    if (!confirm("Διαγραφή ebook;")) return;

    try {
      setDeleting(true);
      await EbooksApi.remove(ebook.id);
      setEbook(null);
      setToast("Διαγράφηκε.");
    } catch (error) {
      console.error(error);
      setToast("Αποτυχία διαγραφής.");
    } finally {
      setDeleting(false);
    }
  }

  const initialDraft = ebook ? ebookToDraft(ebook) : getEmptyDraft();
  const initialContent = parseEditableContent(ebook?.tableOfContents);

  return (
    <>
      <Head>
        <title>Διαχείριση | Ebook</title>
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
                EBOOK
              </h1>
            </div>

            {ebook && (
              <Link
                href="/ebook"
                target="_blank"
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
              >
                Προβολή σελίδας
              </Link>
            )}
          </div>

          {loading ? (
            <Card className="p-6">
              <p>Φόρτωση…</p>
            </Card>
          ) : (
            <SingleEbookForm
              key={`${ebook?.id ?? "new"}-${ebook?.tableOfContents ?? "empty"}`}
              initialDraft={initialDraft}
              initialContent={initialContent}
              saving={saving}
              deleting={deleting}
              isExisting={Boolean(ebook)}
              onSubmit={handleSubmit}
              onDelete={handleDelete}
              onReset={loadEbook}
            />
          )}
        </div>

        {toast && (
          <div className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}

function SingleEbookForm({
  initialDraft,
  initialContent,
  saving,
  deleting,
  isExisting,
  onSubmit,
  onDelete,
  onReset,
}: {
  initialDraft: EbookFormDraft;
  initialContent: EditableEbookContent;
  saving: boolean;
  deleting: boolean;
  isExisting: boolean;
  onSubmit: (draft: EbookFormDraft, content: EditableEbookContent) => void;
  onDelete: () => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState<EbookFormDraft>(initialDraft);
  const [content, setContent] = useState<EditableEbookContent>(initialContent);

  useEffect(() => {
    setDraft(initialDraft);
    setContent(initialContent);
  }, [initialDraft, initialContent]);

  function resetChanges() {
    setDraft(initialDraft);
    setContent(initialContent);
    onReset();
  }

  return (
    <Card className="p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            {isExisting ? "Επεξεργασία ebook" : "Δημιουργία ebook"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {isExisting
              ? ""
              : "Δεν υπάρχει ακόμη ebook. Συμπλήρωσε τα στοιχεία και δημιούργησέ το."}
          </p>
        </div>

        {isExisting && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving || deleting}
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm text-rose-700 hover:border-rose-300 disabled:opacity-60"
          >
            {deleting ? "Διαγραφή…" : "Διαγραφή ebook"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <BasicEbookFields draft={draft} setDraft={setDraft} />

          <EditableContentFields content={content} setContent={setContent} />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onSubmit(draft, content)}
              disabled={saving || deleting}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                saving
                  ? "bg-[rgba(var(--primary),0.7)] text-white cursor-wait"
                  : "bg-[rgb(var(--primary))] text-white hover:shadow"
              )}
            >
              {saving
                ? isExisting
                  ? "Αποθήκευση…"
                  : "Δημιουργία…"
                : isExisting
                ? "Αποθήκευση"
                : "Δημιουργία ebook"}
            </button>

            <button
              type="button"
              onClick={resetChanges}
              disabled={saving || deleting}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))] disabled:opacity-60"
            >
              Επαναφορά αλλαγών
            </button>
          </div>
        </div>

        <EbookPreview draft={draft} content={content} />
      </div>
    </Card>
  );
}

function BasicEbookFields({
  draft,
  setDraft,
}: {
  draft: EbookFormDraft;
  setDraft: React.Dispatch<React.SetStateAction<EbookFormDraft>>;
}) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Τίτλος
          </label>

          <input
            value={draft.title}
            onChange={(e) =>
              setDraft((d) => ({ ...d, title: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Συγγραφέας
          </label>

          <input
            value={draft.author}
            onChange={(e) =>
              setDraft((d) => ({ ...d, author: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Τιμή (€)
          </label>

          <input
            type="number"
            min={0}
            step="0.01"
            value={draft.price}
            onChange={(e) =>
              setDraft((d) => ({ ...d, price: Number(e.target.value) }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Ημερομηνία δημοσίευσης
          </label>

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
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Αρχείο ebook
          </label>

          <input
            type="file"
            accept=".pdf,.epub,.doc,.docx"
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                file: e.target.files?.[0] ?? null,
              }))
            }
            className="mt-1 block w-full text-sm text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-[rgb(var(--primary))] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:opacity-90"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Cover image URL
          </label>

          <input
            value={draft.coverImageUrl}
            onChange={(e) =>
              setDraft((d) => ({ ...d, coverImageUrl: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            File URL
          </label>

          <input
            value={draft.fileUrl ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, fileUrl: e.target.value }))
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />
        </div>
      </div>
    </>
  );
}

function EditableContentFields({
  content,
  setContent,
}: {
  content: EditableEbookContent;
  setContent: React.Dispatch<React.SetStateAction<EditableEbookContent>>;
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Περιγραφή ebook
        </label>

        <RichTextEditor
          value={content.description}
          onChange={(html) =>
            setContent((c) => ({ ...c, description: html }))
          }
          placeholder="Πιο αναλυτική περιγραφή του ebook..."
          minHeight={180}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Πίνακας περιεχομένων
        </label>

        <textarea
          rows={6}
          value={content.toc}
          onChange={(e) =>
            setContent((c) => ({ ...c, toc: e.target.value }))
          }
          placeholder={"Chapter 1\nChapter 2\nChapter 3"}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Bonus templates
        </label>

        <textarea
          rows={4}
          value={content.bonusTemplates}
          onChange={(e) =>
            setContent((c) => ({ ...c, bonusTemplates: e.target.value }))
          }
          placeholder={"Πρακτικό υλικό\nΟδηγός εφαρμογής"}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-5">
        <h4 className="font-semibold text-slate-800">Κάρτες περιεχομένου</h4>

        {[1, 2, 3].map((n) => {
          const titleKey = `card${n}Title` as keyof EditableEbookContent;
          const descriptionKey =
            `card${n}Description` as keyof EditableEbookContent;

          return (
            <div key={n} className="space-y-2">
              <input
                value={content[titleKey]}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    [titleKey]: e.target.value,
                  }))
                }
                placeholder={`Τίτλος κάρτας ${n}`}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
              />

              <RichTextEditor
                value={String(content[descriptionKey] || "")}
                onChange={(html) =>
                  setContent((c) => ({
                    ...c,
                    [descriptionKey]: html,
                  }))
                }
                placeholder={`Περιγραφή κάρτας ${n}...`}
                minHeight={120}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

function EbookPreview({
  draft,
  content,
}: {
  draft: EbookFormDraft;
  content: EditableEbookContent;
}) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="aspect-[4/5] bg-slate-100 relative">
          {draft.coverImageUrl ? (
            <Image
              src={draft.coverImageUrl.startsWith("/media") ? toMediaUrl(draft.coverImageUrl) : draft.coverImageUrl}
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

        <h5 className="mt-1 text-xl font-semibold">
          {draft.title || "Τίτλος"}
        </h5>

        <p className="mt-1 text-slate-600">{draft.author || "Συγγραφέας"}</p>

        {content.description && (
          <RichHtmlRenderer
            html={content.description}
            className="ebook-rich-content mt-3 text-sm text-slate-600"
          />
        )}

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
            {content.toc || "Δεν υπάρχουν περιεχόμενα."}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium text-slate-700 mb-2">Κάρτες</div>

          <div className="space-y-2 text-sm text-slate-600">
            {[1, 2, 3].map((n) => {
              const titleKey = `card${n}Title` as keyof EditableEbookContent;
              const descriptionKey =
                `card${n}Description` as keyof EditableEbookContent;

              return (
                <div key={n} className="rounded-xl bg-slate-50 p-3">
                  <strong>{content[titleKey]}</strong>

                  <RichHtmlRenderer
                    html={String(content[descriptionKey] || "")}
                    className="ebook-card-rich-content mt-1"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {(draft.fileUrl || draft.file) && (
          <div className="mt-4 text-sm text-slate-600">
            {draft.file
              ? `Επιλεγμένο αρχείο: ${draft.file.name}`
              : `File URL: ${draft.fileUrl}`}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm text-slate-500 mb-2">JSON προς backend:</p>

        <pre className="text-xs whitespace-pre-wrap break-words">
          {buildEditableContent(content)}
        </pre>
      </div>
    </div>
  );
}