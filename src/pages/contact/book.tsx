import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppointmentsApi } from "../../api/AppointmentsController";
import { ProvidedServicesApi } from "../../api/ProvidedServicesController";

/**
 * ΚΛΕΙΣΤΕ ΡΑΝΤΕΒΟΥ — Booking form
 * - Services loaded from /api/ProvidedServices
 * - Real availability from:
 *   GET /api/Appointments/available-dates
 *   GET /api/Appointments/available-slots?date=YYYY-MM-DD
 * - Real POST to /api/Appointments
 * - Backend availability endpoints currently do not accept serviceId,
 *   so the selected service remains part of the booking flow/UI,
 *   while date/slot availability is loaded from backend as provided.
 */

type Service = {
  id: number;
  label: string;
  category: string;
  duration: number;
  description: string;
  priceIncludingVAT: number;
};

type Slot = {
  id: string;
  serviceId: number;
  dateStr: string;
  timeStr: string;
  durationMin: number;
};

type FieldErrors = Partial<{
  service: string;
  fullName: string;
  phone: string;
  email: string;
  slot: string;
}>;

const INPUT_BASE =
  "mt-1 w-full rounded-xl bg-white px-3 h-12 text-[15px] text-slate-900 ring-1 ring-accent/30 outline-none " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const LABEL_BASE = "block text-[15px] font-semibold text-slate-900";
const STEP_BASE = "mb-1 text-sm font-semibold tracking-wide text-slate-700";
const ERROR_TEXT = "mt-1 text-sm text-rose-600";

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

function todayDateOnly() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function BookPage() {
  const [loading, setLoading] = useState(false);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [successPayload, setSuccessPayload] = useState<null | {
    serviceLabel: string;
    dateStr: string;
    timeStr: string;
    fullName: string;
    phone: string;
    email: string;
    message?: string;
  }>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setServicesLoading(true);

      try {
        const data = await ProvidedServicesApi.list();
        if (!mounted) return;

        const mapped: Service[] = data.map((item) => ({
          id: item.id,
          label: item.description?.trim() || item.category,
          category: item.category,
          duration: item.duration,
          description: item.description,
          priceIncludingVAT: item.priceIncludingVAT,
        }));

        setServices(mapped);
      } catch {
        if (!mounted) return;
        setServices([]);
      } finally {
        if (mounted) setServicesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setSlots([]);
      setSelectedDate("");
      setSelectedSlotId("");
      setSubmitError(null);
      setFieldErrors((prev) => ({ ...prev, slot: undefined, service: undefined }));

      if (!selectedService) return;

      setSlotsLoading(true);

      try {
        const dates = await AppointmentsApi.getAvailableDates({
          fromDate: todayDateOnly(),
          daysAhead: 30,
        });

        if (!mounted) return;

        if (!dates.length) {
          setSlots([]);
          setSelectedDate("");
          return;
        }

        setSelectedDate(dates[0]);

        const allSlots: Slot[] = [];

        for (const dateStr of dates) {
          const times = await AppointmentsApi.getAvailableSlots(dateStr);
          if (!mounted) return;

          for (const timeStr of times) {
            allSlots.push({
              id: `${selectedService}-${dateStr}-${timeStr}`,
              serviceId: Number(selectedService),
              dateStr,
              timeStr,
              durationMin: 60,
            });
          }
        }

        allSlots.sort((a, b) => {
          const ad = combineToDate(a.dateStr, a.timeStr).getTime();
          const bd = combineToDate(b.dateStr, b.timeStr).getTime();
          return ad - bd;
        });

        setSlots(allSlots);
      } catch (err: unknown) {
        if (!mounted) return;
        setSlots([]);
        setSelectedDate("");
        const messageText =
          err instanceof Error ? err.message : "Δεν ήταν δυνατή η φόρτωση διαθεσιμότητας.";
        setSubmitError(messageText);
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

  const selectedServiceData = useMemo(() => {
    return services.find((s) => String(s.id) === selectedService) || null;
  }, [services, selectedService]);

  const selectedServiceLabel = selectedServiceData?.label || "";

  function markTouched(name: string) {
    setTouched((p) => ({ ...p, [name]: true }));
  }

  function validate(payload: { fullName?: string; phone?: string; email?: string }) {
    const next: FieldErrors = {};

    if (!selectedService) next.service = "Παρακαλούμε επιλέξτε υπηρεσία.";
    if (!payload.fullName?.trim()) next.fullName = "Συμπληρώστε ονοματεπώνυμο.";
    if (!payload.phone?.trim()) next.phone = "Συμπληρώστε τηλέφωνο.";

    if (payload.email?.trim()) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim());
      if (!ok) next.email = "Συμπληρώστε έγκυρο email.";
    }

    if (!selectedSlot) next.slot = "Παρακαλούμε επιλέξτε διαθέσιμη ημέρα και ώρα.";

    if (selectedSlot) {
      const when = combineToDate(selectedSlot.dateStr, selectedSlot.timeStr);
      if (when.getTime() <= Date.now()) {
        next.slot = "Παρακαλούμε επιλέξτε μελλοντικό διαθέσιμο ραντεβού.";
      }
    }

    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSubmitError(null);
    setSuccessPayload(null);

    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get("fullName") || "");
    const phone = String(fd.get("phone") || "");
    const email = String(fd.get("email") || "");
    const message = String(fd.get("message") || "");

    setTouched((p) => ({
      ...p,
      service: true,
      fullName: true,
      phone: true,
      slot: true,
      email: p.email || false,
    }));

    const nextErrors = validate({ fullName, phone, email });
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setLoading(false);
      return;
    }

    if (!selectedSlot || !selectedServiceData) {
      setSubmitError("Δεν ήταν δυνατή η δημιουργία του ραντεβού.");
      setLoading(false);
      return;
    }

    try {
      const appointmentDate = combineToDate(
        selectedSlot.dateStr,
        selectedSlot.timeStr
      ).toISOString();

      await AppointmentsApi.create({
        providedServiceId: selectedServiceData.id,
        appointmentDate,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        isPrepaid: false,
      });

      setSuccessPayload({
        serviceLabel: selectedServiceLabel,
        dateStr: selectedSlot.dateStr,
        timeStr: selectedSlot.timeStr,
        fullName,
        phone,
        email,
        message,
      });

      (e.target as HTMLFormElement).reset();
      setSelectedService("");
      setSlots([]);
      setSelectedDate("");
      setSelectedSlotId("");
      setFieldErrors({});
      setTouched({});
    } catch (err: unknown) {
      const messageText =
        err instanceof Error ? err.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      setSubmitError(messageText);
    } finally {
      setLoading(false);
    }
  }

  const show = (name: keyof FieldErrors) => {
    if (!fieldErrors[name]) return false;
    return Boolean(touched[name as string]);
  };

  return (
    <>
      <Head>
        <title>Κλείστε Ραντεβού — Επικοινωνία</title>
        <meta
          name="description"
          content="Κλείστε ραντεβού εύκολα. Επιλέξτε υπηρεσία, διαθέσιμη ημερομηνία και ώρα — θα σας στείλουμε email για επιβεβαίωση."
        />
        <link rel="canonical" href="https://example.gr/contact/book" />
      </Head>

      <section className="bg-bg">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Κλείστε Ραντεβού
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700 leading-relaxed">
              Επιλέξτε υπηρεσία και θα εμφανιστούν <span className="font-medium">μόνο</span> οι
              διαθέσιμες ημέρες και ώρες. Συμπληρώστε τη φόρμα και θα σας στείλουμε email για επιβεβαίωση.
            </p>
          </header>

          {successPayload && (
            <div className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-accent/25 shadow-[0_16px_34px_rgba(164,199,126,0.14)]">
              <h2 className="text-xl font-semibold text-slate-900">Το αίτημά σας υποβλήθηκε</h2>
              <p className="mt-1 text-base text-slate-700">Θα σας στείλουμε email για επιβεβαίωση.</p>

              <div className="mt-4 grid grid-cols-1 gap-3 text-[15px] text-slate-800 md:grid-cols-2">
                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20">
                  <div className="text-sm text-slate-600">Υπηρεσία</div>
                  <div className="mt-0.5 font-medium">{successPayload.serviceLabel}</div>
                </div>

                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20">
                  <div className="text-sm text-slate-600">Ραντεβού</div>
                  <div className="mt-0.5 font-medium">
                    {toDateLabel(successPayload.dateStr)} στις {successPayload.timeStr}
                  </div>
                </div>

                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20">
                  <div className="text-sm text-slate-600">Ονοματεπώνυμο</div>
                  <div className="mt-0.5 font-medium">{successPayload.fullName}</div>
                </div>

                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20">
                  <div className="text-sm text-slate-600">Τηλέφωνο</div>
                  <div className="mt-0.5 font-medium">{successPayload.phone}</div>
                </div>

                {successPayload.email?.trim() && (
                  <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20 md:col-span-2">
                    <div className="text-sm text-slate-600">Email</div>
                    <div className="mt-0.5 font-medium">{successPayload.email}</div>
                  </div>
                )}

                {successPayload.message?.trim() && (
                  <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20 md:col-span-2">
                    <div className="text-sm text-slate-600">Μήνυμα</div>
                    <div className="mt-0.5">{successPayload.message}</div>
                  </div>
                )}
              </div>

              <div className="mt-5">
                <Link
                  href="/contact/book"
                  className="inline-flex h-12 items-center rounded-xl bg-primary px-4 text-[15px] font-semibold text-white transition hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35"
                >
                  Κλείστε νέο ραντεβού
                </Link>
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
              <form
                onSubmit={onSubmit}
                className="rounded-2xl bg-white p-6 shadow-[0_16px_34px_rgba(255,230,150,0.10)] ring-2 ring-warm/40"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                    Αίτημα ραντεβού
                  </h2>
                  <p className="mt-1 text-[15px] text-slate-600">
                    <span className="font-semibold text-slate-800">Υποχρεωτικά πεδία</span>
                    <span className="text-slate-600"> σημειώνονται με </span>
                    <span className="font-semibold text-rose-600">*</span>
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <div className={STEP_BASE}>Βήμα 1: Επιλέξτε υπηρεσία</div>
                    <label className={LABEL_BASE}>
                      Υπηρεσία <span className="text-rose-600">*</span>
                    </label>

                    <select
                      name="service"
                      value={selectedService}
                      onChange={(e) => {
                        setSelectedService(e.target.value);
                        setFieldErrors((p) => ({ ...p, service: undefined, slot: undefined }));
                        setSubmitError(null);
                      }}
                      onBlur={() => markTouched("service")}
                      required
                      disabled={servicesLoading || loading}
                      aria-invalid={show("service")}
                      aria-describedby={show("service") ? "service-error" : undefined}
                      className={INPUT_BASE}
                    >
                      <option value="" disabled>
                        {servicesLoading ? "Φόρτωση υπηρεσιών..." : "— Επιλέξτε υπηρεσία —"}
                      </option>

                      {services.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.label}
                        </option>
                      ))}
                    </select>

                    {show("service") && (
                      <p id="service-error" className={ERROR_TEXT}>
                        {fieldErrors.service}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_BASE}>
                      Ονοματεπώνυμο <span className="text-rose-600">*</span>
                    </label>

                    <input
                      name="fullName"
                      required
                      onBlur={() => markTouched("fullName")}
                      onChange={() => setFieldErrors((p) => ({ ...p, fullName: undefined }))}
                      aria-invalid={show("fullName")}
                      aria-describedby={show("fullName") ? "fullName-error" : undefined}
                      className={INPUT_BASE}
                      placeholder="π.χ. Μαρία Παπαδοπούλου"
                      disabled={loading}
                    />

                    {show("fullName") && (
                      <p id="fullName-error" className={ERROR_TEXT}>
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_BASE}>
                      Τηλέφωνο <span className="text-rose-600">*</span>
                    </label>

                    <input
                      name="phone"
                      required
                      inputMode="tel"
                      autoComplete="tel"
                      onBlur={() => markTouched("phone")}
                      onChange={() => setFieldErrors((p) => ({ ...p, phone: undefined }))}
                      aria-invalid={show("phone")}
                      aria-describedby={show("phone") ? "phone-error" : undefined}
                      className={INPUT_BASE}
                      placeholder="π.χ. 69XXXXXXXX"
                      disabled={loading}
                    />

                    {show("phone") && (
                      <p id="phone-error" className={ERROR_TEXT}>
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_BASE}>Email</label>

                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      onBlur={() => markTouched("email")}
                      onChange={() => setFieldErrors((p) => ({ ...p, email: undefined }))}
                      aria-invalid={show("email")}
                      aria-describedby={show("email") ? "email-error" : undefined}
                      className={INPUT_BASE}
                      placeholder="π.χ. name@email.com"
                      disabled={loading}
                    />

                    {show("email") && (
                      <p id="email-error" className={ERROR_TEXT}>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className={STEP_BASE}>Βήμα 2: Διαλέξτε ημέρα & ώρα</div>
                    <label className={LABEL_BASE}>
                      Διαθεσιμότητα <span className="text-rose-600">*</span>
                    </label>

                    <div
                      className={[
                        "mt-1 rounded-xl bg-white p-3 ring-1 ring-accent/30",
                        !selectedService ? "opacity-70" : "",
                      ].join(" ")}
                    >
                      <div className="mb-2 text-sm text-slate-600">
                        {selectedService
                          ? "Επιλέξτε ημέρα και ώρα. Εμφανίζονται μόνο διαθέσιμες επιλογές."
                          : "Επιλέξτε πρώτα υπηρεσία για να εμφανιστούν διαθέσιμες ημέρες και ώρες."}
                      </div>

                      {slotsLoading ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-11 w-28 animate-pulse rounded-lg bg-white ring-1 ring-accent/20"
                              />
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-11 w-20 animate-pulse rounded-lg bg-white ring-1 ring-accent/20"
                              />
                            ))}
                          </div>
                        </div>
                      ) : !selectedService ? (
                        <div className="text-[15px] text-slate-600">—</div>
                      ) : availableDates.length === 0 ? (
                        <div className="text-[15px] text-rose-600">
                          Δεν υπάρχουν διαθέσιμα ραντεβού για τις επόμενες ημέρες.
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
                                  disabled={loading}
                                  onClick={() => {
                                    setSelectedDate(d);
                                    setSelectedSlotId("");
                                    setFieldErrors((p) => ({ ...p, slot: undefined }));
                                  }}
                                  onBlur={() => markTouched("slot")}
                                  className={[
                                    "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35",
                                    active
                                      ? "bg-primary text-white ring-primary"
                                      : "bg-white text-slate-800 ring-accent/30 hover:bg-accent/10",
                                    loading ? "cursor-not-allowed opacity-70" : "",
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

                          <div className="mt-3">
                            <div className="mb-2 text-sm text-slate-600">
                              Ώρες για την επιλεγμένη ημέρα:
                            </div>

                            {selectedDate ? (
                              slotsForSelectedDate.length === 0 ? (
                                <div className="text-[15px] text-slate-600">
                                  Δεν υπάρχουν ώρες για αυτήν την ημέρα.
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {slotsForSelectedDate.map((s) => {
                                    const active = s.id === selectedSlotId;

                                    return (
                                      <button
                                        key={s.id}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => {
                                          setSelectedSlotId(s.id);
                                          setFieldErrors((p) => ({ ...p, slot: undefined }));
                                        }}
                                        onBlur={() => markTouched("slot")}
                                        className={[
                                          "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35",
                                          active
                                            ? "bg-primary text-white ring-primary"
                                            : "bg-white text-slate-800 ring-accent/30 hover:bg-accent/10",
                                          loading ? "cursor-not-allowed opacity-70" : "",
                                        ].join(" ")}
                                      >
                                        {s.timeStr}
                                      </button>
                                    );
                                  })}
                                </div>
                              )
                            ) : (
                              <div className="text-[15px] text-slate-600">Επιλέξτε πρώτα ημέρα.</div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <input type="hidden" name="slotId" value={selectedSlotId} />
                    <input type="hidden" name="date" value={selectedSlot?.dateStr || ""} />
                    <input type="hidden" name="time" value={selectedSlot?.timeStr || ""} />

                    <p className="mt-2 text-sm text-slate-600">
                      {selectedSlot
                        ? `Επιλέξατε: ${toDateLabel(selectedSlot.dateStr)} στις ${selectedSlot.timeStr}`
                        : "Δεν έχει επιλεγεί ραντεβού."}
                    </p>

                    {show("slot") && <p className={ERROR_TEXT}>{fieldErrors.slot}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className={LABEL_BASE}>Σύντομο μήνυμα προαιρετικό</label>

                    <textarea
                      name="message"
                      rows={4}
                      disabled={loading}
                      className={[
                        "mt-1 w-full rounded-xl bg-white px-3 py-2 text-[15px] text-slate-900 ring-1 ring-accent/30 outline-none",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                      ].join(" ")}
                      placeholder="Τυχόν απορίες ή προτιμήσεις."
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      servicesLoading ||
                      slotsLoading ||
                      !selectedService ||
                      !selectedSlotId
                    }
                    className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 disabled:opacity-50"
                  >
                    {loading ? "Αποστολή..." : "Αίτημα Ραντεβού"}
                  </button>

                  <p className="mt-2 text-sm text-slate-600">Θα σας στείλουμε email για επιβεβαίωση.</p>

                  <div className="mt-3">
                    <Link
                      href="/contact/form"
                      className="inline-flex items-center text-[15px] text-slate-600 underline decoration-slate-400/30 transition hover:text-primary hover:decoration-primary/40"
                    >
                      Εναλλακτικά, Φόρμα Επικοινωνίας →
                    </Link>
                  </div>

                  {!!submitError && <p className="mt-3 text-sm text-rose-600">{submitError}</p>}
                </div>
              </form>
            </div>

            <aside className="md:col-span-2">
              <div className="rounded-2xl bg-white p-6 shadow-[0_16px_34px_rgba(164,199,126,0.14)] ring-1 ring-accent/30">
                <h2 className="text-xl font-semibold text-slate-900">Χρήσιμες Πληροφορίες</h2>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] text-slate-700 marker:text-accent/80">
                  <li>Ώρες λειτουργίας: Δευ–Παρ 10:00–18:00</li>
                  <li>Το ραντεβού επιβεβαιώνεται τηλεφωνικά.</li>
                  <li>Ακύρωση ή αλλαγή έως 24 ώρες πριν.</li>
                </ul>

                <div className="mt-5 h-px bg-accent/35" />

                <p className="mt-4 text-[15px] text-slate-600">
                  Για απορίες, δείτε και την{" "}
                  <Link
                    href="/contact/form"
                    className="text-primary underline decoration-primary/30 transition hover:text-accent hover:decoration-accent/50"
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