import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, ClipboardList, HandHeart, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DomainHero } from "@/app/domaines/domain-hero";
import { AxisDialog } from "@/app/domaines/[slug]/axis-dialog";
import { getDomainBySlug, publishedDomains } from "@/lib/domains";

type DomainPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return publishedDomains.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: DomainPageProps) {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);
  if (!domain) return {};

  return {
    title: `${domain.title} | Domaines d’intervention | ONG BK`,
    description: domain.shortDescription,
    openGraph: {
      title: `${domain.title} | ONG BK`,
      description: domain.shortDescription,
      type: "article",
    },
  };
}

export default async function DomainDetailPage({ params }: DomainPageProps) {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);
  if (!domain) notFound();

  const currentIndex = publishedDomains.findIndex((item) => item.slug === domain.slug);
  const previous = publishedDomains[(currentIndex - 1 + publishedDomains.length) % publishedDomains.length];
  const next = publishedDomains[(currentIndex + 1) % publishedDomains.length];
  return (
    <main className="min-h-screen bg-white">
      <DomainHero
        description={`${domain.subtitle} ${domain.shortDescription}`}
        eyebrow={`Domaine ${domain.number}`}
        targetId="domain-detail-content"
        title={domain.title}
      />

      <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1180px] items-center gap-2 px-5 pt-7 text-xs text-ink/55 sm:px-8 lg:px-12">
        <Link className="transition-colors hover:text-forest" href="/">Accueil</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <Link className="transition-colors hover:text-forest" href="/domaines">Nos domaines</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page" className="font-semibold text-ink">{domain.title}</span>
      </nav>

      <section className="mx-auto grid max-w-[1180px] gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20 lg:px-12" id="domain-detail-content">
        <div>
          <p className="section-eyebrow">Comprendre notre démarche</p>
          <h2 className="section-title mt-3">Pourquoi ce domaine compte.</h2>
          <p className="mt-5 text-sm leading-7 text-ink/65 sm:text-[15px]">{domain.introduction}</p>
          <p className="mt-4 text-sm leading-7 text-ink/65 sm:text-[15px]">{domain.approach}</p>
          <div className="mt-8 rounded-2xl border border-forest/15 bg-[#f3f7f3] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-white text-forest"><UsersRound size={20} /></span>
              <h3 className="font-display text-base font-bold text-ink">Public concerné</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink/65">{domain.targetAudience}</p>
          </div>
        </div>
        <aside className="rounded-[26px] bg-[#f8f7f4] p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-xl bg-white text-forest"><CheckCircle2 size={21} /></span>
          <h2 className="mt-5 font-display text-xl font-bold text-ink">Nos objectifs</h2>
          <ul className="mt-5 grid gap-4">
            {domain.objectives.map((objective) => (
              <li className="flex gap-3 text-sm leading-6 text-ink/70" key={objective}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-forest" size={17} />
                {objective}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="bg-[#f8f7f4] py-16 sm:py-20">
        <div className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-[670px]">
            <p className="section-eyebrow">Axes d’intervention</p>
            <h2 className="section-title mt-3">Des pistes adaptées aux besoins locaux.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/65">Ces axes constituent une base éditoriale de présentation. Leur mise en œuvre dépend des priorités définies avec les communautés.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {domain.axes.map(({ icon: AxisIcon, ...axis }, index) => (
              <AxisDialog axis={axis} icon={<AxisIcon aria-hidden="true" size={21} strokeWidth={1.8} />} key={axis.title} number={`0${index + 1}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1180px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-12">
        <div>
          <p className="section-eyebrow">Actions possibles</p>
          <h2 className="section-title mt-3">Des activités à construire ensemble.</h2>
          <p className="mt-4 text-sm leading-7 text-ink/65">Les exemples ci-dessous sont des pistes d’activités, et non des réalisations déjà publiées.</p>
          <ul className="mt-6 grid gap-3">
            {domain.activities.map((activity) => (
              <li className="flex items-start gap-3 rounded-xl border border-ink/[0.07] bg-white p-4 text-sm leading-6 text-ink/70" key={activity}>
                <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-forest" size={17} />
                {activity}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid content-start gap-5">
          <div className="rounded-[24px] border border-ink/[0.07] bg-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[#edf3e8] text-forest"><ClipboardList size={21} /></span>
              <div><p className="section-eyebrow">Suivi et apprentissage</p><h2 className="mt-1 font-display text-lg font-bold">Indicateurs à suivre</h2></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink/60">Aucun chiffre d’impact n’est publié ici. Ces repères pourront servir au suivi des actions lorsqu’elles seront documentées.</p>
            <ul className="mt-4 grid gap-2">
              {domain.impactIndicators.map((indicator) => <li className="text-xs leading-5 text-ink/65 before:mr-2 before:text-forest before:content-['•']" key={indicator}>{indicator}</li>)}
            </ul>
          </div>
          <div className="rounded-[24px] border border-dashed border-ink/15 bg-[#fbfaf8] p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-white text-ink/50"><HandHeart size={21} /></span>
              <div><p className="section-eyebrow">Projets associés</p><h2 className="mt-1 font-display text-lg font-bold">Projets à découvrir</h2></div>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink/60">Aucun projet n’est actuellement publié pour ce domaine. Consultez nos activités ou contactez-nous pour en savoir plus.</p>
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-forest hover:gap-3" href="/actions">Découvrir les activités du site <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#172d4e] py-12 text-white sm:py-16">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="max-w-[650px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#edbd46]">Construisons la suite ensemble</p>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Vous souhaitez contribuer à ce domaine ?</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">Échangez avec l’équipe ONG BK pour proposer une initiative, devenir bénévole ou demander des informations.</p>
          </div>
          <Button asChild className="shrink-0"><Link href="/contact">Contacter l’équipe <ArrowRight size={15} /></Link></Button>
        </div>
      </section>

      <nav aria-label="Navigation entre les domaines" className="mx-auto grid max-w-[1180px] gap-3 px-5 py-8 sm:grid-cols-3 sm:px-8 lg:px-12">
        <Link className="flex min-h-14 items-center gap-3 rounded-xl border border-ink/[0.08] px-4 py-3 text-sm font-semibold text-ink/70 transition-colors hover:border-forest/30 hover:text-forest" href={`/domaines/${previous.slug}`}>
          <ArrowLeft aria-hidden="true" size={16} /><span><span className="block text-[10px] font-medium uppercase tracking-wide text-ink/40">Précédent</span>{previous.title}</span>
        </Link>
        <Link className="flex min-h-14 items-center justify-center rounded-xl bg-[#f8f7f4] px-4 py-3 text-center text-sm font-bold text-forest transition-colors hover:bg-[#edf3e8]" href="/domaines">Retour à tous les domaines</Link>
        <Link className="flex min-h-14 items-center justify-end gap-3 rounded-xl border border-ink/[0.08] px-4 py-3 text-right text-sm font-semibold text-ink/70 transition-colors hover:border-forest/30 hover:text-forest" href={`/domaines/${next.slug}`}>
          <span><span className="block text-[10px] font-medium uppercase tracking-wide text-ink/40">Suivant</span>{next.title}</span><ArrowRight aria-hidden="true" size={16} />
        </Link>
      </nav>
    </main>
  );
}
