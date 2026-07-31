import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  NewsletterSubscribersApi,
} from "@/api/NewsletterSubscribersController";

type UnsubscribeState =
  | "loading"
  | "success"
  | "invalid"
  | "error";

export default function UnsubscribePage() {
  const router = useRouter();

  const submittedRef = useRef(false);

  const [state, setState] =
    useState<UnsubscribeState>("loading");

  const [message, setMessage] = useState(
    "Γίνεται κατάργηση της εγγραφής σας...",
  );

  useEffect(() => {
    if (
      !router.isReady ||
      submittedRef.current
    ) {
      return;
    }

    const token =
      typeof router.query.token === "string"
        ? router.query.token.trim()
        : "";

    submittedRef.current = true;

    if (!token) {
      setState("invalid");

      setMessage(
        "Ο σύνδεσμος κατάργησης εγγραφής δεν είναι έγκυρος.",
      );

      return;
    }

    async function unsubscribe() {
      try {
        const result =
          await NewsletterSubscribersApi.unsubscribe(
            token,
          );

        setState("success");

        setMessage(
          result.message ||
            "Η κατάργηση εγγραφής ολοκληρώθηκε επιτυχώς.",
        );
      } catch (error: unknown) {
        console.error(
          "Newsletter unsubscribe failed:",
          error,
        );

        const status = (
          error as {
            status?: number;
          }
        )?.status;

        if (status === 400) {
          setState("invalid");

          setMessage(
            "Ο σύνδεσμος κατάργησης εγγραφής δεν είναι έγκυρος.",
          );

          return;
        }

        setState("error");

        setMessage(
          "Δεν ήταν δυνατή η κατάργηση της εγγραφής σας. Παρακαλώ δοκιμάστε ξανά.",
        );
      }
    }

    void unsubscribe();
  }, [
    router.isReady,
    router.query.token,
  ]);

  const loading = state === "loading";
  const success = state === "success";

  return (
    <>
      <Head>
        <title>
          {success
            ? "Η εγγραφή καταργήθηκε | Dietologist"
            : "Κατάργηση εγγραφής | Dietologist"}
        </title>

        <meta
          name="robots"
          content="noindex,nofollow"
        />
      </Head>

      <section className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <div className="rounded-[36px] border border-[rgba(var(--border),0.9)] bg-white/75 p-8 shadow-[var(--shadow)] backdrop-blur-xl md:p-10">
            <div
              className={[
                "mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-sm",
                state === "error" ||
                state === "invalid"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-[rgba(var(--accent-soft),0.95)]",
              ].join(" ")}
            >
              {loading ? (
                <span
                  className="h-9 w-9 animate-spin rounded-full border-4 border-[rgba(var(--primary),0.2)] border-t-[rgb(var(--primary))]"
                  aria-label="Φόρτωση"
                />
              ) : success ? (
                "✓"
              ) : (
                "!"
              )}
            </div>

            <h1 className="mb-4 text-3xl font-bold text-[rgb(var(--ink))] md:text-4xl">
              {loading
                ? "Κατάργηση εγγραφής"
                : success
                  ? "Η εγγραφή σας καταργήθηκε"
                  : "Παρουσιάστηκε πρόβλημα"}
            </h1>

            <p className="mx-auto max-w-md text-[rgb(var(--muted))]">
              {message}
            </p>

            {success && (
              <p className="mx-auto mt-3 max-w-md text-sm text-[rgb(var(--muted))]">
                Τα στοιχεία της εγγραφής σας
                διαγράφηκαν και δεν θα λαμβάνετε
                πλέον email από το newsletter μας.
              </p>
            )}

            {!loading && (
              <div className="mt-8">
                <Link
                  href="/"
                  className="inline-flex rounded-full bg-[rgb(var(--primary))] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgb(var(--primary-dark))]"
                >
                  Επιστροφή στην αρχική
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}