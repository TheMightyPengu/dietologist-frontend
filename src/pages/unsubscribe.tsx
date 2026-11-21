import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/components/hooks/useTranslations";
import { NewsletterSubscribersApi } from "@/api/NewsletterSubscribersController";

type UnsubscribeState = "loading" | "success" | "invalid" | "error";

export default function UnsubscribePage() {
  const router = useRouter();
  const t = useTranslations();
  const submittedRef = useRef(false);

  const [state, setState] = useState<UnsubscribeState>("loading");

const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || submittedRef.current) {
      return;
    }

    const token =
      typeof router.query.token === "string" ? router.query.token.trim() : "";

    submittedRef.current = true;

    if (!token) {
      setState("invalid");

      setMessage(t.unsubscribe.error.invalidLink);

      return;
    }

    async function unsubscribe() {
      try {
        const result = await NewsletterSubscribersApi.unsubscribe(token);

        setState("success");

        setMessage(result.message || t.unsubscribe.success.defaultMessage);
      } catch (error: unknown) {
        console.error("Newsletter unsubscribe failed:", error);

        const status = (
          error as {
            status?: number;
          }
        )?.status;

        if (status === 400) {
          setState("invalid");

          setMessage(t.unsubscribe.error.invalidLink);

          return;
        }

        setState("error");

        setMessage(t.unsubscribe.error.generic);
      }
    }

    void unsubscribe();
  }, [router.isReady, router.query.token, t]);

  const loading = state === "loading";
  const success = state === "success";

  return (
    <>
      <Head>
        <title>
          {success ? t.unsubscribe.meta.successTitle : t.unsubscribe.meta.title}
        </title>

        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <section className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <div className="rounded-[36px] border border-[rgba(var(--border),0.9)] bg-white/75 p-8 shadow-[var(--shadow)] backdrop-blur-xl md:p-10">
            <div
              className={[
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-sm",
                state === "error" || state === "invalid"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-[rgba(var(--accent-soft),0.95)]",
              ].join(" ")}
            >
              {loading ? (
                <span
                  className="h-9 w-9 animate-spin rounded-full border-4 border-[rgba(var(--primary),0.2)] border-t-[rgb(var(--primary))]"
                  aria-label={t.unsubscribe.loading.ariaLabel}
                />
              ) : success ? (
                "✓"
              ) : (
                "!"
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold text-[rgb(var(--ink))] md:text-4xl">
              {loading
                ? t.unsubscribe.loading.title
                : success
                  ? t.unsubscribe.success.title
                  : t.unsubscribe.error.title}
            </h1>

<p className="mx-auto max-w-md text-[rgb(var(--muted))]">
  {message ?? t.unsubscribe.loading.message}
</p>

            {success && (
              <p className="mx-auto mt-3 max-w-md text-sm text-[rgb(var(--muted))]">
                {t.unsubscribe.success.description}
              </p>
            )}

            {!loading && (
              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex rounded-full bg-[rgb(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgb(var(--primary-dark))]"
                >
                  {t.unsubscribe.backHome}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
