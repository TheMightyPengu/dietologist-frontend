import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  OfficeHoursApi,
  type OfficeHoursPostDto,
  type WeeklyOfficeHours,
} from "@/api/OfficeHoursController";
import { type ApiFieldErrors } from "@/api/_axios-client";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import {
  addValidationError,
  errorInputClass,
  isRichTextBlank,
  isValidEmail,
  isValidPhone,
} from "@/lib/form-validation";
import PageHeaderEditor from "@/components/admin/PageHeaderEditor";

const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl bg-white backdrop-blur-sm shadow-sm border border-[rgba(var(--border),0.8)]",
      className,
    )}
  >
    {children}
  </div>
);

type Tab =
  | "bookings"
  | "messages"
  | "newsletter"
  | "usefulInfo"
  | "officeHours";

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
  services: ProvidedServicesGetDto[],
) {
  const serviceId = getServiceIdFromAppointment(b);

  const service = b.providedService || services.find((s) => s.id === serviceId);

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
    d.getDate(),
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
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
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

function validateAppointment(value: {
  providedServiceId: number | string;
  appointmentDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message?: string | null;
}): ApiFieldErrors {
  const errors: ApiFieldErrors = {};

  if (Number(value.providedServiceId) <= 0) {
    addValidationError(errors, "providedServiceId", "Επιλέξτε υπηρεσία.");
  }

  if (!value.customerName.trim()) {
    addValidationError(
      errors,
      "customerName",
      "Το ονοματεπώνυμο είναι υποχρεωτικό.",
    );
  }

  if (!value.customerEmail.trim()) {
    addValidationError(errors, "customerEmail", "Το email είναι υποχρεωτικό.");
  } else if (!isValidEmail(value.customerEmail)) {
    addValidationError(errors, "customerEmail", "Το email δεν είναι έγκυρο.");
  }

  if (value.customerPhone.trim() && !isValidPhone(value.customerPhone)) {
    addValidationError(
      errors,
      "customerPhone",
      "Το τηλέφωνο πρέπει να περιέχει 10 έως 15 ψηφία.",
    );
  }

  if (
    !value.appointmentDate ||
    Number.isNaN(new Date(value.appointmentDate).getTime())
  ) {
    addValidationError(
      errors,
      "appointmentDate",
      "Επιλέξτε έγκυρη ημερομηνία και ώρα.",
    );
  } else if (new Date(value.appointmentDate).getTime() <= Date.now()) {
    addValidationError(
      errors,
      "appointmentDate",
      "Το ραντεβού πρέπει να είναι στο μέλλον.",
    );
  }

  if ((value.message?.trim().length ?? 0) > 2000) {
    addValidationError(
      errors,
      "message",
      "Το μήνυμα δεν μπορεί να ξεπερνά τους 2000 χαρακτήρες.",
    );
  }

  return errors;
}

/* ================= Page ================= */

export default function ManagementContactPage() {
  const [active, setActive] = useState<Tab>("bookings");
  const publicPageHref =
    active === "bookings"
      ? "/contact/book"
      : active === "messages"
        ? "/contact/form"
        : active === "usefulInfo"
          ? "/contact"
          : active === "officeHours"
            ? "/contact/book"
            : "/contact";

  return (
    <>
      <Head>
        <title>Διαχείριση | ΕΠΙΚΟΙΝΩΝΙΑ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[rgb(var(--primary))]"
              >
                ← Πίσω στο Dashboard
              </Link>

              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                ΕΠΙΚΟΙΝΩΝΙΑ
              </h1>
            </div>

            <Link
              href={publicPageHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm hover:border-[rgb(var(--primary))]"
            >
              Προβολή σελίδας
            </Link>
          </div>

          <Card className="mb-6 p-4 md:p-5">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "bookings", label: "Ραντεβού" },
                { key: "messages", label: "Μηνύματα" },
                { key: "newsletter", label: "Newsletter" },
                { key: "usefulInfo", label: "Χρήσιμες Πληροφορίες" },
                { key: "officeHours", label: "Ώρες Λειτουργίας" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key as Tab)}
                  className={cx(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    active === t.key
                      ? "bg-[rgb(var(--primary))] text-white"
                      : "border border-[rgba(var(--border),0.9)] bg-white hover:border-[rgb(var(--primary))]",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          {active === "bookings" && (
            <PageHeaderEditor
              key="contact-book"
              pageKey="contact-book"
              fallbackTitle="Κλείστε Ραντεβού"
              fallbackDescription="Επιλέξτε υπηρεσία και θα εμφανιστούν μόνο οι διαθέσιμες ημέρες και ώρες. Συμπληρώστε τη φόρμα και θα σας στείλουμε email για επιβεβαίωση."
            />
          )}

          {active === "messages" && (
            <PageHeaderEditor
              key="contact-form"
              pageKey="contact-form"
              fallbackTitle="Φόρμα Επικοινωνίας"
              fallbackDescription="Πείτε μας πώς μπορούμε να βοηθήσουμε. Απαντάμε συνήθως εντός 1–2 εργάσιμων."
            />
          )}

          {active === "bookings" && <BookingsManager />}
          {active === "messages" && <MessagesManager />}
          {active === "newsletter" && <NewsletterManager />}
          {active === "usefulInfo" && <UsefulInfoManager />}
          {active === "officeHours" && <OfficeHoursManager />}
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
  const [date, setDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
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

  const pageErrors = useFormErrors();
  const createValidation = useFormErrors();

  useEffect(() => {
    let mounted = true;

    void (async () => {
      try {
        setLoading(true);

        const [appointmentsRes, servicesRes] = await Promise.all([
          AppointmentsApi.list(),
          ProvidedServicesApi.list(),
        ]);

        if (!mounted) {
          return;
        }

        setAll(appointmentsRes);
        setServices(servicesRes);
      } catch (error: unknown) {
        console.error(error);

        if (mounted) {
          pageErrors.applyApiError(
            error,
            "Δεν ήταν δυνατή η φόρτωση των ραντεβού.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pageErrors.applyApiError]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 1600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      setCreateSlots([]);
      setCreateSelectedDate("");
      setCreateSelectedSlotId("");

      createValidation.clearFieldError("appointmentDate");
      createValidation.clearFieldError("providedServiceId");
      createValidation.closeGeneralError();

      if (!createOpen || !createForm.providedServiceId) {
        return;
      }

      setCreateSlotsLoading(true);

      try {
        const dates = await AppointmentsApi.getAvailableDates({
          fromDate: todayDateOnly(),
          daysAhead: 30,
        });

        if (!mounted) {
          return;
        }

        if (!dates.length) {
          setCreateSlots([]);
          setCreateSelectedDate("");
          return;
        }

        setCreateSelectedDate(dates[0]);

        const allSlots: Slot[] = [];

        for (const dateStr of dates) {
          const times = await AppointmentsApi.getAvailableSlots(dateStr);

          if (!mounted) {
            return;
          }

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
          const first = combineToDate(a.dateStr, a.timeStr).getTime();
          const second = combineToDate(b.dateStr, b.timeStr).getTime();

          return first - second;
        });

        setCreateSlots(allSlots);
      } catch (error: unknown) {
        if (!mounted) {
          return;
        }

        console.error(error);
        setCreateSlots([]);
        setCreateSelectedDate("");

        createValidation.applyApiError(
          error,
          "Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.",
        );
      } finally {
        if (mounted) {
          setCreateSlotsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    createOpen,
    createForm.providedServiceId,
    createValidation.applyApiError,
    createValidation.clearFieldError,
    createValidation.closeGeneralError,
  ]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return all.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      const dateOnly = Number.isNaN(appointmentDate.getTime())
        ? ""
        : appointmentDate.toISOString().slice(0, 10);

      const matchesQuery =
        !search ||
        [
          appointment.customerName,
          appointment.customerEmail,
          appointment.customerPhone,
          appointment.message,
          appointment.providedService?.title,
          appointment.providedService?.category,
          appointment.providedService?.description,
        ]
          .filter((value): value is string => typeof value === "string")
          .map((value) => stripHtml(value).toLowerCase())
          .some((value) => value.includes(search));

      const matchesDate = !date || dateOnly === date;

      return matchesQuery && matchesDate;
    });
  }, [all, date, q]);

  const sortedFiltered = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const first = new Date(a.appointmentDate).getTime();
      const second = new Date(b.appointmentDate).getTime();

      if (Number.isNaN(first) && Number.isNaN(second)) {
        return 0;
      }

      if (Number.isNaN(first)) {
        return 1;
      }

      if (Number.isNaN(second)) {
        return -1;
      }

      return second - first;
    });
  }, [filtered]);

  const createAvailableDates = useMemo(() => {
    const uniqueDates = new Set<string>();

    for (const slot of createSlots) {
      uniqueDates.add(slot.dateStr);
    }

    return Array.from(uniqueDates);
  }, [createSlots]);

  const createSlotsForSelectedDate = useMemo(() => {
    return createSlots.filter((slot) => slot.dateStr === createSelectedDate);
  }, [createSelectedDate, createSlots]);

  const createSelectedSlot = useMemo(() => {
    return createSlots.find((slot) => slot.id === createSelectedSlotId) ?? null;
  }, [createSelectedSlotId, createSlots]);

  function openCreateModal() {
    if (!services.length) {
      pageErrors.showGeneralError("Δεν υπάρχουν διαθέσιμες υπηρεσίες.");

      return;
    }

    createValidation.clearAllErrors();
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
    if (creating) {
      return;
    }

    setCreateOpen(false);
    createValidation.clearAllErrors();
  }

  async function handleCreateSubmit() {
    const appointmentDate = createSelectedSlot
      ? combineToDate(
          createSelectedSlot.dateStr,
          createSelectedSlot.timeStr,
        ).toISOString()
      : "";

    const validationErrors = validateAppointment({
      providedServiceId: createForm.providedServiceId,
      appointmentDate,
      customerName: createForm.customerName,
      customerEmail: createForm.customerEmail,
      customerPhone: createForm.customerPhone,
      message: createForm.message,
    });

    if (!createValidation.applyFrontendErrors(validationErrors)) {
      return;
    }

    try {
      setCreating(true);

      const payload: AppointmentsPostDto = {
        providedServiceId: Number(createForm.providedServiceId),
        appointmentDate,
        customerName: createForm.customerName.trim(),
        customerEmail: createForm.customerEmail.trim(),
        customerPhone: createForm.customerPhone.trim(),
        message: createForm.message.trim() || null,
      };

      const created = await AppointmentsApi.create(payload);

      setAll((previous) => [created, ...previous]);
      setCreateOpen(false);
      createValidation.clearAllErrors();
      setToast("Δημιουργήθηκε.");
    } catch (error: unknown) {
      console.error(error);

      createValidation.applyApiError(
        error,
        "Δεν ήταν δυνατή η δημιουργία του ραντεβού.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(appointment: AppointmentsGetDto) {
    try {
      setBusyId(appointment.id);

      const payload: AppointmentsPostDto = {
        providedServiceId: getServiceIdFromAppointment(appointment),
        appointmentDate: appointment.appointmentDate,
        customerName: appointment.customerName.trim(),
        customerEmail: appointment.customerEmail.trim(),
        customerPhone: appointment.customerPhone.trim(),
        message: appointment.message?.trim() || null,
      };

      await AppointmentsApi.update(appointment.id, payload);

      const fresh = await AppointmentsApi.get(appointment.id);

      setAll((previous) =>
        previous.map((item) => (item.id === fresh.id ? fresh : item)),
      );

      setToast("Αποθηκεύτηκε.");
    } catch (error: unknown) {
      console.error(error);
      throw error;
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή ραντεβού;")) {
      return;
    }

    try {
      setBusyId(id);

      await AppointmentsApi.remove(id);

      setAll((previous) =>
        previous.filter((appointment) => appointment.id !== id),
      );

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      pageErrors.applyApiError(
        error,
        "Δεν ήταν δυνατή η διαγραφή του ραντεβού.",
      );
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
            onChange={(event) => setQ(event.target.value)}
            placeholder="Αναζήτηση όνομα, email, τηλέφωνο, υπηρεσία…"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
          />

          <button
            type="button"
            onClick={openCreateModal}
            disabled={loading || creating}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              loading || creating
                ? "cursor-wait bg-[rgba(var(--primary),0.7)] text-white"
                : "bg-[rgb(var(--primary))] text-white hover:shadow",
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
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600 hover:border-[rgb(var(--primary))]"
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
            {sortedFiltered.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                row={appointment}
                busy={busyId === appointment.id}
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
                type="button"
                onClick={closeCreateModal}
                disabled={creating}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-[rgb(var(--primary))]"
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
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            providedServiceId: event.target.value,
                          }));

                          createValidation.clearFieldError("providedServiceId");

                          createValidation.clearFieldError("appointmentDate");
                        }}
                        disabled={creating}
                        className={errorInputClass(
                          Boolean(
                            createValidation.fieldErrors.providedServiceId,
                          ),
                          "mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                      >
                        <option value="" disabled>
                          — Επιλέξτε υπηρεσία —
                        </option>

                        {services.map((service) => (
                          <option key={service.id} value={String(service.id)}>
                            {getServiceLabel(service)}
                          </option>
                        ))}
                      </select>

                      <FormFieldError
                        errors={createValidation.fieldErrors.providedServiceId}
                      />
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Ονοματεπώνυμο <span className="text-rose-600">*</span>
                      </label>

                      <input
                        value={createForm.customerName}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            customerName: event.target.value,
                          }));

                          createValidation.clearFieldError("customerName");
                        }}
                        className={errorInputClass(
                          Boolean(createValidation.fieldErrors.customerName),
                          "mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[rgb(var(--primary))]",
                        )}
                        placeholder="π.χ. Μαρία Παπαδοπούλου"
                        disabled={creating}
                      />

                      <FormFieldError
                        errors={createValidation.fieldErrors.customerName}
                      />
                    </div>

                    <div>
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Email <span className="text-rose-600">*</span>
                      </label>

                      <input
                        type="email"
                        value={createForm.customerEmail}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            customerEmail: event.target.value,
                          }));

                          createValidation.clearFieldError("customerEmail");
                        }}
                        className={errorInputClass(
                          Boolean(createValidation.fieldErrors.customerEmail),
                          "mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[rgb(var(--primary))]",
                        )}
                        placeholder="π.χ. name@email.com"
                        disabled={creating}
                      />

                      <FormFieldError
                        errors={createValidation.fieldErrors.customerEmail}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Τηλέφωνο
                      </label>

                      <input
                        value={createForm.customerPhone}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            customerPhone: event.target.value,
                          }));

                          createValidation.clearFieldError("customerPhone");
                        }}
                        className={errorInputClass(
                          Boolean(createValidation.fieldErrors.customerPhone),
                          "mt-1 h-12 w-full rounded-xl border border-black bg-white px-3 text-[15px] text-slate-900 outline-none focus:border-[rgb(var(--primary))]",
                        )}
                        placeholder="π.χ. 69XXXXXXXX προαιρετικό"
                        disabled={creating}
                      />

                      <FormFieldError
                        errors={createValidation.fieldErrors.customerPhone}
                      />
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
                          "mt-1 rounded-xl bg-white p-3 ring-1",
                          createValidation.fieldErrors.appointmentDate
                            ? "ring-rose-500"
                            : "ring-slate-300",
                          !createForm.providedServiceId && "opacity-70",
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
                              {Array.from({ length: 6 }).map((_, index) => (
                                <div
                                  key={index}
                                  className="h-11 w-28 animate-pulse rounded-lg bg-white ring-1 ring-slate-200"
                                />
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <div
                                  key={index}
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
                              {createAvailableDates.map((availableDate) => {
                                const active =
                                  availableDate === createSelectedDate;

                                return (
                                  <button
                                    key={availableDate}
                                    type="button"
                                    disabled={creating}
                                    onClick={() => {
                                      setCreateSelectedDate(availableDate);

                                      setCreateSelectedSlotId("");

                                      createValidation.clearFieldError(
                                        "appointmentDate",
                                      );
                                    }}
                                    className={cx(
                                      "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                      active
                                        ? "bg-[rgb(var(--primary))] text-white ring-[rgb(var(--primary))]"
                                        : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50",
                                      creating &&
                                        "cursor-not-allowed opacity-70",
                                    )}
                                    title={toDateLabel(availableDate)}
                                  >
                                    {new Date(
                                      `${availableDate}T00:00:00`,
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
                                    {createSlotsForSelectedDate.map((slot) => {
                                      const active =
                                        slot.id === createSelectedSlotId;

                                      return (
                                        <button
                                          key={slot.id}
                                          type="button"
                                          disabled={creating}
                                          onClick={() => {
                                            setCreateSelectedSlotId(slot.id);

                                            createValidation.clearFieldError(
                                              "appointmentDate",
                                            );
                                          }}
                                          className={cx(
                                            "h-11 rounded-lg px-3 text-[15px] ring-1 transition",
                                            active
                                              ? "bg-[rgb(var(--primary))] text-white ring-[rgb(var(--primary))]"
                                              : "bg-white text-slate-800 ring-slate-300 hover:bg-slate-50",
                                            creating &&
                                              "cursor-not-allowed opacity-70",
                                          )}
                                        >
                                          {slot.timeStr}
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
                              createSelectedSlot.dateStr,
                            )} στις ${createSelectedSlot.timeStr}`
                          : "Δεν έχει επιλεγεί ραντεβού."}
                      </p>

                      <FormFieldError
                        errors={createValidation.fieldErrors.appointmentDate}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[15px] font-semibold text-slate-900">
                        Σύντομο μήνυμα προαιρετικό
                      </label>

                      <textarea
                        rows={4}
                        value={createForm.message}
                        onChange={(event) => {
                          setCreateForm((previous) => ({
                            ...previous,
                            message: event.target.value,
                          }));

                          createValidation.clearFieldError("message");
                        }}
                        disabled={creating}
                        className={errorInputClass(
                          Boolean(createValidation.fieldErrors.message),
                          "mt-1 w-full rounded-xl border border-black bg-white px-3 py-2 text-[15px] text-slate-900 outline-none focus:border-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                        placeholder="Τυχόν απορίες ή προτιμήσεις."
                      />

                      <FormFieldError
                        errors={createValidation.fieldErrors.message}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeCreateModal}
                        disabled={creating}
                        className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                      >
                        Άκυρο
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateSubmit}
                        disabled={
                          creating ||
                          createSlotsLoading ||
                          !createForm.providedServiceId
                        }
                        className="rounded-full bg-[rgb(var(--primary))] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {creating ? "Δημιουργία…" : "Δημιουργία"}
                      </button>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      Το ραντεβού θα δημιουργηθεί με το επιλεγμένο διαθέσιμο
                      slot.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="md:col-span-2">
                <div className="rounded-2xl bg-white p-6 shadow-[0_16px_34px_rgba(164,199,126,0.14)] ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">
                    Χρήσιμες Πληροφορίες
                  </h3>

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] text-slate-700">
                    <li>
                      Εμφανίζονται μόνο τα διαθέσιμα slots από το backend.
                    </li>
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

      <GeneralErrorDialog
        open={Boolean(pageErrors.generalError)}
        title={pageErrors.generalError?.title}
        message={pageErrors.generalError?.message ?? ""}
        onClose={pageErrors.closeGeneralError}
      />

      <GeneralErrorDialog
        open={Boolean(createValidation.generalError)}
        title={createValidation.generalError?.title}
        message={createValidation.generalError?.message ?? ""}
        onClose={createValidation.closeGeneralError}
        onRetry={handleCreateSubmit}
      />
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
  onSave: (appointment: AppointmentsGetDto) => void | Promise<void>;
  onDelete: (id: number) => void;
}) {
  const [appointment, setAppointment] = useState<AppointmentsGetDto>(row);

  const [editing, setEditing] = useState(false);
  const formErrors = useFormErrors();

  useEffect(() => {
    setAppointment(row);
    setEditing(false);
    formErrors.clearAllErrors();
  }, [formErrors.clearAllErrors, row]);

  const selectedServiceId = getServiceIdFromAppointment(appointment);

  const selectedService = services.find(
    (service) => service.id === selectedServiceId,
  );

  function handleServiceChange(serviceId: number) {
    const service = services.find((item) => item.id === serviceId);

    if (!service) {
      return;
    }

    formErrors.clearFieldError("providedServiceId");

    setAppointment((previous) => ({
      ...previous,
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
    formErrors.clearAllErrors();
    setAppointment(row);
    setEditing(false);
  }

  async function saveChanges() {
    const validationErrors = validateAppointment({
      providedServiceId: getServiceIdFromAppointment(appointment),
      appointmentDate: appointment.appointmentDate,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      message: appointment.message,
    });

    if (!formErrors.applyFrontendErrors(validationErrors)) {
      return;
    }

    try {
      await onSave(appointment);
      setEditing(false);
    } catch (error: unknown) {
      formErrors.applyApiError(
        error,
        "Δεν ήταν δυνατή η αποθήκευση του ραντεβού.",
      );
    }
  }

  return (
    <div className="p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[rgba(var(--primary),0.1)] px-3 py-1 text-xs font-semibold text-[rgba(var(--primary),0.72)]">
              #{appointment.id}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {formatAppointmentDate(appointment.appointmentDate)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {formatAppointmentTime(appointment.appointmentDate)}
            </span>
          </div>

          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {appointment.customerName || "Χωρίς όνομα"}
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-700">
            Υπηρεσία: {getAppointmentServiceLabel(appointment, services)}
          </p>

          <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </div>

              <div className="mt-0.5 break-all text-slate-800">
                {appointment.customerEmail || "—"}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Τηλέφωνο
              </div>

              <div className="mt-0.5 text-slate-800">
                {appointment.customerPhone || "—"}
              </div>
            </div>
          </div>

          {appointment.message?.trim() && (
            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Μήνυμα
              </div>

              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {appointment.message}
              </p>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => setEditing((previous) => !previous)}
            disabled={busy}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[rgb(var(--primary))]"
          >
            {editing ? "Κλείσιμο επεξεργασίας" : "Επεξεργασία"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(appointment.id)}
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
                Ημερομηνία και ώρα{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="datetime-local"
                value={formatDateTimeLocal(appointment.appointmentDate)}
                onChange={(event) => {
                  setAppointment((previous) => ({
                    ...previous,
                    appointmentDate: toIsoFromLocal(event.target.value),
                  }));

                  formErrors.clearFieldError("appointmentDate");
                }}
                className={errorInputClass(
                  Boolean(formErrors.fieldErrors.appointmentDate),
                  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={formErrors.fieldErrors.appointmentDate} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Υπηρεσία{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <select
                value={selectedServiceId}
                onChange={(event) =>
                  handleServiceChange(Number(event.target.value))
                }
                className={errorInputClass(
                  Boolean(formErrors.fieldErrors.providedServiceId),
                  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))]",
                )}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {getServiceLabel(service)}
                  </option>
                ))}
              </select>

              {selectedService && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedService.duration} λεπτά ·{" "}
                  {selectedService.priceIncludingVAT}€
                </p>
              )}

              <FormFieldError
                errors={formErrors.fieldErrors.providedServiceId}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Ονοματεπώνυμο{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                value={appointment.customerName}
                onChange={(event) => {
                  setAppointment((previous) => ({
                    ...previous,
                    customerName: event.target.value,
                  }));

                  formErrors.clearFieldError("customerName");
                }}
                className={errorInputClass(
                  Boolean(formErrors.fieldErrors.customerName),
                  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={formErrors.fieldErrors.customerName} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <input
                type="email"
                value={appointment.customerEmail}
                onChange={(event) => {
                  setAppointment((previous) => ({
                    ...previous,
                    customerEmail: event.target.value,
                  }));

                  formErrors.clearFieldError("customerEmail");
                }}
                className={errorInputClass(
                  Boolean(formErrors.fieldErrors.customerEmail),
                  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={formErrors.fieldErrors.customerEmail} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Τηλέφωνο
              </label>

              <input
                value={appointment.customerPhone}
                onChange={(event) => {
                  setAppointment((previous) => ({
                    ...previous,
                    customerPhone: event.target.value,
                  }));

                  formErrors.clearFieldError("customerPhone");
                }}
                className={errorInputClass(
                  Boolean(formErrors.fieldErrors.customerPhone),
                  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))]",
                )}
              />

              <FormFieldError errors={formErrors.fieldErrors.customerPhone} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Μήνυμα
              </label>

              <textarea
                rows={4}
                value={appointment.message ?? ""}
                onChange={(event) => {
                  setAppointment((previous) => ({
                    ...previous,
                    message: event.target.value,
                  }));

                  formErrors.clearFieldError("message");
                }}
                className={errorInputClass(
                  Boolean(formErrors.fieldErrors.message),
                  "w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[rgb(var(--primary))]",
                )}
                placeholder="Προαιρετικό μήνυμα ή σημείωση"
              />

              <FormFieldError errors={formErrors.fieldErrors.message} />
            </div>
          </div>

          <FormFieldError errors={formErrors.fieldErrors.form} />

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
                busy
                  ? "cursor-wait bg-[rgba(var(--primary),0.7)]"
                  : "bg-[rgb(var(--primary))]",
              )}
            >
              {busy ? "Αποθήκευση…" : "Αποθήκευση"}
            </button>
          </div>
        </div>
      )}

      <GeneralErrorDialog
        open={Boolean(formErrors.generalError)}
        title={formErrors.generalError?.title}
        message={formErrors.generalError?.message ?? ""}
        onClose={formErrors.closeGeneralError}
        onRetry={saveChanges}
      />
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
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

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

  const rows = subscribers.map((subscriber) => [
    subscriber.id,
    subscriber.email,
    subscriber.fullName,
    formatNewsletterDate(subscriber.subscribedAt),
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberGetDto[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const errors = useFormErrors();

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoading(true);

        const result = await NewsletterSubscribersApi.list();

        if (active) {
          setSubscribers(result);
        }
      } catch (error: unknown) {
        console.error(error);

        if (active) {
          errors.applyApiError(
            error,
            "Δεν ήταν δυνατή η φόρτωση των συνδρομητών.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [errors.applyApiError]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) {
      return subscribers;
    }

    return subscribers.filter((subscriber) =>
      [
        subscriber.id,
        subscriber.email,
        subscriber.fullName,
        formatNewsletterDate(subscriber.subscribedAt),
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [q, subscribers]);

  const csvContent = useMemo(() => buildNewsletterCsv(filtered), [filtered]);

  const emailList = useMemo(() => {
    const uniqueEmails = Array.from(
      new Set(
        filtered
          .map((subscriber) => subscriber.email.trim())
          .filter(Boolean),
      ),
    );

    return uniqueEmails.join("; ");
  }, [filtered]);

  async function copyList() {
    try {
      await navigator.clipboard.writeText(emailList);

      setToast(
        `${filtered.length} email αντιγράφηκαν. Επικολλήστε τα στο πεδίο BCC.`,
      );
    } catch (error: unknown) {
      console.error(error);

      errors.applyApiError(
        error,
        "Δεν ήταν δυνατή η αντιγραφή των email.",
      );
    }
  }

  function downloadCsv() {
    try {
      downloadTextFile("newsletter-subscribers.csv", csvContent);

      setToast("Το CSV κατέβηκε.");
    } catch (error: unknown) {
      console.error(error);

      errors.applyApiError(error, "Δεν ήταν δυνατή η δημιουργία του CSV.");
    }
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
              disabled={!emailList}
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
            onChange={(event) => setQ(event.target.value)}
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
                  {filtered.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        #{subscriber.id}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {subscriber.fullName || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {subscriber.email}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatNewsletterDate(subscriber.subscribedAt) || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          Η αντιγραφή αντιγράφει μόνο τα email, έτοιμα για επικόλληση στο πεδίο
          BCC. Το CSV περιλαμβάνει τα πεδία: ID, EMAIL, FULLNAME, SUBSCRIBED_AT.
        </div>
      </Card>

      <GeneralErrorDialog
        open={Boolean(errors.generalError)}
        title={errors.generalError?.title}
        message={errors.generalError?.message ?? ""}
        onClose={errors.closeGeneralError}
      />
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

  const errors = useFormErrors();

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        setLoading(true);

        const result = await ContactMessagesApi.list();

        if (active) {
          setMessages(result);
        }
      } catch (error: unknown) {
        console.error(error);

        if (active) {
          errors.applyApiError(
            error,
            "Δεν ήταν δυνατή η φόρτωση των μηνυμάτων.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [errors.applyApiError]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 1600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    if (!search) {
      return messages;
    }

    return messages.filter((message) =>
      [message.senderName, message.senderEmail, message.message]
        .filter((value): value is string => typeof value === "string")
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [messages, q]);

  async function handleDelete(id: number) {
    if (!confirm("Διαγραφή μηνύματος;")) {
      return;
    }

    try {
      setBusyId(id);

      await ContactMessagesApi.remove(id);

      setMessages((previous) =>
        previous.filter((message) => message.id !== id),
      );

      setToast("Διαγράφηκε.");
    } catch (error: unknown) {
      console.error(error);

      errors.applyApiError(error, "Δεν ήταν δυνατή η διαγραφή του μηνύματος.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <Card className="mb-6 p-4 md:p-5">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Αναζήτηση όνομα, email, μήνυμα…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[rgb(var(--primary))]"
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
          filtered.map((message) => (
            <div key={message.id} className="p-4 md:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {message.senderName}
                  </div>

                  <div className="text-sm text-slate-600">
                    {message.senderEmail}
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {new Date(message.sentAt).toLocaleString("el-GR")}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(message.id)}
                  disabled={busyId === message.id}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700"
                >
                  {busyId === message.id ? "Διαγραφή…" : "Διαγραφή"}
                </button>
              </div>

              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {message.message}
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

      <GeneralErrorDialog
        open={Boolean(errors.generalError)}
        title={errors.generalError?.title}
        message={errors.generalError?.message ?? ""}
        onClose={errors.closeGeneralError}
      />
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

  const formErrors = useFormErrors();

  const loadUsefulInfo = useCallback(async () => {
    try {
      setLoading(true);
      formErrors.clearAllErrors();

      const data = await UsefulInfoApi.getSingle();

      setItem(data);
      setTitle(data?.title ?? "");
      setInfo(data?.info ?? "");
    } catch (error: unknown) {
      console.error(error);

      formErrors.applyApiError(
        error,
        "Δεν ήταν δυνατή η φόρτωση των χρήσιμων πληροφοριών.",
      );
    } finally {
      setLoading(false);
    }
  }, [formErrors.applyApiError, formErrors.clearAllErrors]);

  useEffect(() => {
    void loadUsefulInfo();
  }, [loadUsefulInfo]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 1600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  async function handleSave() {
    const validationErrors: ApiFieldErrors = {};

    if (isRichTextBlank(title)) {
      addValidationError(
        validationErrors,
        "title",
        "Ο τίτλος είναι υποχρεωτικός.",
      );
    }

    if (isRichTextBlank(info)) {
      addValidationError(
        validationErrors,
        "info",
        "Οι πληροφορίες είναι υποχρεωτικές.",
      );
    }

    if (!formErrors.applyFrontendErrors(validationErrors)) {
      return;
    }

    try {
      setSaving(true);

      const saved = await UsefulInfoApi.update(item?.id ?? 1, {
        title: title.trim(),
        info: info.trim(),
      });

      setItem(saved);
      setTitle(saved.title || "");
      setInfo(saved.info || "");
      formErrors.clearAllErrors();
      setToast("Αποθηκεύτηκε.");
    } catch (error: unknown) {
      console.error(error);

      formErrors.applyApiError(
        error,
        "Δεν ήταν δυνατή η αποθήκευση των χρήσιμων πληροφοριών.",
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
                Τίτλος{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <div
                className={
                  formErrors.fieldErrors.title
                    ? "rounded-xl ring-2 ring-rose-400"
                    : ""
                }
              >
                <RichTextEditor
                  value={title}
                  onChange={(value) => {
                    setTitle(value);
                    formErrors.clearFieldError("title");
                  }}
                  placeholder="π.χ. Χρήσιμες Πληροφορίες"
                  minHeight={120}
                />
              </div>

              <FormFieldError errors={formErrors.fieldErrors.title} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Πληροφορίες{" "}
                <span className="text-rose-600" aria-hidden="true">
                  *
                </span>
              </label>

              <div
                className={
                  formErrors.fieldErrors.info
                    ? "rounded-xl ring-2 ring-rose-400"
                    : ""
                }
              >
                <RichTextEditor
                  value={info}
                  onChange={(value) => {
                    setInfo(value);
                    formErrors.clearFieldError("info");
                  }}
                  placeholder="Γράψτε εδώ τις πληροφορίες που θα βλέπει ο χρήστης στη φόρμα ραντεβού."
                  minHeight={260}
                />
              </div>

              <FormFieldError errors={formErrors.fieldErrors.info} />
            </div>

            <FormFieldError errors={formErrors.fieldErrors.form} />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cx(
                  "rounded-full px-5 py-2 text-sm font-semibold text-white transition",
                  saving
                    ? "cursor-wait bg-[rgba(var(--primary),0.65)]"
                    : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]",
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

      <GeneralErrorDialog
        open={Boolean(formErrors.generalError)}
        title={formErrors.generalError?.title}
        message={formErrors.generalError?.message ?? ""}
        onClose={formErrors.closeGeneralError}
        onRetry={handleSave}
      />
    </>
  );
}

/* =============== ΩΡΕΣ ΓΡΑΦΕΙΟΥ =============== */
type OfficeHoursFormRow = {
  dayOfWeek: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const officeDays: Array<{
  dayOfWeek: number;
  key: keyof WeeklyOfficeHours;
  label: string;
}> = [
  {
    dayOfWeek: 0,
    key: "monday",
    label: "Δευτέρα",
  },
  {
    dayOfWeek: 1,
    key: "tuesday",
    label: "Τρίτη",
  },
  {
    dayOfWeek: 2,
    key: "wednesday",
    label: "Τετάρτη",
  },
  {
    dayOfWeek: 3,
    key: "thursday",
    label: "Πέμπτη",
  },
  {
    dayOfWeek: 4,
    key: "friday",
    label: "Παρασκευή",
  },
  {
    dayOfWeek: 5,
    key: "saturday",
    label: "Σάββατο",
  },
  {
    dayOfWeek: 6,
    key: "sunday",
    label: "Κυριακή",
  },
];

function normalizeTime(value?: string | null) {
  if (!value) {
    return "09:00";
  }

  return value.slice(0, 5);
}

function weeklyResponseToRows(weekly: WeeklyOfficeHours): OfficeHoursFormRow[] {
  return officeDays.map((day) => {
    const existing = weekly[day.key]?.[0];

    return {
      dayOfWeek: day.dayOfWeek,
      label: day.label,
      startTime: existing?.startTime
        ? normalizeTime(existing.startTime)
        : "09:00",
      endTime: existing?.endTime ? normalizeTime(existing.endTime) : "17:00",
      isActive: existing?.isActive ?? false,
    };
  });
}

function OfficeHoursManager() {
  const [rows, setRows] = useState<OfficeHoursFormRow[]>([]);

  const [originalRows, setOriginalRows] = useState<OfficeHoursFormRow[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const formErrors = useFormErrors();

  const loadOfficeHours = useCallback(async () => {
    try {
      setLoading(true);
      formErrors.clearAllErrors();

      const weekly = await OfficeHoursApi.getWeekly();

      const mappedRows = weeklyResponseToRows(weekly);

      setRows(mappedRows);
      setOriginalRows(mappedRows.map((row) => ({ ...row })));
    } catch (error: unknown) {
      console.error(error);

      formErrors.applyApiError(
        error,
        "Δεν ήταν δυνατή η φόρτωση των ωρών γραφείου.",
      );
    } finally {
      setLoading(false);
    }
  }, [formErrors.applyApiError, formErrors.clearAllErrors]);

  useEffect(() => {
    void loadOfficeHours();
  }, [loadOfficeHours]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast]);

  function updateRow(dayOfWeek: number, updates: Partial<OfficeHoursFormRow>) {
    setRows((previous) =>
      previous.map((row) =>
        row.dayOfWeek === dayOfWeek
          ? {
              ...row,
              ...updates,
            }
          : row,
      ),
    );

    formErrors.clearFieldError(`startTime_${dayOfWeek}`);

    formErrors.clearFieldError(`endTime_${dayOfWeek}`);

    formErrors.clearFieldError("form");
  }

  function validateRows(): ApiFieldErrors {
    const validationErrors: ApiFieldErrors = {};

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

    for (const row of rows) {
      if (!row.isActive) {
        continue;
      }

      const startKey = `startTime_${row.dayOfWeek}`;

      const endKey = `endTime_${row.dayOfWeek}`;

      if (!row.startTime) {
        addValidationError(
          validationErrors,
          startKey,
          `Συμπληρώστε ώρα έναρξης για ${row.label}.`,
        );
      } else if (!timePattern.test(row.startTime)) {
        addValidationError(
          validationErrors,
          startKey,
          "Η ώρα πρέπει να έχει μορφή ΩΩ:ΛΛ, π.χ. 09:00.",
        );
      }

      if (!row.endTime) {
        addValidationError(
          validationErrors,
          endKey,
          `Συμπληρώστε ώρα λήξης για ${row.label}.`,
        );
      } else if (!timePattern.test(row.endTime)) {
        addValidationError(
          validationErrors,
          endKey,
          "Η ώρα πρέπει να έχει μορφή ΩΩ:ΛΛ, π.χ. 17:00.",
        );
      }

      if (
        timePattern.test(row.startTime) &&
        timePattern.test(row.endTime) &&
        row.startTime >= row.endTime
      ) {
        addValidationError(
          validationErrors,
          endKey,
          "Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.",
        );
      }
    }

    return validationErrors;
  }

  async function handleSave() {
    const validationErrors = validateRows();

    if (!formErrors.applyFrontendErrors(validationErrors)) {
      return;
    }

    const payload: OfficeHoursPostDto[] = rows.map((row) => ({
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTime,
      endTime: row.endTime,
      isActive: row.isActive,
    }));

    try {
      setSaving(true);

      await OfficeHoursApi.replaceWeekly(payload);

      const weekly = await OfficeHoursApi.getWeekly();

      const freshRows = weeklyResponseToRows(weekly);

      setRows(freshRows);
      setOriginalRows(freshRows.map((row) => ({ ...row })));

      formErrors.clearAllErrors();
      setToast("Οι ώρες γραφείου αποθηκεύτηκαν.");
    } catch (error: unknown) {
      console.error(error);

      formErrors.applyApiError(
        error,
        "Δεν ήταν δυνατή η αποθήκευση των ωρών γραφείου.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    formErrors.clearAllErrors();

    setRows(
      originalRows.map((row) => ({
        ...row,
      })),
    );
  }

  function normalizeTypedTime(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }

  const hasChanges = JSON.stringify(rows) !== JSON.stringify(originalRows);

  return (
    <>
      <Card className="p-4 md:p-5">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">
            Ώρες Γραφείου
          </h2>

          <p className="mt-1 max-w-3xl text-sm text-slate-600">
            Επιλέξτε τις ημέρες κατά τις οποίες δέχεστε ραντεβού και ορίστε το
            ωράριο κάθε ημέρας.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Φόρτωση ωρών γραφείου…
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => {
              const startErrorKey = `startTime_${row.dayOfWeek}`;

              const endErrorKey = `endTime_${row.dayOfWeek}`;

              return (
                <div
                  key={row.dayOfWeek}
                  className={cx(
                    "grid gap-4 rounded-2xl border p-4 transition md:grid-cols-[180px_1fr_1fr_auto] md:items-start",
                    row.isActive
                      ? "border-slate-200 bg-white"
                      : "border-slate-200 bg-slate-50/70",
                  )}
                >
                  <div className="md:pt-1">
                    <div className="font-semibold text-slate-900">
                      {row.label}
                    </div>

                    <div
                      className={cx(
                        "mt-1 text-xs font-medium",
                        row.isActive ? "text-emerald-700" : "text-slate-500",
                      )}
                    >
                      {row.isActive ? "Ανοιχτά" : "Κλειστά"}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Από{" "}
                      {row.isActive && (
                        <span className="text-rose-600" aria-hidden="true">
                          *
                        </span>
                      )}
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.startTime}
                      disabled={!row.isActive || saving}
                      placeholder="09:00 ή 0900"
                      maxLength={5}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, {
                          startTime: normalizeTypedTime(event.target.value),
                        })
                      }
                      className={errorInputClass(
                        Boolean(formErrors.fieldErrors[startErrorKey]),
                        "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
                      )}
                    />

                    <FormFieldError
                      errors={formErrors.fieldErrors[startErrorKey]}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Έως{" "}
                      {row.isActive && (
                        <span className="text-rose-600" aria-hidden="true">
                          *
                        </span>
                      )}
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.endTime}
                      disabled={!row.isActive || saving}
                      placeholder="17:00 ή 1700"
                      maxLength={5}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, {
                          endTime: normalizeTypedTime(event.target.value),
                        })
                      }
                      className={errorInputClass(
                        Boolean(formErrors.fieldErrors[endErrorKey]),
                        "h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[rgb(var(--primary))] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
                      )}
                    />

                    <FormFieldError
                      errors={formErrors.fieldErrors[endErrorKey]}
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 md:justify-end md:pt-6">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      disabled={saving}
                      onChange={(event) =>
                        updateRow(row.dayOfWeek, {
                          isActive: event.target.checked,
                        })
                      }
                      className="h-5 w-5 accent-[rgb(var(--primary))]"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      Ενεργή ημέρα
                    </span>
                  </label>
                </div>
              );
            })}

            <FormFieldError
              errors={[
                ...(formErrors.fieldErrors.form ?? []),
                ...(formErrors.fieldErrors.startTime ?? []),
                ...(formErrors.fieldErrors.endTime ?? []),
                ...(formErrors.fieldErrors.dayOfWeek ?? []),
              ]}
            />

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Οι μη ενεργές ημέρες δεν θα εμφανίζονται ως διαθέσιμες για
                ραντεβού.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ακύρωση αλλαγών
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={cx(
                    "rounded-full px-5 py-2 text-sm font-semibold text-white transition",
                    !hasChanges || saving
                      ? "cursor-not-allowed bg-[rgba(var(--primary),0.6)]"
                      : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]",
                  )}
                >
                  {saving ? "Αποθήκευση…" : "Αποθήκευση"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}

      <GeneralErrorDialog
        open={Boolean(formErrors.generalError)}
        title={formErrors.generalError?.title}
        message={formErrors.generalError?.message ?? ""}
        onClose={formErrors.closeGeneralError}
        onRetry={handleSave}
      />
    </>
  );
}
