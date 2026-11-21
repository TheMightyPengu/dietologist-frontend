import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useTranslations } from "@/components/hooks/useTranslations";

export default function LanguageSwitcher() {
  const router = useRouter();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const currentLocale = router.locale === "en" ? "en" : "el";

  const changeLanguage = async (locale: "el" | "en") => {
    setOpen(false);

    if (locale === currentLocale) return;

    await router.push(router.asPath, router.asPath, {
      locale,
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.common.language.change}
        className={[
          "flex h-8 items-center gap-1.5 rounded-full px-2.5",
          "bg-white/70 text-slate-700 ring-1 ring-accent/20",
          "transition",
          "hover:bg-accent/10 hover:text-accent hover:ring-accent/30",
          "focus-visible:outline-none focus-visible:ring-4",
          "focus-visible:ring-primary/25",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        ].join(" ")}
      >
        <span className="text-base leading-none">
          {currentLocale === "el" ? "🇬🇷" : "🇺🇸"}
        </span>

        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={[
            "h-3.5 w-3.5 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.25 8.29a.75.75 0 01-.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className={[
            "absolute right-0 top-full z-50 mt-2",
            "min-w-[150px] overflow-hidden rounded-xl",
            "bg-white shadow-lg ring-1 ring-accent/20",
            "p-1.5",
          ].join(" ")}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => changeLanguage("el")}
            className={[
              "flex w-full items-center gap-3 rounded-lg px-3 py-2",
              "text-left text-sm transition",
              currentLocale === "el"
                ? "bg-accent/10 font-semibold text-primary-dark"
                : "text-slate-700 hover:bg-accent/10 hover:text-accent",
            ].join(" ")}
          >
            <span className="text-base">🇬🇷</span>
            <span>{t.common.language.greek}</span>
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => changeLanguage("en")}
            className={[
              "flex w-full items-center gap-3 rounded-lg px-3 py-2",
              "text-left text-sm transition",
              currentLocale === "en"
                ? "bg-accent/10 font-semibold text-primary-dark"
                : "text-slate-700 hover:bg-accent/10 hover:text-accent",
            ].join(" ")}
          >
            <span className="text-base">🇺🇸</span>
            <span>{t.common.language.english}</span>
          </button>
        </div>
      )}
    </div>
  );
}
