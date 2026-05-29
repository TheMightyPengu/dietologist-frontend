import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EbooksApi, type EbooksGetDto } from "../../api/EbooksController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";

type EbookCard = {
  title: string;
  description: string;
};

type EbookContentData = {
  description: string;
  toc: string[];
  bonusTemplates: string[];
  cards: EbookCard[];
};

type EbookViewModel = {
  id: number;
  title: string;
  author: string;
  cover: string;
  priceEUR?: number;
  toc: string[];
  bonusTemplates: string[];
  sampleUrl?: string;
  buyUrl?: string;
  format: "PDF";
  description: string;
  cards: EbookCard[];
};

const DEFAULT_CARDS: EbookCard[] = [
  {
    title: "Πρακτικός Οδηγός",
    description:
      "Καθαρή δομή και εύκολη ανάγνωση για άμεση εφαρμογή στην καθημερινότητα.",
  },
  {
    title: "Άμεση Χρήση",
    description:
      "Χρήσιμο περιεχόμενο που μπορεί να αξιοποιηθεί χωρίς περιττή θεωρία.",
  },
  {
    title: "Οργανωμένο Περιεχόμενο",
    description:
      "Το ebook έρχεται οργανωμένο με σαφή ενότητες και εύχρηστο υλικό.",
  },
];

function IconCheckList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 6h12M9 12h12M9 18h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3.5 6.2l1.2 1.3L7 5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12.2l1.2 1.3L7 11.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 18.2l1.2 1.3L7 17.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTarget(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 21a9 9 0 1 1 9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17a5 5 0 1 1 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a1 1 0 1 1 1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 3l-7.2 7.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15.8 3H21v5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBeaker(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 3h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 3v6l-4.8 8.6A3 3 0 0 0 7.8 22h8.4a3 3 0 0 0 2.6-4.4L14 9V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 16h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function parseEbookContent(
  raw?: string | null,
  author?: string
): EbookContentData {
  const fallbackDescription = `Ένας πρακτικός οδηγός από τον/την ${
    author || "διαιτολόγο"
  }.`;

  if (!raw) {
    return {
      description: fallbackDescription,
      toc: [],
      bonusTemplates: ["Πρακτικό υλικό", "Οδηγός εφαρμογής"],
      cards: DEFAULT_CARDS,
    };
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        description: String(parsed.description || fallbackDescription),
        toc: Array.isArray(parsed.toc)
          ? parsed.toc.map(String).filter(Boolean)
          : [],
        bonusTemplates: Array.isArray(parsed.bonusTemplates)
          ? parsed.bonusTemplates.map(String).filter(Boolean)
          : ["Πρακτικό υλικό", "Οδηγός εφαρμογής"],
        cards:
          Array.isArray(parsed.cards) && parsed.cards.length
            ? parsed.cards
                .map((card: Partial<EbookCard>) => ({
                  title: String(card.title || "").trim(),
                  description: String(card.description || "").trim(),
                }))
                .filter((card: EbookCard) => card.title || card.description)
            : DEFAULT_CARDS,
      };
    }

    if (Array.isArray(parsed)) {
      return {
        description: fallbackDescription,
        toc: parsed.map(String).filter(Boolean),
        bonusTemplates: ["Πρακτικό υλικό", "Οδηγός εφαρμογής"],
        cards: DEFAULT_CARDS,
      };
    }
  } catch {
    // plain text fallback
  }

  return {
    description: fallbackDescription,
    toc: raw
      .split(/\r?\n|;|,/)
      .map((x) => x.trim())
      .filter(Boolean),
    bonusTemplates: ["Πρακτικό υλικό", "Οδηγός εφαρμογής"],
    cards: DEFAULT_CARDS,
  };
}

function mapDtoToViewModel(dto: EbooksGetDto): EbookViewModel {
  const content = parseEbookContent(dto.tableOfContents, dto.author);

  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    cover:
      dto.coverImageUrl ||
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
    priceEUR: dto.price,
    toc: content.toc,
    bonusTemplates: content.bonusTemplates,
    cards: content.cards,
    description: content.description,
    sampleUrl: dto.fileUrl || undefined,
    buyUrl: dto.fileUrl || undefined,
    format: "PDF",
  };
}

export default function EbookPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebook, setEbook] = useState<EbookViewModel | null>(null);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const items = await EbooksApi.list();

        if (!active) return;

        if (!items.length) {
          setEbook(null);
          setError("Δεν βρέθηκε ebook.");
          return;
        }

        setEbook(mapDtoToViewModel(items[0]));
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Κάτι πήγε στραβά.");
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, []);

  const primaryCtaClass =
    "inline-flex items-center gap-2 rounded-xl border border-[#8484d1]/20 bg-[#8484d1] text-white px-4 py-2 font-medium shadow hover:opacity-95 transition";

  const quietLinkClass =
    "inline-flex items-center gap-2 text-[#8484d1] font-medium underline underline-offset-4 decoration-[#8484d1]/30 hover:decoration-[#8484d1]/70 transition";

  const icons = [IconCheckList, IconTarget, IconBeaker];

  return (
    <>
      <Head>
        <title>Ebook — Διατροφολόγος</title>
        <meta
          name="description"
          content="Σύγχρονο ebook με πρακτικά εργαλεία για την καθημερινή διατροφή."
        />
      </Head>

      <section className="bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 md:pt-20 pb-10">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-pulse">
              <div className="h-80 bg-slate-200 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-10 bg-slate-200 rounded w-3/4" />
                <div className="h-5 bg-slate-200 rounded w-full" />
                <div className="h-5 bg-slate-200 rounded w-5/6" />
                <div className="h-11 bg-slate-200 rounded w-40" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          ) : ebook ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center md:justify-start">
                <div className="relative w-full max-w-[520px]">
                  <div className="absolute inset-0 rounded-2xl bg-white/30 blur-2xl" />

                  <div
                    className={[
                      "relative rounded-2xl overflow-hidden",
                      "ring-1 ring-[#8484d1]/15 shadow-[0_18px_50px_rgba(2,6,23,0.10)]",
                      "bg-white aspect-[4/5] transform-gpu",
                      "md:[transform:perspective(1200px)_rotateY(-6deg)_rotateX(2deg)]",
                      "md:hover:[transform:perspective(1200px)_rotateY(-3deg)_rotateX(1deg)]",
                      "transition-transform duration-500",
                    ].join(" ")}
                    aria-label={`Εξώφυλλο: ${ebook.title}`}
                  >
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${ebook.cover})` }}
                    />

                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/20" />
                  </div>
                </div>
              </div>

              <div>
                <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8484d1] ring-1 ring-[#8484d1]/20 shadow-sm">
                  Νέο ebook
                </div>

                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                  {ebook.title}
                </h2>

                <RichHtmlRenderer
                  html={ebook.description}
                  className="ebook-rich-content mt-2 text-slate-600 leading-relaxed md:leading-7 max-w-prose"
                />

                <div className="mt-3 text-sm text-slate-500">
                  Συγγραφέας: {ebook.author}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                    Μορφή: {ebook.format}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {ebook.sampleUrl && (
                    <a
                      href={ebook.sampleUrl}
                      className={quietLinkClass}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Προεπισκόπηση <span aria-hidden>→</span>
                    </a>
                  )}

                  {ebook.buyUrl ? (
                    <a
                      href={ebook.buyUrl}
                      className={primaryCtaClass}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {ebook.priceEUR
                        ? `Αγορά — ${ebook.priceEUR}€`
                        : "Κατέβασμα"}
                    </a>
                  ) : (
                    <Link href="/contact" className={primaryCtaClass}>
                      {ebook.priceEUR
                        ? `Αγορά — ${ebook.priceEUR}€`
                        : "Κατέβασμα"}
                    </Link>
                  )}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Άμεση πρόσβαση μετά την πληρωμή.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {!loading && !error && ebook && (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ebook.cards.map((card, i) => {
                const Ico = icons[i % icons.length];

                return (
                  <div
                    key={`${card.title}-${i}`}
                    className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8484d1]/10 text-[#8484d1] ring-1 ring-[#8484d1]/15">
                        <Ico className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {card.title}
                        </h3>

                        <RichHtmlRenderer
                          html={card.description}
                          className="ebook-card-rich-content text-slate-600 mt-1 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && ebook && (
          <div className="bg-[#8484d1] text-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
              <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold">Περιεχόμενα</h3>

                    <ul className="mt-3 space-y-2 text-white/95">
                      {ebook.toc.length > 0 ? (
                        ebook.toc.map((entry, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <span className="mt-1 select-none text-white/90">
                              •
                            </span>

                            <span>{entry}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-white/90">
                          Δεν υπάρχουν ακόμη διαθέσιμα περιεχόμενα.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">Bonus templates</h3>

                    <ul className="mt-3 space-y-2 text-white/95">
                      {ebook.bonusTemplates.map((entry, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <span className="mt-1 select-none text-white/90">
                            •
                          </span>

                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="md:justify-self-end md:pt-1">
                  {ebook.buyUrl ? (
                    <a
                      href={ebook.buyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={[
                        "inline-flex items-center gap-2 rounded-xl",
                        "border border-white/20 bg-white/10 text-white",
                        "px-5 py-3 font-semibold shadow",
                        "hover:bg-white/15 transition",
                      ].join(" ")}
                    >
                      {ebook.priceEUR
                        ? `Αγορά τώρα — ${ebook.priceEUR}€`
                        : "Κατέβασμα τώρα"}
                      <span aria-hidden>→</span>
                    </a>
                  ) : (
                    <Link
                      href="/contact"
                      className={[
                        "inline-flex items-center gap-2 rounded-xl",
                        "border border-white/20 bg-white/10 text-white",
                        "px-5 py-3 font-semibold shadow",
                        "hover:bg-white/15 transition",
                      ].join(" ")}
                    >
                      {ebook.priceEUR
                        ? `Αγορά τώρα — ${ebook.priceEUR}€`
                        : "Κατέβασμα τώρα"}
                      <span aria-hidden>→</span>
                    </Link>
                  )}

                  <p className="mt-2 text-white/95 text-sm">
                    Ασφαλής πληρωμή — Άμεση πρόσβαση.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}