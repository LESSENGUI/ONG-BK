import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UserTaskManager } from "@/components/admin/user-task-manager";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const user = await getCurrentUser();
  if (!user || user.roleCode !== "SYSTEM_ADMIN") redirect("/admin/dashboard");

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Administration centrale</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink">Comptes et tâches</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
        Créez les comptes opérationnels, attribuez leurs rôles et suivez les tâches. Les administrateurs
        techniques ne peuvent ni promouvoir des utilisateurs ni attribuer des rôles.
      </p>
      <div className="mt-8">
        <UserTaskManager />
      </div>
    </section>
  );
}
