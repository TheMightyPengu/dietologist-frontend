import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import LeafBurstButton from "../decorative/LeafBurstButton";
import { NavbarApi, type NavbarGetDto } from "@/api/NavbarController";
import { ProvidedServicesApi } from "@/api/ProvidedServicesController";
import { toMediaUrl } from "@/api/_axios-client";

type MenuItem = {
  label: string;
  href?: string;
  children?: { label: string; href: string; desc?: string }[];
};

const DEFAULT_NAVBAR: NavbarGetDto = {
  id: 1,
  title: "Dietitian",
  imageUrl: "/logo.svg",
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
    children: [],
  },
  { label: "ΣΕΜΙΝΑΡΙΑ", href: "/seminars" },
  { label: "EBOOK", href: "/ebook" },
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
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.17l3.71-2.94a.75.75 0 111.06 1.06l-4.24 3.36a.75.75 0 01-.94 0L5.25 8.29a.75.75 0 01-.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function stripHash(href: string) {
  return href.split("#")[0] || "/";
}

function getServiceCategoryAnchor(category: string) {
  const normalized = category.trim().toLowerCase().replace(/\s+/g, "-");
  return `service-category-${encodeURIComponent(
    normalized || "loipes-ypiresies",
  )}`;
}

function formatServiceCategoryLabel(category: string) {
  return category
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ς/g, "σ")
    .toLocaleUpperCase("el-GR");
}

function getUniqueServiceCategories(
  services: Awaited<ReturnType<typeof ProvidedServicesApi.list>>,
) {
  const seen = new Set<string>();

  for (const service of services) {
    const category = service.category?.trim();

    if (category) {
      seen.add(category);
    }
  }

  return Array.from(seen);
}

export default function Navbar() {
  const router = useRouter();
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuMounted, setMobileMenuMounted] = useState(false);
  const [navbar, setNavbar] = useState<NavbarGetDto>(DEFAULT_NAVBAR);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const navRef = useRef<HTMLDivElement>(null);

  const navItems = useMemo<MenuItem[]>(() => {
    return NAV.map((item) => {
      if (item.label !== "ΥΠΗΡΕΣΙΕΣ") return item;

      return {
        ...item,
        children: serviceCategories.map((category) => ({
          label: formatServiceCategoryLabel(category),
          href: `/services#${getServiceCategoryAnchor(category)}`,
        })),
      };
    });
  }, [serviceCategories]);

  useEffect(() => {
    let active = true;

    async function loadNavbar() {
      try {
        const data = await NavbarApi.getSingle();

        if (!active) return;

        setNavbar({
          id: data?.id ?? DEFAULT_NAVBAR.id,
          title: data?.title?.trim() || DEFAULT_NAVBAR.title,
          imageUrl: data?.imageUrl?.trim() || DEFAULT_NAVBAR.imageUrl,
        });
      } catch (error) {
        console.error(error);
      }
    }

    loadNavbar();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (mobileOpen) {
      setMobileMenuMounted(true);
    } else {
      timeoutId = setTimeout(() => {
        setMobileMenuMounted(false);
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    let active = true;

    async function loadServiceCategories() {
      try {
        const data = await ProvidedServicesApi.list();

        if (!active) return;

        setServiceCategories(
          Array.isArray(data) ? getUniqueServiceCategories(data) : [],
        );
      } catch (error) {
        console.error(error);
        if (active) setServiceCategories([]);
      }
    }

    loadServiceCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) setOpenIdx(null);
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  useEffect(() => {
    setOpenIdx(null);
    setMobileOpen(false);
  }, [router.asPath]);

  const closeAll = () => {
    setOpenIdx(null);
    setMobileOpen(false);
  };

  const isItemActive = (item: MenuItem) => {
    if (!item.href) return false;

    const itemPath = stripHash(item.href);
    const currentPath = stripHash(router.asPath);

    if (itemPath === "/") return currentPath === "/";

    return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
  };

  return (
    <div
      className={[
        "relative w-full z-20 backdrop-blur",
        "bg-bg supports-[backdrop-filter]:bg-bg/90",
        "border-b border-accent/20",
        "px-5",
      ].join(" ")}
    >
      <div ref={navRef} className="mx-auto max-w-7xl px-3">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <button
            className={[
              "md:hidden inline-flex items-center justify-center rounded-md p-2 transition",
              "text-slate-700",
              "hover:bg-accent/10 hover:text-accent",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            ].join(" ")}
            aria-label="Άνοιγμα μενού"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              {mobileOpen ? (
                <path
                  d="M6 6l12 12M6 18L18 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>

          <Link
            href="/"
            className="flex items-baseline gap-2 md:items-center md:gap-2"
            onClick={closeAll}
          >
            <Image
              src={
                navbar.imageUrl.startsWith("/media")
                  ? toMediaUrl(navbar.imageUrl)
                  : navbar.imageUrl
              }
              alt={`${navbar.title} Logo`}
              width={44}
              height={44}
              unoptimized
              className="h-9 w-9 md:h-14 md:w-14 rounded-full ring-2 ring-accent/25 bg-white/90 object-cover"
            />

            <span className="text-sm md:text-lg font-semibold tracking-tight text-slate-800 leading-none">
              {navbar.title}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item, idx) => {
              const hasChildren = !!item.children?.length;
              const isOpen = openIdx === idx;
              const active = isItemActive(item);
              const isServicesMenu = item.label === "ΥΠΗΡΕΣΙΕΣ";

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasChildren && setOpenIdx(idx)}
                  onMouseLeave={() => hasChildren && setOpenIdx(null)}
                >
                  <div className="group inline-flex items-center gap-1 rounded-md px-1">
                    <Link
                      href={item.href || "#"}
                      className={[
                        "relative inline-flex items-center rounded-md px-3 py-2 text-sm md:text-[15px] transition navbar-link",
                        "font-semibold tracking-[0.06em]",
                        active
                          ? "text-accent"
                          : "text-primary hover:text-accent",
                        "hover:bg-accent/10",
                        active
                          ? "after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-accent"
                          : "",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                      ].join(" ")}
                      onClick={closeAll}
                    >
                      {item.label}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        aria-haspopup="menu"
                        aria-expanded={isOpen}
                        aria-label={`${item.label} υπομενού`}
                        className={[
                          "inline-flex items-center rounded-md px-1.5 py-2 transition",
                          "text-slate-600",
                          "hover:text-accent hover:bg-accent/10",
                          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                        ].join(" ")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenIdx(isOpen ? null : idx);
                        }}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {hasChildren && isOpen && (
                    <div
                      role="menu"
                      className={[
                        "absolute left-0 w-64 rounded-xl p-3 pb-4 pr-3 shadow-xl",
                        "bg-white",
                        "border border-accent/20",
                        isServicesMenu
                          ? "max-h-[23.5rem] overflow-y-auto pr-1 [direction:rtl]"
                          : "",
                      ].join(" ")}
                    >
                      <div className="space-y-1 [direction:ltr]">
                        {item.children!.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            onClick={closeAll}
                            className={[
                              "block rounded-lg px-3 py-2.5 text-sm transition navbar-link",
                              "text-slate-700 hover:text-accent",
                              "hover:bg-accent/10",
                              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                            ].join(" ")}
                          >
                            <div className="font-medium">{child.label}</div>

                            {child.desc && (
                              <div className="text-xs text-slate-500">
                                {child.desc}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center">
            <LeafBurstButton
              text="ΚΛΕΙΣΤΕ ΡΑΝΤΕΒΟΥ"
              href="/contact/book"
              onClick={closeAll}
              size="sm"
            />
          </div>
        </div>

        {mobileMenuMounted && (
          <div
            className={[
              "fixed inset-0 z-[70] md:hidden",
              mobileOpen ? "pointer-events-auto" : "pointer-events-none",
            ].join(" ")}
            aria-hidden={!mobileOpen}
          >
            {/* Dark background overlay */}
            <button
              type="button"
              aria-label="Κλείσιμο μενού"
              onClick={closeAll}
              className={[
                "absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]",
                "transition-opacity duration-300",
                mobileOpen ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />

            {/* Side drawer */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Μενού πλοήγησης"
              className={[
                "absolute left-0 top-0 h-[100dvh] w-[min(88vw,360px)]",
                "overflow-y-auto overscroll-contain",
                "bg-bg shadow-2xl",
                "border-r border-accent/20",
                "transition-transform duration-300 ease-out",
                mobileOpen ? "translate-x-0" : "-translate-x-full",
              ].join(" ")}
            >
              <div className="flex min-h-full flex-col">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-accent/15 bg-bg/95 px-4 py-4 backdrop-blur">
                  <Link
                    href="/"
                    onClick={closeAll}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Image
                      src={
                        navbar.imageUrl.startsWith("/media")
                          ? toMediaUrl(navbar.imageUrl)
                          : navbar.imageUrl
                      }
                      alt={`${navbar.title} Logo`}
                      width={48}
                      height={48}
                      unoptimized
                      className="h-12 w-12 shrink-0 rounded-full bg-white/90 object-cover ring-2 ring-accent/25"
                    />

                    <span className="truncate text-base font-semibold text-slate-800">
                      {navbar.title}
                    </span>
                  </Link>

                  <button
                    type="button"
                    aria-label="Κλείσιμο μενού"
                    onClick={closeAll}
                    className={[
                      "ml-3 inline-flex h-11 w-11 shrink-0 items-center justify-center",
                      "rounded-xl bg-surface-soft text-accent",
                      "transition hover:bg-accent/15 hover:text-primary-dark",
                      "focus-visible:outline-none focus-visible:ring-4",
                      "focus-visible:ring-primary/25",
                    ].join(" ")}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 6l12 12M6 18L18 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>

                <nav className="flex-1 px-4 py-4">
                  <div className="overflow-hidden rounded-2xl border border-accent/15 bg-white/60">
                    {navItems.map((item, idx) => {
                      const hasChildren = !!item.children?.length;
                      const isOpen = openIdx === idx;
                      const active = isItemActive(item);
                      const isServicesMenu = item.label === "ΥΠΗΡΕΣΙΕΣ";

                      return (
                        <div
                          key={item.label}
                          className="border-t border-accent/10 first:border-t-0"
                        >
                          <div className="flex min-h-16 items-stretch">
                            <Link
                              href={item.href || "#"}
                              className={[
                                "flex flex-1 items-center px-4 py-4",
                                "text-base font-semibold tracking-[0.04em]",
                                "transition",
                                active
                                  ? "bg-accent/10 text-primary-dark"
                                  : "text-slate-800 hover:bg-accent/10 hover:text-accent",
                                "focus-visible:outline-none focus-visible:ring-4",
                                "focus-visible:ring-inset focus-visible:ring-primary/25",
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
                                  "flex w-14 items-center justify-center",
                                  "text-slate-700 transition",
                                  "hover:bg-accent/10 hover:text-accent",
                                  "focus-visible:outline-none focus-visible:ring-4",
                                  "focus-visible:ring-inset focus-visible:ring-primary/25",
                                ].join(" ")}
                                onClick={() => {
                                  setOpenIdx(isOpen ? null : idx);
                                }}
                              >
                                <ChevronDown
                                  className={[
                                    "h-5 w-5 transition-transform duration-200",
                                    isOpen ? "rotate-180" : "",
                                  ].join(" ")}
                                />
                              </button>
                            )}
                          </div>

                          {hasChildren && (
                            <div
                              className={[
                                "grid transition-[grid-template-rows] duration-300 ease-out",
                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                              ].join(" ")}
                            >
                              <div className="overflow-hidden">
                                <div
                                  className={[
                                    "border-t border-accent/10 bg-surface-soft/70",
                                    "px-3 py-3",
                                    isServicesMenu
                                      ? "max-h-[17rem] overflow-y-auto"
                                      : "",
                                  ].join(" ")}
                                >
                                  <div className="space-y-1">
                                    {item.children!.map((child) => (
                                      <Link
                                        key={child.href}
                                        href={child.href}
                                        onClick={closeAll}
                                        className={[
                                          "block rounded-xl px-4 py-3",
                                          "text-sm font-medium text-slate-700",
                                          "transition hover:bg-white hover:text-accent",
                                          "focus-visible:outline-none focus-visible:ring-4",
                                          "focus-visible:ring-primary/25",
                                        ].join(" ")}
                                      >
                                        {child.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </nav>

                <div className="border-t border-accent/15 px-4 py-5">
                  <div className="space-y-2">
                    <a
                      href="tel:+30-210-0000000"
                      className="flex min-h-12 items-center rounded-xl px-3 text-primary transition hover:bg-accent/10 hover:text-accent"
                    >
                      +30 210 0000000
                    </a>

                    <a
                      href="mailto:hello@dietitian.gr"
                      className="flex min-h-12 items-center rounded-xl px-3 text-primary transition hover:bg-accent/10 hover:text-accent"
                    >
                      hello@dietitian.gr
                    </a>
                  </div>

                  <div className="mt-4">
                    <LeafBurstButton
                      text="ΚΛΕΙΣΤΕ ΡΑΝΤΕΒΟΥ"
                      href="/contact/book"
                      onClick={closeAll}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
