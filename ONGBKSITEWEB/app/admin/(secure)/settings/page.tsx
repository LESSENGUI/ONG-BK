import { db } from "@/lib/db";
import { getCurrentUser, userCan } from "@/lib/auth";
import { SystemSettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user || !userCan(user, "SETTINGS_READ")) {
    return (
      <section>
        <h1 className="section-title text-3xl">Accès non autorisé</h1>
        <p className="mt-3 text-sm text-ink/65">
          Votre rôle ne permet pas de consulter ces paramètres.
        </p>
      </section>
    );
  }

  const rows = await db.systemSetting.findMany({
    where: { key: { in: ["site.name", "site.contactEmail", "site.defaultLocale", "site.timeZone"] } },
    select: { key: true, value: true },
  });
  const values = new Map(rows.map(({ key, value }) => [key, value]));

  return (
    <section className="max-w-3xl">
      <p className="section-eyebrow">Configuration</p>
      <h1 className="section-title mt-2 text-3xl sm:text-4xl">Paramètres système</h1>
      <p className="mt-3 text-sm leading-7 text-ink/65">
        Les modifications sont vérifiées côté serveur et consignées dans le journal d’audit.
      </p>
      <SystemSettingsForm
        canUpdate={userCan(user, "SETTINGS_UPDATE")}
        initialValues={{
          siteName: values.get("site.name") ?? "ONG-BK",
          contactEmail: values.get("site.contactEmail") ?? "",
          defaultLocale: "fr",
          timeZone: values.get("site.timeZone") ?? "Africa/Brazzaville",
        }}
      />
    </section>
  );
}
