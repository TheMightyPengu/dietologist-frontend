import { useEffect, useRef, useState } from "react";

export default function useHideOnScroll({
  downDelay = 8,
  upDelay = 8,
} = {}) {
  const lastY = useRef(0);
  const raf = useRef<number | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current != null) return;
      raf.current = window.requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        const dy = y - lastY.current;

        if (dy > downDelay && y > 0) setHidden(true);   // scrolling down
        else if (dy < -upDelay) setHidden(false);       // scrolling up

        lastY.current = y;
        raf.current && cancelAnimationFrame(raf.current);
        raf.current = null;
      });
    };

    // passive listener = better scroll perf
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [downDelay, upDelay]);

  return hidden;
}
