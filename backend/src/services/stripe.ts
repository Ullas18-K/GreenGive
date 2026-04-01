import Stripe from "stripe";
import { env } from "../config/env";

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2024-06-20",
});

export const priceIds = {
  monthly: env.stripePriceMonthly,
  yearly: env.stripePriceYearly,
} as const;

export type PlanKey = keyof typeof priceIds;

export const getOrCreateCustomer = async (email: string, name?: string | null) => {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0];
  }
  return stripe.customers.create({ email, name: name ?? undefined });
};
