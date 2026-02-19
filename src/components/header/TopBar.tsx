import { useMemo } from "react";
import type { ReactNode } from "react";

type SocialLink = { label: string; href: string; icon: ReactNode };

const Icon = {
  Instagram: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a5.5 5.5 0 1 1 0 11.001A5.5 5.5 0 0 1 12 7.5zm0 2a3.5 3.5 0 1 0 .001 7.001A3.5 3.5 0 0 0 12 9.5zM18.25 6a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"
        fill="currentColor"
      />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M13 22v-8h3l1-4h-4V7.5A1.5 1.5 0 0 1 14.5 6H17V2h-3.5A5.5 5.5 0 0 0 8 7.5V10H5v4h3v8h5z"
        fill="currentColor"
      />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M23.5 6.2a3.1 3.1 0 0 0-2.2-2.2C19.1 3.5 12 3.5 12 3.5s-7.1 0-9.3.5A3.1 3.1 0 0 0 .5 6.2 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.8 3.1 3.1 0 0 0 2.2 2.2c2.2.5 9.3.5 9.3.5s7.1 0 9.3-.5a3.1 3.1 0 0 0 2.2-2.2A32 32 0 0 0 24 12a32 32 0 0 0-.5-5.8zM9.75 15.5v-7l6 3.5-6 3.5z"
        fill="currentColor"
      />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M14.5 3a6.5 6.5 0 0 0 5 2V8a8.6 8.6 0 0 1-5-1.6V14a5 5 0 1 1-5-5c.35 0 .69.03 1 .1v3.02a2 2 0 1 0 2 2V3h2z"
        fill="currentColor"
      />
    </svg>
  ),
  Phone: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1.02-.24 11.6 11.6 0 0 0 3.64.58 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 8a1 1 0 0 1 1-1h3.46a1 1 0 0 1 1 1 11.6 11.6 0 0 0 .58 3.64 1 1 0 0 1-.24 1.02L6.6 10.8z"
        fill="currentColor"
      />
    </svg>
  ),
  Mail: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v.3l-10 6.25L2 6.3V6zm0 2.7V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.7l-10 6.25L2 8.7z"
        fill="currentColor"
      />
    </svg>
  ),
  Spotify: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-12.061-1.411-.479.12-1.02-.12-1.14-.6-.12-.479.12-1.021.6-1.141C9.6 9.9 15.079 10.561 18.739 12.84c.361.21.599.659.301 1.1zm.179-3.362c-3.9-2.32-10.661-2.582-15.021-1.408-.479.12-1.02-.179-1.14-.679-.12-.499.179-1.02.679-1.14 4.8-1.271 11.921-.979 16.261 1.62.36.21.599.923.421 1.403-.179.419-.899.599-1.279.419z"
        fill="currentColor"
      />
    </svg>
  ),
};

export default function TopBar() {
  const socials: SocialLink[] = useMemo(
    () => [
      { label: "Instagram", href: "#", icon: Icon.Instagram },
      { label: "Spotify", href: "#", icon: Icon.Spotify },
    ],
    []
  );

  return (
    <div
      className={[
        // keep neutral surface, use GREEN more in borders/dividers
        "w-full sticky top-0 z-50 backdrop-blur",
        "bg-bg",
        "border-b border-accent/25",
        "px-6",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between py-2 text-sm">
        {/* Left: contact info */}
        <div className="flex items-center gap-4 whitespace-nowrap text-[13px] text-slate-700">
          <a
            href="tel:+30-210-0000000"
            className={[
              "flex items-center gap-2 transition",
              // links are purple, hover goes green (your rules)
              "text-primary hover:text-accent",
            ].join(" ")}
          >
            <span className="text-accent">{Icon.Phone}</span>
            <span className="hidden sm:inline">+30 210 0000000</span>
          </a>

          <span className="hidden sm:inline text-accent/30">|</span>

          <a
            href="mailto:hello@dietitian.gr"
            className={[
              "flex items-center gap-2 transition",
              "text-primary hover:text-accent",
            ].join(" ")}
          >
            <span className="text-accent">{Icon.Mail}</span>
            <span className="hidden md:inline">hello@dietitian.gr</span>
          </a>
        </div>

        {/* Right: social icons */}
        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full transition",
                // GREEN is the default accent (more usage)
                "bg-white/80 text-accent ring-1 ring-accent/25",
                // On hover, emphasize with PURPLE fill (rare but high-focus)
                "hover:bg-primary hover:text-white hover:ring-primary/25",
                // nice focus ring in purple
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
              ].join(" ")}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
