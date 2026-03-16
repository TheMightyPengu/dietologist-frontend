import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Image from "next/image";
import { ArticlesApi, type ArticlesGetDto } from "@/api/ArticlesController";

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

function estimateReadMinutes(text: string) {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function mapContentToBlocks(dto: ArticlesGetDto): string[] {
  const blocks: string[] = [];

  // Το backend έχει Heading αλλά όχι δομημένα content blocks.
  // Προσωρινά βάζουμε το heading σαν πρώτο section title αν υπάρχει.
  if (dto.heading?.trim()) {
    blocks.push(`# ${dto.heading.trim()}`);
  }

  // Το backend έχει Content σαν απλό string.
  // Προσωρινά το σπάμε σε paragraphs με διπλά line breaks.
  const cleanContent = (dto.content || "").trim();

  if (cleanContent) {
    const paragraphs = cleanContent
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (paragraphs.length > 0) {
      blocks.push(...paragraphs);
    }
  }

  // Fallback αν λείπει content
  if (blocks.length === 0) {
    blocks.push("Δεν υπάρχει διαθέσιμο περιεχόμενο για αυτό το άρθρο.");
  }

  return blocks;
}

function mapArticleDtoToUi(dto: ArticlesGetDto): Article {
  return {
    id: dto.id,
    slug: slugifyArticle(dto.title, dto.id),
    title: dto.title,

    // Το backend δεν δίνει excerpt.
    // Προσωρινά χρησιμοποιούμε subtitle ή μικρό κομμάτι από content.
    excerpt:
      dto.subtitle?.trim() ||
      dto.content?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      "",

    // Το backend δεν δίνει category.
    // Placeholder μέχρι να προστεθεί.
    category: "Διατροφή",

    dateISO: dto.publishedAt,

    // Το backend δεν δίνει readMinutes.
    // Πρόχειρος υπολογισμός από το content.
    readMinutes: estimateReadMinutes(dto.content),

    // Το backend δίνει imageUrl.
    // Fallback προσωρινό αν λείπει.
    hero:
      dto.imageUrl ||
      "https://via.placeholder.com/1200x750?text=Article+Image",

    // Το backend δεν δίνει tags.
    // Placeholder μέχρι να προστεθούν.
    tags: [],

    // Το backend δεν δίνει structured blocks.
    // Τα φτιάχνουμε προσωρινά από heading + content.
    content: mapContentToBlocks(dto),
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
    [article.dateISO],
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
          href={`https://example.com/articles/${encodeURIComponent(article.slug)}`}
        />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${article.title} — Άρθρα`} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.hero} />
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
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          </div>
        </header>

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