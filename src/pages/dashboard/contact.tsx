// pages/dashboard/contact.tsx
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
import {
  UsefulInfoApi,
  type UsefulInfoGetDto,
} from "@/api/UsefulInfoController";
import RichTextEditor from "@/components/admin/RichTextEditor";

import {
  NewsletterSubscribersApi,
  type NewsletterSubscriberGetDto,
} from "@/api/NewsletterSubscribersController";

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

type Tab = "bookings" | "messages" | "newsletter" | "usefulInfo";

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
  message: string;
};

type CreateAppointmentErrors = Partial<{
  providedServiceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  slot: string;
}>;

function stripHtml(value?: string | null) {
  if (!value) return "";

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

function getServiceLabel(service?: ProvidedServicesGetDto | null) {
  if (!service) return "Άγνωστη υπηρεσία";

  return (
    stripHtml(service.title) ||
    stripHtml(service.category) ||
    stripHtml(service.description) ||
    `Υπηρεσία ${service.id}`
  );
}

function getAppointmentServiceLabel(
  b: AppointmentsGetDto,
  services: ProvidedServicesGetDto[]
) {
  const serviceId = getServiceIdFromAppointment(b);

  const service =
    b.providedService ||
    services.find((s) => s.id === serviceId);

  return (
    stripHtml(service?.title) ||
    stripHtml(service?.category) ||
    stripHtml(service?.description) ||
    `Υπηρεσία #${serviceId}`
  );
}

function formatDateTimeLocal(value: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatAppointmentDate(value: string) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("el-GR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatAppointmentTime(value: string) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
  });
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
            <div className="flex flex-wrap gap-2">
              {[
                { key: "bookings", label: "Ραντεβού" },
                { key: "messages", label: "Μηνύματα" },
                { key: "newsletter", label: "Newsletter" },
                { key: "usefulInfo", label: "Χρήσιμες Πληροφορίες" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key as Tab)}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active === t.key
                      ? "bg-[rgb(var(--primary))] text-white"
                      : "border border-[rgba(var(--border),0.9)] bg-white hover:border-[rgb(var(--primary))]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          {active === "bookings" && <BookingsManager />}
          {active === "messages" && <MessagesManager />}
          {active === "newsletter" && <NewsletterManager />}
          {active === "usefulInfo" && <UsefulInfoManager />}
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
    message: "",
  });

  const [createSlots, setCreateSlots] = useState<Slot[]>([]);
  const [createSlotsLoading, setCreateSlotsLoading] = useState(false);
  const [createSelectedDate, setCreateSelectedDate] = useState("");
  const [createSelectedSlotId, setCreateSelectedSlotId] = useState("");
  const [createSubmitError, setCreateSubmitError] = useState<string | null>(
    null
  );

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
          err instanceof Error
            ? err.message
            : "Δεν ήταν δυνατή η φόρτωση διαθεσιμότητας.";

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
          b.providedService?.title,
          b.providedService?.category,
          b.providedService?.description,
        ]
          .filter(Boolean)
          .map((t) => stripHtml(String(t)).toLowerCase())
          .some((t) => t.includes(s));

      const matchesDate = !date || dateOnly === date;

      return matchesQ && matchesDate;
    });
  }, [all, q, date]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ad = new Date(a.appointmentDate).getTime();
      const bd = new Date(b.appointmentDate).getTime();

      if (Number.isNaN(ad) && Number.isNaN(bd)) return 0;
      if (Number.isNaN(ad)) return 1;
      if (Number.isNaN(bd)) return -1;

      return bd - ad;
    });
  }, [filtered]);

  const createAvailableDates = useMemo(() => {
    const uniq = new Set<string>();

    for (const s of createSlots) {
      uniq.add(s.dateStr);
    }

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

    if (!form.customerEmail.trim()) {
      errors.customerEmail = "Συμπληρώστε email.";
    } else {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.customerEmail.trim()
      );

      if (!ok) {
        errors.customerEmail = "Μη έγκυρο email.";
      }
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
      };

      const created = await AppointmentsApi.create(payload);

      setAll((prev) => [created, ...prev]);
      setCreateOpen(false);
      setToast("Δημιουργήθηκε.");
    } catch (err: unknown) {
      const messageText =
        err instanceof Error
          ? err.message
          : "Κάτι πήγε στραβά. Δοκιμάστε ξανά.";

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
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

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">
            Σύνολο: {all.length}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1">
            Εμφανίζονται: {sortedFiltered.length}
          </span>

          {(q || date) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setDate("");
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-[#8484d1]"
            >
              Καθαρισμός φίλτρων
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            Φόρτωση ραντεβού…
          </div>
        ) : sortedFiltered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">
            Κανένα ραντεβού.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedFiltered.map((b) => (
              <AppointmentCard
                key={b.id}
                row={b}
                busy={busyId === b.id}
                services={services}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </Card>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Νέο ραντεβού
                </h2>

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
                            {getServiceLabel(s)}
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
                        Email <span className="text-rose-600">*</span>
                      </label>

                      <input
                        type="email"
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

                    <div className="md:col-span-2">
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Τηλέφωνο
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
                        placeholder="π.χ. 69XXXXXXXX προαιρετικό"
                        disabled={creating}
                      />

                      {createErrors.customerPhone && (
                        <p className="mt-1 text-sm text-rose-600">
                          {createErrors.customerPhone}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <div className="mb-1 text-sm font-semibold tracking-wide text-slate-700">
                        Βήμα 2: Διαλέξτε ημέρα και ώρα
                      </div>

                      <label className="block text-[15px] font-semibold text-slate-900">
                        Διαθεσιμότητα <span className="text-rose-600">*</span>
                      </label>

                      <div
                        className={cx(
                          "mt-1 rounded-xl bg-white p-3 ring-1 ring-slate-300",
                          !createForm.providedServiceId && "opacity-70"
                        )}
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
                            Δεν υπάρχουν διαθέσιμα ραντεβού για τις επόμενες
                            ημέρες.
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
                                    className={cx(
                                      "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                      active
                                        ? "bg-[#8484d1] text-white ring-[#8484d1]"
                                        : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50",
                                      creating &&
                                        "cursor-not-allowed opacity-70"
                                    )}
                                    title={toDateLabel(d)}
                                  >
                                    {new Date(
                                      d + "T00:00:00"
                                    ).toLocaleDateString("el-GR", {
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
                                      const active =
                                        s.id === createSelectedSlotId;

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
                                          className={cx(
                                            "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                            active
                                              ? "bg-[#8484d1] text-white ring-[#8484d1]"
                                              : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50",
                                            creating &&
                                              "cursor-not-allowed opacity-70"
                                          )}
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
                          ? `Επιλέξατε: ${toDateLabel(
                              createSelectedSlot.dateStr
                            )} στις ${createSelectedSlot.timeStr}`
                          : "Δεν έχει επιλεγεί ραντεβού."}
                      </p>

                      {createErrors.slot && (
                        <p className="mt-1 text-sm text-rose-600">
                          {createErrors.slot}
                        </p>
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
                      Το ραντεβού θα δημιουργηθεί με το επιλεγμένο διαθέσιμο
                      slot.
                    </p>

                    {!!createSubmitError && (
                      <p className="mt-3 text-sm text-rose-600">
                        {createSubmitError}
                      </p>
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
                    <li>
                      Η επιλογή ώρας γίνεται μέσα από τις διαθέσιμες
                      ημερομηνίες.
                    </li>
                    <li>Το backend availability δεν είναι service-specific.</li>
                  </ul>

                  <div className="mt-5 h-px bg-slate-200" />

                  <p className="mt-4 text-[15px] text-slate-600">
                    Το modal αυτό ακολουθεί το ίδιο flow με τη δημόσια φόρμα
                    booking.
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

function AppointmentCard({
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
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setB(row);
    setEditing(false);
  }, [row]);

  const selectedServiceId = getServiceIdFromAppointment(b);
  const selectedService = services.find((s) => s.id === selectedServiceId);

  function handleServiceChange(serviceId: number) {
    const service = services.find((x) => x.id === serviceId);
    if (!service) return;

    setB((prev) => ({
      ...prev,
      providedServiceId: service.id,
      serviceId: service.id,
      providedService: {
        id: service.id,
        title: service.title,
        category: service.category,
        duration: service.duration,
        description: service.description,
        priceIncludingVAT: service.priceIncludingVAT,
      },
    }));
  }

  function resetChanges() {
    setB(row);
    setEditing(false);
  }

  async function saveChanges() {
    await onSave(b);
    setEditing(false);
  }

  return (
    <div className="p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#8484d1]/10 px-3 py-1 text-xs font-semibold text-[#6868b8]">
              #{b.id}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {formatAppointmentDate(b.appointmentDate)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {formatAppointmentTime(b.appointmentDate)}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {b.customerName || "Χωρίς όνομα"}
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Υπηρεσία: {getAppointmentServiceLabel(b, services)}
          </p>

          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </div>

              <div className="mt-0.5 break-all text-slate-800">
                {b.customerEmail || "—"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Τηλέφωνο
              </div>

              <div className="mt-0.5 text-slate-800">
                {b.customerPhone || "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => setEditing((prev) => !prev)}
            disabled={busy}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#8484d1]"
          >
            {editing ? "Κλείσιμο επεξεργασίας" : "Επεξεργασία"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(b.id)}
            disabled={busy}
            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
          >
            {busy ? "Διαγραφή…" : "Διαγραφή"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ημερομηνία και ώρα
              </label>

              <input
                type="datetime-local"
                value={formatDateTimeLocal(b.appointmentDate)}
                onChange={(e) =>
                  setB((prev) => ({
                    ...prev,
                    appointmentDate: toIsoFromLocal(e.target.value),
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Υπηρεσία
              </label>

              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#8484d1]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getServiceLabel(s)}
                  </option>
                ))}
              </select>

              {selectedService && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedService.duration} λεπτά ·{" "}
                  {selectedService.priceIncludingVAT}€
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ονοματεπώνυμο
              </label>

              <input
                value={b.customerName}
                onChange={(e) =>
                  setB((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>

              <input
                type="email"
                value={b.customerEmail}
                onChange={(e) =>
                  setB((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#8484d1]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Τηλέφωνο
              </label>

              <input
                value={b.customerPhone}
                onChange={(e) =>
                  setB((prev) => ({
                    ...prev,
                    customerPhone: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#8484d1]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={resetChanges}
              disabled={busy}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              Άκυρο
            </button>

            <button
              type="button"
              onClick={saveChanges}
              disabled={busy}
              className={cx(
                "rounded-full px-4 py-2 text-sm font-semibold text-white",
                busy ? "cursor-wait bg-[#8484d1]/70" : "bg-[#8484d1]"
              )}
            >
              {busy ? "Αποθήκευση…" : "Αποθήκευση"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



/* =============== NEWSLETTER =============== */

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function formatNewsletterDate(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildNewsletterCsv(subscribers: NewsletterSubscriberGetDto[]) {
  const header = ["ID", "EMAIL", "FULLNAME", "SUBSCRIBED_AT"];

  const rows = subscribers.map((s) => [
    s.id,
    s.email,
    s.fullName,
    formatNewsletterDate(s.subscribedAt),
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}



function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberGetDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await NewsletterSubscribersApi.list();

        if (!active) return;

        setSubscribers(res);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) return subscribers;

    return subscribers.filter((s) => {
      return [
        s.id,
        s.email,
        s.fullName,
        formatNewsletterDate(s.subscribedAt),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [subscribers, q]);

  const csvContent = useMemo(() => {
    return buildNewsletterCsv(filtered);
  }, [filtered]);

  async function copyList() {
    try {
      await navigator.clipboard.writeText(csvContent);
      setToast("Η λίστα αντιγράφηκε.");
    } catch {
      setToast("Δεν ήταν δυνατή η αντιγραφή.");
    }
  }

  function downloadCsv() {
    downloadTextFile("newsletter-subscribers.csv", csvContent);
    setToast("Το CSV κατέβηκε.");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Σύνολο συνδρομητών</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {subscribers.length}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm text-slate-500">Αποτελέσματα αναζήτησης</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">
            {filtered.length}
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Συνδρομητές Newsletter
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Προβολή, αναζήτηση, αντιγραφή και εξαγωγή λίστας συνδρομητών.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyList}
              disabled={!filtered.length}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Αντιγραφή λίστας
            </button>

            <button
              type="button"
              onClick={downloadCsv}
              disabled={!filtered.length}
              className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Λήψη CSV
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση με όνομα, email ή ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[rgb(var(--primary))] focus:ring-4 focus:ring-[rgba(var(--primary),0.12)]"
          />
        </div>

        {toast && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {toast}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Φόρτωση συνδρομητών...
          </div>
        ) : !filtered.length ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Δεν βρέθηκαν συνδρομητές.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Ονοματεπώνυμο
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">
                      Ημερομηνία εγγραφής
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 bg-white">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        #{s.id}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {s.fullName || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {s.email}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatNewsletterDate(s.subscribedAt) || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          Η αντιγραφή και το CSV χρησιμοποιούν τα πεδία: ID, EMAIL, FULLNAME,
          SUBSCRIBED_AT.
        </div>
      </Card>
    </div>
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

                  <div className="text-sm text-slate-600">
                    {m.senderEmail}
                  </div>

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

/* =============== ΧΡΗΣΙΜΕΣ ΠΛΗΡΟΦΟΡΙΕΣ =============== */

function UsefulInfoManager() {
  const [item, setItem] = useState<UsefulInfoGetDto | null>(null);
  const [title, setTitle] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadUsefulInfo() {
    try {
      setLoading(true);
      setError(null);

      const data = await UsefulInfoApi.getSingle();

      setItem(data);

      if (data) {
        setTitle(data.title || "");
        setInfo(data.info || "");
      } else {
        setTitle("");
        setInfo("");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η φόρτωση των χρήσιμων πληροφοριών."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsefulInfo();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      const saved = await UsefulInfoApi.update(item?.id ?? 1, {
        title,
        info,
      });

      setItem(saved);
      setTitle(saved.title || "");
      setInfo(saved.info || "");
      setToast("Αποθηκεύτηκε.");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η αποθήκευση."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card className="p-4 md:p-5">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            Χρήσιμες Πληροφορίες
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Εδώ αλλάζετε το κείμενο που εμφανίζεται στη σελίδα κλεισίματος
            ραντεβού. Υπάρχει μόνο μία εγγραφή και απλώς ενημερώνεται.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Φόρτωση χρήσιμων πληροφοριών…
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Τίτλος
              </label>

              <RichTextEditor
                value={title}
                onChange={setTitle}
                placeholder="π.χ. Χρήσιμες Πληροφορίες"
                minHeight={120}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Πληροφορίες
              </label>

              <RichTextEditor
                value={info}
                onChange={setInfo}
                placeholder="Γράψτε εδώ τις πληροφορίες που θα βλέπει ο χρήστης στη φόρμα ραντεβού."
                minHeight={260}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cx(
                  "rounded-full px-5 py-2 text-sm font-semibold text-white transition",
                  saving
                    ? "cursor-wait bg-[rgba(var(--primary),0.65)]"
                    : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]"
                )}
              >
                {saving ? "Αποθήκευση…" : "Αποθήκευση"}
              </button>
            </div>
          </div>
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