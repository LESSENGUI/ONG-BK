"use client";

import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Handshake,
  UsersRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Metrics = {
  memberTotal: number | null;
  activeMembers: number | null;
  pendingMembershipRequests: number | null;
  inProgressProjects: number | null;
  completedProjects: number | null;
  completedActivities: number | null;
  activePartners: number | null;
  openFindings: number | null;
  openTasks: number | null;
  publicationsToReview: number | null;
};

type ChartEntry = { month: string; count: number };
type ProjectEntry = { domain: string; count: number };
type ProjectStatusEntry = { status: string; count: number };

const numberFormat = new Intl.NumberFormat("fr-FR");
const chartColors = ["#155e4a", "#c98243", "#6d8a62", "#aa5747", "#487d8c", "#8b79a8"];
const projectStatusLabels: Record<string, string> = {
  DRAFT: "En préparation",
  PENDING_REVIEW: "À valider",
  PLANNED: "Planifiés",
  IN_PROGRESS: "En cours",
  SUSPENDED: "Suspendus",
  COMPLETED: "Terminés",
  CLOSED: "Clôturés",
  ARCHIVED: "Archivés",
};

export function AdminOverview({
  userName,
  roleName,
  isSystemAdmin,
  metrics,
  activityByMonth,
  projectByDomain,
  projectByStatus,
}: {
  userName: string;
  roleName: string;
  isSystemAdmin: boolean;
  metrics: Metrics;
  activityByMonth: ChartEntry[];
  projectByDomain: ProjectEntry[];
  projectByStatus: ProjectStatusEntry[];
}) {
  const cards = [
    { label: "Membres enregistrés", value: metrics.memberTotal, icon: UsersRound, href: "/admin/institutionnel" },
    { label: "Membres actifs", value: metrics.activeMembers, icon: UsersRound, href: "/admin/institutionnel" },
    { label: "Demandes d’adhésion à traiter", value: metrics.pendingMembershipRequests, icon: ClipboardCheck, href: "/admin/institutionnel" },
    { label: "Projets en cours", value: metrics.inProgressProjects, icon: BriefcaseBusiness, href: "/actions" },
    { label: "Projets terminés ou clôturés", value: metrics.completedProjects, icon: BriefcaseBusiness, href: "/actions" },
    { label: "Activités réalisées", value: metrics.completedActivities, icon: Activity, href: "/actions" },
    { label: "Partenaires actifs", value: metrics.activePartners, icon: Handshake, href: "/partenaires" },
    { label: "Recommandations CCE non clôturées", value: metrics.openFindings, icon: AlertTriangle, href: "/admin/cce" },
    { label: "Mes tâches à traiter", value: metrics.openTasks, icon: ClipboardCheck, href: isSystemAdmin ? "/admin/users" : null },
    { label: "Publications à valider", value: metrics.publicationsToReview, icon: FileText, href: "/admin/publications" },
  ].filter((card) => card.value !== null);

  const hasActivity = activityByMonth.some((item) => item.count > 0);
  const hasProjects = projectByDomain.some((item) => item.count > 0);

  return (
    <section>
      <p className="section-eyebrow">Administration sécurisée</p>
      <h1 className="section-title mt-2 text-3xl sm:text-4xl">
        Bonjour{userName ? ` ${userName}` : ""}
      </h1>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-7 text-ink/65">
          Vue d’ensemble construite à partir des données enregistrées, limitée aux permissions de votre compte.
        </p>
        <span className="rounded-full bg-[#eaf0f6] px-3 py-1.5 text-xs font-semibold text-[#355b80]">
          {roleName}
        </span>
      </div>

      {cards.length > 0 ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ label, value, icon: Icon, href }) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#edf3e8] text-forest">
                    <Icon aria-hidden="true" size={19} />
                  </span>
                  {href && <ArrowRight aria-hidden="true" className="text-ink/30 transition group-hover:text-forest" size={17} />}
                </div>
                <p className="mt-5 text-sm text-ink/65">{label}</p>
                <p className="mt-1 font-display text-3xl font-bold text-ink">{numberFormat.format(value ?? 0)}</p>
              </>
            );
            const className = "rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm";
            return href ? (
              <Link
                className={`group ${className} transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest`}
                href={href}
                key={label}
              >
                {content}
              </Link>
            ) : (
              <article className={className} key={label}>{content}</article>
            );
          })}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-ink/10 bg-white p-6 text-sm leading-6 text-ink/65">
          Aucun indicateur n’est disponible pour ce compte. Les données restent masquées tant que les permissions
          correspondantes ne sont pas attribuées.
        </div>
      )}

      <div className="mt-7 grid gap-5 xl:grid-cols-2">
        {metrics.completedActivities !== null && (
          <article className="rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold text-ink">Activités réalisées par mois</h2>
            <p className="mt-1 text-xs text-ink/55">12 derniers mois · selon la date enregistrée de l’activité</p>
            {hasActivity ? (
              <div className="mt-5 h-64" role="img" aria-label="Graphique des activités par mois">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityByMonth} margin={{ top: 8, right: 12, left: -20, bottom: 4 }}>
                    <CartesianGrid stroke="#e8e8e5" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#696969", fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#696969", fontSize: 11 }} />
                    <Tooltip />
                    <Line dataKey="count" name="Activités" stroke="#155e4a" strokeWidth={3} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-[#f7f7f5] p-5 text-sm text-ink/60">
                Aucune activité datée n’est enregistrée sur cette période.
              </p>
            )}
          </article>
        )}

        {metrics.inProgressProjects !== null && (
          <article className="rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold text-ink">Projets par domaine</h2>
            <p className="mt-1 text-xs text-ink/55">Projets non archivés, selon le domaine saisi</p>
            {hasProjects ? (
              <div className="mt-5 h-64" role="img" aria-label="Graphique des projets par domaine">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectByDomain} layout="vertical" margin={{ top: 4, right: 16, left: 12, bottom: 4 }}>
                    <CartesianGrid stroke="#e8e8e5" strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#696969", fontSize: 11 }} />
                    <YAxis type="category" dataKey="domain" width={120} tick={{ fill: "#454545", fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Projets" fill="#155e4a" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-[#f7f7f5] p-5 text-sm text-ink/60">
                Aucun projet n’est enregistré.
              </p>
            )}
          </article>
        )}

        {metrics.inProgressProjects !== null && (
          <article className="rounded-2xl border border-ink/[0.07] bg-white p-5 shadow-sm">
            <h2 className="font-display text-xl font-bold text-ink">Répartition des projets par statut</h2>
            <p className="mt-1 text-xs text-ink/55">Aucune catégorie vide n’est ajoutée au graphique</p>
            {hasProjects ? (
              <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1fr_1fr]">
                <div className="h-56" role="img" aria-label="Graphique des projets par statut">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectByStatus}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={48}
                        outerRadius={82}
                        paddingAngle={2}
                      >
                        {projectByStatus.map((item, index) => (
                          <Cell key={item.status} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _name, item) => [value, projectStatusLabels[item.payload.status] ?? item.payload.status]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="grid gap-2 text-sm">
                  {projectByStatus.map((item, index) => (
                    <li className="flex items-center justify-between gap-3" key={item.status}>
                      <span className="flex min-w-0 items-center gap-2 text-ink/70">
                        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                        <span className="truncate">{projectStatusLabels[item.status] ?? item.status}</span>
                      </span>
                      <strong>{numberFormat.format(item.count)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-5 rounded-xl bg-[#f7f7f5] p-5 text-sm text-ink/60">
                Aucun projet n’est enregistré.
              </p>
            )}
          </article>
        )}

        <article className="rounded-2xl border border-[#e7dfc9] bg-[#fbf7ec] p-5">
          <h2 className="font-display text-xl font-bold text-ink">Données à compléter</h2>
          <p className="mt-2 text-sm leading-6 text-ink/70">
            Les bénéficiaires ne disposent pas encore d’un registre dédié dans la base de données. Aucun total
            n’est estimé ou affiché tant que ces données ne sont pas collectées dans un module adapté.
          </p>
          {metrics.inProgressProjects !== null && (
            <Link className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-forest hover:underline" href="/actions">
              Consulter les projets et activités <ArrowRight aria-hidden="true" size={16} />
            </Link>
          )}
        </article>
      </div>
    </section>
  );
}
