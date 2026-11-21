import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import {
  createSeminarRegistration,
  getSeminars,
  type Seminar,
} from "@/api/SeminarsController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import LeafBurstButton from "@/components/decorative/LeafBurstButton";
import { toMediaUrl } from "@/api/_axios-client";
import { usePageHeader } from "@/lib/usePageHeader";
import { useTranslations } from "@/components/hooks/useTranslations";
import { localizedContent } from "@/lib/localized-content";
import { useRouter } from "next/router";

type SortKey = "dateNear" | "dateFar" | "durationAsc" | "durationDesc";

type DatePreset = "all" | "upcoming" | "today" | "past";
type PricePreset = "all" | "free" | "paid";

const PAGE_SIZE = 9;

const IMAGE_FALLBACK = "/images/seminar-placeholder.webp";

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function paginateNumbers(
  totalPages: number,
  currentPage: number,
): Array<number | "…"> {
  const maximumVisible = 7;

  if (totalPages <= maximumVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "…"> = [];
  const left = Math.max(2, currentPage - 1);
  const right = Math.min(totalPages - 1, currentPage + 1);

  pages.push(1);

  if (left > 2) {
    pages.push("…");
  }

  for (let page = left; page <= right; page += 1) {
    pages.push(page);
  }

  if (right < totalPages - 1) {
    pages.push("…");
  }

  pages.push(totalPages);

  return pages;
}

function getPriceLabel(price: number, freeLabel: string) {
  return price > 0 ? `${price}€` : freeLabel;
}

function formatParts(
  value: string,
  locale: string,
  dateFallback: string,
  timeFallback: string,
) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: dateFallback, time: timeFallback };
  }

  return {
    date: parsed.toLocaleDateString(locale),
    time: parsed.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function getSeminarStatus(dateTime: string) {
  const date = new Date(dateTime);

  if (!dateTime || isNaN(date.getTime())) {
    return "unknown";
  }

  const now = new Date();

  if (date >= startOfDay(now) && date <= endOfDay(now)) {
    return "today";
  }

  if (date > now) {
    return "upcoming";
  }

  return "past";
}

function getStatusBadge(
  dateTime: string,
  labels: {
    today: string;
    upcoming: string;
    past: string;
    soon: string;
  },
) {
  const status = getSeminarStatus(dateTime);

  if (status === "today") {
    return {
      label: labels.today,
      className: "bg-amber-100 text-amber-800 ring-amber-200",
    };
  }

  if (status === "upcoming") {
    return {
      label: labels.upcoming,
      className: "bg-primary text-white ring-primary",
    };
  }

  if (status === "past") {
    return {
      label: labels.past,
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  }

  return {
    label: labels.soon,
    className: "bg-slate-100 text-slate-600 ring-slate-200",
  };
}
function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1",
        className || "bg-primary/10 text-primary ring-primary/15",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function RadioRow({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-50">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
      />

      <span className="text-sm text-slate-800">{label}</span>
    </label>
  );
}

function Pill({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        active
          ? "bg-primary text-white"
          : "bg-primary/10 text-primary ring-1 ring-primary/15",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export default function SeminarsPage() {
  const t = useTranslations();
  const router = useRouter();
  const localeCode = router.locale === "en" ? "en-US" : "el-GR";
  const pageHeader = usePageHeader("seminars", {
    title: t.common.nav.seminars,
    description: t.seminars.meta.description,
  });
  const [items, setItems] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeSet, setTypeSet] = useState<Set<string>>(new Set());
  const [durationRange, setDurationRange] = useState<[number, number]>([
    0, 180,
  ]);
  const [datePreset, setDatePreset] = useState<DatePreset>("upcoming");
  const [pricePreset, setPricePreset] = useState<PricePreset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("dateNear");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Seminar | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [registrationName, setRegistrationName] = useState("");
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [registrationErrors, setRegistrationErrors] = useState<{ name?: string; email?: string }>({});
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getSeminars();

        if (!alive) return;

        const localizedItems = data.map((seminar) => ({
          ...seminar,
          title: localizedContent(router.locale, seminar.title, seminar.titleEn),
          description: localizedContent(
            router.locale,
            seminar.description,
            seminar.descriptionEn,
          ),
          content: localizedContent(router.locale, seminar.content, seminar.contentEn),
          imageAltText: localizedContent(
            router.locale,
            seminar.imageAltText,
            seminar.imageAltTextEn,
          ),
        }));

        setItems(localizedItems);

        const durations = localizedItems.map((s) => s.duration || 0).filter((x) => x > 0);

        if (durations.length) {
          setDurationRange([Math.min(...durations), Math.max(...durations)]);
        }
      } catch {
        if (!alive) return;
        setError(t.seminars.loadError);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, [t.seminars.loadError, router.locale]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || registrationSubmitting) return;

      setOpen(false);
      setActive(null);
      setRegistrationOpen(false);
      setRegistrationErrors({});
      setRegistrationError(null);
      setRegistrationSucceeded(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, registrationSubmitting]);

  const types = useMemo(() => {
    return Array.from(new Set(items.map((s) => s.type).filter(Boolean))).sort(
      (a, b) => a.localeCompare(b, "el"),
    );
  }, [items]);

  const minDuration = useMemo(() => {
    const durations = items.map((s) => s.duration || 0).filter((x) => x > 0);
    return durations.length ? Math.min(...durations) : 0;
  }, [items]);

  const maxDuration = useMemo(() => {
    const durations = items.map((s) => s.duration || 0).filter((x) => x > 0);
    return durations.length ? Math.max(...durations) : 180;
  }, [items]);

  useEffect(() => {
    setPage(1);
  }, [query, typeSet, durationRange, datePreset, pricePreset, sortKey]);

  function toggleType(type: string) {
    setTypeSet((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function resetAll() {
    setQuery("");
    setTypeSet(new Set());
    setDurationRange([minDuration, maxDuration]);
    setDatePreset("upcoming");
    setPricePreset("all");
    setSortKey("dateNear");
    setPage(1);
  }

  function openModal(seminar: Seminar) {
    setActive(seminar);
    setOpen(true);
  }

  function closeModal() {
    if (registrationSubmitting) return;
    setOpen(false);
    setActive(null);
    closeRegistrationModal();
  }

  function openRegistrationModal() {
    if (!active?.isBookingAvailable) return;

    setRegistrationName("");
    setRegistrationEmail("");
    setRegistrationErrors({});
    setRegistrationError(null);
    setRegistrationSucceeded(false);
    setRegistrationOpen(true);
  }

  function closeRegistrationModal() {
    if (registrationSubmitting) return;
    setRegistrationOpen(false);
    setRegistrationErrors({});
    setRegistrationError(null);
    setRegistrationSucceeded(false);
  }

  async function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || registrationSubmitting) return;

    const name = registrationName.trim();
    const email = registrationEmail.trim();
    const errors: { name?: string; email?: string } = {};

    if (!name) errors.name = t.seminars.registration.nameRequired;
    if (!email) errors.email = t.seminars.registration.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t.seminars.registration.emailInvalid;
    }

    setRegistrationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setRegistrationSubmitting(true);
      setRegistrationError(null);
      await createSeminarRegistration(active.id, { name, email });
      setRegistrationSucceeded(true);
    } catch (error: unknown) {
      setRegistrationError(
        error instanceof Error ? error.message : t.seminars.registration.submitError,
      );
    } finally {
      setRegistrationSubmitting(false);
    }
  }

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = items.filter((s) => {
      if (q) {
        const haystack = [
          s.title,
          stripHtml(s.description),
          stripHtml(s.content),
          s.type,
          String(s.price),
          String(s.duration),
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(q)) return false;
      }

      if (typeSet.size > 0 && !typeSet.has(s.type)) return false;

      const status = getSeminarStatus(s.dateTime);

      if (
        datePreset === "upcoming" &&
        status !== "upcoming" &&
        status !== "today"
      ) {
        return false;
      }

      if (datePreset === "today" && status !== "today") {
        return false;
      }

      if (datePreset === "past" && status !== "past") {
        return false;
      }

      if (pricePreset === "free" && s.price > 0) {
        return false;
      }

      if (pricePreset === "paid" && s.price <= 0) {
        return false;
      }

      if (s.duration < durationRange[0] || s.duration > durationRange[1]) {
        return false;
      }

      return true;
    });

    list = list.sort((a, b) => {
      const now = Date.now();

      const aTime = new Date(a.dateTime).getTime();
      const bTime = new Date(b.dateTime).getTime();

      const aHasValidDate = !Number.isNaN(aTime);
      const bHasValidDate = !Number.isNaN(bTime);

      switch (sortKey) {
        case "dateNear": {
          if (!aHasValidDate && !bHasValidDate) {
            return a.id - b.id;
          }

          if (!aHasValidDate) {
            return 1;
          }

          if (!bHasValidDate) {
            return -1;
          }

          const difference = Math.abs(aTime - now) - Math.abs(bTime - now);

          return difference !== 0 ? difference : a.id - b.id;
        }

        case "dateFar": {
          if (!aHasValidDate && !bHasValidDate) {
            return a.id - b.id;
          }

          if (!aHasValidDate) {
            return 1;
          }

          if (!bHasValidDate) {
            return -1;
          }

          const difference = Math.abs(bTime - now) - Math.abs(aTime - now);

          return difference !== 0 ? difference : a.id - b.id;
        }

        case "durationAsc": {
          const difference = Number(a.duration) - Number(b.duration);

          return difference !== 0 ? difference : a.id - b.id;
        }

        case "durationDesc": {
          const difference = Number(b.duration) - Number(a.duration);

          return difference !== 0 ? difference : a.id - b.id;
        }

        default:
          return 0;
      }
    });

    return list;
  }, [items, query, typeSet, durationRange, datePreset, pricePreset, sortKey]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> =
      [];

    const q = query.trim();

    if (q) {
      chips.push({
        key: "q",
        label: `${t.seminars.chips.search}: “${q}”`,
        onRemove: () => setQuery(""),
      });
    }

    Array.from(typeSet).forEach((type) => {
      chips.push({
        key: `type:${type}`,
        label: type,
        onRemove: () => toggleType(type),
      });
    });

    if (datePreset !== "upcoming") {
      chips.push({
        key: `date:${datePreset}`,
        label:
          datePreset === "all"
            ? t.seminars.chips.allSeminars
            : datePreset === "today"
              ? t.seminars.status.today
              : t.seminars.chips.completed,
        onRemove: () => setDatePreset("upcoming"),
      });
    }

    if (pricePreset !== "all") {
      chips.push({
        key: `price:${pricePreset}`,
        label: pricePreset === "free" ? t.seminars.free : t.seminars.chips.paid,
        onRemove: () => setPricePreset("all"),
      });
    }

    if (durationRange[0] !== minDuration || durationRange[1] !== maxDuration) {
      chips.push({
        key: "duration",
        label: `${t.seminars.chips.exactDuration}: ${durationRange[0]}–${durationRange[1]}′`,
        onRemove: () => setDurationRange([minDuration, maxDuration]),
      });
    }

    return chips;
  }, [
    query,
    typeSet,
    durationRange,
    minDuration,
    maxDuration,
    datePreset,
    pricePreset,
    t.seminars,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));

  const pageClamped = Math.min(totalPages, Math.max(1, page));

  const pagedSeminars = filteredSorted.slice(
    (pageClamped - 1) * PAGE_SIZE,
    pageClamped * PAGE_SIZE,
  );

  const renderFilters = (inDrawer = false) => (
    <aside
      className={[
        "rounded-2xl bg-white ring-1 ring-slate-200 p-5",
        inDrawer ? "" : "h-fit lg:sticky lg:top-24 self-start",
      ].join(" ")}
      aria-label={t.seminars.filters.aria}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{t.seminars.filters.title}</h2>

        <button
          type="button"
          onClick={resetAll}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:text-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t.seminars.filters.clear}
        </button>
      </div>
      <div className="mb-5">
        <label
          htmlFor={inDrawer ? "seminars-q-drawer" : "seminars-q"}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          {t.seminars.filters.search}
        </label>

        <input
          id={inDrawer ? "seminars-q-drawer" : "seminars-q"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.seminars.filters.searchPlaceholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-primary/20"
        />
      </div>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          {t.seminars.filters.type}
        </legend>

        <div className="flex flex-col gap-1.5">
          {types.length === 0 ? (
            <p className="text-sm text-slate-500">{t.seminars.filters.noTypes}</p>
          ) : (
            types.map((type) => {
              const checked = typeSet.has(type);

              return (
                <label
                  key={type}
                  className={[
                    "flex cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-slate-50",
                    checked ? "bg-primary/5" : "",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    checked={checked}
                    onChange={() => toggleType(type)}
                  />

                  <span className="text-sm text-slate-800">{type}</span>
                </label>
              );
            })
          )}
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          {t.seminars.filters.status}
        </legend>

        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label={t.seminars.filters.upcoming}
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "upcoming"}
            onChange={() => setDatePreset("upcoming")}
          />

          <RadioRow
            label={t.seminars.filters.today}
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "today"}
            onChange={() => setDatePreset("today")}
          />

          <RadioRow
            label={t.seminars.filters.completed}
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "past"}
            onChange={() => setDatePreset("past")}
          />

          <RadioRow
            label={t.seminars.filters.all}
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "all"}
            onChange={() => setDatePreset("all")}
          />
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          {t.seminars.filters.price}
        </legend>

        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label={t.seminars.filters.all}
            name={inDrawer ? "seminar-price-drawer" : "seminar-price"}
            checked={pricePreset === "all"}
            onChange={() => setPricePreset("all")}
          />

          <RadioRow
            label={t.seminars.free}
            name={inDrawer ? "seminar-price-drawer" : "seminar-price"}
            checked={pricePreset === "free"}
            onChange={() => setPricePreset("free")}
          />

          <RadioRow
            label={t.seminars.filters.paid}
            name={inDrawer ? "seminar-price-drawer" : "seminar-price"}
            checked={pricePreset === "paid"}
            onChange={() => setPricePreset("paid")}
          />
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          {t.seminars.filters.duration}
        </legend>

        <div className="flex items-center justify-between text-sm text-slate-700">
          <span className="font-medium tabular-nums">{durationRange[0]}′</span>

          <span className="text-slate-400">—</span>

          <span className="font-medium tabular-nums">{durationRange[1]}′</span>
        </div>

        <div className="mt-3 space-y-3">
          <input
            type="range"
            min={minDuration}
            max={maxDuration}
            value={durationRange[0]}
            onChange={(e) => {
              const value = clamp(
                Number(e.target.value),
                minDuration,
                durationRange[1],
              );

              setDurationRange([value, durationRange[1]]);
            }}
            className="w-full accent-primary"
          />

          <input
            type="range"
            min={minDuration}
            max={maxDuration}
            value={durationRange[1]}
            onChange={(e) => {
              const value = clamp(
                Number(e.target.value),
                durationRange[0],
                maxDuration,
              );

              setDurationRange([durationRange[0], value]);
            }}
            className="w-full accent-primary"
          />

          <div className="flex gap-2">
            <input
              type="number"
              min={minDuration}
              max={maxDuration}
              value={durationRange[0]}
              onChange={(e) => {
                const value = clamp(
                  Number(e.target.value),
                  minDuration,
                  durationRange[1],
                );

                setDurationRange([value, durationRange[1]]);
              }}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              aria-label={t.seminars.filters.minDuration}
            />

            <input
              type="number"
              min={minDuration}
              max={maxDuration}
              value={durationRange[1]}
              onChange={(e) => {
                const value = clamp(
                  Number(e.target.value),
                  durationRange[0],
                  maxDuration,
                );

                setDurationRange([durationRange[0], value]);
              }}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              aria-label={t.seminars.filters.maxDuration}
            />
          </div>
        </div>
      </fieldset>
    </aside>
  );

  return (
    <>
      <Head>
        <title>{t.seminars.meta.title}</title>
        <meta
          name="description"
          content={t.seminars.meta.description}
        />
      </Head>

      <section className="text-slate-800">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 md:pt-10">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              {pageHeader.title}
            </h1>

            <p className="mt-3 max-w-2xl leading-relaxed text-slate-600">
              {pageHeader.description}
            </p>
          </header>

          <div className="mb-6 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50"
            >
              {t.seminars.filters.title}
              {activeChips.length > 0 && (
                <span className="ml-2 inline-flex min-w-6 justify-center rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                  {activeChips.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">{t.seminars.sort.label}</span>

              <select
                value={sortKey}
                onChange={(event) => {
                  setSortKey(event.target.value as SortKey);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-primary/20"
              >
                <option value="dateNear">{t.seminars.sort.dateNear}</option>
                <option value="dateFar">{t.seminars.sort.dateFar}</option>
                <option value="durationAsc">{t.seminars.sort.durationAsc}</option>
                <option value="durationDesc">{t.seminars.sort.durationDesc}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="hidden lg:block">{renderFilters()}</div>

            <main>
              <div className="mb-5 flex min-h-10 items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  {t.seminars.results.found}{" "}
                  <span className="font-semibold text-slate-900">
                    {filteredSorted.length}
                  </span>{" "}
                  {filteredSorted.length === 1
                    ? t.seminars.results.one
                    : t.seminars.results.many}
                </p>

                <div className="hidden items-end gap-2 lg:flex">
                  <span className="text-sm text-slate-600">{t.seminars.sort.label}</span>

                  <select
                    value={sortKey}
                    onChange={(event) => {
                      setSortKey(event.target.value as SortKey);
                      setPage(1);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-primary/20"
                  >
                    <option value="dateNear">{t.seminars.sort.dateNear}</option>
                    <option value="dateFar">{t.seminars.sort.dateFar}</option>
                    <option value="durationAsc">{t.seminars.sort.durationAsc}</option>
                    <option value="durationDesc">{t.seminars.sort.durationDesc}</option>
                  </select>
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 shadow-sm transition hover:bg-slate-50"
                    >
                      {chip.label}
                      <span aria-hidden>×</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={resetAll}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:text-primary/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {t.seminars.filters.clear}
                  </button>
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                  {" "}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 animate-pulse"
                    >
                      <div className="h-44 bg-slate-200" />

                      <div className="space-y-3 p-5">
                        <div className="h-5 w-3/4 rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-2/3 rounded bg-slate-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <p className="text-slate-700">{error}</p>
                </div>
              ) : filteredSorted.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t.seminars.results.none}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    {t.seminars.results.noneDescription}
                  </p>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                  >
                    {t.seminars.results.clearFilters}
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                    {pagedSeminars.map((s) => {
                      const { date, time } = formatParts(
                        s.dateTime,
                        localeCode,
                        t.seminars.dateSoon,
                        t.seminars.timeSoon,
                      );
                      const image = s.imageUrl
                        ? toMediaUrl(s.imageUrl)
                        : IMAGE_FALLBACK;
                      return (
                        <article
                          key={s.id}
                          className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/25"
                        >
                          <button
                            type="button"
                            onClick={() => openModal(s)}
                            aria-label={`${t.seminars.card.more}: ${s.title || t.seminars.seminar}`}
                            className="relative block h-44 w-full cursor-pointer overflow-hidden bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-primary/40"
                          >
                            <div
                              className="pointer-events-none absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url(${image})` }}
                            />

                            <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
                              {(() => {
const badge = getStatusBadge(s.dateTime, t.seminars.status);
                                return (
                                  <Badge className={badge.className}>
                                    {badge.label}
                                  </Badge>
                                );
                              })()}

                              {s.type && (
                                <Badge className="bg-white/90 text-slate-800 ring-white/70 backdrop-blur">
                                  {s.type}
                                </Badge>
                              )}
                            </div>
                          </button>

                          <div className="flex grow flex-col p-5">
                            <div className="mb-3 flex flex-wrap gap-2">
                              <Badge>{date}</Badge>
                              <Badge>{time}</Badge>
                              <Badge>{s.duration || 0}′</Badge>
                              <Badge
                                className={
                                  s.price > 0
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                    : "bg-amber-50 text-amber-700 ring-amber-100"
                                }
                              >
                                {getPriceLabel(s.price, t.seminars.free)}
                              </Badge>
                            </div>

                            <h2 className="text-lg font-semibold leading-snug text-slate-900">
                              {s.title || t.seminars.seminar}
                            </h2>

                            <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 [&_.rich-content]:m-0 [&_.rich-content_p]:m-0 [&_.rich-content_p]:text-slate-600">
                              <RichHtmlRenderer html={s.description} />
                            </div>

                            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                              <span className="text-sm font-medium text-slate-500">
                                {getSeminarStatus(s.dateTime) === "past"
                                  ? t.seminars.card.pastInfo
                                  : s.isBookingAvailable
                                    ? t.seminars.card.bookingAvailable
                                    : t.seminars.card.bookingUnavailable}
                              </span>

                              <button
                                type="button"
                                onClick={() => openModal(s)}
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                              >
                                {t.seminars.card.more}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={pageClamped === 1}
                      className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 shadow-sm transition hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.seminars.pagination.previous}
                    </button>

                    <div className="hidden items-center gap-2 sm:flex">
                      {paginateNumbers(totalPages, pageClamped).map(
                        (pageNumber, index) =>
                          pageNumber === "…" ? (
                            <span
                              key={`dots-${index}`}
                              className="px-2 text-slate-500"
                            >
                              …
                            </span>
                          ) : (
                            <button
                              key={pageNumber}
                              type="button"
                              onClick={() => setPage(pageNumber)}
                              className={[
                                "min-w-10 rounded-full px-3 py-2 text-sm ring-1 transition",
                                pageNumber === pageClamped
                                  ? "bg-primary text-white ring-primary shadow-sm"
                                  : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              {pageNumber}
                            </button>
                          ),
                      )}
                    </div>

                    <div className="px-2 text-sm text-slate-700 sm:hidden">
                      <span className="font-semibold">{pageClamped}</span> /{" "}
                      {totalPages}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={pageClamped === totalPages}
                      className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 shadow-sm transition hover:shadow disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {t.seminars.pagination.next}
                    </button>
                  </div>
                </>
              )}
            </main>
          </div>
        </div>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setFiltersOpen(false)}
              aria-label={t.seminars.drawer.closeFilters}
            />

            <div className="absolute right-0 top-0 h-full w-[min(92vw,380px)] overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">{t.seminars.filters.title}</h2>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                >
                  {t.seminars.drawer.close}
                </button>
              </div>

              {renderFilters(true)}
            </div>
          </div>
        )}

        {open && active && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-3 py-4 sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-label={t.seminars.modal.aria}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
              aria-label={t.seminars.modal.close}
            />

            <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 md:overflow-hidden">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-xl bg-white/90 p-2 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label={t.seminars.modal.closeWindow}
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-[42%]">
                  <div
                    className="h-36 bg-cover bg-center sm:h-44 md:h-full md:min-h-[300px]"
                    style={{
                      backgroundImage: `url(${
                        active.imageUrl
                          ? toMediaUrl(active.imageUrl)
                          : IMAGE_FALLBACK
                      })`,
                    }}
                  />
                </div>

                <div className="flex flex-col md:w-[58%]">
                  <div className="min-w-0 p-4 sm:p-7 md:max-h-[70vh] md:overflow-y-auto">
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      {active.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(() => {
                        const { date, time } = formatParts(
                          active.dateTime,
                          localeCode,
                          t.seminars.dateSoon,
                          t.seminars.timeSoon,
                        );
                        return (
                          <>
                            <Pill>{active.type || t.seminars.seminar}</Pill>
                            <Pill>{date}</Pill>
                            <Pill>{time}</Pill>
                            <Pill>{active.duration || 0}′</Pill>
                            <Pill>
                              <span className="font-semibold text-primary">
                                {getPriceLabel(active.price, t.seminars.free)}
                              </span>
                            </Pill>
                          </>
                        );
                      })()}
                    </div>

                    <div className="mt-4 text-slate-700 leading-relaxed [&_.rich-content_p]:text-slate-700">
                      <RichHtmlRenderer
                        html={active.content || active.description}
                      />
                    </div>
                  </div>

                  <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <LeafBurstButton
                        text={
                          active.isBookingAvailable
                            ? t.seminars.book
                            : t.seminars.bookingUnavailable
                        }
                        onClick={openRegistrationModal}
                        disabled={!active.isBookingAvailable}
                        className="w-full sm:w-auto"
                        size="md"
                      />

                      <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-medium text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto"
                      >
                        {t.seminars.modal.close}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {registrationOpen && active && (
          <div
            className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto px-3 py-4 sm:items-center sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-label={t.seminars.registration.aria}
          >
            <button
              type="button"
              onClick={closeRegistrationModal}
              disabled={registrationSubmitting}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
              aria-label={t.seminars.modal.close}
            />

            <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-200 sm:p-8">
              {registrationSucceeded ? (
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {t.seminars.registration.successTitle}
                  </h3>
                  <p className="mt-4 text-slate-700">
                    {t.seminars.registration.successMessage}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {t.seminars.registration.successFollowUp}
                  </p>
                  <LeafBurstButton
                    text={t.seminars.modal.close}
                    onClick={closeRegistrationModal}
                    className="mt-6 w-full sm:w-auto"
                    size="md"
                  />
                </div>
              ) : (
                <form onSubmit={submitRegistration} noValidate>
                  <h3 className="text-2xl font-semibold text-slate-900">
                    {t.seminars.registration.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {t.seminars.registration.seminarLabel}: <strong>{active.title}</strong>
                  </p>

                  <div className="mt-6 space-y-4">
                    <label className="block text-sm font-semibold text-slate-900">
                      {t.seminars.registration.name} *
                      <input
                        value={registrationName}
                        onChange={(event) => {
                          setRegistrationName(event.target.value);
                          setRegistrationErrors((previous) => ({ ...previous, name: undefined }));
                        }}
                        disabled={registrationSubmitting}
                        className="mt-1 h-12 w-full rounded-xl bg-white px-3 text-[15px] font-normal ring-1 ring-accent/30 outline-none focus-visible:ring-4 focus-visible:ring-primary/35 disabled:opacity-60"
                        autoComplete="name"
                      />
                      {registrationErrors.name && (
                        <span className="mt-1 block text-sm font-normal text-rose-600">{registrationErrors.name}</span>
                      )}
                    </label>

                    <label className="block text-sm font-semibold text-slate-900">
                      Email *
                      <input
                        type="email"
                        value={registrationEmail}
                        onChange={(event) => {
                          setRegistrationEmail(event.target.value);
                          setRegistrationErrors((previous) => ({ ...previous, email: undefined }));
                        }}
                        disabled={registrationSubmitting}
                        className="mt-1 h-12 w-full rounded-xl bg-white px-3 text-[15px] font-normal ring-1 ring-accent/30 outline-none focus-visible:ring-4 focus-visible:ring-primary/35 disabled:opacity-60"
                        autoComplete="email"
                      />
                      {registrationErrors.email && (
                        <span className="mt-1 block text-sm font-normal text-rose-600">{registrationErrors.email}</span>
                      )}
                    </label>
                  </div>

                  {registrationError && (
                    <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">
                      {registrationError}
                    </p>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeRegistrationModal}
                      disabled={registrationSubmitting}
                      className="w-full rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60 sm:w-auto"
                    >
                      {t.seminars.registration.cancel}
                    </button>
                    <LeafBurstButton
                      type="submit"
                      text={registrationSubmitting ? t.seminars.registration.submitting : t.seminars.registration.submit}
                      disabled={registrationSubmitting}
                      className="w-full sm:w-auto"
                      size="md"
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
