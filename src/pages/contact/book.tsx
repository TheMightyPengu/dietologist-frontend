import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * ΚΛΕΙΣΤΕ ΡΑΝΤΕΒΟΥ — Booking form
 * - Calendar-only επιλογή ημερομηνίας με disabled κατειλημμένες μέρες
 * - Ελληνικό UI, 60-30-10 με accent #8484d1
 * - Mock "API" για υπηρεσίες & κατειλημμένες ημερομηνίες
 */

type Service = { id: string; label: string };

export default function BookPage() {
  // base state
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);

  // services
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");

  // dates (taken + calendar)
  const [takenDates, setTakenDates] = useState<Set<string>>(new Set());
  const [datesLoading, setDatesLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");

  // calendar state (month navigation)
  const today = useMemo(() => new Date(), []);
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // ---------------- Mock APIs ----------------
  async function mockApiSubmit() {
    await new Promise((r) => setTimeout(r, 900));
    if (Math.random() < 0.12) throw new Error("Προσωρινό σφάλμα διακομιστή.");
    return { success: true, id: Math.floor(Math.random() * 100000) };
  }


  async function mockApiFetchServices(): Promise<Service[]> {
    await new Promise((r) => setTimeout(r, 500));
    return [
      { id: "monitoring-edu", label: "Συν. διατροφικής παρακολούθησης & εκπαίδευσης" },
      { id: "eating-disorders", label: "Συνεδρίες για διατροφικές διαταραχές" },
      { id: "intuitive-mindful", label: "Διαισθητική διατροφή & mindful eating" },
      { id: "group-edu", label: "Ομαδικές συνεδρίες παρακολούθησης & εκπαίδευσης" },
      { id: "no-diet-project", label: "Ομάδα διαισθητικής: ‘No diet project’" },
    ];
  }

  async function mockApiFetchTakenDates(): Promise<string[]> {
    // mock: κατειλημμένες ραντεβού για τις επόμενες ~30 ημέρες
    await new Promise((r) => setTimeout(r, 600));
    const out: string[] = [];
    const base = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      if (Math.random() < 0.22) out.push(d.toISOString().slice(0, 10));
    }
    return out;
  }

  // load data
  useEffect(() => {
    let mounted = true;

    (async () => {
      setServicesLoading(true);
      try {
        const data = await mockApiFetchServices();
        if (mounted) setServices(data);
      } finally {
        if (mounted) setServicesLoading(false);
      }
    })();

    (async () => {
      setDatesLoading(true);
      try {
        const taken = await mockApiFetchTakenDates();
        if (mounted) setTakenDates(new Set(taken));
      } finally {
        if (mounted) setDatesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // calendar helpers
  const monthLabel = useMemo(() => {
    return monthCursor.toLocaleDateString("el-GR", { month: "long", year: "numeric" });
  }, [monthCursor]);

  function firstDayOfMonth(d: Date) {
    const x = new Date(d);
    x.setDate(1);
    return x.getDay(); // 0=Κυρ, 1=Δευ, ...
  }

  function daysInMonth(d: Date) {
    const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return x.getDate();
  }

  const gridDays = useMemo(() => {
    // Δημιουργούμε πίνακα 42 κελιών (6 γραμμές x 7 μέρες) για σταθερό grid
    const startWeekday = firstDayOfMonth(monthCursor); // 0..6 (Κυρ..Σαβ)
    const totalDays = daysInMonth(monthCursor);
    const cells: { dateStr: string | null; isCurrentMonth: boolean }[] = [];

    // leading blanks (μέχρι Δευτέρα-πρώτη, αλλά κρατάμε 0=Κυρ συμβατό)
    const leading = (startWeekday + 6) % 7; // μετατόπιση ώστε Δευ=0
    for (let i = 0; i < leading; i++) cells.push({ dateStr: null, isCurrentMonth: false });

    // days of month
    for (let d = 1; d <= totalDays; d++) {
      const curr = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d);
      const str = curr.toISOString().slice(0, 10);
      cells.push({ dateStr: str, isCurrentMonth: true });
    }

    // trailing blanks
    while (cells.length % 7 !== 0) cells.push({ dateStr: null, isCurrentMonth: false });
    while (cells.length < 42) cells.push({ dateStr: null, isCurrentMonth: false });

    return cells;
  }, [monthCursor]);

  function isPast(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(0, 0, 0, 0);
    const t = new Date(today);
    t.setHours(0, 0, 0, 0);
    return d < t;
  }

  function isSelected(dateStr: string) {
    return selectedDate === dateStr;
  }

  function selectDate(dateStr: string) {
    setSelectedDate(dateStr);
  }

  function prevMonth() {
    const x = new Date(monthCursor);
    x.setMonth(x.getMonth() - 1);
    x.setDate(1);
    setMonthCursor(x);
  }
  function nextMonth() {
    const x = new Date(monthCursor);
    x.setMonth(x.getMonth() + 1);
    x.setDate(1);
    setMonthCursor(x);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setError(null);

    //const fd = new FormData(e.currentTarget);
    //const payload = Object.fromEntries(fd.entries());

    // extra guard
    if (!selectedDate || takenDates.has(selectedDate) || isPast(selectedDate)) {
      setLoading(false);
      setOk(false);
      setError("Παρακαλούμε επιλέξτε διαθέσιμη μελλοντική ημερομηνία.");
      return;
    }

    try {
      await mockApiSubmit();
      setOk(true);
      (e.target as HTMLFormElement).reset();
      setSelectedDate("");
      setSelectedService("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      setOk(false);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Κλείστε Ραντεβού — Επικοινωνία</title>
        <meta
          name="description"
          content="Κλείστε ραντεβού εύκολα. Επιλέξτε υπηρεσία, ημερομηνία και ώρα — θα σας καλέσουμε για επιβεβαίωση."
        />
        <link rel="canonical" href="https://example.gr/contact/book" />
      </Head>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          {/* Breadcrumbs */}
          <nav className="mb-6 text-sm text-slate-600">
            <Link
              href="/"
              className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
            >
              Αρχική
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/contact"
              className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
            >
              Επικοινωνία
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-slate-800">Κλείστε Ραντεβού</span>
          </nav>

          {/* Heading */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Κλείστε Ραντεβού</h1>
            <p className="mt-2 max-w-2xl text-slate-700">
              Συμπληρώστε τη φόρμα και θα σας καλέσουμε για επιβεβαίωση.
            </p>
          </header>

          {/* Card */}
          <div className="grid md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <form
                onSubmit={onSubmit}
                className="rounded-2xl bg-white p-6 shadow-[0_14px_30px_rgba(255,230,150,0.08)] ring-2 ring-warm/40"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Υπηρεσία */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Υπηρεσία <span className="text-slate-500">(από το μενού υπηρεσιών)</span>
                    </label>
                    <select
                      name="service"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      required
                      disabled={servicesLoading}
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:opacity-60"
                    >
                      <option value="" disabled>
                        {servicesLoading ? "Φόρτωση υπηρεσιών..." : "— Επιλέξτε υπηρεσία —"}
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ονοματεπώνυμο */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Ονοματεπώνυμο</label>
                    <input
                      name="fullName"
                      required
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="π.χ. Μαρία Παπαδοπούλου"
                    />
                  </div>

                  {/* Τηλέφωνο */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Τηλέφωνο</label>
                    <label className="block text-sm font-medium text-slate-700">Τηλέφωνο</label>
                    <input
                      name="phone"
                      required
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="π.χ. 69XXXXXXXX"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="π.χ. name@email.com"
                    />
                  </div>

                  {/* Ημερομηνία (Custom Calendar) & Ώρα */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3 md:col-span-2">
                    {/* CALENDAR */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700">Ημερομηνία</label>

                      <div className="mt-1 rounded-xl ring-1 ring-accent/30 bg-white p-3">
                        {/* Header */}
                        <div className="mb-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={prevMonth}
                            className="rounded-lg px-2 py-1 text-sm text-primary ring-1 ring-accent/30 hover:bg-accent/10 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            aria-label="Προηγούμενος μήνας"
                          >
                            ←
                          </button>
                          <div className="text-sm font-medium text-slate-900 capitalize">{monthLabel}</div>
                          <button
                            type="button"
                            onClick={nextMonth}
                            className="rounded-lg px-2 py-1 text-sm text-primary ring-1 ring-accent/30 hover:bg-accent/10 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                            aria-label="Επόμενος μήνας"
                          >
                            →
                          </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
                          {["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"].map((w) => (
                            <div key={w} className="py-1">
                              {w}
                            </div>
                          ))}
                        </div>

                        {/* Grid */}
                        <div className="mt-1 grid grid-cols-7 gap-1">
                          {datesLoading
                            ? Array.from({ length: 42 }).map((_, i) => (
                                <div key={i} className="h-9 animate-pulse rounded-lg bg-white ring-1 ring-accent/20" />
                              ))
                            : gridDays.map((cell, i) => {
                                if (!cell.dateStr) {
                                  return <div key={i} className="h-9" />;
                                }
                                const taken = takenDates.has(cell.dateStr);
                                const past = isPast(cell.dateStr);
                                const disabled = taken || past;

                                const selected = isSelected(cell.dateStr);
                                return (
                                  <button
                                    key={i}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => selectDate(cell.dateStr!)}
                                    className={[
                                      "h-9 w-full rounded-lg text-sm ring-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                                      disabled
                                        ? "cursor-not-allowed bg-white text-slate-400 ring-accent/20"
                                        : "bg-white text-slate-800 hover:bg-accent/10 ring-accent/30",
                                      selected && !disabled ? "bg-primary text-white ring-primary hover:bg-accent/10 hover:text-slate-800" : "",
                                    ].join(" ")}
                                    title={
                                      taken
                                        ? "Κατειλημμένη ημερομηνία"
                                        : past
                                        ? "Προηγούμενη ημερομηνία"
                                        : "Επιλέξτε ημερομηνία"
                                    }
                                  >
                                    {new Date(cell.dateStr).getDate()}
                                  </button>
                                );
                              })}
                        </div>
                      </div>

                      {/* Hidden form field to submit selected date */}
                      <input type="hidden" name="date" value={selectedDate} />
                      <p className="mt-1 text-xs text-slate-600">
                        {selectedDate
                          ? new Date(selectedDate + "T00:00:00").toLocaleDateString("el-GR", {
                              weekday: "long",
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                          : "Καμία ημερομηνία επιλεγμένη."}
                      </p>
                    </div>

                    {/* TIME */}
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-slate-700">Ώρα</label>
                      <label className="block text-sm font-medium text-slate-700">Ώρα</label>
                      <input
                        type="time"
                        name="time"
                        required
                        className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Μήνυμα */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Σύντομο μήνυμα (προαιρετικό)
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className="mt-1 w-full rounded-xl ring-1 ring-accent/30 bg-white px-3 py-2 text-slate-900 outline-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                      placeholder="Τυχόν απορίες ή προτιμήσεις."
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      servicesLoading ||
                      datesLoading ||
                      !selectedDate ||
                      takenDates.has(selectedDate) ||
                      isPast(selectedDate)
                    }
                    className="inline-flex items-center rounded-xl bg-primary px-4 py-2 text-white disabled:opacity-50 transition hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  >
                    {loading ? "Αποστολή..." : "Αίτημα Ραντεβού"}
                  </button>
                  <Link
                    href="/contact/form"
                    className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
                  >
                    Εναλλακτικά, Φόρμα Επικοινωνίας →
                  </Link>
                </div>

                {/* Status */}
                <div className="mt-4 min-h-[1.5rem]">
                  {ok && (
                    <p className="text-sm text-primary">
                      Το αίτημά σας υποβλήθηκε! Θα επικοινωνήσουμε σύντομα.
                    </p>
                  )}
                  {ok === false && (
                    <p className="text-sm text-rose-600">
                      {error || "Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά."}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Side info */}
            <aside className="md:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-[0_14px_30px_rgba(164,199,126,0.10)] ring-1 ring-accent/25">
                <h2 className="text-lg font-semibold text-slate-900">Χρήσιμες Πληροφορίες</h2>
                <ul className="mt-3 space-y-2 text-sm text-slate-700 marker:text-accent/80 list-disc pl-5">
                  <li>Ώρες λειτουργίας: Δευ–Παρ 10:00–18:00</li>
                  <li>Το ραντεβού επιβεβαιώνεται τηλεφωνικά.</li>
                  <li>Ακύρωση/αλλαγή έως 24 ώρες πριν.</li>
                </ul>
                <div className="mt-5 h-px bg-accent/35" />
                <p className="mt-4 text-sm text-slate-600">
                  Για απορίες, δείτε και την{" "}
                  <Link
                    href="/contact/form"
                    className="text-primary hover:text-accent underline decoration-primary/30 hover:decoration-accent/50 transition"
                  >
                    φόρμα επικοινωνίας
                  </Link>
                  .
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}