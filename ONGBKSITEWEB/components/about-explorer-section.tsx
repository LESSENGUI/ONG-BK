"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { AboutExplorerIcon, AboutExplorerItem } from "@/lib/about-secondary-sections";

const explorerIcons = {
  book: BookOpen,
  users: UsersRound,
  heart: HeartHandshake,
  leaf: Leaf,
  shield: ShieldCheck,
} satisfies Record<AboutExplorerIcon, typeof BookOpen>;

type AboutExplorerSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  navigationLabel: string;
  items: AboutExplorerItem[];
  footerNote?: string;
};

export function AboutExplorerSection({
  id,
  eyebrow,
  title,
  navigationLabel,
  items,
  footerNote,
}: AboutExplorerSectionProps) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0];
  if (!selectedItem) return null;

  const Icon = explorerIcons[selectedItem.icon];
  const panelId = `${id}-detail-panel`;

  return (
    <section className="bg-[var(--bk-fond)] py-16 sm:py-20" id={id}>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">
        <div className="mb-8 max-w-[760px] sm:mb-10">
          <p className="section-eyebrow">{eyebrow}</p>
          <h2 className="section-title mt-3">{title}</h2>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-6">
          <nav
            aria-label={navigationLabel}
            className="rounded-[28px] border border-[rgba(89,76,52,0.08)] bg-[#f3f0e9] p-3 shadow-[0_20px_55px_rgba(52,62,71,0.06)] sm:p-5"
          >
            <p className="px-3 pb-3 pt-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
              {navigationLabel}
            </p>
            <ol className="grid gap-1.5">
              {items.map((item) => {
                const isActive = item.id === selectedId;
                return (
                  <li key={item.id}>
                    <button
                      aria-controls={panelId}
                      aria-pressed={isActive}
                      className={`group relative flex min-h-[68px] w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-white shadow-[0_10px_26px_rgba(29,48,67,0.09)]"
                          : "text-ink/65 hover:bg-white/65 hover:text-[var(--bk-marine)]"
                      }`}
                      onClick={() => setSelectedId(item.id)}
                      type="button"
                    >
                      {isActive ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-[var(--bk-jaune)]"
                        />
                      ) : null}
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold transition-colors ${
                          isActive
                            ? "bg-[rgba(25,167,230,0.1)] text-[var(--bk-marine)]"
                            : "bg-white/70 text-ink/45 group-hover:text-[var(--bk-marine)]"
                        }`}
                      >
                        {item.number}
                      </span>
                      <span
                        className={`min-w-0 flex-1 font-display text-sm font-bold leading-5 ${
                          isActive ? "text-[var(--bk-marine)]" : ""
                        }`}
                      >
                        {item.title}
                      </span>
                      {isActive ? (
                        <Check
                          aria-hidden="true"
                          className="shrink-0 text-[var(--bk-ciel)]"
                          size={18}
                          strokeWidth={2.5}
                        />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <article
            aria-atomic="true"
            aria-live="polite"
            className="relative isolate min-h-[460px] overflow-hidden rounded-[28px] border border-[rgba(11,90,155,0.07)] bg-white p-6 shadow-[0_24px_65px_rgba(36,59,79,0.09)] sm:p-9 lg:p-11"
            id={panelId}
            key={selectedItem.id}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 bottom-[-4.5rem] z-[-1] font-display text-[15rem] font-black leading-none tracking-[-0.1em] text-[rgba(11,90,155,0.045)] sm:right-4 sm:text-[19rem]"
            >
              {selectedItem.number}
            </span>
            <div className="domain-panel-enter relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-[rgba(25,167,230,0.1)] text-[var(--bk-marine)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:size-16">
                  <Icon aria-hidden="true" size={27} strokeWidth={1.7} />
                </span>
                <span className="rounded-full border border-[rgba(11,90,155,0.1)] bg-[#f8fafb] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--bk-marine)]/65 sm:text-[10px]">
                  {selectedItem.eyebrow}
                </span>
              </div>

              <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--bk-ciel)]">
                Référence {selectedItem.number}
              </p>
              <h3 className="mt-2 max-w-[620px] font-display text-2xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--bk-marine)] sm:text-3xl">
                {selectedItem.title}
              </h3>
              <p className="mt-4 max-w-[640px] text-base font-semibold leading-7 text-[var(--bk-bleu-clair)] sm:text-lg">
                {selectedItem.summary}
              </p>
              <p className="mt-3 max-w-[640px] text-sm leading-7 text-ink/65 sm:text-[15px]">
                {selectedItem.description}
              </p>

              <ul aria-label="Mots-clés" className="mt-5 flex flex-wrap gap-2">
                {selectedItem.keywords.map((keyword) => (
                  <li
                    className="rounded-full border border-[rgba(11,90,155,0.08)] bg-[#f7f9fa] px-3 py-1.5 text-[11px] font-semibold text-ink/65"
                    key={keyword}
                  >
                    {keyword}
                  </li>
                ))}
              </ul>

              <div className="my-6 h-px w-full bg-gradient-to-r from-[rgba(11,90,155,0.18)] via-[rgba(11,90,155,0.08)] to-transparent" />
              {selectedItem.details ? (
                <ul className="grid gap-2.5">
                  {selectedItem.details.map((detail) => (
                    <li className="flex gap-3 text-sm leading-6 text-ink/65" key={detail}>
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--bk-jaune)]"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>
              ) : null}
              {selectedItem.complement ? (
                <p className="text-sm leading-6 text-ink/65">{selectedItem.complement}</p>
              ) : null}
              <Link
                className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--bk-ciel)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(25,167,230,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bk-marine)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2"
                href={selectedItem.href}
              >
                Explorer
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </article>
        </div>
        {footerNote ? (
          <p className="mt-5 text-sm leading-6 text-ink/55">{footerNote}</p>
        ) : null}
      </div>
    </section>
  );
}
