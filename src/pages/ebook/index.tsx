import Head from "next/head";
import { useEffect, useState } from "react";
import { EbooksApi, type EbooksGetDto } from "../../api/EbooksController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import LeafBurstButton from "@/components/decorative/LeafBurstButton";
import AddToCart from "@/components/cart/AddToCart";
import { isPaidPrice } from "@/lib/cart";
import { toMediaUrl } from "@/api/_axios-client";
import { useTranslations } from "@/components/hooks/useTranslations";
import { useRouter } from "next/router";
import { localizedContent } from "@/lib/localized-content";
import type { getTranslations } from "@/lib/i18n";

type EbookCard = {
  title: string;
  description: string;
};

type EbookContentData = {
  description: string;
  toc: string[];
  bonusTemplates: string[];
  cards: EbookCard[];
};

type EbookViewModel = {
  id: number;
  title: string;
  author: string;
  cover: string;
  priceEUR?: number;
  toc: string[];
  bonusTemplates: string[];
  sampleUrl?: string;
  //buyUrl?: string;
  format: "PDF";
  description: string;
  cards: EbookCard[];
};

type EbookCopy = ReturnType<typeof getTranslations>["ebook"];

const EBOOK_COVER_FALLBACK = "/images/ebook-placeholder.jpg";

function IconCheckList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 6h12M9 12h12M9 18h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3.5 6.2l1.2 1.3L7 5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 12.2l1.2 1.3L7 11.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 18.2l1.2 1.3L7 17.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTarget(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 21a9 9 0 1 1 9-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17a5 5 0 1 1 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 13a1 1 0 1 1 1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 3l-7.2 7.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15.8 3H21v5.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBeaker(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 3h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 3v6l-4.8 8.6A3 3 0 0 0 7.8 22h8.4a3 3 0 0 0 2.6-4.4L14 9V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8 16h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseEbookContent(
  raw?: string | null,
  author?: string | null,
  copy?: EbookCopy,
): EbookContentData {
  if (!copy) throw new Error("Ebook translations are required");
  const defaultCards: EbookCard[] = copy.features.map((feature) => ({ ...feature }));
  const fallbackDescription = `${copy.fallback.descriptionPrefix} ${
    author || copy.fallback.dietitian
  }.`;

  if (!raw) {
    return {
      description: fallbackDescription,
      toc: [],
      bonusTemplates: [...copy.fallback.materials],
      cards: defaultCards,
    };
  }

  try {
    const parsed = JSON.parse(raw);

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return {
        description: String(parsed.description || fallbackDescription),
        toc: Array.isArray(parsed.toc)
          ? parsed.toc
              .map((item: unknown) => stripHtml(String(item)))
              .filter(Boolean)
          : [],
        bonusTemplates: Array.isArray(parsed.bonusTemplates)
          ? parsed.bonusTemplates.map(String).filter(Boolean)
          : [...copy.fallback.materials],
        cards:
          Array.isArray(parsed.cards) && parsed.cards.length
            ? parsed.cards
                .map((card: Partial<EbookCard>) => ({
                  title: String(card.title || "").trim(),
                  description: String(card.description || "").trim(),
                }))
                .filter((card: EbookCard) => card.title || card.description)
            : defaultCards,
      };
    }

    if (Array.isArray(parsed)) {
      return {
        description: fallbackDescription,
        toc: parsed
          .map((item: unknown) => stripHtml(String(item)))
          .filter(Boolean),
        bonusTemplates: [...copy.fallback.materials],
        cards: defaultCards,
      };
    }
  } catch {
    // plain text fallback
  }

  return {
    description: fallbackDescription,
    toc: raw
      .split(/\r?\n|;|,/)
      .map((x) => stripHtml(x))
      .filter(Boolean),
    bonusTemplates: [...copy.fallback.materials],
    cards: defaultCards,
  };
}

function mapDtoToViewModel(dto: EbooksGetDto, copy: EbookCopy, locale?: string): EbookViewModel {
  const author = dto.author?.trim() || copy.fallback.author;

  const content = parseEbookContent(
    localizedContent(locale, dto.tableOfContents, dto.tableOfContentsEn),
    author,
    copy,
  );

  const cover = dto.coverImageUrl
    ? dto.coverImageUrl.startsWith("http://") ||
      dto.coverImageUrl.startsWith("https://")
      ? dto.coverImageUrl
      : toMediaUrl(dto.coverImageUrl)
    : EBOOK_COVER_FALLBACK;

  // const fileUrl = dto.fileUrl
  //   ? dto.fileUrl.startsWith("http://") ||
  //     dto.fileUrl.startsWith("https://")
  //     ? dto.fileUrl
  //     : toMediaUrl(dto.fileUrl)
  //   : undefined;

  return {
    id: dto.id,
    title: localizedContent(locale, dto.title, dto.titleEn),
    author,
    cover,
    priceEUR: dto.price,
    toc: content.toc,
    bonusTemplates: content.bonusTemplates,
    cards: content.cards,

    description:
      localizedContent(locale, dto.description, dto.descriptionEn).trim() ||
      content.description,

    sampleUrl: undefined,
    //buyUrl: fileUrl,
    format: "PDF",
  };
}

export default function EbookPage() {
  const t = useTranslations();
  const router = useRouter();
  const requestedEbookId = typeof router.query.ebook === "string" ? Number(router.query.ebook) : undefined;
  const copy = t.ebook;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ebooks, setEbooks] = useState<EbookViewModel[]>([]);
  const [activeEbookId, setActiveEbookId] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchDirection, setSwitchDirection] = useState<"left" | "right">(
    "right",
  );
  const ebook =
    ebooks.find((item) => item.id === activeEbookId) ?? ebooks[0] ?? null;
  const activeEbookIndex = ebook
    ? ebooks.findIndex((item) => item.id === ebook.id)
    : -1;

  function switchToEbook(nextId: number, direction: "left" | "right") {
    if (nextId === activeEbookId || isSwitching) {
      return;
    }

    setSwitchDirection(direction);
    setIsSwitching(true);

    window.setTimeout(() => {
      setActiveEbookId(nextId);

      window.setTimeout(() => {
        setIsSwitching(false);
      }, 40);
    }, 180);
  }

  function showPreviousEbook() {
    if (ebooks.length <= 1 || activeEbookIndex < 0) {
      return;
    }

    const previousIndex =
      activeEbookIndex === 0 ? ebooks.length - 1 : activeEbookIndex - 1;

    switchToEbook(ebooks[previousIndex].id, "left");
  }

  function showNextEbook() {
    if (ebooks.length <= 1 || activeEbookIndex < 0) {
      return;
    }

    const nextIndex =
      activeEbookIndex === ebooks.length - 1 ? 0 : activeEbookIndex + 1;

    switchToEbook(ebooks[nextIndex].id, "right");
  }

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const items = await EbooksApi.list();

        if (!active) return;

        if (!items.length) {
          setEbooks([]);
          setActiveEbookId(null);
          setError(copy.errors.notFound);
          return;
        }

        const mapped = items.map((item) =>
          mapDtoToViewModel(item, copy, router.locale),
        );

        setEbooks(mapped);
        setActiveEbookId(mapped.find((item) => item.id === requestedEbookId)?.id ?? mapped[0].id);
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : copy.errors.generic);
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [copy, router.locale, requestedEbookId]);

  useEffect(() => {
    if (ebooks.length <= 1) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        showPreviousEbook();
      }

      if (event.key === "ArrowRight") {
        showNextEbook();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ebooks, activeEbookId]);

  const primaryCtaClass = [
    "gap-2 rounded-xl",
    "border border-[rgba(var(--primary-dark),0.16)]",
    "bg-[rgb(var(--primary))] text-white",
    "px-4 py-2 font-medium shadow-[var(--shadow-soft)]",
    "hover:bg-[rgb(var(--primary-dark))]",
    "transition-colors duration-200",
  ].join(" ");

  const footerCtaClass = [
    "gap-2 rounded-xl",
    "border border-white/25 bg-white/12 text-white",
    "px-5 py-3 font-semibold shadow-[var(--shadow-soft)]",
    "hover:bg-white/18 transition-colors duration-200",
  ].join(" ");

  const quietLinkClass = [
    "inline-flex items-center gap-2",
    "text-[rgb(var(--primary))] font-medium",
    "underline underline-offset-4 decoration-[rgba(var(--primary),0.28)]",
    "hover:text-[rgb(var(--accent))] hover:decoration-[rgba(var(--accent),0.65)]",
    "transition-colors",
  ].join(" ");

  const icons = [IconCheckList, IconTarget, IconBeaker];

  return (
    <>
      <Head>
        <title>{copy.meta.title}</title>
        <meta
          name="description"
          content={copy.meta.description}
        />
      </Head>

      <section className="bg-[rgb(var(--bg))] text-[rgb(var(--ink))]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 md:pt-20 pb-10">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8 items-center animate-pulse">
              <div className="h-80 bg-[rgba(var(--primary),0.12)] rounded-2xl" />

              <div className="space-y-4">
                <div className="h-10 bg-[rgba(var(--primary),0.12)] rounded w-3/4" />
                <div className="h-5 bg-[rgba(var(--primary),0.12)] rounded w-full" />
                <div className="h-5 bg-[rgba(var(--primary),0.12)] rounded w-5/6" />
                <div className="h-11 bg-[rgba(var(--primary),0.12)] rounded w-40" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-[rgba(var(--warm),0.55)] border border-[rgba(var(--accent),0.28)] p-4">
              <p className="text-[rgb(var(--ink))]">{error}</p>
            </div>
          ) : ebook ? (
            <>
              {ebooks.length > 1 && (
                <div className="mb-8 rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgba(var(--surface),0.82)] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={showPreviousEbook}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] text-xl text-[rgb(var(--primary))] transition hover:border-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.06)]"
                      aria-label={copy.carousel.previous}
                    >
                      ←
                    </button>

                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-xs font-medium uppercase tracking-wide text-[rgb(var(--muted))]">
                        {copy.carousel.position
                          .replace("{current}", String(activeEbookIndex + 1))
                          .replace("{total}", String(ebooks.length))}
                      </p>

                      <p className="mt-1 truncate text-base font-semibold text-[rgb(var(--ink))]">
                        {ebook.title}
                      </p>

                      {ebooks.length <= 8 && (
                        <div className="mt-3 flex justify-center gap-2">
                          {ebooks.map((item, index) => {
                            const selected = item.id === ebook.id;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  const nextIndex = ebooks.findIndex(
                                    (ebookItem) => ebookItem.id === item.id,
                                  );

                                  switchToEbook(
                                    item.id,
                                    nextIndex < activeEbookIndex
                                      ? "left"
                                      : "right",
                                  );
                                }}
                                className={[
                                  "h-3 rounded-full border transition-all duration-200",
                                  selected
                                    ? "w-8 border-[rgb(var(--primary))] bg-[rgb(var(--primary))]"
                                    : [
                                        "w-3",
                                        "border-[rgba(var(--primary),0.5)]",
                                        "bg-[rgba(var(--primary),0.35)]",
                                        "hover:border-[rgb(var(--primary))]",
                                        "hover:bg-[rgba(var(--primary),0.6)]",
                                      ].join(" "),
                                ].join(" ")}
                                aria-label={copy.carousel.view
                                  .replace("{number}", String(index + 1))
                                  .replace("{title}", item.title)}
                                aria-current={selected ? "true" : undefined}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={showNextEbook}
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] text-xl text-[rgb(var(--primary))] transition hover:border-[rgb(var(--primary))] hover:bg-[rgba(var(--primary),0.06)]"
                      aria-label={copy.carousel.next}
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
              <div
                key={ebook.id}
                className={[
                  "grid md:grid-cols-2 gap-8 items-center",
                  "transition-all duration-300 ease-out",
                  isSwitching
                    ? switchDirection === "right"
                      ? "opacity-0 translate-x-6"
                      : "opacity-0 -translate-x-6"
                    : "opacity-100 translate-x-0",
                ].join(" ")}
              >
                <div className="flex justify-center md:justify-start">
                  <div className="relative w-full max-w-[520px]">
                    <div className="absolute inset-0 rounded-2xl bg-[rgba(var(--accent-soft),0.8)] blur-2xl" />

                    <div
                      className={[
                        "relative rounded-2xl overflow-hidden",
                        "ring-1 ring-[rgba(var(--primary),0.18)]",
                        "shadow-[0_24px_70px_rgba(63,88,52,0.16)]",
                        "bg-[rgb(var(--surface))] aspect-[4/5] transform-gpu",
                        "md:[transform:perspective(1200px)_rotateY(-6deg)_rotateX(2deg)]",
                        "md:hover:[transform:perspective(1200px)_rotateY(-3deg)_rotateX(1deg)]",
                        "transition-transform duration-500",
                      ].join(" ")}
                      aria-label={copy.cover.replace("{title}", ebook.title)}
                    >
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${ebook.cover})`,
                        }}
                      />

                      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/25" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center rounded-full bg-[rgba(var(--surface),0.86)] px-3 py-1 text-xs font-semibold text-[rgb(var(--primary))] ring-1 ring-[rgba(var(--primary),0.18)] shadow-sm">
                    {copy.new}
                  </div>

                  <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight text-[rgb(var(--ink))]">
                    {ebook.title}
                  </h2>

                  <RichHtmlRenderer
                    html={ebook.description}
                    className="ebook-rich-content mt-2 text-[rgb(var(--muted))] leading-relaxed md:leading-7 max-w-prose"
                  />

                  <div className="mt-3 text-sm text-[rgb(var(--muted))]">
                    {copy.author}: {ebook.author}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-[rgba(var(--surface),0.86)] px-3 py-1 border border-[rgba(var(--border),0.9)] shadow-sm text-[rgb(var(--ink))]">
                      {copy.format}: {ebook.format}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    {ebook.sampleUrl && (
                      <a
                        href={ebook.sampleUrl}
                        className={quietLinkClass}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {copy.preview} <span aria-hidden>→</span>
                      </a>
                    )}

                    {/* {ebook.buyUrl ? (
                        <LeafBurstButton
                          text={
                            ebook.priceEUR
                              ? copy.buy.replace("{price}", String(ebook.priceEUR))
                              : copy.download
                          }
                          href=""
                          onClick={() =>
                            window.open(
                              ebook.buyUrl!,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          buttonClassName={primaryCtaClass}
                        />
                      ) : (
                        <LeafBurstButton
                          text={
                            ebook.priceEUR
                              ? copy.buy.replace("{price}", String(ebook.priceEUR))
                              : copy.download
                          }
                          href="/contact"
                          buttonClassName={primaryCtaClass}
                        />
                      )} */}
                    <LeafBurstButton
                      text={
                        ebook.priceEUR
                          ? copy.interestedPrice.replace("{price}", String(ebook.priceEUR))
                          : copy.interested
                      }
                      href="/contact/form"
                      buttonClassName={primaryCtaClass}
                    />
                    {isPaidPrice(ebook.priceEUR) && <AddToCart key={ebook.id} type="ebook" id={ebook.id} limit={1} />}
                  </div>

                  {/* <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                      Άμεση πρόσβαση μετά την πληρωμή.
                    </p> */}
                  <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                    {copy.purchaseMessage}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        {!loading && !error && ebook && (
          <div
            key={`cards-${ebook.id}`}
            className={[
              "mx-auto max-w-6xl px-4 sm:px-6 pb-14",
              "transition-all duration-300",
              isSwitching
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0",
            ].join(" ")}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ebook.cards.map((card, i) => {
                const Ico = icons[i % icons.length];

                return (
                  <div
                    key={`${card.title}-${i}`}
                    className={[
                      "rounded-2xl bg-[rgba(var(--surface),0.82)]",
                      "border border-[rgba(var(--border),0.9)]",
                      "shadow-[var(--shadow-soft)] p-5",
                      "backdrop-blur-sm",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--accent-soft),0.8)] text-[rgb(var(--primary))] ring-1 ring-[rgba(var(--primary),0.16)]">
                        <Ico className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg text-[rgb(var(--ink))]">
                          {card.title}
                        </h3>

                        <RichHtmlRenderer
                          html={card.description}
                          className="ebook-card-rich-content text-[rgb(var(--muted))] mt-1 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && ebook && (
          <div className="bg-[rgb(var(--primary-dark))] text-white">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
              <div className="grid md:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {copy.contents}
                    </h3>

                    <ul className="mt-3 space-y-2 text-white/92">
                      {ebook.toc.length > 0 ? (
                        ebook.toc.map((entry, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 leading-relaxed"
                          >
                            <span className="mt-1 select-none text-[rgb(var(--warm))]">
                              •
                            </span>

                            <span>{entry}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-white/86">
                          {copy.noContents}
                        </li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      Bonus templates
                    </h3>

                    <ul className="mt-3 space-y-2 text-white/92">
                      {ebook.bonusTemplates.map((entry, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 leading-relaxed"
                        >
                          <span className="mt-1 select-none text-[rgb(var(--warm))]">
                            •
                          </span>

                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="md:justify-self-end md:pt-1">
                  {/* {ebook.buyUrl ? (
                      <LeafBurstButton
                        text={
                          ebook.priceEUR
                            ? copy.buyNow.replace("{price}", String(ebook.priceEUR))
                            : copy.downloadNow
                        }
                        href=""
                        onClick={() =>
                          window.open(
                            ebook.buyUrl!,
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                        buttonClassName={footerCtaClass}
                      />
                    ) : (
                      <LeafBurstButton
                        text={
                          ebook.priceEUR
                            ? copy.buyNow.replace("{price}", String(ebook.priceEUR))
                            : copy.downloadNow
                        }
                        href="/contact"
                        buttonClassName={footerCtaClass}
                      />
                    )} */}
                  <LeafBurstButton
                    text={copy.contactToBuy}
                    href="/contact/form"
                    buttonClassName={footerCtaClass}
                  />
                  {/* <p className="mt-2 text-white text-sm">
                      Ασφαλής πληρωμή — Άμεση πρόσβαση.
                    </p> */}
                  <p className="mt-2 text-sm text-white">
                    {copy.purchaseByContact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
