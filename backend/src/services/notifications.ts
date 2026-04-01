import nodemailer from "nodemailer";
import { env } from "../config/env";
import { supabaseAdmin } from "./supabase";

const smtpTransport = env.smtpHost
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    })
  : null;

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 2 }).format(value);

const getUserContact = async (userId: string) => {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error || !data.user) {
    return { email: null, name: null };
  }
  const metadata = data.user.user_metadata as Record<string, unknown> | null;
  const name =
    (metadata?.full_name as string | undefined) ??
    (metadata?.name as string | undefined) ??
    (metadata?.display_name as string | undefined) ??
    null;

  return { email: data.user.email ?? null, name };
};

const sendEmail = async ({ to, subject, html, text }: EmailPayload) => {
  if (!env.notificationsEnabled) {
    return { skipped: true };
  }
  if (!smtpTransport || !env.emailFrom) {
    return { skipped: true };
  }
  try {
    return await smtpTransport.sendMail({
      from: env.emailFrom,
      to,
      subject,
      html,
      text,
      replyTo: env.emailReplyTo ?? undefined,
    });
  } catch (error) {
    console.error("Email send failed", error);
    return { error };
  }
};

export const notifyWelcome = async (email: string, name?: string | null) => {
  const subject = "Welcome to GreenGive";
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const dashboardUrl = `${env.frontendUrl}/dashboard`;

  return sendEmail({
    to: email,
    subject,
    text: `${greeting}\n\nThanks for joining GreenGive. Complete checkout to activate your membership.\n\nVisit your dashboard: ${dashboardUrl}`,
    html: `<p>${greeting}</p><p>Thanks for joining GreenGive. Complete checkout to activate your membership.</p><p><a href="${dashboardUrl}">Open your dashboard</a></p>`,
  });
};

export const notifySubscriptionActive = async (userId: string, plan: string, renewalDate: Date | null) => {
  const contact = await getUserContact(userId);
  if (!contact.email) return null;

  const renewal = renewalDate
    ? renewalDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "TBD";
  const subject = "Your GreenGive membership is active";
  const greeting = contact.name ? `Hi ${contact.name},` : "Hi there,";

  return sendEmail({
    to: contact.email,
    subject,
    text: `${greeting}\n\nYour ${plan} plan is now active. Renewal: ${renewal}.\n\nSee your dashboard: ${env.frontendUrl}/dashboard`,
    html: `<p>${greeting}</p><p>Your ${plan} plan is now active. Renewal: <strong>${renewal}</strong>.</p><p><a href="${env.frontendUrl}/dashboard">Open your dashboard</a></p>`,
  });
};

export const notifySubscriptionCanceled = async (userId: string) => {
  const contact = await getUserContact(userId);
  if (!contact.email) return null;
  const subject = "Your GreenGive membership ended";
  const greeting = contact.name ? `Hi ${contact.name},` : "Hi there,";

  return sendEmail({
    to: contact.email,
    subject,
    text: `${greeting}\n\nYour GreenGive membership is no longer active. If this was a mistake, you can resubscribe anytime.\n\n${env.frontendUrl}/signup`,
    html: `<p>${greeting}</p><p>Your GreenGive membership is no longer active. If this was a mistake, you can resubscribe anytime.</p><p><a href="${env.frontendUrl}/signup">Resume membership</a></p>`,
  });
};

export const notifyWinner = async (userId: string, matchType: string, prizeAmount: number, drawDate: Date) => {
  const contact = await getUserContact(userId);
  if (!contact.email) return null;
  const subject = "You have a GreenGive prize";
  const greeting = contact.name ? `Hi ${contact.name},` : "Hi there,";
  const dateLabel = drawDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return sendEmail({
    to: contact.email,
    subject,
    text: `${greeting}\n\nYou matched ${matchType} numbers in the ${dateLabel} draw. Prize: ${formatCurrency(prizeAmount)}.\n\nUpload proof in your dashboard: ${env.frontendUrl}/dashboard`,
    html: `<p>${greeting}</p><p>You matched ${matchType} numbers in the ${dateLabel} draw.</p><p><strong>Prize:</strong> ${formatCurrency(prizeAmount)}</p><p><a href="${env.frontendUrl}/dashboard">Upload proof in your dashboard</a></p>`,
  });
};

export const notifyProofReceived = async (userId: string) => {
  const contact = await getUserContact(userId);
  if (!contact.email) return null;
  const subject = "Proof received";
  const greeting = contact.name ? `Hi ${contact.name},` : "Hi there,";

  return sendEmail({
    to: contact.email,
    subject,
    text: `${greeting}\n\nWe received your proof submission and will review it shortly.\n\n${env.frontendUrl}/dashboard`,
    html: `<p>${greeting}</p><p>We received your proof submission and will review it shortly.</p><p><a href="${env.frontendUrl}/dashboard">View your dashboard</a></p>`,
  });
};

export const notifyAdminProofSubmitted = async (userId: string, proofUrl: string) => {
  if (!env.emailAdmin) return null;
  const subject = "New winner proof submitted";
  return sendEmail({
    to: env.emailAdmin,
    subject,
    text: `A winner submitted proof. User: ${userId}. Proof: ${proofUrl}`,
    html: `<p>A winner submitted proof.</p><p><strong>User:</strong> ${userId}</p><p><a href="${proofUrl}">View proof</a></p>`,
  });
};

export const notifyWinnerVerified = async (userId: string, prizeAmount: number) => {
  const contact = await getUserContact(userId);
  if (!contact.email) return null;
  const subject = "Your GreenGive win is verified";
  const greeting = contact.name ? `Hi ${contact.name},` : "Hi there,";

  return sendEmail({
    to: contact.email,
    subject,
    text: `${greeting}\n\nYour win has been verified. Prize amount: ${formatCurrency(prizeAmount)}.\n\n${env.frontendUrl}/dashboard`,
    html: `<p>${greeting}</p><p>Your win has been verified.</p><p><strong>Prize amount:</strong> ${formatCurrency(prizeAmount)}</p><p><a href="${env.frontendUrl}/dashboard">View your dashboard</a></p>`,
  });
};

export const notifyWinnerPaid = async (userId: string, prizeAmount: number) => {
  const contact = await getUserContact(userId);
  if (!contact.email) return null;
  const subject = "Your GreenGive prize has been paid";
  const greeting = contact.name ? `Hi ${contact.name},` : "Hi there,";

  return sendEmail({
    to: contact.email,
    subject,
    text: `${greeting}\n\nYour prize payment of ${formatCurrency(prizeAmount)} has been marked as paid.\n\n${env.frontendUrl}/dashboard`,
    html: `<p>${greeting}</p><p>Your prize payment of <strong>${formatCurrency(prizeAmount)}</strong> has been marked as paid.</p><p><a href="${env.frontendUrl}/dashboard">View your dashboard</a></p>`,
  });
};
