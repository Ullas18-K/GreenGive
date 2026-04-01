import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { createCheckoutSession, handleStripeWebhook, updateCharitySelection } from "./routes/billing.js";
import { listCharities, getCharityById } from "./routes/charities.js";
import { listPublishedDraws } from "./routes/draws.js";
import { createScore } from "./routes/scores.js";
import { getDashboardSummary } from "./routes/dashboard.js";
import { updateWinnerProof } from "./routes/winners.js";
import {
  createAdminCharity,
  createAdminDraw,
  deleteAdminCharity,
  listAdminCharities,
  listAdminDraws,
  listAdminUsers,
  listAdminWinners,
  simulateAdminDraw,
  updateAdminCharity,
  updateAdminDraw,
  updateAdminWinner,
} from "./routes/admin.js";
import { healthHandler } from "./routes/health.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

const allowedOrigins = env.frontendUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
}));

app.get("/api/health", healthHandler);
app.get("/api/charities", listCharities);
app.get("/api/charities/:id", getCharityById);
app.get("/api/draws", listPublishedDraws);

// Stripe requires the raw body for webhook signature verification.
app.post("/api/billing/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());

app.post("/api/billing/checkout", createCheckoutSession);
app.post("/api/billing/charity", updateCharitySelection);
app.post("/api/scores", createScore);
app.post("/api/dashboard/summary", getDashboardSummary);
app.post("/api/winners/:id/proof", updateWinnerProof);

app.get("/api/admin/users", listAdminUsers);
app.get("/api/admin/charities", listAdminCharities);
app.post("/api/admin/charities", createAdminCharity);
app.patch("/api/admin/charities/:id", updateAdminCharity);
app.delete("/api/admin/charities/:id", deleteAdminCharity);
app.get("/api/admin/draws", listAdminDraws);
app.post("/api/admin/draws", createAdminDraw);
app.patch("/api/admin/draws/:id", updateAdminDraw);
app.post("/api/admin/draws/:id/simulate", simulateAdminDraw);
app.get("/api/admin/winners", listAdminWinners);
app.patch("/api/admin/winners/:id", updateAdminWinner);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on :${env.port}`);
});
