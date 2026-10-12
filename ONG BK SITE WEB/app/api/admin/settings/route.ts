import { NextResponse } from "next/server";
import { authorizeApi } from "@/lib/api-auth";
import { systemSettingsSchema } from "@/lib/auth-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import { enforceRequestOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const settingKeys = {
  siteName: "site.name",
  contactEmail: "site.contactEmail",
  defaultLocale: "site.defaultLocale",
  timeZone: "site.timeZone",
} as const;

export async function GET() {
  const authorization = await authorizeApi("SETTINGS_READ");
  if (authorization.response) return authorization.response;

  const settings = await db.systemSetting.findMany({
    where: { key: { in: Object.values(settingKeys) } },
    select: { key: true, value: true },
  });
  const values = new Map(settings.map(({ key, value }) => [key, value]));
  return NextResponse.json(
    {
      siteName: values.get(settingKeys.siteName) ?? "ONG-BK",
      contactEmail: values.get(settingKeys.contactEmail) ?? "",
      defaultLocale: values.get(settingKeys.defaultLocale) ?? "fr",
      timeZone: values.get(settingKeys.timeZone) ?? "Africa/Brazzaville",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function PUT(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const authorization = await authorizeApi("SETTINGS_UPDATE");
  if (authorization.response) return authorization.response;

  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? "Requête trop volumineuse." : "Requête invalide." },
      { status: body.status },
    );
  }
  const parsed = systemSettingsSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Paramètres invalides." }, { status: 400 });
  }

  const entries = Object.entries(settingKeys) as [
    keyof typeof settingKeys,
    (typeof settingKeys)[keyof typeof settingKeys],
  ][];
  await db.$transaction(async (transaction) => {
    for (const [field, key] of entries) {
      await transaction.systemSetting.upsert({
        where: { key },
        update: { value: parsed.data[field] },
        create: { key, value: parsed.data[field] },
      });
    }
    await transaction.auditLog.create({
      data: {
        actorId: authorization.user.id,
        event: "SENSITIVE_OPERATION",
        subjectType: "system-settings",
      },
    });
  });

  return NextResponse.json({ ok: true });
}
