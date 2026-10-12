import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, ClipboardList, HeartHandshake } from "lucide-react";
import { db } from "@/lib/db";
import { getApplicationPeriod, languageTrainingOpportunity } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  return date
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date)
    : "Date non renseignée";
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const storedOpportunity = process.env.DATABASE_URL
    ? await db.publication.findFirst({
      where: {
        slug,
        type: { in: ["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"] },
        status: "PUBLISHED",
        archivedAt: null,
        publishedAt: { not: null },
      },
      select: { slug: true, type: true, title: true, summary: true, body: true, category: true, tags: true, publishedAt: true },
    })
    : null;
  const opportunity = storedOpportunity ?? (
    !process.env.DATABASE_URL && slug === languageTrainingOpportunity.slug
      ? { ...languageTrainingOpportunity, publishedAt: null }
      : null
  );
  if (!opportunity) notFound();
  const volunteer = opportunity.type === "VOLUNTEER_CALL";
  const training = opportunity.type === "TRAINING_CALL";
  const applicationPeriod = getApplicationPeriod(opportunity.tags);
  const now = new Date();
  const applicationOpen = Boolean(applicationPeriod && now >= applicationPeriod.start && now <= applicationPeriod.end);
  const dateFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const applicationDates = applicationPeriod
    ? `${dateFormat.format(applicationPeriod.start)} au ${dateFormat.format(applicationPeriod.end)}`
    : null;
  const applicationLabel = applicationOpen
    ? (training ? "Candidater à la formation" : volunteer ? "Déposer ma candidature" : "Répondre à l’appel")
    : applicationPeriod && now < applicationPeriod.start
      ? `Candidatures ouvertes le ${dateFormat.format(applicationPeriod.start)}`
      : "Consulter le formulaire";

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <section className="bg-[#10243d] px-5 pb-12 pt-8 text-white sm:px-8 sm:pb-16">
        <div className="mx-auto max-w-[1000px]">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-white/75 transition hover:text-white" href="/actions#candidatures"><ArrowLeft size={16} /> Retour aux opportunités</Link>
          <div className="mt-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#f3ce6e]">
            {volunteer ? <HeartHandshake size={15} /> : <ClipboardList size={15} />}
            {training ? "Candidature à une formation" : volunteer ? "Appel à bénévolat" : "Appel à projets"}
          </div>
          <h1 className="mt-5 max-w-4xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">{opportunity.title}</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">{opportunity.summary}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/65">
            <span>{opportunity.category || "Domaine à préciser dans l’offre"}</span>
            {applicationDates && <span className="inline-flex items-center gap-2"><CalendarDays size={16} />Candidatures du {applicationDates}</span>}
            {opportunity.publishedAt && <span className="inline-flex items-center gap-2"><CalendarDays size={16} />Publié le {formatDate(opportunity.publishedAt)}</span>}
          </div>
          <Link className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#f3ce6e] px-6 text-sm font-bold text-[#10243d] transition hover:bg-white" href={`/actions/offres/${opportunity.slug}/candidature`}>
            {applicationLabel} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1000px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_290px]">
        <article className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-9">
          <p className="section-eyebrow">Présentation de l’opportunité</p>
          <h2 className="mt-3 font-display text-2xl font-bold text-ink">Détails de l’offre</h2>
          <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-ink/75">{opportunity.body}</div>
          {opportunity.tags.some((tag) => !tag.startsWith("CANDIDATURES:")) && <div className="mt-7 flex flex-wrap gap-2">{opportunity.tags.filter((tag) => !tag.startsWith("CANDIDATURES:")).map((tag) => <span className="rounded-full bg-forest/5 px-3 py-1.5 text-xs font-semibold text-forest" key={tag}>#{tag}</span>)}</div>}
          <div className="mt-8 border-t border-ink/10 pt-6">
            <Link className="inline-flex min-h-11 items-center gap-2 rounded-full bg-forest px-5 text-sm font-semibold text-white hover:bg-forest/90" href={`/actions/offres/${opportunity.slug}/candidature`}>
              {applicationLabel} <ArrowRight size={16} />
            </Link>
          </div>
        </article>
        <aside className="h-fit rounded-3xl border border-ink/10 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-magenta">À retenir</p>
          <dl className="mt-4 space-y-4 text-sm">
            <div><dt className="text-xs text-ink/50">Type d’opportunité</dt><dd className="mt-1 font-semibold text-ink">{training ? "Candidature à une formation" : volunteer ? "Bénévolat / candidature" : "Proposition de projet"}</dd></div>
            <div><dt className="text-xs text-ink/50">Domaine</dt><dd className="mt-1 font-semibold text-ink">{opportunity.category || "Voir les détails de l’offre"}</dd></div>
            {applicationDates && <div><dt className="text-xs text-ink/50">Période de candidature</dt><dd className="mt-1 font-semibold text-ink">{applicationDates}</dd></div>}
            {opportunity.publishedAt && <div><dt className="text-xs text-ink/50">Publication</dt><dd className="mt-1 font-semibold text-ink">{formatDate(opportunity.publishedAt)}</dd></div>}
          </dl>
          <p className="mt-5 border-t border-ink/10 pt-4 text-xs leading-5 text-ink/55">Les conditions, pièces éventuelles et échéances sont celles indiquées dans le descriptif publié. Aucune information manquante n’est supposée.</p>
        </aside>
      </section>
    </main>
  );
}
