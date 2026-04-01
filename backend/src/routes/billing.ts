import type { Request, Response } from "express";
import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { getOrCreateCustomer, priceIds, stripe, type PlanKey } from "../services/stripe";
import { notifySubscriptionActive, notifySubscriptionCanceled, notifyWelcome } from "../services/notifications";

type CheckoutBody = {
  userId: string;
  email: string;
  plan: PlanKey;
  name?: string;
  charityId?: string;
  charityName?: string;
  charityPercent?: number;
};

type CharityUpdateBody = {
  userId: string;
  charityId?: string;
  charityName?: string;
  charityPercent?: number;
};

const amountForPlan = (plan: PlanKey) => (plan === "monthly" ? 9.99 : 99.99);
const decimalAmount = (plan: PlanKey) => new Prisma.Decimal(amountForPlan(plan));
const clampCharityPercent = (value: number) => Math.max(10, Math.min(50, Math.trunc(value)));

export const createCheckoutSession = async (req: Request, res: Response) => {
  const { userId, email, plan, name, charityId, charityName, charityPercent } = req.body as CheckoutBody;

  if (!userId || !email || !plan) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  if (!(plan in priceIds)) {
    return res.status(400).json({ error: "Invalid plan selected." });
  }

  const customer = await getOrCreateCustomer(email, name);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    line_items: [{ price: priceIds[plan], quantity: 1 }],
    success_url: `${env.frontendUrl}/dashboard?checkout=success`,
    cancel_url: `${env.frontendUrl}/signup?checkout=cancel`,
    subscription_data: {
      metadata: {
        user_id: userId,
        plan,
      },
    },
    metadata: {
      user_id: userId,
      plan,
    },
  });

  try {
    const resolvedCharityPercent = Number.isFinite(charityPercent)
      ? clampCharityPercent(charityPercent as number)
      : 10;

    const resolvedCharity = charityId
      ? await prisma.charity.findUnique({ where: { id: charityId } })
      : null;
    const resolvedCharityName = resolvedCharity?.name ?? charityName ?? null;

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        plan,
        amount: decimalAmount(plan),
        charityId: resolvedCharity?.id ?? charityId ?? null,
        charityName: resolvedCharityName,
        charityPercent: resolvedCharityPercent,
        charityChangedAt: new Date(),
        status: "pending",
        stripeSubscriptionId: null,
        renewalDate: null,
      },
      create: {
        userId,
        plan,
        amount: decimalAmount(plan),
        charityId: resolvedCharity?.id ?? charityId ?? null,
        charityName: resolvedCharityName,
        charityPercent: resolvedCharityPercent,
        charityChangedAt: new Date(),
        status: "pending",
        stripeSubscriptionId: null,
        renewalDate: null,
      },
    });

    await prisma.userRole.upsert({
      where: { userId },
      update: { role: "user" },
      create: { userId, role: "user" },
    });

    await notifyWelcome(email, name ?? null);
  } catch (error) {
    return res.status(500).json({ error: "Failed to initialize subscription." });
  }

  return res.status(200).json({ checkoutUrl: session.url });
};

export const updateCharitySelection = async (req: Request, res: Response) => {
  const { userId, charityId, charityName, charityPercent } = req.body as CharityUpdateBody;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId." });
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) {
    return res.status(404).json({ error: "Subscription not found." });
  }

  if (subscription.status !== "active") {
    return res.status(403).json({ error: "Subscription is not active." });
  }

  const lastChange = subscription.charityChangedAt;
  if (lastChange) {
    const now = new Date();
    const nextAllowed = new Date(lastChange.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (now < nextAllowed) {
      return res.status(409).json({
        error: "Charity can only be changed once per month.",
        nextChangeAt: nextAllowed.toISOString(),
      });
    }
  }

  const resolvedCharityPercent = Number.isFinite(charityPercent)
    ? clampCharityPercent(charityPercent as number)
    : subscription.charityPercent ?? 10;

  const resolvedCharity = charityId
    ? await prisma.charity.findUnique({ where: { id: charityId } })
    : null;
  if (charityId && !resolvedCharity) {
    return res.status(400).json({ error: "Invalid charity selection." });
  }

  const updated = await prisma.subscription.update({
    where: { userId },
    data: {
      charityId: resolvedCharity?.id ?? charityId ?? null,
      charityName: resolvedCharity?.name ?? charityName ?? null,
      charityPercent: resolvedCharityPercent,
      charityChangedAt: new Date(),
    },
  });

  return res.status(200).json({
    subscription: {
      charityId: updated.charityId,
      charityName: updated.charityName,
      charityPercent: updated.charityPercent,
      charityChangedAt: updated.charityChangedAt,
    },
  });
};

const updateSubscription = async (subscription: Stripe.Subscription, userId?: string | null) => {
  const resolvedUserId = userId ?? subscription.metadata.user_id;
  if (!resolvedUserId) {
    return;
  }

  const existing = await prisma.subscription.findUnique({ where: { userId: resolvedUserId } });

  const renewalDate = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  const plan = (subscription.metadata.plan as PlanKey) ?? "monthly";

  await prisma.subscription.upsert({
    where: { userId: resolvedUserId },
    update: {
      plan,
      amount: decimalAmount(plan),
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      renewalDate,
    },
    create: {
      userId: resolvedUserId,
      plan,
      amount: decimalAmount(plan),
      status: subscription.status,
      stripeSubscriptionId: subscription.id,
      renewalDate,
    },
  });

  const previousStatus = existing?.status ?? null;
  if (previousStatus !== "active" && subscription.status === "active") {
    await notifySubscriptionActive(resolvedUserId, plan, renewalDate);
  }

  if (previousStatus === "active" && subscription.status !== "active") {
    await notifySubscriptionCanceled(resolvedUserId);
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string | undefined;
  if (!signature) {
    return res.status(400).send("Missing Stripe signature.");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string | null;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await updateSubscription(subscription, session.metadata?.user_id ?? null);
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await updateSubscription(subscription, subscription.metadata.user_id);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscription(subscription, subscription.metadata.user_id);
      break;
    }
    default:
      break;
  }

  return res.status(200).json({ received: true });
};
