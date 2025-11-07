import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * ΣΕΜΙΝΑΡΙΑ — Λίστα σεμιναρίων (mock API)
 * - Ελληνικό UI
 * - Μινιμαλιστική, μοντέρνα σελιδοποίηση/πλέγμα
 * - Skeletons, loading, error state
 * - Accent: #7a7ac4 (60-30-10 rule με ουδέτερο φόντο)
 */

type Seminar = {
  id: string;
  title: string;
  dateISO: string; // e.g. "2025-12-12T17:00:00+02:00"
  durationMin: number;
  mode: "Δια ζώσης" | "Online";
  excerpt: string;
  cover: string;
  priceEUR?: number; // optional (δωρεάν όταν λείπει)
  slug: string;
};

export default function SeminarsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Seminar[]>([]);
  const [q, setQ] = useState("");

  // --- Mock "API call"
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (!active) return;
      // dummy dataset (θα αντικατασταθεί από πραγματικό API)
      const data: Seminar[] = [
        {
          id: "sem-1",
          title: "Διατροφή & Ενέργεια στην Καθημερινότητα",
          dateISO: "2025-12-12T17:00:00+02:00",
          durationMin: 90,
          mode: "Online",
          excerpt:
            "Πρακτικά βήματα για σταθερή ενέργεια, βελτίωση συγκέντρωσης και ισορροπία γευμάτων.",
          cover:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
          priceEUR: 15,
          slug: "diatrofi-energeia",
        },
        {
          id: "sem-2",
          title: "Meal Prep για Απασχολημένους",
          dateISO: "2026-01-20T18:30:00+02:00",
          durationMin: 75,
          mode: "Δια ζώσης",
          excerpt:
            "Πώς οργανώνουμε εβδομαδιαία μενού, λίστες, και συστήματα για εύκολη προετοιμασία.",
          cover:
            "https://images.unsplash.com/photo-1505575972945-290b7f2eea6b?q=80&w=1200&auto=format&fit=crop",
          priceEUR: 20,
          slug: "meal-prep",
        },
        {
          id: "sem-3",
          title: "Mindful Eating: Απόλαυση χωρίς Ενοχές",
          dateISO: "2026-02-10T19:00:00+02:00",
          durationMin: 60,
          mode: "Online",
          excerpt:
            "Τεχνικές προσοχής και σήματα πείνας/κορεσμού για καλύτερη σχέση με το φαγητό.",
          cover:
            "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1200&auto=format&fit=crop",
          slug: "mindful-eating",
        },
      ];
      setItems(data);
      setLoading(false);
    }, 800);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.excerpt.toLowerCase().includes(term) ||
        s.mode.toLowerCase().includes(term)
    );
  }, [items, q]);

  return (
    <>
      <Head>
        <title>Σεμινάρια — Διατροφολόγος</title>
        <meta
          name="description"
          content="Σύγχρονα σεμινάρια διατροφής με πρακτικές συμβουλές και εργαλεία."
        />
      </Head>

      <section className="bg-[#F7F7EF] text-slate-800">
        {/* hero */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 md:pt-20 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                ΣΕΜΙΝΑΡΙΑ
              </h1>
              <p className="mt-3 text-slate-600">
                Μικρές, στοχευμένες ενότητες με πρακτικό περιεχόμενο. Online
                &amp; δια ζώσης, με έμφαση στην εφαρμογή.
              </p>
            </div>

            {/* search */}
            <div className="w-full md:w-[360px]">
              <label className="sr-only" htmlFor="search">
                Αναζήτηση
              </label>
              <div className="relative">
                <input
                  id="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Αναζήτηση σεμιναρίων…"
                  className="w-full rounded-2xl border border-slate-300 bg-white/70 backdrop-blur px-4 py-3 pr-12 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a7ac4]"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                  ⌕
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden animate-pulse"
                >
                  <div className="h-40 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-9 bg-slate-200 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-red-700">
                Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-600">Δεν βρέθηκαν αποτελέσματα.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((s) => {
                const date = new Date(s.dateISO);
                const niceDate = isNaN(date.getTime())
                  ? "Ημερομηνία σύντομα"
                  : date.toLocaleString("el-GR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                return (
                  <article
                    key={s.id}
                    className="group rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col"
                  >
                    <div
                      className="h-40 bg-cover bg-center"
                      style={{ backgroundImage: `url(${s.cover})` }}
                    />
                    <div className="p-5 flex flex-col grow">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1">
                          {s.mode}
                        </span>
                        <span>•</span>
                        <span>{niceDate}</span>
                        <span>•</span>
                        <span>{s.durationMin}′</span>
                      </div>

                      <h3 className="mt-2 text-lg font-semibold leading-snug">
                        {s.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">
                        {s.excerpt}
                      </p>

                      {/* Sticky-to-bottom footer */}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span className="text-[#7a7ac4] font-semibold">
                          {s.priceEUR ? `${s.priceEUR}€` : "ΔΩΡΕΑΝ"}
                        </span>
                        <Link
                          href={`/seminars/${s.slug}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#7a7ac4]/20 bg-[#7a7ac4] text-white px-3 py-2 text-sm shadow hover:opacity-95 transition"
                        >
                          Κράτηση θέσης
                          <span aria-hidden>→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA band (accent ~10%) */}
        <div className="bg-[#7a7ac4] text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <h2 className="text-xl md:text-2xl font-semibold">
              Θέλετε εταιρικό σεμινάριο;
            </h2>
            <p className="opacity-90">
              Επικοινωνήστε για προσαρμοσμένα workshops στην ομάδα σας.
            </p>
            <div className="md:ml-auto">
              <Link
                href="/contact"
                className="inline-flex rounded-xl bg-white text-[#7a7ac4] px-4 py-2 font-medium shadow hover:opacity-90 transition"
              >
                Επικοινωνία
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
