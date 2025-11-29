import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  fetchMessageSettings,
  updateMessageSettings,
  type Booking,
  type BookingStatus,
  type MessageSettings,
} from "@/lib/mgmtContactAPI";

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

/* ================= Page ================= */
export default function ManagementContactPage() {
  const [active, setActive] = useState<Tab>("bookings");
  return (
    <>
      <Head>
        <title>Διαχείριση | ΕΠΙΚΟΙΝΩΝΙΑ</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-[#F7F7EF] text-slate-800">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm hover:border-[#7a7ac4]"
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
                      ? "bg-[#7a7ac4] text-white"
                      : "bg-white border border-slate-200 hover:border-[#7a7ac4]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Card>

          {active === "bookings" ? <BookingsManager /> : <MessagesSettings />}
        </div>
      </div>
    </>
  );
}

/* =============== ΡΑΝΤΕΒΟΥ =============== */

function BookingsManager() {
  const [all, setAll] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD filter
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setAll(await fetchBookings());
      setLoading(false);
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
      const matchesQ =
        !s ||
        [b.name, b.email, b.phone, b.serviceLabel].some((t) =>
          t.toLowerCase().includes(s)
        );
      const matchesStatus = status === "all" || b.status === status;
      const matchesDate = !date || b.dateISO === date;
      return matchesQ && matchesStatus && matchesDate;
    });
  }, [all, q, status, date]);

  async function handleCreate() {
    setCreating(true);
    const today = new Date();
    const d = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const created = await createBooking({
      serviceId: null,
      serviceLabel: "Γενικό ραντεβού",
      name: "Νέος πελάτης",
      phone: "",
      email: "",
      dateISO: d.toISOString().slice(0, 10),
      time: "10:00",
      notes: "",
      status: "pending",
    });
    setAll((prev) => [created, ...prev]);
    setCreating(false);
    setToast("Δημιουργήθηκε.");
  }

  async function handleSave(b: Booking) {
    setBusyId(b.id);
    const upd = await updateBooking(b);
    setAll((prev) => prev.map((x) => (x.id === upd.id ? upd : x)));
    setBusyId(null);
    setToast("Αποθηκεύτηκε.");
  }

  async function handleDelete(id: string) {
    if (!confirm("Διαγραφή ραντεβού;")) return;
    setBusyId(id);
    await deleteBooking(id);
    setAll((prev) => prev.filter((x) => x.id !== id));
    setBusyId(null);
    setToast("Διαγράφηκε.");
  }

  return (
    <>
      <Card className="p-4 md:p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση (όνομα, email, τηλέφωνο, υπηρεσία)…"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
          />
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as BookingStatus | "all")
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
          >
            <option value="all">Όλες οι καταστάσεις</option>
            <option value="pending">Σε εκκρεμότητα</option>
            <option value="confirmed">Επιβεβαιωμένα</option>
            <option value="cancelled">Ακυρωμένα</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
          />
          <button
            onClick={handleCreate}
            disabled={creating || loading}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              creating || loading
                ? "bg-[#7a7ac4]/70 text-white cursor-wait"
                : "bg-[#7a7ac4] text-white hover:shadow"
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
                <th className="px-4 py-3 text-left">Κατάσταση</th>
                <th className="px-4 py-3 text-left">Ημ/νία</th>
                <th className="px-4 py-3 text-left">Ώρα</th>
                <th className="px-4 py-3 text-left">Υπηρεσία</th>
                <th className="px-4 py-3 text-left">Όνομα</th>
                <th className="px-4 py-3 text-left">Τηλέφωνο</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Σημειώσεις</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <Row
                  key={b.id}
                  row={b}
                  busy={busyId === b.id}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
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

function StatusPill({ s }: { s: BookingStatus }) {
  const label =
    s === "pending"
      ? "Εκκρεμεί"
      : s === "confirmed"
      ? "Επιβεβαιωμένο"
      : "Ακυρωμένο";
  const cls =
    s === "pending"
      ? "bg-amber-100 text-amber-800"
      : s === "confirmed"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-rose-100 text-rose-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}</span>
  );
}

function Row({
  row,
  busy,
  onSave,
  onDelete,
}: {
  row: Booking;
  busy: boolean;
  onSave: (b: Booking) => void;
  onDelete: (id: string) => void;
}) {
  const [b, setB] = useState<Booking>(row);

  useEffect(() => setB(row), [row]);

  const quick = {
    confirm: () => onSave({ ...b, status: "confirmed" as const }),
    cancel: () => onSave({ ...b, status: "cancelled" as const }),
    pending: () => onSave({ ...b, status: "pending" as const }),
  };

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 align-top">
        <div className="flex items-center gap-2">
          <StatusPill s={b.status} />
          <select
            value={b.status}
            onChange={(e) =>
              setB((d) => ({ ...d, status: e.target.value as BookingStatus }))
            }
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
          >
            <option value="pending">Εκκρεμεί</option>
            <option value="confirmed">Επιβεβαιωμένο</option>
            <option value="cancelled">Ακυρωμένο</option>
          </select>
        </div>
      </td>
      <td className="px-4 py-3 align-top">
        <input
          type="date"
          value={b.dateISO}
          onChange={(e) => setB((d) => ({ ...d, dateISO: e.target.value }))}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <input
          value={b.time}
          onChange={(e) => setB((d) => ({ ...d, time: e.target.value }))}
          placeholder="--:--"
          className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <input
          value={b.serviceLabel}
          onChange={(e) =>
            setB((d) => ({ ...d, serviceLabel: e.target.value }))
          }
          className="w-56 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <input
          value={b.name}
          onChange={(e) => setB((d) => ({ ...d, name: e.target.value }))}
          className="w-48 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <input
          value={b.phone}
          onChange={(e) => setB((d) => ({ ...d, phone: e.target.value }))}
          className="w-36 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <input
          value={b.email}
          onChange={(e) => setB((d) => ({ ...d, email: e.target.value }))}
          className="w-52 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <textarea
          rows={2}
          value={b.notes ?? ""}
          onChange={(e) => setB((d) => ({ ...d, notes: e.target.value }))}
          className="w-64 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none"
        />
      </td>
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSave(b)}
            disabled={busy}
            className={cx(
              "rounded-full px-3 py-1 text-xs font-semibold",
              busy
                ? "bg-[#7a7ac4]/70 text-white cursor-wait"
                : "bg-[#7a7ac4] text-white"
            )}
          >
            {busy ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
          <div className="flex gap-1">
            <button
              onClick={quick.confirm}
              className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] text-emerald-700"
            >
              Επιβεβαίωση
            </button>
            <button
              onClick={quick.cancel}
              className="rounded-full border border-rose-200 bg-white px-2 py-1 text-[11px] text-rose-700"
            >
              Ακύρωση
            </button>
            <button
              onClick={quick.pending}
              className="rounded-full border border-amber-200 bg-white px-2 py-1 text-[11px] text-amber-700"
            >
              Εκκρεμεί
            </button>
          </div>
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
function MessagesSettings() {
  const [s, setS] = useState<MessageSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => setS(await fetchMessageSettings()))();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  async function onSave() {
    if (!s) return;
    setSaving(true);
    await updateMessageSettings(s);
    setSaving(false);
    setToast("Αποθηκεύτηκε.");
  }

  if (!s) return <Card className="p-6">Φόρτωση…</Card>;

  return (
    <>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Παραλήπτης Μηνυμάτων</h2>
        <p className="mt-1 text-slate-600 text-sm">
          Η διεύθυνση email που θα λαμβάνει τα μηνύματα από τη φόρμα
          επικοινωνίας.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email παραλήπτη
            </label>
            <input
              type="email"
              value={s.destinationEmail}
              onChange={(e) =>
                setS({
                  ...s,
                  destinationEmail: e.target.value,
                })
              }
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#7a7ac4]"
            />
            <p className="text-xs text-slate-500 mt-1">
              Παράδειγμα: <code>hello@yourdomain.gr</code>
            </p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className={cx(
              "rounded-full px-4 py-2 text-sm font-semibold",
              saving
                ? "bg-[#7a7ac4]/70 text-white cursor-wait"
                : "bg-[#7a7ac4] text-white"
            )}
          >
            {saving ? "Αποθήκευση…" : "Αποθήκευση"}
          </button>
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 text-white text-sm px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}