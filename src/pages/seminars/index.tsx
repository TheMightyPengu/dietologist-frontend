import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

type PillProps = {
  children: React.ReactNode;
  variant?: "accent" | "warm";
};
const Pill = ({ children, variant = "accent" }: PillProps) => (
  <span
    className={[
      "inline-flex items-center rounded-full px-2.5 py-1 text-xs leading-none",
      "bg-white",
      variant === "warm" ? "ring-1 ring-warm/45" : "ring-1 ring-accent/30",
      "text-slate-700",
    ].join(" ")}
  >
    {children}
  </span>
);

function formatParts(dateISO: string) {
  const d = new Date(dateISO);
  if (isNaN(d.getTime()))
    return { date: "Ημερομηνία σύντομα", time: "Ώρα σύντομα" };

  const date = d.toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = d.toLocaleTimeString("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date, time };
}

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
    let alive = true;
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      if (!alive) return;

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
      alive = false;
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

      <section className="text-slate-800">
        {/* hero */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 md:pt-20 pb-10 md:pb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                  ΣΕΜΙΝΑΡΙΑ
                </h1>
                <span className="hidden sm:inline-block h-px w-20 bg-accent/40" />
              </div>
              <p className="mt-3 text-slate-600 leading-relaxed">
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
                    "bg-white",
                    "border border-accent/35 hover:bg-accent/10",
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
                    "bg-white",
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
                const featured = idx === 0;
                const { date, time } = formatParts(s.dateISO);
                const priceLabel =
                  typeof s.priceEUR === "number" ? `${s.priceEUR}€` : "0€";

                return (
                  <article
                    key={s.id}
                    className={[
                      "group rounded-2xl overflow-hidden h-full flex flex-col transition",
                      "bg-white",
                      featured
                        ? [
                            "ring-2 ring-warm/50",
                            "shadow-[0_12px_28px_rgba(255,230,150,0.12)]",
                            "hover:shadow-[0_18px_38px_rgba(255,230,150,0.18)]",
                            "hover:ring-warm/70",
                          ].join(" ")
                        : [
                            "ring-1 ring-accent/20",
                            "shadow-[0_12px_28px_rgba(164,199,126,0.10)]",
                            "hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)]",
                            "hover:ring-accent/35",
                          ].join(" "),
                      "focus-within:ring-primary/35",
                    ].join(" ")}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 will-change-transform group-hover:scale-[1.02]"
                        style={{ backgroundImage: `url(${s.cover})` }}
                      />
                      {featured && (
                        <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-warm/80 border border-warm/60 px-2.5 py-1 text-xs font-medium text-slate-800">
                          🔥 Δημοφιλές
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col grow">
                      {/* unified pills */}
                      <div className="flex flex-wrap gap-2">
                        <Pill variant={featured ? "warm" : "accent"}>
                          {s.mode}
                        </Pill>
                        <Pill variant={featured ? "warm" : "accent"}>
                          {date}
                        </Pill>
                        <Pill variant={featured ? "warm" : "accent"}>
                          {time}
                        </Pill>
                        <Pill variant={featured ? "warm" : "accent"}>
                          {s.durationMin}′
                        </Pill>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold leading-snug text-slate-900">
                        {s.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {s.excerpt}
                      </p>

                      {/* footer */}
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <span
                          className={[
                            "font-semibold",
                            featured ? "text-warm" : "text-accent",
                          ].join(" ")}
                        >
                          {priceLabel}
                        </span>

                        <button
                          type="button"
                          onClick={() => openModal(s)}
                          className={[
                            "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow transition",
                            "bg-primary text-white",
                            "ring-1 ring-primary/20",
                            featured
                              ? "hover:shadow-[0_12px_28px_rgba(255,230,150,0.18)]"
                              : "hover:shadow-[0_12px_28px_rgba(164,199,126,0.18)]",
                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                          ].join(" ")}
                        >
                          Μάθε περισσότερα <span aria-hidden>→</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* corporate CTA as mini card */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
          <div
            className={[
              "rounded-2xl bg-white",
              "ring-1 ring-accent/30",
              "shadow-[0_12px_28px_rgba(164,199,126,0.10)]",
              "px-5 py-5 md:px-6 md:py-6",
            ].join(" ")}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                  Θέλετε εταιρικό σεμινάριο;
                </h2>
                <span className="hidden md:inline-block h-px w-20 bg-accent/40" />
              </div>

              <p className="text-slate-600 md:flex-1 leading-relaxed">
                Επικοινωνήστε για προσαρμοσμένα workshops στην ομάδα σας.
              </p>

              <Link
                href="/contact"
                className={[
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition",
                  "bg-white",
                  "text-primary hover:text-accent",
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

        {/* modal */}
        {open && active && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Λεπτομέρειες σεμιναρίου"
          >
            {/* backdrop (click outside + blur) */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
              aria-label="Κλείσιμο"
            />

            {/* panel */}
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-accent/25">
              {/* X close */}
              <button
                type="button"
                onClick={closeModal}
                className={[
                  "absolute right-3 top-3 z-10",
                  "inline-flex items-center justify-center rounded-xl p-2",
                  "bg-white/90 ring-1 ring-accent/30 shadow-sm",
                  "hover:bg-accent/10",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                ].join(" ")}
                aria-label="Κλείσιμο παραθύρου"
              >
                ✕
              </button>

              {/* layout: image left on desktop */}
              <div className="flex flex-col md:flex-row">
                <div className="md:w-[42%]">
                  <div
                    className="h-44 md:h-full md:min-h-[260px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${active.cover})` }}
                  />
                </div>

                {/* content with sticky footer */}
                <div className="md:w-[58%] flex flex-col">
                  <div className="p-6 sm:p-7 max-h-[70vh] overflow-y-auto">
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      {active.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(() => {
                        const { date, time } = formatParts(active.dateISO);
                        const priceLabel =
                          typeof active.priceEUR === "number"
                            ? `${active.priceEUR}€`
                            : "0€";
                        return (
                          <>
                            <Pill>{active.mode}</Pill>
                            <Pill>{date}</Pill>
                            <Pill>{time}</Pill>
                            <Pill>{active.durationMin}′</Pill>
                            <Pill>
                              <span className="font-semibold text-accent">
                                {priceLabel}
                              </span>
                            </Pill>
                          </>
                        );
                      })()}
                    </div>

                    <p className="mt-4 text-slate-700 leading-relaxed">
                      {active.excerpt}
                    </p>
                  </div>

                  <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-accent/15 px-6 sm:px-7 py-4">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
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
                        className={[
                          "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-medium transition",
                          "bg-white text-slate-800",
                          "ring-1 ring-accent/35 hover:bg-accent/10",
                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                        ].join(" ")}
                      >
                        Κλείσιμο
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}