"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const progressBar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
        progressBar.current?.style.setProperty("--scroll-progress", String(Math.min(Math.max(progress, 0), 1)));
        frame = 0;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 bg-transparent">
      <div
        ref={progressBar}
        className="h-full bg-[linear-gradient(90deg,var(--bk-ciel),var(--bk-rose))] shadow-[0_0_25px_rgba(25,167,230,0.45)] transition-transform duration-150 ease-out"
        style={{ transform: "scaleX(var(--scroll-progress, 0))", transformOrigin: "left center" }}
      />
    </div>
  );
}
