"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  { src: "/images/hero-accueil.jpg", alt: "", label: "Au service des communautés, chaque jour." },
  { src: "/images/action-ateliers.jpg", alt: "Atelier en petit groupe", label: "Apprendre et s’épanouir" },
  { src: "/images/action-education.jpg", alt: "Activité autour de l’éducation", label: "Ouvrir le champ des possibles" },
  { src: "/images/action-communaute.jpg", alt: "Rencontre communautaire", label: "Faire grandir la solidarité" },
  { src: "/images/action-solidarite.jpg", alt: "Moment de partage et de solidarité", label: "Avancer ensemble" },
];

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionPreference.matches) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const showSlide = (index: number) => setActive((index + slides.length) % slides.length);
  const slide = slides[active];

  return (
    <div aria-label="Images illustrant les engagements de l’ONG BK" aria-roledescription="carrousel" className="absolute inset-0" role="region">
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((item, index) => (
          <Image
            alt={item.alt}
            aria-hidden="true"
            className={`object-cover transition-opacity duration-1000 motion-reduce:transition-none ${index === active ? "opacity-100" : "opacity-0"}`}
            fill
            key={item.src}
            priority={index === 0}
            sizes="100vw"
            src={item.src}
          />
        ))}
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(247,247,247,0.6),rgba(247,247,247,0.72)_48%,rgba(247,247,247,0.48)),linear-gradient(0deg,rgba(11,90,155,0.13),transparent_34%)]" />
      </div>
      <span aria-live="polite" className="absolute left-5 top-5 z-10 rounded-full border border-white/60 bg-white/70 px-3 py-2 text-[10px] font-semibold tracking-wide text-[var(--bk-marine)] shadow-sm backdrop-blur-sm sm:left-8 sm:top-7 sm:text-xs">{slide.label}</span>
      <button
        aria-label="Image précédente"
        className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/80 text-[var(--bk-marine)] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-marine)] sm:left-6"
        onClick={() => showSlide(active - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button
        aria-label="Image suivante"
        className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-white/80 text-[var(--bk-marine)] shadow-sm backdrop-blur-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-marine)] sm:right-6"
        onClick={() => showSlide(active + 1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
      <div aria-label="Choisir une image" className="absolute bottom-32 right-5 z-10 flex items-center gap-1.5 sm:bottom-28 sm:right-8" role="group">
        {slides.map((item, index) => (
          <button
            aria-current={index === active ? "true" : undefined}
            aria-label={`Afficher : ${item.label}`}
            className={`size-2.5 rounded-full border border-[var(--bk-marine)]/60 transition-all ${index === active ? "w-6 bg-[var(--bk-marine)]" : "bg-white/75 hover:bg-white"}`}
            key={item.src}
            onClick={() => showSlide(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
