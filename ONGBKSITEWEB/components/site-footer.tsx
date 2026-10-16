"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Facebook, Linkedin, Mail, MessageCircle, Music2 } from "lucide-react";

const sections = [
  {
    title: "L’ONG-BK",
    links: [
      ["À propos", "/a-propos"],
      ["Notre vision et mission", "/a-propos#vision-mission"],
      ["Nos valeurs", "/a-propos#valeurs"],
      ["Gouvernance", "/a-propos#gouvernance"],
    ],
  },
  {
    title: "NOS ACTIONS",
    links: [
      ["Domaines d’intervention", "/domaines"],
      ["Projets et activités", "/actions"],
      ["Actualités", "/actualites"],
      ["Nos partenaires", "/partenaires"],
    ],
  },
  {
    title: "S’ENGAGER",
    links: [
      ["Devenir membre", "/adhesion"],
      ["Devenir bénévole", "/adhesion?type=benevole"],
      ["Proposer un partenariat", "/partenaires#contact"],
      ["Soutenir nos actions", "/donate"],
    ],
  },
] as const;

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61577726301276",
    icon: Facebook,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/message/2VWPINXB6L34A1",
    icon: MessageCircle,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@christjuvalin1",
    icon: Music2,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/christ-juvalin-lessengui-aa4843299",
    icon: Linkedin,
  },
] as const;

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0B5A9B_0%,#123c5a_45%,#0B5A9B_100%)] text-white" id="contact">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-[-8rem] w-[min(72vw,700px)] bg-[url('/images/africa-map.svg')] bg-contain bg-right bg-no-repeat opacity-[0.09] sm:right-[-4rem] sm:w-[58vw]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(11,90,155,0.96),rgba(11,90,155,0.82),transparent)]" />

      <div className="relative mx-auto grid max-w-[1320px] gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:gap-8 lg:px-12 xl:grid-cols-[1.35fr_0.8fr_0.9fr_0.9fr_1fr] xl:gap-8 xl:py-[4.5rem]">
        <div className="max-w-[330px]">
          <Link aria-label="ONG-BK — accueil" className="inline-flex items-center gap-3" href="/">
            <span className="relative grid size-[54px] shrink-0 place-items-center overflow-hidden rounded-full border border-white/70 bg-white p-1.5">
              <Image
                alt=""
                className="object-contain"
                height={46}
                src="/images/logo-ong-bk.jpg"
                unoptimized
                width={46}
              />
            </span>
            <span>
              <span className="block font-display text-[22px] font-extrabold tracking-tight">ONG-BK</span>
              <span className="mt-0.5 block text-xs italic text-[#7ce0f4]">Donnons de la joie à la jeunesse</span>
            </span>
          </Link>
          <p className="mt-6 text-sm leading-7 text-white/75">
            Organisation engagée pour la jeunesse et l’épanouissement des communautés à
            Brazzaville et en République du Congo.
          </p>

          <div className="mt-7">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#7ce0f4]">Suivez nos actualités</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    aria-label={`ONG-BK sur ${label} (nouvel onglet)`}
                    className="grid size-10 place-items-center rounded-full border border-white/25 bg-white/[0.07] text-white transition-colors hover:border-[#19b8df] hover:bg-[#19b8df] hover:text-[#123c5a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2c542]"
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Icon aria-hidden="true" size={18} strokeWidth={2} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {sections.map((section) => (
          <nav aria-label={section.title} className="pt-1" key={section.title}>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#7ce0f4]">
              {section.title}
            </h2>
            <ul className="mt-5 grid gap-3.5">
              {section.links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    className="text-sm text-white/75 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f2c542]"
                    href={href}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="pt-1">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#7ce0f4]">Restons en contact</h2>
          <p className="mt-5 max-w-[270px] text-sm leading-6 text-white/75">
            Une question, une idée ou l’envie de contribuer ? Échangeons autour de vos
            initiatives.
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#123c5a] transition-colors hover:bg-[#f2c542] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-white"
            href="/contact"
          >
            Nous contacter <ArrowRight aria-hidden="true" size={16} />
          </Link>
          <a
            aria-label="Écrire à ONG-BK sur WhatsApp (nouvel onglet)"
            className="mt-5 flex w-fit items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
            href="https://wa.me/message/2VWPINXB6L34A1"
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={16} />
            Écrire sur WhatsApp
          </a>
          <Link
            className="mt-3 flex w-fit items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
            href="/contact"
          >
            <Mail aria-hidden="true" size={16} />
            Formulaire de contact
          </Link>
        </div>
      </div>

      <div className="relative border-t border-white/15">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
          <p>© {new Date().getFullYear()} ONG-BK · Tous droits réservés.</p>
          <p className="text-[#7ce0f4]">Amour · Solidarité · Fraternité</p>
        </div>
      </div>
    </footer>
  );
}
