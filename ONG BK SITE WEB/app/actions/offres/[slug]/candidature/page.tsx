import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { OpportunityApplicationForm } from "@/components/opportunity-application-form";
import { db } from "@/lib/db";
import { getApplicationPeriod, languageTrainingOpportunity } from "@/lib/public-articles";

export const dynamic = "force-dynamic";

export default async function OpportunityApplicationPage({ params }: { params: Promise<{ slug: string }> }) {
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
      select: { slug: true, title: true, type: true, tags: true },
    })
    : null;
  const opportunity = storedOpportunity ?? (
    !process.env.DATABASE_URL && slug === languageTrainingOpportunity.slug
      ? { slug, title: languageTrainingOpportunity.title, type: languageTrainingOpportunity.type, tags: [...languageTrainingOpportunity.tags] }
      : null
  );
  if (!opportunity) notFound();
  const period = getApplicationPeriod(opportunity.tags);
  const now = new Date();
  const isOpen = Boolean(period && now >= period.start && now <= period.end);
  const format = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const periodLabel = period ? `${format.format(period.start)} au ${format.format(period.end)}` : null;

  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <section className="mx-auto max-w-[820px] px-5 py-9 sm:px-8 sm:py-14">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline" href={`/actions/offres/${opportunity.slug}`}><ArrowLeft size={16} /> Retour aux détails de l’offre</Link>
        <p className="section-eyebrow mt-9">Candidature</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">{opportunity.type === "TRAINING_CALL" ? "Candidater à la formation." : opportunity.type === "VOLUNTEER_CALL" ? "Proposer votre engagement bénévole." : "Répondre à l’appel à projet."}</h1>
        <p className="mt-4 text-sm leading-7 text-ink/65">Complétez les informations ci-dessous. Votre demande sera associée à cette offre et transmise à l’ONG-BK pour examen.</p>
        {periodLabel && <p className={`mt-5 rounded-2xl px-4 py-3 text-sm font-semibold ${isOpen ? "bg-forest/5 text-forest" : "bg-[#fcf2db] text-[#775b16]"}`}>{isOpen ? "Période de candidature ouverte" : now < (period?.start ?? now) ? "La période de candidature n’est pas encore ouverte" : "La période de candidature est terminée"} · {periodLabel}</p>}
        <div className="mt-7">
          <OpportunityApplicationForm
            slug={opportunity.slug}
            title={opportunity.title}
            volunteer={opportunity.type === "VOLUNTEER_CALL"}
            training={opportunity.type === "TRAINING_CALL"}
            isOpen={isOpen}
          />
        </div>
      </section>
    </main>
  );
}
