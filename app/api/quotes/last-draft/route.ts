import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";

/**
 * GET /api/quotes/last-draft
 * Retourne l'ID du dernier brouillon DRAFT de l'utilisateur connecté, ou null.
 * Évite la redirection serveur quotes/new → quotes/[id] qui cause un flash blanc.
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ quoteId: null }, { status: 200 });
    }

    const lastDraft = await db.quote.findFirst({
      where: { userId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" },
      select: { id: true },
    });

    return NextResponse.json(
      { quoteId: lastDraft?.id ?? null },
      { status: 200 }
    );
  } catch (error) {
    console.error("[/api/quotes/last-draft] Error:", error);
    return NextResponse.json({ quoteId: null }, { status: 500 });
  }
}