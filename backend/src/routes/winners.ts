import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";
import { notifyAdminProofSubmitted, notifyProofReceived } from "../services/notifications.js";

export const updateWinnerProof = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, proofUrl } = req.body as { userId?: string; proofUrl?: string | null };

  if (!userId) {
    return res.status(400).json({ error: "Missing user id." });
  }

  if (!proofUrl || typeof proofUrl !== "string") {
    return res.status(400).json({ error: "Proof URL is required." });
  }

  const winner = await prisma.winner.findUnique({ where: { id } });
  if (!winner || winner.userId !== userId) {
    return res.status(404).json({ error: "Winner not found." });
  }

  const updated = await prisma.winner.update({
    where: { id },
    data: {
      proofUrl,
      verified: false,
      paid: false,
    },
  });

  await notifyProofReceived(updated.userId);
  await notifyAdminProofSubmitted(updated.userId, proofUrl);

  return res.status(200).json({ winner: { id: updated.id, proofUrl: updated.proofUrl } });
};
