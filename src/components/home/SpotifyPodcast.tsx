import { SectionReveal } from "@/components/SectionReveal";
import { useTranslations } from "@/components/hooks/useTranslations";

export default function SpotifyPodcast() {
  const t = useTranslations();
  return (
    <SectionReveal className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Podcast
          </span>

          <span className="h-px w-8 bg-accent/50" />
        </div>

        <h2 className="mt-2 text-xl md:text-2xl font-semibold text-slate-900">
          Diet out of the Box
        </h2>

        <p className="mt-2 text-sm md:text-base text-slate-600 leading-6">
          {t.home.podcast.description}
        </p>
      </div>

      <div
        className="
          overflow-hidden rounded-2xl
          ring-1 ring-black/5
          shadow-[0_10px_24px_rgba(15,23,42,0.08)]
        "
      >
        <iframe
          src="https://open.spotify.com/embed/show/17B6Yqxjuwy5Sryffoa5oC"
          width="100%"
          height="232"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Diet out of the Box podcast"
          className="block w-full"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <a
          href="https://open.spotify.com/show/17B6Yqxjuwy5Sryffoa5oC"
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2
            text-sm font-semibold text-primary
            transition hover:text-accent
          "
        >
          {t.home.podcast.listen}
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </SectionReveal>
  );
}
