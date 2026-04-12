// /pages/dashboard/contact.tsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AppointmentsApi,
  type AppointmentsGetDto,
  type AppointmentsPostDto,
} from "@/api/AppointmentsController";
import {
  ContactMessagesApi,
  type ContactMessagesGetDto,
} from "@/api/ContactMessagesController";
import {
  ProvidedServicesApi,
  type ProvidedServicesGetDto,
} from "@/api/ProvidedServicesController";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl bg-white backdrop-blur-sm shadow-sm border border-slate-200/50",
      className
    )}
  >
    {children}
  </div>
);

type Tab = "bookings" | "messages";

type Slot = {
  id: string;
  serviceId: number;
  dateStr: string;
  timeStr: string;
  durationMin: number;
};

type CreateAppointmentForm = {
  providedServiceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPrepaid: boolean;
  message: string;
};

type CreateAppointmentErrors = Partial<{
  providedServiceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  slot: string;
}>;

function formatDateTimeLocal(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoFromLocal(value: string) {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

function getServiceIdFromAppointment(b: AppointmentsGetDto) {
  return b.providedServiceId ?? b.serviceId ?? b.providedService?.id ?? 0;
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

function todayDateOnly() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ================= Page ================= */
export default function ManagementContactPage() {
  const [active, setActive] = useState<Tab>("bookings");

  return (
    <>
      <Head>
        <title>Διαχείριση | ΕΠΙΚΟΙΝΩΝΙΑ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
            >
              ← Πίσω στο Dashboard
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              ΕΠΙΚΟΙΝΩΝΙΑ
            </h1>
          </div>

          <Card className="mb-6 p-4 md:p-5">
            <div className="flex gap-2">
              {[
                { key: "bookings", label: "Ραντεβού" },
                { key: "messages", label: "Μηνύματα" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key as Tab)}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active === t.key
                      ? "bg-[#8484d1] text-white"
                      : "border border-slate-200 bg-white hover:border-[#8484d1]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          {active === "bookings" ? <BookingsManager /> : <MessagesManager />}
        </div>
      </div>
    </>
  );
}

/* =============== ΡΑΝΤΕΒΟΥ =============== */

function BookingsManager() {
  const [all, setAll] = useState<AppointmentsGetDto[]>([]);
  const [services, setServices] = useState<ProvidedServicesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [date, setDate] = useState<string>("");
  const [toast, setToast] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createErrors, setCreateErrors] = useState<CreateAppointmentErrors>({});
  const [createForm, setCreateForm] = useState<CreateAppointmentForm>({
    providedServiceId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    isPrepaid: false,
    message: "",
  });

  const [createSlots, setCreateSlots] = useState<Slot[]>([]);
  const [createSlotsLoading, setCreateSlotsLoading] = useState(false);
  const [createSelectedDate, setCreateSelectedDate] = useState("");
  const [createSelectedSlotId, setCreateSelectedSlotId] = useState("");
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [appointmentsRes, servicesRes] = await Promise.all([
          AppointmentsApi.list(),
          ProvidedServicesApi.list(),
        ]);
        setAll(appointmentsRes);
        setServices(servicesRes);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setCreateSlots([]);
      setCreateSelectedDate("");
      setCreateSelectedSlotId("");
      setCreateSubmitError(null);
      setCreateErrors((prev) => ({
        ...prev,
        slot: undefined,
        providedServiceId: undefined,
      }));

      if (!createOpen || !createForm.providedServiceId) return;

      setCreateSlotsLoading(true);

      try {
        const dates = await AppointmentsApi.getAvailableDates({
          fromDate: todayDateOnly(),
          daysAhead: 30,
        });

        if (!mounted) return;

        if (!dates.length) {
          setCreateSlots([]);
          setCreateSelectedDate("");
          return;
        }

        setCreateSelectedDate(dates[0]);

        const allSlots: Slot[] = [];

        for (const dateStr of dates) {
          const times = await AppointmentsApi.getAvailableSlots(dateStr);
          if (!mounted) return;

          for (const timeStr of times) {
            allSlots.push({
              id: `${createForm.providedServiceId}-${dateStr}-${timeStr}`,
              serviceId: Number(createForm.providedServiceId),
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

        setCreateSlots(allSlots);
      } catch (err: unknown) {
        if (!mounted) return;
        setCreateSlots([]);
        setCreateSelectedDate("");
        const messageText =
          err instanceof Error ? err.message : "Δεν ήταν δυνατή η φόρτωση διαθεσιμότητας.";
        setCreateSubmitError(messageText);
      } finally {
        if (mounted) setCreateSlotsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [createOpen, createForm.providedServiceId]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return all.filter((b) => {
      const appointmentDate = new Date(b.appointmentDate);
      const dateOnly = Number.isNaN(appointmentDate.getTime())
        ? ""
        : appointmentDate.toISOString().slice(0, 10);

      const matchesQ =
        !s ||
        [
          b.customerName,
          b.customerEmail,
          b.customerPhone,
          b.providedService?.category,
          b.providedService?.description,
        ]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(s));

      const matchesDate = !date || dateOnly === date;

      return matchesQ && matchesDate;
    });
  }, [all, q, date]);

  const createAvailableDates = useMemo(() => {
    const uniq = new Set<string>();
    for (const s of createSlots) uniq.add(s.dateStr);
    return Array.from(uniq);
  }, [createSlots]);

  const createSlotsForSelectedDate = useMemo(() => {
    return createSlots.filter((s) => s.dateStr === createSelectedDate);
  }, [createSlots, createSelectedDate]);

  const createSelectedSlot = useMemo(() => {
    return createSlots.find((s) => s.id === createSelectedSlotId) || null;
  }, [createSlots, createSelectedSlotId]);

  function openCreateModal() {
    if (!services.length) {
      setToast("Δεν υπάρχουν διαθέσιμες υπηρεσίες.");
      return;
    }

    setCreateErrors({});
    setCreateSubmitError(null);
    setCreateSlots([]);
    setCreateSelectedDate("");
    setCreateSelectedSlotId("");
    setCreateForm({
      providedServiceId: String(services[0].id),
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      isPrepaid: false,
      message: "",
    });
    setCreateOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;
    setCreateOpen(false);
    setCreateErrors({});
    setCreateSubmitError(null);
  }

  function validateCreateForm(form: CreateAppointmentForm) {
    const errors: CreateAppointmentErrors = {};

    if (!form.providedServiceId) {
      errors.providedServiceId = "Επιλέξτε υπηρεσία.";
    }

    if (!form.customerName.trim()) {
      errors.customerName = "Συμπληρώστε όνομα.";
    }

    if (!form.customerPhone.trim()) {
      errors.customerPhone = "Συμπληρώστε τηλέφωνο.";
    }

    if (form.customerEmail.trim()) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail.trim());
      if (!ok) errors.customerEmail = "Μη έγκυρο email.";
    }

    if (!createSelectedSlot) {
      errors.slot = "Παρακαλούμε επιλέξτε διαθέσιμη ημέρα και ώρα.";
    }

    if (createSelectedSlot) {
      const when = combineToDate(
        createSelectedSlot.dateStr,
        createSelectedSlot.timeStr
      );
      if (when.getTime() <= Date.now()) {
        errors.slot = "Παρακαλούμε επιλέξτε μελλοντικό διαθέσιμο ραντεβού.";
      }
    }

    return errors;
  }

  async function handleCreateSubmit() {
    const errors = validateCreateForm(createForm);
    setCreateErrors(errors);

    if (Object.keys(errors).length > 0) return;
    if (!createSelectedSlot) return;

    try {
      setCreating(true);
      setCreateSubmitError(null);

      const payload: AppointmentsPostDto = {
        providedServiceId: Number(createForm.providedServiceId),
        appointmentDate: combineToDate(
          createSelectedSlot.dateStr,
          createSelectedSlot.timeStr
        ).toISOString(),
        customerName: createForm.customerName.trim(),
        customerEmail: createForm.customerEmail.trim(),
        customerPhone: createForm.customerPhone.trim(),
        isPrepaid: createForm.isPrepaid,
      };

      const created = await AppointmentsApi.create(payload);
      setAll((prev) => [created, ...prev]);
      setCreateOpen(false);
      setToast("Δημιουργήθηκε.");
    } catch (err: unknown) {
      const messageText =
        err instanceof Error ? err.message : "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";
      setCreateSubmitError(messageText);
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(b: AppointmentsGetDto) {
    try {
      setBusyId(b.id);

      const payload: AppointmentsPostDto = {
        providedServiceId: getServiceIdFromAppointment(b),
        appointmentDate: b.appointmentDate,
        customerName: b.customerName,
        customerEmail: b.customerEmail,
        customerPhone: b.customerPhone,
        isPrepaid: b.isPrepaid,
      };

      await AppointmentsApi.update(b.id, payload);
      const fresh = await AppointmentsApi.get(b.id);
      setAll((prev) => prev.map((x) => (x.id === fresh.id ? fresh : x)));
      setToast("Αποθηκεύτηκε.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή ραντεβού;")) return;

    try {
      setBusyId(id);
      await AppointmentsApi.remove(id);
      setAll((prev) => prev.filter((x) => x.id !== id));
      setToast("Διαγράφηκε.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="mb-6 p-4 md:p-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση όνομα, email, τηλέφωνο, υπηρεσία…"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
          />
          <button
            onClick={openCreateModal}
            disabled={loading || creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              loading || creating
                ? "cursor-wait bg-[#8484d1]/70 text-white"
                : "bg-[#8484d1] text-white hover:shadow"
            )}
          >
            Νέο ραντεβού
          </button>
        </div>
      </Card>

      <Card className="table-scroll overflow-x-auto p-0">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            Φόρτωση ραντεβού…
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Ημ/νία και ώρα</th>
                <th className="px-4 py-3 text-left">Υπηρεσία</th>
                <th className="px-4 py-3 text-left">Όνομα</th>
                <th className="px-4 py-3 text-left">Τηλέφωνο</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Προπληρωμένο</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <AppointmentRow
                  key={b.id}
                  row={b}
                  busy={busyId === b.id}
                  services={services}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Καμία εγγραφή.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Νέο ραντεβού</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Επιλέξτε υπηρεσία και διαθέσιμο slot, όπως στη δημόσια φόρμα.
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                disabled={creating}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-[#8484d1]"
              >
                Κλείσιμο
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-5 md:gap-6">
              <div className="md:col-span-3">
                <div className="rounded-2xl bg-white p-6 shadow-[0_16px_34px_rgba(255,230,150,0.10)] ring-2 ring-slate-200/70">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 md:text-xl">
                      Δημιουργία ραντεβού
                    </h3>
                    <p className="mt-1 text-[15px] text-slate-600">
                      <span className="font-semibold text-slate-800">
                        Υποχρεωτικά πεδία
                      </span>
                      <span className="text-slate-600"> σημειώνονται με </span>
                      <span className="font-semibold text-rose-600">*</span>
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <div className="mb-1 text-sm font-semibold tracking-wide text-slate-700">
                        Βήμα 1: Επιλέξτε υπηρεσία
                      </div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Υπηρεσία <span className="text-rose-600">*</span>
                      </label>

                      <select
                        value={createForm.providedServiceId}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            providedServiceId: e.target.value,
                          }));
                          setCreateErrors((prev) => ({
                            ...prev,
                            providedServiceId: undefined,
                            slot: undefined,
                          }));
                          setCreateSubmitError(null);
                        }}
                        disabled={creating}
                        className="mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[#8484d1] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="" disabled>
                          — Επιλέξτε υπηρεσία —
                        </option>
                        {services.map((s) => (
                          <option key={s.id} value={String(s.id)}>
                            {s.description?.trim() || s.category}
                          </option>
                        ))}
                      </select>

                      {createErrors.providedServiceId && (
                        <p className="mt-1 text-sm text-rose-600">
                          {createErrors.providedServiceId}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Ονοματεπώνυμο <span className="text-rose-600">*</span>
                      </label>
                      <input
                        value={createForm.customerName}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            customerName: e.target.value,
                          }));
                          setCreateErrors((prev) => ({
                            ...prev,
                            customerName: undefined,
                          }));
                        }}
                        className="mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[#8484d1]"
                        placeholder="π.χ. Μαρία Παπαδοπούλου"
                        disabled={creating}
                      />
                      {createErrors.customerName && (
                        <p className="mt-1 text-sm text-rose-600">
                          {createErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Τηλέφωνο <span className="text-rose-600">*</span>
                      </label>
                      <input
                        value={createForm.customerPhone}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            customerPhone: e.target.value,
                          }));
                          setCreateErrors((prev) => ({
                            ...prev,
                            customerPhone: undefined,
                          }));
                        }}
                        className="mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[#8484d1]"
                        placeholder="π.χ. 69XXXXXXXX"
                        disabled={creating}
                      />
                      {createErrors.customerPhone && (
                        <p className="mt-1 text-sm text-rose-600">
                          {createErrors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Email
                      </label>
                      <input
                        value={createForm.customerEmail}
                        onChange={(e) => {
                          setCreateForm((prev) => ({
                            ...prev,
                            customerEmail: e.target.value,
                          }));
                          setCreateErrors((prev) => ({
                            ...prev,
                            customerEmail: undefined,
                          }));
                        }}
                        className="mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[#8484d1]"
                        placeholder="π.χ. name@email.com"
                        disabled={creating}
                      />
                      {createErrors.customerEmail && (
                        <p className="mt-1 text-sm text-rose-600">
                          {createErrors.customerEmail}
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <label className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={createForm.isPrepaid}
                          onChange={(e) =>
                            setCreateForm((prev) => ({
                              ...prev,
                              isPrepaid: e.target.checked,
                            }))
                          }
                          disabled={creating}
                        />
                        Προπληρωμένο
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <div className="mb-1 text-sm font-semibold tracking-wide text-slate-700">
                        Βήμα 2: Διαλέξτε ημέρα και ώρα
                      </div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Διαθεσιμότητα <span className="text-rose-600">*</span>
                      </label>

                      <div
                        className={[
                          "mt-1 rounded-xl bg-white p-3 ring-1 ring-slate-300",
                          !createForm.providedServiceId ? "opacity-70" : "",
                        ].join(" ")}
                      >
                        <div className="mb-2 text-sm text-slate-600">
                          {createForm.providedServiceId
                            ? "Επιλέξτε ημέρα και ώρα. Εμφανίζονται μόνο διαθέσιμες επιλογές."
                            : "Επιλέξτε πρώτα υπηρεσία για να εμφανιστούν διαθέσιμες ημέρες και ώρες."}
                        </div>

                        {createSlotsLoading ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-11 w-28 animate-pulse rounded-lg bg-white ring-1 ring-slate-200"
                                />
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className="h-11 w-20 animate-pulse rounded-lg bg-white ring-1 ring-slate-200"
                                />
                              ))}
                            </div>
                          </div>
                        ) : !createForm.providedServiceId ? (
                          <div className="text-[15px] text-slate-600">—</div>
                        ) : createAvailableDates.length === 0 ? (
                          <div className="text-[15px] text-rose-600">
                            Δεν υπάρχουν διαθέσιμα ραντεβού για τις επόμενες ημέρες.
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2">
                              {createAvailableDates.map((d) => {
                                const active = d === createSelectedDate;

                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    disabled={creating}
                                    onClick={() => {
                                      setCreateSelectedDate(d);
                                      setCreateSelectedSlotId("");
                                      setCreateErrors((p) => ({
                                        ...p,
                                        slot: undefined,
                                      }));
                                    }}
                                    className={[
                                      "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                      active
                                        ? "bg-[#8484d1] text-white ring-[#8484d1]"
                                        : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50",
                                      creating ? "cursor-not-allowed opacity-70" : "",
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

                              {createSelectedDate ? (
                                createSlotsForSelectedDate.length === 0 ? (
                                  <div className="text-[15px] text-slate-600">
                                    Δεν υπάρχουν ώρες για αυτήν την ημέρα.
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-2">
                                    {createSlotsForSelectedDate.map((s) => {
                                      const active = s.id === createSelectedSlotId;

                                      return (
                                        <button
                                          key={s.id}
                                          type="button"
                                          disabled={creating}
                                          onClick={() => {
                                            setCreateSelectedSlotId(s.id);
                                            setCreateErrors((p) => ({
                                              ...p,
                                              slot: undefined,
                                            }));
                                          }}
                                          className={[
                                            "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                            active
                                              ? "bg-[#8484d1] text-white ring-[#8484d1]"
                                              : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50",
                                            creating ? "cursor-not-allowed opacity-70" : "",
                                          ].join(" ")}
                                        >
                                          {s.timeStr}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )
                              ) : (
                                <div className="text-[15px] text-slate-600">
                                  Επιλέξτε πρώτα ημέρα.
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        {createSelectedSlot
                          ? `Επιλέξατε: ${toDateLabel(createSelectedSlot.dateStr)} στις ${createSelectedSlot.timeStr}`
                          : "Δεν έχει επιλεγεί ραντεβού."}
                      </p>

                      {createErrors.slot && (
                        <p className="mt-1 text-sm text-rose-600">{createErrors.slot}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Σύντομο μήνυμα προαιρετικό
                      </label>
                      <textarea
                        rows={4}
                        value={createForm.message}
                        onChange={(e) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        disabled={creating}
                        className="mt-1 w-full rounded-xl border border-black bg-white px-3 py-2 text-[15px] text-slate-900 outline-none focus:border-[#8484d1] disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Τυχόν απορίες ή προτιμήσεις."
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={closeCreateModal}
                        disabled={creating}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Άκυρο
                      </button>
                      <button
                        onClick={handleCreateSubmit}
                        disabled={
                          creating ||
                          createSlotsLoading ||
                          !createForm.providedServiceId ||
                          !createSelectedSlotId
                        }
                        className="rounded-full bg-[#8484d1] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {creating ? "Δημιουργία…" : "Δημιουργία"}
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Το ραντεβού θα δημιουργηθεί με το επιλεγμένο διαθέσιμο slot.
                    </p>

                    {!!createSubmitError && (
                      <p className="mt-3 text-sm text-rose-600">{createSubmitError}</p>
                    )}
                  </div>
                </div>
              </div>

              <aside className="md:col-span-2">
                <div className="rounded-2xl bg-white p-6 shadow-[0_16px_34px_rgba(164,199,126,0.14)] ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Χρήσιμες Πληροφορίες
                  </h3>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] text-slate-700">
                    <li>Εμφανίζονται μόνο τα διαθέσιμα slots από το backend.</li>
                    <li>Η επιλογή ώρας γίνεται μέσα από τις διαθέσιμες ημερομηνίες.</li>
                    <li>Το backend availability δεν είναι service-specific.</li>
                  </ul>

                  <div className="mt-5 h-px bg-slate-200" />

                  <p className="mt-4 text-[15px] text-slate-600">
                    Το modal αυτό ακολουθεί το ίδιο flow με τη δημόσια φόρμα booking.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

function AppointmentRow({
  row,
  busy,
  services,
  onSave,
  onDelete,
}: {
  row: AppointmentsGetDto;
  busy: boolean;
  services: ProvidedServicesGetDto[];
  onSave: (b: AppointmentsGetDto) => void;
  onDelete: (id: number) => void;
}) {
  const [b, setB] = useState<AppointmentsGetDto>(row);

  useEffect(() => setB(row), [row]);

  function handleServiceChange(serviceId: number) {
    const service = services.find((x) => x.id === serviceId);
    if (!service) return;

    setB((prev) => ({
      ...prev,
      providedServiceId: service.id,
      serviceId: service.id,
      providedService: {
        id: service.id,
        category: service.category,
        duration: service.duration,
        description: service.description,
        priceIncludingVAT: service.priceIncludingVAT,
        interval: service.intervalInDays,
        intervalInDays: service.intervalInDays,
      },
    }));
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="align-top px-4 py-3">{b.id}</td>

      <td className="align-top px-4 py-3">
        <input
          type="datetime-local"
          value={formatDateTimeLocal(b.appointmentDate)}
          onChange={(e) =>
            setB((prev) => ({
              ...prev,
              appointmentDate: toIsoFromLocal(e.target.value),
            }))
          }
          className="rounded-md border border-black bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="align-top px-4 py-3">
        <select
          value={getServiceIdFromAppointment(b)}
          onChange={(e) => handleServiceChange(Number(e.target.value))}
          className="w-56 rounded-md border border-black bg-white px-2 py-1 text-xs outline-none"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.category}
            </option>
          ))}
        </select>
      </td>

      <td className="align-top px-4 py-3">
        <input
          value={b.customerName}
          onChange={(e) =>
            setB((prev) => ({ ...prev, customerName: e.target.value }))
          }
          className="w-48 rounded-md border border-black bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="align-top px-4 py-3">
        <input
          value={b.customerPhone}
          onChange={(e) =>
            setB((prev) => ({ ...prev, customerPhone: e.target.value }))
          }
          className="w-36 rounded-md border border-black bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="align-top px-4 py-3">
        <input
          value={b.customerEmail}
          onChange={(e) =>
            setB((prev) => ({ ...prev, customerEmail: e.target.value }))
          }
          className="w-52 rounded-md border border-black bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="align-top px-4 py-3">
        <label className="inline-flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={b.isPrepaid}
            onChange={(e) =>
              setB((prev) => ({ ...prev, isPrepaid: e.target.checked }))
            }
          />
          Ναι
        </label>
      </td>

      <td className="align-top px-4 py-3">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSave(b)}
            disabled={busy}
            className={cx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              busy
                ? "cursor-wait bg-[#8484d1]/70 text-white"
                : "bg-[#8484d1] text-white"
            )}
          >
            {busy ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>

          <button
            onClick={() => onDelete(b.id)}
            disabled={busy}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700"
          >
            Διαγραφή
          </button>
        </div>
      </td>
    </tr>
  );
}

/* =============== ΜΗΝΥΜΑΤΑ =============== */

function MessagesManager() {
  const [messages, setMessages] = useState<ContactMessagesGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setMessages(await ContactMessagesApi.list());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return messages;

    return messages.filter((m) =>
      [m.senderName, m.senderEmail, m.message]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(s))
    );
  }, [messages, q]);

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή μηνύματος;")) return;

    try {
      setBusyId(id);
      await ContactMessagesApi.remove(id);
      setMessages((prev) => prev.filter((x) => x.id !== id));
      setToast("Διαγράφηκε.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="mb-6 p-4 md:p-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Αναζήτηση όνομα, email, μήνυμα…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
        />
      </Card>

      <Card className="divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            Φόρτωση μηνυμάτων…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            Κανένα μήνυμα.
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {m.senderName}
                  </div>
                  <div className="text-sm text-slate-600">{m.senderEmail}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(m.sentAt).toLocaleString("el-GR")}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={busyId === m.id}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700"
                >
                  {busyId === m.id ? "Διαγραφή…" : "Διαγραφή"}
                </button>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {m.message}
              </p>
            </div>
          ))
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}