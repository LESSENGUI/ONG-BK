import { redirect } from "next/navigation";
import { AdminOverview } from "@/components/admin/admin-overview";
import { getCurrentUser, userCan } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type MonthlyActivityCount = { month: Date; count: bigint };

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const canReadMembers = userCan(user, "MEMBERS_READ");
  const canReadMembershipRequests = userCan(user, "MEMBERSHIP_REQUESTS_READ");
  const canReadProjects = userCan(user, "PROJECTS_READ");
  const canReadActivities = userCan(user, "ACTIVITIES_READ");
  const canReadPartners = userCan(user, "PARTNERS_READ");
  const canReadFindings = userCan(user, "CCE_FINDINGS_READ");
  const canReadTasks = userCan(user, "TASKS_READ");
  const canReadContent = userCan(user, "CONTENT_READ");

  const firstMonth = new Date();
  firstMonth.setUTCDate(1);
  firstMonth.setUTCHours(0, 0, 0, 0);
  firstMonth.setUTCMonth(firstMonth.getUTCMonth() - 11);

  const [
    memberTotal,
    activeMembers,
    pendingMembershipRequests,
    inProgressProjects,
    completedProjects,
    completedActivities,
    activePartners,
    openFindings,
    openTasks,
    publicationsToReview,
    monthlyActivities,
    projectsByDomainAndStatus,
  ] = await Promise.all([
    canReadMembers
      ? db.member.count({ where: { archivedAt: null } })
      : Promise.resolve(null),
    canReadMembers
      ? db.member.count({ where: { status: "ACTIVE", archivedAt: null } })
      : Promise.resolve(null),
    canReadMembershipRequests
      ? db.membershipRequest.count({
          where: { status: { in: ["RECEIVED", "UNDER_REVIEW", "NEEDS_INFORMATION"] } },
        })
      : Promise.resolve(null),
    canReadProjects
      ? db.project.count({ where: { status: "IN_PROGRESS", archivedAt: null } })
      : Promise.resolve(null),
    canReadProjects
      ? db.project.count({ where: { status: { in: ["COMPLETED", "CLOSED"] }, archivedAt: null } })
      : Promise.resolve(null),
    canReadActivities
      ? db.activity.count({ where: { status: "COMPLETED", archivedAt: null } })
      : Promise.resolve(null),
    canReadPartners
      ? db.partner.count({ where: { status: "ACTIVE" } })
      : Promise.resolve(null),
    canReadFindings
      ? db.cceFinding.count({ where: { status: { not: "CLOSED" } } })
      : Promise.resolve(null),
    canReadTasks
      ? db.adminTask.count({
          where: { assigneeId: user.id, status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } },
        })
      : Promise.resolve(null),
    canReadContent
      ? db.publication.count({ where: { status: "PENDING_REVIEW" } })
      : Promise.resolve(null),
    canReadActivities
      ? db.$queryRaw<MonthlyActivityCount[]>`
          SELECT date_trunc('month', "eventDate") AS month, COUNT(*) AS count
          FROM "Activity"
          WHERE "eventDate" >= ${firstMonth}
            AND "eventDate" IS NOT NULL
            AND "archivedAt" IS NULL
          GROUP BY date_trunc('month', "eventDate")
          ORDER BY month
        `
      : Promise.resolve([]),
    canReadProjects
      ? db.project.groupBy({
          by: ["domain", "status"],
          where: { archivedAt: null },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const activityByMonth = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(firstMonth);
    month.setUTCMonth(firstMonth.getUTCMonth() + index);
    const key = month.toISOString().slice(0, 7);
    const count = monthlyActivities.find((item) => item.month.toISOString().slice(0, 7) === key);
    return {
      month: new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" }).format(month),
      count: Number(count?.count ?? 0),
    };
  });

  const projectDomainCounts = new Map<string, number>();
  const projectStatusCounts = new Map<string, number>();
  for (const row of projectsByDomainAndStatus) {
    projectDomainCounts.set(
      row.domain,
      (projectDomainCounts.get(row.domain) ?? 0) + row._count._all,
    );
    projectStatusCounts.set(
      row.status,
      (projectStatusCounts.get(row.status) ?? 0) + row._count._all,
    );
  }

  const fullName = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <AdminOverview
      userName={fullName}
      roleName={user.roleName}
      isSystemAdmin={user.roleCode === "SYSTEM_ADMIN"}
      metrics={{
        memberTotal,
        activeMembers,
        pendingMembershipRequests,
        inProgressProjects,
        completedProjects,
        completedActivities,
        activePartners,
        openFindings,
        openTasks,
        publicationsToReview,
      }}
      activityByMonth={activityByMonth}
      projectByDomain={[...projectDomainCounts].map(([domain, count]) => ({ domain, count }))}
      projectByStatus={[...projectStatusCounts].map(([status, count]) => ({ status, count }))}
    />
  );
}
