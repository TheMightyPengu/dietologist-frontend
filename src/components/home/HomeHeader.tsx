import Link from "next/link";
import LeafBurstButton from "../decorative/LeafBurstButton";

type HomeHeroProps = {
  title?: string | null;
  info?: string | null;
  mainPictureUrl?: string | null;
  loading?: boolean;
};

export default function HomeHero({
  title,
  info,
  mainPictureUrl,
  loading = false,
}: HomeHeroProps) {
  const heroTitle = title?.trim() || "Καλώς ήρθατε!";
  const heroInfo =
    info?.trim() ||
    "Είμαι η Βασιλική Χύτα, Διαιτολόγος–Διατροφολόγος. Πιστεύω σε μια ήπια, ανθρωποκεντρική προσέγγιση που συνδέει τη γνώση με τη φροντίδα: εκπαίδευση, ευεξία και ισορροπία, πέρα από στερεότυπα και «γρήγορες λύσεις».";
  const heroImage =
    mainPictureUrl ||
    "https://img.freepik.com/premium-photo/diet-healthy-nutrition-portrait-dietitian-s_118454-1331.jpg";

  return (
    <section className="relative bg-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="overflow-hidden rounded-sm bg-bg shadow-[0_10px_25px_rgba(0,0,0,0.10)] ring-1 ring-accent/20">
                <img
                  src={heroImage}
                  alt="Diet out of the Box — Διατροφή & Υγεία"
                  className="block h-auto w-full object-cover"
                />
              </div>

              <div className="mx-auto -mt-1 h-3 w-full rounded-sm bg-bg ring-1 ring-accent/20" />
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7 lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-3">
              <p className="text-base uppercase tracking-[0.18em] text-accent saturate-150">
                diet out of the box
              </p>
              <span className="hidden sm:inline-block h-px w-14 bg-accent saturate-150" />
            </div>

            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight font-serif">
              {heroTitle}
            </h1>

            <div className="text-lg leading-relaxed text-slate-700 font-serif/none">
              {loading ? (
                <p className="mb-0">Φόρτωση περιεχομένου…</p>
              ) : (
                <p className="mb-0">{heroInfo}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <div className="relative group">
                <LeafBurstButton text="ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΣ ΣΥΝΕΔΡΙΑΣ" />
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg pointer-events-none"
                  style={{ background: "rgba(255,230,150,0.2)" }}
                />
              </div>

              <Link
                href="#bio"
                className="text-base text-primary underline underline-offset-4 decoration-accent/50 hover:text-accent hover:decoration-accent transition-all relative group/link"
              >
                Διαβάστε περισσότερα εδώ
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover/link:w-full transition-all duration-300" />
              </Link>
            </div>
          </div>
        </div>

        <section className="py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "1:1 Ραντεβού", href: "/services#one-to-one" },
              { title: "Ομαδικές Συναντήσεις", href: "/services#groups" },
              { title: "Σεμινάρια", href: "/seminars" },
            ].map((s, i) => (
              <Link
                key={s.title}
                href={s.href}
                className={[
                  "block self-center m-2 rounded-tl-full rounded-br-full rounded-2xl",
                  "bg-accent/50",
                  "ring-1 ring-accent/25",
                  "text-slate-800",
                  "text-center font-medium shadow-sm transition-all duration-200 hover:shadow",
                  "px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-4",
                  "hover:bg-accent/75",
                  "no-hover-underline",
                  i === 0
                    ? "shadow-[1px_1px_6px_rgba(164,199,126,0.55)] hover:shadow-[2px_2px_10px_rgba(164,199,126,0.65)]"
                    : i === 1
                    ? "shadow-[1px_1px_6px_rgba(164,199,126,0.45)] hover:shadow-[2px_2px_10px_rgba(164,199,126,0.60)]"
                    : "shadow-[1px_1px_6px_rgba(122,122,196,0.35)] hover:shadow-[2px_2px_10px_rgba(122,122,196,0.50)]",
                ].join(" ")}
              >
                <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 text-grey/60">
                  Μάθετε περισσότερα για τον τρόπο που δουλεύουμε.
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}