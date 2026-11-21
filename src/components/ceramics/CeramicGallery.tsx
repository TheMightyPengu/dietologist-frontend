import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { CeramicImage as ProductImage } from "@/api/CeramicsController";
import CeramicImage from "./CeramicImage";
import styles from "./CeramicGallery.module.css";

export default function CeramicGallery({ images, title, labels, showcase }: {
  images: ProductImage[];
  title: string;
  labels: { previous: string; next: string; image: string };
  showcase?: { expand: string; close: string };
}) {
  const ordered = [...images].sort((first, second) => first.sortOrder - second.sortOrder || first.id - second.id);
  const [index, setIndex] = useState(0);
  const selected = index < ordered.length ? index : 0;
  const active = ordered[selected];
  const count = ordered.length;
  const rail = useRef<HTMLUListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const arrow = "h-11 w-11 rounded-full bg-white/95 text-xl text-primary shadow-sm hover:bg-[rgb(var(--surface-soft))] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40";
  const control = "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const stageControl = `${control} border-[rgb(var(--border))] bg-white text-[rgb(var(--primary-dark))] hover:bg-[rgb(var(--surface-soft))] focus-visible:outline-primary`;
  const dialogControl = `${control} border-white/25 bg-white/10 text-white hover:bg-white/20 focus-visible:outline-white`;

  function step(direction: number) {
    setIndex((current) => ((current < count ? current : 0) + direction + count) % count);
  }

  useEffect(() => {
    const strip = rail.current;
    const item = strip?.children[selected];
    if (!strip || !item) return;

    const viewport = strip.getBoundingClientRect();
    const thumbnail = item.getBoundingClientRect();
    strip.scrollBy({
      left: thumbnail.left < viewport.left ? thumbnail.left - viewport.left
        : Math.max(0, thumbnail.right - viewport.right + 6),
      top: thumbnail.top < viewport.top ? thumbnail.top - viewport.top
        : Math.max(0, thumbnail.bottom - viewport.bottom + 6),
    });
  }, [selected]);

  function renderControls(className: string) {
    return (
      <div className="flex items-center gap-2">
        <button type="button" aria-label={labels.previous} onClick={() => step(-1)} className={className}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <span aria-live="polite" className="min-w-12 text-center text-xs font-medium tabular-nums">{selected + 1} / {count}</span>
        <button type="button" aria-label={labels.next} onClick={() => step(1)} className={className}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
    );
  }

  if (showcase) {
    return (
      <div className={`min-w-0 ${count > 1 ? "lg:grid lg:grid-cols-[5.5rem_minmax(0,1fr)] lg:gap-4" : ""}`}>
        <div className="flex min-w-0 flex-col items-center lg:col-start-2 lg:row-start-1">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-label={showcase.expand}
            onClick={() => dialog.current?.showModal()}
            className="group relative block max-w-full cursor-zoom-in rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <span key={active?.id} className={`grid justify-items-center ${styles.photo}`}>
              <CeramicImage url={active?.imageUrl} alt={title} sizes="(min-width: 1024px) 48vw, 100vw" fit="natural" eager />
            </span>
            <span className="pointer-events-none absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-white/95 text-[rgb(var(--primary-dark))] shadow-sm transition-colors group-hover:bg-[rgb(var(--accent-soft))] sm:right-4 sm:top-4">
              <Maximize2 size={17} aria-hidden="true" />
            </span>
          </button>
          {count > 1 && (
            <div className="mt-3 text-[rgb(var(--primary-dark))]">
              {renderControls(stageControl)}
            </div>
          )}
        </div>

        {count > 1 && (
          <div className="relative mt-2 min-w-0 lg:col-start-1 lg:row-start-1 lg:mt-0">
            <ul ref={rail} className="flex gap-3 overflow-x-auto overscroll-contain px-1.5 py-1.5 lg:absolute lg:inset-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto">
              {ordered.map((image, position) => (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    aria-label={`${labels.image} ${position + 1}`}
                    aria-pressed={position === selected}
                    onClick={() => setIndex(position)}
                    className={`relative block h-14 w-14 overflow-hidden rounded-xl bg-[rgb(var(--surface-soft))] ring-offset-2 ring-offset-[rgb(var(--bg))] transition-[box-shadow,opacity] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${position === selected ? "ring-2 ring-primary" : "opacity-80 ring-1 ring-[rgb(var(--border))] hover:opacity-100 hover:ring-primary/60"}`}
                  >
                    <CeramicImage url={image.imageUrl} alt="" sizes="56px" fit="contain" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <dialog
          ref={dialog}
          aria-label={`${showcase.expand}: ${title}`}
          className="m-auto max-h-none w-full max-w-none overflow-hidden rounded-none bg-[#22251f] p-0 text-white backdrop:bg-black/85 sm:w-[calc(100%-2rem)] sm:max-w-[76rem] sm:rounded-3xl"
          onKeyDown={(event) => {
            if (count > 1 && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
              event.preventDefault();
              step(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          <div className="grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)_auto] gap-3 p-3 sm:h-[min(90dvh,60rem)] sm:gap-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="min-w-0 truncate text-sm font-medium">{title}</span>
              <button type="button" aria-label={showcase.close} onClick={() => dialog.current?.close()} className={dialogControl}>
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div key={active?.id} className={`relative min-h-0 overflow-hidden rounded-2xl ${styles.photo}`}>
              <CeramicImage url={active?.imageUrl} alt={title} sizes="100vw" fit="contain" eager />
            </div>
            {count > 1 && <div className="flex justify-center">{renderControls(dialogControl)}</div>}
          </div>
        </dialog>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-accent/20 bg-[rgb(var(--surface-soft))]">
        <div key={active?.id} className="absolute inset-0">
          <CeramicImage url={active?.imageUrl} alt={title} sizes="(min-width: 768px) 50vw, 100vw" eager />
        </div>
        {count > 1 && (
          <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
            <button type="button" aria-label={labels.previous} onClick={() => step(-1)} className={`pointer-events-auto ${arrow}`}>
              ←
            </button>
            <button type="button" aria-label={labels.next} onClick={() => step(1)} className={`pointer-events-auto ${arrow}`}>
              →
            </button>
          </div>
        )}
      </div>
      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto px-1 py-1">
          {ordered.map((image, position) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                aria-label={`${labels.image} ${position + 1}`}
                aria-pressed={position === selected}
                onClick={() => setIndex(position)}
                className={`relative block h-16 w-16 overflow-hidden rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${position === selected ? "border-primary ring-1 ring-primary" : "border-accent/20 hover:border-primary"}`}
              >
                <CeramicImage url={image.imageUrl} alt="" sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
