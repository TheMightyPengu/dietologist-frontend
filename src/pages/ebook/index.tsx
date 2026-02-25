import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * EBOOK — Landing σελίδα (mock API)
 * - Ελληνικό UI
 * - Μοντέρνο hero + features + preview + CTA
 * - Skeletons, loading, error state
 * - Accent: #8484d1 (60-30-10 rule)
 */

type Ebook = {
  id: string;
  title: string;
  subtitle: string;
  cover: string;
  pages: number;
  format: "PDF" | "EPUB" | "MOBI";
  priceEUR?: number; // προαιρετικά δωρεάν
  toc: string[]; // table of contents
  bonusTemplates: string[]; // bonus list for structure
  sampleUrl?: string;
  buyUrl?: string;
  lastUpdatedISO: string;
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

export default function EbookPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebook, setEbook] = useState<Ebook | null>(null);

  // --- Mock "API"
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (!active) return;

      const data: Ebook = {
        id: "ebook-1",
        title: "Καθημερινή Διατροφή στην Πράξη",
        subtitle:
          "Ένας πρακτικός οδηγός με έτοιμα templates, λίστες, και απλές μεθόδους εφαρμογής.",
        cover:
          "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
        pages: 148,
        format: "PDF",
        priceEUR: 12,
        toc: [
          "Εισαγωγή: Τι σημαίνει «στην πράξη»",
          "Στήσιμο πιάτου & βασικές αρχές",
          "Meal prep & λίστες αγορών",
          "Διαχείριση ενέργειας & κορεσμού",
          "Mindful Eating & συνήθειες",
          "Συχνές ερωτήσεις",
        ],
        bonusTemplates: [
          "Template εβδομαδιαίου μενού",
          "Λίστα αγορών (εκτυπώσιμη)",
          "Planner meal prep",
          "Checklist συνηθειών",
        ],
        sampleUrl: "/files/ebook-sample.pdf",
        buyUrl: "/checkout/ebook",
        lastUpdatedISO: "2025-10-10T10:00:00+02:00",
      };

      setEbook(data);
      setLoading(false);
    }, 700);

    return () => {
      active = false;
      clearTimeout(timer);
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
        {/* hero */}
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
              <p className="text-red-700">
                Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.
              </p>
            </div>
          ) : ebook ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* cover */}
              <div className="flex justify-center md:justify-start">
                {/* subtle frame + optional 3D mockup feel */}
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
                    {/* subtle highlight edge */}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/20" />
                  </div>
                </div>
              </div>

              {/* content */}
              <div>
                {/* useful badge */}
                <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#8484d1] ring-1 ring-[#8484d1]/20 shadow-sm">
                  Νέο ebook
                </div>

                <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
                  {ebook.title}
                </h2>

                <p className="mt-2 text-slate-600 leading-relaxed md:leading-7 max-w-prose">
                  {ebook.subtitle}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                    {ebook.pages} σελίδες
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                    Μορφή: {ebook.format}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 border border-slate-200 shadow-sm">
                    Τελευταία ενημέρωση: {lastUpdatedReadable}
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  {/* quiet preview */}
                  {ebook.sampleUrl && (
                    <a href={ebook.sampleUrl} className={quietLinkClass}>
                      Προεπισκόπηση <span aria-hidden>→</span>
                    </a>
                  )}

                  {/* primary buy */}
                  <Link
                    href={ebook.buyUrl || "/contact"}
                    className={primaryCtaClass}
                  >
                    {ebook.priceEUR ? `Αγορά — ${ebook.priceEUR}€` : "Κατέβασμα"}
                  </Link>
                </div>

                {/* microcopy trust line */}
                <p className="mt-2 text-sm text-slate-500">
                  Άμεση πρόσβαση μετά την πληρωμή.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* features (30% δευτερεύον χρώμα: λευκά cards πάνω σε ουδέτερο φόντο) */}
        {!loading && !error && ebook && (
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  t: "Πρακτικά Templates",
                  d: "Έτοιμα φύλλα για μενού, λίστες αγορών και οργάνωση εβδομάδας.",
                  Ico: IconCheckList,
                },
                {
                  t: "Εστίαση στην Πράξη",
                  d: "Κανένα «μαγικό» μυστικό—μόνο βήματα που εφαρμόζονται εύκολα.",
                  Ico: IconTarget,
                },
                {
                  t: "Επιστημονικά Τεκμηριωμένο",
                  d: "Σαφείς αναφορές και καθαρές οδηγίες όπου χρειάζεται.",
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

        {/* TOC + CTA (accent band ~10%) */}
        {!loading && !error && ebook && (
          <div className="bg-[#8484d1] text-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
              {/* bring CTA closer + add structure */}
              <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
                <div className="grid sm:grid-cols-2 gap-8">
                  {/* contents */}
                  <div>
                    <h3 className="text-xl font-semibold">Περιεχόμενα</h3>
                    <ul className="mt-3 space-y-2 text-white/95">
                      {(ebook.toc || []).map((entry, idx) => (
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

                  {/* bonus */}
                  <div>
                    <h3 className="text-xl font-semibold">Bonus templates</h3>
                    <ul className="mt-3 space-y-2 text-white/95">
                      {(ebook.bonusTemplates || []).map((entry, idx) => (
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

                {/* CTA aligned closer to lists */}
                <div className="md:justify-self-end md:pt-1">
                  <Link
                    href={ebook.buyUrl || "/contact"}
                    className={[
                      // same style language as hero primary, adapted for purple band
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