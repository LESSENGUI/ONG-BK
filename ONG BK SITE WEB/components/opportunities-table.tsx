import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CalendarDays, HeartHandshake } from "lucide-react";
import type { getApplicationPeriod } from "@/lib/public-articles";

export type Opportunity = {
  slug: string;
  type: "VOLUNTEER_CALL" | "PROJECT_CALL" | "TRAINING_CALL";
  title: string;
  summary: string;
  category: string;
  publishedAt: string | null;
  tags: string[];
  applicationPeriod: ReturnType<typeof getApplicationPeriod>;
};

function formatPeriod(period: Opportunity["applicationPeriod"]) {
  if (!period) return "Voir la fiche";
  const format = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return `${format.format(period.start)} – ${format.format(period.end)}`;
}

export function OpportunitiesTable({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-ink/20 bg-[#fbfaf8] px-6 py-10 text-center sm:px-10">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-forest/5 text-forest"><BriefcaseBusiness size={22} /></span>
        <h3 className="mt-4 font-display text-xl font-bold text-ink">Aucun appel à candidature publié pour le moment.</h3>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-ink/60">
          Les offres seront affichées ici dès leur publication officielle. Vous pouvez déjà nous faire part de votre intérêt pour le bénévolat ou nous proposer une initiative.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest px-4 text-sm font-semibold text-white hover:bg-forest/90" href="/adhesion?type=benevole">
            <HeartHandshake size={16} /> Signaler mon intérêt bénévole
          </Link>
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ink/15 bg-white px-4 text-sm font-semibold text-ink hover:bg-paper" href="/contact">
            Nous contacter <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <caption className="sr-only">Appels à candidature et opportunités actuellement publiés par l’ONG-BK</caption>
          <thead className="bg-[#f7f8f5] text-xs uppercase tracking-[.1em] text-ink/55">
            <tr>
              <th className="px-5 py-4 font-bold sm:px-6" scope="col">Offre</th>
              <th className="px-5 py-4 font-bold sm:px-6" scope="col">Type</th>
              <th className="px-5 py-4 font-bold sm:px-6" scope="col">Domaine</th>
              <th className="px-5 py-4 font-bold sm:px-6" scope="col">Candidatures</th>
              <th className="px-5 py-4 text-right font-bold sm:px-6" scope="col">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.08]">
            {opportunities.map((item) => (
              <tr className="align-top transition hover:bg-[#fbfaf8]" key={item.slug}>
                <th className="max-w-[300px] px-5 py-5 font-semibold text-ink sm:px-6" scope="row">
                  <span className="block">{item.title}</span>
                  <span className="mt-1 block line-clamp-2 text-sm font-normal leading-5 text-ink/55">{item.summary}</span>
                </th>
                <td className="px-5 py-5 sm:px-6"><span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${item.type === "TRAINING_CALL" ? "bg-[#fcf2db] text-[#775b16]" : item.type === "VOLUNTEER_CALL" ? "bg-forest/8 text-forest" : "bg-[#edf2fa] text-[#315a88]"}`}>{item.type === "TRAINING_CALL" ? "Formation" : item.type === "VOLUNTEER_CALL" ? "Bénévolat" : "Appel à projets"}</span></td>
                <td className="px-5 py-5 text-sm text-ink/65 sm:px-6">{item.category || "À préciser dans la fiche"}</td>
                <td className="px-5 py-5 text-sm text-ink/60 sm:px-6">
                  <span className="inline-flex items-start gap-1.5"><CalendarDays className="mt-0.5 shrink-0" size={14} /><span>{formatPeriod(item.applicationPeriod)}</span></span>
                </td>
                <td className="px-5 py-5 text-right sm:px-6">
                  <Link className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-forest/20 px-3 text-xs font-bold text-forest transition hover:bg-forest hover:text-white" href={`/actions/offres/${item.slug}`}>
                    Lire les détails <ArrowRight size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-ink/[0.08] bg-[#fbfaf8] px-5 py-3 text-xs leading-5 text-ink/50 sm:px-6">
        Les modalités, critères et échéances figurent dans la fiche détaillée de chaque offre, lorsqu’ils ont été communiqués.
      </p>
    </div>
  );
}
