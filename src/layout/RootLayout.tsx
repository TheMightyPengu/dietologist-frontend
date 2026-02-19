import useHideOnScroll from "@/components/hooks/useHideOnScroll";
import TopBar from "@/components/header/TopBar";
import Navbar from "@/components/header/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hidden = useHideOnScroll({ downDelay: 12, upDelay: 8 });

  return (
    <div className="min-h-screen bg-bg text-slate-800 antialiased overflow-x-hidden">
      <header
        className={[
          "sticky top-0 z-50 bg-bg/90 backdrop-blur shadow-sm transition-transform duration-200 will-change-transform",
          hidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        <TopBar />
        <Navbar />
      </header>

      {/* Header height spacing: give main content room below the sticky header */}
      <main className="pt-20 md:pt-24">{children}</main>
    </div>
  );
}
