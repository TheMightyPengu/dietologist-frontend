import Head from "next/head";
import Link from "next/link";
import HomeHero from "@/components/home/HomeHeader";
import { useEffect, useState } from "react";

type NewsletterStep = { title: string; desc: string };

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

  // ---- Design tokens (page-level consistency) ----
  const R_BIG = "rounded-3xl"; // large blocks
  const R_CARD = "rounded-2xl"; // cards
  const SH_CARD = "shadow-[0_14px_34px_rgba(15,23,42,0.08)]"; // soft
  const SH_CTA = "shadow-[0_18px_46px_rgba(122,122,196,0.26)]"; // stronger (primary CTA)
  const FOCUS =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  const [openNewsletter, setOpenNewsletter] = useState(false);
  const [nlStep, setNlStep] = useState<"form" | "verify" | "done">("form");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [nlForm, setNlForm] = useState({ name: "", email: "" });
  const [nlCode, setNlCode] = useState("");

  // Optional: close on Esc
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenNewsletter(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // dummy API helpers (inside component)
  async function apiNewsletterStart(payload: { name: string; email: string }) {
    await new Promise((r) => setTimeout(r, 650));
    // pretend success and that we sent a code
    return { ok: true };
  }
  async function apiNewsletterVerify(payload: { email: string; code: string }) {
    await new Promise((r) => setTimeout(r, 650));
    // for demo: accept 123456 only
    if (payload.code.trim() !== "123456")
      throw new Error("Λάθος κωδικός επιβεβαίωσης.");
    return { ok: true };
  }

  // when opening modal, reset flow
  function openNewsletterModal() {
    setOpenNewsletter(true);
    setNlStep("form");
    setNlLoading(false);
    setNlError(null);
    setNlForm({ name: "", email: "" });
    setNlCode("");
  }

  async function submitNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNlError(null);

    const name = nlForm.name.trim();
    const email = nlForm.email.trim();

    if (!name) return setNlError("Γράψε ονοματεπώνυμο.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setNlError("Γράψε έγκυρο email.");

    setNlLoading(true);
    try {
      await apiNewsletterStart({ name, email });
      setNlStep("verify");
    } catch {
      setNlError("Κάτι πήγε στραβά. Δοκίμασε ξανά.");
    } finally {
      setNlLoading(false);
    }
  }

  async function submitVerify(e: React.FormEvent) {
    e.preventDefault();
    setNlError(null);

    const email = nlForm.email.trim();
    const code = nlCode.trim();

    if (!code) return setNlError("Γράψε τον κωδικό επιβεβαίωσης.");

    setNlLoading(true);
    try {
      await apiNewsletterVerify({ email, code });
      setNlStep("done");
    } catch (err: any) {
      setNlError(err?.message || "Κάτι πήγε στραβά. Δοκίμασε ξανά.");
    } finally {
      setNlLoading(false);
    }
  }

  function closeNewsletterModal() {
    setOpenNewsletter(false);
  }

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

      {/* ΒΙΟΓΡΑΦΙΚΟ (first, anchor target) */}
      <section
        id="bio"
        className="scroll-mt-28 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-8"
      >
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          {/* Left: text */}
          <div className="md:col-span-7">
            <div className="prose prose-slate max-w-none leading-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="m-0">ΒΙΟΓΡΑΦΙΚΟ</h2>
                <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-warm/60 to-warm/0" />
              </div>

              <p className="lead">
                Ονομάζομαι <strong>Βασιλική Χύτα</strong> και είμαι Διαιτολόγος
                – Διατροφολόγος.
              </p>

              <p>
                Σπούδασα Διατροφή και Διαιτολογία στο Διεθνές Πανεπιστήμιο
                Ελλάδος και πραγματοποίησα την πρακτική μου άσκηση στο
                Ιπποκράτειο Γενικό Νοσοκομείο Θεσσαλονίκης, στο τμήμα Διατροφής
                του Ψυχιατρικού Τομέα, όπου είχα την ευκαιρία να συνεργαστώ με
                ανθρώπους που πάλευαν με διατροφικές διαταραχές.
              </p>

              <p>
                Η ερευνητική μου εργασία, με τίτλο «Σύνδρομο Πολυκυστικών
                Ωοθηκών: Διατροφικές συνήθειες και πιθανότητα εμφάνισης
                διατροφικών διαταραχών», παρουσιάστηκε στο 1ο Διεθνές Συνέδριο
                Διατροφής και Διαιτολογίας και αποτέλεσε μια σημαντική στιγμή
                στην διαδρομή μου στην έρευνα.
              </p>

              <p>
                Στη συνέχεια, εκπαιδεύτηκα στην «Τεκμηριωμένη Ιατρική
                Διατροφολογία» στην Ιατρική Σχολή του Αριστοτελείου
                Πανεπιστημίου Θεσσαλονίκης και παρακολούθησα πολυάριθμα
                σεμινάρια και μετεκπαιδεύσεις με επίκεντρο τις διατροφικές
                διαταραχές και τη σχέση ανθρώπου–τροφής.
              </p>

              <p>
                Μέχρι πρόσφατα διατηρούσα το ιδιωτικό μου γραφείο στο κέντρο της
                Θεσσαλονίκης, ενώ πλέον ζω στη Γαλλία και συνεργάζομαι
                διαδικτυακά με ανθρώπους από διάφορες χώρες. Παράλληλα,
                συντονίζω ομαδικές συναντήσεις και workshops σε συνεργασία με
                άλλες ειδικότητες, με θέμα το φαγητό, το σώμα και την ψυχολογία.
              </p>

              <p>
                Αυτό που με οδήγησε σε αυτό το μονοπάτι δεν ήταν μόνο η αγάπη
                μου για τη διατροφή, αλλά και η προσωπική μου εμπειρία με το
                φαγητό και το σώμα μου. Θέλησα να κατανοήσω σε βάθος τη σχέση
                μας με την τροφή, όχι μόνο διατροφικά, αλλά και συναισθηματικά.
                Αυτή η αναζήτηση έγινε ο δρόμος μου μέσα από τον οποίο προσπαθώ
                καθημερινά να συνοδεύω τους ανθρώπους στο ταξίδι τους στην
                διατροφική θεραπεία που αναζητούν.
              </p>
            </div>
          </div>

          {/* Right: image */}
          <div className="md:col-span-5">
            <div className="sticky top-28">
              <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-accent/25 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80"
                  alt="Βασιλική Χύτα — Διαιτολόγος"
                  className="h-auto w-full object-cover aspect-[4/5]"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* subtle warm accent divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-1">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-warm/60 to-transparent" />
      </div>

      {/* ΦΙΛΟΣΟΦΙΑ (after bio, with bullets preserved) */}
      <section
        id="philosophy"
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-12 md:pb-16"
      >
        <div className="prose prose-slate max-w-none leading-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="m-0">ΦΙΛΟΣΟΦΙΑ</h2>
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-warm/60 to-warm/0" />
          </div>

          <p className="lead">
            Η φιλοσοφία μου στηρίζεται στο <em>βιοψυχοκοινωνικό</em> μοντέλο της
            ιατρικής: η υγεία και η διατροφή διαμορφώνονται από το σώμα, τον νου
            και το περιβάλλον μας — όχι μόνο από τα γονίδια.
          </p>

          <p>
            Ως διαιτολόγος, βλέπω τη διατροφή όχι ως απομονωμένο σύνολο κανόνων,
            αλλά ως καθρέφτη της σχέσης μας με το σώμα, τα συναισθήματα και το
            πλαίσιο της καθημερινότητας. Το πώς τρώμε, τι επιλέγουμε, πότε
            σταματάμε, συχνά αποτυπώνει το πώς σχετιζόμαστε με τον εαυτό μας και
            τον κόσμο γύρω μας.
          </p>

          <p>
            Στις συνεδρίες δουλεύουμε ολιστικά και ανθρωποκεντρικά, δίνοντας
            χώρο σε όλες τις πτυχές: σώμα, νου, συναισθηματική ζωή, συνήθειες
            και συνθήκες. Αντλώ στοιχεία από τη γνωστική–συμπεριφορική θεραπεία
            (CBT), προσαρμόζοντάς τα στη διατροφική παρέμβαση.
          </p>

          <p>
            Στόχος δεν είναι η “τέλεια διατροφή”, αλλά ο άνθρωπος στο κέντρο — η
            σύνδεση με το σώμα και τις ανάγκες του με τρόπο ήπιο και ρεαλιστικό,
            ώστε η διατροφή να γίνει χώρος φροντίδας και αυτογνωσίας.
          </p>

          <p>Αναλαμβάνω ενήλικες και εφήβους. Συγκεκριμένα, εργάζομαι σε:</p>

          <ul className="list-disc pl-6 md:columns-2 md:gap-10">
            <li>
              Διατροφικές διαταραχές (ψυχογενής βουλιμία, υπερφαγία, ανορεξία,
              συναισθηματική κατανάλωση)
            </li>
            <li>Δυσκολίες στη ρύθμιση βάρους</li>
            <li>
              Σύνδρομο Πολυκυστικών Ωοθηκών (PCOS) και ορμονικές διαταραχές
            </li>
            <li>
              Διατροφή σε κάθε νόσο (σακχαρώδης διαβήτης, υπέρταση,
              υπερλιπιδαιμία, πεπτικές διαταραχές κ.ά.)
            </li>
            <li>Εκπαίδευση στη συνειδητή και διαισθητική διατροφή</li>
            <li>Αποκατάσταση μεταβολισμού και θρέψης</li>
          </ul>
        </div>
      </section>

      {/* 3 CARDS (below philosophy) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 pt-8 md:pt-12">
        <h3 className="text-center text-xl md:text-2xl font-semibold text-slate-900">
          Στο τέλος της συνεργασίας θα έχεις καταφέρει
        </h3>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
              alt: "Ηρεμία",
              label: "Ηρεμία",
              text: "Να νιώθεις πιο ήρεμα γύρω από το φαγητό και το σώμα σου.",
            },
            {
              img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
              alt: "Ισορροπία",
              label: "Ισορροπία",
              text: "Να τρέφεσαι ακούγοντας τις ανάγκες σου, χωρίς ενοχές και στέρηση.",
            },
            {
              img: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
              alt: "Σταθερότητα",
              label: "Σταθερότητα",
              text: "Να φροντίζεις το σώμα σου με πιο ουδέτερο και σταθερό τρόπο.",
            },
          ].map((c) => (
            <div
              key={c.alt}
              className={[
                "overflow-hidden bg-white/70 ring-1 ring-accent/20",
                R_BIG,
                SH_CARD,
              ].join(" ")}
            >
              {/* unified cropping (aspect + zoom) */}
              <div className="p-6 pb-0">
                <div
                  className={[
                    "overflow-hidden bg-white ring-1 ring-accent/15",
                    R_CARD,
                    SH_CARD,
                    "aspect-[4/3]",
                  ].join(" ")}
                >
                  <img
                    src={c.img}
                    alt={c.alt}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* label + benefit copy (bigger & more benefit-driven) */}
              <div className="px-6 py-6 text-center">
                <p className="m-0 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {c.label}
                </p>
                <p className="mt-2 mb-0 text-base sm:text-[17px] leading-7 font-medium text-slate-800">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="bg-bg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Πρόσφατα από το Blog
            </h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-[#8484d1] hover:opacity-90"
            >
              Δείτε όλα →
            </Link>
          </div>
          {/* Replace with real posts */}
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                className={`rounded-2xl bg-white ${i === 1 ? "ring-2 ring-warm/50 shadow-[0_10px_25px_rgba(255,230,150,0.12)]" : "ring-1 ring-black/5 shadow-sm"} p-5`}
              >
                <div
                  className={`aspect-[16/9] w-full overflow-hidden rounded-xl ${i === 1 ? "bg-warm/10" : "bg-slate-100"} mb-4 relative`}
                >
                  {i === 1 && (
                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-warm/70 px-2 py-1 text-xs font-medium text-slate-800">
                      ✨ Προτεινόμενο
                    </span>
                  )}
                </div>
                <h3 className="font-medium">
                  {i === 1 ? "Ενημερωμένο άρθρο" : `Τίτλος άρθρου #${i}`}
                </h3>
                <p
                  className={`mt-2 text-sm ${i === 1 ? "text-warm font-medium" : "text-slate-600"}`}
                >
                  {i === 1
                    ? "Προτεινόμενη ανάγνωση για εσάς."
                    : "Σύντομη περιγραφή άρθρου για προεπισκόπηση."}
                </p>
                <Link
                  href="/blog/articles/sample"
                  className="mt-3 inline-block text-sm font-medium navbar-link"
                >
                  Διαβάστε περισσότερα →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div
          className={[
            R_BIG,
            "bg-white",
            "ring-1 ring-accent/30",
            SH_CARD,
            // subtle premium pattern + slight gradient
            "bg-[radial-gradient(1200px_400px_at_20%_0%,rgba(164,199,126,0.18),transparent_60%),radial-gradient(900px_320px_at_90%_10%,rgba(122,122,196,0.14),transparent_55%)]",
            "px-6 py-10 md:px-12 md:py-12",
          ].join(" ")}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                Newsletter
              </h2>
              <p className="mt-2 text-slate-700 leading-7">
                Μικρά, πρακτικά tips για διατροφή, σχέση με το φαγητό και
                αυτοφροντίδα — απευθείας στο email σου.
              </p>

              {/* Trust line near CTA */}
              <p className="mt-2 text-sm font-medium text-slate-600">
                Χωρίς spam, διαγραφή όποτε θέλεις.
              </p>
            </div>

            {/* Inline email input + single primary CTA */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openNewsletterModal();
              }}
              className="w-full md:w-auto"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="sr-only" htmlFor="nlEmailInline">
                  Email
                </label>
                <input
                  id="nlEmailInline"
                  type="email"
                  value={nlForm.email}
                  onChange={(e) =>
                    setNlForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="π.χ. name@email.com"
                  className={[
                    "w-full sm:w-72",
                    R_CARD,
                    "px-4 py-3",
                    "bg-white/80 ring-1 ring-accent/25",
                    "text-slate-800 placeholder:text-slate-400",
                    "transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  ].join(" ")}
                />

                <button
                  type="submit"
                  className={[
                    "inline-flex items-center justify-center",
                    R_CARD,
                    "px-6 py-3 font-semibold text-white",
                    "bg-primary ring-1 ring-primary/20",
                    SH_CTA,
                    "hover:opacity-95 transition",
                    FOCUS,
                  ].join(" ")}
                >
                  Εγγραφή
                </button>

                {/* Secondary stays as link (optional) */}
                <Link
                  href="/contact/form"
                  className={[
                    "inline-flex items-center justify-center",
                    R_CARD,
                    "px-6 py-3 font-medium",
                    "bg-white/80 text-primary hover:text-accent",
                    "ring-1 ring-accent/35 hover:bg-accent/10",
                    "transition",
                    FOCUS,
                  ].join(" ")}
                >
                  Επικοινωνία
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter Modal */}
      {openNewsletter && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Newsletter"
        >
          {/* backdrop */}
          <button
            aria-label="Κλείσιμο"
            onClick={closeNewsletterModal}
            className="absolute inset-0 bg-black/40"
          />

          {/* panel */}
          <div className="relative mx-auto max-w-lg px-4 sm:px-6 top-24">
            <div
              className={[
                R_BIG,
                "bg-white ring-1 ring-accent/25",
                "shadow-[0_22px_70px_rgba(0,0,0,0.20)]",
                "overflow-hidden",
              ].join(" ")}
            >
              <div className="p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      {nlStep === "form"
                        ? "Εγγραφή στο Newsletter"
                        : nlStep === "verify"
                        ? "Επιβεβαίωση email"
                        : "Ολοκληρώθηκε"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">
                      {nlStep === "form"
                        ? "Συμπλήρωσε τα στοιχεία σου."
                        : nlStep === "verify"
                        ? "Βάλε τον κωδικό επιβεβαίωσης που σου στείλαμε."
                        : "Η εγγραφή σου έγινε με επιτυχία."}
                    </p>
                  </div>

                  <button
                    onClick={closeNewsletterModal}
                    className={[
                      "rounded-full bg-white px-3 py-1.5 text-sm font-medium",
                      "ring-1 ring-slate-200 hover:ring-slate-300 transition",
                      FOCUS,
                    ].join(" ")}
                  >
                    Κλείσιμο
                  </button>
                </div>

                {nlError && (
                  <div className="mt-4 rounded-2xl bg-white ring-1 ring-rose-200 px-4 py-3 text-sm text-rose-700">
                    {nlError}
                  </div>
                )}

                {/* Step 1: form */}
                {nlStep === "form" && (
                  <form onSubmit={submitNewsletter} className="mt-5 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Ονοματεπώνυμο
                      </label>
                      <input
                        value={nlForm.name}
                        onChange={(e) =>
                          setNlForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className={[
                          "mt-1 w-full",
                          R_CARD,
                          "px-4 py-3 transition",
                          "bg-white ring-1 ring-accent/25 hover:bg-accent/10",
                          "text-slate-800",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        ].join(" ")}
                        placeholder="π.χ. Μαρία Παπαδοπούλου"
                        autoComplete="name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={nlForm.email}
                        onChange={(e) =>
                          setNlForm((p) => ({ ...p, email: e.target.value }))
                        }
                        className={[
                          "mt-1 w-full",
                          R_CARD,
                          "px-4 py-3 transition",
                          "bg-white ring-1 ring-accent/25 hover:bg-accent/10",
                          "text-slate-800",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        ].join(" ")}
                        placeholder="π.χ. name@email.com"
                        autoComplete="email"
                      />
                    </div>

                    <div className="mt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={nlLoading}
                        className={[
                          "inline-flex items-center justify-center",
                          R_CARD,
                          "px-5 py-3 font-semibold transition",
                          "bg-primary text-white ring-1 ring-primary/20",
                          nlLoading
                            ? "opacity-70 cursor-wait"
                            : SH_CTA + " hover:opacity-95",
                          FOCUS,
                        ].join(" ")}
                      >
                        {nlLoading ? "Αποστολή…" : "Συνέχεια"}
                      </button>

                      <button
                        type="button"
                        onClick={closeNewsletterModal}
                        className={[
                          "inline-flex items-center justify-center",
                          R_CARD,
                          "px-5 py-3 font-medium transition",
                          "bg-white text-primary hover:text-accent",
                          "ring-1 ring-accent/35 hover:bg-accent/10",
                          FOCUS,
                        ].join(" ")}
                      >
                        Άκυρο
                      </button>
                    </div>

                    <p className="text-xs text-slate-500">
                      Demo: στο επόμενο βήμα βάλε κωδικό{" "}
                      <span className="font-semibold">123456</span>.
                    </p>
                  </form>
                )}

                {/* Step 2: verify */}
                {nlStep === "verify" && (
                  <form onSubmit={submitVerify} className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 text-sm text-slate-700">
                      Στείλαμε κωδικό επιβεβαίωσης στο{" "}
                      <span className="font-semibold">{nlForm.email}</span>.
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Κωδικός επιβεβαίωσης
                      </label>
                      <input
                        inputMode="numeric"
                        value={nlCode}
                        onChange={(e) => setNlCode(e.target.value)}
                        className={[
                          "mt-1 w-full",
                          R_CARD,
                          "px-4 py-3 transition",
                          "bg-white ring-1 ring-accent/25 hover:bg-accent/10",
                          "text-slate-800",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        ].join(" ")}
                        placeholder="π.χ. 123456"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="submit"
                        disabled={nlLoading}
                        className={[
                          "inline-flex items-center justify-center",
                          R_CARD,
                          "px-5 py-3 font-semibold transition",
                          "bg-primary text-white ring-1 ring-primary/20",
                          nlLoading
                            ? "opacity-70 cursor-wait"
                            : SH_CTA + " hover:opacity-95",
                          FOCUS,
                        ].join(" ")}
                      >
                        {nlLoading ? "Επιβεβαίωση…" : "Ολοκλήρωση εγγραφής"}
                      </button>

                      <button
                        type="button"
                        disabled={nlLoading}
                        onClick={() => {
                          setNlError(null);
                          setNlStep("form");
                          setNlCode("");
                        }}
                        className={[
                          "inline-flex items-center justify-center",
                          R_CARD,
                          "px-5 py-3 font-medium transition",
                          "bg-white text-primary hover:text-accent",
                          "ring-1 ring-accent/35 hover:bg-accent/10",
                          FOCUS,
                        ].join(" ")}
                      >
                        Πίσω
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={nlLoading}
                      onClick={async () => {
                        setNlLoading(true);
                        setNlError(null);
                        try {
                          await apiNewsletterStart({
                            name: nlForm.name.trim(),
                            email: nlForm.email.trim(),
                          });
                        } catch {
                          setNlError("Δεν έγινε επαναποστολή. Δοκίμασε ξανά.");
                        } finally {
                          setNlLoading(false);
                        }
                      }}
                      className={[
                        "text-sm font-medium text-primary hover:text-accent transition-colors",
                        FOCUS,
                        "rounded-md px-1 py-1 w-fit",
                      ].join(" ")}
                    >
                      Επαναποστολή κωδικού
                    </button>
                  </form>
                )}

                {/* Step 3: done */}
                {nlStep === "done" && (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 text-sm text-slate-700">
                      Τέλεια! Θα λαμβάνεις ενημερώσεις στο{" "}
                      <span className="font-semibold">{nlForm.email}</span>.
                    </div>

                    <button
                      type="button"
                      onClick={closeNewsletterModal}
                      className={[
                        "w-full inline-flex items-center justify-center",
                        R_CARD,
                        "px-5 py-3 font-semibold transition",
                        "bg-primary text-white ring-1 ring-primary/20",
                        SH_CTA + " hover:opacity-95",
                        FOCUS,
                      ].join(" ")}
                    >
                      Έτοιμο
                    </button>

                    <p className="text-xs text-slate-500">
                      Με την εγγραφή συμφωνείτε να λαμβάνετε ενημερωτικά emails.
                      Δεν μοιραζόμαστε τα στοιχεία σας.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}