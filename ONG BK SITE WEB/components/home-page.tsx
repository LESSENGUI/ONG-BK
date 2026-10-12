"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  HeartHandshake,
  Leaf,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publishedDomains } from "@/lib/domains";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HomeActivitiesCarousel, type HomeActivity } from "@/components/home-activities-carousel";

export function HomePage({ activities }: { activities: HomeActivity[] }) {
  return (
    <main>
      <section className="hero-map relative isolate overflow-hidden bg-[#f6f4f1]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_13%_81%,rgba(26,90,72,0.08),transparent_24%),radial-gradient(circle_at_78%_32%,rgba(233,186,72,0.12),transparent_18%)]" />
        <div className="relative mx-auto grid min-h-[730px] max-w-[1440px] items-center gap-8 px-6 py-12 sm:px-9 lg:min-h-[760px] lg:grid-cols-[0.86fr_1.14fr] lg:px-12 lg:py-16">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 max-w-[620px] pb-7 pt-4 lg:pb-16"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/80 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/70">
              <span className="size-1.5 rounded-full bg-[#3eb7a3]" /> Organisation non gouvernementale
            </p>
            <h1 className="home-slogan text-balance font-display text-[clamp(2.9rem,4.3vw,5rem)] font-extrabold leading-[1.12] tracking-[-0.06em] text-ink">
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="block"
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
              >
                Donnons de la
              </motion.span>
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className="home-slogan-accent block"
                initial={{ opacity: 0, y: 34, filter: "blur(12px)" }}
                transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
              >
                joie à la Jeunesse.
              </motion.span>
            </h1>
            <p className="mt-6 max-w-[500px] text-[15px] leading-7 text-ink/65 sm:text-[17px] sm:leading-8">
              Nous croyons au potentiel de chaque personne. Aux côtés des communautés, ONG BK agit pour ouvrir des chemins vers un avenir plus juste et plus solidaire.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild className="bg-[#f1c966] text-ink shadow-sm hover:-translate-y-0.5 hover:bg-[#e4b64a]" size="lg"><Link href="#actions">Découvrir nos actions <ArrowRight size={16} /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/adhesion">Je m’engage</Link></Button>
            </div>
            <div className="mt-10 flex items-center gap-3 text-xs text-ink/55">
              <div className="flex -space-x-2">
                {["action-education.jpg", "action-solidarite.jpg", "action-communaute.jpg"].map((image) => (
                  <span key={image} className="size-8 overflow-hidden rounded-full border-2 border-[#f6f4f1] bg-white">
                    <Image alt="" className="h-full w-full object-cover" height={32} src={`/images/${image}`} width={32} />
                  </span>
                ))}
              </div>
              <span>Au service des communautés, chaque jour.</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="hero-visual relative mx-auto w-full max-w-[720px] lg:-mr-3"
            initial={{ opacity: 0, x: 22 }}
            transition={{ duration: 0.75, delay: 0.12, ease: "easeOut" }}
          >
            <HomeHeroCarousel />
            <span className="hero-dot hero-dot-green" />
            <span className="hero-dot hero-dot-gold" />
            <span className="hero-dot hero-dot-blue" />
          </motion.div>
        </div>
      </section>

      <section className="border-y border-ink/[0.06] bg-white">
        <div className="mx-auto grid max-w-[1320px] gap-5 px-6 py-7 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink/10 sm:px-10 lg:px-12">
          <div className="flex items-center gap-3 sm:justify-center sm:px-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#edf3e8] text-forest"><UsersRound size={19} /></span>
            <p className="text-xs leading-5 text-ink/65"><strong className="block text-sm text-ink">Agir ensemble</strong>La force de l’engagement collectif</p>
          </div>
          <div className="flex items-center gap-3 sm:justify-center sm:px-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#f7f0df] text-[#a77a20]"><HeartHandshake size={19} /></span>
            <p className="text-xs leading-5 text-ink/65"><strong className="block text-sm text-ink">Être à l’écoute</strong>Des réponses ancrées dans le terrain</p>
          </div>
          <div className="flex items-center gap-3 sm:justify-center sm:px-6">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eaf0f6] text-[#47709b]"><Leaf size={19} /></span>
            <p className="text-xs leading-5 text-ink/65"><strong className="block text-sm text-ink">Voir plus loin</strong>Un engagement durable et solidaire</p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1320px] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20 lg:px-12 lg:py-28" id="mission">
        <div className="relative max-w-[550px]">
          <div className="absolute -left-8 -top-7 -z-10 size-24 rounded-full bg-[#f6f0df]" />
          <p className="section-eyebrow">À propos de ONG BK</p>
          <h2 className="section-title mt-4">Chaque communauté porte en elle une promesse.</h2>
          <p className="mt-5 text-sm leading-7 text-ink/65 sm:text-[15px]">
            ONG BK est une organisation engagée auprès des populations. Avec nos membres, bénévoles et partenaires, nous contribuons à des initiatives qui favorisent l’épanouissement, l’autonomie et la solidarité.
          </p>
          <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest hover:gap-3" href="#association">
            En savoir plus sur notre ONG <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-[#f7f6f0] p-6 sm:mt-8 sm:p-8">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-forest"><Sparkles size={20} /></span>
            <h3 className="mt-5 font-display text-lg font-bold">Notre vision</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">Des communautés où chacun peut trouver sa place, développer ses capacités et prendre part à un avenir commun.</p>
            <Link className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-forest" href="/a-propos#vision-mission">Lire notre vision <ArrowRight size={14} /></Link>
          </Card>
          <Card className="bg-[#f0f5f1] p-6 sm:p-8">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-forest"><HeartHandshake size={20} /></span>
            <h3 className="mt-5 font-display text-lg font-bold">Notre mission</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">Concevoir et soutenir des actions utiles, inclusives et durables, au plus près des besoins locaux.</p>
            <Link className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-forest" href="/a-propos#vision-mission">Découvrir notre mission <ArrowRight size={14} /></Link>
          </Card>
        </div>
      </section>

      <section className="overflow-hidden bg-[#123f34] py-16 text-white sm:py-20" id="histoire">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f1cf75]">Notre histoire</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">Un engagement qui se construit avec les communautés.</h2>
            <p className="mt-5 text-sm leading-7 text-white/75">L’histoire d’ONG BK s’exprime dans une conviction : les changements durables se construisent avec les personnes concernées. Écouter les réalités locales, reconnaître les capacités de chacun et créer des liens de solidarité donnent du sens à notre engagement.</p>
            <p className="mt-4 text-sm leading-7 text-white/75">Cette démarche relie la jeunesse, les familles, les bénévoles et les partenaires autour d’initiatives qui favorisent l’apprentissage, l’autonomie, le bien-être et la participation. Elle invite à avancer avec responsabilité, à partager les expériences et à apprendre de chaque action.</p>
            <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#f1cf75] hover:gap-3" href="/a-propos#historique">En savoir plus sur notre parcours <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Écouter", "Comprendre les besoins et les aspirations exprimés par les personnes et les communautés."],
              ["Agir", "Faire émerger des initiatives utiles, inclusives et adaptées aux réalités locales."],
              ["Apprendre", "Documenter les expériences et renforcer les actions avec les communautés et partenaires."],
            ].map(([title, description], index) => (
              <Link className="rounded-2xl border border-white/15 bg-white/[0.06] p-5 transition-colors hover:bg-white/[0.11]" href="/a-propos#historique" key={title}>
                <span className="font-display text-xs font-bold tracking-[0.16em] text-[#f1cf75]">0{index + 1}</span>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-white/70">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-white">Découvrir <ArrowUpRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper py-20 sm:py-24" id="domaines">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-[610px]">
              <p className="section-eyebrow">Ce qui nous anime</p>
              <h2 className="section-title mt-4">Des engagements qui font grandir.</h2>
            </div>
            <p className="max-w-[350px] pb-1 text-sm leading-6 text-ink/60">Nous agissons sur plusieurs leviers complémentaires pour accompagner les personnes et les territoires.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishedDomains.map(({ icon: Icon, number, title, shortDescription, slug, coverImage }) => (
              <Card key={slug} className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-7">
                <div className="flex items-start justify-between">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#edf3e8] text-forest"><Icon size={21} strokeWidth={1.8} /></span>
                  <span className="font-display text-xs font-bold tracking-widest text-ink/30">{number}</span>
                </div>
                <h3 className="mt-6 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 min-h-[48px] text-sm leading-6 text-ink/60">{shortDescription}</p>
                <Link className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-forest" href={`/domaines/${slug}`}>En savoir plus <ArrowRight size={14} /></Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 py-20 sm:px-10 lg:px-12 lg:py-28" id="actions">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-[590px]">
            <p className="section-eyebrow">Sur le terrain</p>
            <h2 className="section-title mt-4">Des actions proches des réalités.</h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:gap-3" href="/actions#terrain">Voir toutes nos activités <ArrowRight size={16} /></Link>
        </div>
        <HomeActivitiesCarousel activities={activities} />
      </section>

      <section className="bg-[#f5f2e9] py-16 sm:py-20" id="galerie">
        <div className="mx-auto grid max-w-[1320px] gap-9 px-6 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-12">
          <div>
            <p className="section-eyebrow">Rejoignez le mouvement</p>
            <h2 className="section-title mt-4">Les belles histoires se construisent à plusieurs.</h2>
            <p className="mt-4 max-w-[490px] text-sm leading-7 text-ink/65">Envie d’agir ? Devenir membre commence par une candidature et une démarche d’adhésion. Chaque engagement compte.</p>
            <Button asChild className="mt-7" size="lg" variant="forest"><Link href="/adhesion">Découvrir la procédure <ArrowRight size={16} /></Link></Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative col-span-2 h-[190px] overflow-hidden rounded-3xl sm:h-[245px]">
              <Image alt="Des enfants participent à une activité éducative" className="object-cover" fill sizes="(max-width: 1024px) 90vw, 50vw" src="/images/action-education.jpg" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
              <p className="absolute bottom-4 left-5 text-sm font-semibold text-white">Apprendre et s’épanouir</p>
            </div>
            <div className="relative h-[150px] overflow-hidden rounded-3xl sm:h-[190px]">
              <Image alt="Distribution de dons aux enfants par les équipes de ONG BK" className="object-cover" fill sizes="(max-width: 1024px) 45vw, 25vw" src="/images/action-solidarite.jpg" />
            </div>
            <div className="relative h-[150px] overflow-hidden rounded-3xl sm:h-[190px]">
              <Image alt="Enfants et membres réunis lors d'une action communautaire" className="object-cover" fill sizes="(max-width: 1024px) 45vw, 25vw" src="/images/action-communaute.jpg" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-6 py-20 sm:px-10 lg:px-12 lg:py-24" id="actualites">
        <div className="rounded-[32px] bg-forest px-7 py-10 text-white sm:px-12 sm:py-12 lg:flex lg:items-center lg:justify-between lg:px-16">
          <div className="max-w-[650px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/65">Actualités & opportunités</p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.045em] sm:text-4xl">Vous souhaitez soutenir nos prochaines actions ?</h2>
            <p className="mt-4 max-w-[560px] text-sm leading-6 text-white/75">Devenez partenaire, proposez un projet ou rejoignez notre communauté de bénévoles.</p>
          </div>
          <div className="mt-7 flex shrink-0 flex-wrap gap-3 lg:ml-8 lg:mt-0">
            <Button asChild><Link href="#partenaires">Devenir partenaire <ArrowRight size={15} /></Link></Button>
            <Button asChild variant="outline"><Link href="/adhesion">Nous rejoindre</Link></Button>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/[0.06] bg-[#fbfaf7] py-12" id="partenaires">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-7 px-6 text-center sm:px-10 lg:flex-row lg:px-12 lg:text-left">
          <div>
            <p className="section-eyebrow">Construire ensemble</p>
            <h2 className="mt-2 font-display text-xl font-bold">Partenaires & soutiens</h2>
          </div>
          <p className="max-w-[530px] text-sm leading-6 text-ink/60">Les collaborations avec les institutions, associations et acteurs engagés renforcent l’impact de nos initiatives.</p>
          <Link className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-forest" href="#contact">Parlons partenariat <ArrowUpRight size={15} /></Link>
        </div>
      </section>

      <section className="bg-[#f5f2e9] py-14" id="donate">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-5 px-6 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-12">
          <div>
            <p className="section-eyebrow">Soutenir nos actions</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Votre soutien contribue à faire grandir nos initiatives.</h2>
            <p className="mt-2 text-sm text-ink/60">Les modalités de don seront communiquées par l’équipe ONG BK.</p>
          </div>
          <Button asChild size="lg"><Link href="/contact">Nous contacter pour soutenir ONG BK <ArrowRight size={16} /></Link></Button>
        </div>
      </section>

    </main>
  );
}
