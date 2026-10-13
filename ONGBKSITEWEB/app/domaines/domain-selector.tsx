"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { domains } from "@/lib/domains";

export function DomainSelector() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDomain = domains[activeIndex];
  const Icon = activeDomain.icon;

  return (
    <section aria-labelledby="domain-selector-title" className="bg-[#f8f7f4] pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[760px] text-center">
          <p className="section-eyebrow">Explorer nos engagements</p>
          <h2 className="section-title mt-3" id="domain-selector-title">Des actions utiles, au plus près des communautés.</h2>
          <p className="mx-auto mt-4 max-w-[650px] text-sm leading-7 text-ink/65 sm:text-base">
            Choisissez un domaine pour découvrir notre approche et les pistes d’action qui peuvent répondre aux besoins locaux.
          </p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[28px] border border-ink/[0.08] bg-white shadow-[0_24px_70px_rgba(23,45,78,0.08)] lg:mt-14 lg:min-h-[510px] lg:grid-cols-[0.76fr_1.24fr]">
          <nav aria-label="Choisir un domaine d’intervention" className="border-b border-ink/[0.08] bg-[#fbfaf8] p-3 sm:p-5 lg:border-b-0 lg:border-r lg:p-7">
            <p className="px-3 pb-3 pt-1 text-[10px] font-bold uppercase tracking-[0.17em] text-ink/45">Explorer nos domaines</p>
            <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {domains.map((domain, index) => {
                const selected = index === activeIndex;
                return (
                  <li id={domain.id} key={domain.id}>
                    <button
                      aria-pressed={selected}
                      className={`group relative flex min-h-[58px] w-full items-center gap-3 rounded-xl px-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 ${
                        selected ? "bg-white text-forest shadow-[0_5px_22px_rgba(23,45,78,0.08)]" : "text-ink/65 hover:bg-white hover:text-ink"
                      }`}
                      onClick={() => setActiveIndex(index)}
                      type="button"
                    >
                      <span className={`absolute bottom-3 left-0 top-3 w-[3px] rounded-full transition-colors ${selected ? "bg-sun" : "bg-transparent"}`} />
                      <span className={`min-w-8 font-display text-xs font-extrabold tracking-wider ${selected ? "text-forest" : "text-ink/35"}`}>{domain.number}</span>
                      <span className={`text-sm leading-5 ${selected ? "font-bold" : "font-medium"}`}>{domain.title}</span>
                      {selected && <Check aria-hidden="true" className="ml-auto shrink-0 text-forest" size={16} />}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div aria-live="polite" className="relative flex min-h-[440px] flex-col justify-between overflow-hidden p-6 sm:p-9 lg:p-12">
            <div key={activeDomain.slug} className="domain-panel-enter relative z-10">
              <div className="flex items-start justify-between gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#edf3e8] text-forest sm:size-16">
                  <Icon aria-hidden="true" size={28} strokeWidth={1.7} />
                </span>
                <span aria-hidden="true" className="font-display text-5xl font-extrabold tracking-[-0.07em] text-ink/[0.07] sm:text-7xl">{activeDomain.number}</span>
              </div>
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.17em] text-forest">Notre engagement</p>
              <h2 className="mt-2 max-w-[620px] font-display text-3xl font-extrabold leading-tight tracking-[-0.045em] text-ink sm:text-4xl">{activeDomain.title}</h2>
              <p className="mt-3 max-w-[620px] font-display text-base font-semibold leading-7 text-ink/80 sm:text-lg">{activeDomain.subtitle}</p>
              <p className="mt-4 max-w-[690px] text-sm leading-7 text-ink/65 sm:text-[15px]">{activeDomain.shortDescription}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {activeDomain.axes.slice(0, 3).map((axis) => (
                  <span className="rounded-full border border-ink/[0.08] bg-[#fbfaf8] px-3 py-1.5 text-[11px] font-medium text-ink/65" key={axis.title}>{axis.title}</span>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-ink/[0.08] pt-5">
              <p className="max-w-[360px] text-xs leading-5 text-ink/50">Contenu de présentation : les activités proposées sont des pistes de travail, pas des réalisations déclarées.</p>
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#104b3c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
                href={`/domaines/${activeDomain.slug}`}
              >
                En savoir plus <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>

            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-20 size-72 rounded-full bg-[#edf3e8]/80 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
