import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import HomeHero from "@/components/home/HomeHeader";
import { useEffect, useState } from "react";
import { SectionReveal } from "@/components/SectionReveal";
import {
  MainPagesApi,
  type MainPageGetDto,
} from "@/api/MainPagesController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import LeafBurstButton from "@/components/decorative/LeafBurstButton";

import { NewsletterSubscribersApi } from "@/api/NewsletterSubscribersController";

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

  const R_BIG = "rounded-3xl";
  const R_CARD = "rounded-2xl";
  const SH_CARD = "shadow-[0_14px_34px_rgba(15,23,42,0.08)]";
  const SH_CTA = "shadow-[0_18px_46px_rgba(122,122,196,0.26)]";
  const FOCUS =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  const [openNewsletter, setOpenNewsletter] = useState(false);
  const [nlStep, setNlStep] = useState<"form" | "done">("form");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlError, setNlError] = useState<string | null>(null);
  const [nlForm, setNlForm] = useState({ name: "", email: "" });

  const [mainPage, setMainPage] = useState<MainPageGetDto | null>(null);
  const [mainPageLoading, setMainPageLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadMainPage() {
      try {
        setMainPageLoading(true);

        const pages = await MainPagesApi.list();
        const firstPage = pages?.[0] ?? null;

        if (!active) return;

        setMainPage(firstPage);
      } catch {
        if (!active) return;
        setMainPage(null);
      } finally {
        if (active) setMainPageLoading(false);
      }
    }

    loadMainPage();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenNewsletter(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function openNewsletterModal() {
    setOpenNewsletter(true);
    setNlStep("form");
    setNlLoading(false);
    setNlError(null);
    setNlForm({ name: "", email: "" });
  }

  async function submitNewsletter(e: React.FormEvent) {
    e.preventDefault();
    setNlError(null);

    const fullName = nlForm.name.trim();
    const email = nlForm.email.trim();

    if (!fullName) return setNlError("Γράψε ονοματεπώνυμο.");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setNlError("Γράψε έγκυρο email.");
    }

    setNlLoading(true);

    try {
      await NewsletterSubscribersApi.subscribe({
        fullName,
        email,
      });

      setNlStep("done");
    } catch {
      setNlError("Δεν ήταν δυνατή η εγγραφή. Δοκίμασε ξανά.");
    } finally {
      setNlLoading(false);
    }
  }

  async function submitVerify(e: React.FormEvent) {
    e.preventDefault();
    setNlError(null);

    const email = nlForm.email.trim();


    setNlLoading(true);

    try {
      setNlStep("done");
    } catch (err: unknown) {
      setNlError(
        err instanceof Error ? err.message : "Κάτι πήγε στραβά. Δοκίμασε ξανά."
      );
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
        <title>{`Αρχική — ${siteName}`}</title>
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

      <HomeHero
        title={mainPage?.title}
        info={mainPage?.info}
        mainPictureUrl={mainPage?.mainPictureUrl}
        loading={mainPageLoading}
      />

      <SectionReveal
        className="scroll-mt-28 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-8"
        id="bio"
      >
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <div className="md:col-span-7">
            <div className="prose prose-slate max-w-none leading-8 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="m-0">ΒΙΟΓΡΑΦΙΚΟ</h2>
                <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-warm/60 to-warm/0" />
              </div>

              {mainPage?.biography ? (
                <RichHtmlRenderer
                  html={mainPage.biography}
                  className="home-rich-content"
                />
              ) : (
                <>
                  <p className="lead">
                    Ονομάζομαι <strong>Βασιλική Χύτα</strong> και είμαι
                    Διαιτολόγος – Διατροφολόγος.
                  </p>

                  <p>
                    Σπούδασα Διατροφή και Διαιτολογία στο Διεθνές Πανεπιστήμιο
                    Ελλάδος και πραγματοποίησα την πρακτική μου άσκηση στο
                    Ιπποκράτειο Γενικό Νοσοκομείο Θεσσαλονίκης, στο τμήμα
                    Διατροφής του Ψυχιατρικού Τομέα, όπου είχα την ευκαιρία να
                    συνεργαστώ με ανθρώπους που πάλευαν με διατροφικές
                    διαταραχές.
                  </p>

                  <p>
                    Η ερευνητική μου εργασία, με τίτλο «Σύνδρομο Πολυκυστικών
                    Ωοθηκών: Διατροφικές συνήθειες και πιθανότητα εμφάνισης
                    διατροφικών διαταραχών», παρουσιάστηκε στο 1ο Διεθνές
                    Συνέδριο Διατροφής και Διαιτολογίας και αποτέλεσε μια
                    σημαντική στιγμή στην διαδρομή μου στην έρευνα.
                  </p>

                  <p>
                    Στη συνέχεια, εκπαιδεύτηκα στην «Τεκμηριωμένη Ιατρική
                    Διατροφολογία» στην Ιατρική Σχολή του Αριστοτελείου
                    Πανεπιστημίου Θεσσαλονίκης και παρακολούθησα πολυάριθμα
                    σεμινάρια και μετεκπαιδεύσεις με επίκεντρο τις διατροφικές
                    διαταραχές και τη σχέση ανθρώπου–τροφής.
                  </p>

                  <p>
                    Μέχρι πρόσφατα διατηρούσα το ιδιωτικό μου γραφείο στο κέντρο
                    της Θεσσαλονίκης, ενώ πλέον ζω στη Γαλλία και συνεργάζομαι
                    διαδικτυακά με ανθρώπους από διάφορες χώρες. Παράλληλα,
                    συντονίζω ομαδικές συναντήσεις και workshops σε συνεργασία
                    με άλλες ειδικότητες, με θέμα το φαγητό, το σώμα και την
                    ψυχολογία.
                  </p>

                  <p>
                    Αυτό που με οδήγησε σε αυτό το μονοπάτι δεν ήταν μόνο η
                    αγάπη μου για τη διατροφή, αλλά και η προσωπική μου εμπειρία
                    με το φαγητό και το σώμα μου. Θέλησα να κατανοήσω σε βάθος
                    τη σχέση μας με την τροφή, όχι μόνο διατροφικά, αλλά και
                    συναισθηματικά. Αυτή η αναζήτηση έγινε ο δρόμος μου μέσα από
                    τον οποίο προσπαθώ καθημερινά να συνοδεύω τους ανθρώπους στο
                    ταξίδι τους στην διατροφική θεραπεία που αναζητούν.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="sticky top-28">
              <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-accent/25 shadow-sm">
                <Image
                  src={
                    mainPage?.mainPictureUrl?.trim() ||
                    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt="Βασιλική Χύτα — Διαιτολόγος"
                  width={900}
                  height={1125}
                  className="h-auto w-full object-cover aspect-[4/5]"
                />
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-1">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-warm/60 to-transparent" />
      </div>

      <SectionReveal
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-12 md:pb-16"
        id="philosophy"
      >
        <div className="prose prose-slate max-w-none leading-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="m-0">ΦΙΛΟΣΟΦΙΑ</h2>
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-warm/60 to-warm/0" />
          </div>

          {mainPage?.phylosophy ? (
            <RichHtmlRenderer
              html={mainPage.phylosophy}
              className="home-rich-content"
            />
          ) : (
            <>
              <p className="lead">
                Η φιλοσοφία μου στηρίζεται στο <em>βιοψυχοκοινωνικό</em> μοντέλο
                της ιατρικής: η υγεία και η διατροφή διαμορφώνονται από το σώμα,
                τον νου και το περιβάλλον μας — όχι μόνο από τα γονίδια.
              </p>

              <p>
                Ως διαιτολόγος, βλέπω τη διατροφή όχι ως απομονωμένο σύνολο
                κανόνων, αλλά ως καθρέφτη της σχέσης μας με το σώμα, τα
                συναισθήματα και το πλαίσιο της καθημερινότητας. Το πώς τρώμε,
                τι επιλέγουμε, πότε σταματάμε, συχνά αποτυπώνει το πώς
                σχετιζόμαστε με τον εαυτό μας και τον κόσμο γύρω μας.
              </p>

              <p>
                Στις συνεδρίες δουλεύουμε ολιστικά και ανθρωποκεντρικά, δίνοντας
                χώρο σε όλες τις πτυχές: σώμα, νου, συναισθηματική ζωή,
                συνήθειες και συνθήκες. Αντλώ στοιχεία από τη γνωστική–
                συμπεριφορική θεραπεία CBT, προσαρμόζοντάς τα στη διατροφική
                παρέμβαση.
              </p>

              <p>
                Στόχος δεν είναι η “τέλεια διατροφή”, αλλά ο άνθρωπος στο κέντρο
                — η σύνδεση με το σώμα και τις ανάγκες του με τρόπο ήπιο και
                ρεαλιστικό, ώστε η διατροφή να γίνει χώρος φροντίδας και
                αυτογνωσίας.
              </p>

              <p>Αναλαμβάνω ενήλικες και εφήβους. Συγκεκριμένα, εργάζομαι σε:</p>

              <ul className="list-disc pl-6 md:columns-2 md:gap-10">
                <li>
                  Διατροφικές διαταραχές ψυχογενής βουλιμία, υπερφαγία,
                  ανορεξία, συναισθηματική κατανάλωση
                </li>
                <li>Δυσκολίες στη ρύθμιση βάρους</li>
                <li>
                  Σύνδρομο Πολυκυστικών Ωοθηκών PCOS και ορμονικές διαταραχές
                </li>
                <li>
                  Διατροφή σε κάθε νόσο σακχαρώδης διαβήτης, υπέρταση,
                  υπερλιπιδαιμία, πεπτικές διαταραχές κ.ά.
                </li>
                <li>Εκπαίδευση στη συνειδητή και διαισθητική διατροφή</li>
                <li>Αποκατάσταση μεταβολισμού και θρέψης</li>
              </ul>
            </>
          )}
        </div>
      </SectionReveal>

      <SectionReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 md:pb-16 pt-8 md:pt-12">
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
              <div className="p-6 pb-0">
                <div
                  className={[
                    "overflow-hidden bg-white ring-1 ring-accent/15",
                    R_CARD,
                    SH_CARD,
                    "aspect-[4/3]",
                  ].join(" ")}
                >
                  <Image
                    src={c.img}
                    alt={c.alt}
                    width={1200}
                    height={900}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              </div>

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
      </SectionReveal>

      <SectionReveal className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div
          className={[
            R_BIG,
            "bg-white",
            "ring-1 ring-accent/30",
            SH_CARD,
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

              <p className="mt-2 text-sm font-medium text-slate-600">
                Χωρίς spam, διαγραφή όποτε θέλεις.
              </p>
            </div>

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
      </SectionReveal>

      {openNewsletter && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Newsletter"
        >
          <button
            aria-label="Κλείσιμο"
            onClick={closeNewsletterModal}
            className="absolute inset-0 bg-black/40"
          />

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
                      {nlStep === "form" ? "Εγγραφή στο Newsletter" : "Η εγγραφή ολοκληρώθηκε"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-700">
                      {nlStep === "form"
                        ? "Συμπλήρωσε τα στοιχεία σου για να λαμβάνεις ενημερώσεις."
                        : "Ευχαριστούμε για την εγγραφή σου στο newsletter."}
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
                        {nlLoading ? "Εγγραφή…" : "Εγγραφή"}
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
                  </form>
                )}

                {nlStep === "done" && (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 text-sm text-slate-700">
                      Τέλεια! Θα λαμβάνεις ενημερώσεις στο{" "}
                      <span className="font-semibold">{nlForm.email}</span>.
                    </div>

                    <LeafBurstButton
                      text="Τέλος"
                      onClick={closeNewsletterModal}
                      buttonClassName={[
                        "w-full inline-flex items-center justify-center",
                        R_CARD,
                        "px-5 py-3 font-semibold transition",
                        "bg-primary text-white ring-1 ring-primary/20",
                        SH_CTA + " hover:opacity-95",
                        FOCUS,
                      ].join(" ")}
                    />

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