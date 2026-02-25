import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

type PillProps = { children: React.ReactNode };
const Pill = ({ children }: PillProps) => (
  <span
    className={[
      "inline-flex items-center rounded-full bg-white",
      "ring-1 ring-accent/40",
      "shadow-[0_1px_0_rgba(164,199,126,0.25)]",
      "px-3 py-1 text-sm leading-none text-slate-800",
    ].join(" ")}
  >
    {children}
  </span>
);

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function toText(node: React.ReactNode) {
  if (typeof node === "string") return node;
  return "Υπηρεσία";
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function TitleRow({
  as = "h2",
  children,
  size = "card",
}: {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  size?: "section" | "card" | "cta";
}) {
  const Tag = as as any;

  const titleClass =
    size === "section"
      ? "text-xl sm:text-2xl font-semibold text-slate-900"
      : size === "cta"
        ? "text-xl sm:text-2xl font-semibold text-slate-900"
        : "text-lg sm:text-xl font-semibold tracking-tight text-slate-900";

  return (
    <div className="flex items-center gap-3">
      <Tag className={titleClass}>{children}</Tag>
      <span className="hidden sm:inline-block h-[2px] w-20 rounded-full bg-accent/40" />
    </div>
  );
}

const SectionCard: React.FC<
  React.PropsWithChildren<{
    title: React.ReactNode;
    id?: string;
    imageUrl?: string;
  }>
> = ({ title, id, children, imageUrl }) => (
  <section id={id} className="scroll-mt-28">
    <div
      className={[
        "rounded-3xl bg-white",
        "ring-1 ring-accent/25 shadow-[0_10px_25px_rgba(164,199,126,0.10)]",
        "shadow-sm",
        "p-6 sm:p-8 lg:p-10",
      ].join(" ")}
    >
      <TitleRow as="h2" size="card">
        {title}
      </TitleRow>

      {imageUrl ? (
        <div className="mt-5 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-accent/15">
          <div className="relative aspect-video w-full">
            <img
              src={imageUrl}
              alt={toText(title)}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/35 to-transparent" />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-700">
        {children}
      </div>
    </div>
  </section>
);

export default function ServicesPage() {
  const [serviceImages, setServiceImages] = useState<Record<string, string>>(
    {},
  );
  const [tab, setTab] = useState<"one" | "groups">("one");
  const [copied, setCopied] = useState<null | "phone" | "email">(null);

  async function fetchServiceImages(): Promise<Record<string, string>> {
    await new Promise((r) => setTimeout(r, 250));

    return {
      "Συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης":
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=80",
      "Συνεδρίες εστιασμένες στις διατροφικές διαταραχές":
        "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&w=1600&q=80",
      "Συνεδρίες διαισθητικής διατροφής & mindful eating":
        "https://images.unsplash.com/photo-1529059997568-3d847b1154f0?auto=format&fit=crop&w=1600&q=80",
      "Ομαδικές συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης":
        "https://images.unsplash.com/photo-1525097487452-6278ff080c31?auto=format&fit=crop&w=1600&q=80",
      'Ομάδα διαισθητικής διατροφής: "No diet project"':
        "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=1600&q=80",
    };
  }

  useEffect(() => {
    (async () => {
      const imgs = await fetchServiceImages();
      setServiceImages(imgs);
    })();
  }, []);

  useEffect(() => {
    const target = tab === "one" ? "one-to-one" : "groups";
    if (typeof window !== "undefined") {
      const newHash = `#${target}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, "", newHash);
      }
    }
  }, [tab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (hash === "groups") setTab("groups");
    if (hash === "one-to-one") setTab("one");
  }, []);

  const siteName = "Διαιτολογικό Κέντρο";

  const phone = "2311 219576";
  const phoneRaw = "+302311219576";
  const email = "info@your-domain.gr";

  // TODO: replace with your actual classic booking route
  const bookHref = "/book";

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

      <div className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Υπηρεσίες Διατροφής
            </h1>
            <div className="mt-2 h-px w-24 bg-accent/35" />
            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
              Σε αυτή τη σελίδα θα βρείτε συγκεντρωμένες όλες τις υπηρεσίες που
              προσφέρονται, τόσο στο γραφείο στο κέντρο της Θεσσαλονίκης όσο και
              διαδικτυακά. Κάθε συνάντηση έχει σχεδιαστεί με γνώμονα την
              εξατομίκευση και την υποστήριξη της προσωπικής σας πορείας.
            </p>
          </header>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-2 sm:flex-1">
              <Link
                href="#one-to-one"
                onClick={() => setTab("one")}
                className={[
                  "rounded-full focus:outline-none",
                  "focus-visible:ring-4 focus-visible:ring-primary/20",
                  "hover:shadow-[0_10px_25px_rgba(164,199,126,0.12)] transition",
                ].join(" ")}
              >
                <Pill>Ατομικές συνεδρίες (1:1)</Pill>
              </Link>

              <Link
                href="#groups"
                onClick={() => setTab("groups")}
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
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {/* Contact stripe: remove the 3rd bordered card; button stands alone */}
        <div
          className={[
            "rounded-3xl bg-white",
            "ring-1 ring-accent/25",
            "shadow-sm shadow-[0_14px_34px_rgba(164,199,126,0.12)]",
            "p-6 sm:p-8",
          ].join(" ")}
        >
          <p className="text-[15px] leading-relaxed text-slate-700">
            Για να δεσμεύσετε ραντεβού, μπορείτε να επικοινωνήσετε μαζί μας μέσω
            email, εκδηλώνοντας το ενδιαφέρον σας για την αντίστοιχη συνεδρία.
            Επιλέξτε εκείνη που ανταποκρίνεται καλύτερα στις ανάγκες σας.
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-3 lg:items-center">
            {/* Phone */}
            <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 shadow-[0_10px_22px_rgba(164,199,126,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 text-accent" aria-hidden="true">
                    📞
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Τηλέφωνο
                    </p>
                    <a
                      href={`tel:${phoneRaw}`}
                      className="mt-1 inline-flex text-sm text-slate-700 hover:text-accent transition"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(phone);
                    if (ok) {
                      setCopied("phone");
                      setTimeout(() => setCopied(null), 1200);
                    }
                  }}
                  className={classNames(
                    "shrink-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition",
                    "bg-white ring-1 ring-primary/30",
                    "hover:ring-primary/55 hover:bg-primary/5",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                  )}
                >
                  {copied === "phone" ? "✅ Αντιγράφηκε" : "Αντιγραφή"}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 shadow-[0_10px_22px_rgba(164,199,126,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 text-accent" aria-hidden="true">
                    ✉️
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Email</p>
                    <a
                      href={`mailto:${email}`}
                      className="mt-1 inline-flex text-sm text-slate-700 hover:text-accent transition break-all"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(email);
                    if (ok) {
                      setCopied("email");
                      setTimeout(() => setCopied(null), 1200);
                    }
                  }}
                  className={classNames(
                    "shrink-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition",
                    "bg-white ring-1 ring-primary/30",
                    "hover:ring-primary/55 hover:bg-primary/5",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                  )}
                >
                  {copied === "email" ? "✅ Αντιγράφηκε" : "Αντιγραφή"}
                </button>
              </div>
            </div>

            {/* Button only (no bordered card) */}
            <div className="lg:justify-self-end">
              <Link
                href={bookHref}
                className={classNames(
                  "inline-flex w-full lg:w-auto items-center justify-center rounded-2xl px-6 py-3 transition text-sm font-medium",
                  "bg-primary text-white",
                  "shadow-[0_14px_30px_rgba(122,122,196,0.22)]",
                  "hover:shadow-[0_18px_38px_rgba(122,122,196,0.28)]",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                )}
              >
                Κλείστε Ραντεβού
              </Link>
            </div>
          </div>
        </div>

        {/* ============ ONE-TO-ONE ============ */}
        <div id="one-to-one" className="space-y-12 scroll-mt-28">
          <TitleRow as="h2" size="section">
            Ατομικές συνεδρίες (1:1)
          </TitleRow>

          <SectionCard
            title="Συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης"
            imageUrl={
              serviceImages[
                "Συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης"
              ]
            }
          >
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
                πορεία σας μέχρι σήμερα με στοιχεία από τη
                Γνωστική-Συμπεριφορική προσέγγιση.
              </li>
              <li>
                <strong>Διατροφικό ιστορικό & καθημερινότητα</strong>:
                συνήθειες, προτιμήσεις, ρυθμοί ημέρας.
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

          <SectionCard
            title="Συνεδρίες εστιασμένες στις διατροφικές διαταραχές"
            imageUrl={
              serviceImages["Συνεδρίες εστιασμένες στις διατροφικές διαταραχές"]
            }
          >
            <ol className="list-decimal pl-5 space-y-2 marker:text-accent/80">
              <li>
                <strong>Αρχική εκτίμηση</strong> της τρέχουσας κατάστασης.
                Ζύγιση ή λιπομέτρηση μόνο αν κριθεί βοηθητική, με έμφαση στη
                σχέση με το σώμα και όχι στους αριθμούς.
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
                <strong>Επόμενες συνεδρίες</strong> ανά 1–2 εβδομάδες:
                αξιολόγηση προόδου, επεξεργασία σκέψεων/συναισθημάτων,
                εκπαίδευση με έμφαση στη σχέση με το σώμα.
              </li>
            </ol>

            <div className="mt-5 flex flex-wrap gap-2">
              <Pill>Διάρκεια 1ης συνάντησης: 60’</Pill>
              <Pill>Κόστος 1ης συνάντησης: 50€ (με ΦΠΑ)</Pill>
              <Pill>Επόμενες συναντήσεις: 45’</Pill>
              <Pill>Κόστος επόμενων: 40€ (με ΦΠΑ)</Pill>
            </div>
          </SectionCard>

          <SectionCard
            title="Συνεδρίες διαισθητικής διατροφής & mindful eating"
            imageUrl={
              serviceImages[
                "Συνεδρίες διαισθητικής διατροφής & mindful eating"
              ]
            }
          >
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
          <TitleRow as="h2" size="section">
            Ομαδικά
          </TitleRow>

          <SectionCard
            title="Ομαδικές συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης"
            imageUrl={
              serviceImages[
                "Ομαδικές συνεδρίες διατροφικής παρακολούθησης & εκπαίδευσης"
              ]
            }
          >
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

          <SectionCard
            title='Ομάδα διαισθητικής διατροφής: "No diet project"'
            imageUrl={
              serviceImages['Ομάδα διαισθητικής διατροφής: "No diet project"']
            }
          >
            <p>
              Για άτομα που θέλουν να διερευνήσουν τη σχέση τους με το φαγητό,
              να ρυθμίσουν το βάρος τους αργά και βιωματικά και να δημιουργήσουν
              πιο υγιή, φροντιστική σχέση με το σώμα τους.
            </p>
            <p className="font-semibold mt-2 text-slate-900">
              Θεματικές που δουλεύουμε:
            </p>
            <ul className="list-disc pl-5 space-y-1 marker:text-accent/80">
              <li>
                Από τη δίαιτα στη φροντίδα & αποκατάσταση σχέσης με το σώμα
              </li>
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

        {/* Bottom CTA: classic booking button only */}
        <div
          className={[
            "rounded-3xl bg-white",
            "ring-1 ring-accent/25",
            "shadow-sm shadow-[0_16px_38px_rgba(164,199,126,0.14)]",
            "p-7 sm:p-10",
            "flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between",
          ].join(" ")}
        >
          <div className="max-w-2xl">
            <TitleRow as="h3" size="cta">
              Κλείστε ραντεβού
            </TitleRow>
            <p className="mt-2 text-[15px] text-slate-700 leading-relaxed">
              Επιλέξτε διαθέσιμη ημέρα και ώρα για το ραντεβού σας.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <Link
              href={bookHref}
              className={classNames(
                "inline-flex w-full lg:w-auto items-center justify-center rounded-2xl px-6 py-3 transition text-sm font-medium",
                "bg-primary text-white",
                "shadow-[0_14px_30px_rgba(122,122,196,0.22)]",
                "hover:shadow-[0_18px_38px_rgba(122,122,196,0.28)]",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
              )}
            >
              Κλείστε Ραντεβού
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}