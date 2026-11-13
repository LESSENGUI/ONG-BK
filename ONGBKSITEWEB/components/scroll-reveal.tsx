"use client";

import { useEffect } from "react";
import { motionTiming } from "@/lib/motion";

export function ScrollReveal() {
  useEffect(() => {
    const revealTargets = new Set<HTMLElement>([
      ...document.querySelectorAll<HTMLElement>("main > section > div > *"),
      ...document.querySelectorAll<HTMLElement>("[data-reveal]"),
    ]);
    const siblingIndices = new Map<Element, number>();

    revealTargets.forEach((element) => {
      element.dataset.reveal = "";
      if (element.matches(".impact-card, .brand-card")) element.classList.add("reveal-scale");
      const parent = element.parentElement;
      const siblingIndex = parent ? siblingIndices.get(parent) ?? 0 : 0;
      if (parent) siblingIndices.set(parent, siblingIndex + 1);
      element.style.setProperty("--reveal-delay", `${Math.min(siblingIndex, 5) * motionTiming.staggerSeconds * 1000}ms`);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible", "is-in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.classList.add("is-in-view");
          } else {
            entry.target.classList.remove("is-in-view");
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -2% 0px" },
    );

    const observeReveals = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((element) => observer.observe(element));
    };

    observeReveals(document);
    document.body.classList.add("reveal-ready");
    document.documentElement.style.setProperty("--reveal-duration", `${motionTiming.duration}s`);
    document.documentElement.style.setProperty("--reveal-easing", motionTiming.easingCss);
    document.documentElement.style.setProperty("--reveal-y", `${motionTiming.revealY}px`);
    document.documentElement.style.setProperty("--reveal-scale", String(motionTiming.cardScale));

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches("[data-reveal]:not(.is-visible)")) observer.observe(node);
            observeReveals(node);
          }
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      document.body.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
