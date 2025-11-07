import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

/**
 * ΦΟΡΜΑ ΕΠΙΚΟΙΝΩΝΙΑΣ — Simple contact form
 * - Ελληνικό UI
 * - Mock "API" κλήση με delay
 * - Συνεπές στυλ με το site (ουδέτερο φόντο, κάρτες, διακριτικό accent)
 */

export default function ContactFormPage() {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);

  async function mockApi(payload: any) {
    await new Promise((r) => setTimeout(r, 800));
    if (Math.random() < 0.1) throw new Error("Σφάλμα αποστολής.");
    return { success: true };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());

    try {
      await mockApi(payload);
      setOk(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setOk(false);
      setError(err?.message || "Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Φόρμα Επικοινωνίας — Επικοινωνία</title>
        <meta
          name="description"
          content="Επικοινωνήστε μαζί μας για απορίες, διευκρινίσεις ή συνεργασία."
        />
        <link rel="canonical" href="https://example.gr/contact/form" />
      </Head>

      <section className="bg-[#F7F7EF]">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-slate-600">
            <Link href="/" className="hover:underline">Αρχική</Link>
            <span className="mx-2">/</span>
            <Link href="/contact" className="hover:underline">Επικοινωνία</Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-800">Φόρμα Επικοινωνίας</span>
          </nav>

          {/* Heading */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Φόρμα Επικοινωνίας
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700">
              Πείτε μας πώς μπορούμε να βοηθήσουμε. Απαντάμε συνήθως εντός 1–2 εργάσιμων.
            </p>
          </header>

          {/* Card */}
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <form
                onSubmit={onSubmit}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Ονοματεπώνυμο
                    </label>
                    <input
                      name="fullName"
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="π.χ. Νίκος Παπ."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Θέμα
                    </label>
                    <input
                      name="subject"
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Σύντομος τίτλος μηνύματος"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Μήνυμα
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Πείτε μας περισσότερα…"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-xl bg-[#7a7ac4] px-4 py-2 text-white disabled:opacity-60 hover:bg-[#6b6bb6] transition"
                  >
                    {loading ? "Αποστολή..." : "Αποστολή Μηνύματος"}
                  </button>
                  <Link href="/contact/book" className="text-[#7a7ac4] hover:underline">
                    Ή κλείστε ραντεβού →
                  </Link>
                </div>

                {/* Status */}
                <div className="mt-4 min-h-[1.5rem]">
                  {ok && (
                    <p className="text-sm text-emerald-700">
                      Το μήνυμα στάλθηκε! Θα επικοινωνήσουμε σύντομα.
                    </p>
                  )}
                  {ok === false && (
                    <p className="text-sm text-rose-600">
                      {error || "Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά."}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Side info */}
            <aside className="md:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                <h2 className="text-lg font-semibold text-slate-900">Στοιχεία Επικοινωνίας</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  <li>• Email: info@example.gr</li>
                  <li>• Τηλέφωνο: 2310 000000</li>
                  <li>• Δευ–Παρ 10:00–18:00</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
