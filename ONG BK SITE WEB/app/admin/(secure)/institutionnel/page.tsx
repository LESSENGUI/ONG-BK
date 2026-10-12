import { redirect } from "next/navigation";
import { InstitutionConsole } from "@/components/admin/institution-console";
import { getCurrentUser } from "@/lib/auth";
import type { PermissionCode } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function InstitutionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  const modulePermissions: PermissionCode[] = [
    "IDENTITY_READ",
    "GOVERNANCE_READ",
    "MEMBERS_READ",
    "MEMBERSHIP_REQUESTS_READ",
    "DOCUMENTS_READ",
    "BE_MEETINGS_READ",
    "CCE_MEETINGS_READ",
  ];
  if (!modulePermissions.some((permission) => user.permissions.includes(permission))) {
    redirect("/admin/dashboard");
  }
  return <InstitutionConsole permissions={user.permissions} />;
}
