import { NextResponse } from "next/server";
import { publicMembershipRequestSchema } from "@/lib/institution-validation";
import { db } from "@/lib/db";
import { readJsonBody } from "@/lib/request-body";
import {
  enforceRequestOrigin,
  getClientIp,
  hashSecret,
  isThrottled,
  recordFailedAttempt,
} from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await enforceRequestOrigin(request))) {
    return NextResponse.json({ error: "Requête non autorisée." }, { status: 403 });
  }
  const body = await readJsonBody(request);
  if (!body.ok) {
    return NextResponse.json(
      { error: body.status === 413 ? "Requête trop volumineuse." : "Requête invalide." },
      { status: body.status },
    );
  }
  const parsed = publicMembershipRequestSchema.safeParse(body.value);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vérifiez les champs du formulaire." }, { status: 400 });
  }
  const retentionDays = Number(process.env.MEMBERSHIP_REQUEST_RETENTION_DAYS);
  if (!Number.isSafeInteger(retentionDays) || retentionDays < 1 || retentionDays > 36_500) {
    console.error("MEMBERSHIP_REQUEST_RETENTION_DAYS doit être défini selon la politique de conservation approuvée.");
    return NextResponse.json({ error: "La réception des demandes est temporairement indisponible." }, { status: 503 });
  }
  const clientIp = getClientIp(request);
  if (!clientIp) {
    return NextResponse.json({ error: "La requête n’a pas pu être vérifiée." }, { status: 400 });
  }
  const rateKey = `membership-request-ip:${clientIp}`;
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
  const recentRequest = await db.membershipRequest.findFirst({
    where: {
      email: parsed.data.email,
      createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    select: { id: true },
  });
  if (recentRequest) {
    return NextResponse.json({ message: "Votre demande a été reçue." });
  }

  const rateKeyHash = hashSecret(rateKey);
  const createdAt = new Date();
  const created = await db.$transaction(async (transaction) => {
    await transaction.$executeRaw`
      INSERT INTO "LoginThrottle" ("key", "count", "windowStartedAt", "blockedUntil")
      VALUES (${rateKeyHash}, 1, NOW(), NULL)
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes'
            THEN 1
          ELSE "LoginThrottle"."count" + 1
        END,
        "windowStartedAt" = CASE
          WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes'
            THEN NOW()
          ELSE "LoginThrottle"."windowStartedAt"
        END,
        "blockedUntil" = CASE
          WHEN "LoginThrottle"."windowStartedAt" < NOW() - INTERVAL '15 minutes'
            THEN NULL
          WHEN "LoginThrottle"."count" + 1 >= 5
            THEN NOW() + INTERVAL '15 minutes'
          ELSE "LoginThrottle"."blockedUntil"
        END
    `;
    const membershipRequest = await transaction.membershipRequest.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        locality: parsed.data.locality || null,
        motivation: parsed.data.motivation,
        requestedCategory: parsed.data.requestedCategory,
        retentionUntil: new Date(createdAt.getTime() + retentionDays * 24 * 60 * 60 * 1000),
      },
    });
    await transaction.membershipRequestEvent.create({
      data: { requestId: membershipRequest.id, toStatus: "RECEIVED" },
    });
    return membershipRequest;
  });
  return NextResponse.json({ message: "Votre demande a été reçue." }, { status: 201 });
}
