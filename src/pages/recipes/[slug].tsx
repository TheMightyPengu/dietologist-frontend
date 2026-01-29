// pages/recipes/[slug].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

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
  image: string;
  createdAt: string;
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

// -------------------- Page --------------------
export default function RecipeDetail() {
  const { query, isReady, asPath } = useRouter();
  const rawParam = (query.slug as string) || "";

  if (!isReady) return null;

  // 1) Try API/internal slug (EN)
  let recipe = RECIPES.find((r) => r.slug === rawParam);

  // 2) Fallback: allow direct visits to pretty Greek slug
  if (!recipe) {
    recipe = RECIPES.find((r) => toGreekSlug(r.title) === rawParam);
  }

  if (!recipe) {
    return (
      <>
        <Head>
          <title>Συνταγή δεν βρέθηκε — NutriClinic</title>
          <link rel="canonical" href={`https://example.gr${asPath.split("?")[0]}`} />
        </Head>
        <main className="bg-[#fcfcfa] text-slate-800">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            <p className="mb-6 text-slate-700">Η συνταγή δεν βρέθηκε.</p>
            <Link href="/recipes" className="underline">
              ← Επιστροφή στις συνταγές
            </Link>
          </div>
        </main>
      </>
    );
  }

  const pretty = toGreekSlug(recipe.title);

  return (
    <>
      <Head>
        <title>{recipe.title} — NutriClinic</title>
        <meta name="description" content={`${recipe.title} • Χρόνος: ${formatMin(recipe.minutes)}`} />
        {/* Canonical to the pretty Greek path */}
        <link rel="canonical" href={`https://example.gr/recipes/${pretty}`} />
      </Head>

      <main className="bg-[#fcfcfa] text-slate-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/recipes" className="text-sm underline">
            ← Πίσω στις συνταγές
          </Link>

          <h1 className="mt-4 text-3xl md:text-4xl font-semibold">{recipe.title}</h1>
          <div className="mt-2 text-slate-600">
            Κατηγορία: <span className="font-medium">{recipe.category}</span> • Χρόνος:{" "}
            <span className="font-medium">{formatMin(recipe.minutes)}</span> • Βαθμολογία:{" "}
            <span className="font-medium">{recipe.rating.toFixed(1)}</span>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white/90">
            <div className="relative w-full h-80">
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 768px, 100vw"
              />
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">Υλικά</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1">
              {recipe.ingredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          </section>

          {recipe.tags.length > 0 && (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-slate-600">Ετικέτες</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {recipe.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1 text-xs font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
