"use server";

import { getClerkUserId } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import db from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

// ─── Récupération du profil billing ─────────────────────────────────────────

export async function getBillingProfile(): Promise<BillingProfile | null> {
  const userId = await getClerkUserId();
  if (!userId) return null;

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
          status: { in: ["ACCEPTED", "PAID"] },
        },
        select: {
          lines: { select: { unitPrice: true, quantity: true } },
        },
      }),
    ]);

    if (!user) return null;

    const isPro = user.plan === "PRO" || user.plan === "ENTERPRISE";

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
      quotaLimit: isPro ? PRO_QUOTA : FREE_QUOTA,
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
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