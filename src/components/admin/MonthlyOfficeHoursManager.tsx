import { useCallback, useEffect, useMemo, useState } from "react";
import { OfficeHoursApi, type OfficeHoursGetDto, type OfficeHoursPostDto } from "@/api/OfficeHoursController";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { useFormErrors } from "@/components/hooks/useFormErrors";
import { addValidationError, errorInputClass } from "@/lib/form-validation";
import type { ApiFieldErrors } from "@/api/_axios-client";

type Period = { startTime: string; endTime: string };
const weekdays = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];
const emptyPeriod = (): Period => ({ startTime: "09:00", endTime: "17:00" });
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const periodsForDate = (rows: OfficeHoursGetDto[], date: string): Period[] =>
  rows.filter((row) => row.date === date).map((row) => ({
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
  }));

export default function MonthlyOfficeHoursManager() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [rows, setRows] = useState<OfficeHoursGetDto[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [originalPeriods, setOriginalPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const formErrors = useFormErrors();

  const loadMonth = useCallback(async () => {
    try {
      setLoading(true);
      formErrors.clearAllErrors();
      const response = await OfficeHoursApi.getMonth(month.getFullYear(), month.getMonth() + 1);
      setRows(response);
      setSelectedDate((currentDate) => {
        const selected = currentDate.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`)
          ? currentDate
          : dateKey(month);
        const loaded = periodsForDate(response, selected);
        setPeriods(loaded);
        setOriginalPeriods(loaded);
        return selected;
      });
    } catch (error) {
      formErrors.applyApiError(error, "Δεν ήταν δυνατή η φόρτωση της διαθεσιμότητας.");
    } finally {
      setLoading(false);
    }
  }, [formErrors.applyApiError, formErrors.clearAllErrors, month]);

  useEffect(() => { void loadMonth(); }, [loadMonth]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const calendarDays = useMemo(() => {
    const firstOffset = (month.getDay() + 6) % 7;
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(firstOffset).fill(null), ...Array.from({ length: count }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1))];
  }, [month]);

  function selectDate(date: Date) {
    const key = dateKey(date);
    const loaded = periodsForDate(rows, key);
    setSelectedDate(key);
    setPeriods(loaded);
    setOriginalPeriods(loaded);
    formErrors.clearAllErrors();
  }

  function validate(): ApiFieldErrors {
    const errors: ApiFieldErrors = {};
    const pattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    periods.forEach((period, index) => {
      if (!pattern.test(period.startTime)) addValidationError(errors, `startTime_${index}`, "Συμπληρώστε έγκυρη ώρα έναρξης.");
      if (!pattern.test(period.endTime)) addValidationError(errors, `endTime_${index}`, "Συμπληρώστε έγκυρη ώρα λήξης.");
      if (pattern.test(period.startTime) && pattern.test(period.endTime) && period.startTime >= period.endTime)
        addValidationError(errors, `endTime_${index}`, "Η ώρα λήξης πρέπει να είναι μετά την ώρα έναρξης.");
    });
    const sorted = periods.map((period, index) => ({ ...period, index })).sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let index = 1; index < sorted.length; index++) {
      if (sorted[index].startTime < sorted[index - 1].endTime)
        addValidationError(errors, "form", "Τα χρονικά διαστήματα δεν επιτρέπεται να επικαλύπτονται.");
    }
    return errors;
  }

  async function save() {
    if (!formErrors.applyFrontendErrors(validate())) return;
    try {
      setSaving(true);
      const payload: OfficeHoursPostDto[] = periods.map(({ startTime, endTime }) => ({ startTime, endTime }));
      await OfficeHoursApi.replaceDate(selectedDate, payload);
      await loadMonth();
      setToast(periods.length ? "Η διαθεσιμότητα αποθηκεύτηκε." : "Η ημέρα ορίστηκε ως μη διαθέσιμη.");
    } catch (error) {
      formErrors.applyApiError(error, "Δεν ήταν δυνατή η αποθήκευση της διαθεσιμότητας.");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = JSON.stringify(periods) !== JSON.stringify(originalPeriods);
  const selectedLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString("el-GR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() - 1, 1))} className="rounded-full border border-slate-300 px-4 py-2 text-sm">‹ Προηγούμενος</button>
            <h2 className="text-center text-lg font-semibold capitalize text-slate-900">{month.toLocaleDateString("el-GR", { month: "long", year: "numeric" })}</h2>
            <button type="button" onClick={() => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + 1, 1))} className="rounded-full border border-slate-300 px-4 py-2 text-sm">Επόμενος ›</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekdays.map((day) => <div key={day} className="py-2 text-xs font-semibold text-slate-500">{day}</div>)}
            {calendarDays.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} />;
              const key = dateKey(date);
              const count = rows.filter((row) => row.date === key).length;
              return <button key={key} type="button" onClick={() => selectDate(date)} className={`min-h-16 rounded-xl border p-1.5 text-left transition ${selectedDate === key ? "border-[rgb(var(--primary))] bg-[rgba(var(--primary),0.08)]" : "border-slate-200 hover:border-slate-400"}`}>
                <span className="block text-sm font-semibold">{date.getDate()}</span>
                <span className={`mt-2 block truncate text-[10px] font-medium ${count ? "text-emerald-700" : "text-slate-400"}`}>{count ? `${count} ωράριο${count > 1 ? "α" : ""}` : "Μη διαθέσιμη"}</span>
              </button>;
            })}
          </div>
          {loading && <p className="mt-4 text-center text-sm text-slate-500">Φόρτωση διαθεσιμότητας…</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <h3 className="text-lg font-semibold capitalize text-slate-900">{selectedLabel}</h3>
          <p className="mt-1 text-sm text-slate-500">Χωρίς ωράρια, η ημέρα θεωρείται μη διαθέσιμη.</p>
          <div className="mt-5 space-y-4">
            {periods.map((period, index) => <div key={index} className="rounded-xl border border-slate-200 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Από *<input type="time" value={period.startTime} disabled={saving} onChange={(event) => setPeriods((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item))} className={errorInputClass(Boolean(formErrors.fieldErrors[`startTime_${index}`]), "mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm")} /><FormFieldError errors={formErrors.fieldErrors[`startTime_${index}`]} /></label>
                <label className="text-xs font-semibold uppercase text-slate-500">Έως *<input type="time" value={period.endTime} disabled={saving} onChange={(event) => setPeriods((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item))} className={errorInputClass(Boolean(formErrors.fieldErrors[`endTime_${index}`]), "mt-1 h-11 w-full rounded-xl border border-slate-300 px-3 text-sm")} /><FormFieldError errors={formErrors.fieldErrors[`endTime_${index}`]} /></label>
              </div>
              <button type="button" disabled={saving} onClick={() => setPeriods((items) => items.filter((_, itemIndex) => itemIndex !== index))} className="mt-3 text-sm font-medium text-rose-600">Διαγραφή ωραρίου</button>
            </div>)}
            {!periods.length && <div className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">Η ημέρα δεν έχει διαθέσιμες ώρες.</div>}
            <FormFieldError errors={formErrors.fieldErrors.form} />
            <button type="button" disabled={saving} onClick={() => setPeriods((items) => [...items, emptyPeriod()])} className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-[rgb(var(--primary))]">+ Προσθήκη ωραρίου</button>
          </div>
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" disabled={!hasChanges || saving} onClick={() => setPeriods(originalPeriods)} className="rounded-full border border-slate-300 px-4 py-2 text-sm disabled:opacity-50">Ακύρωση αλλαγών</button>
            <button type="button" disabled={!hasChanges || saving} onClick={() => void save()} className="rounded-full bg-[rgb(var(--primary))] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Αποθήκευση…" : "Αποθήκευση"}</button>
          </div>
        </section>
      </div>
      {toast && <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
      <GeneralErrorDialog open={Boolean(formErrors.generalError)} title={formErrors.generalError?.title} message={formErrors.generalError?.message ?? ""} onClose={formErrors.closeGeneralError} onRetry={save} />
    </>
  );
}
