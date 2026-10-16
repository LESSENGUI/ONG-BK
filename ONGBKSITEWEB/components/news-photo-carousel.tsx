"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function NewsPhotoCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [images.length]);

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  };
  const showNext = () => {
    setActiveIndex((current) => (current + 1) % images.length);
  };

  return (
    <div className="relative mt-8 overflow-hidden rounded-[30px] bg-[var(--bk-marine)]">
      <div className="relative h-[260px] sm:h-[430px]" aria-roledescription="carrousel">
        {images.map((image, index) => (
          <div
            aria-hidden={activeIndex !== index}
            aria-label={`Photo ${index + 1} sur ${images.length}`}
            className={`absolute inset-0 transition-opacity duration-700 ${activeIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
            key={image}
            role="group"
          >
            <Image
              alt={`Photo ${index + 1} de l’actualité sur la formation en intelligence artificielle`}
              className="object-cover"
              fill
              priority={index === 0}
              sizes="(max-width: 900px) 100vw, 900px"
              src={image}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <button
          aria-label="Photo précédente"
          className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--bk-marine)] shadow-lg transition hover:bg-white"
          onClick={showPrevious}
          type="button"
        >
          <ChevronLeft aria-hidden="true" size={21} />
        </button>
        <button
          aria-label="Photo suivante"
          className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--bk-marine)] shadow-lg transition hover:bg-white"
          onClick={showNext}
          type="button"
        >
          <ChevronRight aria-hidden="true" size={21} />
        </button>
        <div aria-label="Choisir une photo" className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((image, index) => (
            <button
              aria-current={activeIndex === index}
              aria-label={`Afficher la photo ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-7 bg-white" : "w-2.5 bg-white/60 hover:bg-white/90"}`}
              key={image}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
        <span aria-live="polite" className="absolute bottom-4 right-5 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white">
          {activeIndex + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}
