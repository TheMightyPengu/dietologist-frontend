import Head from "next/head";
import Link from "next/link";
import HomeHero from "@/components/home/HomeHeader";

export default function HomePage() {
  const siteName = "Διαιτολογικό Κέντρο";

  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Αρχική — " + siteName,
    url: "https://your-domain.gr/",
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: "https://your-domain.gr/",
    },
  };

  return (
    <>
      <Head>
        <title>Αρχική — {siteName}</title>
        <meta
          name="description"
          content="Καλωσήρθατε στο Διαιτολογικό Κέντρο — Επιστημονική υποστήριξη, εξατομικευμένα προγράμματα και ζεστή προσέγγιση στη διατροφή."
        />
        <link rel="canonical" href="https://your-domain.gr/" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </Head>

      {/* HERO */}
      <HomeHero />

      {/* Services Teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
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

      {/* Blog Teaser */}
      <section className="bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Πρόσφατα από το Blog
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-[#7a7ac4] hover:opacity-90"
            >
              Δείτε όλα →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                className="rounded-2xl bg-white ring-1 ring-black/5 p-5 shadow-sm"
              >
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 mb-4" />
                <h3 className="font-medium">Τίτλος άρθρου #{i}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Σύντομη περιγραφή άρθρου για προεπισκόπηση.
                </p>
                <Link
                  href="/blog/articles/sample"
                  className="mt-3 inline-block text-sm font-medium text-[#7a7ac4] hover:opacity-90"
                >
                  Διαβάστε περισσότερο →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="rounded-3xl bg-[#7a7ac4] text-white px-6 py-10 md:px-12 md:py-14 shadow">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Έτοιμοι να ξεκινήσουμε;
          </h2>
          <p className="mt-2 max-w-2xl text-white/90">
            Κλείστε ραντεβού για την πρώτη μας συνάντηση — από κοντά ή online.
          </p>
          <Link
            href="/contact/book"
            className="mt-6 inline-flex items-center rounded-2xl bg-white px-6 py-3 text-[#7a7ac4] font-medium hover:opacity-90"
          >
            Ζητήστε ένα ραντεβού
          </Link>
        </div>
      </section>
    </>
  );
}