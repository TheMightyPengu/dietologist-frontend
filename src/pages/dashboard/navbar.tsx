import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  NavbarApi,
  type NavbarGetDto,
} from "@/api/NavbarController";

import { toMediaUrl } from "@/api/_axios-client";

import { WebsiteThemeApi } from "@/api/WebsiteThemeController";

import {
  applyTheme,
  DEFAULT_MAIN_THEME,
  generateWebsiteTheme,
  getMainThemeColors,
  isValidHexColor,
  type MainThemeColors,
} from "@/lib/Websitetheme";

const FALLBACK_NAVBAR: NavbarGetDto = {
  id: 1,
  title: "Dietitian",
  imageUrl: "/logo.svg",
};

type ThemeColorFieldProps = {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
};

function ThemeColorField({
  label,
  description,
  value,
  onChange,
}: ThemeColorFieldProps) {
  const pickerValue = isValidHexColor(value)
    ? value
    : "#000000";

  return (
    <label className="block">
      <span className="block text-sm font-medium text-[rgb(var(--ink))]">
        {label}
      </span>

      <span className="mt-1 block text-xs text-[rgb(var(--muted))]">
        {description}
      </span>

      <div className="mt-2 flex items-center gap-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) =>
            onChange(event.target.value.toUpperCase())
          }
          className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-[rgba(var(--border),1)] bg-[rgb(var(--surface))] p-1"
        />

        <input
          type="text"
          value={value}
          maxLength={7}
          onChange={(event) =>
            onChange(event.target.value.toUpperCase())
          }
          className="min-w-0 flex-1 rounded-xl border border-[rgba(var(--border),1)] bg-[rgb(var(--surface))] px-4 py-2.5 font-mono text-sm uppercase outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.18)]"
          placeholder="#698556"
        />
      </div>
    </label>
  );
}

export default function DashboardNavbar() {
  // Navbar state
  const [navbar, setNavbar] =
    useState<NavbarGetDto | null>(null);

  const [title, setTitle] = useState("");
  const [imageFile, setImageFile] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  // Only four colors are editable.
  const [mainTheme, setMainTheme] =
    useState<MainThemeColors>(DEFAULT_MAIN_THEME);

  const [savedMainTheme, setSavedMainTheme] =
    useState<MainThemeColors>(DEFAULT_MAIN_THEME);

  const [themeLoading, setThemeLoading] = useState(true);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeSaved, setThemeSaved] = useState(false);
  const [themeError, setThemeError] =
    useState<string | null>(null);

  // Generates the full 15-field object required by the backend.
  const generatedTheme = useMemo(
    () => generateWebsiteTheme(mainTheme),
    [mainTheme]
  );

  async function loadNavbar(): Promise<void> {
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

  async function loadTheme(): Promise<void> {
    try {
      setThemeLoading(true);
      setThemeError(null);

      const data = await WebsiteThemeApi.get();
      const loadedMainColors = getMainThemeColors(data);
      const completeTheme =
        generateWebsiteTheme(loadedMainColors);

      setMainTheme(loadedMainColors);
      setSavedMainTheme(loadedMainColors);
      applyTheme(completeTheme);
    } catch (err: unknown) {
      console.error("Theme loading failed:", err);

      setMainTheme(DEFAULT_MAIN_THEME);
      setSavedMainTheme(DEFAULT_MAIN_THEME);

      applyTheme(
        generateWebsiteTheme(DEFAULT_MAIN_THEME)
      );

      setThemeError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η φόρτωση των χρωμάτων."
      );
    } finally {
      setThemeLoading(false);
    }
  }

  useEffect(() => {
    void loadNavbar();
    void loadTheme();
  }, []);

  useEffect(() => {
    if (!saved) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaved(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [saved]);

  useEffect(() => {
    if (!themeSaved) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setThemeSaved(false);
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [themeSaved]);

  async function handleNavbarSave(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

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

  function handleMainColorChange(
    field: keyof MainThemeColors,
    value: string
  ): void {
    setThemeSaved(false);
    setThemeError(null);

    setMainTheme((currentTheme) => {
      const updatedMainTheme = {
        ...currentTheme,
        [field]: value,
      };

      const allValuesAreValid = Object.values(
        updatedMainTheme
      ).every(isValidHexColor);

      if (allValuesAreValid) {
        applyTheme(
          generateWebsiteTheme(updatedMainTheme)
        );
      }

      return updatedMainTheme;
    });
  }

  async function handleThemeSave(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const hasInvalidColor = Object.values(
      mainTheme
    ).some((value) => !isValidHexColor(value));

    if (hasInvalidColor) {
      setThemeError(
        "Όλα τα χρώματα πρέπει να έχουν μορφή #RRGGBB, για παράδειγμα #698556."
      );
      return;
    }

    try {
      setThemeSaving(true);
      setThemeSaved(false);
      setThemeError(null);

      const completeTheme =
        generateWebsiteTheme(mainTheme);

      const response = await WebsiteThemeApi.update(
        completeTheme
      );

      const savedColors = getMainThemeColors(response);
      const savedCompleteTheme =
        generateWebsiteTheme(savedColors);

      setMainTheme(savedColors);
      setSavedMainTheme(savedColors);
      applyTheme(savedCompleteTheme);

      setThemeSaved(true);
    } catch (err: unknown) {
      console.error("Theme saving failed:", err);

      setThemeError(
        err instanceof Error
          ? err.message
          : "Δεν ήταν δυνατή η αποθήκευση των χρωμάτων."
      );
    } finally {
      setThemeSaving(false);
    }
  }

  function handleThemeCancel(): void {
    setMainTheme(savedMainTheme);

    applyTheme(
      generateWebsiteTheme(savedMainTheme)
    );

    setThemeSaved(false);
    setThemeError(null);
  }

  function handleThemeReset(): void {
    setMainTheme(DEFAULT_MAIN_THEME);

    applyTheme(
      generateWebsiteTheme(DEFAULT_MAIN_THEME)
    );

    setThemeSaved(false);
    setThemeError(null);
  }

  const navbarPreviewUrl = imagePreview.startsWith(
    "/media"
  )
    ? toMediaUrl(imagePreview)
    : imagePreview;

  return (
    <>
      <Head>
        <title>Navbar και χρώματα | Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="min-h-[70vh] text-slate-800">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12 lg:px-8">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-sm text-slate-500 transition hover:text-[rgb(var(--primary))]"
            >
              ← Πίσω στο Dashboard
            </Link>
          </div>

          {/* Navbar settings */}
          <section className="rounded-2xl border border-[rgba(var(--border),0.8)] bg-[rgba(var(--surface),0.88)] p-6 shadow-sm backdrop-blur-sm md:p-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[rgb(var(--ink))] md:text-3xl">
              Διαχείριση Navbar
            </h1>

            <p className="mt-2 text-[rgb(var(--muted))]">
              Εδώ μπορείς να αλλάξεις τον τίτλο και την εικόνα
              που εμφανίζονται στο navbar.
            </p>

            {loading ? (
              <div className="mt-8 space-y-4 animate-pulse">
                <div className="h-11 rounded-xl bg-[rgba(var(--primary),0.12)]" />
                <div className="h-11 rounded-xl bg-[rgba(var(--primary),0.12)]" />
                <div className="h-24 rounded-2xl bg-[rgba(var(--primary),0.12)]" />
              </div>
            ) : (
              <form
                onSubmit={handleNavbarSave}
                className="mt-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="navbar-title"
                    className="mb-2 block text-sm font-medium text-[rgb(var(--ink))]"
                  >
                    Τίτλος Navbar
                  </label>

                  <input
                    id="navbar-title"
                    value={title}
                    onChange={(event) =>
                      setTitle(event.target.value)
                    }
                    className="w-full rounded-xl border border-[rgba(var(--border),1)] bg-[rgb(var(--surface))] px-4 py-3 text-sm outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.18)]"
                    placeholder="π.χ. Διαιτολογικό Κέντρο"
                  />
                </div>

                <div>
                  <label
                    htmlFor="navbar-image"
                    className="mb-2 block text-sm font-medium text-[rgb(var(--ink))]"
                  >
                    Εικόνα / Logo
                  </label>

                  <input
                    id="navbar-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file =
                        event.target.files?.[0];

                      if (!file) {
                        return;
                      }

                      setImageFile(file);
                      setImagePreview(
                        URL.createObjectURL(file)
                      );
                    }}
                    className="w-full rounded-xl border border-[rgba(var(--border),1)] bg-[rgb(var(--surface))] px-4 py-2.5 text-sm outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgba(var(--primary),0.18)] file:mr-3 file:rounded-lg file:border-0 file:bg-[rgba(var(--primary),0.1)] file:px-3 file:py-1 file:text-sm file:font-medium file:text-[rgb(var(--primary))]"
                  />
                </div>

                <div className="rounded-2xl border border-[rgba(var(--border),0.9)] bg-[rgba(var(--surface-soft),0.7)] p-5">
                  <p className="mb-4 text-sm font-medium text-[rgb(var(--ink))]">
                    Προεπισκόπηση Navbar
                  </p>

                  <div className="flex items-center gap-4 rounded-xl border border-[rgba(var(--border),0.9)] bg-[rgb(var(--surface))] px-4 py-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[rgba(var(--border),0.9)] bg-[rgba(var(--primary),0.08)]">
                      {navbarPreviewUrl ? (
                        <Image
                          src={navbarPreviewUrl}
                          alt="Navbar logo preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-[rgb(var(--muted))]">
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
                      "rounded-full px-6 py-2.5 text-sm font-medium transition",
                      "text-[rgb(var(--button-text))]",
                      saving
                        ? "cursor-wait bg-[rgba(var(--primary),0.65)]"
                        : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]",
                    ].join(" ")}
                  >
                    {saving
                      ? "Αποθήκευση…"
                      : "Αποθήκευση"}
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

          {/* Simplified theme settings */}
          <section className="mt-8 rounded-2xl border border-[rgba(var(--border),0.8)] bg-[rgba(var(--surface),0.88)] p-6 shadow-sm backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-[rgb(var(--ink))] md:text-3xl">
                  Χρώματα ιστοσελίδας
                </h2>

                <p className="mt-2 max-w-2xl text-[rgb(var(--muted))]">
                  Επίλεξε μόνο τα τέσσερα βασικά χρώματα.
                  Οι υπόλοιπες αποχρώσεις δημιουργούνται
                  αυτόματα.
                </p>
              </div>

              <button
                type="button"
                onClick={handleThemeReset}
                disabled={themeLoading || themeSaving}
                className="self-start rounded-full border border-[rgba(var(--border),1)] bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--ink))] transition hover:bg-[rgb(var(--surface-soft))] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Επαναφορά αρχικών χρωμάτων
              </button>
            </div>

            {themeLoading ? (
              <div className="mt-8 grid gap-5 animate-pulse md:grid-cols-2">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-20 rounded-xl bg-[rgba(var(--primary),0.12)]"
                    />
                  )
                )}
              </div>
            ) : (
              <form
                onSubmit={handleThemeSave}
                className="mt-8"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  <ThemeColorField
                    label="Κύριο χρώμα"
                    description="Κουμπιά, σύνδεσμοι και ενεργά στοιχεία."
                    value={mainTheme.primary}
                    onChange={(value) =>
                      handleMainColorChange(
                        "primary",
                        value
                      )
                    }
                  />

                  <ThemeColorField
                    label="Χρώμα έμφασης"
                    description="Διακοσμητικές γραμμές, highlights και δευτερεύοντα στοιχεία."
                    value={mainTheme.accent}
                    onChange={(value) =>
                      handleMainColorChange(
                        "accent",
                        value
                      )
                    }
                  />

                  <ThemeColorField
                    label="Χρώμα φόντου"
                    description="Το βασικό φόντο της ιστοσελίδας και οι αυτόματες διαβαθμίσεις."
                    value={mainTheme.background}
                    onChange={(value) =>
                      handleMainColorChange(
                        "background",
                        value
                      )
                    }
                  />

                  <ThemeColorField
                    label="Χρώμα κειμένου"
                    description="Τίτλοι, παράγραφοι και βοηθητικό κείμενο."
                    value={mainTheme.text}
                    onChange={(value) =>
                      handleMainColorChange(
                        "text",
                        value
                      )
                    }
                  />
                </div>

                <div
                  className="mt-8 rounded-3xl border p-6 md:p-8"
                  style={{
                    backgroundColor:
                      generatedTheme.background,
                    borderColor: generatedTheme.border,
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: generatedTheme.muted,
                    }}
                  >
                    Προεπισκόπηση
                  </p>

                  <div
                    className="mt-4 rounded-2xl border p-6 shadow-sm"
                    style={{
                      backgroundColor:
                        generatedTheme.surface,
                      borderColor: generatedTheme.border,
                    }}
                  >
                    <h3
                      className="text-2xl font-bold"
                      style={{
                        color: generatedTheme.ink,
                      }}
                    >
                      Παράδειγμα ενότητας
                    </h3>

                    <p
                      className="mt-2"
                      style={{
                        color: generatedTheme.muted,
                      }}
                    >
                      Οι κάρτες, τα περιγράμματα, τα hover
                      χρώματα και οι απαλές αποχρώσεις
                      παράγονται αυτόματα.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="rounded-full px-5 py-2.5 text-sm font-semibold"
                        style={{
                          backgroundColor:
                            generatedTheme.primary,
                          color:
                            generatedTheme.buttonText,
                        }}
                      >
                        Κύριο κουμπί
                      </button>

                      <button
                        type="button"
                        className="rounded-full px-5 py-2.5 text-sm font-semibold"
                        style={{
                          backgroundColor:
                            generatedTheme.accent,
                          color: getReadablePreviewText(
                            generatedTheme.accent
                          ),
                        }}
                      >
                        Δευτερεύον κουμπί
                      </button>
                    </div>

                    <div
                      className="mt-5 rounded-xl border p-4"
                      style={{
                        backgroundColor:
                          generatedTheme.accentSoft,
                        borderColor:
                          generatedTheme.border,
                      }}
                    >
                      <p
                        className="m-0 text-sm"
                        style={{
                          color: generatedTheme.ink,
                        }}
                      >
                        Παράδειγμα απαλού ενημερωτικού
                        στοιχείου.
                      </p>
                    </div>
                  </div>
                </div>

                {themeError && (
                  <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {themeError}
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={themeSaving}
                    className={[
                      "rounded-full px-6 py-2.5 text-sm font-medium transition",
                      "text-[rgb(var(--button-text))]",
                      themeSaving
                        ? "cursor-wait bg-[rgba(var(--primary),0.65)]"
                        : "bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary-dark))]",
                    ].join(" ")}
                  >
                    {themeSaving
                      ? "Αποθήκευση χρωμάτων…"
                      : "Αποθήκευση χρωμάτων"}
                  </button>

                  <button
                    type="button"
                    onClick={handleThemeCancel}
                    disabled={themeSaving}
                    className="rounded-full border border-[rgba(var(--border),1)] bg-[rgb(var(--surface))] px-6 py-2.5 text-sm font-medium text-[rgb(var(--ink))] transition hover:bg-[rgb(var(--surface-soft))] disabled:opacity-60"
                  >
                    Ακύρωση αλλαγών
                  </button>

                  {themeSaved && (
                    <span className="text-sm text-[rgb(var(--primary))]">
                      Τα χρώματα αποθηκεύτηκαν.
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

function getReadablePreviewText(
  background: string
): string {
  const normalized = background.replace("#", "");

  const red = parseInt(normalized.substring(0, 2), 16);
  const green = parseInt(
    normalized.substring(2, 4),
    16
  );
  const blue = parseInt(
    normalized.substring(4, 6),
    16
  );

  const brightness =
    red * 0.299 + green * 0.587 + blue * 0.114;

  return brightness > 155 ? "#182018" : "#FFFFFF";
}