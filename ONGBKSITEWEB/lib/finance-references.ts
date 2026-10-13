import "server-only";
import { db } from "@/lib/db";

export async function hasValidFinanceReferences(
  projectId: string | null | undefined,
  activityId: string | null | undefined,
): Promise<boolean> {
  const [project, activity] = await Promise.all([
    projectId
      ? db.project.findFirst({ where: { id: projectId, archivedAt: null }, select: { id: true } })
      : null,
    activityId
      ? db.activity.findFirst({
          where: { id: activityId, archivedAt: null },
          select: { id: true, projectId: true },
        })
      : null,
  ]);
  if ((projectId && !project) || (activityId && !activity)) return false;
  return !projectId || !activityId || activity?.projectId === projectId;
}
