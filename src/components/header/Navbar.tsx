import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string; desc?: string }[];
};

const NAV: MenuItem[] = [
  {
    label: "ΑΡΧΙΚΗ",
    href: "/",
    children: [
      { label: "ΦΙΛΟΣΟΦΙΑ", href: "/philosophy" },
      { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/bio" },
    ],
  },
  {
    label: "ΥΠΗΡΕΣΙΕΣ",
    href: "/services",
    children: [
      { label: "1:1 ΡΑΝΤΕΒΟΥ", href: "/services#one-to-one" },
      { label: "ΟΜΑΔΙΚΕΣ ΣΥΝΑΝΤΗΣΕΙΣ", href: "/services#groups" },
    ],
  },
  { label: "ΣΕΜΙΝΑΡΙΑ", href: "/seminars" },
  { label: "ΕΒΟΟΚ", href: "/ebook" },
  {
    label: "BLOG",
    href: "/blog",
    children: [
      { label: "ΑΡΘΡΑ", href: "/blog/articles" },
      { label: "ΣΥΝΤΑΓΕΣ", href: "/recipes" },
    ],
  },
  {
    label: "ΕΠΙΚΟΙΝΩΝΙΑ",
    href: "/contact",
    children: [
      { label: "ΚΛΕΙΣΤΕ ΡΑΝΤΕΒΟΥ", href: "/contact/book" },
      { label: "ΦΟΡΜΑ ΕΠΙΚΟΙΝΩΝΙΑΣ", href: "/contact/form" },
    ],
  },
];

function ChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.25 8.29a.75.75 0 01-.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Navbar() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenIdx(null);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const closeAll = () => {
    setOpenIdx(null);
    setMobileOpen(false);
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-[40px] sm:top-[40px] z-40 border-b border-slate-100 px-5">
      <div ref={navRef} className="mx-auto max-w-7xl px-3">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeAll}>
            <img
              src="/logo.svg"
              alt="Dietitian Logo"
              className="h-9 w-9 rounded-full ring-2 ring-[#7a7ac4]/20"
            />
            <span className="font-semibold tracking-tight text-slate-800">Dietitian</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            {NAV.map((item, idx) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openIdx === idx;

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenIdx(idx)}
                  onMouseLeave={() => hasChildren && setOpenIdx(null)}
                >
                  <div className="group inline-flex items-center gap-1 rounded-md px-1">
                    {/* Label always navigates */}
                    <Link
                      href={item.href || "#"}
                      className="inline-flex items-center rounded-md px-3 py-2 text-[15px] font-medium text-slate-700 hover:text-[#7a7ac4] hover:bg-[#7a7ac4]/5"
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>

                    {/* Separate chevron toggler (only if dropdown) */}
                    {hasChildren && (
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        aria-label={`${item.label} υπομενού`}
                        className="inline-flex items-center rounded-md px-1.5 py-2 text-slate-600 hover:text-[#7a7ac4] hover:bg-[#7a7ac4]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenIdx(isOpen ? null : idx);
                        }}
                      >
                        <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>

                  {hasChildren && isOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 w-64 rounded-xl border border-slate-150 bg-white p-2 shadow-xl"
                    >
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-[14px] text-slate-700 hover:bg-[#7a7ac4]/5 hover:text-[#7a7ac4]"
                          role="menuitem"
                          onClick={closeAll}
                        >
                          <div className="font-medium">{child.label}</div>
                          {child.desc && <div className="text-xs text-slate-500">{child.desc}</div>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: CTA (desktop) */}
          <div className="hidden md:flex">
            <Link
              href="/contact/book"
              className="rounded-full bg-[#7a7ac4] px-4 py-2 text-sm font-medium text-white shadow hover:opacity-90"
              onClick={closeAll}
            >
              Κλείστε ραντεβού
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-[#7a7ac4]/10"
            aria-label="Άνοιγμα μενού"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {mobileOpen ? (
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3">
            {NAV.map((item, idx) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openIdx === idx;
              return (
                <div key={item.label} className="border-t border-slate-100">
                  <div className="flex w-full items-stretch justify-between px-2 py-1">
                    {/* Label always navigates on mobile too */}
                    <Link
                      href={item.href || "#"}
                      className="flex-1 rounded-md px-2 py-2 text-[15px] font-medium text-slate-800"
                      onClick={() => {
                        closeAll();
                      }}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`${item.label} υπομενού`}
                        className="ml-1 rounded-md px-3 py-2 text-slate-700 hover:bg-[#7a7ac4]/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenIdx(isOpen ? null : idx);
                        }}
                      >
                        <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  {hasChildren && isOpen && (
                    <div className="px-2 pb-2">
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-lg px-3 py-2 text-[14px] text-slate-700 hover:bg-[#7a7ac4]/10"
                          onClick={closeAll}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="px-2 pt-3">
              <Link
                href="/contact/book"
                className="block w-full rounded-full bg-[#7a7ac4] px-4 py-2 text-center text-sm font-medium text-white"
                onClick={closeAll}
              >
                Κλείστε ραντεβού
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
