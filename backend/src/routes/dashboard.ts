import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

type DashboardRequest = {
  userId?: string;
};

const toNumber = (value: Prisma.Decimal | number | null) => {
  if (value === null) return null;
  if (typeof value === "number") return value;
  return Number.parseFloat(value.toString());
};

export const getDashboardSummary = async (req: Request, res: Response) => {
  const { userId } = req.body as DashboardRequest;
  if (!userId) {
    return res.status(400).json({ error: "Missing user id." });
  }

  const [scores, drawsEntered, nextDraw, winnings] = await Promise.all([
    prisma.score.findMany({
      where: { userId },
      orderBy: [{ scoreDate: "desc" }, { createdAt: "desc" }],
      select: { id: true, scoreValue: true, scoreDate: true },
      take: 5,
    }),
    prisma.drawEntry.count({ where: { userId } }),
    prisma.draw.findFirst({
      where: { published: true },
      orderBy: { drawDate: "asc" },
      select: { drawDate: true },
    }),
    prisma.winner.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        matchType: true,
        prizeAmount: true,
        proofUrl: true,
        verified: true,
        paid: true,
        createdAt: true,
      },
    }),
  ]);

  const winningsTotal = winnings.reduce((sum, row) => {
    const amount = toNumber(row.prizeAmount) ?? 0;
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  return res.status(200).json({
    scores: scores.map((score) => ({
      id: score.id,
      scoreValue: score.scoreValue,
      scoreDate: score.scoreDate.toISOString(),
    })),
    drawsEntered,
    nextDrawDate: nextDraw?.drawDate ? nextDraw.drawDate.toISOString() : null,
    winningsTotal,
    winners: winnings.map((winner) => ({
      id: winner.id,
      matchType: winner.matchType,
      prizeAmount: toNumber(winner.prizeAmount) ?? 0,
      proofUrl: winner.proofUrl,
      verified: winner.verified,
      paid: winner.paid,
      createdAt: winner.createdAt.toISOString(),
    })),
  });
};
