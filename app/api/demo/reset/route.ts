import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resetAndSeedDemo } from "@/lib/demo-seed";

// ─── CONSTANTES DE SÉCURITÉ ──────────────────────────────────────────────────
const DEMO_MODE_HEADER = "x-demo-mode";
const DEMO_RESET_TOKEN = "demo-reset"; // En-tête de vérification additionnel

/**
 * POST /api/demo/reset
 * Réinitialise les données de démo (Sandbox) à leur état pristine.
 *
 * SÉCURITÉ :
 *  - Cette route est STRICTEMENT réservée au mode démo.
 *  - Elle vérifie que le header `x-demo-mode: true` est présent
 *    (injecté par le client démo uniquement).
 *  - Elle vérifie aussi un token spécifique `x-demo-reset-token`.
 *  - Elle NE TOUCHE QUE les données associées à DEMO_USER_ID
 *    (jamais celles de vrais utilisateurs authentifiés).
 */
export async function POST(req: NextRequest) {
  try {
    // ── 1. VÉRIFICATIONS DE SÉCURITÉ ──────────────────────────────────────
    const isDemoHeader = req.headers.get(DEMO_MODE_HEADER) === "true";
    const isResetToken = req.headers.get("x-demo-reset-token") === DEMO_RESET_TOKEN;

    if (!isDemoHeader || !isResetToken) {
      return NextResponse.json(
        { error: "Accès refusé : action réservée au mode démo." },
        { status: 403 },
      );
    }

    // ── 2. RÉINITIALISATION ATOMIQUE (transaction Prisma) ──────────────────
    await resetAndSeedDemo(prisma);

    return NextResponse.json({
      success: true,
      message: "Les données de démo ont été réinitialisées.",
      restored: { clients: 4, quotes: 6 },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[DEMO_RESET_ERROR]", error);
    return NextResponse.json(
      { error: "Échec de la réinitialisation des données de démo.", details: errMsg },
      { status: 500 },
    );
  }
}