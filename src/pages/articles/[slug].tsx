import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import { ArticlesApi, type ArticlesGetDto } from "@/api/ArticlesController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";

type Article = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  heading: string;
  excerpt: string;
  category: "Διατροφή" | "Ευεξία" | "Συνταγές" | "Επιστήμη";
  dateISO: string;
  readMinutes: number;
  hero: string | null;
  tags: string[];
  contentHtml: string;
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

function stripHtml(value: string) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateReadMinutes(text: string) {
  const words = stripHtml(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mapArticleDtoToUi(dto: ArticlesGetDto): Article {
  const plainContent = stripHtml(dto.content);

  return {
    id: dto.id,
    slug: slugifyArticle(dto.title, dto.id),
    title: dto.title,
    subtitle: dto.subtitle ?? "",
    heading: dto.heading ?? "",
    excerpt: dto.subtitle?.trim() || plainContent.slice(0, 160) || "",
    category: "Διατροφή",
    dateISO: dto.publishedAt,
    readMinutes: estimateReadMinutes(dto.content),
    hero:
      dto.imageUrl ?? null,
    tags: [],
    contentHtml: dto.content || "",
  };
}

type PageProps = {
  article: Article;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  try {
    const slug = String(ctx.params?.slug || "");
    const data = await ArticlesApi.list();
    const articles = data.map(mapArticleDtoToUi);
    const article = articles.find((a) => a.slug === slug);

    if (!article) {
      return { notFound: true };
    }

    return {
      props: {
        article,
      },
    };
  } catch (error) {
    console.error("Failed to fetch article by slug:", error);
    return { notFound: true };
  }
};

export default function ArticlePage({ article }: { article: Article }) {
  const formattedDate = useMemo(
    () =>
      new Date(article.dateISO).toLocaleDateString("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    [article.dateISO]
  );

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
          href={`https://example.com/articles/${encodeURIComponent(
            article.slug
          )}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${article.title} — Άρθρα`} />
        <meta property="og:description" content={article.excerpt} />
        {article.hero ? <meta property="og:image" content={article.hero} /> : null}
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

      <article className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm font-medium text-slate-800 ring-1 ring-slate-200 hover:bg-white transition focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
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

          <h1 className="mt-2 max-w-[22ch] text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1] text-slate-900">
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
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-8 rounded-3xl bg-white/85 ring-1 ring-accent/20 shadow-[0_12px_35px_rgba(164,199,126,0.12)] p-6 md:p-8">
          {article.heading ? (
            <h2 className="mb-5 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
              {article.heading}
            </h2>
          ) : null}

          <RichHtmlRenderer
            html={article.contentHtml}
            className="article-rich-content"
          />
        </div>

        {article.tags.length > 0 ? (
          <footer className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white px-3 py-1 text-sm text-slate-700 ring-1 ring-slate-200"
              >
                #{tag}
              </span>
            ))}
          </footer>
        ) : null}
      </article>
    </>
  );
}