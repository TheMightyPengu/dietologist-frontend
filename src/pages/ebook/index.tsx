import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EbooksApi, type EbooksGetDto } from "../../api/EbooksController";

/**
 * EBOOK — Landing page connected to backend
 *
 * Notes:
 * - Backend currently gives us:
 *   id, title, author, tableOfContents, coverImageUrl, price, fileUrl, publishedAt
 * - Fields like subtitle, pages, format, bonus templates, sampleUrl, buyUrl do NOT exist yet.
 *   We keep safe frontend fallbacks/comments until backend adds them.
 */

type EbookViewModel = {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  cover: string;
  priceEUR?: number;
  toc: string[];
  bonusTemplates: string[];
  sampleUrl?: string;
  buyUrl?: string;
  lastUpdatedISO: string;
  format: "PDF";
};

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

function parseTableOfContents(raw?: string | null): string[] {
  if (!raw) return [];

  // Case 1: backend sends JSON string array
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .map((x) => String(x).trim())
        .filter(Boolean);
    }
  } catch {
    // ignore and continue
  }

  // Case 2: newline-separated / semicolon-separated / comma-separated plain text
  return raw
    .split(/\r?\n|;|,/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function mapDtoToViewModel(dto: EbooksGetDto): EbookViewModel {
  const toc = parseTableOfContents(dto.tableOfContents);

  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    subtitle:
      `Ένας πρακτικός οδηγός από τον/την ${dto.author}.`,
    cover:
      dto.coverImageUrl ||
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
    priceEUR: dto.price,
    toc,
    bonusTemplates: [
      // Backend does not provide bonus templates yet.
      // Keep placeholders or remove this block later if not needed.
      "Πρακτικό υλικό",
      "Οδηγός εφαρμογής",
    ],
    sampleUrl: dto.fileUrl || undefined, // backend has no dedicated sample URL yet
    buyUrl: dto.fileUrl || undefined, // temporary fallback until checkout flow exists
    lastUpdatedISO: dto.publishedAt,
    format: "PDF", // backend does not provide format yet
  };
}

export default function EbookPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebook, setEbook] = useState<EbookViewModel | null>(null);

  useEffect(() => {
    let active = true;

    const run = async () => {
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

        // This page is a single landing page, so for now we display the first ebook.
        // If later there are many ebooks, replace this with slug/id routing.
        setEbook(mapDtoToViewModel(items[0]));
        } catch (err: unknown) {
          if (!active) return;

          const message =
            err instanceof Error ? err.message : "Κάτι πήγε στραβά.";

          setError(message);
        } finally {
          if (active) setLoading(false);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  const lastUpdatedReadable = useMemo(() => {
    if (!ebook) return "";
    const d = new Date(ebook.lastUpdatedISO);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("el-GR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, [ebook]);

  const primaryCtaClass =
    "inline-flex items-center gap-2 rounded-xl border border-[#8484d1]/20 bg-[#8484d1] text-white px-4 py-2 font-medium shadow hover:opacity-95 transition";

  const quietLinkClass =
    "inline-flex items-center gap-2 text-[#8484d1] font-medium underline underline-offset-4 decoration-[#8484d1]/30 hover:decoration-[#8484d1]/70 transition";

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
                      "bg-white",
                      "aspect-[4/5]",
                      "transform-gpu",
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

                <p className="mt-2 text-slate-600 leading-relaxed md:leading-7 max-w-prose">
                  {ebook.subtitle}
                </p>

                <div className="mt-3 text-sm text-slate-500">
                  Συγγραφέας: {ebook.author}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                    Μορφή: {ebook.format}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                    Τελευταία ενημέρωση: {lastUpdatedReadable}
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
                      {ebook.priceEUR ? `Αγορά — ${ebook.priceEUR}€` : "Κατέβασμα"}
                    </a>
                  ) : (
                    <Link href="/contact" className={primaryCtaClass}>
                      {ebook.priceEUR ? `Αγορά — ${ebook.priceEUR}€` : "Κατέβασμα"}
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
              {[
                {
                  t: "Πρακτικός Οδηγός",
                  d: "Καθαρή δομή και εύκολη ανάγνωση για άμεση εφαρμογή στην καθημερινότητα.",
                  Ico: IconCheckList,
                },
                {
                  t: "Άμεση Χρήση",
                  d: "Χρήσιμο περιεχόμενο που μπορεί να αξιοποιηθεί χωρίς περιττή θεωρία.",
                  Ico: IconTarget,
                },
                {
                  t: "Οργανωμένο Περιεχόμενο",
                  d: "Το ebook έρχεται οργανωμένο με σαφή ενότητες και εύχρηστο υλικό.",
                  Ico: IconBeaker,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#8484d1]/8 text-[#8484d1] ring-1 ring-[#8484d1]/15">
                      <f.Ico className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg">{f.t}</h3>
                      <p className="text-slate-600 mt-1 line-clamp-2">
                        {f.d}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
                      {(ebook.toc || []).length > 0 ? (
                        ebook.toc.map((entry, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <span className="mt-1 select-none text-white/90">•</span>
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
                      {(ebook.bonusTemplates || []).map((entry, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <span className="mt-1 select-none text-white/90">•</span>
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