"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getClerkUserId } from "@/lib/auth";
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
  passwordEnabled: boolean;
}

// ─── Récupération du profil de sécurité complet ──────────────────────────────

export async function getSecurityProfile(): Promise<SecurityProfile> {
  const userId = await getClerkUserId();
  const { sessionId } = await auth();
  if (!userId) redirect("/sign-in");

  const client = await clerkClient();

  const sessionsResponse = await client.sessions.getSessionList({
    userId,
    status: "active",
  });

  const parsedSessions: ParsedSession[] = sessionsResponse.data.map((s) => {
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

  const clerkUser = await client.users.getUser(userId);
  const emailVerified =
    clerkUser.emailAddresses[0]?.verification?.status === "verified";
  const twoFactorEnabled = clerkUser.twoFactorEnabled ?? false;

  let score = 0;
  if (emailVerified) score += 50;
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
    passwordEnabled: clerkUser.passwordEnabled ?? false,
  };
}

// ─── Révocation d'une session ─────────────────────────────────────────────────

export async function revokeSession(sessionId: string) {
  const userId = await getClerkUserId();
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

// ─── Setter un mot de passe pour les utilisateurs OAuth (Google, etc.) ───────

export async function setInitialPassword(newPassword: string) {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  try {
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "WEAK_PASSWORD",
        message: "Le mot de passe doit contenir au moins 8 caractères",
      };
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      password: newPassword,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    console.error("[INITIAL_PASSWORD_ERROR]:", e);
    return {
      success: false,
      error: "CLERK_ERROR",
      message: e instanceof Error ? e.message : "Erreur lors de la création du mot de passe",
    };
  }
}

// ─── Changement de mot de passe via Clerk ────────────────────────────────────

export async function updatePassword(currentPassword: string, newPassword: string) {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  try {
    // Validation commune
    if (newPassword.length < 8) {
      return {
        success: false,
        error: "WEAK_PASSWORD",
        message: "Le mot de passe doit contenir au moins 8 caractères",
      };
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);

    // Si l'utilisateur a déjà un mot de passe, vérifier l'actuel
    if (clerkUser.passwordEnabled) {
      try {
        await client.users.verifyPassword({
          userId,
          password: currentPassword,
        });
      } catch {
        return {
          success: false,
          error: "WRONG_CURRENT_PASSWORD",
          message: "Le mot de passe actuel est incorrect",
        };
      }

      if (currentPassword === newPassword) {
        return {
          success: false,
          error: "SAME_AS_OLD",
          message: "Le nouveau mot de passe doit être différent de l'actuel",
        };
      }
    }

    // Mettre à jour le mot de passe
    await client.users.updateUser(userId, {
      password: newPassword,
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (e: unknown) {
    console.error("[PASSWORD_UPDATE_ERROR]:", e);
    return {
      success: false,
      error: "CLERK_ERROR",
      message: e instanceof Error ? e.message : "Erreur lors de la mise à jour du mot de passe",
    };
  }
}

// ─── Suppression de compte — atomique avec soft-delete ───────────────────────

export async function deleteAccountSecure(confirmEmail: string) {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  if (confirmEmail.toLowerCase().trim() !== primaryEmail.toLowerCase()) {
    return { success: false, error: "EMAIL_MISMATCH" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    await client.users.deleteUser(userId);

    await db.user.delete({ where: { id: userId } });

    console.log(`[ACCOUNT_TERMINATED]: User ${userId} purged.`);
  } catch (e: unknown) {
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