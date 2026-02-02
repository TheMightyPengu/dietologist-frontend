/* eslint-disable @typescript-eslint/no-unused-expressions */

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";

/**
 * ΑΡΘΡΑ — Κεντρική σελίδα καταλόγου
 * - Ελληνικό UI
 * - Εικονική "κλήση API" με dummy δεδομένα
 * - Κάθετη sidebar φίλτρων στα αριστερά
 * - Πλέγμα καρτών με ίσο ύψος ανά σειρά
 * - Φίλτρα: αναζήτηση, κατηγορίες, ετικέτες, χρόνος ανάγνωσης, ημερομηνία, ταξινόμηση
 */

// ---------------- Mock "API" ----------------
export type Article = {
  id: number;
  slug: string; // Ελληνικό slug
  title: string; // Ελληνικός τίτλος
  excerpt: string; // Σύντομη περιγραφή
  category: "Διατροφή" | "Ευεξία" | "Συνταγές" | "Επιστήμη";
  dateISO: string; // Ημ/νία δημοσίευσης
  readMinutes: number; // Χρόνος ανάγνωσης
  hero: string; // Εικόνα εξωφύλλου
  tags: string[];
};

function mockFetchArticles(): Article[] {
  // Dummy δεδομένα (μέχρι να συνδεθεί API)
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
    },
  ];
}

// ---------------- Page ----------------
type Props = {
  articles?: Article[];
  categories?: string[];
  tags?: string[];
  minRead?: number;
  maxRead?: number;
};

export async function getStaticProps() {
  const articles = mockFetchArticles();
  const categories = Array.from(new Set(articles.map((a) => a.category)));
  const tags = Array.from(new Set(articles.flatMap((a) => a.tags))).sort((a, b) =>
    a.localeCompare(b, "el"),
  );
  const readMinutesAll = articles.map((a) => a.readMinutes);
  const minRead = Math.min(...readMinutesAll);
  const maxRead = Math.max(...readMinutesAll);
  return { props: { articles, categories, tags, minRead, maxRead } };
}

type SortKey = "newest" | "oldest" | "readAsc" | "readDesc";
type DatePreset = "all" | "30d" | "6m" | "12m";

export default function ArticlesIndex(props: Props) {
  // Safe defaults to avoid .map on undefined
  const articles = useMemo(
    () => props.articles ?? [],
    [props.articles],
  );
  const categories = props.categories ?? [];
  const tags = props.tags ?? [];
  const minRead = props.minRead ?? 0;
  const maxRead = props.maxRead ?? Math.max(0, ...articles.map((a) => a.readMinutes));

  // Αναζήτηση
  const [query, setQuery] = useState("");

  // Κατηγορίες & Ετικέτες (πολλαπλής επιλογής)
  const [catSet, setCatSet] = useState<Set<string>>(new Set());
  const [tagSet, setTagSet] = useState<Set<string>>(new Set());

  // Χρόνος ανάγνωσης (εύρος)
  const [readRange, setReadRange] = useState<[number, number]>([minRead, maxRead]);

  // Ημερομηνία (προκαθορισμένα)
  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  // Ταξινόμηση
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  // Helpers αλλαγών
  const toggleCat = (c: string) =>
    setCatSet((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const toggleTag = (t: string) =>
    setTagSet((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const resetAll = () => {
    setQuery("");
    setCatSet(new Set());
    setTagSet(new Set());
    setReadRange([minRead, maxRead]);
    setDatePreset("all");
    setSortKey("newest");
  };

  // Υπολογισμός φίλτρων & ταξινόμησης
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();

    const dateCutoff = (() => {
      if (datePreset === "all") return null;
      const d = new Date(now);
      if (datePreset === "30d") d.setDate(d.getDate() - 30);
      if (datePreset === "6m") d.setMonth(d.getMonth() - 6);
      if (datePreset === "12m") d.setFullYear(d.getFullYear() - 1);
      return d;
    })();

    let list = articles.filter((a) => {
      // Αναζήτηση
      if (q) {
        const hay = (a.title + " " + a.excerpt + " " + a.tags.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Κατηγορίες
      if (catSet.size > 0 && !catSet.has(a.category)) return false;

      // Ετικέτες (OR: αρκεί μία)
      if (tagSet.size > 0) {
        const hasAny = a.tags.some((t) => tagSet.has(t));
        if (!hasAny) return false;
      }

      // Χρόνος ανάγνωσης
      if (a.readMinutes < readRange[0] || a.readMinutes > readRange[1]) return false;

      // Ημερομηνία
      if (dateCutoff) {
        const pub = new Date(a.dateISO);
        if (pub < dateCutoff) return false;
      }

      return true;
    });

    // Ταξινόμηση
    list = list.sort((a, b) => {
      switch (sortKey) {
        case "newest":
          return a.dateISO < b.dateISO ? 1 : -1;
        case "oldest":
          return a.dateISO > b.dateISO ? 1 : -1;
        case "readAsc":
          return a.readMinutes - b.readMinutes;
        case "readDesc":
          return b.readMinutes - a.readMinutes;
        default:
          return 0;
      }
    });

    return list;
  }, [articles, query, catSet, tagSet, readRange, datePreset, sortKey]);

  return (
    <>
      <Head>
        <title>Άρθρα — Διατροφή & Ευεξία</title>
        <meta
          name="description"
          content="Όλα τα άρθρα σχετικά με διατροφή, ευεξία και επιστημονικά ευρήματα. Αναζητήστε και φιλτράρετε εύκολα."
        />
        <link rel="canonical" href="https://example.com/articles" />
      </Head>

      <section className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-10">
        {/* Hero */}
        <div className="mb-8 rounded-2xl bg-[#e5efe5] p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Άρθρα
          </h1>
          <p className="text-slate-700 max-w-2xl">
            Επιμελημένο περιεχόμενο για υγιεινή, απολαυστική και ισορροπημένη
            καθημερινότητα. Αναζητήστε θέματα που σας ενδιαφέρουν ή περιηγηθείτε
            στις κατηγορίες.
          </p>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Sidebar φίλτρων */}
            <aside className="rounded-2xl bg-white ring-1 ring-slate-200 p-5 h-fit sticky top-24 self-start">
            {/* Αναζήτηση */}
            <div className="mb-5">
              <label htmlFor="q" className="block text-sm font-medium text-slate-700 mb-2">
                Αναζήτηση
              </label>
              <input
                id="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Αναζήτηση άρθρων..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-[#8484d1]/20"
              />
            </div>

            {/* Κατηγορίες */}
            <fieldset className="mb-5">
              <legend className="text-sm font-medium text-slate-700 mb-2">Κατηγορίες</legend>
              <div className="flex flex-col gap-2">
                {categories.map((c) => (
                  <label key={c} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-[#8484d1] focus:ring-[#8484d1]"
                      checked={catSet.has(c)}
                      onChange={() => toggleCat(c)}
                    />
                    <span className="text-sm text-slate-800">{c}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Ετικέτες */}
            <fieldset className="mb-5">
              <legend className="text-sm font-medium text-slate-700 mb-2">Ετικέτες</legend>
              <div className="max-h-40 overflow-auto rounded-lg border border-slate-200 p-2">
                <div className="grid grid-cols-1 gap-2">
                  {tags.map((t) => (
                    <label key={t} className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-[#8484d1] focus:ring-[#8484d1]"
                        checked={tagSet.has(t)}
                        onChange={() => toggleTag(t)}
                      />
                      <span className="text-sm text-slate-800">#{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </fieldset>

            {/* Χρόνος ανάγνωσης */}
            <fieldset className="mb-5">
              <legend className="text-sm font-medium text-slate-700 mb-2">
                Χρόνος ανάγνωσης (λεπτά)
              </legend>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={minRead}
                  max={maxRead}
                  value={readRange[0]}
                  onChange={(e) =>
                    setReadRange([Math.min(Number(e.target.value), readRange[1]), readRange[1]])
                  }
                  className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
                />
                <span className="text-slate-500">—</span>
                <input
                  type="number"
                  min={minRead}
                  max={maxRead}
                  value={readRange[1]}
                  onChange={(e) =>
                    setReadRange([readRange[0], Math.max(Number(e.target.value), readRange[0])])
                  }
                  className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
                />
              </div>
            </fieldset>

            {/* Ημερομηνία */}
            <fieldset className="mb-5">
              <legend className="text-sm font-medium text-slate-700 mb-2">Ημερομηνία</legend>
              <div className="flex flex-col gap-2 text-sm">
                <RadioRow
                  label="Όλο το εύρος"
                  name="datePreset"
                  checked={datePreset === "all"}
                  onChange={() => setDatePreset("all")}
                />
                <RadioRow
                  label="Τελευταίος μήνας"
                  name="datePreset"
                  checked={datePreset === "30d"}
                  onChange={() => setDatePreset("30d")}
                />
                <RadioRow
                  label="Τελευταίο 6μηνο"
                  name="datePreset"
                  checked={datePreset === "6m"}
                  onChange={() => setDatePreset("6m")}
                />
                <RadioRow
                  label="Τελευταίος χρόνος"
                  name="datePreset"
                  checked={datePreset === "12m"}
                  onChange={() => setDatePreset("12m")}
                />
              </div>
            </fieldset>

            {/* Ταξινόμηση */}
            <fieldset className="mb-6">
              <legend className="text-sm font-medium text-slate-700 mb-2">Ταξινόμηση</legend>
              <div className="flex flex-col gap-2 text-sm">
                <RadioRow
                  label="Νεότερα πρώτα"
                  name="sortKey"
                  checked={sortKey === "newest"}
                  onChange={() => setSortKey("newest")}
                />
                <RadioRow
                  label="Παλαιότερα πρώτα"
                  name="sortKey"
                  checked={sortKey === "oldest"}
                  onChange={() => setSortKey("oldest")}
                />
                <RadioRow
                  label="Χρόνος ανάγνωσης (αύξουσα)"
                  name="sortKey"
                  checked={sortKey === "readAsc"}
                  onChange={() => setSortKey("readAsc")}
                />
                <RadioRow
                  label="Χρόνος ανάγνωσης (φθίνουσα)"
                  name="sortKey"
                  checked={sortKey === "readDesc"}
                  onChange={() => setSortKey("readDesc")}
                />
              </div>
            </fieldset>

            {/* Ενέργειες */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetAll}
                className="w-full rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 transition"
              >
                Επαναφορά φίλτρων
              </button>
            </div>
          </aside>

          {/* Αποτελέσματα */}
          <div>
            {filteredSorted.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
                Δεν βρέθηκαν άρθρα με αυτά τα κριτήρια.
              </div>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {filteredSorted.map((a, idx) => (
                  <li key={a.id} className="group h-full">
                    <Link
                      href={`/articles/${encodeURIComponent(a.slug)}`}
                      className={`flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-lg ${
                        idx === 0 
                          ? 'ring-2 ring-warm/50 hover:shadow-[0_10px_25px_rgba(255,230,150,0.12)]' 
                          : 'ring-1 ring-slate-200'
                      }`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <Image
                          src={a.hero}
                          alt={a.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                        <span className={`absolute left-3 top-3 inline-flex items-center rounded-full ${idx === 0 ? 'bg-warm text-slate-800' : 'bg-[#8484d1] text-white/95'} px-3 py-1 text-xs font-medium`}>
                          {a.category}
                        </span>
                        {idx === 0 && (
                          <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-warm/30 border border-warm/60 px-2.5 py-1 text-xs font-medium text-slate-800">
                            ⭐ Προτεινόμενο
                          </span>
                        )}
                      </div>

                      <div className="p-5 flex flex-col gap-3 grow">
                        <h3 className="text-lg font-semibold leading-snug">{a.title}</h3>

                        <p className="text-sm text-slate-600 line-clamp-3">{a.excerpt}</p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-sm text-slate-500">
                            <span>
                              {new Date(a.dateISO).toLocaleDateString("el-GR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                            <span>⏱ {a.readMinutes}′ ανάγνωση</span>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {a.tags.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- Small UI bits ---------------- */
function RadioRow({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        type="radio"
        name={name}
        className="border-slate-300 text-[#8484d1] focus:ring-[#8484d1]"
        checked={checked}
        onChange={onChange}
      />
      <span className="text-slate-800">{label}</span>
    </label>
  );
}