import { ReactNode } from "react";
import TopBar from "@/components/header/TopBar";
import Navbar from "@/components/header/Navbar";

type Props = { children: ReactNode };

export default function RootLayout({ children }: Props) {
  // TopBar ~40px tall, Navbar ~64px tall → add ~104px top padding for page content
  return (
    <div className="min-h-screen bg-[#F7F7EF] text-slate-800 antialiased">
      <header>
        <TopBar />
        <Navbar />
      </header>

      {/* Leave room for the sticky bars */}
      <main className="pt-28 md:pt-[7.25rem] min-h-[60vh] relative overflow-x-clip">
        {children}
      </main>

      {/* TODO: <Footer /> */}
    </div>
  );
}
