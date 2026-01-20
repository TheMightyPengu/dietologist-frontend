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
      { label: "ΒΙΟΓΡΑΦΙΚΟ", href: "/#bio" },
      { label: "ΦΙΛΟΣΟΦΙΑ", href: "/#philosophy" },
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
    href: "/articles",
    children: [
      { label: "ΑΡΘΡΑ", href: "/articles" },
      { label: "ΣΥΝΤΑΓΕΣ", href: "/recipes" },
    ],
  },
  {
    label: "ΕΠΙΚΟΙΝΩΝΙΑ",
    href: "/contact/book",
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
    <div
      className={[
        "w-full sticky top-[40px] sm:top-[40px] z-40 backdrop-blur",
        "bg-white/80 supports-[backdrop-filter]:bg-white/60",
        // GREEN used more for borders/dividers
        "border-b border-accent/20",
        "px-5",
      ].join(" ")}
    >
      <div ref={navRef} className="mx-auto max-w-7xl px-3">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={closeAll}>
            <img
              src="/logo.svg"
              alt="Dietitian Logo"
              // logo ring uses GREEN (more usage), purple reserved for key actions
              className="h-9 w-9 rounded-full ring-2 ring-accent/25"
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
                    {/* Label navigates */}
                    <Link
                      href={item.href || "#"}
                      className={[
                        "inline-flex items-center rounded-md px-3 py-2 text-[15px] font-medium transition navbar-link",
                        // Links are purple default, green on hover
                        "text-primary hover:text-accent",
                        // Subtle hover background: green tint (use green more)
                        "hover:bg-accent/10",
                        // Focus ring for navbar links
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                      ].join(" ")}
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>

                    {/* Chevron toggler (dropdown only) */}
                    {hasChildren && (
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        aria-label={`${item.label} υπομενού`}
                        className={[
                          "inline-flex items-center rounded-md px-1.5 py-2 transition",
                          "text-slate-600",
                          // Green hover tint + green text on hover
                          "hover:text-accent hover:bg-accent/10",
                          // Focus ring in purple (high-focus)
                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                        ].join(" ")}
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
                      className={[
                        "absolute left-0 w-64 rounded-xl p-2 shadow-xl",
                        "bg-white",
                        // green border (more usage)
                        "border border-accent/20",
                      ].join(" ")}
                    >
                      {item.children!.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          onClick={closeAll}
                          className={[
                            "block rounded-lg px-3 py-2 text-[14px] transition navbar-link",
                            // keep readable, but follow link rules
                            "text-slate-700 hover:text-accent",
                            // green-tinted hover background
                            "hover:bg-accent/10",
                            // Focus ring for navbar links
                            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                          ].join(" ")}
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

          {/* Right: CTA (desktop) — Primary action stays PURPLE */}
          <div className="hidden md:flex">
            <Link
              href="/contact/book"
              className={[
                "rounded-full px-4 py-2 text-sm font-medium text-white shadow transition",
                // primary CTA = purple
                "bg-primary hover:bg-primary/90",
                // focus ring purple (consistent)
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
              ].join(" ")}
              onClick={closeAll}
            >
              Κλείστε ραντεβού
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={[
              "md:hidden inline-flex items-center justify-center rounded-md p-2 transition",
              "text-slate-700",
              // green hover background to increase green usage
              "hover:bg-accent/10 hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
            ].join(" ")}
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
                <div key={item.label} className="border-t border-accent/15">
                  <div className="flex w-full items-stretch justify-between px-2 py-1">
                    <Link
                      href={item.href || "#"}
                      className={[
                        "flex-1 rounded-md px-2 py-2 text-[15px] font-medium transition navbar-link",
                        // purple default, green on hover
                        "text-primary hover:text-accent hover:bg-accent/10",
                        // Focus ring for navbar links
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                      ].join(" ")}
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`${item.label} υπομενού`}
                        className={[
                          "ml-1 rounded-md px-3 py-2 transition",
                          // green hover tint
                          "text-slate-700 hover:text-accent hover:bg-accent/10",
                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                        ].join(" ")}
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
                          className={[
                            "block rounded-lg px-3 py-2 text-[14px] transition",
                            "text-slate-700 hover:text-accent hover:bg-accent/10",
                          ].join(" ")}
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
                className={[
                  "block w-full rounded-full px-4 py-2 text-center text-sm font-medium text-white transition",
                  // primary CTA = purple
                  "bg-primary hover:bg-primary/90",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25",
                ].join(" ")}
                onClick={closeAll}
              >
                Κλείστε ραντεβού
              </Link>
            </div>

            {/* Optional secondary action (green) — uncomment if you want balance on mobile
            <div className="px-2 pt-2">
              <Link
                href="/contact/form"
                className="block w-full rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-center text-sm font-medium text-accent hover:bg-accent/15"
                onClick={closeAll}
              >
                Φόρμα επικοινωνίας
              </Link>
            </div>
            */}
          </div>
        )}
      </div>
    </div>
  );
}
