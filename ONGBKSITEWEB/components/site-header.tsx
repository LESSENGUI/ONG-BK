"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleDollarSign,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navGroups = [
  {
    title: "À propos",
    href: "/a-propos",
    links: [
      ["Présentation de l'ONG", "/a-propos#association"],
      ["Vision et mission", "/a-propos#mission"],
      ["Objectifs et valeurs", "/a-propos#valeurs"],
      ["Historique et gouvernance", "/a-propos#gouvernance"],
      ["Documents officiels", "/a-propos#documents"],
    ],
  },
  {
    title: "Domaines",
    href: "/domaines",
    links: [
      ["Éducation", "/domaines#education"],
      ["Formation professionnelle", "/domaines#formation"],
      ["Entrepreneuriat", "/domaines#entrepreneuriat"],
      ["Culture et environnement", "/domaines#culture"],
      ["Santé communautaire", "/domaines#sante"],
    ],
  },
  {
    title: "Actions",
    href: "/actions",
    links: [
      ["Projets en cours", "/actions#projets"],
      ["Projets réalisés", "/actions#realisations"],
      ["Programmes et campagnes", "/actions#programmes"],
      ["Activités sur le terrain", "/actions#terrain"],
      ["Proposer un partenariat", "/contact"],
    ],
  },
  {
    title: "Actualités",
    href: "/actualites",
    links: [
      ["Actualités de l'ONG", "/actualites"],
      ["Communiqués officiels", "/actualites#communiques"],
      ["Galerie photos", "/actualites#galerie"],
      ["Publications et rapports", "/actualites#publications"],
    ],
  },
];

const joinLinks = [
  ["Devenir membre", "/adhesion"],
  ["Devenir bénévole", "/adhesion?type=benevole"],
  ["Rejoindre une équipe locale", "/adhesion?type=equipes"],
  ["Questions fréquentes", "/adhesion#questions"],
  ["Partenaires", "/partenaires"],
  ["Devenir partenaire", "/partenaires#contact"],
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="hidden bg-[linear-gradient(90deg,rgba(25,167,230,0.08),rgba(232,25,95,0.04),rgba(255,255,255,0.7))] py-2 text-ink sm:block">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 text-[11px] tracking-wide lg:px-12">
          <p className="text-[var(--bk-marine)]/75">Ensemble, faisons grandir les initiatives locales.</p>
          <Link className="text-[var(--bk-texte)]/80 transition-colors hover:text-[var(--bk-ciel)]" href="/contact">Une question ? Écrivez-nous</Link>
        </div>
      </div>
      <header className="relative z-30 border-b border-[rgba(59,74,90,0.08)] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between gap-5 px-5 md:px-9 xl:px-12">
          <Link href="/" aria-label="ONG BK — accueil" className="flex shrink-0 items-center gap-2.5">
            <span aria-hidden="true" className="relative h-8 w-11 shrink-0 overflow-hidden">
              <Image alt="" className="absolute inset-x-0 top-0 h-11 w-11 object-cover" height={44} priority src="/images/logo-ong-bk.jpg" unoptimized width={44} />
            </span>
            <span className="font-display text-[20px] font-extrabold tracking-[-0.055em] text-ink">ONG BK</span>
          </Link>
          <nav aria-label="Navigation principale" className="hidden items-center gap-1 xl:flex">
            <Link className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`} href="/">Accueil</Link>
            {navGroups.map((group) => (
              <div className="group relative" key={group.title}>
                <Link className={`nav-link inline-flex items-center gap-1.5 ${pathname === group.href ? "nav-link-active" : ""}`} href={group.href}>
                  {group.title}<ChevronDown className="transition-transform group-hover:rotate-180" size={13} />
                </Link>
                <div className="invisible absolute left-0 top-full z-40 w-64 translate-y-2 rounded-2xl border border-[rgba(59,74,90,0.08)] bg-white p-2 opacity-0 shadow-soft transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {group.links.map(([label, link]) => <Link key={label} className="block rounded-xl px-3.5 py-2.5 text-[12px] text-ink/70 transition-colors hover:bg-[rgba(25,167,230,0.06)] hover:text-[var(--bk-marine)]" href={link}>{label}</Link>)}
                </div>
              </div>
            ))}
            <Link className={`nav-link ${pathname === "/contact" ? "nav-link-active" : ""}`} href="/contact">Contact</Link>
          </nav>
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <Link className={`text-[11px] font-semibold transition-colors hover:text-forest ${pathname === "/admin" ? "text-forest" : "text-ink/65"}`} href="/admin">Adminis</Link>
            <Button asChild className="bg-[var(--bk-rose)] text-white shadow-[0_12px_26px_rgba(232,25,95,0.26)] hover:-translate-y-0.5 hover:bg-[var(--bk-rose)]/90">
              <Link href="/donate"><CircleDollarSign size={15} /> Donate</Link>
            </Button>
            <div className="group relative">
              <Button asChild><Link href="/adhesion">Nous rejoindre <ChevronDown className="transition-transform group-hover:rotate-180" size={14} /></Link></Button>
              <div className="invisible absolute right-0 top-full z-40 w-64 translate-y-2 rounded-2xl border border-[rgba(59,74,90,0.08)] bg-white p-2 opacity-0 shadow-soft transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {joinLinks.map(([label, link]) => <Link key={label} className="block rounded-xl px-3.5 py-2.5 text-[12px] text-ink/70 transition-colors hover:bg-[rgba(25,167,230,0.06)] hover:text-[var(--bk-marine)]" href={link}>{label}</Link>)}
              </div>
            </div>
          </div>
          <button aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={mobileMenuOpen} className="grid size-11 place-items-center rounded-full border border-ink/10 text-ink xl:hidden" onClick={() => setMobileMenuOpen((open) => !open)} type="button">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav aria-label="Navigation mobile" className="absolute inset-x-0 top-full z-50 max-h-[80vh] overflow-y-auto border-t border-ink/10 bg-white px-5 pb-6 pt-3 shadow-soft xl:hidden">
            <Link className="mobile-nav-link font-bold text-forest" href="/" onClick={closeMobileMenu}>Accueil</Link>
            {navGroups.map((group) => (
              <details className="border-b border-ink/[0.07] py-2" key={group.title}>
                <summary className="cursor-pointer list-none py-2.5 text-sm font-semibold text-ink">{group.title}</summary>
                <div className="grid gap-1 pb-2 pl-3">
                  <Link className="py-2 text-sm font-medium text-forest" href={group.href} onClick={closeMobileMenu}>Tout sur {group.title.toLowerCase()}</Link>
                  {group.links.map(([label, link]) => <Link key={label} className="py-2 text-sm text-ink/65" href={link} onClick={closeMobileMenu}>{label}</Link>)}
                </div>
              </details>
            ))}
            <Link className="mobile-nav-link" href="/contact" onClick={closeMobileMenu}>Contact</Link>
            <Link className="mobile-nav-link font-semibold text-forest" href="/admin" onClick={closeMobileMenu}>Adminis — connexion</Link>
            <Link className="mobile-nav-link font-semibold text-forest" href="/donate" onClick={closeMobileMenu}>Donate</Link>
            <details className="border-b border-ink/[0.07] py-2">
              <summary className="cursor-pointer list-none py-2.5 text-sm font-semibold text-ink">Nous rejoindre</summary>
              <div className="grid gap-1 pb-2 pl-3">
                {joinLinks.map(([label, link]) => <Link key={label} className="py-2 text-sm text-ink/65" href={link} onClick={closeMobileMenu}>{label}</Link>)}
              </div>
            </details>
            <Button asChild className="mt-4 w-full"><Link href="/adhesion" onClick={closeMobileMenu}>Nous rejoindre <ArrowRight size={15} /></Link></Button>
          </nav>
        )}
      </header>
    </>
  );
}
