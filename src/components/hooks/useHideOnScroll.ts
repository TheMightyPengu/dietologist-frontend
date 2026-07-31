import { useEffect, useRef, useState } from "react";

type UseHideOnScrollOptions = {
  downDelay?: number;
  upDelay?: number;
};

export default function useHideOnScroll({
  downDelay = 12,
  upDelay = 8,
}: UseHideOnScrollOptions = {}) {
  const lastY = useRef(0);
  const accumulatedDistance = useRef(0);
  const lastDirection = useRef<"up" | "down" | null>(null);
  const raf = useRef<number | null>(null);

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    lastY.current = window.scrollY || window.pageYOffset;

    const onScroll = () => {
      if (raf.current !== null) return;

      raf.current = window.requestAnimationFrame(() => {
        const currentY = window.scrollY || window.pageYOffset;
        const difference = currentY - lastY.current;

        const direction =
          difference > 0 ? "down" : difference < 0 ? "up" : null;

        // Always show the header when near the top.
        if (currentY <= 10) {
          setHidden(false);
          accumulatedDistance.current = 0;
          lastDirection.current = null;
          lastY.current = currentY;
          raf.current = null;
          return;
        }

        if (direction) {
          // Reset the accumulated distance when scroll direction changes.
          if (direction !== lastDirection.current) {
            accumulatedDistance.current = 0;
            lastDirection.current = direction;
          }

          accumulatedDistance.current += Math.abs(difference);

          if (
            direction === "down" &&
            accumulatedDistance.current >= downDelay
          ) {
            setHidden(true);
            accumulatedDistance.current = 0;
          }

          if (
            direction === "up" &&
            accumulatedDistance.current >= upDelay
          ) {
            setHidden(false);
            accumulatedDistance.current = 0;
          }
        }

        lastY.current = currentY;
        raf.current = null;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (raf.current !== null) {
        window.cancelAnimationFrame(raf.current);
      }
    };
  }, [downDelay, upDelay]);

  return hidden;
}