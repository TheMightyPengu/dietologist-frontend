import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { SectionReveal } from "@/components/SectionReveal";
import LeafBurstButton from "@/components/decorative/LeafBurstButton";
import {
  ContactInfoApi,
  type ContactInfoGetDto,
} from "@/api/ContactInfoController";
import {
  ProvidedServicesApi,
  type ProvidedServicesGetDto,
} from "@/api/ProvidedServicesController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import { toMediaUrl } from "@/api/_axios-client";
import { usePageHeader } from "@/lib/usePageHeader";
import { useTranslations } from "@/components/hooks/useTranslations";
import { localizedContent } from "@/lib/localized-content";
import { useRouter } from "next/router";

type PillProps = { children: React.ReactNode };

const Pill = ({ children }: PillProps) => (
  <span
    className={[
      "inline-flex items-center rounded-full bg-white",
      "ring-1 ring-accent/40",
      "shadow-[0_1px_0_rgba(164,199,126,0.25)]",
      "px-3 py-1 text-sm leading-none text-slate-800",
    ].join(" ")}
  >
    {children}
  </span>
);

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function formatPrice(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function getServiceCategoryAnchor(category: string) {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, "-");
  return `service-category-${encodeURIComponent(normalized || "loipes-ypiresies")}`;
}

function TitleRow({
  as = "h2",
  children,
  size = "card",
}: {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  size?: "section" | "card" | "cta";
}) {
  const Tag: React.ElementType = as;

  const titleClass =
    size === "section"
      ? "text-xl sm:text-2xl font-semibold text-slate-900"
      : size === "cta"
        ? "text-xl sm:text-2xl font-semibold text-slate-900"
        : "text-lg sm:text-xl font-semibold tracking-tight text-slate-900";

  return (
    <div className="flex items-center gap-3">
      <Tag className={titleClass}>{children}</Tag>
      <span className="hidden sm:inline-block h-[2px] w-20 rounded-full bg-accent/40" />
    </div>
  );
}

const SectionCard: React.FC<
  React.PropsWithChildren<{
    title: React.ReactNode;
    id?: string;
  }>
> = ({ title, id, children }) => (
  <section id={id} className="scroll-mt-28">
    <div>
      <TitleRow as="h2" size="card">
        {title}
      </TitleRow>

      <div className="mt-6 space-y-6 text-[15px] leading-relaxed text-slate-700">
        {children}
      </div>
    </div>
  </section>
);

export default function ServicesPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = router.locale === "en" ? "en-US" : "el-GR";
  const pageHeader = usePageHeader("services", {
    title: t.services.availableServices,
    description: t.services.meta.description,
  });

  const [copied, setCopied] = useState<null | "phone" | "email">(null);

  const [services, setServices] = useState<ProvidedServicesGetDto[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfoGetDto | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [servicesData, contactData] = await Promise.all([
          ProvidedServicesApi.list(),
          ContactInfoApi.list(),
        ]);

        setServices(
          Array.isArray(servicesData)
            ? servicesData.map((service) => ({
                ...service,
                title: localizedContent(router.locale, service.title, service.titleEn),
                category: localizedContent(router.locale, service.category, service.categoryEn),
                description: localizedContent(router.locale, service.description, service.descriptionEn),
                imageAltText: localizedContent(router.locale, service.imageAltText, service.imageAltTextEn),
              }))
            : [],
        );
        setContactInfo(
          Array.isArray(contactData) && contactData.length > 0
            ? contactData[0]
            : null,
        );
      } catch (err) {
        console.error(err);
        setError(t.services.errors.load);
      } finally {
        setLoading(false);
      }
    })();
  }, [t.services.errors.load, router.locale]);

  const groupedServices = useMemo(() => {
    const map = new Map<string, ProvidedServicesGetDto[]>();

    for (const service of services) {
      const key = service.category?.trim() || t.services.otherCategory;
      const existing = map.get(key) || [];
      existing.push(service);
      map.set(key, existing);
    }

    return Array.from(map.entries());
  }, [services, t.services.otherCategory]);

  useEffect(() => {
    if (loading || groupedServices.length === 0) return;
    if (typeof window === "undefined") return;

    const hash = window.location.hash.replace("#", "");
    if (!hash) return;

    window.requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [loading, groupedServices]);

  const phone = contactInfo?.telephone ?? "";
  const email = contactInfo?.email ?? "";
  const location = localizedContent(
    router.locale,
    contactInfo?.location,
    contactInfo?.locationEn,
  );

  const phoneRaw = phone.replace(/\s+/g, "");
  const bookHref = "/contact/book";

  return (
    <>
      <Head>
        <title>{t.services.meta.title}</title>
        <meta name="description" content={t.services.meta.description} />
        <link rel="canonical" href="https://your-domain.gr/services" />
      </Head>

      <div className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {pageHeader.title}
            </h1>

            <div className="mt-2 h-px w-24 bg-accent/35" />

            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
              {pageHeader.description}
            </p>
          </header>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex flex-wrap gap-2 sm:flex-1">
              <span
                className={[
                  "rounded-full focus:outline-none",
                  "focus-visible:ring-4 focus-visible:ring-primary/20",
                ].join(" ")}
              >
                <Pill>{t.services.allServices}</Pill>
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        <div className="space-y-12 scroll-mt-28">
          <TitleRow as="h2" size="section">
            {t.services.availableServices}
          </TitleRow>

          {loading ? (
            <SectionCard title={t.services.loading.title}>
              <p>{t.services.loading.text}</p>
            </SectionCard>
          ) : error ? (
            <SectionCard title={t.services.errors.load}>
              <p>{error}</p>
            </SectionCard>
          ) : groupedServices.length === 0 ? (
            <SectionCard title={t.services.empty.title}>
              <p>{t.services.empty.text}</p>
            </SectionCard>
          ) : (
            groupedServices.map(([category, items]) => (
              <SectionReveal key={category} className="space-y-6">
                <SectionCard
                  title={category}
                  id={getServiceCategoryAnchor(category)}
                >
                  <div className="space-y-4">
                    {items.map((service) => (
                      <article
                        key={service.id}
                        className={[
                          "overflow-hidden rounded-3xl",
                          "bg-bg/40",
                          "ring-1 ring-accent/20",
                          "shadow-[0_12px_30px_rgba(164,199,126,0.10)]",
                          "transition-shadow duration-300",
                          "hover:shadow-[0_18px_42px_rgba(164,199,126,0.16)]",
                        ].join(" ")}
                      >
                        {/* IMAGE HEADER */}
                        {service.imageUrl ? (
                          <div className="p-3 pb-0 sm:p-4 sm:pb-0">
                            <div className="overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-accent/20">
                              <div className="aspect-[16/9] sm:aspect-[16/6]">
                                <img
                                  src={
                                    service.imageUrl.startsWith("http")
                                      ? service.imageUrl
                                      : toMediaUrl(service.imageUrl)
                                  }
                                  alt={
                                    service.imageAltText ||
                                    service.title ||
                                    t.services.serviceFallback.replace("{id}", String(service.id))
                                  }
                                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {/* CONTENT */}
                        <div className="p-5 sm:p-6 lg:p-7">
                          <h3 className="text-lg sm:text-xl font-semibold leading-snug text-slate-900">
                            {service.title ||
                              t.services.serviceFallback.replace("{id}", String(service.id))}
                          </h3>

                          {service.description ? (
                            <RichHtmlRenderer
                              html={service.description}
                              className="service-rich-content mt-4 text-[15px] leading-relaxed text-slate-700"
                            />
                          ) : (
                            <p className="mt-4 text-[15px] leading-relaxed text-slate-700">
                              {t.services.noDescription}
                            </p>
                          )}

                          <div className="mt-6 flex flex-wrap gap-2 border-t border-accent/15 pt-4">
                            <Pill>
                              {t.services.service.duration}: {service.duration}’
                            </Pill>

                            <Pill>
                              {t.services.service.price}:{" "}
                              {formatPrice(
                                service.priceIncludingVAT,
                                locale,
                              )}
                            </Pill>

                            <Pill>
                              {t.services.service.category}: {service.category}
                            </Pill>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </SectionReveal>
            ))
          )}
        </div>

        <SectionReveal
          className={[
            "rounded-3xl bg-white",
            "ring-1 ring-accent/25",
            "shadow-[0_14px_34px_rgba(164,199,126,0.12)]",
            "p-6 sm:p-8",
          ].join(" ")}
        >
          <p className="text-[15px] leading-relaxed text-slate-700">
            {t.services.contact.intro}
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-3 lg:items-center">
            <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 shadow-[0_10px_22px_rgba(164,199,126,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 text-accent" aria-hidden="true">
                    📞
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.services.contact.phone}
                    </p>

                    {phone ? (
                      <a
                        href={`tel:${phoneRaw}`}
                        className="mt-1 inline-flex text-sm text-slate-700 hover:text-accent transition"
                      >
                        {phone}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">
                        {t.services.contact.phoneUnavailable}
                      </p>
                    )}
                  </div>
                </div>

                {phone ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(phone);

                      if (ok) {
                        setCopied("phone");
                        setTimeout(() => setCopied(null), 1200);
                      }
                    }}
                    className={classNames(
                      "shrink-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition",
                      "bg-white ring-1 ring-primary/30",
                      "hover:ring-primary/55 hover:bg-primary/5",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                    )}
                  >
                    {copied === "phone"
                      ? t.services.contact.copied
                      : t.services.contact.copy}{" "}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl bg-white ring-1 ring-accent/20 p-4 shadow-[0_10px_22px_rgba(164,199,126,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 text-accent" aria-hidden="true">
                    ✉️
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      Email
                    </p>

                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className="mt-1 inline-flex text-sm text-slate-700 hover:text-accent transition break-all"
                      >
                        {email}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-500">
                        {t.services.contact.emailUnavailable}
                      </p>
                    )}
                  </div>
                </div>

                {email ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyToClipboard(email);

                      if (ok) {
                        setCopied("email");
                        setTimeout(() => setCopied(null), 1200);
                      }
                    }}
                    className={classNames(
                      "shrink-0 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm transition",
                      "bg-white ring-1 ring-primary/30",
                      "hover:ring-primary/55 hover:bg-primary/5",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                    )}
                  >
                    {copied === "email"
                      ? t.services.contact.copied
                      : t.services.contact.copy}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="lg:justify-self-end">
              <LeafBurstButton
                href={bookHref}
                text={t.services.contact.book}
                className="w-full lg:w-auto"
              />
            </div>
          </div>

          {location ? (
            <div className="mt-4">
              <Pill>
                {t.services.contact.location}: {location}
              </Pill>{" "}
            </div>
          ) : null}
        </SectionReveal>
      </main>
    </>
  );
}
