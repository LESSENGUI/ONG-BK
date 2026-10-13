"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import type { ReactNode } from "react";
import type { DomainAxis } from "@/lib/domains";

type AxisDialogProps = {
  axis: Omit<DomainAxis, "icon">;
  icon: ReactNode;
  number: string;
};

export function AxisDialog({ axis, icon, number }: AxisDialogProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="group flex h-full w-full flex-col rounded-2xl border border-ink/[0.07] bg-white p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-forest/25 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 sm:p-6"
        onClick={() => setOpen(true)}
        type="button"
      >
        <span className="grid size-11 place-items-center rounded-xl bg-[#edf3e8] text-forest transition-colors group-hover:bg-forest group-hover:text-white">
          {icon}
        </span>
        <span className="mt-5 text-[10px] font-bold tracking-[0.14em] text-forest">AXE {number}</span>
        <span className="mt-2 font-display text-base font-bold text-ink">{axis.title}</span>
        <span className="mt-2 text-xs leading-6 text-ink/60">{axis.description}</span>
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-forest">
          Découvrir cet axe
          <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" size={14} />
        </span>
      </button>

      <dialog
        aria-labelledby={headingId}
        className="axis-dialog m-auto w-[min(92vw,620px)] max-w-none rounded-[26px] border border-ink/10 bg-white p-0 text-ink shadow-[0_30px_100px_rgba(12,30,45,0.3)] backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
        ref={dialogRef}
      >
        <div className="relative overflow-hidden p-6 sm:p-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-[#edf3e8] blur-3xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest">
                {icon}
              </span>
              <button
                aria-label="Fermer la description de l’axe"
                className="grid size-10 place-items-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:bg-[#f8f7f4] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.17em] text-forest">Axe {number}</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight tracking-[-0.04em] sm:text-3xl" id={headingId}>{axis.title}</h2>
            <p className="mt-4 text-sm leading-7 text-ink/70 sm:text-[15px]">{axis.details}</p>

            <div className="mt-7 rounded-2xl bg-[#f8f7f4] p-5 sm:p-6">
              <h3 className="font-display text-sm font-bold text-ink">Pistes de travail possibles</h3>
              <ul className="mt-4 grid gap-3">
                {axis.practicalExamples.map((example) => (
                  <li className="flex gap-3 text-sm leading-6 text-ink/65" key={example}>
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-sun" />
                    {example}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-xs leading-5 text-ink/50">
              Ces éléments décrivent des pistes éditoriales à adapter aux besoins exprimés et aux actions effectivement retenues par ONG BK.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
