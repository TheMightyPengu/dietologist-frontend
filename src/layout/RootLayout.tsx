import useHideOnScroll from "@/components/hooks/useHideOnScroll";
import TopBar from "@/components/header/TopBar";
import Navbar from "@/components/header/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hidden = useHideOnScroll({
    downDelay: 16,
  });

  return (
    <div className="min-h-screen bg-bg text-slate-800 antialiased">
      <header
        className={[
          "fixed inset-x-0 top-0 z-50",
          "bg-bg/90 backdrop-blur shadow-sm",
          "transition-transform duration-200 ease-out",
          "will-change-transform",
          hidden ? "-translate-y-full" : "translate-y-0",
        ].join(" ")}
      >
        <TopBar />
        <Navbar />
      </header>

      {/* Space occupied by TopBar + Navbar */}
      <div
        aria-hidden="true"
        className="h-[108px] md:h-[124px]"
      />

      <main className="overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}