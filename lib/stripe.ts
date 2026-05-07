import Stripe from "stripe";

if (!process.env.STRIPE_API_KEY) {
  throw new Error("STRIPE_API_KEY manquant dans .env");
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});
