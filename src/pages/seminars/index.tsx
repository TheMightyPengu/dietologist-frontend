import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSeminars, type Seminar } from "@/api/SeminarsController";
import RichHtmlRenderer from "@/components/admin/RichHtmlRenderer";
import LeafBurstButton from "@/components/decorative/LeafBurstButton";

type SortKey =
  | "upcoming"
  | "newest"
  | "oldest"
  | "priceAsc"
  | "priceDesc"
  | "durationAsc";

type DatePreset = "all" | "upcoming" | "today" | "past";
type PricePreset = "all" | "free" | "paid";
type DurationPreset = "all" | "short" | "medium" | "long";

const PAGE_SIZE = 9;

const IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop";

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}


function formatParts(dateISO: string) {
  const d = new Date(dateISO);

  if (!dateISO || isNaN(d.getTime())) {
    return { date: "Ημερομηνία σύντομα", time: "Ώρα σύντομα" };
  }

  const date = d.toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const time = d.toLocaleTimeString("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { date, time };
}

function getPriceLabel(price: number) {
  return price > 0 ? `${price}€` : "Δωρεάν";
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

function getStatusBadge(dateTime: string) {
  const status = getSeminarStatus(dateTime);

  if (status === "today") {
    return {
      label: "Σήμερα",
      className: "bg-amber-100 text-amber-800 ring-amber-200",
    };
  }

  if (status === "upcoming") {
    return {
      label: "Προσεχώς",
      className: "bg-primary text-white ring-primary",
    };
  }

  if (status === "past") {
    return {
      label: "Ολοκληρώθηκε",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    };
  }

  return {
    label: "Σύντομα",
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
  const [items, setItems] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeSet, setTypeSet] = useState<Set<string>>(new Set());
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 180]);
  const [datePreset, setDatePreset] = useState<DatePreset>("upcoming");
  const [pricePreset, setPricePreset] = useState<PricePreset>("all");
  const [durationPreset, setDurationPreset] = useState<DurationPreset>("all");
  const [sortKey, setSortKey] = useState<SortKey>("upcoming");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Seminar | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getSeminars();

        if (!alive) return;

        setItems(data);

        const durations = data.map((s) => s.duration || 0).filter((x) => x > 0);

        if (durations.length) {
          setDurationRange([Math.min(...durations), Math.max(...durations)]);
        }
      } catch {
        if (!alive) return;
        setError("Δεν ήταν δυνατή η φόρτωση των σεμιναρίων.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const types = useMemo(() => {
    return Array.from(
      new Set(items.map((s) => s.type).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "el"));
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
    setVisibleCount(PAGE_SIZE);
  }, [
    query,
    typeSet,
    durationRange,
    datePreset,
    pricePreset,
    durationPreset,
    sortKey,
  ]);

  function toggleType(type: string) {
    setTypeSet((prev) => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  }

  function resetAll() {
    setQuery("");
    setTypeSet(new Set());
    setDurationRange([minDuration, maxDuration]);
    setDatePreset("upcoming");
    setPricePreset("all");
    setDurationPreset("all");
    setSortKey("upcoming");
    setVisibleCount(PAGE_SIZE);
  }

  function openModal(seminar: Seminar) {
    setActive(seminar);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setActive(null);
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

      if (durationPreset === "short" && s.duration > 60) {
        return false;
      }

      if (
        durationPreset === "medium" &&
        (s.duration < 61 || s.duration > 120)
      ) {
        return false;
      }

      if (durationPreset === "long" && s.duration < 121) {
        return false;
      }

      if (
        s.duration < durationRange[0] ||
        s.duration > durationRange[1]
      ) {
        return false;
      }

      return true;
    });

    list = list.sort((a, b) => {
      const aTime = new Date(a.dateTime).getTime();
      const bTime = new Date(b.dateTime).getTime();

      switch (sortKey) {
        case "upcoming": {
          const safeA = isNaN(aTime) ? Number.MAX_SAFE_INTEGER : aTime;
          const safeB = isNaN(bTime) ? Number.MAX_SAFE_INTEGER : bTime;

          return safeA - safeB;
        }

        case "newest":
          return bTime - aTime;

        case "oldest":
          return aTime - bTime;

        case "priceAsc":
          return a.price - b.price;

        case "priceDesc":
          return b.price - a.price;

        case "durationAsc":
          return a.duration - b.duration;

        default:
          return 0;
      }
    });

    return list;
  }, [
    items,
    query,
    typeSet,
    durationRange,
    datePreset,
    pricePreset,
    durationPreset,
    sortKey,
  ]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> =
      [];

    const q = query.trim();

    if (q) {
      chips.push({
        key: "q",
        label: `Αναζήτηση: “${q}”`,
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
            ? "Όλα τα σεμινάρια"
            : datePreset === "today"
            ? "Σήμερα"
            : "Ολοκληρωμένα",
        onRemove: () => setDatePreset("upcoming"),
      });
    }

    if (pricePreset !== "all") {
      chips.push({
        key: `price:${pricePreset}`,
        label: pricePreset === "free" ? "Δωρεάν" : "Επί πληρωμή",
        onRemove: () => setPricePreset("all"),
      });
    }

    if (durationPreset !== "all") {
      chips.push({
        key: `durationPreset:${durationPreset}`,
        label:
          durationPreset === "short"
            ? "Έως 60′"
            : durationPreset === "medium"
            ? "61′–120′"
            : "Πάνω από 120′",
        onRemove: () => setDurationPreset("all"),
      });
    }

    if (
      durationRange[0] !== minDuration ||
      durationRange[1] !== maxDuration
    ) {
      chips.push({
        key: "duration",
        label: `Ακριβής διάρκεια: ${durationRange[0]}–${durationRange[1]}′`,
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
    durationPreset,
  ]);

  const shownSeminars = useMemo(() => {
    return filteredSorted.slice(0, visibleCount);
  }, [filteredSorted, visibleCount]);

  const canLoadMore = shownSeminars.length < filteredSorted.length;

  async function onLoadMore() {
    setIsLoadingMore(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    setVisibleCount((v) => v + PAGE_SIZE);
    setIsLoadingMore(false);
  }

  const renderFilters = (inDrawer = false) => (
    <aside
      className={[
        "rounded-2xl bg-white ring-1 ring-slate-200 p-5",
        inDrawer ? "" : "h-fit lg:sticky lg:top-24 self-start",
      ].join(" ")}
      aria-label="Φίλτρα σεμιναρίων"
    >
      <div className="mb-5">
        <label
          htmlFor={inDrawer ? "seminars-q-drawer" : "seminars-q"}
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Αναζήτηση
        </label>

        <input
          id={inDrawer ? "seminars-q-drawer" : "seminars-q"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Αναζήτηση σεμιναρίων..."
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:ring-4 focus:ring-primary/20"
        />
      </div>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Τύπος
        </legend>

        <div className="flex flex-col gap-1.5">
          {types.length === 0 ? (
            <p className="text-sm text-slate-500">Δεν υπάρχουν τύποι.</p>
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
          Διάρκεια σεμιναρίου
        </legend>

        <div className="flex items-center justify-between text-sm text-slate-700">
          <span className="font-medium tabular-nums">
            {durationRange[0]}′
          </span>

          <span className="text-slate-400">—</span>

          <span className="font-medium tabular-nums">
            {durationRange[1]}′
          </span>
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
                durationRange[1]
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
                maxDuration
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
                  durationRange[1]
                );

                setDurationRange([value, durationRange[1]]);
              }}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              aria-label="Ελάχιστη διάρκεια"
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
                  maxDuration
                );

                setDurationRange([durationRange[0], value]);
              }}
              className="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-4 focus:ring-primary/20"
              aria-label="Μέγιστη διάρκεια"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Κατάσταση σεμιναρίου
        </legend>

        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label="Προσεχή"
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "upcoming"}
            onChange={() => setDatePreset("upcoming")}
          />

          <RadioRow
            label="Σήμερα"
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "today"}
            onChange={() => setDatePreset("today")}
          />

          <RadioRow
            label="Ολοκληρωμένα"
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "past"}
            onChange={() => setDatePreset("past")}
          />

          <RadioRow
            label="Όλα"
            name={inDrawer ? "seminar-date-drawer" : "seminar-date"}
            checked={datePreset === "all"}
            onChange={() => setDatePreset("all")}
          />
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Τιμή
        </legend>

        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label="Όλα"
            name={inDrawer ? "seminar-price-drawer" : "seminar-price"}
            checked={pricePreset === "all"}
            onChange={() => setPricePreset("all")}
          />

          <RadioRow
            label="Δωρεάν"
            name={inDrawer ? "seminar-price-drawer" : "seminar-price"}
            checked={pricePreset === "free"}
            onChange={() => setPricePreset("free")}
          />

          <RadioRow
            label="Επί πληρωμή"
            name={inDrawer ? "seminar-price-drawer" : "seminar-price"}
            checked={pricePreset === "paid"}
            onChange={() => setPricePreset("paid")}
          />
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Γρήγορη διάρκεια
        </legend>

        <div className="flex flex-col gap-1.5 text-sm">
          <RadioRow
            label="Όλες οι διάρκειες"
            name={inDrawer ? "seminar-duration-preset-drawer" : "seminar-duration-preset"}
            checked={durationPreset === "all"}
            onChange={() => setDurationPreset("all")}
          />

          <RadioRow
            label="Έως 60 λεπτά"
            name={inDrawer ? "seminar-duration-preset-drawer" : "seminar-duration-preset"}
            checked={durationPreset === "short"}
            onChange={() => setDurationPreset("short")}
          />

          <RadioRow
            label="61–120 λεπτά"
            name={inDrawer ? "seminar-duration-preset-drawer" : "seminar-duration-preset"}
            checked={durationPreset === "medium"}
            onChange={() => setDurationPreset("medium")}
          />

          <RadioRow
            label="Πάνω από 120 λεπτά"
            name={inDrawer ? "seminar-duration-preset-drawer" : "seminar-duration-preset"}
            checked={durationPreset === "long"}
            onChange={() => setDurationPreset("long")}
          />
        </div>
      </fieldset>

      <div className="border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={resetAll}
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Καθαρισμός φίλτρων
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <Head>
        <title>Σεμινάρια — Διατροφολόγος</title>
        <meta
          name="description"
          content="Σύγχρονα σεμινάρια διατροφής με πρακτικές συμβουλές και εργαλεία."
        />
      </Head>

      <section className="text-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 md:pt-16 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                Σεμινάρια
              </h1>

              <p className="mt-3 max-w-2xl text-slate-600 leading-relaxed">
                Μικρές, στοχευμένες ενότητες με πρακτικό περιεχόμενο. Online
                και δια ζώσης, με έμφαση στην καθημερινή εφαρμογή.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-slate-50 lg:hidden"
              >
                Φίλτρα
              </button>

              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-4 focus:ring-primary/20"
                aria-label="Ταξινόμηση"
              >
                <option value="upcoming">Προσεχή πρώτα</option>
                <option value="newest">Νεότερα πρώτα</option>
                <option value="oldest">Παλαιότερα πρώτα</option>
                <option value="priceAsc">Τιμή αύξουσα</option>
                <option value="priceDesc">Τιμή φθίνουσα</option>
                <option value="durationAsc">Μικρότερη διάρκεια</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-16">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">{renderFilters()}</div>

            <main>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  {filteredSorted.length}{" "}
                  {filteredSorted.length === 1
                    ? "αποτέλεσμα"
                    : "αποτελέσματα"}
                </p>

                {activeChips.length > 0 && (
                  <button
                    type="button"
                    onClick={resetAll}
                    className="text-sm font-medium text-primary underline underline-offset-4 hover:text-accent"
                  >
                    Καθαρισμός όλων
                  </button>
                )}
              </div>

              {activeChips.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/15"
                    >
                      {chip.label}
                      <span aria-hidden>×</span>
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
              ) : shownSeminars.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Δεν βρέθηκαν σεμινάρια
                  </h2>

                  <p className="mt-2 text-sm text-slate-600">
                    Δοκιμάστε να αλλάξετε ή να καθαρίσετε τα φίλτρα.
                  </p>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                  >
                    Καθαρισμός φίλτρων
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {shownSeminars.map((s) => {
                      const { date, time } = formatParts(s.dateTime);
                      const image = s.imageUrl || IMAGE_FALLBACK;

                      return (
                        <article
                          key={s.id}
                          className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/25"
                        >
                          <div className="relative h-44 overflow-hidden bg-slate-100">
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url(${image})` }}
                            />

                            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                              {(() => {
                                const badge = getStatusBadge(s.dateTime);

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
                          </div>

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
                                {getPriceLabel(s.price)}
                              </Badge>
                            </div>

                            <h2 className="text-lg font-semibold leading-snug text-slate-900">
                              {s.title || "Σεμινάριο"}
                            </h2>

                            <div className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 [&_.rich-content]:m-0 [&_.rich-content_p]:m-0 [&_.rich-content_p]:text-slate-600">
                              <RichHtmlRenderer html={s.description} />
                            </div>

                            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                              <span className="text-sm font-medium text-slate-500">
                                {getSeminarStatus(s.dateTime) === "past"
                                  ? "Διαθέσιμες πληροφορίες"
                                  : "Διαθέσιμη κράτηση"}
                              </span>

                              <button
                                type="button"
                                onClick={() => openModal(s)}
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
                              >
                                Περισσότερα
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {canLoadMore && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
                      >
                        {isLoadingMore ? "Φόρτωση..." : "Φόρτωση περισσότερων"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-12">
          <div className="rounded-2xl bg-white px-5 py-5 ring-1 ring-slate-200 md:px-6 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                  Θέλετε εταιρικό σεμινάριο;
                </h2>

                <span className="hidden md:inline-block h-px w-20 bg-primary/30" />
              </div>

              <p className="text-slate-600 md:flex-1 leading-relaxed">
                Επικοινωνήστε για προσαρμοσμένα workshops στην ομάδα σας.
              </p>

              <Link
                href="/contact/form"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 font-medium text-primary ring-1 ring-primary/20 transition hover:bg-primary/5 hover:text-accent"
              >
                Επικοινωνία
              </Link>
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setFiltersOpen(false)}
              aria-label="Κλείσιμο φίλτρων"
            />

            <div className="absolute right-0 top-0 h-full w-[min(92vw,380px)] overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Φίλτρα
                </h2>

                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm"
                >
                  Κλείσιμο
                </button>
              </div>

              {renderFilters(true)}
            </div>
          </div>
        )}

        {open && active && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Λεπτομέρειες σεμιναρίου"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]"
              aria-label="Κλείσιμο"
            />

            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
              <button
                type="button"
                onClick={closeModal}
                className="absolute right-3 top-3 z-10 inline-flex items-center justify-center rounded-xl bg-white/90 p-2 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Κλείσιμο παραθύρου"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row">
                <div className="md:w-[42%]">
                  <div
                    className="h-44 bg-cover bg-center md:h-full md:min-h-[300px]"
                    style={{
                      backgroundImage: `url(${
                        active.imageUrl || IMAGE_FALLBACK
                      })`,
                    }}
                  />
                </div>

                <div className="flex flex-col md:w-[58%]">
                  <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-7">
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      {active.title}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(() => {
                        const { date, time } = formatParts(active.dateTime);

                        return (
                          <>
                            <Pill>{active.type || "Σεμινάριο"}</Pill>
                            <Pill>{date}</Pill>
                            <Pill>{time}</Pill>
                            <Pill>{active.duration || 0}′</Pill>
                            <Pill>
                              <span className="font-semibold text-primary">
                                {getPriceLabel(active.price)}
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

                  <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 px-6 py-4 backdrop-blur sm:px-7">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <LeafBurstButton
                        text="Κράτηση θέσης"
                        href="/contact/book"
                        size="md"
                      />

                      <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-sm font-medium text-slate-800 ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        Κλείσιμο
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}