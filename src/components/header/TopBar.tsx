import { useMemo } from "react";
import type { ReactNode } from "react";


type SocialLink = {
  label: string;
  href: string;
  icon: ReactNode;
};

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
};

export default function TopBar() {
  const socials: SocialLink[] = useMemo(
    () => [
      { label: "Instagram", href: "#", icon: Icon.Instagram },
      { label: "Facebook", href: "#", icon: Icon.Facebook },
      { label: "YouTube", href: "#", icon: Icon.YouTube },
      { label: "TikTok", href: "#", icon: Icon.TikTok },
    ],
    []
  );

  return (
    <div className="w-full bg-[rgba(255,255,255,0.7)] backdrop-blur sticky top-0 z-50 border-b border-[rgba(122,122,196,0.15)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2 text-sm">
        <div className="flex items-center gap-4 text-[13px]">
          <a href="tel:+30-210-0000000" className="flex items-center gap-2 text-slate-700 hover:text-[#7a7ac4]">
            {Icon.Phone}
            <span className="hidden sm:inline">+30 210 0000000</span>
          </a>
          <span className="hidden sm:inline text-slate-300">|</span>
          <a href="mailto:hello@dietitian.gr" className="flex items-center gap-2 text-slate-700 hover:text-[#7a7ac4]">
            {Icon.Mail}
            <span className="hidden sm:inline">hello@dietitian.gr</span>
          </a>
        </div>

        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-[#7a7ac4] ring-1 ring-[#7a7ac4]/20 hover:bg-[#7a7ac4] hover:text-white transition"
            >
              {s.icon}
            </a>
          ))}
          <a
            href="#book"
            className="ml-1 hidden sm:inline-flex items-center rounded-full bg-[#7a7ac4] px-3 py-1.5 text-white hover:opacity-90"
          >
            Κλείστε ραντεβού
          </a>
        </div>
      </div>
    </div>
  );
}
