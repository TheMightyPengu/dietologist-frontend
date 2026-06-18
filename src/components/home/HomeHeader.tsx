import Link from "next/link";
import LeafBurstButton from "../decorative/LeafBurstButton";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import { toMediaUrl } from "@/api/_axios-client";

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
    mainPictureUrl?.trim() ||
    "https://img.freepik.com/premium-photo/diet-healthy-nutrition-portrait-dietitian-s_118454-1331.jpg";

  return (
    <section className="relative bg-bg pt-10 md:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="overflow-hidden rounded-sm bg-bg shadow-[0_10px_25px_rgba(0,0,0,0.10)] ring-1 ring-accent/20">
                <img
                  src={heroImage.startsWith("/media") ? toMediaUrl(heroImage) : heroImage}
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

            <div className="text-lg leading-relaxed text-slate-700 font-serif">
              {loading ? (
                <p className="mb-0">Φόρτωση περιεχομένου…</p>
              ) : (
                <RichHtmlRenderer
                  html={heroInfo}
                  className="hero-rich-content mb-0"
                />
              )}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <div className="relative group">
                <LeafBurstButton text="ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΣ ΣΥΝΕΔΡΙΑΣ" href="/contact/book" />
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

        <section className="relative py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "1:1 Ραντεβού", href: "/services#one-to-one" },
              { title: "Ομαδικές Συναντήσεις", href: "/services#groups" },
              { title: "Σεμινάρια", href: "/seminars" },
            ].map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className={[
                  "group relative block overflow-hidden",
                  "rounded-tl-[72px] rounded-br-[72px] rounded-tr-[28px] rounded-bl-[28px]",
                  "bg-[#fbfaf5]/90",
                  "border border-[#6f8f5f]/25",
                  "px-6 py-8 md:px-8 md:py-10",
                  "text-center",
                  "shadow-[0_18px_45px_rgba(76,92,65,0.12)]",
                  "backdrop-blur-[10px]",
                  "transition-all duration-300",
                  "hover:-translate-y-1",
                  "hover:border-[#6f8f5f]/40",
                  "hover:bg-[#fffdf7]",
                  "hover:shadow-[0_28px_70px_rgba(76,92,65,0.18)]",
                  "no-hover-underline",
                ].join(" ")}
              >
                {/* soft green wash */}
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(164,199,126,0.22),transparent_34%),radial-gradient(circle_at_90%_85%,rgba(111,143,95,0.14),transparent_38%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                {/* stronger leaf mark */}
                <span className="pointer-events-none absolute left-6 top-6 h-12 w-16 rounded-tl-full rounded-br-full border border-[#6f8f5f]/30 bg-white/30 rotate-[-12deg]" />

                {/* small leaf vein */}
                <span className="pointer-events-none absolute left-10 top-12 h-px w-10 origin-left rotate-[-28deg] bg-[#6f8f5f]/25" />

                {/* bottom accent glow */}
                <span className="pointer-events-none absolute -bottom-10 left-1/2 h-20 w-44 -translate-x-1/2 rounded-full bg-[#a4c77e]/20 blur-2xl transition-all duration-300 group-hover:bg-[#a4c77e]/30" />

                <h3 className="relative text-lg font-semibold text-[#243322]">
                  {s.title}
                </h3>

                <p className="relative mt-3 text-sm leading-6 text-[#66745f]">
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