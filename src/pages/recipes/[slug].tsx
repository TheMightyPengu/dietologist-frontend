import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import { RecipesApi, type RecipesGetDto } from "@/api/RecipesController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import { toMediaUrl } from "@/api/_axios-client";
import { useTranslations } from "@/components/hooks/useTranslations";
import { useRouter } from "next/router";
import { localizedContent } from "@/lib/localized-content";

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
  imageAlt: string;
  createdAt: string;
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

function formatMin(m: number, hourShort: string) {
  return m <= 60 ? `${m}′` : `${Math.floor(m / 60)} ${hourShort} ${m % 60}′`;
}

function resolveRecipeImage(image?: string | null): string {
  const value = image?.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return toMediaUrl(value);
}

function mapRecipe(dto: RecipesGetDto, locale?: string): Recipe {
  const title = localizedContent(locale, dto.title, dto.titleEn);

  return {
    id: dto.id,
    slug: `${toGreekSlug(title) || "recipe"}-${dto.id}`,
    title,
    category: localizedContent(locale, dto.category, dto.categoryEn),
    minutes: dto.timeToPrepare ?? 0,
    description: localizedContent(locale, dto.description, dto.descriptionEn),
    instructions: localizedContent(locale, dto.instructions, dto.instructionsEn),
    ingredients: localizedContent(locale, dto.ingredients, dto.ingredientsEn),
    image: dto.imageUrl ?? "",
    imageAlt:
      localizedContent(locale, dto.imageAltText, dto.imageAltTextEn).trim() ||
      title,
    createdAt: dto.createdAt ?? "",
  };
}

type PageProps = {
  recipe: Recipe;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx,
) => {
  try {
    const slug = String(ctx.params?.slug || "");
    const id = getIdFromSlug(slug);

    if (!Number.isFinite(id) || id <= 0) {
      return { notFound: true };
    }

    const data = await RecipesApi.get(id);
    const recipe = mapRecipe(data, ctx.locale);

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
  const t = useTranslations();
  const router = useRouter();
  const locale = router.locale === "en" ? "en-US" : "el-GR";
  const formattedDate = useMemo(() => {
    if (!recipe.createdAt) return "";

    return new Date(recipe.createdAt).toLocaleDateString(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [recipe.createdAt, locale]);

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

  const categoryLabel =
    t.recipes.categories[recipe.category as keyof typeof t.recipes.categories] ??
    recipe.category;
  const recipeImageUrl = resolveRecipeImage(recipe.image);
  const metaDescription =
    stripHtml(recipe.description).slice(0, 160) || `${t.recipes.meta.detailSuffix}: ${recipe.title}`;

  return (
    <>
      <Head>
        <title>{`${recipe.title} — ${t.recipes.meta.detailSuffix}`}</title>
        <meta name="description" content={metaDescription} />
        <link
          rel="canonical"
          href={`https://example.gr/recipes/${encodeURIComponent(recipe.slug)}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${recipe.title} — ${t.recipes.meta.detailSuffix}`} />
        <meta property="og:description" content={metaDescription} />
        {recipeImageUrl ? (
          <meta property="og:image" content={recipeImageUrl} />
        ) : null}{" "}
        <meta property="og:locale" content={router.locale === "en" ? "en_US" : "el_GR"} />
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
            {t.recipes.detail.back}
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
                  <span>{t.recipes.detail.published}: {formattedDate}</span>
                </span>

                <span className="text-slate-300" aria-hidden>
                  •
                </span>
              </>
            ) : null}

            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span aria-hidden>⏱</span>
              <span>{formatMin(recipe.minutes, t.recipes.filters.hourShort)}</span>
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

        {recipeImageUrl ? (
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="relative aspect-[16/9]">
              <Image
                src={recipeImageUrl}
                alt={recipe.imageAlt}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <section className="min-w-0 rounded-3xl bg-white/85 p-4 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t.recipes.detail.ingredients}
              </h2>

              {recipe.ingredients.trim() ? (
                <RichHtmlRenderer
                  html={recipe.ingredients}
                  className="recipe-rich-content mt-4 text-slate-700"
                />
              ) : (
                <p className="mt-4 text-sm text-slate-600">
                  {t.recipes.detail.noIngredients}
                </p>
              )}
            </section>

            <section className="min-w-0 rounded-3xl bg-white/85 p-4 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                {t.recipes.detail.information}
              </h2>

              <dl className="mt-4 space-y-3 text-sm">
                {categoryLabel ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">{t.recipes.detail.category}</dt>
                    <dd className="font-medium text-slate-800">
                      {categoryLabel}
                    </dd>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-slate-500">{t.recipes.detail.time}</dt>
                  <dd className="font-medium text-slate-800">
                    {formatMin(recipe.minutes, t.recipes.filters.hourShort)}
                  </dd>
                </div>

                {formattedDate ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">{t.recipes.detail.date}</dt>
                    <dd className="font-medium text-slate-800">
                      {formattedDate}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </aside>

          <section className="min-w-0 rounded-3xl bg-white/85 p-4 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] sm:p-6 md:p-8">
            <h2 className="mb-5 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {t.recipes.detail.instructions}
            </h2>

            {recipe.instructions ? (
              <RichHtmlRenderer
                html={recipe.instructions}
                className="recipe-rich-content"
              />
            ) : (
              <p className="text-slate-600">
                {t.recipes.detail.noInstructions}
              </p>
            )}
          </section>
        </div>
      </article>
    </>
  );
}
