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

function formatPrice(value: number) {
  return new Intl.NumberFormat("el-GR", {
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
    <div
      className={[
        "rounded-3xl bg-white",
        "ring-1 ring-accent/25 shadow-[0_10px_25px_rgba(164,199,126,0.10)]",
        "shadow-sm",
        "p-6 sm:p-8 lg:p-10",
      ].join(" ")}
    >
      <TitleRow as="h2" size="card">
        {title}
      </TitleRow>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-700">
        {children}
      </div>
    </div>
  </section>
);

export default function ServicesPage() {
  const [copied, setCopied] = useState<null | "phone" | "email">(null);

  const [services, setServices] = useState<ProvidedServicesGetDto[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfoGetDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const siteName = "Διαιτολογικό Κέντρο";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [servicesData, contactData] = await Promise.all([
          ProvidedServicesApi.list(),
          ContactInfoApi.list(),
        ]);

        setServices(Array.isArray(servicesData) ? servicesData : []);
        setContactInfo(
          Array.isArray(contactData) && contactData.length > 0
            ? contactData[0]
            : null
        );
      } catch (err) {
        console.error(err);
        setError("Δεν ήταν δυνατή η φόρτωση των υπηρεσιών αυτή τη στιγμή.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const groupedServices = useMemo(() => {
    const map = new Map<string, ProvidedServicesGetDto[]>();

    for (const service of services) {
      const key = service.category?.trim() || "Λοιπές υπηρεσίες";
      const existing = map.get(key) || [];
      existing.push(service);
      map.set(key, existing);
    }

    return Array.from(map.entries());
  }, [services]);

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
  const location = contactInfo?.location ?? "";

  const phoneRaw = phone.replace(/\s+/g, "");
  const bookHref = "/contact/book";

  return (
    <>
      <Head>
        <title>{`Υπηρεσίες | ${siteName}`}</title>
        <meta
          name="description"
          content="Όλες οι διαθέσιμες υπηρεσίες διατροφής και τα στοιχεία επικοινωνίας."
        />
        <link rel="canonical" href="https://your-domain.gr/services" />
      </Head>

      <div className="relative">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Υπηρεσίες Διατροφής
            </h1>

            <div className="mt-2 h-px w-24 bg-accent/35" />

            <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
              Σε αυτή τη σελίδα θα βρείτε συγκεντρωμένες τις διαθέσιμες υπηρεσίες
              και τους βασικούς τρόπους επικοινωνίας.
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
                <Pill>Όλες οι υπηρεσίες</Pill>
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        <div className="space-y-12 scroll-mt-28">
          <TitleRow as="h2" size="section">
            Διαθέσιμες υπηρεσίες
          </TitleRow>

          {loading ? (
            <SectionCard title="Φόρτωση...">
              <p>Γίνεται φόρτωση των υπηρεσιών.</p>
            </SectionCard>
          ) : error ? (
            <SectionCard title="Σφάλμα">
              <p>{error}</p>
            </SectionCard>
          ) : groupedServices.length === 0 ? (
            <SectionCard title="Δεν υπάρχουν υπηρεσίες">
              <p>Δεν βρέθηκαν διαθέσιμες υπηρεσίες.</p>
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
                      <div
                        key={service.id}
                        className="rounded-2xl bg-white ring-1 ring-accent/20 p-5 shadow-[0_10px_22px_rgba(164,199,126,0.08)]"
                      >
                        <div className="flex flex-col gap-5 md:flex-row">
                          {service.imageUrl ? (
                            <div className="md:w-56 md:shrink-0">
                              <img
                                src={
                                  service.imageUrl.startsWith("http")
                                    ? service.imageUrl
                                    : toMediaUrl(service.imageUrl)
                                }
                                alt={service.imageAltText || service.title || `Υπηρεσία #${service.id}`}
                                className="h-48 w-full rounded-2xl object-cover ring-1 ring-accent/20 md:h-full"
                                loading="lazy"
                              />
                            </div>
                          ) : null}

                          <div className="flex min-w-0 flex-1 flex-col gap-4">
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">
                                {service.title || `Υπηρεσία #${service.id}`}
                              </h3>

                              {service.description ? (
                                <RichHtmlRenderer
                                  html={service.description}
                                  className="service-rich-content mt-2 text-[15px] leading-relaxed text-slate-700"
                                />
                              ) : (
                                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                                  Δεν υπάρχει περιγραφή.
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Pill>Διάρκεια: {service.duration}’</Pill>
                              <Pill>
                                Τιμή: {formatPrice(service.priceIncludingVAT)}
                              </Pill>
                              <Pill>Κατηγορία: {service.category}</Pill>
                            </div>
                          </div>
                        </div>
                      </div>
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
            Για να δεσμεύσετε ραντεβού, μπορείτε να επικοινωνήσετε μαζί μας μέσω
            τηλεφώνου ή email.
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
                      Τηλέφωνο
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
                        Δεν υπάρχει διαθέσιμο τηλέφωνο.
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
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    )}
                  >
                    {copied === "phone" ? "✅ Αντιγράφηκε" : "Αντιγραφή"}
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
                        Δεν υπάρχει διαθέσιμο email.
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
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                    )}
                  >
                    {copied === "email" ? "✅ Αντιγράφηκε" : "Αντιγραφή"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="lg:justify-self-end">
              <LeafBurstButton
                href={bookHref}
                text="ΠΡΟΓΡΑΜΜΑΤΙΣΜΟΣ ΣΥΝΕΔΡΙΑΣ"
                className="w-full lg:w-auto"
              />
            </div>
          </div>

          {location ? (
            <div className="mt-4">
              <Pill>Τοποθεσία: {location}</Pill>
            </div>
          ) : null}
        </SectionReveal>

      </main>
    </>
  );
}
