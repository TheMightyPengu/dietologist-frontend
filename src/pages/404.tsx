import Link from 'next/link';
import { useTranslations } from "@/components/hooks/useTranslations";

export default function NotFoundPage() {
    const t = useTranslations();
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <h1 className="text-6xl font-bold text-brand mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">{t.errors.notFound.title}</h2>
      <p className="text-lg text-gray-600 mb-8">{t.errors.notFound.description}</p>
      <Link
        href="/"
        className="px-6 py-3 bg-brand text-white rounded-xl hover:opacity-90 transition"
      >
        {t.errors.notFound.backHome}
      </Link>
    </section>
  );
}
