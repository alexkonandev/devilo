import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { syncSubscription } from "@/actions/billing-action";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET non configuré" },
      { status: 500 },
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Signature invalide";
    console.error("[STRIPE_WEBHOOK_SIGNATURE_ERROR]:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (userId && customerId && subscriptionId) {
          await syncSubscription(
            userId,
            customerId,
            subscriptionId,
            "PRO",
            null,
          );
          console.log(`[STRIPE_CHECKOUT_OK]: User ${userId} → PRO`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        if (!customerId) break;

        // Trouver le user par customerId
        const { syncSubscription: syncSub } =
          await import("@/actions/billing-action");
        const db = (await import("@/lib/prisma")).default;
        const subscription = await db.subscription.findUnique({
          where: { customerId },
          select: { userId: true },
        });

        if (subscription) {
          const isActive = sub.status === "active" || sub.status === "trialing";
          const endsAt = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;

          await syncSub(
            subscription.userId,
            customerId,
            sub.id,
            isActive ? "PRO" : "FREE",
            endsAt,
          );
          console.log(
            `[STRIPE_SUB_UPDATE]: User ${subscription.userId} → ${isActive ? "PRO" : "FREE"}`,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

        if (!customerId) break;

        const db = (await import("@/lib/prisma")).default;
        const subscription = await db.subscription.findUnique({
          where: { customerId },
          select: { userId: true },
        });

        if (subscription) {
          await syncSubscription(
            subscription.userId,
            customerId,
            sub.id,
            "FREE",
            null,
          );
          console.log(
            `[STRIPE_SUB_DELETED]: User ${subscription.userId} → FREE`,
          );
        }
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK_UNHANDLED]: ${event.type}`);
    }
  } catch (e: unknown) {
    console.error(
      "[STRIPE_WEBHOOK_HANDLER_ERROR]:",
      e instanceof Error ? e.message : e,
    );
    return NextResponse.json(
      { error: "Erreur traitement webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
