import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import type { GetServerSideProps } from "next";
import { useEffect, useMemo, useState } from "react";

import {
  ArticlesApi,
  type ArticlesGetDto,
} from "@/api/ArticlesController";

import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import { toMediaUrl } from "@/api/_axios-client";

type Article = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  heading: string;
  excerpt: string;
  category: string;
  dateISO: string;
  hero: string;
  contentHtml: string;
};

type PageProps = {
  article: Article;
};

function slugifyArticle(title: string, id: number) {
  const base = (title || `article-${id}`)
    .toLowerCase()
    .trim()
    .replace(/ά/g, "α")
    .replace(/έ/g, "ε")
    .replace(/ή/g, "η")
    .replace(/ί/g, "ι")
    .replace(/ό/g, "ο")
    .replace(/ύ/g, "υ")
    .replace(/ώ/g, "ω")
    .replace(/ϊ|ΐ/g, "ι")
    .replace(/ϋ|ΰ/g, "υ")
    .replace(/ς/g, "σ")
    .replace(/[^a-z0-9α-ω\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${base || "article"}-${id}`;
}

function getIdFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/);

  return match ? Number(match[1]) : Number(slug);
}

function stripHtml(value?: string | null) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function resolveArticleImage(image?: string | null): string {
  const value = image?.trim();

  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return toMediaUrl(value);
}

function mapArticleDtoToUi(dto: ArticlesGetDto): Article {
  const content = dto.content ?? "";
  const title = dto.title ?? "";

  return {
    id: dto.id,
    slug: slugifyArticle(title, dto.id),
    title,
    subtitle: dto.subtitle ?? "",
    heading: dto.heading ?? "",

    excerpt:
      dto.subtitle?.trim() ||
      stripHtml(content).slice(0, 160),

    // Use the real category instead of always using "Διατροφή".
    category: dto.category?.trim() || "Χωρίς κατηγορία",

    dateISO: dto.publishedAt ?? "",
    hero: resolveArticleImage(dto.imageUrl),
    contentHtml: content,
  };
}

export const getServerSideProps: GetServerSideProps<
  PageProps
> = async (context) => {
  try {
    const slug = String(context.params?.slug || "");
    const id = getIdFromSlug(slug);

    if (!Number.isFinite(id) || id <= 0) {
      return {
        notFound: true,
      };
    }

    const data = await ArticlesApi.get(id);
    const article = mapArticleDtoToUi(data);

    return {
      props: {
        article,
      },
    };
  } catch (error) {
    console.error(
      "Failed to fetch article by slug:",
      error,
    );

    return {
      notFound: true,
    };
  }
};

export default function ArticlePage({
  article,
}: PageProps) {
  const formattedDate = useMemo(() => {
    if (!article.dateISO) {
      return "—";
    }

    const date = new Date(article.dateISO);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("el-GR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, [article.dateISO]);

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const documentElement =
        document.documentElement;

      const scrollTop =
        documentElement.scrollTop ||
        document.body.scrollTop;

      const scrollHeight =
        documentElement.scrollHeight ||
        document.body.scrollHeight;

      const clientHeight =
        documentElement.clientHeight;

      const total = Math.max(
        1,
        scrollHeight - clientHeight,
      );

      setProgress(
        Math.min(
          1,
          Math.max(0, scrollTop / total),
        ),
      );
    }

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>{`${article.title} — Άρθρα`}</title>

        <meta
          name="description"
          content={article.excerpt}
        />

        <link
          rel="canonical"
          href={`https://example.com/articles/${encodeURIComponent(
            article.slug,
          )}`}
        />

        <meta property="og:type" content="article" />

        <meta
          property="og:title"
          content={`${article.title} — Άρθρα`}
        />

        <meta
          property="og:description"
          content={article.excerpt}
        />

        {article.hero ? (
          <meta
            property="og:image"
            content={article.hero}
          />
        ) : null}

        <meta property="og:locale" content="el_GR" />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />
      </Head>

      <div className="fixed left-0 top-0 z-50 h-0.5 w-full bg-transparent">
        <div
          className="h-full bg-primary transition-[width] duration-75"
          style={{
            width: `${progress * 100}%`,
          }}
          aria-hidden
        />
      </div>

      <article className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200 transition hover:bg-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <span aria-hidden>←</span>
            Πίσω στα άρθρα
          </Link>
        </div>

        <header className="mb-7">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white/95">
              {article.category}
            </span>

            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <span aria-hidden>📅</span>

              <span>
                Δημοσίευση: {formattedDate}
              </span>
            </span>
          </div>

          <h1 className="mt-2 max-w-[22ch] text-3xl font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-4xl">
            {article.title}
          </h1>

          {article.subtitle ? (
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">
              {article.subtitle}
            </p>
          ) : null}
        </header>

        {article.hero ? (
          <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
            <div className="relative aspect-[16/9]">
              <Image
                src={article.hero}
                alt={article.title}
                fill
                priority
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl bg-white/85 p-6 shadow-[0_12px_35px_rgba(164,199,126,0.12)] ring-1 ring-accent/20 md:p-8">
          {article.heading ? (
            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {article.heading}
            </h2>
          ) : null}

          <RichHtmlRenderer
            html={article.contentHtml}
            className="article-rich-content"
          />
        </div>
      </article>
    </>
  );
}