import { redirect } from "next/navigation";
import { FinanceOperations } from "@/components/admin/finance-operations";
import { getCurrentUser, userCan } from "@/lib/auth";
import { FinanceDashboard } from "@/components/admin/finance-dashboard";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const user = await getCurrentUser();
  if (!user || !userCan(user, "FINANCE_READ")) redirect("/admin/dashboard");

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Pilotage financier</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink">Finances et contrôle</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
        Synthèse calculée à partir des écritures enregistrées. Les devises restent séparées et le solde présenté
        n’est pas un solde bancaire certifié.
      </p>
      <div className="mt-8">
        <FinanceDashboard canExport={userCan(user, "FINANCE_EXPORT")} />
        <FinanceOperations
          userId={user.id}
          canCreate={userCan(user, "FINANCE_CREATE")}
          canUpdate={userCan(user, "FINANCE_UPDATE")}
          canApprove={userCan(user, "FINANCE_APPROVE")}
          canArchive={userCan(user, "FINANCE_ARCHIVE")}
        />
      </div>
    </section>
  );
}
