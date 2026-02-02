import Head from "next/head";
import Link from "next/link";

/**
 * MANAGEMENT — Dashboard (landing)
 * - Routed tabs via /management/[section]
 * - Minimal, clean, Greek UI matching your palette
 */

const TABS = [
  { key: "home", label: "ΑΡΧΙΚΗ", href: "/dashboard/home" },
  { key: "services", label: "ΥΠΗΡΕΣΙΕΣ", href: "/dashboard/services" },
  { key: "seminars", label: "ΣΕΜΙΝΑΡΙΑ", href: "/dashboard/seminars" },
  { key: "ebook", label: "EBOOK", href: "/dashboard/ebook" },
  { key: "blog", label: "BLOG", href: "/dashboard/blog" },
  { key: "contact", label: "ΕΠΙΚΟΙΝΩΝΙΑ", href: "/dashboard/contact" },
];

export default function ManagementDashboard() {
  return (
    <>
      <Head>
        <title>Διαχείριση | Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-[#fcfcfa] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <section className="mb-8">
            <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50 p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Καλωσήρθες στο Πίνακα Διαχείρισης
              </h1>
              <p className="mt-2 max-w-3xl leading-relaxed text-slate-600">
                Επίλεξε ενότητα για επεξεργασία περιεχομένου. Κάθε καρτέλα ανοίγει σε ξεχωριστή σελίδα.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {TABS.map(t => (
                  <Link
                    key={t.key}
                    href={t.href}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1] hover:text-[#2b2b6f] transition"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8484d1]" />
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>          
        </div>
      </div>
    </>
  );
}
