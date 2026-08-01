import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

const MAX_ACTIVE_SESSIONS = 2;

export async function POST(req: NextRequest) {
  if (!CLERK_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET non configuré" },
      { status: 500 },
    );
  }

  const payload = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "En-têtes Svix manquants" },
      { status: 400 },
    );
  }

  let evt: { type: string; data: { user_id?: string; id?: string } };

  try {
    const wh = new Webhook(CLERK_WEBHOOK_SECRET);
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as { type: string; data: { user_id?: string; id?: string } };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Signature invalide";
    console.error("[CLERK_WEBHOOK_SIGNATURE_ERROR]:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    if (evt.type === "session.created") {
      const userId = evt.data.user_id;
      const newSessionId = evt.data.id;

      if (!userId) {
        return NextResponse.json({ received: true });
      }

      const client = await clerkClient();
      const sessionsResponse = await client.sessions.getSessionList({
        userId,
        status: "active",
      });

      const sessions = sessionsResponse.data;

      // Si plus de 2 sessions actives, révoquer les plus anciennes (hors nouvelle)
      if (sessions.length > MAX_ACTIVE_SESSIONS) {
        const sorted = [...sessions].sort(
          (a, b) =>
            new Date(a.lastActiveAt).getTime() -
            new Date(b.lastActiveAt).getTime(),
        );

        // Garder la nouvelle session + la plus récente, révoquer le reste
        const toRevokeCount = sorted.length - MAX_ACTIVE_SESSIONS;
        const revokeList = sorted.slice(0, toRevokeCount).filter(
          (s) => s.id !== newSessionId,
        );

        for (const s of revokeList) {
          await client.sessions.revokeSession(s.id);
          console.log(
            `[CLERK_SESSION_LIMIT]: Session ${s.id} révoquée (user ${userId})`,
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: unknown) {
    console.error(
      "[CLERK_WEBHOOK_HANDLER_ERROR]:",
      e instanceof Error ? e.message : e,
    );
    return NextResponse.json(
      { error: "Erreur traitement webhook" },
      { status: 500 },
    );
  }
}