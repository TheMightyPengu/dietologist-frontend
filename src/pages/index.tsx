// pages/index.tsx
import Head from "next/head";
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
          // @ts-ignore
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      </Head>

      {/* HERO (matches your wireframe) */}
      <HomeHero />

      {/* --- Optional: add teaser sections below when ready --- */}
      {/* Services Teaser */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "1:1 Ραντεβού", href: "/services/one-to-one" },
            { title: "Ομαδικές Συναντήσεις", href: "/services/group" },
            { title: "Σεμινάρια", href: "/seminars" },
          ].map((s) => (
            <a
              key={s.title}
              href={s.href}
              className="rounded-2xl bg-white/80 ring-1 ring-black/5 p-6 shadow-sm hover:shadow transition block"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600">
                Μάθετε περισσότερα για τον τρόπο που δουλεύουμε.
              </p>
            </a>
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
            <a
              href="/blog"
              className="text-sm font-medium text-[#7a7ac4] hover:opacity-90"
            >
              Δείτε όλα →
            </a>
          </div>
          {/* Replace with real posts */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                className="rounded-2xl bg-white ring-1 ring-black/5 p-5 shadow-sm"
              >
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 mb-4" />
                <h3 className="font-medium">
                  Τίτλος άρθρου #{i}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Σύντομη περιγραφή άρθρου για προεπισκόπηση.
                </p>
                <a
                  href="/blog/articles/sample"
                  className="mt-3 inline-block text-sm font-medium text-[#7a7ac4] hover:opacity-90"
                >
                  Διαβάστε περισσότερο →
                </a>
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
          <a
            href="/contact/book"
            className="mt-6 inline-flex items-center rounded-2xl bg-white px-6 py-3 text-[#7a7ac4] font-medium hover:opacity-90"
          >
            Ζητήστε ένα ραντεβού
          </a>
        </div>
      </section>
    </>
  );
}
