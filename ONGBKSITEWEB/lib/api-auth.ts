import "server-only";

import { NextResponse } from "next/server";
import { getCurrentUser, userCan } from "@/lib/auth";
import type { PermissionCode } from "@/lib/rbac";
import { recordAudit } from "@/lib/security";

export async function authorizeApi(permission: PermissionCode) {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Authentification requise." }, { status: 401 }),
    };
  }

  if (!userCan(user, permission)) {
    await recordAudit("ACCESS_DENIED", {
      actorId: user.id,
      subjectType: "api",
    });
    return {
      user: null,
      response: NextResponse.json({ error: "Accès non autorisé." }, { status: 403 }),
    };
  }

  return { user, response: null };
}
