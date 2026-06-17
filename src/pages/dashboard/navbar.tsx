import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { NavbarApi, type NavbarGetDto } from "@/api/NavbarController";
import { toMediaUrl } from "@/api/_axios-client";

const FALLBACK_NAVBAR: NavbarGetDto = {
  id: 1,
  title: "Dietitian",
  imageUrl: "/logo.svg",
};

export default function DashboardNavbar() {
  const [navbar, setNavbar] = useState<NavbarGetDto | null>(null);
  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNavbar() {
    try {
      setLoading(true);
      setError(null);

      const data = await NavbarApi.getSingle();

      const current = data ?? FALLBACK_NAVBAR;

      setNavbar(current);
      setTitle(current.title || "");
      setImagePreview(current.imageUrl || "");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η φόρτωση του navbar."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNavbar();
  }, []);

  useEffect(() => {
    if (!saved) return;

    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!navbar?.id) {
      setError(
        "Δεν υπάρχει εγγραφή Navbar στη βάση. Δημιούργησε πρώτα μία εγγραφή."
      );
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError(null);

      await NavbarApi.update(navbar.id, {
        title,
        imageFile: imageFile ?? undefined,
      });

      const fresh = await NavbarApi.getSingle();

      if (fresh) {
        setNavbar(fresh);
        setTitle(fresh.title || "");
        setImageFile(null);
        setImagePreview(fresh.imageUrl || "");
      } else {
        setNavbar({
          id: navbar.id,
          title,
          imageUrl: imagePreview,
        });
      }

      setSaved(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η αποθήκευση."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Head>
        <title>Navbar | Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] bg-bg text-slate-800">
        <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8 py-8 md:py-12">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 hover:text-[rgb(var(--primary))] transition"
            >
              ← Πίσω στο Dashboard
            </Link>
          </div>

          <section className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-sm border border-[rgba(var(--border),0.8)] p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[rgb(var(--ink))]">
              Διαχείριση Navbar
            </h1>

            <p className="mt-2 text-[rgb(var(--muted))]">
              Εδώ μπορείς να αλλάξεις τον τίτλο και την εικόνα που εμφανίζονται
              στο navbar.
            </p>

            {loading ? (
              <div className="mt-8 space-y-4 animate-pulse">
                <div className="h-11 rounded-xl bg-[rgba(var(--primary),0.12)]" />
                <div className="h-11 rounded-xl bg-[rgba(var(--primary),0.12)]" />
                <div className="h-24 rounded-2xl bg-[rgba(var(--primary),0.12)]" />
              </div>
            ) : (
              <form onSubmit={handleSave} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--ink))] mb-2">
                    Τίτλος Navbar
                  </label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-[rgba(var(--border),1)] bg-white px-4 py-3 text-sm outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.18)]"
                    placeholder="π.χ. Διαιτολογικό Κέντρο"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--ink))] mb-2">
                    Εικόνα / Logo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }}
                    className="w-full rounded-xl border border-[rgba(var(--border),1)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.18)] file:mr-3 file:rounded-lg file:border-0 file:bg-[rgba(var(--primary),0.1)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[rgb(var(--primary))] hover:file:bg-[rgba(var(--primary),0.18)]"
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgba(var(--surface-soft),0.7)] p-5">
                  <p className="mb-4 text-sm font-medium text-[rgb(var(--ink))]">
                    Προεπισκόπηση Navbar
                  </p>

                  <div className="flex items-center gap-4 rounded-xl bg-white border border-[rgba(var(--border),0.9)] px-4 py-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[rgba(var(--primary),0.08)] border border-[rgba(var(--border),0.9)]">
                      {imagePreview ? (
                        <Image
                          src={imagePreview.startsWith("/media") ? toMediaUrl(imagePreview) : imagePreview}
                          alt="Navbar logo preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          Logo
                        </div>
                      )}
                    </div>

                    <span className="text-lg font-semibold text-[rgb(var(--ink))]">
                      {title || "Τίτλος Navbar"}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className={[
                      "rounded-full px-6 py-2.5 text-sm font-medium text-white transition",
                      saving
                        ? "cursor-wait bg-[rgba(var(--primary),0.65)]"
                        : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]",
                    ].join(" ")}
                  >
                    {saving ? "Αποθήκευση…" : "Αποθήκευση"}
                  </button>

                  {saved && (
                    <span className="text-sm text-[rgb(var(--primary))]">
                      Οι αλλαγές αποθηκεύτηκαν.
                    </span>
                  )}
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </>
  );
}