import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("API error:", message);
  res.status(500).json({ error: "Internal server error" });
};
