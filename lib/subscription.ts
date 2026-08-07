import { getAuthOrDemoUser, DEMO_USER_ID, isDemoMode } from "@/lib/auth";
import db from "@/lib/prisma";

const DAY_IN_MS = 86_400_000;

// ─── QUOTAS ─────────────────────────────────────────────────────────────────
export const FREE_QUOTA = 5;
export const PRO_QUOTA = Infinity;
export const DEMO_QUOTA = 10; // Quota maximal de devis pour le compte démo

export interface SubscriptionPlan {
  isPro: boolean;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  quotaLimit: number;
}

/**
 * Vérifie le statut PRO via Lemon Squeezy.
 * - En mode démo : toujours PRO (débloque templates premium + export PDF avancé)
 * - Sinon : vérifie l'abonnement actif en base
 */
export const checkSubscription = async (): Promise<boolean> => {
  const userId = await getAuthOrDemoUser();

  if (!userId) return false;

  // Mode démo : l'utilisateur sandbox bénéficie toujours des privilèges PRO
  if (userId === DEMO_USER_ID || (await isDemoMode())) return true;

  try {
    const subscription = await db.subscription.findUnique({
      where: { userId },
      select: {
        variantId: true,
        endsAt: true,
      },
    });

    if (!subscription) return false;

    // Si pas de date de fin, l'abonnement est considéré comme actif (ou à vie)
    if (!subscription.endsAt) return !!subscription.variantId;

    // Vérification de validité avec période de grâce
    const isValid =
      subscription.variantId &&
      subscription.endsAt.getTime() + DAY_IN_MS > Date.now();

    return !!isValid;
  } catch (error) {
    console.error("Erreur checkSubscription:", error);
    return false;
  }
};

/**
 * Retourne le plan de souscription de l'utilisateur courant.
 * - Mode démo : plan PRO actif avec quota de création limité (démo)
 * - Sinon : plan dérivé de la colonne `plan` de l'utilisateur
 */
export async function getUserSubscriptionPlan(): Promise<SubscriptionPlan | null> {
  const userId = await getAuthOrDemoUser();
  if (!userId) return null;

  // Mode démo : PRO débloqué mais quota de création restreint
  if (userId === DEMO_USER_ID || (await isDemoMode())) {
    return { isPro: true, plan: "PRO", quotaLimit: DEMO_QUOTA };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) return { isPro: false, plan: "FREE", quotaLimit: FREE_QUOTA };

    const isPro = user.plan === "PRO" || user.plan === "ENTERPRISE";
    return {
      isPro,
      plan: user.plan,
      quotaLimit: isPro ? PRO_QUOTA : FREE_QUOTA,
    };
  } catch (error) {
    console.error("Erreur getUserSubscriptionPlan:", error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur courant peut encore créer un devis.
 * Respecte le quota - pour la démo, le quota reste limité malgré le plan PRO.
 */
export async function canCreateQuote(): Promise<{
  allowed: boolean;
  quotaUsed: number;
  quotaLimit: number;
}> {
  const userId = await getAuthOrDemoUser();
  if (!userId) return { allowed: false, quotaUsed: 0, quotaLimit: 0 };

  const plan = await getUserSubscriptionPlan();
  if (!plan) return { allowed: true, quotaUsed: 0, quotaLimit: Infinity };

  try {
    const count = await db.quote.count({ where: { userId } });
    const allowed = count < plan.quotaLimit;
    return { allowed, quotaUsed: count, quotaLimit: plan.quotaLimit };
  } catch (error) {
    console.error("Erreur canCreateQuote:", error);
    return { allowed: false, quotaUsed: 0, quotaLimit: 0 };
  }
}
