import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, MapPin } from "lucide-react";
import { DomainHero } from "@/app/domaines/domain-hero";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { getDomainBySlug } from "@/lib/domains";

type ActivityDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ActivityDetailPageProps) {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) return {};
  const activity = await db.activity.findFirst({
    where: { slug, status: "COMPLETED", public: true, archivedAt: null },
    select: { title: true, description: true },
  });
  return activity
    ? { title: `${activity.title} | Activités | ONG BK`, description: activity.description.slice(0, 160) }
    : {};
}

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { slug } = await params;
  if (!process.env.DATABASE_URL) notFound();

  const activity = await db.activity.findFirst({
    where: { slug, status: "COMPLETED", public: true, archivedAt: null },
    select: {
      title: true,
      description: true,
      domain: true,
      eventDate: true,
      location: true,
      objectives: true,
      results: true,
      report: true,
      difficulties: true,
      indicators: {
        select: { category: true, unit: true, actualValue: true, measurement: true },
        where: { measurement: { in: ["REALIZED", "VERIFIED"] } },
      },
    },
  });

  if (!activity) notFound();
  const domain = getDomainBySlug(activity.domain);
  const eventDate = activity.eventDate
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(activity.eventDate)
    : null;

  return (
    <main className="min-h-screen bg-white">
      <DomainHero
        description={activity.description || "Compte rendu public d’une activité réalisée par ONG BK."}
        eyebrow={domain?.title ?? "Activité réalisée"}
        targetId="activity-report"
        title={activity.title}
      />
      <nav aria-label="Fil d’Ariane" className="mx-auto flex max-w-[1180px] items-center gap-2 px-5 pt-7 text-xs text-ink/55 sm:px-8 lg:px-12">
        <Link className="transition-colors hover:text-forest" href="/">Accueil</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <Link className="transition-colors hover:text-forest" href="/actions#activites">Activités</Link>
        <ChevronRight aria-hidden="true" size={14} />
        <span aria-current="page" className="font-semibold text-ink">{activity.title}</span>
      </nav>

      <article className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12" id="activity-report">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div>
            <p className="section-eyebrow">Compte rendu d’activité</p>
            <h2 className="section-title mt-3">Une action documentée, au plus près des communautés.</h2>
            {activity.description && <p className="mt-6 whitespace-pre-line text-sm leading-7 text-ink/70 sm:text-base">{activity.description}</p>}
            {activity.objectives && (
              <section className="mt-9">
                <h3 className="font-display text-xl font-bold">Objectifs</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/65">{activity.objectives}</p>
              </section>
            )}
            {activity.results && (
              <section className="mt-9 rounded-2xl bg-[#f3f7f3] p-5 sm:p-7">
                <h3 className="font-display text-xl font-bold">Résultats renseignés</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/65">{activity.results}</p>
              </section>
            )}
            {activity.indicators.length > 0 && (
              <section className="mt-9">
                <h3 className="font-display text-xl font-bold">Indicateurs réalisés ou vérifiés</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {activity.indicators.map((indicator, index) => (
                    <li className="flex items-start gap-3 rounded-xl border border-ink/[0.07] p-4 text-sm text-ink/70" key={`${indicator.category}-${index}`}>
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-forest" size={17} />
                      <span>{indicator.category}: {indicator.actualValue?.toString() ?? "Valeur non renseignée"} {indicator.unit}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {activity.report && (
              <section className="mt-9">
                <h3 className="font-display text-xl font-bold">Compte rendu</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/65">{activity.report}</p>
              </section>
            )}
            {activity.difficulties && (
              <section className="mt-9">
                <h3 className="font-display text-xl font-bold">Difficultés signalées</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/65">{activity.difficulties}</p>
              </section>
            )}
            {!activity.results && !activity.report && (
              <p className="mt-8 rounded-xl border border-dashed border-ink/15 p-4 text-sm leading-6 text-ink/55">Les résultats détaillés de cette activité n’ont pas été renseignés dans le compte rendu public.</p>
            )}
          </div>
          <aside className="h-fit rounded-2xl bg-[#f8f7f4] p-6">
            <p className="section-eyebrow">Repères</p>
            {domain && <p className="mt-4 text-sm font-semibold text-ink">{domain.title}</p>}
            {eventDate && <p className="mt-3 text-sm text-ink/65">{eventDate}</p>}
            {activity.location && <p className="mt-3 flex items-center gap-2 text-sm text-ink/65"><MapPin size={15} />{activity.location}</p>}
            {!eventDate && !activity.location && <p className="mt-4 text-sm leading-6 text-ink/55">La date et le lieu ne sont pas renseignés pour cette activité.</p>}
            <Button asChild className="mt-7" variant="outline">
              <Link href="/actions"><ArrowLeft size={15} /> Retour aux actions</Link>
            </Button>
          </aside>
        </div>
      </article>
    </main>
  );
}
