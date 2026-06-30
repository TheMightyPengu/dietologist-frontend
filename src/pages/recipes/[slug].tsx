import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import { RecipesApi, type RecipesGetDto } from "@/api/RecipesController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import { toMediaUrl } from "@/api/_axios-client";

type Recipe = {
  id: number;
  slug: string;
  title: string;
  category: string;
  minutes: number;
  description: string;
  instructions: string;
  ingredients: string;
  image: string;
  createdAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  Breakfast: "Πρωινό",
  Main: "Κυρίως",
  Snack: "Σνακ",
  Drink: "Ρόφημα",
  Dessert: "Γλυκό",
  Salad: "Σαλάτα",
};

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

function getIdFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/);
  return match ? Number(match[1]) : Number(slug);
}

function stripHtml(value: string) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMin(m: number) {
  return m <= 60 ? `${m}′` : `${Math.floor(m / 60)} ώ ${m % 60}′`;
}

function mapRecipe(dto: RecipesGetDto): Recipe {
  const title = dto.title ?? "";

  return {
    id: dto.id,
    slug: `${toGreekSlug(title) || "recipe"}-${dto.id}`,
    title,
    category: dto.category ?? "",
    minutes: dto.timeToPrepare ?? 0,
    description: dto.description ?? "",
    instructions: dto.instructions ?? "",
    ingredients: dto.ingredients ?? "",
    image: dto.imageUrl ?? "",
    createdAt: dto.createdAt ?? "",
  };
}

type PageProps = {
  recipe: Recipe;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  try {
    const slug = String(ctx.params?.slug || "");
    const id = getIdFromSlug(slug);

    if (!Number.isFinite(id) || id <= 0) {
      return { notFound: true };
    }

    const data = await RecipesApi.get(id);
    const recipe = mapRecipe(data);

    return {
      props: {
        recipe,
      },
    };
  } catch (error) {
    console.error("Failed to fetch recipe by slug:", error);
    return { notFound: true };
  }
};

export default function RecipePage({ recipe }: PageProps) {
  const formattedDate = useMemo(() => {
    if (!recipe.createdAt) return "";

    return new Date(recipe.createdAt).toLocaleDateString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [recipe.createdAt]);

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

  const categoryLabel = CATEGORY_LABELS[recipe.category] ?? recipe.category;
  const metaDescription =
    stripHtml(recipe.description).slice(0, 160) ||
    `Συνταγή: ${recipe.title}`;

  return (
    <>
      <Head>
        <title>{`${recipe.title} — Συνταγές`}</title>
        <meta name="description" content={metaDescription} />
        <link
          rel="canonical"
          href={`https://example.gr/recipes/${encodeURIComponent(
            recipe.slug
          )}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${recipe.title} — Συνταγές`} />
        <meta property="og:description" content={metaDescription} />
        {recipe.image ? <meta property="og:image" content={recipe.image} /> : null}
        <meta property="og:locale" content="el_GR" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
          aria-hidden
        />
      </div>

      <article className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200 hover:bg-white transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <span aria-hidden>←</span>
            Πίσω στις συνταγές
          </Link>
        </div>

        <header className="mb-7">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            {categoryLabel ? (
              <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white/95">
                {categoryLabel}
              </span>
            ) : null}

            {formattedDate ? (
              <>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <span aria-hidden>📅</span>
                  <span>Δημοσίευση: {formattedDate}</span>
                </span>

                <span className="text-slate-300" aria-hidden>
                  •
                </span>
              </>
            ) : null}

            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span aria-hidden>⏱</span>
              <span>{formatMin(recipe.minutes)}</span>
            </span>
          </div>

          <h1 className="mt-2 max-w-[22ch] text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] text-slate-900">
            {recipe.title}
          </h1>

          {recipe.description ? (
            <div className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">
              <RichHtmlRenderer
                html={recipe.description}
                className="recipe-rich-description"
              />
            </div>
          ) : null}
        </header>

        {recipe.image ? (
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="relative aspect-[16/9]">
              <Image
                src={recipe.image.startsWith("/media") ? toMediaUrl(recipe.image) : recipe.image}
                alt={recipe.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <section className="rounded-3xl bg-white/85 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Υλικά
              </h2>

              {recipe.ingredients.trim() ? (
                <RichHtmlRenderer
                  html={recipe.ingredients}
                  className="recipe-rich-content mt-4 text-slate-700"
                />
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  Δεν υπάρχουν καταχωρημένα υλικά.
                </p>
              )}
            </section>

            <section className="rounded-3xl bg-white/85 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Πληροφορίες
              </h2>

              <dl className="mt-4 space-y-3 text-sm">
                {categoryLabel ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Κατηγορία</dt>
                    <dd className="font-medium text-slate-800">
                      {categoryLabel}
                    </dd>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">Χρόνος</dt>
                  <dd className="font-medium text-slate-800">
                    {formatMin(recipe.minutes)}
                  </dd>
                </div>

                {formattedDate ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Ημερομηνία</dt>
                    <dd className="font-medium text-slate-800">
                      {formattedDate}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </aside>

          <section className="rounded-3xl bg-white/85 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] p-6 md:p-8">
            <h2 className="mb-5 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              Εκτέλεση
            </h2>

            {recipe.instructions ? (
              <RichHtmlRenderer
                html={recipe.instructions}
                className="recipe-rich-content"
              />
            ) : (
              <p className="text-slate-600">
                Δεν υπάρχουν καταχωρημένες οδηγίες εκτέλεσης.
              </p>
            )}
          </section>
        </div>
      </article>
    </>
  );
}