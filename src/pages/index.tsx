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

      {/* ΒΙΟΓΡΑΦΙΚΟ (first, anchor target) */}
      <section
        id="bio"
        className="scroll-mt-28 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-8"
      >
        <div className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="m-0">ΒΙΟΓΡΑΦΙΚΟ</h2>
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-warm/60 to-warm/0" />
          </div>
          <h3 className="mt-3 text-warm">Σχετικά με εμένα</h3>

          <p className="lead">
            Ονομάζομαι <strong>Βασιλική Χύτα</strong> και είμαι Διαιτολόγος – Διατροφολόγος.
          </p>

          <p>
            Σπούδασα Διατροφή και Διαιτολογία στο Διεθνές Πανεπιστήμιο Ελλάδος και
            πραγματοποίησα την πρακτική μου άσκηση στο Ιπποκράτειο Γενικό Νοσοκομείο
            Θεσσαλονίκης, στο τμήμα Διατροφής του Ψυχιατρικού Τομέα, όπου είχα την
            ευκαιρία να συνεργαστώ με ανθρώπους που πάλευαν με διατροφικές διαταραχές.
          </p>

          <p>
            Η ερευνητική μου εργασία, με τίτλο «Σύνδρομο Πολυκυστικών Ωοθηκών:
            Διατροφικές συνήθειες και πιθανότητα εμφάνισης διατροφικών διαταραχών»,
            παρουσιάστηκε στο 1ο Διεθνές Συνέδριο Διατροφής και Διαιτολογίας και
            αποτέλεσε μια σημαντική στιγμή στην διαδρομή μου στην έρευνα.
          </p>

          <p>
            Στη συνέχεια, εκπαιδεύτηκα στην «Τεκμηριωμένη Ιατρική Διατροφολογία» στην
            Ιατρική Σχολή του Αριστοτελείου Πανεπιστημίου Θεσσαλονίκης και
            παρακολούθησα πολυάριθμα σεμινάρια και μετεκπαιδεύσεις με επίκεντρο τις
            διατροφικές διαταραχές και τη σχέση ανθρώπου–τροφής.
          </p>

          <p>
            Μέχρι πρόσφατα διατηρούσα το ιδιωτικό μου γραφείο στο κέντρο της
            Θεσσαλονίκης, ενώ πλέον ζω στη Γαλλία και συνεργάζομαι διαδικτυακά με
            ανθρώπους από διάφορες χώρες. Παράλληλα, συντονίζω ομαδικές συναντήσεις
            και workshops σε συνεργασία με άλλες ειδικότητες, με θέμα το φαγητό, το
            σώμα και την ψυχολογία.
          </p>

          <p>
            Αυτό που με οδήγησε σε αυτό το μονοπάτι δεν ήταν μόνο η αγάπη μου για τη
            διατροφή, αλλά και η προσωπική μου εμπειρία με το φαγητό και το σώμα μου.
            Θέλησα να κατανοήσω σε βάθος τη σχέση μας με την τροφή, όχι μόνο
            διατροφικά, αλλά και συναισθηματικά. Αυτή η αναζήτηση έγινε ο δρόμος μου
            μέσα από τον οποίο προσπαθώ καθημερινά να συνοδεύω τους ανθρώπους στο
            ταξίδι τους στην διατροφική θεραπεία που αναζητούν.
          </p>
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
        <div className="prose prose-slate max-w-none">
          <div className="flex items-center gap-3 mb-2">
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
            Στις συνεδρίες δουλεύουμε ολιστικά και ανθρωποκεντρικά, δίνοντας χώρο
            σε όλες τις πτυχές: σώμα, νου, συναισθηματική ζωή, συνήθειες και
            συνθήκες. Αντλώ στοιχεία από τη γνωστική–συμπεριφορική θεραπεία (CBT),
            προσαρμόζοντάς τα στη διατροφική παρέμβαση.
          </p>

          <p>
            Στόχος δεν είναι η “τέλεια διατροφή”, αλλά ο άνθρωπος στο κέντρο —
            η σύνδεση με το σώμα και τις ανάγκες του με τρόπο ήπιο και ρεαλιστικό,
            ώστε η διατροφή να γίνει χώρος φροντίδας και αυτογνωσίας.
          </p>

          <p>Αναλαμβάνω ενήλικες και εφήβους. Συγκεκριμένα, εργάζομαι σε:</p>

          <ul className="list-disc pl-6 md:columns-2 md:gap-10">
            <li>
              Διατροφικές διαταραχές (ψυχογενής βουλιμία, υπερφαγία, ανορεξία,
              συναισθηματική κατανάλωση)
            </li>
            <li>Δυσκολίες στη ρύθμιση βάρους</li>
            <li>Σύνδρομο Πολυκυστικών Ωοθηκών (PCOS) και ορμονικές διαταραχές</li>
            <li>
              Διατροφή σε κάθε νόσο (σακχαρώδης διαβήτης, υπέρταση, υπερλιπιδαιμία,
              πεπτικές διαταραχές κ.ά.)
            </li>
            <li>Εκπαίδευση στη συνειδητή και διαισθητική διατροφή</li>
            <li>Αποκατάσταση μεταβολισμού και θρέψης</li>
          </ul>
        </div>
      </section>

      {/* Blog Teaser */}
      <section className="bg-white/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Πρόσφατα από το Blog</h2>
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
                className={`rounded-2xl bg-white ${i === 1 ? 'ring-2 ring-warm/50 shadow-[0_10px_25px_rgba(255,230,150,0.12)]' : 'ring-1 ring-black/5 shadow-sm'} p-5`}
              >
                <div className={`aspect-[16/9] w-full overflow-hidden rounded-xl ${i === 1 ? 'bg-warm/10' : 'bg-slate-100'} mb-4 relative`}>
                  {i === 1 && (
                    <span className="absolute top-2 right-2 inline-flex items-center rounded-full bg-warm/70 px-2 py-1 text-xs font-medium text-slate-800">
                      ✨ Προτεινόμενο
                    </span>
                  )}
                </div>
                <h3 className="font-medium">{i === 1 ? 'Ενημερωμένο άρθρο' : `Τίτλος άρθρου #${i}`}</h3>
                <p className={`mt-2 text-sm ${i === 1 ? 'text-warm font-medium' : 'text-slate-600'}`}>
                  {i === 1 ? 'Προτεινόμενη ανάγνωση για εσάς.' : 'Σύντομη περιγραφή άρθρου για προεπισκόπηση.'}
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

      {/* Big CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="rounded-3xl bg-[#8484d1] text-white px-6 py-10 md:px-12 md:py-14 shadow">
          <h2 className="text-2xl md:text-3xl font-semibold">Έτοιμοι να ξεκινήσουμε;</h2>
          <p className="mt-2 max-w-2xl text-white/90">
            Κλείστε ραντεβού για την πρώτη μας συνάντηση — από κοντά ή online.
          </p>
          <Link
            href="/contact/book"
            className="mt-6 inline-flex items-center rounded-2xl bg-white px-6 py-3 text-[#8484d1] font-medium hover:opacity-90"
          >
            Ζητήστε ένα ραντεβού
          </Link>
        </div>
      </section>
    </>
  );
}