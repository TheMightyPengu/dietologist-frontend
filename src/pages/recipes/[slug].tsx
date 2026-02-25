// pages/recipes/[slug].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useMemo, useState } from "react";

// -------------------- Types --------------------
type Category = "Breakfast" | "Main" | "Snack" | "Drink" | "Dessert" | "Salad";
type Recipe = {
  id: number;
  slug: string; // API/internal slug (EN)
  title: string;
  category: Category;
  minutes: number;
  rating: number;
  tags: string[];
  allergensFree: string[]; // e.g., ["gluten", "dairy"]
  ingredients: string[];
  steps: string[];
  image: string;
  createdAt: string;
};

// -------------------- Labels --------------------
const CATEGORY_LABELS: Record<Category, string> = {
  Breakfast: "Πρωινό",
  Main: "Κυρίως",
  Snack: "Σνακ",
  Drink: "Ρόφημα",
  Dessert: "Γλυκό",
  Salad: "Σαλάτα",
};

// -------------------- Demo Data --------------------
const RECIPES: Recipe[] = [
  {
    id: 3001,
    slug: "strawberry-brownies",
    title: "Brownies Φράουλας",
    category: "Dessert",
    minutes: 60,
    rating: 4.7,
    tags: ["Σοκολάτα", "Φράουλα"],
    allergensFree: [],
    ingredients: [
      "φράουλες",
      "μέλι",
      "κακάο",
      "αλεύρι",
      "αυγά",
      "baking powder",
      "εκχύλισμα βανίλιας",
      "μαργαρίνη",
      "αλάτι",
      "κουβερτούρα",
      "γάλα",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476e?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 3002,
    slug: "banana-bread",
    title: "Banana Bread",
    category: "Dessert",
    minutes: 60,
    rating: 4.8,
    tags: ["Ολικής", "Ξηροί καρποί"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "μπανάνες",
      "ζάχαρη καστανή",
      "χουρμαδόπαστα",
      "αυγά",
      "ελαιόλαδο",
      "χυμός πορτοκάλι",
      "γιαούρτι",
      "καρύδια",
      "αμύγδαλα",
      "μπέικιν πάουντερ",
      "κανέλα",
      "μοσχοκάρυδο",
      "γαρύφαλλο",
      "βανίλια",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1604335399105-a0c64b754bf1?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-02-01T09:30:00Z",
  },
  {
    id: 3003,
    slug: "chocolate-muffins",
    title: "Chocolate Muffins",
    category: "Dessert",
    minutes: 50,
    rating: 4.6,
    tags: ["Χωρίς ζάχαρη", "Βρώμη"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "βρώμη",
      "κακάο",
      "baking powder",
      "ξύσμα πορτοκαλιού",
      "βανίλια",
      "ελαιόλαδο",
      "χυμός πορτοκάλι",
      "πουρές μήλου",
      "γάλα",
      "χουρμάδες",
      "κουβερτούρα",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-02-12T14:00:00Z",
  },
  {
    id: 3004,
    slug: "no-bake-cereal-bars",
    title: "Cereal Bars",
    category: "Snack",
    minutes: 60,
    rating: 4.4,
    tags: ["Χωρίς ψήσιμο", "Υγιεινό"],
    allergensFree: [],
    ingredients: [
      "νιφάδες βρώμης",
      "ξηροί καρποί",
      "χουρμαδόπαστα",
      "κακάο",
      "μέλι",
      "βανίλια",
      "πρωτεΐνη",
      "κουβερτούρα",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1559160580-55d1a6fd4ec4?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-03-05T11:15:00Z",
  },
  {
    id: 3005,
    slug: "carrot-cake",
    title: "Carrot Cake",
    category: "Dessert",
    minutes: 60,
    rating: 4.7,
    tags: ["Καρότο", "Ολικής"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "καρότα",
      "ζάχαρη καστανή",
      "χουρμαδόπαστα",
      "αυγά",
      "ελαιόλαδο",
      "γάλα",
      "γιαούρτι",
      "καρύδια",
      "αμύγδαλα",
      "μπέικιν πάουντερ",
      "κανέλα",
      "μοσχοκάρυδο",
      "γαρύφαλλο",
      "βανίλια",
      "αλάτι",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b72?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-03-18T16:40:00Z",
  },
  {
    id: 3006,
    slug: "carrot-cake-frosting",
    title: "Carrot Cake Frosting (γιαούρτι & τυρί κρέμα)",
    category: "Dessert",
    minutes: 30,
    rating: 4.5,
    tags: ["Frosting", "Επικάλυψη"],
    allergensFree: [],
    ingredients: ["γιαούρτι", "τυρί κρέμα", "ξύσμα λεμονιού", "βανίλια"],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1601972599720-b82e67fce78b?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-03-18T17:00:00Z",
  },
  {
    id: 3007,
    slug: "apple-tart",
    title: "Μηλόπιτα Τάρτα",
    category: "Dessert",
    minutes: 80,
    rating: 4.6,
    tags: ["Τάρτα", "Μήλο"],
    allergensFree: [],
    ingredients: [
      "αλεύρι που φουσκώνει μόνο του",
      "αλεύρι ολικής",
      "μπέικιν πάουντερ",
      "αλάτι",
      "ελαιόλαδο",
      "χυμός πορτοκαλιού",
      "νερό",
      "μήλα",
      "κανέλα",
      "ζάχαρη",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-04-02T12:20:00Z",
  },
  {
    id: 3008,
    slug: "raw-chocolate-bites",
    title: "Ωμά Σοκολατάκια",
    category: "Dessert",
    minutes: 30,
    rating: 4.3,
    tags: ["Χωρίς ψήσιμο", "Χουρμάδες"],
    allergensFree: [],
    ingredients: [
      "χουρμάδες",
      "βρώμη",
      "αμύγδαλα",
      "κακάο",
      "βανίλια",
      "μαύρη σοκολάτα",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-04-20T08:10:00Z",
  },
  {
    id: 3009,
    slug: "almond-cookies",
    title: "Cookies Αμυγδάλου",
    category: "Dessert",
    minutes: 30,
    rating: 4.4,
    tags: ["Αμύγδαλο", "Γρήγορο"],
    allergensFree: [],
    ingredients: [
      "αλεύρι αμυγδάλου",
      "ινδική καρύδα",
      "σταγόνες σοκολάτας",
      "χουρμάδες",
      "baking powder",
      "βανίλια",
      "αλάτι",
      "ελαιόλαδο",
      "αυγό",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-05-03T09:00:00Z",
  },
  {
    id: 3010,
    slug: "homemade-breadsticks",
    title: "Σπιτικά Κριτσίνια",
    category: "Snack",
    minutes: 120,
    rating: 4.5,
    tags: ["Αλμυρό", "Meal prep"],
    allergensFree: [],
    ingredients: [
      "αλεύρι ολικής",
      "αλεύρι για όλες τις χρήσεις",
      "ελαιόλαδο",
      "ρετσίνα",
      "μπέικιν",
      "αλάτι",
      "ζάχαρη",
      "σουσάμι",
      "ρίγανη",
      "βασιλικός",
      "ελιά",
      "καρότο",
      "φέτα",
    ],
    steps: [
      "Προθέρμανε τον φούρνο στους 180°C και στρώσε λαδόκολλα σε ταψάκι.",
      "Λιώσε την κουβερτούρα με τη μαργαρίνη και άφησέ τα 2′ να πέσει η θερμοκρασία.",
      "Χτύπα τα αυγά με το μέλι, πρόσθεσε βανίλια και μετά το μείγμα σοκολάτας.",
      "Κοσκίνισε αλεύρι, κακάο, baking powder και αλάτι και ενσωμάτωσέ τα στο μείγμα.",
      "Πρόσθεσε ψιλοκομμένες φράουλες και ανακάτεψε απαλά.",
      "Ψήσε 22–28′ (ανάλογα το ταψί). Άφησε να κρυώσει πριν κόψεις.",
    ],
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1974&auto=format&fit=crop",
    createdAt: "2025-06-10T13:45:00Z",
  },
];

// -------------------- Utils --------------------
function formatMin(m: number) {
  return m <= 60 ? `${m}′` : `${Math.floor(m / 60)} ώ ${m % 60}′`;
}
function stripGreekAccents(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ");
}
function toGreekSlug(s: string) {
  return stripGreekAccents(s)
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03FF\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// -------------------- UI bits --------------------
function GlassChip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        "bg-white/70 text-slate-800 ring-1 ring-black/10 backdrop-blur shadow-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

function ChipButton({
  children,
  active,
  href,
}: {
  children: React.ReactNode;
  active?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={classNames(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 transition",
        active
          ? "bg-primary text-white ring-primary"
          : "bg-accent/10 text-accent ring-accent/30 hover:bg-accent/15",
        "hover:shadow-sm",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      {children}
    </Link>
  );
}

function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v6l4 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 3.5l2.7 5.6 6.2.9-4.5 4.4 1.1 6.2L12 17.9 6.5 20.6l1.1-6.2L3 10l6.2-.9L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// -------------------- Page --------------------
export default function RecipeDetail() {
  const { query, isReady, asPath } = useRouter();
  const rawParam = (query.slug as string) || "";

  // demo local state for "checked ingredients"
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!isReady) return null;

  // 1) Try API/internal slug (EN)
  let recipe = RECIPES.find((r) => r.slug === rawParam);

  // 2) Fallback: allow direct visits to pretty Greek slug
  if (!recipe) recipe = RECIPES.find((r) => toGreekSlug(r.title) === rawParam);

  if (!recipe) {
    return (
      <>
        <Head>
          <title>Συνταγή δεν βρέθηκε — NutriClinic</title>
          <link
            rel="canonical"
            href={`https://example.gr${asPath.split("?")[0]}`}
          />
        </Head>
        <main className="bg-bg text-slate-800">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <p className="mb-6 text-slate-700">Η συνταγή δεν βρέθηκε.</p>
            <Link
              href="/recipes"
              className={classNames(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
                "bg-white/70 ring-1 ring-black/10 shadow-sm backdrop-blur",
                "hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              )}
            >
              <span aria-hidden="true">←</span> Επιστροφή στις συνταγές
            </Link>
          </div>
        </main>
      </>
    );
  }

  const pretty = toGreekSlug(recipe.title);

  const shownTags = recipe.tags.slice(0, 3);
  const extraTags = Math.max(0, recipe.tags.length - shownTags.length);

  const tagHref = (t: string) =>
    `/recipes?inc=${encodeURIComponent(t)}&page=1`;

  const ingredientId = (s: string) => stripGreekAccents(s).toLowerCase();

  const steps = useMemo(() => recipe.steps ?? [], [recipe.steps]);

  return (
    <>
      <Head>
        <title>{recipe.title} — NutriClinic</title>
        <meta
          name="description"
          content={`${recipe.title} • Χρόνος: ${formatMin(recipe.minutes)}`}
        />
        <link rel="canonical" href={`https://example.gr/recipes/${pretty}`} />
      </Head>

      <main className="bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Back link as pill */}
          <Link
            href="/recipes"
            className={classNames(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold",
              "bg-white/70 ring-1 ring-black/10 shadow-sm backdrop-blur",
              "hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)] transition",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            <span aria-hidden="true">←</span> Πίσω στις συνταγές
          </Link>

          {/* Title + chips */}
          <header className="mt-5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {recipe.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              <GlassChip>{CATEGORY_LABELS[recipe.category]}</GlassChip>
              <GlassChip>
                <ClockIcon />
                {formatMin(recipe.minutes)}
              </GlassChip>
              <GlassChip>
                <StarIcon />
                {recipe.rating.toFixed(1)}
              </GlassChip>
            </div>
          </header>

          {/* Image: wider + 16/9 + overlay badges */}
          <div
            className={classNames(
              "mt-6 overflow-hidden rounded-2xl",
              "bg-white/90 ring-1 ring-black/5 shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            )}
          >
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-cover"
                priority={false}
              />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <GlassChip>{CATEGORY_LABELS[recipe.category]}</GlassChip>
                <GlassChip>
                  <ClockIcon />
                  {formatMin(recipe.minutes)}
                </GlassChip>
                <GlassChip>
                  <StarIcon />
                  {recipe.rating.toFixed(1)}
                </GlassChip>
              </div>
            </div>
          </div>

          {/* Content: 2 columns on desktop */}
          <section className="mt-8 grid gap-6 lg:grid-cols-12">
            {/* Left: Ingredients (sticky) */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-6">
                <div
                  className={classNames(
                    "rounded-2xl bg-white/90 ring-1 ring-black/5",
                    "shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                  )}
                >
                  <div className="px-5 pt-5">
                    <h2 className="text-lg font-semibold">Υλικά</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Ό,τι θα χρειαστείς για τη συνταγή.
                    </p>
                  </div>

                  <div className="px-5 pb-5 pt-4">
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ing) => (
                        <li
                          key={ing}
                          className={classNames(
                            "flex items-start gap-3 rounded-xl px-3 py-2",
                            "hover:bg-black/5 transition"
                          )}
                        >
                          <span
                            className={classNames(
                              "mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full",
                              "bg-accent ring-1 ring-accent/30"
                            )}
                            aria-hidden="true"
                          />
                          <span className="text-sm leading-6 text-slate-800">
                            {ing}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tags (clickable, limited) */}
                {recipe.tags.length > 0 && (
                  <div className="mt-4">
                    <div
                      className={classNames(
                        "rounded-2xl bg-white/90 ring-1 ring-black/5",
                        "shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                      )}
                    >
                      <div className="px-5 pt-5">
                        <h3 className="text-sm font-semibold text-slate-700">
                          Ετικέτες
                        </h3>
                      </div>
                      <div className="px-5 pb-5 pt-3 flex flex-wrap gap-2">
                        {shownTags.map((t) => (
                          <ChipButton key={t} href={tagHref(t)}>
                            {t}
                          </ChipButton>
                        ))}
                        {extraTags > 0 && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200 px-3 py-1 text-xs font-medium">
                            +{extraTags}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Right: Steps */}
            <div className="lg:col-span-8">
              <div
                className={classNames(
                  "rounded-2xl bg-white/90 ring-1 ring-black/5",
                  "shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                )}
              >
                <div className="px-5 pt-5">
                  <h2 className="text-lg font-semibold">Εκτέλεση</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Ακολούθησε τα βήματα με τη σειρά.
                  </p>
                </div>

                <div className="px-5 pb-6 pt-5">
                  {steps.length ? (
                    <ol className="space-y-3">
                      {steps.map((step, i) => (
                        <li
                          key={i}
                          className={classNames(
                            "flex gap-3 rounded-2xl p-4",
                            "bg-white ring-1 ring-black/5 shadow-sm"
                          )}
                        >
                          {/* Step pill */}
                          <div
                            className={classNames(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                              "bg-accent/10 text-accent ring-1 ring-accent/35 font-semibold text-sm"
                            )}
                            aria-label={`Βήμα ${i + 1}`}
                          >
                            {i + 1}
                          </div>
                          <div className="text-slate-700 text-sm leading-7">
                            {step}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-slate-600">Τα βήματα θα προστεθούν σύντομα.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
