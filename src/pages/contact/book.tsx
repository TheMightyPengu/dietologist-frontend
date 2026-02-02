import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

/**
 * ΚΛΕΙΣΤΕ ΡΑΝΤΕΒΟΥ — Booking form
 * - Επιλογή ΜΟΝΟ από διαθέσιμες ημερομηνίες/ώρες (όχι ολόκληρο calendar)
 * - Async mock API για υπηρεσίες & διαθέσιμα slots
 * - Ελληνικό UI, 60-30-10 με accent #8484d1
 */

type Service = { id: string; label: string };

type Slot = {
  id: string;
  serviceId: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  durationMin: number;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateLabel(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("el-GR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function combineToDate(dateStr: string, timeStr: string) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

// Deterministic pseudo-random generator (so the mock doesn’t “jump” every render)
function hashStringToSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function BookPage() {
  // base state
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<null | boolean>(null);
  const [error, setError] = useState<string | null>(null);

  // services
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");

  // availability (ONLY allowed days/times)
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  const now = useMemo(() => new Date(), []);

  // ---------------- Mock APIs ----------------
  async function mockApiSubmit(payload: any) {
    await new Promise((r) => setTimeout(r, 900));
    if (Math.random() < 0.12) throw new Error("Προσωρινό σφάλμα διακομιστή.");
    return { success: true, id: Math.floor(Math.random() * 100000), payload };
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

  /**
   * Mock availability:
   * - Returns ONLY specific future dates & times the user can book.
   * - Deterministic per serviceId (so it looks stable).
   */
  async function mockApiFetchAvailability(serviceId: string): Promise<Slot[]> {
    await new Promise((r) => setTimeout(r, 650));
    const rand = mulberry32(hashStringToSeed(serviceId || "default"));

    // Business hours snapshot (you can tweak)
    const possibleTimes = ["10:00", "11:30", "13:00", "15:00", "16:30"];

    const out: Slot[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    // next ~21 days
    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);

      const weekday = d.getDay(); // 0 Sun ... 6 Sat
      const isWeekend = weekday === 0 || weekday === 6;
      if (isWeekend) continue;

      // Only “some” weekdays get availability (to feel realistic)
      // e.g. Mon/Wed/Fri more likely, Tue/Thu less likely
      const weekdayChance =
        weekday === 1 || weekday === 3 || weekday === 5 ? 0.78 : 0.45; // Mon/Wed/Fri vs Tue/Thu

      if (rand() > weekdayChance) continue;

      const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

      // Create a subset of times for that day
      const timeCount = 2 + Math.floor(rand() * 3); // 2..4 slots/day
      const shuffled = [...possibleTimes].sort(() => rand() - 0.5);

      for (let t = 0; t < timeCount; t++) {
        const timeStr = shuffled[t];

        // Randomly “book” some of them so they don’t appear at all (since you only want bookable ones)
        const isBooked = rand() < 0.18;
        if (isBooked) continue;

        // Skip if already in the past (same-day times earlier than now)
        const when = combineToDate(dateStr, timeStr);
        if (when.getTime() <= Date.now()) continue;

        out.push({
          id: `${serviceId}-${dateStr}-${timeStr}`,
          serviceId,
          dateStr,
          timeStr,
          durationMin: 60,
        });
      }
    }

    // Sort by date/time
    out.sort((a, b) => {
      const ad = combineToDate(a.dateStr, a.timeStr).getTime();
      const bd = combineToDate(b.dateStr, b.timeStr).getTime();
      return ad - bd;
    });

    return out;
  }

  // load services
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

    return () => {
      mounted = false;
    };
  }, []);

  // fetch availability when service changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      setSlots([]);
      setSelectedDate("");
      setSelectedSlotId("");

      if (!selectedService) return;

      setSlotsLoading(true);
      try {
        const data = await mockApiFetchAvailability(selectedService);
        if (!mounted) return;
        setSlots(data);

        // auto-pick first available date (optional but nice UX)
        const firstDate = data[0]?.dateStr || "";
        setSelectedDate(firstDate);
      } finally {
        if (mounted) setSlotsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedService]);

  const availableDates = useMemo(() => {
    const uniq = new Set<string>();
    for (const s of slots) uniq.add(s.dateStr);
    return Array.from(uniq);
  }, [slots]);

  const slotsForSelectedDate = useMemo(() => {
    return slots.filter((s) => s.dateStr === selectedDate);
  }, [slots, selectedDate]);

  const selectedSlot = useMemo(() => {
    return slots.find((s) => s.id === selectedSlotId) || null;
  }, [slots, selectedSlotId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setError(null);

    if (!selectedService) {
      setLoading(false);
      setOk(false);
      setError("Παρακαλούμε επιλέξτε υπηρεσία.");
      return;
    }

    if (!selectedSlot) {
      setLoading(false);
      setOk(false);
      setError("Παρακαλούμε επιλέξτε διαθέσιμη ημερομηνία και ώρα.");
      return;
    }

    const when = combineToDate(selectedSlot.dateStr, selectedSlot.timeStr);
    if (when.getTime() <= now.getTime()) {
      setLoading(false);
      setOk(false);
      setError("Παρακαλούμε επιλέξτε μελλοντικό διαθέσιμο ραντεβού.");
      return;
    }

    try {
      const fd = new FormData(e.currentTarget);
      const payload = Object.fromEntries(fd.entries());

      await mockApiSubmit({
        ...payload,
        slotId: selectedSlot.id,
        date: selectedSlot.dateStr,
        time: selectedSlot.timeStr,
        serviceId: selectedService,
      });

      setOk(true);
      (e.target as HTMLFormElement).reset();
      setSelectedService("");
      setSlots([]);
      setSelectedDate("");
      setSelectedSlotId("");
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
          content="Κλείστε ραντεβού εύκολα. Επιλέξτε υπηρεσία, διαθέσιμη ημερομηνία και ώρα — θα σας καλέσουμε για επιβεβαίωση."
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
              Επιλέξτε υπηρεσία και θα εμφανιστούν <span className="font-medium">μόνο</span> οι διαθέσιμες ημέρες/ώρες.
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

                  {/* Διαθεσιμότητα (Dates + Times) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Διαθεσιμότητα</label>

                    <div className="mt-1 rounded-xl ring-1 ring-accent/30 bg-white p-3">
                      {/* Dates row */}
                      <div className="text-xs text-slate-600 mb-2">
                        {selectedService
                          ? "Επιλέξτε ημέρα (εμφανίζονται μόνο διαθέσιμες)."
                          : "Επιλέξτε πρώτα υπηρεσία για να εμφανιστούν διαθέσιμες ημέρες/ώρες."}
                      </div>

                      {slotsLoading ? (
                        <div className="flex flex-wrap gap-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-9 w-32 animate-pulse rounded-lg bg-white ring-1 ring-accent/20"
                            />
                          ))}
                        </div>
                      ) : !selectedService ? (
                        <div className="text-sm text-slate-600">—</div>
                      ) : availableDates.length === 0 ? (
                        <div className="text-sm text-rose-600">
                          Δεν υπάρχουν διαθέσιμα ραντεβού για τις επόμενες ημέρες. Δοκιμάστε άλλη υπηρεσία.
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap gap-2">
                            {availableDates.map((d) => {
                              const active = d === selectedDate;
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(d);
                                    setSelectedSlotId("");
                                  }}
                                  className={[
                                    "h-9 rounded-lg px-3 text-sm ring-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                                    active
                                      ? "bg-primary text-white ring-primary"
                                      : "bg-white text-slate-800 ring-accent/30 hover:bg-accent/10",
                                  ].join(" ")}
                                  title={toDateLabel(d)}
                                >
                                  {new Date(d + "T00:00:00").toLocaleDateString("el-GR", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "2-digit",
                                  })}
                                </button>
                              );
                            })}
                          </div>

                          {/* Times */}
                          <div className="mt-3">
                            <div className="text-xs text-slate-600 mb-2">Ώρες για την επιλεγμένη ημέρα:</div>

                            {selectedDate ? (
                              slotsForSelectedDate.length === 0 ? (
                                <div className="text-sm text-slate-600">Δεν υπάρχουν ώρες για αυτήν την ημέρα.</div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {slotsForSelectedDate.map((s) => {
                                    const active = s.id === selectedSlotId;
                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => setSelectedSlotId(s.id)}
                                        className={[
                                          "h-9 rounded-lg px-3 text-sm ring-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                                          active
                                            ? "bg-primary text-white ring-primary"
                                            : "bg-white text-slate-800 ring-accent/30 hover:bg-accent/10",
                                        ].join(" ")}
                                      >
                                        {s.timeStr}
                                      </button>
                                    );
                                  })}
                                </div>
                              )
                            ) : (
                              <div className="text-sm text-slate-600">Επιλέξτε πρώτα ημέρα.</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hidden fields */}
                    <input type="hidden" name="slotId" value={selectedSlotId} />
                    <input type="hidden" name="date" value={selectedSlot?.dateStr || ""} />
                    <input type="hidden" name="time" value={selectedSlot?.timeStr || ""} />

                    <p className="mt-1 text-xs text-slate-600">
                      {selectedSlot
                        ? `Επιλέξατε: ${toDateLabel(selectedSlot.dateStr)} στις ${selectedSlot.timeStr}`
                        : "Δεν έχει επιλεγεί ραντεβού."}
                    </p>
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
                    disabled={loading || servicesLoading || slotsLoading || !selectedService || !selectedSlotId}
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
                  {ok && <p className="text-sm text-primary">Το αίτημά σας υποβλήθηκε! Θα επικοινωνήσουμε σύντομα.</p>}
                  {ok === false && (
                    <p className="text-sm text-rose-600">{error || "Κάτι πήγε στραβά. Παρακαλούμε δοκιμάστε ξανά."}</p>
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
