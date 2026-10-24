import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Handshake,
  HeartHandshake,
  HeartPulse,
  Landmark,
  Leaf,
  Newspaper,
  School,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { publishedDomains } from "@/lib/domains";
import { HomeHeroCarousel } from "@/components/home-hero-carousel";
import { HomeActivitiesCarousel, type HomeActivity } from "@/components/home-activities-carousel";
import { HomeJoinGallery } from "@/components/home-join-gallery";
import { convictions } from "@/lib/about-preamble";

export type HomeNews = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  coverMediaId: string | null;
  coverMediaAlt: string | null;
};

export type HomeProject = {
  slug: string;
  title: string;
  description: string;
  domain: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  coverMediaId: string | null;
  coverMediaAlt: string | null;
};

export type HomeOpportunity = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  type: string;
  publishedAt: string | null;
  applicationPeriod: { start: string; end: string } | null;
};

export const impactCards = [
  {
    title: "Apprendre et réussir",
    figure: "2 300",
    label: "enfants scolarisés",
    details: ["5 000 kits scolaires distribués", "1 000 personnes sensibilisées aux droits de l’enfant", "600 heures de soutien scolaire", "80 % de réussite aux examens des élèves soutenus"],
  },
  {
    title: "Se former et entreprendre",
    figure: "800",
    label: "jeunes formés professionnellement",
    details: ["120 microentreprises accompagnées", "300 femmes soutenues dans leur autonomie économique"],
  },
  {
    title: "Renforcer la solidarité",
    figure: "10 000",
    label: "bénéficiaires directs en 2024",
    details: ["3 000 repas distribués", "200 familles accompagnées", "150 enfants orphelins soutenus"],
  },
  {
    title: "Agir pour le bien-être",
    figure: "400",
    label: "consultations médicales gratuites",
    details: ["15 campagnes de sensibilisation", "30 événements communautaires"],
  },
  {
    title: "Faire vivre la culture et l’environnement",
    figure: "50",
    label: "ateliers culturels organisés",
    details: ["500 arbres plantés dans le cadre des actions environnementales"],
  },
  {
    title: "Mobiliser les communautés",
    figure: "20",
    label: "partenariats locaux et internationaux",
    details: ["100 bénévoles mobilisés", "250 jeunes engagés dans le volontariat", "90 % de satisfaction des bénéficiaires"],
  },
];

const formatHomeDate = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));

export function HomePage({
  activities,
  activitiesUnavailable = false,
  news = [],
  newsUnavailable = false,
  projects = [],
  projectsUnavailable = false,
  opportunities = [],
  opportunitiesUnavailable = false,
}: {
  activities: HomeActivity[];
  activitiesUnavailable?: boolean;
  news?: HomeNews[];
  newsUnavailable?: boolean;
  projects?: HomeProject[];
  projectsUnavailable?: boolean;
  opportunities?: HomeOpportunity[];
  opportunitiesUnavailable?: boolean;
}) {
  return (
    <main>
      <section className="home-hero relative isolate flex min-h-[690px] flex-col overflow-hidden bg-[#193b4b] sm:min-h-[660px] lg:min-h-[640px]">
        <HomeHeroCarousel />
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-5 pt-24 sm:px-9 sm:pb-7 sm:pt-28 lg:px-12">
          <div className="home-copy-enter flex flex-1 items-center justify-center py-8 text-center">
            <div className="max-w-[850px]">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(11,90,155,0.13)] bg-white/85 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--bk-marine)] shadow-sm backdrop-blur-sm sm:text-xs">
                <span className="size-1.5 rounded-full bg-[var(--bk-rose)]" />
                Organisation non gouvernementale
              </p>
              <h1 className="home-slogan text-balance font-display text-[clamp(2rem,6.3vw,5.75rem)] font-extrabold leading-[1.04] tracking-[-0.065em] text-[var(--bk-marine)]">
                <span className="home-title-line block">Donnons de la</span>
                <span className="home-title-line home-title-line-second home-slogan-accent mx-auto block">
                  joie à la Jeunesse.
                </span>
              </h1>
              <p className="home-hero-description mx-auto mt-6 max-w-[680px] text-[15px] leading-7 text-ink/75 sm:text-lg sm:leading-8">
                Nous croyons au potentiel de chaque personne. Aux côtés des communautés, ONG BK agit pour ouvrir des chemins vers un avenir plus juste et plus solidaire.
              </p>
            </div>
          </div>

          <div className="grid items-center gap-5 rounded-[24px] border border-white/70 bg-white/80 p-4 shadow-[0_12px_36px_rgba(11,90,155,0.08)] backdrop-blur-md sm:p-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.6fr)] lg:gap-8 lg:px-7">
            <div className="flex items-center gap-3 text-xs leading-5 text-ink/65 sm:text-sm">
              <div aria-hidden="true" className="flex shrink-0 -space-x-2">
                {["action-education.jpg", "action-solidarite.jpg", "action-communaute.jpg"].map((image) => (
                  <span key={image} className="size-9 overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                    <Image alt="" className="h-full w-full object-cover" height={36} src={`/images/${image}`} width={36} />
                  </span>
                ))}
              </div>
              <span>Au service des communautés, chaque jour.</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild className="w-full justify-center bg-[var(--bk-ciel)] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[var(--bk-bleu-clair)]" size="lg">
                <Link href="#actions">Découvrir nos actions <ArrowRight size={16} /></Link>
              </Button>
              <Button asChild className="w-full justify-center bg-[var(--bk-rose)] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[var(--bk-rose)]/90" size="lg">
                <Link href="/adhesion">Je m’engage</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-section py-14 sm:py-20" aria-labelledby="impact-title">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-[700px] text-center">
            <p className="section-eyebrow">Quelques chiffres clés</p>
            <h2 className="section-title mt-3" id="impact-title">L’action de l’ONG BK en six repères.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-ink/55">Des indicateurs présentés dans les contenus institutionnels de l’organisation.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {impactCards.map((card, index) => {
              const Icon = [BookOpen, BriefcaseBusiness, HeartHandshake, HeartPulse, Leaf, UsersRound][index] ?? UsersRound;
              return (
                <article className="impact-card group !min-h-0 !rounded-[22px] !p-5 !shadow-[0_10px_28px_rgba(11,90,155,0.055)] sm:!p-6" data-reveal key={card.title} style={{ animationDelay: `${index * 70}ms` }}>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgba(25,167,230,0.09)] text-[var(--bk-ciel)]">
                      <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
                    </span>
                    <p className="text-[10px] font-bold uppercase leading-4 tracking-[0.12em] text-ink/50">{card.title}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-display text-[1.75rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--bk-marine)] sm:text-3xl">{card.figure}</p>
                    <p className="text-xs font-semibold leading-5 text-[var(--bk-bleu-clair)]">{card.label}</p>
                  </div>
                  <details className="mt-4 border-t border-[rgba(11,90,155,0.09)] pt-3">
                    <summary className="w-fit cursor-pointer text-[11px] font-semibold text-[var(--bk-ciel)] decoration-[rgba(11,90,155,0.3)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bk-ciel)]">
                      Voir les indicateurs associés ({card.details.length})
                    </summary>
                    <ul className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                      {card.details.map((detail) => (
                        <li className="flex gap-2 text-[10px] leading-[1.45rem] text-ink/55 sm:text-[11px]" key={detail}>
                          <span aria-hidden="true" className="mt-[9px] size-1 shrink-0 rounded-full bg-[var(--bk-rose)]" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </details>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] py-20 sm:py-24" id="mission">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-6 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-12">
          <div className="relative">
            <p className="section-eyebrow">Notre identité</p>
            <h2 className="section-title mt-4">Qui nous sommes</h2>
            <p className="mt-5 text-sm leading-7 text-ink/65 sm:text-[15px]">
              ONG BK est une organisation engagée auprès des populations. Avec ses membres, bénévoles et partenaires, elle contribue à des initiatives qui favorisent l’épanouissement, l’autonomie et la solidarité.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-soft" href="/about/vision">
                <span className="grid size-10 place-items-center rounded-xl bg-[#edf3e8] text-forest"><Sparkles size={18} /></span>
                <span className="mt-3 block font-display text-sm font-bold">Notre vision</span>
                <span className="mt-1 block text-xs leading-5 text-ink/60">Une jeunesse actrice de son avenir, dans des communautés solidaires.</span>
              </Link>
              <Link className="rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-soft" href="/about/mission">
                <span className="grid size-10 place-items-center rounded-xl bg-[#f7f0df] text-[#a77a20]"><HeartHandshake size={18} /></span>
                <span className="mt-3 block font-display text-sm font-bold">Notre mission</span>
                <span className="mt-1 block text-xs leading-5 text-ink/60">Accompagner la jeunesse et les communautés par des initiatives utiles.</span>
              </Link>
            </div>
            <Link className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest hover:gap-3" href="/a-propos">
              Découvrir l’ONG BK <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative min-h-[300px] overflow-hidden rounded-[30px] bg-[#dce7df] shadow-[0_24px_70px_rgba(16,36,61,0.13)] sm:min-h-[390px]">
            <Image alt="Des membres de la communauté réunis autour d’une activité collective" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 55vw" src="/images/action-communaute.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10243d]/65 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 max-w-sm font-display text-xl font-bold leading-snug text-white sm:bottom-8 sm:left-8 sm:text-2xl">
              Agir avec les communautés, au plus près de leurs réalités.
            </p>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f5f7f8] py-20 sm:py-28" id="histoire">
        <div aria-hidden="true" className="absolute -right-32 -top-40 size-[520px] rounded-full bg-[radial-gradient(circle,rgba(11,90,155,0.07),transparent_68%)]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-12 px-6 sm:px-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16 lg:px-12">
          <div className="max-w-[470px]">
            <p className="section-eyebrow">Notre histoire</p>
            <h2 className="section-title mt-4">Un engagement qui se construit avec les communautés.</h2>
            <p className="mt-5 text-sm leading-7 text-ink/65">Le parcours institutionnel de l’ONG BK s’articule autour de trois repères documentés, de ses débuts à son enregistrement officiel.</p>
            <Link className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[var(--bk-ciel)] transition hover:gap-3 hover:text-[var(--bk-marine)]" href="/notre-histoire">En savoir plus sur notre parcours <ArrowRight size={16} /></Link>
          </div>
          <ol className="relative grid gap-4 sm:grid-cols-3 sm:gap-5 sm:before:absolute sm:before:left-[12%] sm:before:right-[12%] sm:before:top-[25px] sm:before:h-px sm:before:bg-[rgba(11,90,155,0.18)]">
            {[
              ["24 juin 2024", "Début de l’organisation"],
              ["26 septembre 2026", "Obtention des documents officiels"],
              ["Octobre 2026", "Enregistrement au Journal officiel"],
            ].map(([date, event], index) => (
              <li className="relative rounded-[24px] border border-[rgba(16,36,61,0.08)] bg-white p-5 shadow-[0_14px_40px_rgba(16,36,61,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,36,61,0.1)] sm:p-6" key={date}>
                <span aria-hidden="true" className="relative z-10 grid size-[50px] place-items-center rounded-2xl border border-[rgba(11,90,155,0.12)] bg-white font-display text-xs font-extrabold tracking-[0.12em] text-[var(--bk-ciel)] shadow-[0_4px_14px_rgba(16,36,61,0.06)]">0{index + 1}</span>
                <time className="mt-7 block font-display text-lg font-bold leading-snug tracking-tight text-[var(--bk-marine)] sm:min-h-[52px]">{date}</time>
                <span className="mt-4 block h-[2px] w-10 rounded-full bg-[var(--bk-rose)]" />
                <p className="mt-4 text-sm leading-6 text-ink/65">{event}</p>
              </li>
            ))}
          </ol>
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
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {convictions.map((conviction, index) => {
              const Icon = [HeartPulse, Sparkles, BookOpen, CheckCircle2, UsersRound, Leaf, School][index] ?? CheckCircle2;
              return (
                <Link className="group rounded-3xl border border-ink/[0.08] bg-white p-5 shadow-[0_8px_30px_rgba(16,36,61,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-6" href={`/about/convictions/${conviction.number}`} key={conviction.number}>
                  <div className="flex items-center justify-between">
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#edf3e8] text-forest"><Icon size={20} /></span>
                    <span className="font-display text-xs font-bold tracking-[0.16em] text-ink/30">0{conviction.number}</span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-bold leading-snug text-ink">{conviction.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-ink/60">{conviction.explanation}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-forest group-hover:gap-3">Explorer <ArrowRight size={14} /></span>
                </Link>
              );
            })}
          </div>
          <div className="mt-14 flex flex-col justify-between gap-4 border-t border-ink/10 pt-8 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Nos domaines d’intervention</p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">Des réponses complémentaires aux besoins des communautés.</h3>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-forest" href="/domaines">Tous nos domaines <ArrowRight size={15} /></Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <HomeActivitiesCarousel activities={activities} unavailable={activitiesUnavailable} />
      </section>

      <section className="bg-[#f5f2e9] py-16 sm:py-20" id="galerie">
        <div className="mx-auto grid max-w-[1320px] gap-9 px-6 sm:px-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-12">
          <div>
            <p className="section-eyebrow">S’engager à nos côtés</p>
            <h2 className="section-title mt-4">Pourquoi nous rejoindre&nbsp;?</h2>
            <p className="mt-4 max-w-[490px] text-sm leading-7 text-ink/65">Rejoindre ONG BK, c’est choisir de mettre l’engagement collectif au service de la jeunesse et des communautés, dans le respect des besoins exprimés et des possibilités de chacun.</p>
            <ul className="mt-6 grid gap-3 text-sm text-ink/75">
              {[
                "Prendre part à des initiatives solidaires et communautaires.",
                "Partager ses compétences au service d’actions utiles.",
                "Contribuer à des projets porteurs de sens, selon ses disponibilités.",
              ].map((reason) => <li className="flex items-start gap-3" key={reason}><CheckCircle2 className="mt-0.5 shrink-0 text-[var(--bk-bleu-clair)]" size={17} />{reason}</li>)}
            </ul>
            <Button asChild className="mt-7" size="lg" variant="forest"><Link href="/adhesion">Découvrir les modalités d’engagement <ArrowRight size={16} /></Link></Button>
          </div>
          <HomeJoinGallery />
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24" id="actualites">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">La vie de l’organisation</p>
              <h2 className="section-title mt-3">Actualités</h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actualites">Toutes les actualités <ArrowRight size={15} /></Link>
          </div>
          {newsUnavailable ? (
            <p className="mt-8 rounded-3xl border border-ink/10 bg-[#fbfaf7] p-6 text-sm leading-6 text-ink/60">Les actualités publiées ne sont pas disponibles pour le moment. Consultez la page Actualités ultérieurement.</p>
          ) : news.length > 0 ? (
            <div className="mt-9 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              {news.slice(0, 1).map((item) => (
                <article className="overflow-hidden rounded-[28px] border border-ink/10 bg-white shadow-[0_14px_50px_rgba(16,36,61,0.07)]" key={item.slug}>
                  <Link className="group grid h-full md:grid-cols-[1fr_0.9fr]" href={`/actualites/${item.slug}`}>
                    <div className="relative min-h-[230px] bg-[#edf3e8] md:min-h-[370px]">
                      {item.coverMediaId ? <Image alt={item.coverMediaAlt || item.title} className="object-cover transition duration-500 group-hover:scale-[1.025]" fill sizes="(max-width: 768px) 100vw, 50vw" src={`/api/media/${item.coverMediaId}`} /> : <div className="grid h-full min-h-[230px] place-items-center text-forest/60"><Newspaper size={48} strokeWidth={1.2} /></div>}
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-8">
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--bk-bleu-clair)]">{item.category || "Actualité"}</span>
                      <h3 className="mt-4 font-display text-xl font-bold leading-snug text-ink sm:text-2xl">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-ink/60">{item.summary}</p>
                      <time className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-ink/50" dateTime={item.publishedAt}><CalendarDays size={14} />{formatHomeDate(item.publishedAt)}</time>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest">Lire l’actualité <ArrowRight size={15} /></span>
                    </div>
                  </Link>
                </article>
              ))}
              <div className="grid gap-4">
                {news.slice(1, 4).map((item) => (
                  <article className="rounded-3xl border border-ink/10 bg-[#fbfaf7] p-5 transition hover:-translate-y-0.5 hover:shadow-soft sm:p-6" key={item.slug}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--bk-bleu-clair)]">{item.category || "Actualité"}</p>
                    <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/60">{item.summary}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <time className="inline-flex items-center gap-2 text-xs text-ink/50" dateTime={item.publishedAt}><CalendarDays size={14} />{formatHomeDate(item.publishedAt)}</time>
                      <Link className="inline-flex items-center gap-1 text-xs font-bold text-forest" href={`/actualites/${item.slug}`}>Lire <ArrowRight size={14} /></Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-ink/15 bg-[#fbfaf7] px-6 py-12 text-center">
              <Newspaper className="mx-auto text-forest/55" size={30} strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">Aucune actualité publiée pour le moment</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/60">Les nouvelles seront affichées ici dès leur publication officielle.</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actualites">Visiter la page Actualités <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#f5f7f5] py-20 sm:py-24" id="projets">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Initiatives en cours</p>
              <h2 className="section-title mt-3">Projets</h2>
            </div>
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actions#projets">Projets en cours <ArrowRight size={15} /></Link>
          </div>
          {projectsUnavailable ? (
            <p className="mt-8 rounded-3xl border border-ink/10 bg-white p-6 text-sm leading-6 text-ink/60">Les informations sur les projets ne sont pas disponibles pour le moment.</p>
          ) : projects.length > 0 ? (
            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article className="overflow-hidden rounded-[26px] border border-ink/10 bg-white shadow-[0_12px_40px_rgba(16,36,61,0.06)]" key={project.slug}>
                  <div className="relative h-[210px] bg-[#e8eee9]">
                    {project.coverMediaId ? <Image alt={project.coverMediaAlt || project.title} className="object-cover" fill sizes="(max-width: 1024px) 100vw, 33vw" src={`/api/media/${project.coverMediaId}`} /> : <div className="grid h-full place-items-center text-forest/50"><BriefcaseBusiness size={42} strokeWidth={1.3} /></div>}
                  </div>
                  <div className="p-6">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#edf3e8] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-forest"><span className="size-1.5 rounded-full bg-forest" />En cours</span>
                    <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink">{project.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/60">{project.description}</p>
                    <p className="mt-4 text-xs font-semibold text-ink/50">{project.domain}</p>
                    {project.startDate && <p className="mt-2 text-xs text-ink/50">Période : {formatHomeDate(project.startDate)}{project.endDate ? ` au ${formatHomeDate(project.endDate)}` : ""}</p>}
                    <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actions#projets">Voir les informations disponibles <ArrowRight size={15} /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-ink/15 bg-white px-6 py-12 text-center">
              <BriefcaseBusiness className="mx-auto text-forest/55" size={30} strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">Aucun projet en cours publié</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/60">Cette section présente uniquement les projets actuellement publiés par l’ONG BK.</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actions#projets">Consulter la page Projets en cours <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24" id="opportunites">
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Participer aux initiatives</p>
              <h2 className="section-title mt-3">Opportunités</h2>
            </div>
            <Button asChild size="lg" variant="forest"><Link href="/actions#candidatures">Découvrir les opportunités <ArrowRight size={16} /></Link></Button>
          </div>
          {opportunitiesUnavailable ? (
            <p className="mt-8 rounded-3xl border border-ink/10 bg-[#fbfaf7] p-6 text-sm leading-6 text-ink/60">Les opportunités publiées ne sont pas disponibles pour le moment. Consultez la page Projets en cours ultérieurement.</p>
          ) : opportunities.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {opportunities.map((opportunity) => (
                <article className="rounded-3xl border border-ink/10 bg-[#fbfaf7] p-6 sm:p-7" key={opportunity.slug}>
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf3e8] text-forest"><UsersRound size={20} /></span>
                    <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-forest">{opportunity.category || "Opportunité"}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold leading-snug text-ink">{opportunity.title}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-ink/45">{opportunity.type === "VOLUNTEER_CALL" ? "Appel à bénévolat" : opportunity.type === "TRAINING_CALL" ? "Appel à formation" : "Appel à projets"}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{opportunity.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink/50">
                    {opportunity.publishedAt && <span className="inline-flex items-center gap-2"><CalendarDays size={14} />Publié le {formatHomeDate(opportunity.publishedAt)}</span>}
                    {opportunity.applicationPeriod && <span>Candidatures : {formatHomeDate(opportunity.applicationPeriod.start)} au {formatHomeDate(opportunity.applicationPeriod.end)}</span>}
                  </div>
                  <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest" href={`/actions/offres/${opportunity.slug}`}>Consulter l’opportunité <ArrowRight size={15} /></Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-dashed border-ink/15 bg-[#fbfaf7] px-6 py-12 text-center">
              <CalendarDays className="mx-auto text-forest/55" size={30} strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg font-bold text-ink">Aucune opportunité publiée actuellement</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/60">Les appels et candidatures seront affichés ici dès leur publication.</p>
              <Link className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-forest" href="/actions#candidatures">Consulter les projets en cours <ArrowRight size={15} /></Link>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f5f2e9] py-16 sm:py-20" id="nous-rejoindre">
        <div className="mx-auto grid max-w-[1320px] gap-9 px-6 sm:px-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:px-12">
          <div>
            <p className="section-eyebrow">Passer à l’action</p>
            <h2 className="section-title mt-4">Nous rejoindre</h2>
            <p className="mt-4 max-w-[520px] text-sm leading-7 text-ink/65">Vous souhaitez vous engager auprès de l’ONG BK&nbsp;? Découvrez la démarche d’adhésion et les modalités de candidature présentées par l’organisation.</p>
            <Button asChild className="mt-7" size="lg" variant="forest"><Link href="/adhesion">Découvrir la démarche d’adhésion <ArrowRight size={16} /></Link></Button>
          </div>
          <div className="relative min-h-[260px] overflow-hidden rounded-[28px] shadow-[0_22px_60px_rgba(16,36,61,0.12)] sm:min-h-[340px]">
            <Image alt="Des jeunes réunis dans le cadre d’une activité éducative" className="object-cover" fill sizes="(max-width: 1024px) 100vw, 55vw" src="/images/action-education.jpg" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10243d]/45 to-transparent" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#10243d] py-20 text-white sm:py-24" id="partenaires">
        <div aria-hidden="true" className="absolute -right-24 -top-36 size-[440px] rounded-full border border-white/[0.08]" />
        <div className="relative mx-auto grid max-w-[1320px] gap-10 px-6 sm:px-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-12">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f1cf75]">Construire ensemble</p>
            <h2 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight tracking-[-0.04em] sm:text-4xl">Les collaborations donnent plus de portée aux initiatives.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">ONG BK souhaite développer des relations de confiance avec les institutions, les associations, les entreprises et les personnes qui partagent son engagement. Les modalités de collaboration se construisent avec l’équipe.</p>
            <Button asChild className="mt-7" size="lg"><Link href="/partenaires#contact">Parlons partenariat <ArrowUpRight size={16} /></Link></Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              { icon: Landmark, title: "Institutions", description: "Mettre en dialogue les priorités et les besoins des communautés." },
              { icon: Handshake, title: "Expertises", description: "Partager des compétences utiles aux initiatives." },
              { icon: HeartHandshake, title: "Engagements solidaires", description: "Faire émerger des collaborations responsables." },
            ].map(({ icon: Icon, title, description }) => (
              <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-5" key={title}>
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#f1cf75]"><Icon size={19} /></span>
                <div><h3 className="font-display text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/60">{description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f2e9] py-16 sm:py-20" id="donate">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-6 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="max-w-3xl">
            <p className="section-eyebrow">Soutenir nos actions</p>
            <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">Chaque forme de soutien commence par un échange.</h2>
            <p className="mt-3 text-sm leading-6 text-ink/60">Pour connaître les possibilités de soutien et leurs modalités, prenez contact avec l’équipe de l’ONG BK.</p>
          </div>
          <Button asChild size="lg" variant="forest"><Link href="/contact">Nous contacter <ArrowRight size={16} /></Link></Button>
        </div>
      </section>

    </main>
  );
}
