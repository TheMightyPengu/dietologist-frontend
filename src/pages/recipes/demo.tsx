import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";


// ---------- Dummy data (replace with API later) ----------
const RECIPE = {
  id: 1185,
  slug: "pumpkin-spice-oat-latte",
  title: "Pumpkin Spice Oat Latte",
  category: "Drink",
  quickTags: ["10 ingredients or less", "No cook"],
  totalTimeMin: 10,
  prepTimeMin: 5,
  cookTimeMin: 5,
  baseServings: 2,
  hero:
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1960&auto=format&fit=crop",
  gallery: [
    "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1887&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1887&auto=format&fit=crop",
  ],
  dietary: {
    freeFrom: ["gluten", "egg", "dairy"],
    swapOut: ["use soy milk for higher protein", "maple syrup → date syrup"],
  },
  ingredients: [
    { qty: 400, unit: "ml", item: "barista oat milk" },
    { qty: 120, unit: "ml", item: "strong coffee (or espresso)" },
    { qty: 2, unit: "tbsp", item: "pumpkin purée" },
    { qty: 1, unit: "tbsp", item: "maple syrup" },
    { qty: 0.5, unit: "tsp", item: "pumpkin spice mix" },
    { qty: 0.25, unit: "tsp", item: "vanilla extract" },
    { qty: 1, unit: "pinch", item: "sea salt" },
  ],
  toppings: [
    { qty: 1, unit: "pinch", item: "cinnamon" },
    { qty: 2, unit: "tbsp", item: "whipped coconut cream" },
  ],
  directions: [
    "Warm the oat milk in a small saucepan until steaming.",
    "Whisk in pumpkin purée, maple syrup, pumpkin spice, vanilla, and salt.",
    "Pour coffee into mugs. Top with the spiced oat milk.",
    "Add toppings to taste and serve immediately.",
  ],
  storage: "Best enjoyed fresh. If needed, refrigerate for up to 2 days and re‑warm gently (do not boil).",
  nutritionPerServing: [
    { k: "Energy", v: "168 kcal" },
    { k: "Carbs", v: "26 g" },
    { k: "Protein", v: "3.2 g" },
    { k: "Fat", v: "5.4 g" },
    { k: "Fiber", v: "2.1 g" },
  ],
};

const SIMILAR = [
  {
    id: 1042,
    slug: "iced-vanilla-oat-latte",
    title: "Iced Vanilla Oat Latte",
    time: 5,
    image:
      "https://images.unsplash.com/photo-1494314671902-399b18174975?q=80&w=1887&auto=format&fit=crop",
  },
  {
    id: 1179,
    slug: "spiced-chai-latte",
    title: "Spiced Chai Latte",
    time: 12,
    image:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=2070&auto=format&fit=crop",
  },
  {
    id: 912,
    slug: "creamy-matcha-latte",
    title: "Creamy Matcha Latte",
    time: 7,
    image:
      "https://images.unsplash.com/photo-1522844990619-4951c40f7eda?q=80&w=1974&auto=format&fit=crop",
  },
];

// ---------- Helpers ----------
function formatMin(m: number) {
  return m <= 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60} min`;
}
function fmtQty(q: number) {
  if (Math.abs(q - Math.round(q)) < 1e-9) return String(Math.round(q));
  if (q < 1) return q.toFixed(2).replace(/\.00$/, "");
  return q.toFixed(1).replace(/\.0$/, "");
}

// ---------- Chips ----------
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

// ---------- Page ----------
export default function RecipeDetailDemo() {
  const [servings, setServings] = useState(RECIPE.baseServings);
  const s = RECIPE.baseServings;
  const scale = useMemo(() => servings / s, [servings, s]);

  const scaledIngredients = useMemo(
    () =>
      RECIPE.ingredients.map((ing) => ({
        ...ing,
        qty: ing.qty * scale,
      })),
    [scale]
  );
  const scaledToppings = useMemo(
    () =>
      RECIPE.toppings.map((ing) => ({
        ...ing,
        qty: ing.qty * scale,
      })),
    [scale]
  );

  return (
    <>
      <Head>
        <title>{RECIPE.title} — NutriClinic</title>
        <meta name="description" content={`Recipe: ${RECIPE.title}. ${RECIPE.category}.`} />
        <link
          rel="canonical"
          href={`https://example.gr/recipe/${RECIPE.slug}-${RECIPE.id}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${RECIPE.title} — NutriClinic`} />
        <meta property="og:description" content="A cozy, quick latte recipe demo page." />
        <meta property="og:image" content={RECIPE.hero} />
      </Head>

      <main className="bg-[#F7F7EF] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
          {/* Breadcrumbs */}
          <nav className="py-4 text-sm text-slate-600">
            <Link href="/" className="hover:underline">Αρχική</Link>
            <span className="mx-2">/</span>
            <Link href="/recipes" className="hover:underline">Συνταγές</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900 font-medium">{RECIPE.title}</span>
          </nav>

          {/* Title + Hero */}
          <header className="grid gap-6 md:grid-cols-12 items-start">
            <div className="md:col-span-7 lg:col-span-8 order-2 md:order-1">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">{RECIPE.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip>{RECIPE.category}</Chip>
                {RECIPE.quickTags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-6 text-sm">
                <div className="inline-flex items-center gap-2">
                  <ClockIcon />
                  <span className="font-medium">Σύνολο:</span> {formatMin(RECIPE.totalTimeMin)}
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="font-medium">Προετοιμασία:</span> {formatMin(RECIPE.prepTimeMin)}
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="font-medium">Μαγείρεμα:</span> {formatMin(RECIPE.cookTimeMin)}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={() => window.print()} className="rounded-xl bg-white/90 ring-1 ring-slate-200 px-4 py-2 shadow-sm hover:shadow transition">
                  Εκτύπωση
                </button>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      alert("Ο σύνδεσμος αντιγράφηκε!");
                    } catch {
                      alert("Αποτυχία αντιγραφής");
                    }
                  }}
                  className="rounded-xl bg-white/90 ring-1 ring-slate-200 px-4 py-2 shadow-sm hover:shadow transition"
                >
                  Κοινοποίηση
                </button>
              </div>
            </div>

            <div className="md:col-span-5 lg:col-span-4 order-1 md:order-2">
              <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-sm">
                <img src={RECIPE.hero} alt="Recipe hero" className="w-full h-64 md:h-full object-cover" />
              </div>
            </div>
          </header>

          {/* Content grid */}
          <section className="mt-10 grid gap-8 md:grid-cols-12">
            {/* Left: Ingredients + dietary */}
            <aside className="md:col-span-5 lg:col-span-4 space-y-6">
              {/* Servings scaler */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Μερίδες</div>
                  <div className="inline-flex items-center gap-2">
                    <button
                      className="w-9 h-9 grid place-items-center rounded-xl ring-1 ring-slate-200 bg-white hover:shadow"
                      onClick={() => setServings((v) => Math.max(1, v - 1))}
                    >
                      −
                    </button>
                    <div className="min-w-[2ch] text-center font-semibold">{servings}</div>
                    <button
                      className="w-9 h-9 grid place-items-center rounded-xl ring-1 ring-slate-200 bg-white hover:shadow"
                      onClick={() => setServings((v) => Math.min(24, v + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Dietary badges */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm space-y-3">
                <div className="text-sm font-medium">Free from</div>
                <div className="flex flex-wrap gap-2">
                  {RECIPE.dietary.freeFrom.map((d) => (
                    <span key={d} className="inline-flex items-center gap-2 rounded-full bg-sky-50 ring-1 ring-sky-200 px-3 py-1 text-xs text-sky-700">
                      <ShieldIcon /> {d}
                    </span>
                  ))}
                </div>
                <div className="pt-2 text-sm font-medium">Swap out</div>
                <ul className="list-disc pl-5 text-sm text-slate-700">
                  {RECIPE.dietary.swapOut.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>

              {/* Ingredients */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="font-medium mb-3">Υλικά</div>
                <ul className="space-y-2">
                  {scaledIngredients.map((it, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="w-24 shrink-0 tabular-nums text-slate-900">{fmtQty(it.qty)} {it.unit}</span>
                      <span className="text-slate-700">{it.item}</span>
                    </li>
                  ))}
                </ul>
                {scaledToppings.length > 0 && (
                  <>
                    <div className="mt-4 text-sm font-medium">Προαιρετικά Toppings</div>
                    <ul className="mt-2 space-y-2">
                      {scaledToppings.map((it, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="w-24 shrink-0 tabular-nums text-slate-900">{fmtQty(it.qty)} {it.unit}</span>
                          <span className="text-slate-700">{it.item}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Print-friendly note */}
              <div className="hidden print:block mt-4 text-xs text-slate-500">
                Εκτυπώθηκε από: https://example.gr/recipe/{RECIPE.slug}-{RECIPE.id}
              </div>
            </aside>

            {/* Right: Directions, storage, nutrition, gallery */}
            <article className="md:col-span-7 lg:col-span-8 space-y-8">
              {/* Directions */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Οδηγίες</h2>
                <ol className="list-decimal pl-6 space-y-3 text-slate-700">
                  {RECIPE.directions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Storage */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-6 shadow-sm">
                <h3 className="font-semibold mb-2">Αποθήκευση</h3>
                <p className="text-slate-700 text-sm leading-6">{RECIPE.storage}</p>
              </div>

              {/* Nutrition */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-6 shadow-sm">
                <details>
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Διατροφικά στοιχεία (ανά μερίδα)</h3>
                      <span className="text-sm text-slate-500">εμφάνιση/απόκρυψη</span>
                    </div>
                  </summary>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {RECIPE.nutritionPerServing.map((row) => (
                      <div key={row.k} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-sm">
                        <div className="text-slate-500">{row.k}</div>
                        <div className="font-semibold">{row.v}</div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    Οι τιμές είναι εκτιμήσεις και προορίζονται μόνο για ενημέρωση.
                  </p>
                </details>
              </div>

              {/* Gallery */}
              <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-4 shadow-sm">
                <div className="flex gap-3 overflow-x-auto snap-x">
                  {RECIPE.gallery.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`gallery-${i}`}
                      className="h-40 w-64 object-cover rounded-xl ring-1 ring-black/5 snap-start flex-none"
                    />
                  ))}
                </div>
              </div>
            </article>
          </section>

          {/* Similar recipes */}
          <section className="mt-14">
            <div className="flex items-end justify-between mb-4">
              <h3 className="text-xl font-semibold">Παρόμοιες συνταγές</h3>
              <Link href="/recipes" className="text-sm text-emerald-700 hover:underline">Δείτε όλες</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SIMILAR.map((r) => (
                <Link
                  key={r.id}
                  href={`/recipe/${r.slug}-${r.id}`}
                  className="group rounded-2xl bg-white/90 ring-1 ring-black/5 p-3 shadow-sm hover:shadow transition block"
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img src={r.image} alt={r.title} className="h-44 w-full object-cover group-hover:scale-[1.02] transition" />
                    <div className="absolute top-2 left-2 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs ring-1 ring-black/5">
                      <ClockIcon /> {formatMin(r.time)}
                    </div>
                  </div>
                  <div className="pt-3">
                    <div className="font-medium leading-snug line-clamp-2">{r.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Comments placeholder */}
          <section className="mt-14">
            <h3 className="text-xl font-semibold mb-4">Σχόλια</h3>
            <div className="rounded-2xl bg-white/90 ring-1 ring-black/5 p-6 shadow-sm text-sm text-slate-600">
              Η ενότητα σχολίων/αξιολογήσεων θα συνδεθεί με το API σας. Για τώρα εμφανίζεται ως placeholder.
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          header, nav, section:has(.group) { break-inside: avoid; }
          button, a { display: none !important; }
          main { background: white !important; }
        }
      `}</style>
    </>
  );
}

// ---------- Icons ----------
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
