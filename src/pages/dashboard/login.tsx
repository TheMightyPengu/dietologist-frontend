import Head from "next/head";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { api, toApiError } from "@/api/_axios-client";
import { setAdminToken } from "@/lib/admin-auth";

type LoginResponseDto = {
  token: string;
  expiresAtUtc: string;
};

export default function DashboardLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<LoginResponseDto>("/Admin/login", {
        username,
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
    } catch (e) {
      const apiError = toApiError(e);

      if (apiError.status === 401) {
        setError("Invalid username or password.");
        return;
      }

      setError(apiError.message || "Login failed. Please try again.");
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
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="admin"
                  className="w-full"
                  autoComplete="username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[rgb(var(--ink))]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}