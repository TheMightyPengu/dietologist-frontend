import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CeramicImage as ProductImage } from "@/api/CeramicsController";
import CeramicImage from "./CeramicImage";
import styles from "./CeramicGallery.module.css";

export default function CeramicGallery({ images, title, labels, showcase = false }: {
  images: ProductImage[];
  title: string;
  labels: { previous: string; next: string; image: string };
  showcase?: boolean;
}) {
  const ordered = [...images].sort((first, second) => first.sortOrder - second.sortOrder || first.id - second.id);
  const [index, setIndex] = useState(0);
  const selected = index < ordered.length ? index : 0;
  const active = ordered[selected];
  const count = ordered.length;
  const arrow = showcase
    ? "grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[rgb(var(--primary-dark))] shadow-md ring-1 ring-black/5 backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 sm:h-12 sm:w-12"
    : "h-11 w-11 rounded-full bg-white/95 text-xl text-primary shadow-sm hover:bg-[rgb(var(--surface-soft))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";

  return (
    <div className={showcase ? "min-w-0 space-y-3 sm:space-y-4" : "min-w-0 space-y-3"}>
      <div className={`relative aspect-square overflow-hidden bg-[rgb(var(--surface-soft))] ${showcase ? "rounded-3xl shadow-[var(--shadow-soft)] ring-1 ring-[rgb(var(--border))]" : "rounded-2xl border border-accent/20"}`}>
        <div key={active?.id} className={`absolute inset-0 ${showcase ? styles.photo : ""}`}>
          <CeramicImage url={active?.imageUrl} alt={title} sizes={showcase ? "(min-width: 1280px) 675px, (min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} eager />
        </div>
        {count > 1 && (
          <div className={`pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between ${showcase ? "sm:inset-x-5" : ""}`}>
            <button type="button" aria-label={labels.previous} onClick={() => setIndex((selected + count - 1) % count)} className={`pointer-events-auto ${arrow}`}>
              {showcase ? <ChevronLeft size={22} aria-hidden="true" /> : "←"}
            </button>
            <button type="button" aria-label={labels.next} onClick={() => setIndex((selected + 1) % count)} className={`pointer-events-auto ${arrow}`}>
              {showcase ? <ChevronRight size={22} aria-hidden="true" /> : "→"}
            </button>
          </div>
        )}
      </div>
      {count > 1 && (
        <ul className={`flex overflow-x-auto ${showcase ? "gap-3 px-1.5 pt-1.5 pb-2 sm:gap-4" : "gap-2 px-1 py-1"}`}>
          {ordered.map((image, position) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                aria-label={`${labels.image} ${position + 1}`}
                aria-pressed={position === selected}
                onClick={() => setIndex(position)}
                className={showcase
                  ? `relative block h-16 w-16 overflow-hidden rounded-xl bg-[rgb(var(--surface-soft))] ring-offset-[rgb(var(--bg))] transition-[box-shadow,opacity] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:h-20 sm:w-20 ${position === selected ? "ring-2 ring-primary ring-offset-2" : "opacity-80 ring-1 ring-[rgb(var(--border))] hover:opacity-100 hover:ring-primary/60"}`
                  : `relative block h-16 w-16 overflow-hidden rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${position === selected ? "border-primary ring-1 ring-primary" : "border-accent/20 hover:border-primary"}`}
              >
                <CeramicImage url={image.imageUrl} alt="" sizes={showcase ? "(min-width: 640px) 80px, 64px" : "64px"} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
