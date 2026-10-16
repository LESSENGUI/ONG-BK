"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";

const members = [
  {
    id: "president",
    name: "KOUILA Borja Streel",
    position: "Président",
    image: "/images/bureau-executif/president.jpg",
    initials: "KB",
  },
  {
    id: "vice-president",
    name: "MOUKOKO MBOUNGOU Ulrich",
    position: "Vice-Président",
    image: "/images/bureau-executif/vice-president.jpeg",
    initials: "MU",
  },
  {
    id: "secretaire-generale",
    name: "MAKOSSO Chestine Del’or",
    position: "Secrétaire générale",
    image: null,
    initials: "MC",
  },
  {
    id: "secretaire-generale-adjoint",
    name: "LESSENGUI Christ Juvalin",
    position: "Secrétaire général adjoint",
    image: "/images/bureau-executif/secretaire-general-adjoint.jpeg",
    initials: "LC",
  },
  {
    id: "tresoriere-generale",
    name: "MOBOTO EKIEMA Bienheureuse Bretecha C.",
    position: "Trésorière générale",
    image: "/images/bureau-executif/tresorier-general.jpeg",
    initials: "MB",
  },
  {
    id: "tresoriere-generale-adjointe",
    name: "MASSENGO Aimerence Grace",
    position: "Trésorière générale adjointe",
    image: null,
    initials: "MA",
  },
  {
    id: "secretaire-communication",
    name: "ATIMAKOA Barlain Djolvan",
    position: "Secrétaire chargé de l’organisation, de la communication, des relations publiques et des médias",
    image: "/images/bureau-executif/secretaire-organisation-communication.jpeg",
    initials: "AB",
  },
];

export function ExecutiveBoardProfiles() {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const selectedMember = members.find((member) => member.id === selectedMemberId) ?? null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedMember && !dialog.open) dialog.showModal();
    if (!selectedMember && dialog.open) dialog.close();
  }, [selectedMember]);

  return (
    <>
      <div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <li
              className="group overflow-hidden rounded-[26px] border border-[rgba(11,90,155,0.09)] bg-white shadow-[0_16px_42px_-34px_rgba(11,47,78,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-32px_rgba(11,47,78,0.4)]"
              key={member.id}
            >
              <div className="relative h-[290px] overflow-hidden bg-[linear-gradient(145deg,#0B5A9B,#19A7E6)] sm:h-[320px]">
                {member.image ? (
                  <Image
                    alt={`Portrait de ${member.name}`}
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={member.image}
                  />
                ) : (
                  <div aria-label="Portrait à venir" className="grid h-full place-items-center overflow-hidden text-white">
                    <div aria-hidden="true" className="absolute -right-12 -top-10 size-64 rounded-full border border-white/15 shadow-[0_0_0_28px_rgba(255,255,255,0.035),0_0_0_58px_rgba(255,255,255,0.025)]" />
                    <div className="relative text-center">
                      <span className="mx-auto grid size-28 place-items-center rounded-full border border-white/35 bg-white/10 font-display text-4xl font-semibold tracking-tight">
                        {member.initials}
                      </span>
                      <span className="mt-4 block text-[10px] font-bold uppercase tracking-[.2em] text-white/75">
                        Portrait à venir
                      </span>
                    </div>
                  </div>
                )}
                <span aria-hidden="true" className="absolute left-5 top-5 rounded-full border border-white/30 bg-black/15 px-3 py-1.5 text-[10px] font-bold tracking-[.16em] text-white backdrop-blur-sm">
                  ONG-BK
                </span>
              </div>
              <div className="flex min-h-[208px] flex-col p-5 sm:p-6">
                <p className="min-h-10 text-[10px] font-bold uppercase leading-5 tracking-[.13em] text-[var(--bk-ciel)]">
                  {member.position}
                </p>
                <h3 className="mt-2 font-display text-xl font-bold leading-snug tracking-[-.025em] text-[var(--bk-marine)]">
                  {member.name}
                </h3>
                <button
                  aria-haspopup="dialog"
                  className="mt-auto inline-flex min-h-11 items-center justify-between gap-3 border-t border-[rgba(11,90,155,0.09)] pt-4 text-left text-sm font-bold text-[var(--bk-marine)] transition hover:text-[var(--bk-ciel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)]"
                  onClick={() => setSelectedMemberId(member.id)}
                  type="button"
                >
                  Voir la biographie
                  <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-[rgba(25,167,230,0.08)] transition group-hover:bg-[rgba(25,167,230,0.16)]">
                    <ArrowRight size={15} />
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <dialog
        aria-labelledby={headingId}
        className="m-auto w-[min(92vw,760px)] max-w-none overflow-hidden rounded-[30px] border border-white/70 bg-[#fffdfa] p-0 text-ink shadow-[0_36px_110px_rgba(5,28,52,0.35)] backdrop:bg-[rgba(5,28,52,0.65)] backdrop:backdrop-blur-md"
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedMemberId(null);
        }}
        onCancel={(event) => {
          event.preventDefault();
          setSelectedMemberId(null);
        }}
        onClose={() => setSelectedMemberId(null)}
        ref={dialogRef}
      >
        {selectedMember ? (
          <div className="relative max-h-[88dvh] overflow-y-auto">
            <div className="grid sm:grid-cols-[0.85fr_1.15fr]">
              <div className="relative min-h-[230px] overflow-hidden bg-[linear-gradient(145deg,#0B5A9B,#19A7E6)] sm:min-h-[380px]">
              {selectedMember.image ? (
                  <Image
                    alt={`Portrait de ${selectedMember.name}`}
                    className="object-cover"
                    fill
                    sizes="(max-width: 640px) 92vw, 330px"
                    src={selectedMember.image}
                  />
              ) : (
                  <div className="relative grid h-full min-h-[230px] place-items-center text-white sm:min-h-[380px]">
                    <span aria-hidden="true" className="absolute size-56 rounded-full border border-white/20 shadow-[0_0_0_24px_rgba(255,255,255,0.04),0_0_0_50px_rgba(255,255,255,0.025)]" />
                    <span className="relative grid size-32 place-items-center rounded-full border border-white/40 bg-white/10 font-display text-5xl font-semibold">
                      {selectedMember.initials}
                    </span>
                  </div>
              )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#071c32]/95 via-[#071c32]/55 to-transparent px-6 pb-6 pt-20 text-white sm:px-8 sm:pb-8">
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f2c46d]">
                    {selectedMember.position}
                  </p>
                  <h2 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl" id={headingId}>
                    {selectedMember.name}
                  </h2>
                </div>
              </div>
              <div className="relative flex min-h-[300px] flex-col justify-center p-7 sm:p-10">
                <button
                  aria-label="Fermer la biographie"
                  className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-ink/10 text-ink/55 transition hover:bg-ink/5 hover:text-[var(--bk-marine)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)]"
                  onClick={() => setSelectedMemberId(null)}
                  type="button"
                >
                  <X aria-hidden="true" size={18} />
                </button>
                <p className="section-eyebrow">Parcours & engagement</p>
                <span aria-hidden="true" className="mt-5 h-px w-12 bg-[#d9af57]" />
                <p className="mt-5 text-sm leading-7 text-ink/70">
                  La biographie détaillée de {selectedMember.name} sera ajoutée dès que l’ONG-BK aura communiqué des informations validées sur son parcours.
                </p>
                <p className="mt-7 text-[10px] font-bold uppercase tracking-[.16em] text-ink/40">
                  Bureau exécutif · ONG-BK
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
