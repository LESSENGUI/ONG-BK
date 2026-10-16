"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, MapPin, Pause, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

export type HomeActivity = {
  slug: string;
  title: string;
  description: string;
  domain: string;
  eventDate: string | null;
  location: string;
  coverImage: string;
};

export function HomeActivitiesCarousel({
  activities,
  unavailable = false,
}: {
  activities: HomeActivity[];
  unavailable?: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({ left: direction * 360, behavior: "smooth" });
  };

  useEffect(() => {
    if (activities.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 16;
      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + 360, behavior: "smooth" });
    }, 6000);
    return () => window.clearInterval(timer);
  }, [activities.length, paused]);

  if (activities.length === 0) {
    return (
      <div className="mt-9 rounded-3xl border border-dashed border-ink/15 bg-[#fbfaf7] px-6 py-10 text-center sm:px-10">
        <p className="font-display text-lg font-bold text-ink">Les comptes rendus d’activités seront présentés ici.</p>
        <p className="mx-auto mt-2 max-w-[570px] text-sm leading-6 text-ink/60">
          {unavailable
            ? "Les comptes rendus d’activités sont momentanément indisponibles. Veuillez réessayer plus tard."
            : "Aucune activité réalisée n’est actuellement publiée. Les activités apparaîtront dans ce carrousel lorsqu’un compte rendu public aura été validé et publié."}
        </p>
        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actions">Découvrir nos domaines d’action <ArrowRight size={15} /></Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-7 flex justify-end gap-2">
        {activities.length > 1 && (
          <button aria-label={paused ? "Lancer le défilement automatique" : "Mettre en pause le défilement"} className="grid size-10 place-items-center rounded-full border border-ink/10 text-forest transition hover:bg-[#edf3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" onClick={() => setPaused((value) => !value)} type="button">
            {paused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
          </button>
        )}
        <button aria-label="Activités précédentes" className="grid size-10 place-items-center rounded-full border border-ink/10 text-forest transition hover:bg-[#edf3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" onClick={() => scroll(-1)} type="button">
          <ArrowLeft aria-hidden="true" size={17} />
        </button>
        <button aria-label="Activités suivantes" className="grid size-10 place-items-center rounded-full border border-ink/10 text-forest transition hover:bg-[#edf3e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest" onClick={() => scroll(1)} type="button">
          <ArrowRight aria-hidden="true" size={17} />
        </button>
      </div>
      <div className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-5" ref={trackRef}>
        {activities.map((activity) => (
          <Card className="group w-[min(84vw,360px)] shrink-0 snap-start overflow-hidden border-0 shadow-soft" key={activity.slug}>
            <Link aria-label={`Lire le compte rendu : ${activity.title}`} className="block" href={`/actions/activites/${activity.slug}`}>
              <div className="relative h-[215px] overflow-hidden bg-paper">
                <Image alt="" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" fill sizes="(max-width: 768px) 84vw, 360px" src={activity.coverImage} />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-forest">Compte rendu publié</span>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-forest">{activity.domain}</p>
                <h3 className="mt-2 font-display text-lg font-bold leading-7 text-ink">{activity.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/60">{activity.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink/50">
                  {activity.eventDate && <time dateTime={activity.eventDate}>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(activity.eventDate))}</time>}
                  {activity.location && <span className="inline-flex items-center gap-1"><MapPin size={13} />{activity.location}</span>}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-forest">Lire le compte rendu <ArrowRight size={14} /></span>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </>
  );
}
