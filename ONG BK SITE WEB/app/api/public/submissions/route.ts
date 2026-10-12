import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { publicSubmissionSchema } from "@/lib/operations-validation";
import { getApplicationPeriod } from "@/lib/public-articles";
import { readJsonBody } from "@/lib/request-body";
import {
  enforceRequestOrigin,
  getClientIp,
  hashSecret,
  isThrottled,
  recordFailedAttempt,
} from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  const body = await readJsonBody(request, 16_000);
  if (!body.ok) return NextResponse.json({ error: body.status === 413 ? "Requête trop volumineuse." : "Requête invalide." }, { status: body.status });
  const parsed = publicSubmissionSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Vérifiez les champs du formulaire." }, { status: 400 });
  const opportunitySlug = parsed.data.message.match(/(?:^|\n)Référence : ([a-z0-9-]{1,180})(?:\n|$)/)?.[1];
  if (opportunitySlug) {
    if (parsed.data.type !== "APPLICATION") {
      return NextResponse.json({ error: "Ce formulaire ne correspond pas au type de demande sélectionné." }, { status: 400 });
    }
    const opportunity = await db.publication.findFirst({
      where: {
        slug: opportunitySlug,
        type: { in: ["VOLUNTEER_CALL", "PROJECT_CALL", "TRAINING_CALL"] },
        status: "PUBLISHED",
        archivedAt: null,
      },
      select: { tags: true },
    });
    if (!opportunity) return NextResponse.json({ error: "Cette offre n’est plus disponible." }, { status: 404 });
    const period = getApplicationPeriod(opportunity.tags);
    const now = new Date();
    if (period && (now < period.start || now > period.end)) {
      return NextResponse.json({ error: "La période de candidature pour cette offre n’est pas ouverte." }, { status: 400 });
    }
  }
  const retentionDays = Number(process.env.OPERATION_REQUEST_RETENTION_DAYS);
  if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 36_500) {
    console.error("OPERATION_REQUEST_RETENTION_DAYS doit être défini selon la politique de conservation approuvée.");
    return NextResponse.json({ error: "La réception des demandes est temporairement indisponible." }, { status: 503 });
  }
  const clientIp = getClientIp(request);
  if (!clientIp) return NextResponse.json({ error: "La requête n’a pas pu être vérifiée." }, { status: 400 });
  const rateKey = `public-submission-ip:${clientIp}`;
  if (await isThrottled(rateKey)) {
    return NextResponse.json(
      { error: "Trop de demandes depuis cette connexion. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": "900" } },
    );
  }
  if (parsed.data.website) {
    await recordFailedAttempt(rateKey);
    return NextResponse.json({ message: "Votre demande a été reçue." });
  }
  const duplicate = await db.publicSubmission.findFirst({
    where: {
      email: parsed.data.email,
      type: parsed.data.type,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (duplicate) return NextResponse.json({ message: "Votre demande a été reçue." });
  const keyHash = hashSecret(rateKey);
  const retentionUntil = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  await db.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      INSERT INTO "LoginThrottle" ("key", "count", "windowStartedAt", "blockedUntil")
      VALUES (${keyHash}, 1, NOW(), NULL)
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes' THEN 1
          ELSE "LoginThrottle"."count" + 1
        END,
        "windowStartedAt" = CASE
          WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes' THEN NOW()
          ELSE "LoginThrottle"."windowStartedAt"
        END,
        "blockedUntil" = CASE
          WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes' THEN NULL
          WHEN "LoginThrottle"."count" + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
          ELSE "LoginThrottle"."blockedUntil"
        END
    `;
    const submission = await transaction.publicSubmission.create({
      data: {
        type: parsed.data.type,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
        organization: parsed.data.organization || null,
        retentionUntil,
      },
    });
    await transaction.publicSubmissionEvent.create({
      data: { submissionId: submission.id, toStatus: "RECEIVED" },
    });
  });
  return NextResponse.json({ message: "Votre demande a été reçue." }, { status: 201 });
}
