"use server";

import { getClerkUserId, getCurrentUser, DEMO_USER_ID } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { QuoteStatus } from "@/app/generated/prisma/enums";
import { getUserSubscriptionPlan, DEMO_QUOTA } from "@/lib/subscription";

// ─── Types exportés ─────────────────────────────────────────────────────────

export interface BillingProfile {
  plan: "FREE" | "PRO" | "ENTERPRISE";
  quotaUsed: number;
  quotaLimit: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionEndsAt: string | null;
  invoices: BillingInvoice[];
  // --- Enrichments ---
  monthlyStats: MonthlyStats;
  nextPayment: NextPayment | null;
}

export interface BillingInvoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
}

export interface MonthlyStats {
  quotesThisMonth: number;
  quotesTotal: number;
  quotesAccepted: number;
  revenueThisMonth: number;
}

export interface NextPayment {
  date: string;
  amount: number;
  currency: string;
  cardBrand: string | null;
  cardLast4: string | null;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const FREE_QUOTA = 5;
const PRO_QUOTA = Infinity;

// ─── Helper : créer l'utilisateur en DB s'il n'existe pas ──────────────────

async function ensureUserExists(userId: string) {
  const existing = await db.user.findUnique({ where: { id: userId } });
  if (existing) return existing;

  // Création automatique du profil utilisateur via Clerk
  try {
    const clerkUser = await getCurrentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      console.warn("[ENSURE_USER] Impossible de récupérer l'email Clerk — l'utilisateur sera créé sans email");
      return db.user.create({
        data: { id: userId, email: "" },
      });
    }

    return db.user.create({
      data: { id: userId, email },
    });
  } catch (error) {
    console.error("[ENSURE_USER_ERROR]", error);
    // Ne pas bloquer — on retourne undefined et le code continue
    return undefined;
  }
}

// ─── Récupération du profil billing ─────────────────────────────────────────

export async function getBillingProfile(): Promise<BillingProfile | null> {
  const userId = await getClerkUserId();
  if (!userId) return null;

  // Mode démo : court-circuit global — PRO débloqué sans dépendre de la DB/Stripe
  if (userId === DEMO_USER_ID) {
    const quotaUsed = await db.quote.count({ where: { userId } });
    return {
      plan: "PRO",
      quotaUsed,
      quotaLimit: DEMO_QUOTA,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionEndsAt: null,
      invoices: [],
      monthlyStats: {
        quotesThisMonth: quotaUsed,
        quotesTotal: quotaUsed,
        quotesAccepted: 0,
        revenueThisMonth: 0,
      },
      nextPayment: null,
    };
  }

  // Assurer que l'utilisateur existe en base (création auto si nouveau compte)
  await ensureUserExists(userId);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [user, monthlyQuotes, acceptedThisMonth] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: {
          plan: true,
          subscription: {
            select: {
              customerId: true,
              subscriptionId: true,
              endsAt: true,
            },
          },
          _count: { select: { quotes: true } },
        },
      }),
      db.quote.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      db.quote.findMany({
        where: {
          userId,
          createdAt: { gte: startOfMonth },
          status: { in: [QuoteStatus.ACCEPTED, QuoteStatus.PAID] },
        },
        include: {
          lines: { select: { unitPrice: true, quantity: true } },
        },
      }),
    ]);

    if (!user) return null;

    const isPro = user.plan === "PRO" || user.plan === "ENTERPRISE";

    // Récupérer le quota applicable (la démo PRO conserve un quota limité)
    const plan = await getUserSubscriptionPlan();
    const quotaLimit = plan?.quotaLimit ?? (isPro ? PRO_QUOTA : FREE_QUOTA);

    const revenueThisMonth = acceptedThisMonth.reduce((sum, q) => {
      const quoteTotal = q.lines.reduce(
        (s, l) => s + l.unitPrice * l.quantity,
        0,
      );
      return sum + quoteTotal;
    }, 0);

    const quotesAccepted = acceptedThisMonth.length;

    let invoices: BillingInvoice[] = [];
    let nextPayment: NextPayment | null = null;

    const customerId = user.subscription?.customerId;
    const subscriptionId = user.subscription?.subscriptionId;

    if (customerId) {
      try {
        const stripeInvoices = await stripe.invoices.list({
          customer: customerId,
          limit: 10,
        });
        invoices = stripeInvoices.data.map((inv) => ({
          id: inv.id,
          date: new Date((inv.created ?? 0) * 1000).toISOString(),
          amount: (inv.amount_paid ?? 0) / 100,
          currency: (inv.currency ?? "xof").toUpperCase(),
          status: inv.status ?? "unknown",
          pdfUrl: inv.invoice_pdf ?? null,
        }));

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["default_payment_method"],
          });

          const pm = sub.default_payment_method;
          const card =
            pm && typeof pm === "object" && "card" in pm ? pm.card : null;

          const periodEnd = (sub as unknown as { current_period_end?: number })
            .current_period_end;

          nextPayment = {
            date: periodEnd ? new Date(periodEnd * 1000).toISOString() : "",
            amount: (sub.items.data[0]?.price?.unit_amount ?? 0) / 100,
            currency: (sub.items.data[0]?.price?.currency ?? "xof").toUpperCase(),
            cardBrand: card?.brand ?? null,
            cardLast4: card?.last4 ?? null,
          };
        }
      } catch {
        // Silencieux si le customerId est invalide
      }
    }

    return {
      plan: user.plan,
      quotaUsed: user._count.quotes,
      quotaLimit,
      stripeCustomerId: customerId ?? null,
      stripeSubscriptionId: subscriptionId ?? null,
      subscriptionEndsAt: user.subscription?.endsAt?.toISOString() ?? null,
      invoices,
      monthlyStats: {
        quotesThisMonth: monthlyQuotes,
        quotesTotal: user._count.quotes,
        quotesAccepted: quotesAccepted,
        revenueThisMonth,
      },
      nextPayment,
    };
  } catch (error) {
    console.error("[GET_BILLING_PROFILE_ERROR]", error);
    return null;
  }
}

// ─── Création d'une Checkout Session Stripe ─────────────────────────────────

export async function createCheckoutSession(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  const priceId = process.env.STRIPE_PRO_PRICE_ID;

  if (!priceId) {
    return { success: false, error: "STRIPE_PRO_PRICE_ID non configuré" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, subscription: { select: { customerId: true } } },
    });

    if (!user) return { success: false, error: "USER_NOT_FOUND" };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: user.subscription?.customerId || undefined,
      customer_email: !user.subscription?.customerId
        ? (user.email ?? undefined) ?? undefined
        : undefined,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: { userId },
    });

    return { success: true, url: session.url ?? undefined };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur Stripe",
    };
  }
}

// ─── Gestion du portail Stripe ─────────────────────────────────────────────

export async function createPortalSession(): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { subscription: { select: { customerId: true } } },
    });

    const customerId = user?.subscription?.customerId;
    if (!customerId) return { success: false, error: "NO_SUBSCRIPTION" };

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });
    return { success: true, url: session.url };
  } catch (e: unknown) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Erreur portail",
    };
  }
}

// ─── Activation PRO via session Stripe (fallback sans webhook) ──────────────

export async function activateProFromSession(sessionId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "UNAUTHORIZED" };

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return { success: false, error: "Paiement non confirmé" };
    }

    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!customerId || !subscriptionId) {
      return { success: false, error: "Session Stripe incomplète" };
    }

    await syncSubscription(userId, customerId, subscriptionId, "PRO", null);
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur Stripe";
    console.error("[ACTIVATE_PRO_FROM_SESSION_ERROR]:", msg);
    return { success: false, error: msg };
  }
}

// ─── Sync plan après webhook ───────────────────────────────────────────────

export async function syncSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string,
  plan: "FREE" | "PRO",
  endsAt: Date | null,
) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { plan },
    });

    await db.subscription.upsert({
      where: { userId },
      create: {
        userId,
        customerId,
        subscriptionId,
        endsAt,
      },
      update: {
        customerId,
        subscriptionId,
        endsAt,
      },
    });

    revalidatePath("/billing");
    revalidatePath("/settings");
  } catch (error) {
    console.error("[SYNC_SUBSCRIPTION_ERROR]", error);
  }
}