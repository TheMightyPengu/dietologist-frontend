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
  sampleUrl?: string;
  buyUrl?: string;
  lastUpdatedISO: string;
};

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
              <div>
                <div
                  className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-[4/5] bg-cover bg-center"
                  style={{ backgroundImage: `url(${ebook.cover})` }}
                  aria-label={`Εξώφυλλο: ${ebook.title}`}
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  EBOOK
                </h1>
                <h2 className="mt-3 text-xl md:text-2xl font-medium">
                  {ebook.title}
                </h2>
                <p className="mt-2 text-slate-600">{ebook.subtitle}</p>

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

                <div className="mt-6 flex flex-wrap gap-3">
                  {ebook.sampleUrl && (
                    <a
                      href={ebook.sampleUrl}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#8484d1]/20 bg-white text-[#8484d1] px-4 py-2 font-medium shadow hover:bg-[#8484d1]/5 transition"
                    >
                      Προεπισκόπηση
                      <span aria-hidden>→</span>
                    </a>
                  )}
                  <Link
                    href={ebook.buyUrl || "/contact"}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#8484d1]/20 bg-[#8484d1] text-white px-4 py-2 font-medium shadow hover:opacity-95 transition"
                  >
                    {ebook.priceEUR ? `Αγορά — ${ebook.priceEUR}€` : "Κατέβασμα"}
                  </Link>
                </div>
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
                },
                {
                  t: "Εστίαση στην Πράξη",
                  d: "Κανένα «μαγικό» μυστικό—μόνο βήματα που εφαρμόζονται εύκολα.",
                },
                {
                  t: "Επιστημονικά Τεκμηριωμένο",
                  d: "Σαφείς αναφορές και καθαρές οδηγίες όπου χρειάζεται.",
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
                >
                  <h3 className="font-semibold text-lg">{f.t}</h3>
                  <p className="text-slate-600 mt-1">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOC + CTA (accent band ~10%) */}
        {!loading && !error && ebook && (
          <div className="bg-[#8484d1] text-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="text-xl font-semibold">Τι θα βρείτε μέσα</h3>
                  <ul className="mt-3 space-y-2">
                    {ebook.toc.map((entry, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 leading-relaxed"
                      >
                        <span className="mt-1 select-none">•</span>
                        <span>{entry}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:justify-self-end">
                  <Link
                    href={ebook.buyUrl || "/contact"}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-[#8484d1] px-5 py-3 font-semibold shadow hover:opacity-90 transition"
                  >
                    {ebook.priceEUR ? `Αγορά τώρα — ${ebook.priceEUR}€` : "Κατέβασμα τώρα"}
                    <span aria-hidden>→</span>
                  </Link>
                  <p className="mt-2 text-white/90 text-sm">
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
