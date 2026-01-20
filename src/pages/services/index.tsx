import Head from "next/head";
import Link from "next/link";

type PillProps = { children: React.ReactNode };
const Pill = ({ children }: PillProps) => (
  <span
    className={[
      // bg must be white only
      "inline-flex items-center rounded-full bg-white",
      // stronger green presence: border + soft inner tint + gentle shadow
      "ring-1 ring-accent/40",
      "shadow-[0_1px_0_rgba(164,199,126,0.25)]",
      // readable text
      "px-3 py-1 text-sm leading-none text-slate-800",
    ].join(" ")}
  >
    {children}
  </span>
);

const SectionCard: React.FC<
  React.PropsWithChildren<{ title: React.ReactNode; id?: string }>
> = ({ title, id, children }) => (
  <section id={id} className="scroll-mt-28">
    <div
      className={[
        // bg must be white only
        "rounded-3xl bg-white",
        // more green tint via ring + subtle accent shadow
        "ring-1 ring-accent/25",
        "shadow-sm",
        "shadow-[0_10px_25px_rgba(164,199,126,0.10)]",
        "p-6 sm:p-8 lg:p-10",
      ].join(" ")}
    >
      {/* tiny green divider under title for “more green” without changing bg */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <span className="hidden sm:inline-block h-px w-16 bg-accent/40" />
      </div>

      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-700">
        {children}
      </div>
    </div>
  </section>
);

export default function ServicesPage() {
  const siteName = "Διαιτολογικό Κέντρο";

  return (
    <>
      <Head>
        <title>Υπηρεσίες — {siteName}</title>
        <meta
          name="description"
          content="Όλες οι υπηρεσίες διατροφής: ατομικές συνεδρίες, ομάδες, διαισθητική διατροφή, mindful eating και προγράμματα εκπαίδευσης."
        />
        <link rel="canonical" href="https://your-domain.gr/services" />
      </Head>

      {/* Hero / Intro */}
      <div className="relative">
        <img
          src="/decor/vine.png"
          alt=""
          aria-hidden="true"
          className="hidden md:block pointer-events-none select-none absolute -top-6 right-0 w-40 opacity-90"
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Υπηρεσίες Διατροφής
            </h1>

            {/* green micro-accent line under intro */}
            <div className="mt-2 h-px w-24 bg-accent/35" />

            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
              Σε αυτή τη σελίδα θα βρείτε συγκεντρωμένες όλες τις υπηρεσίες που
              προσφέρονται, τόσο στο γραφείο στο κέντρο της Θεσσαλονίκης όσο και
              διαδικτυακά. Κάθε συνάντηση έχει σχεδιαστεί με γνώμονα την
              εξατομίκευση και την υποστήριξη της προσωπικής σας πορείας.
            </p>
          </header>

          {/* Quick anchor pills */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="#one-to-one"
              className={[
                "rounded-full focus:outline-none",
                "focus-visible:ring-4 focus-visible:ring-primary/20",
                // more green on hover without changing bg away from white
                "hover:shadow-[0_10px_25px_rgba(164,199,126,0.12)] transition",
              ].join(" ")}
            >
              <Pill>Ατομικές συνεδρίες (1:1)</Pill>
            </Link>

            <Link
              href="#groups"
              className={[
                "rounded-full focus:outline-none",
                "focus-visible:ring-4 focus-visible:ring-primary/20",
                "hover:shadow-[0_10px_25px_rgba(164,199,126,0.12)] transition",
              ].join(" ")}
            >
              <Pill>Ομαδικές συνεδρίες</Pill>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {/* Contact stripe */}
        <div
          className={[
            "rounded-3xl bg-white",
            // more green “tint” via stronger ring + soft glow shadow
            "ring-1 ring-accent/25",
            "shadow-sm shadow-[0_12px_28px_rgba(164,199,126,0.10)]",
            "p-6 sm:p-8",
          ].join(" ")}
        >
          <p className="text-[15px] leading-relaxed text-slate-700">
            Για να δεσμεύσετε ραντεβού, μπορείτε να επικοινωνήσετε μαζί μας μέσω
            email, εκδηλώνοντας το ενδιαφέρον σας για την αντίστοιχη συνεδρία.
            Επιλέξτε εκείνη που ανταποκρίνεται καλύτερα στις ανάγκες σας.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-700">
            <div className="inline-flex items-center gap-2">
              <span className="text-accent">📍</span>
              <span className="rounded-md px-2 py-1 ring-1 ring-accent/25">
                Πτολεμαίων 11, ΤΚ: 54630
              </span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-accent">📞</span>
              <span className="rounded-md px-2 py-1 ring-1 ring-accent/25">
                2311 219576
              </span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="text-accent">✉️</span>
              <span className="rounded-md px-2 py-1 ring-1 ring-accent/25">
                info@your-domain.gr
              </span>
            </div>
          </div>
        </div>

        {/* ============ ONE-TO-ONE ============ */}
        <div id="one-to-one" className="space-y-12 scroll-mt-28">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Ατομικές συνεδρίες (1:1)
            </h2>
            <span className="h-px w-16 bg-accent/35" />
          </div>

          <SectionCard title="Συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης">
            <ol className="list-decimal pl-5 space-y-2 marker:text-accent/80">
              <li>
                <strong>Ανάλυση σύστασης σώματος (λιπομέτρηση)</strong>: αν
                επιθυμείτε, ξεκινάμε με ολοκληρωμένη εικόνα του σώματος (λίπος,
                μυϊκή μάζα, υγρά).
              </li>
              <li>
                <strong>Ιατρικό και φαρμακευτικό ιστορικό</strong>: συζητάμε
                παθήσεις, φάρμακα ή πρόσφατες εξετάσεις.
              </li>
              <li>
                <strong>Ιστορικό σωματικού βάρους</strong>: εξερευνούμε την
                πορεία σας μέχρι σήμερα με στοιχεία από τη Γνωστική-Συμπεριφορική
                προσέγγιση.
              </li>
              <li>
                <strong>Διατροφικό ιστορικό & καθημερινότητα</strong>: συνήθειες,
                προτιμήσεις, ρυθμοί ημέρας.
              </li>
              <li>
                <strong>Καθορισμός στόχων</strong>: μικρά εφαρμόσιμα βήματα για
                σταδιακή και βιώσιμη αλλαγή.
              </li>
              <li>
                <strong>Σχεδιασμός εξατομικευμένου προγράμματος</strong>:
                υλικό/ιδέες για γεύματα, συνταγές, ασκήσεις για το σπίτι.
              </li>
              <li>
                <strong>Επόμενες συνεδρίες</strong> κάθε 1–2 εβδομάδες: (α) όπου
                θέλετε, λιπομέτρηση & αξιολόγηση στόχων, (β) συζήτηση δυσκολιών,
                (γ) αναπροσαρμογές, (δ) διατροφική εκπαίδευση.
              </li>
            </ol>

            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Διάρκεια 1ης συνάντησης: 60’</Pill>
              <Pill>Κόστος 1ης συνάντησης: 50€ (με ΦΠΑ)</Pill>
              <Pill>Επόμενες συναντήσεις: 45’</Pill>
              <Pill>Κόστος επόμενων: 40€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>

          <SectionCard title="Συνεδρίες εστιασμένες στις διατροφικές διαταραχές">
            <ol className="list-decimal pl-5 space-y-2 marker:text-accent/80">
              <li>
                <strong>Αρχική εκτίμηση</strong> της τρέχουσας κατάστασης. Ζύγιση
                ή λιπομέτρηση μόνο αν κριθεί βοηθητική, με έμφαση στη σχέση με το
                σώμα και όχι στους αριθμούς.
              </li>
              <li>
                <strong>Ιατρικό/φαρμακευτικό ιστορικό</strong> για ασφάλεια και
                σωματική φροντίδα.
              </li>
              <li>
                <strong>Ιστορικό βάρους & σχέσης με το φαγητό</strong> με
                στοιχεία CBT και προσεγγίσεις trauma-informed.
              </li>
              <li>
                <strong>Στόχοι και προτεραιότητες</strong> ποιοτικού τύπου:
                ενίσχυση σύνδεσης με το σώμα, μείωση περιοριστικών/υπερφαγικών
                κύκλων, βελτίωση διαχείρισης σκέψεων γύρω από το φαγητό.
              </li>
              <li>
                <strong>Εργαλεία & υλικό</strong>: ασκήσεις ενσυνειδητότητας,
                παρατήρησης σκέψεων, οδηγίες για ισορροπημένα γεύματα.
              </li>
              <li>
                <strong>Επόμενες συνεδρίες</strong> ανά 1–2 εβδομάδες: αξιολόγηση
                προόδου, επεξεργασία σκέψεων/συναισθημάτων, εκπαίδευση με έμφαση
                στη σχέση με το σώμα.
              </li>
            </ol>

            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Διάρκεια 1ης συνάντησης: 60’</Pill>
              <Pill>Κόστος 1ης συνάντησης: 50€ (με ΦΠΑ)</Pill>
              <Pill>Επόμενες συναντήσεις: 45’</Pill>
              <Pill>Κόστος επόμενων: 40€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>

          <SectionCard title="Συνεδρίες διαισθητικής διατροφής & mindful eating">
            <ol className="list-decimal pl-5 space-y-2 marker:text-accent/80">
              <li>
                <strong>Σύνδεση με το σώμα</strong> χωρίς απαραίτητα ζύγιση/
                λιπομέτρηση, με πρακτικές παρατήρησης σημάτων πείνας-κορεσμού.
              </li>
              <li>
                <strong>Ιατρικό & προσωπικό ιστορικό</strong> και εμπειρίες από
                «δίαιτες».
              </li>
              <li>
                <strong>Εξερεύνηση σχέσης με το φαγητό</strong> και μοτίβων
                σκέψης/συναισθήματος.
              </li>
              <li>
                <strong>Ολιστική καθημερινότητα</strong>: ύπνος, κίνηση, στρες,
                συναισθηματική ευεξία.
              </li>
              <li>
                <strong>Θέσπιση ποιοτικών στόχων</strong> (π.χ. μείωση ενοχής,
                ενίσχυση φροντίδας).
              </li>
              <li>
                <strong>Υλικό & ασκήσεις</strong>: mindfulness & mindful eating,
                πρακτικές αυτοφροντίδας, ιδέες γευμάτων, εργαλεία επικοινωνίας με
                τον εαυτό.
              </li>
              <li>
                <strong>Επόμενες συνεδρίες</strong>: συζήτηση εμπειριών,
                αναγνώριση εμποδίων, σταδιακή ενσωμάτωση νέων συνηθειών.
              </li>
            </ol>

            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Διάρκεια 1ης συνάντησης: 60’</Pill>
              <Pill>Κόστος 1ης συνάντησης: 50€ (με ΦΠΑ)</Pill>
              <Pill>Επόμενες συναντήσεις: 45’</Pill>
              <Pill>Κόστος επόμενων: 40€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>
        </div>

        {/* ============ GROUPS ============ */}
        <div id="groups" className="space-y-12 scroll-mt-28">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Ομαδικά
            </h2>
            <span className="h-px w-16 bg-accent/35" />
          </div>

          <SectionCard title="Ομαδικές συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης">
            <p>
              Σκοπός είναι η σταδιακή εκπαίδευση στον τρόπο διατροφής που
              ταιριάζει στις ανάγκες σας, ανταλλαγή εμπειριών και κοινών στόχων
              μέσα σε ασφαλές πλαίσιο. Μικρές ομάδες για αλληλεπίδραση και
              πρακτική εξάσκηση.
            </p>
            <p className="font-semibold mt-2 text-slate-900">
              Βασικές θεματικές ενότητες:
            </p>
            <ul className="list-disc pl-5 space-y-1 marker:text-accent/80">
              <li>Γνωριμία με το σώμα μας</li>
              <li>Διατροφική εκπαίδευση & βασικές στρατηγικές</li>
              <li>Ανάγνωση ετικετών τροφίμων</li>
              <li>Οργάνωση γευμάτων (meal prep)</li>
              <li>
                Αναγνώριση συναισθηματικού φαγητού & μοτίβων γύρω από το φαγητό
              </li>
              <li>Διαχείριση υποτροπών & κοινωνικής πίεσης</li>
              <li>Άσκηση για αποδοχή σώματος και ενίσχυση αυτοεκτίμησης</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Αριθμός συμμετεχόντων: 4–6</Pill>
              <Pill>Έναρξη: Οκτώβριος 2025</Pill>
              <Pill>Διάρκεια: 120’/συνάντηση</Pill>
              <Pill>Συχνότητα: 2 φορές/μήνα</Pill>
              <Pill>Αριθμός συναντήσεων: 10</Pill>
              <Pill>Κόστος/συνάντηση: 25€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>

          <SectionCard title='Ομάδα διαισθητικής διατροφής: "No diet project"'>
            <p>
              Για άτομα που θέλουν να διερευνήσουν τη σχέση τους με το φαγητό, να
              ρυθμίσουν το βάρος τους αργά και βιωματικά και να δημιουργήσουν
              πιο υγιή, φροντιστική σχέση με το σώμα τους.
            </p>
            <p className="font-semibold mt-2 text-slate-900">
              Θεματικές που δουλεύουμε:
            </p>
            <ul className="list-disc pl-5 space-y-1 marker:text-accent/80">
              <li>Από τη δίαιτα στη φροντίδα & αποκατάσταση σχέσης με το σώμα</li>
              <li>Σταματώ να πολεμάω την πείνα μου</li>
              <li>Διατροφική εκπαίδευση & τεχνικές βελτίωσης συμπεριφοράς</li>
              <li>Οργάνωση και απόλαυση γευμάτων</li>
              <li>
                Σταθερό σημείο βάρους: κατανόηση αντίστασης σώματος στην αλλαγή
              </li>
              <li>Αλήθειες και μύθοι για διατροφή & μεταβολισμό</li>
              <li>Αυτοεκτίμηση, εικόνα σώματος, κοινωνική πίεση</li>
              <li>Βιωματικές ασκήσεις & πρακτικές mindful eating</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Αριθμός συμμετεχόντων: 4–6</Pill>
              <Pill>Έναρξη: Οκτώβριος 2025</Pill>
              <Pill>Διάρκεια: 120’/συνάντηση</Pill>
              <Pill>Συχνότητα: 2 φορές/μήνα</Pill>
              <Pill>Αριθμός συναντήσεων: 10</Pill>
              <Pill>Κόστος/συνάντηση: 25€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>
        </div>

        {/* Bottom CTA */}
        <div
          className={[
            "rounded-3xl bg-white",
            "ring-1 ring-accent/25",
            "shadow-sm shadow-[0_12px_28px_rgba(164,199,126,0.12)]",
            "p-6 sm:p-8",
            "flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between",
          ].join(" ")}
        >
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Κλείστε ραντεβού</h3>
            <p className="text-[15px] text-slate-700">
              Στείλτε μας email με το είδος της υπηρεσίας που σας ενδιαφέρει ή
              καλέστε μας για διαθεσιμότητα.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Secondary action: white bg, lots of green tint; purple for focus */}
            <Link
              href="mailto:info@your-domain.gr?subject=Ενδιαφέρομαι για συνεδρία"
              className={[
                "inline-flex items-center justify-center rounded-2xl px-5 py-2 transition",
                "bg-white",
                "ring-1 ring-accent/45",
                "shadow-[0_10px_25px_rgba(164,199,126,0.10)]",
                "hover:shadow-[0_12px_28px_rgba(164,199,126,0.18)]",
                "hover:bg-accent/10",
                "text-primary hover:text-accent",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              ].join(" ")}
            >
              ✉️ Email
            </Link>

            <a
              href="tel:+302311219576"
              className={[
                "inline-flex items-center justify-center rounded-2xl px-5 py-2 transition",
                "bg-white",
                "ring-1 ring-accent/45",
                "shadow-[0_10px_25px_rgba(164,199,126,0.10)]",
                "hover:shadow-[0_12px_28px_rgba(164,199,126,0.18)]",
                "hover:bg-accent/10",
                "text-primary hover:text-accent",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              ].join(" ")}
            >
              📞 2311 219576
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
