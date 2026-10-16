"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

type AboutInfoDialogProps = {
  eyebrow: string;
  title: string;
  summary: string;
  paragraphs: string[];
  points?: string[];
  detailHref?: string;
  detailLabel?: string;
  index?: string;
};

export function AboutInfoDialog({
  eyebrow,
  title,
  summary,
  paragraphs,
  points = [],
  detailHref,
  detailLabel = "Consulter la page détaillée",
  index,
}: AboutInfoDialogProps) {
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
        className="about-info-card group"
        onClick={() => setOpen(true)}
        type="button"
      >
        {index ? <span className="about-info-index">{index}</span> : null}
        <span className="about-info-eyebrow">{eyebrow}</span>
        <span className="mt-3 block font-display text-lg font-bold leading-snug text-[var(--bk-marine)]">{title}</span>
        <span className="mt-3 block text-sm leading-6 text-ink/65">{summary}</span>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[var(--bk-ciel)]">
          En savoir plus
          <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" size={15} />
        </span>
      </button>

      <dialog
        aria-labelledby={headingId}
        className="about-detail-dialog m-auto w-[min(92vw,700px)] max-w-none rounded-[28px] border border-[rgba(11,90,155,0.12)] bg-white p-0 text-ink shadow-[0_30px_100px_rgba(11,90,155,0.25)] backdrop:bg-[rgba(11,90,155,0.48)] backdrop:backdrop-blur-sm"
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
        <div className="relative max-h-[88dvh] overflow-y-auto p-6 sm:p-9">
          <div aria-hidden="true" className="about-dialog-glow" />
          <div className="relative">
            <div className="flex items-start justify-between gap-5">
              <p className="about-info-eyebrow">{eyebrow}</p>
              <button
                aria-label={`Fermer : ${title}`}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/10 text-ink/60 transition-colors hover:bg-[rgba(25,167,230,0.08)] hover:text-[var(--bk-marine)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)]"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <h2 className="mt-4 max-w-[580px] font-display text-2xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--bk-marine)] sm:text-3xl" id={headingId}>
              {title}
            </h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-[var(--bk-bleu-clair)] sm:text-base">{summary}</p>
            <div className="mt-5 space-y-4">
              {paragraphs.map((paragraph) => (
                <p className="text-sm leading-7 text-ink/70 sm:text-[15px]" key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {points.length > 0 ? (
              <ul className="mt-6 grid gap-3 rounded-2xl bg-[rgba(25,167,230,0.055)] p-5 sm:p-6">
                {points.map((point) => (
                  <li className="flex gap-3 text-sm leading-6 text-ink/70" key={point}>
                    <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--bk-rose)]" />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
            {detailHref ? (
              <Link
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--bk-ciel)] px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2"
                href={detailHref}
                onClick={() => setOpen(false)}
              >
                {detailLabel}
                <ArrowRight aria-hidden="true" size={15} />
              </Link>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
