// pages/recipes/[slug].tsx
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { RecipesApi, type RecipesGetDto } from "@/api/RecipesController";

// -------------------- Types --------------------
type Recipe = {
  id: number;
  slug: string;
  title: string;
  category: string;
  minutes: number;
  description: string;
  instructions: string;
  ingredients: string[];
  image: string;
  createdAt: string;
};

// -------------------- Labels --------------------
const CATEGORY_LABELS: Record<string, string> = {
  Breakfast: "Πρωινό",
  Main: "Κυρίως",
  Snack: "Σνακ",
  Drink: "Ρόφημα",
  Dessert: "Γλυκό",
  Salad: "Σαλάτα",
};

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

function parseIngredients(value: string | null | undefined): string[] {
  if (!value) return [];

  return value
    .split(/[\n,;•]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseInstructions(value: string | null | undefined): string[] {
  if (!value) return [];

  const lines = value
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  return value
    .split(/[.;]+/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function mapRecipe(dto: RecipesGetDto): Recipe {
  return {
    id: dto.id,
    slug: String(dto.id),
    title: dto.title ?? "",
    category: dto.category ?? "",
    minutes: dto.timeToPrepare ?? 0,
    description: dto.description ?? "",
    instructions: dto.instructions ?? "",
    ingredients: parseIngredients(dto.ingredients),
    image: dto.imageUrl ?? "",
    createdAt: dto.createdAt ?? "",
  };
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

function ImagePlaceholderIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 14.5 10.5 12l3 3 2-2.2 2.5 2.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9.2a1.2 1.2 0 1 0 0 .01"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

// -------------------- Page --------------------
export default function RecipeDetail() {
  const router = useRouter();
  const { query, isReady, asPath } = router;
  const rawParam = (query.slug as string) || "";

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isReady || !rawParam) return;

    let mounted = true;

    async function loadRecipe() {
      try {
        setIsLoading(true);
        setNotFound(false);

        const id = Number(rawParam);

        if (!Number.isNaN(id)) {
          const data = await RecipesApi.get(id);
          if (!mounted) return;
          setRecipe(mapRecipe(data));
          return;
        }

        const list = await RecipesApi.list();
        if (!mounted) return;

        const mapped = list.map(mapRecipe);
        const found = mapped.find((r) => toGreekSlug(r.title) === rawParam);

        if (!found) {
          setRecipe(null);
          setNotFound(true);
          return;
        }

        setRecipe(found);
      } catch (error) {
        if (!mounted) return;
        console.error(error);
        setRecipe(null);
        setNotFound(true);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadRecipe();

    return () => {
      mounted = false;
    };
  }, [isReady, rawParam]);

  const steps = useMemo(
    () => parseInstructions(recipe?.instructions),
    [recipe?.instructions]
  );

  if (!isReady || isLoading) {
    return (
      <main className="bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-10 w-40 rounded-full bg-slate-200 animate-pulse" />
          <div className="mt-6 h-10 w-2/3 rounded bg-slate-200 animate-pulse" />
          <div className="mt-3 flex gap-2">
            <div className="h-8 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-8 w-20 rounded-full bg-slate-200 animate-pulse" />
          </div>
          <div className="mt-6 aspect-[16/9] rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </main>
    );
  }

  if (notFound || !recipe) {
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
  const hasImage = Boolean(recipe.image);

  return (
    <>
      <Head>
        <title>{recipe.title} — NutriClinic</title>
        <meta
          name="description"
          content={recipe.description || `${recipe.title} • Χρόνος: ${formatMin(recipe.minutes)}`}
        />
        <link rel="canonical" href={`https://example.gr/recipes/${pretty}`} />
      </Head>

      <main className="bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
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

          <header className="mt-5">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {recipe.title}
            </h1>

            <div className="mt-3 flex flex-wrap gap-2">
              {recipe.category && (
                <GlassChip>{CATEGORY_LABELS[recipe.category] ?? recipe.category}</GlassChip>
              )}
              <GlassChip>
                <ClockIcon />
                {formatMin(recipe.minutes)}
              </GlassChip>
            </div>

            {recipe.description && (
              <p className="mt-4 max-w-3xl text-slate-600 leading-7">
                {recipe.description}
              </p>
            )}
          </header>

          <div
            className={classNames(
              "mt-6 overflow-hidden rounded-2xl",
              "bg-white/90 ring-1 ring-black/5 shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
            )}
          >
            <div className="relative aspect-[16/9] w-full">
              {hasImage ? (
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-accent/10 to-warm/15">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <ImagePlaceholderIcon />
                      <div className="text-xs font-medium">Χωρίς εικόνα</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {recipe.category && (
                  <GlassChip>{CATEGORY_LABELS[recipe.category] ?? recipe.category}</GlassChip>
                )}
                <GlassChip>
                  <ClockIcon />
                  {formatMin(recipe.minutes)}
                </GlassChip>
              </div>
            </div>
          </div>

          <section className="mt-8 grid gap-6 lg:grid-cols-12">
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
                    {recipe.ingredients.length > 0 ? (
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
                    ) : (
                      <p className="text-sm text-slate-600">
                        Τα υλικά θα προστεθούν σύντομα.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </aside>

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
                  ) : recipe.instructions ? (
                    <div className="text-slate-700 text-sm leading-7 whitespace-pre-line">
                      {recipe.instructions}
                    </div>
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