import Head from "next/head";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/router";

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div
    className={cx(
      "rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-sm",
      className
    )}
  >
    {children}
  </div>
);

// Frontend-only admin credentials
const ADMIN_EMAIL = "admin@dietologist.gr";
const ADMIN_PASSWORD = "admin123";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = useMemo(() => {
    if (!submitted) return null;
    if (!email.trim()) return "Το email είναι υποχρεωτικό.";
    return null;
  }, [email, submitted]);

  const passwordError = useMemo(() => {
    if (!submitted) return null;
    if (!password.trim()) return "Ο κωδικός είναι υποχρεωτικός.";
    return null;
  }, [password, submitted]);

  const isValid = !emailError && !passwordError && email.trim() && password.trim();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!email.trim() || !password.trim()) return;
    if (emailError || passwordError) return;

    setLoading(true);

    try {
      if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("admin_logged_in", "true");
        localStorage.setItem("admin_email", ADMIN_EMAIL);
        await router.push("/admin");
        return;
      }

      setError("Λάθος email ή κωδικός.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | Dietologist</title>
        <meta name="description" content="Σύνδεση διαχειριστή" />
      </Head>

      <main className="min-h-screen m-[-10rem]">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-xl lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-10">
              <div>
                <div className="mb-6 inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Dietologist Admin
                </div>

                <h1 className="max-w-md text-4xl font-bold tracking-tight text-slate-900">
                  Σύνδεση στον πίνακα διαχείρισης
                </h1>

                <p className="mt-4 max-w-md text-base leading-7 text-slate-600">
                  Απλή frontend-only σελίδα login για τον διαχειριστή.
                </p>
              </div>

              <Card className="mt-10 p-5">
                <p className="text-sm font-medium text-slate-900">Demo credentials</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Email: <span className="font-medium">{ADMIN_EMAIL}</span>
                  <br />
                  Password: <span className="font-medium">{ADMIN_PASSWORD}</span>
                </p>
              </Card>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
              <div className="w-full max-w-md">
                <div className="mb-8 lg:hidden">
                  <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    Dietologist Admin
                  </div>

                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                    Σύνδεση
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Συνδέσου για να αποκτήσεις πρόσβαση στο admin panel.
                  </p>
                </div>

                <div className="mb-8 hidden lg:block">
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Καλώς ήρθες
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Συμπλήρωσε τα στοιχεία σου για είσοδο ως διαχειριστής.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@dietologist.gr"
                      className={cx(
                        "w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition",
                        "placeholder:text-slate-400",
                        "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
                        emailError ? "border-red-300" : "border-slate-300"
                      )}
                    />

                    {emailError && (
                      <p className="mt-2 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Κωδικός
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cx(
                          "w-full rounded-xl border bg-white px-4 py-3 pr-24 text-sm text-slate-900 outline-none transition",
                          "placeholder:text-slate-400",
                          "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
                          passwordError ? "border-red-300" : "border-slate-300"
                        )}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-100"
                      >
                        {showPassword ? "Απόκρυψη" : "Εμφάνιση"}
                      </button>
                    </div>

                    {passwordError && (
                      <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                    )}
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className={cx(
                      "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white transition",
                      "focus:outline-none focus:ring-4 focus:ring-emerald-100",
                      loading || !isValid
                        ? "cursor-not-allowed bg-slate-300"
                        : "bg-emerald-600 hover:-translate-y-0.5 hover:bg-emerald-700"
                    )}
                  >
                    {loading ? "Σύνδεση..." : "Σύνδεση ως διαχειριστής"}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between gap-4 text-sm">
                  <Link
                    href="/"
                    className="font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    ← Επιστροφή στην αρχική
                  </Link>

                  <span className="text-slate-400">Frontend only</span>
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 lg:hidden">
                  <div className="font-medium text-slate-800">Demo credentials</div>
                  <div className="mt-2">Email: {ADMIN_EMAIL}</div>
                  <div>Password: {ADMIN_PASSWORD}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}