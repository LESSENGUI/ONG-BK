"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
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
    <div aria-label="Images illustrant les engagements de l’ONG BK" aria-roledescription="carrousel" className="hero-africa-image group" role="region">
      {slides.map((item, index) => (
        <Image
          alt={item.alt}
          className={`hero-africa-photo transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
          fill
          key={item.src}
          priority={index === 0}
          sizes="(max-width: 1023px) 92vw, 52vw"
          src={item.src}
        />
      ))}
      <span aria-live="polite" className="hero-photo-caption">{slide.label}</span>
      <button
        aria-label="Image précédente"
        className="absolute left-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-100 shadow transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        onClick={() => showSlide(active - 1)}
        type="button"
      >
        <ChevronLeft aria-hidden="true" size={20} />
      </button>
      <button
        aria-label="Image suivante"
        className="absolute right-3 top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink opacity-100 shadow transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        onClick={() => showSlide(active + 1)}
        type="button"
      >
        <ChevronRight aria-hidden="true" size={20} />
      </button>
      <div aria-label="Choisir une image" className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5" role="group">
        {slides.map((item, index) => (
          <button
            aria-current={index === active ? "true" : undefined}
            aria-label={`Afficher : ${item.label}`}
            className={`size-2.5 rounded-full border border-white transition-all ${index === active ? "w-6 bg-white" : "bg-white/45 hover:bg-white/80"}`}
            key={item.src}
            onClick={() => showSlide(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
