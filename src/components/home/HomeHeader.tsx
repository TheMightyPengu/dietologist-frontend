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
              {/* Arch frame */}
              <div className="overflow-hidden rounded-t-[180px] rounded-b-none shadow-[0_10px_25px_rgba(0,0,0,0.10)] ring-1 ring-black/5">
                <img
                  src="https://img.freepik.com/premium-photo/diet-healthy-nutrition-portrait-dietitian-s_118454-1331.jpg"
                  alt="Diet out of the Box — Διατροφή & Υγεία"
                  className="block h-auto w-full object-cover"
                />
              </div>

              {/* Subtle base to anchor the arch visually */}
              <div className="h-3 w-full mx-auto -mt-1 rounded-b-xl bg-white/80 ring-1 ring-black/5 backdrop-blur" />
            </div>
          </div>

          {/* Right column — Welcome & intro */}
          <div className="md:col-span-6 md:col-start-7 lg:col-span-7 space-y-5">
            <p className="text-sm tracking-[0.18em] text-[#7a7ac4] uppercase">
              diet out of the box
            </p>

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

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <LeafBurstButton text="ΖΗΤΗΣΤΕ ΕΝΑ ΡΑΝΤΕΒΟΥ" />
              <Link
                href="#bio"
                className="text-base underline underline-offset-4 decoration-[#7a7ac4]/40 hover:decoration-[#7a7ac4] text-slate-800"
              >
                Διαβάστε περισσότερα εδώ
              </Link>
            </div>
          </div>
        </div>

        {/* SERVICES TEASER (moved here from index.tsx) */}
        <section className="py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: "1:1 Ραντεβού", href: "/services/one-to-one" },
              { title: "Ομαδικές Συναντήσεις", href: "/services/group" },
              { title: "Σεμινάρια", href: "/seminars" },
            ].map((s) => (
              <Link
                key={s.title}
                href={s.href}
                className="block text-center self-center m-2 px-4 py-2
                rounded-tl-full rounded-br-full rounded-2xl bg-white/80
                ring-1 ring-black/5 text-white text-xs sm:text-sm md:text-base
                font-medium shadow-sm hover:shadow transition-all duration-200
                [box-shadow:1px_1px_4px_#7a7ac4] hover:[box-shadow:2px_2px_7px_#7a7ac4]
                sm:px-5 sm:py-3 md:px-6 md:py-4"
              >
                <h3 className="text-lg font-semibold">{s.title}</h3>
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
