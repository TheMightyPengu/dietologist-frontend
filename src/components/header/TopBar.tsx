import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ContactInfoApi,
  type ContactInfoGetDto,
} from "@/api/ContactInfoController";

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
  const [contactInfo, setContactInfo] = useState<ContactInfoGetDto | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const items = await ContactInfoApi.list();

        if (!mounted) return;

        // Assuming backend returns one active contact info item.
        // If later there are many, replace this selection logic accordingly.
        setContactInfo(items?.[0] ?? null);
      } catch (error) {
        console.error("Failed to load contact info:", error);
        // Keep fallback UI values if API fails
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const socials: SocialLink[] = useMemo(
    () => [
      {
        label: "Instagram",
        href: "https://www.instagram.com/diet.out.of.the.box?igsh=ZnRwZmE4YjB0ZG01",
        icon: Icon.Instagram,
      },
      {
        label: "Spotify",
        href: "https://open.spotify.com/show/17B6Yqxjuwy5Sryffoa5oC",
        icon: Icon.Spotify,
      },
    ],
    [],
  );

  const phone = contactInfo?.telephone || "+30 210 0000000";
  const email = contactInfo?.email || "hello@dietitian.gr";

  // Location exists in backend response but is not used in this TopBar yet.
  // const location = contactInfo?.location || "";

  return (
    <div
      className={[
        "relative w-full z-10 backdrop-blur",
        "bg-bg supports-[backdrop-filter]:bg-bg/85",
        "border-b border-accent/15",
        "px-6",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between h-11 text-[12px]">
        <div className="flex items-center gap-3 whitespace-nowrap text-slate-600">
          <a
            href={`tel:${phone.replace(/\s+/g, "")}`}
            className={[
              "flex items-center gap-2 rounded-md px-2 py-1 transition",
              "text-slate-600 hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            ].join(" ")}
          >
            <span className="text-slate-500">{Icon.Phone}</span>
            <span className="hidden sm:inline">{phone}</span>
          </a>

          <span className="hidden sm:inline h-4 w-px bg-accent/25" />

          <a
            href={`mailto:${email}`}
            className={[
              "flex items-center gap-2 rounded-md px-2 py-1 transition",
              "text-slate-600 hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            ].join(" ")}
          >
            <span className="text-slate-500">{Icon.Mail}</span>
            <span className="hidden md:inline">{email}</span>
          </a>
        </div>

        <div className="flex items-center gap-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full transition",
                "bg-white/70 text-slate-600 ring-1 ring-accent/20",
                "hover:bg-accent/10 hover:text-accent hover:ring-accent/30",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
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
