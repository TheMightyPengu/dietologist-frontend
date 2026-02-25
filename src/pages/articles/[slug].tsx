import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/image";

/**
 * ΑΡΘΡΟ — Σελίδα λεπτομέρειας
 * - Back button αντί για breadcrumbs
 * - Category pill πιο κοντά στο headline
 * - H1: leading-[1.1] + max-w-[22ch]
 * - Meta row: icons + text-sm text-slate-600 + ίδιο baseline
 * - Hero: rounded-3xl + ring-1 ring-black/5 + λεπτό gradient scrim
 * - Body: max-w-[68ch] + leading-relaxed
 * - Headings: consistent scale (text-lg font-semibold, mt-10 mb-3)
 * - Lists: space-y-2 + marker:text-slate-400
 * - Tags: ίδια chips με index + hover/focus
 * - Remove “Σχετικά άρθρα”
 * - Reading progress bar
 * - focus-visible:ring σε links (prose)
 */

// ---------------- Mock "API" (ίδιο dataset με το index για συνέπεια) ----------------
type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: "Διατροφή" | "Ευεξία" | "Συνταγές" | "Επιστήμη";
  dateISO: string;
  readMinutes: number;
  hero: string;
  tags: string[];
  content: string[];
};

function mockFetchArticles(): Article[] {
  return [
    {
      id: 1,
      slug: "διατροφή-και-ύπνος",
      title: "Διατροφή & Ύπνος: πώς επηρεάζει η μία τον άλλον",
      excerpt:
        "Πρακτικές συμβουλές για να βελτιώσετε την ποιότητα του ύπνου μέσα από μικρές αλλαγές στη διατροφή σας.",
      category: "Ευεξία",
      dateISO: "2025-09-28",
      readMinutes: 6,
      hero:
        "https://images.unsplash.com/photo-1505575972945-210eb7a0a2ee?q=80&w=1600&auto=format&fit=crop",
      tags: ["ύπνος", "ορμόνες", "βραδινό"],
      content: [
        "# Γιατί ο ύπνος συνδέεται με τη διατροφή",
        "Ο επαρκής ύπνος συμβάλλει στη ρύθμιση ορμονών πείνας/κορεσμού (γκρελίνη/λεπτίνη) και επηρεάζει τις ημερήσιες επιλογές μας.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus sit amet arcu a massa facilisis luctus. Integer hendrerit, elit sed posuere tristique, arcu ex sagittis arcu, ac elementum mauris dolor sed dui. Curabitur porta, ligula non fringilla fringilla, arcu massa tincidunt nibh, in tincidunt nisi ante ac justo.",
        "## Πρακτικά βήματα",
        "• Κρατήστε μικρότερο, ελαφρύ βραδινό 2–3 ώρες πριν τον ύπνο.",
        "• Περιορίστε καφεΐνη μετά το μεσημέρι και αλκοόλ αργά το βράδυ.",
        "• Προτιμήστε πρωτεΐνη & σύνθετους υδατάνθρακες για σταθερό σάκχαρο.",
        "Nam ut neque pulvinar, mattis odio vitae, iaculis justo. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec bibendum, nibh a laoreet fermentum, lacus est tristique dui, sed tempor sapien lacus et magna.",
      ],
    },
    {
      id: 2,
      slug: "πρωτεΐνη-χωρίς-υπερβολές",
      title: "Πόση πρωτεΐνη χρειαζόμαστε πραγματικά χωρίς υπερβολές",
      excerpt:
        "Ξεδιαλύνουμε μύθους, προτείνουμε ρεαλιστικές ποσότητες και ιδέες για ισορροπημένα γεύματα.",
      category: "Επιστήμη",
      dateISO: "2025-10-07",
      readMinutes: 8,
      hero:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop",
      tags: ["πρωτεΐνη", "μύθοι", "πόσο"],
      content: [
        "# Πραγματικές ανάγκες",
        "Οι ανάγκες ποικίλλουν ανά άτομο (ηλικία, δραστηριότητα, στόχοι). Στόχος: επαρκής πρόσληψη ημερησίως με έμφαση στην ποιότητα.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam in urna at nulla varius gravida. Integer ac consequat mauris. Sed gravida, sem sed gravida posuere, ex odio gravida sapien, a efficitur leo nisi id lectus.",
        "## Παραδείγματα",
        "• Ισορροπημένες μερίδες σε κάθε γεύμα.",
        "• Φυτικές & ζωικές πηγές με ποικιλία.",
        "• Προγραμματισμός εβδομάδας για σταθερή πρόσληψη.",
        "Curabitur vel elit nec justo pretium volutpat. Suspendisse potenti. Cras dictum, dui sed gravida interdum, nisi ipsum tristique mi, in imperdiet lectus ligula non magna.",
      ],
    },
    {
      id: 3,
      slug: "γρήγορα-γεύματα-στο-γραφείο",
      title: "Γρήγορα γεύματα για το γραφείο: χορταστικά & ισορροπημένα",
      excerpt:
        "Ιδέες που ετοιμάζονται σε 10-15′, μεταφέρονται εύκολα και σας κρατούν σε ενέργεια.",
      category: "Διατροφή",
      dateISO: "2025-08-19",
      readMinutes: 5,
      hero:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1600&auto=format&fit=crop",
      tags: ["lunchbox", "γραφείο", "γρήγορα"],
      content: [
        "# Ιδέες που δουλεύουν",
        "Συνδυασμοί με πρωτεΐνη, υδατάνθρακες & καλά λιπαρά για σταθερή ενέργεια.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam condimentum, nunc ac pharetra volutpat, justo nisl efficitur sem, id luctus tortor nibh a est.",
        "• Μπολ με κινόα, όσπρια και λαχανικά.",
        "• Πίτα ολικής με τόνο/κοτόπουλο και λαχανικά.",
        "• Γιαούρτι με φρούτα και ξηρούς καρπούς.",
        "Proin eu fermentum velit. Vestibulum auctor urna vitae massa imperdiet, in aliquet ipsum cursus.",
      ],
    },
    {
      id: 4,
      slug: "ενυδάτωση-και-επιδόσεις",
      title: "Ενυδάτωση & επιδόσεις: τι δείχνουν οι μελέτες",
      excerpt:
        "Απόδοση, συγκέντρωση και ευεξία: γιατί η καλή ενυδάτωση έχει σημασία όλη την ημέρα.",
      category: "Επιστήμη",
      dateISO: "2025-07-02",
      readMinutes: 7,
      hero:
        "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?q=80&w=1600&auto=format&fit=crop",
      tags: ["νερό", "απόδοση", "συγκέντρωση"],
      content: [
        "# Επίδραση στην απόδοση",
        "Ακόμα και ήπια αφυδάτωση επηρεάζει διάθεση και συγκέντρωση.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean vulputate, risus id convallis euismod, nisi urna blandit ipsum, ac sollicitudin enim dolor eget augue.",
        "## Πρακτικές οδηγίες",
        "• Έχετε νερό ορατό στο γραφείο σας.",
        "• Προσθέστε φρούτα/βότανα για γεύση.",
        "• Θυμηθείτε μικρές γουλιές συχνά μέσα στην ημέρα.",
        "Donec viverra, augue eu bibendum pulvinar, magna velit efficitur augue, ac mattis elit augue sit amet arcu.",
      ],
    },
    {
      id: 5,
      slug: "μεσογειακή-διατροφή-στην-πράξη",
      title: "Μεσογειακή διατροφή στην πράξη: απλά βήματα",
      excerpt:
        "Πώς εφαρμόζουμε τη μεσογειακή διατροφή στην καθημερινότητα χωρίς περίπλοκα πλάνα.",
      category: "Διατροφή",
      dateISO: "2025-10-15",
      readMinutes: 9,
      hero:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop",
      tags: ["μεσογειακή", "απλά-βήματα", "καθημερινότητα"],
      content: [
        "# Πυλώνες",
        "Έμφαση σε λαχανικά, φρούτα, όσπρια, δημητριακά ολικής και ελαιόλαδο.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vulputate lacinia mauris, nec mattis urna feugiat a. Sed nec eros sit amet purus lacinia malesuada.",
        "## Σταδιακή υιοθέτηση",
        "• Μικρές αλλαγές στα εβδομαδιαία γεύματα.",
        "• Προγραμματισμός και λίστα σούπερ μάρκετ.",
        "• Εστίαση στην ποιότητα του λίπους.",
        "Mauris sit amet magna non libero rutrum interdum. Donec vel tempus purus.",
      ],
    },
    {
      id: 6,
      slug: "γλυκό-χωρίς-ενοχές",
      title: "Γλυκό χωρίς ενοχές: ισορροπία, όχι στέρηση",
      excerpt:
        "Πώς απολαμβάνουμε γλυκά με μέτρο και ποια swaps βοηθούν την ισορροπία.",
      category: "Συνταγές",
      dateISO: "2025-06-11",
      readMinutes: 4,
      hero:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1600&auto=format&fit=crop",
      tags: ["γλυκά", "ισορροπία", "swaps"],
      content: [
        "# Απόλαυση με ισορροπία",
        "Στόχος δεν είναι η στέρηση αλλά η συνειδητή απόλαυση.",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae vestibulum purus. Cras nec dui ut mi dignissim suscipit.",
        "## Ιδέες",
        "• Μικρότερες μερίδες, πλουσιότερη γεύση.",
        "• Φρούτα, κακάο, γιαούρτι σε σνακ.",
        "• Εναλλακτικά γλυκαντικά με μέτρο.",
        "Integer tristique, enim sed faucibus sodales, mauris felis gravida enim, sed iaculis enim nisl sed augue.",
      ],
    },
  ];
}

function getArticleBySlug(slug: string): Article | undefined {
  return mockFetchArticles().find((a) => a.slug === slug);
}

// ---------------- SSG ----------------
export const getStaticPaths: GetStaticPaths = async () => {
  const articles = mockFetchArticles();
  const paths = articles.map((a) => ({ params: { slug: a.slug } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const slug = ctx.params?.slug as string;
  const article = getArticleBySlug(slug);

  if (!article) return { notFound: true };

  return {
    props: {
      article,
    },
  };
};

// ---------------- Page ----------------
export default function ArticlePage({ article }: { article: Article }) {
  const formattedDate = useMemo(
    () =>
      new Date(article.dateISO).toLocaleDateString("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [article.dateISO],
  );

  // Reading progress
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight || document.body.scrollHeight;
      const clientHeight = doc.clientHeight;
      const total = Math.max(1, scrollHeight - clientHeight);
      setProgress(Math.min(1, Math.max(0, scrollTop / total)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>{`${article.title} — Άρθρα`}</title>
        <meta name="description" content={article.excerpt} />
        <link
          rel="canonical"
          href={`https://example.com/articles/${encodeURIComponent(article.slug)}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${article.title} — Άρθρα`} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.hero} />
        <meta property="og:locale" content="el_GR" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      {/* Reading progress bar */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
          aria-hidden
        />
      </div>

      <article className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-8">
        {/* Back button */}
        <div className="mb-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200 hover:bg-white transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <span aria-hidden>←</span>
            Πίσω στα άρθρα
          </Link>
        </div>

        {/* Hero + metadata */}
        <header className="mb-7">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white/95">
              {article.category}
            </span>

            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span aria-hidden>📅</span>
              <span>Δημοσίευση: {formattedDate}</span>
            </span>

            <span className="text-slate-300" aria-hidden>
              •
            </span>

            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span aria-hidden>⏱</span>
              <span>{article.readMinutes}′ ανάγνωση</span>
            </span>
          </div>

          <h1 className="mt-2 max-w-[22ch] text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">
            {article.title}
          </h1>

          <div className="mt-6 overflow-hidden rounded-3xl ring-1 ring-black/5 bg-white/90">
            <div className="relative">
              <Image
                src={article.hero}
                alt={article.title}
                width={1000}
                height={650}
                className="w-full h-auto object-cover"
                priority
              />
              {/* subtle scrim */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          </div>
        </header>

        {/* Περιεχόμενο */}
        <div
          className={[
            "prose prose-slate max-w-none",
            "prose-headings:scroll-mt-24",
            "prose-p:leading-relaxed",
            "prose-a:font-medium prose-a:text-primary",
            "prose-a:no-underline hover:prose-a:underline",
            "prose-a:focus:outline-none prose-a:focus-visible:ring-4 prose-a:focus-visible:ring-primary/20 prose-a:rounded",
            "prose-ul:pl-6 prose-ul:my-4 prose-ul:list-disc",
            "prose-li:my-0",
            "prose-ul:space-y-2",
            "prose-li:marker:text-slate-400",
          ].join(" ")}
        >
          <div className="max-w-[68ch]">
            {article.content.map((block, i) => {
              if (block.startsWith("# ")) {
                return (
                  <h2 key={i} className="text-lg font-semibold mt-10 mb-3">
                    {block.replace("# ", "")}
                  </h2>
                );
              }
              if (block.startsWith("## ")) {
                return (
                  <h3 key={i} className="text-lg font-semibold mt-10 mb-3">
                    {block.replace("## ", "")}
                  </h3>
                );
              }
              if (block.startsWith("• ")) {
                const items = block
                  .split("• ")
                  .filter(Boolean)
                  .map((s) => s.trim());

                return (
                  <ul key={i} className="my-4 list-disc pl-6 space-y-2 marker:text-slate-400">
                    {items.map((li, idx) => (
                      <li key={idx}>{li}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={i}>{block}</p>;
            })}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/15 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
}