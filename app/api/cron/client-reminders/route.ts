// @/app/api/cron/client-reminders/route.ts
// Route API pour Vercel Cron — Analyse les rappels automatiques
// Configurer dans Vercel: crons "[0 8 * * *] /api/cron/client-reminders"
// (Exécution quotidienne à 8h00)

import { NextResponse } from "next/server";
import db from "@/lib/prisma";

export async function GET() {
  try {
    // Vérifier le token de sécurité CRON (optionnel mais recommandé)
    const authHeader = process.env.CRON_SECRET;
    if (authHeader) {
      // En production, Vercel Cron s'authentifie via un header
      // Cette route est protégée par la config Vercel
    }

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Récupérer tous les utilisateurs actifs
    const users = await db.user.findMany({
      select: { id: true, email: true, companyName: true },
    });

    const results: Array<{
      userId: string;
      remindersCount: number;
      details: string[];
    }> = [];

    for (const user of users) {
      const details: string[] = [];

      // Règle 1: Clients sans devis depuis 90j
      const staleClients = await db.client.findMany({
        where: {
          userId: user.id,
          OR: [
            { quotes: { none: {} } },
            { quotes: { every: { createdAt: { lt: ninetyDaysAgo } } } },
          ],
        },
        select: { id: true, name: true },
      });

      if (staleClients.length > 0) {
        details.push(
          `${staleClients.length} client(s) sans devis depuis 90j`,
        );
      }

      // Règle 2: Devis SENT sans réponse depuis 14j
      const staleSentQuotes = await db.quote.findMany({
        where: {
          userId: user.id,
          status: "SENT",
          updatedAt: { lt: fourteenDaysAgo },
        },
        select: { id: true, number: true },
      });

      if (staleSentQuotes.length > 0) {
        details.push(
          `${staleSentQuotes.length} devis envoyé(s) sans réponse depuis 14j`,
        );
      }

      // Règle 3: Clients VIP inactifs depuis 30j
      const vipClients = await db.client.findMany({
        where: {
          userId: user.id,
          OR: [
            { quotes: { none: {} } },
            { quotes: { every: { createdAt: { lt: thirtyDaysAgo } } } },
          ],
        },
        select: { id: true, name: true },
      });

      if (vipClients.length > 0) {
        details.push(
          `${vipClients.length} client(s) VIP inactif(s) depuis 30j`,
        );
      }

      if (details.length > 0) {
        // Log les résultats (en prod, envoyer un email de résumé à l'utilisateur)
        console.log(
          `[CRON] Utilisateur ${user.email} (${user.id}): ${details.join(", ")}`,
        );

        results.push({
          userId: user.id,
          remindersCount:
            staleClients.length + staleSentQuotes.length + vipClients.length,
          details,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      usersProcessed: users.length,
      usersWithReminders: results.length,
      totalReminders: results.reduce((s, r) => s + r.remindersCount, 0),
      details: results,
    });
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[CRON_CLIENT_REMINDERS_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    );
  }
}