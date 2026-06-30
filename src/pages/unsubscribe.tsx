import Head from "next/head";

export default function UnsubscribePage() {
  return (
    <>
      <Head>
        <title>Unsubscribed | Dietologist</title>
      </Head>

      <section className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">
          <div className="rounded-[36px] border border-[rgba(var(--border),0.9)] bg-white/75 p-8 shadow-[var(--shadow)] backdrop-blur-xl md:p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(var(--accent-soft),0.95)] text-4xl shadow-sm">
              ✓
            </div>

            <h1 className="mb-4 text-3xl font-bold text-[rgb(var(--ink))] md:text-4xl">
              You have been unsubscribed
            </h1>

            <p className="mx-auto mb-8 max-w-md text-[rgb(var(--muted))]">
              Your email preferences have been updated successfully. You will no
              longer receive these emails from us.
            </p>

            <div className="callout-success">
              <p className="m-0 text-sm text-[rgb(var(--muted))]">
                This page is currently static. The unsubscribe link token will be
                connected later.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}