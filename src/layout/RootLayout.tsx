import { ReactNode } from 'react';

type Props = { children: ReactNode };

export default function RootLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-bg text-ink antialiased">
      {/* Header goes here when ready (TopBar / Navbar) */}
      <main className="min-h-[60vh]">{children}</main>
      {/* Footer goes here */}
    </div>
  );
}
