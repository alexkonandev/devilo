// lib/auth.ts
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";

// ─── CONSTANTES MODE DÉMO (Sandbox) ─────────────────────────────────────────
export const DEMO_USER_ID = "user_demo_sandbox";
export const DEMO_MODE_HEADER = "x-demo-mode";

/**
 * Vérifie si la requête courante provient d'une route /demo.
 * Le middleware injecte le header `x-demo-mode: true` sur les routes /demo/*.
 */
export async function isDemoMode(): Promise<boolean> {
  try {
    const headerStore = await headers();
    return headerStore.get(DEMO_MODE_HEADER) === "true";
  } catch {
    return false;
  }
}

/**
 * Retourne l'ID utilisateur actif.
 * - En mode démo (/demo/*) : retourne `DEMO_USER_ID` (ID statique seedé en DB)
 * - Sinon : retourne le `userId` Clerk authentifié
 */
export async function getClerkUserId() {
  return getAuthOrDemoUser();
}

/**
 * Helper d'authentification unifié pour les pages et Server Actions.
 * - En mode démo : retourne `DEMO_USER_ID` sans passer par Clerk
 * - Sinon : retourne l'ID Clerk authentifié
 */
export async function getAuthOrDemoUser(): Promise<string | null> {
  if (await isDemoMode()) {
    return DEMO_USER_ID;
  }
  const { userId } = await auth();
  return userId;
}

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}