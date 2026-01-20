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

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-slate-600">
            <Link
              href="/"
              className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
            >
              Αρχική
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/contact"
              className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
            >
              Επικοινωνία
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-800">Φόρμα Επικοινωνίας</span>
          </nav>

          {/* Heading */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Φόρμα Επικοινωνίας</h1>
            <p className="mt-2 max-w-2xl text-slate-700">
              Πείτε μας πώς μπορούμε να βοηθήσουμε. Απαντάμε συνήθως εντός 1–2 εργάσιμων.
            </p>
          </header>

          {/* Card */}
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <form
                onSubmit={onSubmit}
                className="rounded-2xl bg-white p-6 shadow-[0_14px_30px_rgba(164,199,126,0.10)] ring-1 ring-accent/25"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Ονοματεπώνυμο</label>
                    <input
                      name="fullName"
                      required
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="π.χ. Νίκος Παπ."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="name@email.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Θέμα</label>
                    <input
                      name="subject"
                      required
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="Σύντομος τίτλος μηνύματος"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Μήνυμα</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="Πείτε μας περισσότερα…"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-white disabled:opacity-60 transition hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  >
                    {loading ? "Αποστολή..." : "Αποστολή Μηνύματος"}
                  </button>
                  <Link
                    href="/contact/book"
                    className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
                  >
                    Ή κλείστε ραντεβού →
                  </Link>
                </div>

                {/* Status */}
                <div className="mt-2 min-h-[1.5rem]">
                  {ok && (
                    <p className="text-sm text-primary">
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
              <div className="rounded-2xl bg-white p-6 shadow-[0_14px_30px_rgba(164,199,126,0.10)] ring-1 ring-accent/25">
                <h2 className="text-lg font-semibold text-slate-900">Στοιχεία Επικοινωνίας</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 marker:text-accent/80 list-disc pl-5">
                  <li>Email: info@example.gr</li>
                  <li>Τηλέφωνο: 2310 000000</li>
                  <li>Δευ–Παρ 10:00–18:00</li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
