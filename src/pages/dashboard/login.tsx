import Head from "next/head";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { api, toApiError, type ApiFieldErrors } from "@/api/_axios-client";
import { setAdminToken } from "@/lib/admin-auth";
import FormFieldError from "@/components/admin/FormFieldError";
import GeneralErrorDialog from "@/components/admin/GeneralErrorDialog";
import { errorInputClass } from "@/lib/form-validation";

type LoginResponseDto = {
  token: string;
  expiresAtUtc: string;
};

export default function DashboardLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ApiFieldErrors>({});

  const [generalError, setGeneralError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: ApiFieldErrors = {};

    if (!username.trim()) {
      errors.username = ["Το username είναι υποχρεωτικό."];
    }

    if (!password.trim()) {
      errors.password = ["Ο κωδικός είναι υποχρεωτικός."];
    }

    setFieldErrors(errors);
    setGeneralError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<LoginResponseDto>("/Admin/login", {
        username: username.trim(),
        password,
      });

      setAdminToken(response.data.token, response.data.expiresAtUtc);

      const next =
        typeof router.query.next === "string" &&
        router.query.next.startsWith("/dashboard") &&
        router.query.next !== "/dashboard/login"
          ? router.query.next
          : "/dashboard";

      await router.replace(next);
    } catch (error: unknown) {
      const parsed = toApiError(error);

      if (parsed.status === 401) {
        setGeneralError("Το username ή ο κωδικός είναι λανθασμένος.");
      } else {
        setGeneralError(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Admin Login | Dietologist</title>
      </Head>

      <section className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[36px] border border-[rgba(var(--border),0.9)] bg-white/75 p-8 shadow-[var(--shadow)] backdrop-blur-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(var(--accent-soft),0.9)] text-3xl shadow-sm">
                🌿
              </div>

              <h1 className="mb-2 text-3xl font-bold text-[rgb(var(--ink))]">
                Admin Login
              </h1>

              <p className="text-sm text-[rgb(var(--muted))]">
                Sign in to manage the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-[rgb(var(--ink))]"
                >
                  Username{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);

                    setFieldErrors((current) => {
                      const next = { ...current };
                      delete next.username;
                      return next;
                    });
                  }}
                  placeholder="admin"
                  className={errorInputClass(
                    Boolean(fieldErrors.username),
                    "w-full",
                  )}
                  autoComplete="username"
                />

                <FormFieldError errors={fieldErrors.username} />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[rgb(var(--ink))]"
                >
                  Password{" "}
                  <span className="text-rose-600" aria-hidden="true">
                    *
                  </span>
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);

                    setFieldErrors((current) => {
                      const next = { ...current };
                      delete next.password;
                      return next;
                    });
                  }}
                  placeholder="••••••••"
                  className={errorInputClass(
                    Boolean(fieldErrors.password),
                    "w-full",
                  )}
                  autoComplete="current-password"
                />

                <FormFieldError errors={fieldErrors.password} />
              </div>

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
        <GeneralErrorDialog
          open={Boolean(generalError)}
          message={generalError ?? ""}
          onClose={() => setGeneralError(null)}
        />
      </section>
    </>
  );
}