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
      "rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-200/50",
      className
    )}
  >
    {children}
  </div>
);

type Tab = "bookings" | "messages";

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
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#8484d1]"
            >
              ← Πίσω στο Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              ΕΠΙΚΟΙΝΩΝΙΑ
            </h1>
          </div>

          <Card className="p-4 md:p-5 mb-6">
            <div className="flex gap-2">
              {[
                { key: "bookings", label: "Ραντεβού" },
                { key: "messages", label: "Μηνύματα" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key as Tab)}
                  className={cx(
                    "px-4 py-2 rounded-full text-sm font-medium transition",
                    active === t.key
                      ? "bg-[#8484d1] text-white"
                      : "bg-white border border-slate-200 hover:border-[#8484d1]"
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
        ]
          .filter(Boolean)
          .some((t) => String(t).toLowerCase().includes(s));

      const matchesDate = !date || dateOnly === date;

      return matchesQ && matchesDate;
    });
  }, [all, q, date]);

  async function handleCreate() {
    if (!services.length) {
      setToast("Δεν υπάρχουν διαθέσιμες υπηρεσίες.");
      return;
    }

    try {
      setCreating(true);

      const firstService = services[0];
      const tomorrowAtTen = new Date();
      tomorrowAtTen.setDate(tomorrowAtTen.getDate() + 1);
      tomorrowAtTen.setHours(10, 0, 0, 0);

      const payload: AppointmentsPostDto = {
        serviceId: firstService.id,
        providedService: {
          id: firstService.id,
          category: firstService.category,
          duration: firstService.duration,
          description: firstService.description,
          priceIncludingVAT: firstService.priceIncludingVAT,
          interval: firstService.intervalInDays,
        },
        appointmentDate: tomorrowAtTen.toISOString(),
        customerName: "Νέος πελάτης",
        customerEmail: "",
        customerPhone: "",
        isPrepaid: false,
      };

      const created = await AppointmentsApi.create(payload);
      setAll((prev) => [created, ...prev]);
      setToast("Δημιουργήθηκε.");
    } finally {
      setCreating(false);
    }
  }

  async function handleSave(b: AppointmentsGetDto) {
    try {
      setBusyId(b.id);

      const payload: AppointmentsPostDto = {
        serviceId: b.serviceId,
        providedService: b.providedService,
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
      <Card className="p-4 md:p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            onClick={handleCreate}
            disabled={creating || loading}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating || loading
                ? "bg-[#8484d1]/70 text-white cursor-wait"
                : "bg-[#8484d1] text-white hover:shadow"
            )}
          >
            {creating || loading ? "Δημιουργία…" : "Νέο ραντεβού"}
          </button>
        </div>
      </Card>

      <Card className="p-0 overflow-x-auto">
        {loading ? (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">
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
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Καμία εγγραφή.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
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
      serviceId: service.id,
      providedService: {
        id: service.id,
        category: service.category,
        duration: service.duration,
        description: service.description,
        priceIncludingVAT: service.priceIncludingVAT,
        interval: service.intervalInDays,
      },
    }));
  }

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 align-top">{b.id}</td>

      <td className="px-4 py-3 align-top">
        <input
          type="datetime-local"
          value={formatDateTimeLocal(b.appointmentDate)}
          onChange={(e) =>
            setB((prev) => ({
              ...prev,
              appointmentDate: toIsoFromLocal(e.target.value),
            }))
          }
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="px-4 py-3 align-top">
        <select
          value={b.serviceId}
          onChange={(e) => handleServiceChange(Number(e.target.value))}
          className="w-56 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.category}
            </option>
          ))}
        </select>
      </td>

      <td className="px-4 py-3 align-top">
        <input
          value={b.customerName}
          onChange={(e) =>
            setB((prev) => ({ ...prev, customerName: e.target.value }))
          }
          className="w-48 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="px-4 py-3 align-top">
        <input
          value={b.customerPhone}
          onChange={(e) =>
            setB((prev) => ({ ...prev, customerPhone: e.target.value }))
          }
          className="w-36 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="px-4 py-3 align-top">
        <input
          value={b.customerEmail}
          onChange={(e) =>
            setB((prev) => ({ ...prev, customerEmail: e.target.value }))
          }
          className="w-52 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>

      <td className="px-4 py-3 align-top">
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

      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSave(b)}
            disabled={busy}
            className={cx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              busy
                ? "bg-[#8484d1]/70 text-white cursor-wait"
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
      <Card className="p-4 md:p-5 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Αναζήτηση όνομα, email, μήνυμα…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#8484d1]"
        />
      </Card>

      <Card className="divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">
            Φόρτωση μηνυμάτων…
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-slate-500 text-sm">
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
                  <div className="text-xs text-slate-500 mt-1">
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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}