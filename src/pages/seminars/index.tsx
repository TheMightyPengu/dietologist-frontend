import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * ΣΕΜΙΝΑΡΙΑ — Λίστα σεμιναρίων (mock API)
 * - Ελληνικό UI
 * - Μινιμαλιστική, μοντέρνα σελιδοποίηση/πλέγμα
 * - Skeletons, loading, error state
 * - Palette rules:
 *   - Backgrounds: WHITE only
 *   - Purple = primary/high-focus (CTAs, focus rings)
 *   - Green = more frequent accent (tints, borders, chips, dividers, shadows)
 *   - Links: purple default -> green on hover
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

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Seminar | null>(null);

  function openModal(s: Seminar) {
    setActive(s);
    setOpen(true);
  }
  function closeModal() {
    setOpen(false);
    setActive(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // --- Mock "API call"
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (!active) return;

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
        s.mode.toLowerCase().includes(term),
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

      {/* White-only background wrapper */}
      <section className="text-slate-800">
        {/* hero */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 md:pt-20 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  ΣΕΜΙΝΑΡΙΑ
                </h1>
                <span className="hidden sm:inline-block h-px w-20 bg-accent/40" />
              </div>
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
                  className={[
                    "w-full rounded-2xl px-4 py-3 pr-12 shadow-sm transition",
                    // bg must be white only
                    "bg-white",
                    // green used more: border + subtle hover tint
                    "border border-accent/35 hover:bg-accent/10",
                    // focus is purple (high focus)
                    "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/40",
                  ].join(" ")}
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-accent/70">
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
                  className={[
                    "rounded-2xl overflow-hidden animate-pulse",
                    // bg must be white only
                    "bg-white",
                    // green-tinted structure
                    "ring-1 ring-accent/20",
                    "shadow-sm shadow-[0_12px_28px_rgba(164,199,126,0.10)]",
                  ].join(" ")}
                >
                  <div className="h-40 bg-accent/15" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-accent/20 rounded w-3/4" />
                    <div className="h-4 bg-accent/20 rounded w-full" />
                    <div className="h-4 bg-accent/20 rounded w-2/3" />
                    <div className="h-9 bg-accent/20 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl bg-white ring-1 ring-accent/30 p-4 shadow-sm">
              <p className="text-slate-800">
                Κάτι πήγε στραβά. Δοκιμάστε ξανά αργότερα.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-slate-600">Δεν βρέθηκαν αποτελέσματα.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((s, idx) => {
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
                    className={[
                      "group rounded-2xl overflow-hidden h-full flex flex-col transition",
                      // bg must be white only
                      "bg-white",
                      // warm accent for first seminar (10% rule), green for others
                      idx === 0
                        ? "ring-2 ring-warm/50 shadow-[0_12px_28px_rgba(255,230,150,0.12)] hover:shadow-[0_18px_38px_rgba(255,230,150,0.18)]"
                        : "ring-1 ring-accent/20 shadow-[0_12px_28px_rgba(164,199,126,0.10)] hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)]",
                    ].join(" ")}
                  >
                    <div
                      className="h-40 bg-cover bg-center relative"
                      style={{ backgroundImage: `url(${s.cover})` }}
                    >
                      {idx === 0 && (
                        <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-warm/80 border border-warm/60 px-2.5 py-1 text-xs font-medium text-slate-800">
                          🔥 Δημοφιλές
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col grow">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        {/* Chip: white bg, warm ring for featured, green for others */}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 ${idx === 0 ? "bg-warm/20 ring-1 ring-warm/40" : "bg-white ring-1 ring-accent/30"}`}
                        >
                          {s.mode}
                        </span>
                        <span
                          className={
                            idx === 0 ? "text-warm/70" : "text-accent/70"
                          }
                        >
                          •
                        </span>
                        <span>{niceDate}</span>
                        <span
                          className={
                            idx === 0 ? "text-warm/70" : "text-accent/70"
                          }
                        >
                          •
                        </span>
                        <span>{s.durationMin}′</span>
                      </div>

                      <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-900">
                        {s.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600">{s.excerpt}</p>

                      {/* Sticky-to-bottom footer */}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <span
                          className={`font-semibold ${idx === 0 ? "text-warm" : "text-accent"}`}
                        >
                          {s.priceEUR ? `${s.priceEUR}€` : "ΔΩΡΕΑΝ"}
                        </span>

                        {/* Primary CTA = purple, warm hover for featured */}
                        <button
                          type="button"
                          onClick={() => openModal(s)}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow transition",
                            "bg-primary text-white",
                            "ring-1 ring-primary/20",
                            idx === 0
                              ? "hover:shadow-[0_12px_28px_rgba(255,230,150,0.18)]"
                              : "hover:shadow-[0_12px_28px_rgba(164,199,126,0.18)]",
                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                          ].join(" ")}
                        >
                          Μάθε περισσότερα
                          <span aria-hidden>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA band: keep white bg, push green tints; primary (purple) button inside */}
        <div>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                Θέλετε εταιρικό σεμινάριο;
              </h2>
              <span className="hidden md:inline-block h-px w-20 bg-accent/40" />
            </div>

            <p className="text-slate-600">
              Επικοινωνήστε για προσαρμοσμένα workshops στην ομάδα σας.
            </p>

            <div className="md:ml-auto">
              <Link
                href="/contact"
                className={[
                  "inline-flex rounded-xl px-4 py-2 font-medium shadow transition",
                  // bg must be white only
                  "bg-white",
                  // link rule: purple default -> green hover
                  "text-primary hover:text-accent",
                  // more green tint
                  "ring-1 ring-accent/40 hover:bg-accent/10",
                  "shadow-[0_12px_28px_rgba(164,199,126,0.12)] hover:shadow-[0_16px_34px_rgba(164,199,126,0.18)]",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                ].join(" ")}
              >
                Επικοινωνία
              </Link>
            </div>
          </div>
        </div>
        {open && active && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Λεπτομέρειες σεμιναρίου"
          >
            {/* backdrop */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Κλείσιμο"
            />

            {/* panel */}
            <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-accent/25">
              <div
                className="h-44 bg-cover bg-center"
                style={{ backgroundImage: `url(${active.cover})` }}
              />

              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      {active.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span className="inline-flex items-center rounded-full bg-white px-2 py-1 ring-1 ring-accent/30">
                        {active.mode}
                      </span>
                      <span className="text-accent/70">•</span>
                      <span>{active.durationMin}′</span>
                      <span className="text-accent/70">•</span>
                      <span className="font-semibold text-accent">
                        {active.priceEUR ? `${active.priceEUR}€` : "ΔΩΡΕΑΝ"}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-slate-700 leading-relaxed">
                  {active.excerpt}
                </p>

                {/* actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                  <Link
                    href="/contact/book"
                    className={[
                      "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition",
                      "bg-primary text-white",
                      "ring-1 ring-primary/20",
                      "hover:shadow-[0_12px_28px_rgba(164,199,126,0.18)]",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                    ].join(" ")}
                  >
                    Κράτηση θέσης
                  </Link>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium bg-white ring-1 ring-accent/40 hover:bg-accent/10"
                  >
                    Κλείσιμο
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
