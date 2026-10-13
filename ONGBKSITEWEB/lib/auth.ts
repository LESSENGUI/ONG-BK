import "server-only";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashSecret, SESSION_COOKIE } from "@/lib/security";
import type { PermissionCode } from "@/lib/rbac";

const sessionInclude = {
  user: {
    include: {
      profile: true,
      role: {
        include: {
          permissions: { select: { permissionCode: true } },
        },
      },
    },
  },
} as const;

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashSecret(token) },
    include: sessionInclude,
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.user.isActive ||
    session.user.archivedAt
  ) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    roleCode: session.user.roleCode,
    roleName: session.user.role.name,
    profile: session.user.profile,
    permissions: session.user.role.permissions.map((item) => item.permissionCode),
    sessionId: session.id,
  };
}

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export function userCan(
  user: Pick<AuthenticatedUser, "permissions">,
  permission: PermissionCode,
): boolean {
  return user.permissions.includes(permission);
}
