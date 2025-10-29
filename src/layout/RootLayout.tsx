import useHideOnScroll from "@/components/hooks/useHideOnScroll";
import TopBar from "@/components/header/TopBar";
import Navbar from "@/components/header/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hidden = useHideOnScroll({ downDelay: 12, upDelay: 8 });

  return (
    <div className="min-h-screen bg-[#F7F7EF] text-slate-800 antialiased">
      <header
        className={[
          "sticky top-0 z-50 bg-[#F7F7EF]/90 backdrop-blur shadow-sm transition-transform duration-200 will-change-transform",
          hidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        <TopBar />
        <Navbar />
      </header>

      {/* Header is ~104px tall (40 + 64). Adjust as needed. */}
      <main className="pt-[104px]">{children}</main>
    </div>
  );
}
