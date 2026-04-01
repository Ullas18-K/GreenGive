import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string) => process.env[key];

const requireIf = (key: string, condition: boolean) => {
  if (condition) {
    return requireEnv(key);
  }
  return optionalEnv(key);
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  frontendUrl: requireEnv("FRONTEND_URL"),
  adminApiKey: requireEnv("ADMIN_API_KEY"),
  supabaseUrl: requireEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  stripeSecretKey: requireEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: requireEnv("STRIPE_WEBHOOK_SECRET"),
  stripePriceMonthly: requireEnv("STRIPE_PRICE_MONTHLY"),
  stripePriceYearly: requireEnv("STRIPE_PRICE_YEARLY"),
  databaseUrl: requireEnv("DATABASE_URL"),
  bypassSubscription: process.env.BYPASS_SUBSCRIPTION === "true",
  smtpHost: optionalEnv("SMTP_HOST"),
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: optionalEnv("SMTP_USER"),
  smtpPass: optionalEnv("SMTP_PASS"),
  smtpSecure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  emailFrom: requireIf("EMAIL_FROM", Boolean(process.env.SMTP_HOST)),
  emailReplyTo: optionalEnv("EMAIL_REPLY_TO"),
  emailAdmin: optionalEnv("EMAIL_ADMIN"),
  notificationsEnabled: process.env.NOTIFICATIONS_ENABLED !== "false",
};
