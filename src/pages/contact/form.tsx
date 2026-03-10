import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ContactMessagesApi } from "../../api/ContactMessagesController"; 

type FieldErrors = Partial<{
  fullName: string;
  email: string;
  subject: string;
  message: string;
}>;

const INPUT_BASE =
  "mt-1 w-full rounded-xl bg-white px-3 h-12 text-[15px] text-slate-900 ring-1 ring-accent/30 outline-none " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const LABEL_BASE = "block text-[15px] font-semibold text-slate-900";
const HELP_TEXT = "mt-1 text-sm text-slate-600";
const ERROR_TEXT = "mt-1 text-sm text-rose-600";

function EmailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6.5h16v11H4v-11Z"
        className="stroke-slate-700"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M4.8 7.2 12 12.6l7.2-5.4"
        className="stroke-slate-700"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8.2 3.8h2.3l1.1 4.3-2 1.4c1.1 2.2 2.9 4 5.1 5.1l1.4-2 4.3 1.1v2.3c0 1-0.8 1.8-1.8 1.8C11 17.8 6.2 13 4.4 5.6c-.2-1 .6-1.8 1.6-1.8Z"
        className="stroke-slate-700"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"
        className="stroke-slate-700"
        strokeWidth="1.6"
      />
      <path
        d="M12 7v5l3 2"
        className="stroke-slate-700"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ContactFormPage() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [successPayload, setSuccessPayload] = useState<null | {
    fullName: string;
    email: string;
    subject: string;
  }>(null);

  const contact = useMemo(
    () => ({
      email: "info@example.gr",
      phoneDisplay: "2310 000000",
      phoneTel: "+302310000000",
      hours: "Δευ–Παρ 10:00–18:00",
    }),
    []
  );

  function markTouched(name: string) {
    setTouched((p) => ({ ...p, [name]: true }));
  }

  function validate(payload: { fullName: string; email: string; subject: string; message: string }) {
    const next: FieldErrors = {};

    if (!payload.fullName.trim()) next.fullName = "Συμπληρώστε ονοματεπώνυμο.";

    if (!payload.email.trim()) {
      next.email = "Συμπληρώστε email.";
    } else {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim());
      if (!ok) next.email = "Συμπληρώστε έγκυρο email.";
    }

    if (!payload.subject.trim()) next.subject = "Συμπληρώστε θέμα.";
    if (!payload.message.trim()) next.message = "Συμπληρώστε μήνυμα.";

    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setSubmitError(null);
    setSuccessPayload(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const fullName = String(fd.get("fullName") || "");
    const email = String(fd.get("email") || "");
    const subject = String(fd.get("subject") || "");
    const message = String(fd.get("message") || "");

    setTouched((p) => ({ ...p, fullName: true, email: true, subject: true, message: true }));

    const nextErrors = validate({ fullName, email, subject, message });
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      await ContactMessagesApi.create({
        senderName: fullName.trim(),
        senderEmail: email.trim(),
        message: message.trim(),
        sentAt: new Date().toISOString(),
        // TODO: Το backend contract δεν έχει ακόμη "subject".
        // Όταν προστεθεί στο API/DB, στείλ’ το κανονικά από εδώ.
      });

      setSuccessPayload({
        fullName: fullName.trim(),
        email: email.trim(),
        subject: subject.trim(),
      });

      form.reset();
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
        <title>Φόρμα Επικοινωνίας — Επικοινωνία</title>
        <meta
          name="description"
          content="Επικοινωνήστε μαζί μας για απορίες, διευκρινίσεις ή συνεργασία."
        />
        <link rel="canonical" href="https://example.gr/contact/form" />
      </Head>

      <section className="bg-bg">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Φόρμα Επικοινωνίας
            </h1>
            <p className="mt-2 max-w-2xl text-slate-700 leading-relaxed">
              Πείτε μας πώς μπορούμε να βοηθήσουμε. Απαντάμε συνήθως εντός 1–2 εργάσιμων.
            </p>
          </header>

          {successPayload && (
            <div className="mb-6 rounded-2xl bg-white p-6 ring-1 ring-accent/25 shadow-[0_16px_34px_rgba(164,199,126,0.14)]">
              <h2 className="text-xl font-semibold text-slate-900">Το μήνυμα στάλθηκε</h2>
              <p className="mt-1 text-base text-slate-700">Θα επικοινωνήσουμε σύντομα.</p>

              <div className="mt-4 grid grid-cols-1 gap-3 text-[15px] text-slate-800 md:grid-cols-2">
                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20">
                  <div className="text-sm text-slate-600">Ονοματεπώνυμο</div>
                  <div className="mt-0.5 font-medium">{successPayload.fullName}</div>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20">
                  <div className="text-sm text-slate-600">Email</div>
                  <div className="mt-0.5 font-medium">{successPayload.email}</div>
                </div>
                <div className="rounded-xl bg-white p-3 ring-1 ring-accent/20 md:col-span-2">
                  <div className="text-sm text-slate-600">Θέμα</div>
                  <div className="mt-0.5 font-medium">{successPayload.subject}</div>
                </div>
              </div>

              <div className="mt-5">
                <Link
                  href="/contact/form"
                  className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35"
                >
                  Στείλτε νέο μήνυμα
                </Link>
              </div>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-5 md:gap-6">
            <div className="md:col-span-3">
              <form
                onSubmit={onSubmit}
                className="rounded-2xl bg-white p-6 shadow-[0_16px_34px_rgba(164,199,126,0.12)] ring-1 ring-accent/30"
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                    Στείλτε μήνυμα
                  </h2>
                  <p className="mt-1 text-[15px] text-slate-600">
                    <span className="font-semibold text-slate-800">Υποχρεωτικά πεδία</span>
                    <span className="text-slate-600"> με </span>
                    <span className="font-semibold text-rose-600">*</span>
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={LABEL_BASE}>
                      Ονοματεπώνυμο <span className="text-rose-600">*</span>
                    </label>
                    <input
                      name="fullName"
                      required
                      disabled={loading}
                      onBlur={() => markTouched("fullName")}
                      onChange={() => setFieldErrors((p) => ({ ...p, fullName: undefined }))}
                      aria-invalid={show("fullName")}
                      aria-describedby={show("fullName") ? "fullName-error" : undefined}
                      className={INPUT_BASE}
                      placeholder="π.χ. Νίκος Παπ."
                    />
                    {show("fullName") && (
                      <p id="fullName-error" className={ERROR_TEXT}>
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={LABEL_BASE}>
                      Email <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={loading}
                      onBlur={() => markTouched("email")}
                      onChange={() => setFieldErrors((p) => ({ ...p, email: undefined }))}
                      aria-invalid={show("email")}
                      aria-describedby={show("email") ? "email-error" : "email-help"}
                      className={INPUT_BASE}
                      placeholder="name@email.com"
                    />
                    <p id="email-help" className={HELP_TEXT}>
                      Προαιρετικό, για απάντηση με email.
                    </p>
                    {show("email") && (
                      <p id="email-error" className={ERROR_TEXT}>
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={LABEL_BASE}>
                      Θέμα <span className="text-rose-600">*</span>
                    </label>
                    <input
                      name="subject"
                      required
                      disabled={loading}
                      onBlur={() => markTouched("subject")}
                      onChange={() => setFieldErrors((p) => ({ ...p, subject: undefined }))}
                      aria-invalid={show("subject")}
                      aria-describedby={show("subject") ? "subject-error" : undefined}
                      className={INPUT_BASE}
                      placeholder="Σύντομος τίτλος μηνύματος"
                    />
                    {show("subject") && (
                      <p id="subject-error" className={ERROR_TEXT}>
                        {fieldErrors.subject}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className={LABEL_BASE}>
                      Μήνυμα <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      disabled={loading}
                      rows={4}
                      onBlur={() => markTouched("message")}
                      onChange={() => setFieldErrors((p) => ({ ...p, message: undefined }))}
                      aria-invalid={show("message")}
                      aria-describedby={show("message") ? "message-error" : undefined}
                      className={[
                        "mt-1 min-h-[120px] w-full resize-y rounded-xl bg-white px-3 py-2 text-[15px] text-slate-900 ring-1 ring-accent/30 outline-none",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      ].join(" ")}
                      placeholder="Πείτε μας περισσότερα…"
                    />
                    {show("message") && (
                      <p id="message-error" className={ERROR_TEXT}>
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 items-center rounded-xl bg-primary px-5 text-[15px] font-semibold text-white transition hover:shadow-[0_18px_38px_rgba(164,199,126,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/35 disabled:opacity-60"
                  >
                    {loading ? "Αποστολή..." : "Αποστολή Μηνύματος"}
                  </button>

                  <div className="mt-3">
                    <Link
                      href="/contact/book"
                      className="inline-flex items-center text-[15px] text-slate-600 underline decoration-slate-400/30 transition hover:text-primary hover:decoration-primary/40"
                    >
                      Ή κλείστε ραντεβού →
                    </Link>
                  </div>

                  {!!submitError && <p className="mt-3 text-sm text-rose-600">{submitError}</p>}
                </div>
              </form>
            </div>

            <aside className="md:col-span-2">
              <div className="rounded-2xl bg-white p-5 shadow-[0_16px_34px_rgba(164,199,126,0.12)] ring-1 ring-accent/30 md:p-6">
                <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                  Στοιχεία Επικοινωνίας
                </h2>

                <ul className="mt-4 space-y-3 text-[15px] text-slate-700">
                  <li className="flex items-start gap-3">
                    <EmailIcon className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>
                      Email:{" "}
                      <a
                        href={`mailto:${contact.email}`}
                        className="font-semibold text-primary underline decoration-primary/30 transition hover:text-accent hover:decoration-accent/50"
                      >
                        {contact.email}
                      </a>
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>
                      Τηλέφωνο:{" "}
                      <a
                        href={`tel:${contact.phoneTel}`}
                        className="font-semibold text-primary underline decoration-primary/30 transition hover:text-accent hover:decoration-accent/50"
                      >
                        {contact.phoneDisplay}
                      </a>
                    </span>
                  </li>

                  <li className="flex items-start gap-3">
                    <ClockIcon className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>{contact.hours}</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}