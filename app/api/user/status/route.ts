import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userStats = await db.user.findUnique({
      where: { id: userId },
      select: {
        _count: { select: { quotes: true, clients: true } },
      },
    });

    const isNewUser =
      !userStats ||
      (userStats._count.quotes === 0 && userStats._count.clients === 0);

    return NextResponse.json({ isNewUser });
  } catch (error) {
    console.error("Erreur checkUserStatus:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}