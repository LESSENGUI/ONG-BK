"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  HeartHandshake,
  Leaf,
  RefreshCw,
  Scale,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { convictions, preambleIntroduction, type ConvictionIcon } from "@/lib/about-preamble";

const convictionIcons = {
  heart: HeartHandshake,
  refresh: RefreshCw,
  balance: Scale,
  shield: ShieldCheck,
  users: UsersRound,
  leaf: Leaf,
  book: BookOpen,
} satisfies Record<ConvictionIcon, typeof HeartHandshake>;

export function AboutPreambleSection() {
  const [selectedNumber, setSelectedNumber] = useState(1);
  const selectedConviction =
    convictions.find((conviction) => conviction.number === selectedNumber) ?? convictions[0];
  const Icon = convictionIcons[selectedConviction.icon];
  const numberLabel = String(selectedConviction.number).padStart(2, "0");

  return (
    <section className="bg-[var(--bk-fond)] py-16 sm:py-20" id="preambule">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto mb-10 flex max-w-[920px] flex-col items-start justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
          <div className="max-w-[650px]">
            <p className="section-eyebrow">Notre préambule</p>
            <h2 className="section-title mt-3">Des convictions communes, un engagement partagé.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-[15px]">
              {preambleIntroduction} Ces convictions éclairent notre vision de l’engagement et du
              développement des communautés.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--bk-marine)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(11,90,155,0.16)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bk-ciel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2"
            href="/about/preambule"
          >
            Explorer le préambule
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>

        <div className="grid items-stretch gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:gap-6">
          <nav
            aria-label="Les sept convictions"
            className="rounded-[28px] border border-[rgba(89,76,52,0.08)] bg-[#f3f0e9] p-3 shadow-[0_20px_55px_rgba(52,62,71,0.06)] sm:p-5"
          >
            <p className="px-3 pb-3 pt-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-ink/45">
              Choisir une conviction
            </p>
            <ol className="grid gap-1.5">
              {convictions.map((conviction) => {
                const isActive = conviction.number === selectedNumber;
                const itemNumber = String(conviction.number).padStart(2, "0");

                return (
                  <li key={conviction.number}>
                    <button
                      aria-controls="about-conviction-panel"
                      aria-pressed={isActive}
                      className={`group relative flex min-h-[68px] w-full items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2 ${
                        isActive
                          ? "bg-white shadow-[0_10px_26px_rgba(29,48,67,0.09)]"
                          : "text-ink/65 hover:bg-white/65 hover:text-[var(--bk-marine)]"
                      }`}
                      onClick={() => setSelectedNumber(conviction.number)}
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
                        {itemNumber}
                      </span>
                      <span
                        className={`min-w-0 flex-1 font-display text-sm font-bold leading-5 ${
                          isActive ? "text-[var(--bk-marine)]" : ""
                        }`}
                      >
                        {conviction.title}
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
            id="about-conviction-panel"
            key={selectedConviction.number}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-4 bottom-[-4.5rem] z-[-1] font-display text-[15rem] font-black leading-none tracking-[-0.1em] text-[rgba(11,90,155,0.045)] sm:right-4 sm:text-[19rem]"
            >
              {numberLabel}
            </span>
            <div className="domain-panel-enter relative flex h-full flex-col">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-14 place-items-center rounded-2xl bg-[rgba(25,167,230,0.1)] text-[var(--bk-marine)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:size-16">
                  <Icon aria-hidden="true" size={27} strokeWidth={1.7} />
                </span>
                <span className="rounded-full border border-[rgba(11,90,155,0.1)] bg-[#f8fafb] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--bk-marine)]/65 sm:text-[10px]">
                  Nos convictions
                </span>
              </div>

              <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--bk-ciel)]">
                Conviction {numberLabel}
              </p>
              <h3 className="mt-2 max-w-[620px] font-display text-2xl font-extrabold leading-tight tracking-[-0.035em] text-[var(--bk-marine)] sm:text-3xl">
                {selectedConviction.title}
              </h3>
              <p className="mt-4 max-w-[640px] text-base font-semibold leading-7 text-[var(--bk-bleu-clair)] sm:text-lg">
                {selectedConviction.statement}
              </p>
              <p className="mt-3 max-w-[640px] text-sm leading-7 text-ink/65 sm:text-[15px]">
                {selectedConviction.explanation}
              </p>

              <ul aria-label="Mots-clés" className="mt-5 flex flex-wrap gap-2">
                {selectedConviction.keywords.map((keyword) => (
                  <li
                    className="rounded-full border border-[rgba(11,90,155,0.08)] bg-[#f7f9fa] px-3 py-1.5 text-[11px] font-semibold text-ink/65"
                    key={keyword}
                  >
                    {keyword}
                  </li>
                ))}
              </ul>

              <div className="my-6 h-px w-full bg-gradient-to-r from-[rgba(11,90,155,0.18)] via-[rgba(11,90,155,0.08)] to-transparent" />
              <p className="max-w-[640px] text-sm leading-6 text-ink/65">
                {selectedConviction.application}
              </p>
              <Link
                className="mt-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[var(--bk-ciel)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(25,167,230,0.2)] transition-all hover:-translate-y-0.5 hover:bg-[var(--bk-marine)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)] focus-visible:ring-offset-2"
                href={`/about/convictions/${selectedConviction.number}`}
              >
                Explorer
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}