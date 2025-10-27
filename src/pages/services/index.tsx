// pages/services/index.tsx
import Head from "next/head";
import Link from "next/link";

type PillProps = { children: React.ReactNode };
const Pill = ({ children }: PillProps) => (
  <span className="inline-flex items-center rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-[#7a7ac4]/30 px-3 py-1 text-sm leading-none">
    {children}
  </span>
);

const SectionCard: React.FC<
  React.PropsWithChildren<{ title: React.ReactNode; id?: string }>
> = ({ title, id, children }) => (
  <section id={id} className="scroll-mt-28">
    <div className="rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-[#7a7ac4]/20 shadow-sm p-6 sm:p-8 lg:p-10">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-[15px] leading-relaxed">
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
        {/* decorative vine if you have it in /public/decor/vine.png */}
        <img
          src="/decor/vine.png"
          alt=""
          aria-hidden="true"
          className="hidden md:block pointer-events-none select-none absolute -top-6 right-0 w-40 opacity-90"
        />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Υπηρεσίες Διατροφής
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed">
              Σε αυτή τη σελίδα θα βρείτε συγκεντρωμένες όλες τις υπηρεσίες που
              προσφέρονται, τόσο στο γραφείο στο κέντρο της Θεσσαλονίκης όσο και
              διαδικτυακά. Κάθε συνάντηση έχει σχεδιαστεί με γνώμονα την
              εξατομίκευση και την υποστήριξη της προσωπικής σας πορείας.
            </p>
          </header>

          {/* Quick anchor pills */}
          <div className="flex flex-wrap gap-2">
            <Link href="#one-to-one" className="focus:outline-none">
              <Pill>Ατομικές συνεδρίες (1:1)</Pill>
            </Link>
            <Link href="#groups" className="focus:outline-none">
              <Pill>Ομαδικές συνεδρίες</Pill>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {/* Contact stripe */}
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-[#7a7ac4]/20 shadow-sm p-6 sm:p-8">
          <p className="text-[15px] leading-relaxed">
            Για να δεσμεύσετε ραντεβού, μπορείτε να επικοινωνήσετε μαζί μας
            μέσω email, εκδηλώνοντας το ενδιαφέρον σας για την αντίστοιχη
            συνεδρία. Επιλέξτε εκείνη που ανταποκρίνεται καλύτερα στις ανάγκες
            σας.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="i">📍</span>
              Πτολεμαίων 11, ΤΚ: 54630
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="i">📞</span> 2311 219576
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="i">✉️</span> info@your-domain.gr
            </div>
          </div>
        </div>

        {/* ============ ONE-TO-ONE ============ */}
        <div id="one-to-one" className="space-y-12 scroll-mt-28">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Ατομικές συνεδρίες (1:1)
          </h2>

          {/* 1. Παρακολούθηση & εκπαίδευση */}
          <SectionCard title="Συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης">
            <ol className="list-decimal pl-5 space-y-2">
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
                θέλετε, λιπομέτρηση & αξιολόγηση στόχων, (β) συζήτηση
                δυσκολιών, (γ) αναπροσαρμογές, (δ) διατροφική εκπαίδευση.
              </li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Διάρκεια 1ης συνάντησης: 60’</Pill>
              <Pill>Κόστος 1ης συνάντησης: 50€ (με ΦΠΑ)</Pill>
              <Pill>Επόμενες συναντήσεις: 45’</Pill>
              <Pill>Κόστος επόμενων: 40€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>

          {/* 2. Εστιασμένες στις διατροφικές διαταραχές */}
          <SectionCard title="Συνεδρίες εστιασμένες στις διατροφικές διαταραχές">
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Αρχική εκτίμηση</strong> της τρέχουσας κατάστασης. Ζύγιση
                ή λιπομέτρηση μόνο αν κριθεί βοηθητική, με έμφαση στη σχέση με
                το σώμα και όχι στους αριθμούς.
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
                προόδου, επεξεργασία σκέψεων/συναισθημάτων, εκπαίδευση με
                έμφαση στη σχέση με το σώμα.
              </li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Διάρκεια 1ης συνάντησης: 60’</Pill>
              <Pill>Κόστος 1ης συνάντησης: 50€ (με ΦΠΑ)</Pill>
              <Pill>Επόμενες συναντήσεις: 45’</Pill>
              <Pill>Κόστος επόμενων: 40€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>

          {/* 3. Διαισθητική διατροφή & mindful eating */}
          <SectionCard title="Συνεδρίες διαισθητικής διατροφής & mindful eating">
            <ol className="list-decimal pl-5 space-y-2">
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
                πρακτικές αυτοφροντίδας, ιδέες γευμάτων, εργαλεία επικοινωνίας
                με τον εαυτό.
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
          <h2 className="text-xl sm:text-2xl font-semibold">Ομαδικά</h2>

          {/* Group 1 */}
          <SectionCard title="Ομαδικές συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης">
            <p>
              Σκοπός είναι η σταδιακή εκπαίδευση στον τρόπο διατροφής που
              ταιριάζει στις ανάγκες σας, ανταλλαγή εμπειριών και κοινών στόχων
              μέσα σε ασφαλές πλαίσιο. Μικρές ομάδες για αλληλεπίδραση και
              πρακτική εξάσκηση.
            </p>
            <p className="font-semibold mt-2">Βασικές θεματικές ενότητες:</p>
            <ul className="list-disc pl-5 space-y-1">
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

          {/* Group 2 */}
          <SectionCard title='Ομάδα διαισθητικής διατροφής: "No diet project"'>
            <p>
              Για άτομα που θέλουν να διερευνήσουν τη σχέση τους με το φαγητό,
              να ρυθμίσουν το βάρος τους αργά και βιωματικά και να δημιουργήσουν
              πιο υγιή, φροντιστική σχέση με το σώμα τους.
            </p>
            <p className="font-semibold mt-2">Θεματικές που δουλεύουμε:</p>
            <ul className="list-disc pl-5 space-y-1">
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
        <div className="rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-[#7a7ac4]/20 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div>
            <h3 className="text-lg font-semibold">Κλείστε ραντεβού</h3>
            <p className="text-[15px]">
              Στείλτε μας email με το είδος της υπηρεσίας που σας ενδιαφέρει ή
              καλέστε μας για διαθεσιμότητα.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="mailto:info@your-domain.gr?subject=Ενδιαφέρομαι για συνεδρία"
              className="inline-flex items-center justify-center rounded-2xl bg-white/80 ring-1 ring-[#7a7ac4]/30 shadow-sm hover:shadow transition px-5 py-2 [box-shadow:1px_1px_4px_#7a7ac4] hover:[box-shadow:2px_2px_7px_#7a7ac4]"
            >
              ✉️ Email
            </Link>
            <a
              href="tel:+302311219576"
              className="inline-flex items-center justify-center rounded-2xl bg-white/80 ring-1 ring-[#7a7ac4]/30 shadow-sm hover:shadow transition px-5 py-2 [box-shadow:1px_1px_4px_#7a7ac4] hover:[box-shadow:2px_2px_7px_#7a7ac4]"
            >
              📞 2311 219576
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
