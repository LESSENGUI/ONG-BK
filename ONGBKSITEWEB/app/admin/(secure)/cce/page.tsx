import { redirect } from "next/navigation";
import { CceWorkspace } from "@/components/admin/cce-workspace";
import { getCurrentUser, userCan } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CcePage() {
  const user = await getCurrentUser();
  if (!user || !userCan(user, "CCE_FINDINGS_READ")) redirect("/admin/dashboard");
  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Contrôle indépendant</p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink">Suivi de la CCE</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
        Les constats et recommandations sont conservés dans un historique. Le Bureau exécutif dépose ses réponses
        séparément ; la CCE reste seule responsable du suivi et de la clôture.
      </p>
      <div className="mt-8">
        <CceWorkspace
          canCreate={userCan(user, "CCE_FINDINGS_CREATE")}
          canUpdate={userCan(user, "CCE_FINDINGS_UPDATE")}
          canRespond={userCan(user, "CCE_RESPONSES_CREATE")}
        />
      </div>
    </section>
  );
}
