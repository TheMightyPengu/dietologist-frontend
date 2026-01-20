import Link from "next/link";
import LeafBurstButton from "../decorative/LeafBurstButton";

export default function HomeHero() {
  return (
    <section className="relative">
      {/* Decorative vine (desktop only) */}
      {/* <img
        src="/decor/vine.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none hidden md:block absolute -top-6 right-0 w-44 opacity-90"
      /> */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* GRID: left photo / right welcome text */}
        <div className="grid items-center gap-10 md:grid-cols-12">
          {/* Left column — Arch photo */}
          <div className="md:col-span-6 lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              {/* Arch frame (white bg only; accents via green borders) */}
              <div className="overflow-hidden rounded-t-[180px] rounded-b-none bg-white shadow-[0_10px_25px_rgba(0,0,0,0.10)] ring-1 ring-accent/20">
                <img
                  src="https://img.freepik.com/premium-photo/diet-healthy-nutrition-portrait-dietitian-s_118454-1331.jpg"
                  alt="Diet out of the Box — Διατροφή & Υγεία"
                  className="block h-auto w-full object-cover"
                />
              </div>

              {/* Base anchor (white bg only; green border) */}
              <div className="mx-auto -mt-1 h-3 w-full rounded-b-xl bg-white ring-1 ring-accent/20" />
            </div>
          </div>

          {/* Right column — Welcome & intro */}
          <div className="md:col-span-6 md:col-start-7 lg:col-span-7 space-y-5">
            {/* Brand eyebrow: purple text, subtle green divider */}
            <div className="inline-flex items-center gap-3">
              <p className="text-sm uppercase tracking-[0.18em] text-primary">
                diet out of the box
              </p>
              <span className="hidden sm:inline-block h-px w-14 bg-accent/40" />
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight font-serif">
              Καλώς ήρθατε!
            </h1>

            <div className="text-[17px] leading-relaxed text-slate-700 font-serif/none">
              <p className="mb-3">
                Είμαι η <span className="font-medium">Βασιλική Χύτα</span>,
                Διαιτολόγος–Διατροφολόγος. Πιστεύω σε μια ήπια, ανθρωποκεντρική
                προσέγγιση που συνδέει τη γνώση με τη φροντίδα: εκπαίδευση,
                ευεξία και ισορροπία, πέρα από στερεότυπα και «γρήγορες λύσεις».
              </p>
              <p className="mb-0">
                Στόχος μου είναι να χτίσουμε μαζί μια ουσιαστική σχέση με την
                τροφή και το σώμα, με ρεαλισμό, σεβασμό και συνέπεια στην
                καθημερινότητα.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              {/* Primary CTA stays purple (LeafBurstButton should use bg-primary internally) */}
              <LeafBurstButton text="ΖΗΤΗΣΤΕ ΕΝΑ ΡΑΝΤΕΒΟΥ" />

              {/* Link rule: purple default, green hover */}
              <Link
                href="#bio"
                className="text-base text-primary underline underline-offset-4 decoration-accent/50 hover:text-accent hover:decoration-accent transition"
              >
                Διαβάστε περισσότερα εδώ
              </Link>
            </div>
          </div>
        </div>

        {/* SERVICES TEASER */}
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
                  // bg must be white only
                  "bg-white",
                  // GREEN used more: border, ring, hover tint, iconography later if needed
                  "ring-1 ring-accent/25",
                  // readable text (no white text on white bg)
                  "text-slate-800",
                  "text-center font-medium shadow-sm transition-all duration-200 hover:shadow",
                  "px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-4",
                  // subtle green lift on hover
                  "hover:bg-accent/10",
                  "no-hover-underline",
                  // shadow accent: mostly green; occasional purple for one card to keep brand presence
                  i === 0
                    ? "shadow-[1px_1px_6px_rgba(164,199,126,0.55)] hover:shadow-[2px_2px_10px_rgba(164,199,126,0.65)]"
                    : i === 1
                    ? "shadow-[1px_1px_6px_rgba(164,199,126,0.45)] hover:shadow-[2px_2px_10px_rgba(164,199,126,0.60)]"
                    : "shadow-[1px_1px_6px_rgba(122,122,196,0.35)] hover:shadow-[2px_2px_10px_rgba(122,122,196,0.50)]",
                ].join(" ")}
              >
                <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">
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
