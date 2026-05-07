"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import db from "@/lib/prisma";

// ─── Types exportés vers le client ───────────────────────────────────────────

export interface ParsedSession {
  id: string;
  browser: string;
  os: string;
  ip: string;
  city: string;
  country: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface SecurityProfile {
  sessions: ParsedSession[];
  score: number;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  currentSessionId: string;
}

// ─── Récupération du profil de sécurité complet ──────────────────────────────

export async function getSecurityProfile(): Promise<SecurityProfile> {
  const { userId, sessionId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();

  // Sessions actives
  const sessionsResponse = await client.sessions.getSessionList({
    userId,
    status: "active",
  });

  const parsedSessions: ParsedSession[] = sessionsResponse.data.map((s) => {
    // Clerk expose directement browserName, deviceType, ipAddress, city, country
    const browserName = s.latestActivity?.browserName || "Navigateur inconnu";
    const osName = s.latestActivity?.deviceType || "OS inconnu";
    const ip = s.latestActivity?.ipAddress || "—";
    const city = s.latestActivity?.city || "—";
    const country = s.latestActivity?.country || "—";

    return {
      id: s.id,
      browser: browserName,
      os: osName,
      ip,
      city,
      country,
      lastActiveAt: new Date(s.lastActiveAt).toISOString(),
      isCurrent: s.id === sessionId,
    };
  });

  // Données utilisateur Clerk
  const clerkUser = await client.users.getUser(userId);
  const emailVerified =
    clerkUser.emailAddresses[0]?.verification?.status === "verified";
  const twoFactorEnabled = clerkUser.twoFactorEnabled ?? false;

  // Score : 50 pts email vérifié + 50 pts profil complet
  let score = 0;
  if (emailVerified) score += 50;
  // Bonus profil : si l'user a un nom de société configuré en BDD
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { companyName: true },
  });
  if (user?.companyName) score += 50;

  return {
    sessions: parsedSessions,
    score,
    emailVerified,
    twoFactorEnabled,
    currentSessionId: sessionId ?? "",
  };
}

// ─── Révocation d'une session ─────────────────────────────────────────────────

export async function revokeSession(sessionId: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  try {
    const client = await clerkClient();
    await client.sessions.revokeSession(sessionId);
    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }
}

// ─── Suppression de compte — atomique avec soft-delete ───────────────────────

export async function deleteAccountSecure(confirmEmail: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  // Vérification que l'email saisi correspond
  if (confirmEmail.toLowerCase().trim() !== primaryEmail.toLowerCase()) {
    return { success: false, error: "EMAIL_MISMATCH" };
  }

  try {
    // 1. Soft-delete en BDD — marque deletedAt avant toute suppression
    await db.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // 2. Suppression Clerk
    await client.users.deleteUser(userId);

    // 3. Hard-delete BDD (orphelin impossible si Clerk a réussi)
    await db.user.delete({ where: { id: userId } });

    console.log(`[ACCOUNT_TERMINATED]: User ${userId} purged.`);
  } catch (e: unknown) {
    // Rollback soft-delete si quoi que ce soit échoue
    await db.user
      .update({
        where: { id: userId },
        data: { deletedAt: null },
      })
      .catch(() => {});
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur inconnue",
    };
  }

  revalidatePath("/");
  redirect("/");
}
