import Link from "next/link";

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
        {/* GRID: left text / right content */}
        <div className="grid items-start gap-8 md:grid-cols-12">
          {/* Left column */}
          <div className="md:col-span-6 lg:col-span-5 space-y-6">
            {/* Logo card */}
            <div className="inline-flex items-center justify-center rounded-2xl bg-white/80 ring-1 ring-[#7a7ac4]/20 shadow-sm p-4">
              <img
                src="https://img.freepik.com/premium-photo/diet-healthy-nutrition-portrait-dietitian-s_118454-1331.jpg"
                alt="Diet out of the Box — Διατροφή & Υγεία"
                className="h-auto w-auto"
              />
            </div>

            {/* Name & title */}
            <div className="pt-2">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Βασιλική Χύτα
              </h1>
              <p className="mt-1 text-xl sm:text-2xl text-slate-700">
                Διαιτολόγος-Διατροφολόγος
              </p>
            </div>

            {/* Short intro text */}
            <p className="max-w-prose text-[17px] leading-relaxed text-slate-700">
              Προσωποκεντρική καθοδήγηση διατροφής με έμφαση στην ευεξία, την
              εκπαίδευση και την ισορροπία, πέρα από στερεότυπα και «γρήγορες
              λύσεις».
            </p>

            {/* Primary CTA */}
            <div className="pt-2">
              <Link
                href="/contact/book"
                className="inline-flex items-center rounded-2xl bg-[#7a7ac4] px-6 py-3 text-white text-lg font-medium shadow hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7a7ac4]"
              >
                ΖΗΤΗΣΤΕ ΕΝΑ ΡΑΝΤΕΒΟΥ
              </Link>
            </div>
          </div>

          {/* Right column — Biography (stays here) */}
          <div className="md:col-span-6 md:col-start-7 lg:col-span-7">
            <article className="relative w-full rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] bg-white p-6 sm:p-8">
              <div className="prose prose-slate max-w-none">
                <h2 className="mb-3">ΦΙΛΟΣΟΦΙΑ</h2>
                <p>
                  Η φιλοσοφία μου στηρίζεται στο βιοψυχοκοινωνικό μοντέλο της
                  ιατρικής, μια προσέγγιση που αναγνωρίζει ότι η υγεία και η
                  διατροφή δεν καθορίζονται μόνο από βιολογικούς παράγοντες και
                  τα γονίδια, αλλά επηρεάζονται εξίσου από την ψυχολογία και το
                  κοινωνικό πλαίσιο του κάθε ανθρώπου.
                </p>
                <p>
                  Ως διαιτολόγος, βλέπω τη διατροφή όχι ως απομονωμένο σύνολο
                  κανόνων, αλλά ως καθρέφτη της σχέσης μας με το σώμα, τα
                  συναισθήματα και το περιβάλλον μας. Το πώς τρώμε, τι
                  επιλέγουμε, πότε σταματάμε - συχνά αποτυπώνει το πώς
                  σχετιζόμαστε με τον εαυτό μας και τον κόσμο γύρω μας.
                </p>
                <p>
                  Στις συνεδρίες δουλεύουμε ολιστικά και ανθρωποκεντρικά,
                  δίνοντας χώρο σε όλες τις πτυχές της εμπειρίας: το σώμα, τον
                  νου, τη συναισθηματική ζωή, τις συνήθειες και το πλαίσιο μέσα
                  στο οποίο εκδηλώνονται. Αντλώ στοιχεία από τη
                  γνωστική–συμπεριφορική θεραπεία (CBT), προσαρμόζοντάς τα στις
                  ανάγκες της διατροφικής παρέμβασης.
                </p>
                <p>
                  Στόχος δεν είναι η “τέλεια διατροφή”, αλλά «ο άνθρωπος στο
                  κέντρο της εμπειρίας» και η σύνδεση με το σώμα και τις ανάγκες
                  του με έναν τρόπο ήπιο και ρεαλιστικό. Μέσα από τη διαδικασία
                  αυτή, η διατροφή παύει να είναι πεδίο μάχης και ελέγχου και
                  γίνεται χώρος φροντίδας και αυτογνωσίας.
                </p>
                <p>
                  Αναλαμβάνω ενήλικες και εφήβους, που επιθυμούν να βελτιώσουν
                  τη σχέση τους με το φαγητό και το σώμα τους ή να υποστηρίξουν
                  τη συνολική τους υγεία μέσα από τη διατροφή. Συγκεκριμένα,
                  εργάζομαι σε:
                </p>
                <ul className="list-disc pl-6">
                  <li>
                    Διατροφικές διαταραχές (ψυχογενής βουλιμία, υπερφαγία,
                    ανορεξία, συναισθηματική κατανάλωση)
                  </li>
                  <li>Δυσκολίες στη ρύθμιση βάρους</li>
                  <li>
                    Σύνδρομο Πολυκυστικών Ωοθηκών (PCOS) και ορμονικές
                    διαταραχές
                  </li>
                  <li>
                    Διατροφή σε κάθε νόσο (σακχαρώδης διαβήτης, υπέρταση,
                    υπερλιπιδαιμία, πεπτικές διαταραχές κ.ά.)
                  </li>
                  <li>Εκπαίδευση στη συνειδητή και διαισθητική διατροφή</li>
                  <li>Αποκατάσταση μεταβολισμού και θρέψης</li>
                </ul>
              </div>

              {/* Subtle inner border */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />
            </article>
          </div>
        </div>

        {/* BELOW EVERYTHING — Philosophy full width */}
        <article className="mt-12 relative w-full rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] bg-white p-6 sm:p-8">
          <div className="prose prose-slate max-w-none">
            <h2 className="mb-3">ΒΙΟΓΡΑΦΙΚΟ</h2>
            <h3 className="mt-0">Σχετικά με εμένα</h3>
            <p>
              Ονομάζομαι Βασιλική Χύτα και είμαι Διαιτολόγος – Διατροφολόγος.
            </p>
            <p>
              Σπούδασα Διατροφή και Διαιτολογία στο Διεθνές Πανεπιστήμιο Ελλάδος
              και πραγματοποίησα την πρακτική μου άσκηση στο Ιπποκράτειο Γενικό
              Νοσοκομείο Θεσσαλονίκης, στο τμήμα Διατροφής του Ψυχιατρικού
              Τομέα, όπου είχα την ευκαιρία να συνεργαστώ με ανθρώπους που
              πάλευαν με διατροφικές διαταραχές.
            </p>
            <p>
              Η ερευνητική μου εργασία, με τίτλο «Σύνδρομο Πολυκυστικών Ωοθηκών:
              Διατροφικές συνήθειες και πιθανότητα εμφάνισης διατροφικών
              διαταραχών», παρουσιάστηκε στο 1ο Διεθνές Συνέδριο Διατροφής και
              Διαιτολογίας και αποτέλεσε μια σημαντική στιγμή στην διαδρομή μου
              στην έρευνα.
            </p>
            <p>
              Στη συνέχεια, εκπαιδεύτηκα στην «Τεκμηριωμένη Ιατρική
              Διατροφολογία» στην Ιατρική Σχολή του Αριστοτελείου Πανεπιστημίου
              Θεσσαλονίκης και παρακολούθησα πολυάριθμα σεμινάρια και
              μετεκπαιδεύσεις με επίκεντρο τις διατροφικές διαταραχές και τη
              σχέση ανθρώπου–τροφής.
            </p>
            <p>
              Μέχρι πρόσφατα διατηρούσα το ιδιωτικό μου γραφείο στο κέντρο της
              Θεσσαλονίκης, ενώ πλέον ζω στη Γαλλία και συνεργάζομαι διαδικτυακά
              με ανθρώπους από διάφορες χώρες. Παράλληλα, συντονίζω ομαδικές
              συναντήσεις και workshops σε συνεργασία με άλλες ειδικότητες, με
              θέμα το φαγητό, το σώμα και την ψυχολογία.
            </p>
            <p>
              Αυτό που με οδήγησε σε αυτό το μονοπάτι δεν ήταν μόνο η αγάπη μου
              για τη διατροφή, αλλά και η προσωπική μου εμπειρία με το φαγητό
              και το σώμα μου. Θέλησα να κατανοήσω σε βάθος τη σχέση μας με την
              τροφή, όχι μόνο διατροφικά, αλλά και συναισθηματικά. Αυτή η
              αναζήτηση έγινε ο δρόμος μου μέσα από τον οποίο προσπαθώ
              καθημερινά να συνοδεύω τους ανθρώπους στο ταξίδι τους στην
              διατροφική θεραπεία που αναζητούν.
            </p>
          </div>

          {/* Subtle inner border */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5" />
        </article>
      </div>
    </section>
  );
}
