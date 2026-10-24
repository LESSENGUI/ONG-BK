"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";

const photos = [
  {
    src: "/images/action-education.jpg",
    alt: "Des enfants participent à une activité éducative",
    caption: "Apprendre et s’épanouir",
    position: "center 48%",
  },
  {
    src: "/images/action-solidarite.jpg",
    alt: "Des enfants et des membres de l’ONG BK lors d’une action de solidarité",
    caption: "Faire vivre la solidarité",
    position: "center 48%",
  },
  {
    src: "/images/action-communaute.jpg",
    alt: "Des membres et des enfants réunis lors d’une activité communautaire",
    caption: "Agir avec les communautés",
    position: "center 45%",
  },
  {
    src: "/images/action-ateliers.jpg",
    alt: "Des participants prennent part à un atelier",
    caption: "Partager et transmettre",
    position: "center 45%",
  },
  {
    src: "/images/action-evenement.jpg",
    alt: "Des participants réunis lors d’un événement communautaire",
    caption: "Se mobiliser ensemble",
    position: "center 45%",
  },
];

export function HomeJoinGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (
      paused ||
      hovered ||
      focused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % photos.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [focused, hovered, paused]);

  const showPhoto = (offset: number) =>
    photos[(activeIndex + offset) % photos.length];

  return (
    <div
      aria-label="Photos des activités de l’ONG BK"
      aria-roledescription="carrousel"
      className="min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(event) => {
        if (event.pointerType === "touch") setHovered(true);
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "touch") setHovered(false);
      }}
      role="region"
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="relative col-span-2 h-[210px] overflow-hidden rounded-[26px] bg-[#dce7df] shadow-[0_18px_42px_rgba(16,36,61,0.12)] sm:h-[270px] lg:h-[300px]">
          {photos.map((photo, index) => (
            <div
              aria-hidden={activeIndex !== index}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                activeIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              key={photo.src}
            >
              <Image
                alt={photo.alt}
                className="object-cover transition-transform duration-[6500ms] ease-linear"
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 90vw, 50vw"
                src={photo.src}
                style={{ objectPosition: photo.position }}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#10243d]/65 via-[#10243d]/[0.04] to-transparent" />
              <p className="absolute bottom-4 left-4 right-4 font-display text-xs font-bold text-white drop-shadow sm:bottom-5 sm:left-5 sm:text-sm">
                {photo.caption}
              </p>
            </div>
          ))}
          <div className="absolute right-3 top-3 flex gap-2 sm:right-4 sm:top-4">
            <button
              aria-label={paused ? "Reprendre le défilement des photos" : "Mettre en pause le défilement des photos"}
              className="grid size-9 place-items-center rounded-full border border-white/35 bg-[#10243d]/35 text-white shadow-sm backdrop-blur-md transition hover:bg-[#10243d]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setPaused((value) => !value)}
              type="button"
            >
              {paused ? <Play aria-hidden="true" size={15} /> : <Pause aria-hidden="true" size={15} />}
            </button>
            <button
              aria-label="Photo précédente"
              className="grid size-9 place-items-center rounded-full border border-white/35 bg-[#10243d]/35 text-white shadow-sm backdrop-blur-md transition hover:bg-[#10243d]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setActiveIndex((current) => (current - 1 + photos.length) % photos.length)}
              type="button"
            >
              <ArrowLeft aria-hidden="true" size={15} />
            </button>
            <button
              aria-label="Photo suivante"
              className="grid size-9 place-items-center rounded-full border border-white/35 bg-[#10243d]/35 text-white shadow-sm backdrop-blur-md transition hover:bg-[#10243d]/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setActiveIndex((current) => (current + 1) % photos.length)}
              type="button"
            >
              <ArrowRight aria-hidden="true" size={15} />
            </button>
          </div>
          <div aria-label="Choisir une photo" className="absolute bottom-4 right-4 flex gap-1.5 sm:bottom-5 sm:right-5">
            {photos.map((photo, index) => (
              <button
                aria-current={activeIndex === index}
                aria-label={`Afficher la photo ${index + 1} : ${photo.caption}`}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  activeIndex === index ? "w-6 bg-white" : "w-1.5 bg-white/65 hover:bg-white"
                }`}
                key={photo.src}
                onClick={() => setActiveIndex(index)}
                type="button"
              />
            ))}
          </div>
        </div>
        {[1, 2].map((offset) => (
          <div
            aria-hidden="true"
            className="relative h-[130px] overflow-hidden rounded-[22px] bg-[#dce7df] shadow-[0_10px_26px_rgba(16,36,61,0.08)] sm:h-[170px] lg:h-[185px]"
            key={offset}
          >
            {photos.map((photo, index) => (
              <div
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  index === (activeIndex + offset) % photos.length
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
                key={photo.src}
              >
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 42vw, (max-width: 1024px) 44vw, 25vw"
                  src={photo.src}
                  style={{ objectPosition: photo.position }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <p aria-live="polite" className="sr-only">{showPhoto(0).caption}, photo {activeIndex + 1} sur {photos.length}</p>
    </div>
  );
}
