import Link from "next/link";
import LeafBurstButton from "../decorative/LeafBurstButton";

export default function HomeHero() {
  return (
    <section className="relative">
      {/* Decorative vine (desktop only) */}
      <img
        src="/decor/vine.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none hidden md:block absolute -top-6 right-0 w-44 opacity-90"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* GRID: left text / right image */}
        <div className="grid items-start gap-8 md:grid-cols-12">
          {/* Left column */}
          <div className="md:col-span-6 lg:col-span-5 space-y-6">
            {/* Logo card */}
            <div className="inline-flex items-center justify-center rounded-2xl bg-white/80 ring-1 ring-[#7a7ac4]/20 shadow-sm p-4">
              <img
                src="/logo-square.png" // replace with your square logo
                alt="Diet out of the Box — Διατροφή & Υγεία"
                className="h-20 w-auto"
              />
            </div>

            {/* Name & title */}
            <div className="pt-2">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Βίκη Χύτα
              </h1>
              <p className="mt-1 text-xl sm:text-2xl text-slate-700">
                Διαιτολόγος-Διατροφολόγος
              </p>
            </div>

            {/* Short intro text */}
            <p className="max-w-prose text-[17px] leading-relaxed text-slate-700">
              {/* Replace with real copy */}
              Προσωποκεντρική καθοδήγηση διατροφής με έμφαση στην ευεξία,
              την εκπαίδευση και την ισορροπία — πέρα από στερεότυπα και «γρήγορες λύσεις».
            </p>

            {/* Primary CTA */}
            <div className="pt-2">
              <LeafBurstButton text={"ΖΗΤΗΣΤΕ ΕΝΑ ΡΑΝΤΕΒΟΥ"}/>
            </div>
          </div>

          {/* Right column — big photo */}
          <div className="md:col-span-6 md:col-start-7 lg:col-span-7">
            <div className="relative aspect-[4/3] md:aspect-[16/11] w-full rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] bg-white">
              <img
                src="/hero/photo.jpg" // replace with hero image
                alt="Βίκη Χύτα — Διατροφή & Υγεία"
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
              />
              {/* Subtle inner border */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
