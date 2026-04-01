import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

const toNumber = (value: Prisma.Decimal | number | null) => {
  if (value === null) return null;
  if (typeof value === "number") return value;
  return Number.parseFloat(value.toString());
};

export const listPublishedDraws = async (_req: Request, res: Response) => {
  const draws = await prisma.draw.findMany({
    where: { published: true },
    orderBy: { drawDate: "desc" },
  });

  if (draws.length === 0) {
    return res.status(200).json({ draws: [] });
  }

  const drawIds = draws.map((draw) => draw.id);
  const winnerGroups = await prisma.winner.groupBy({
    by: ["drawId", "matchType", "prizeAmount"],
    where: { drawId: { in: drawIds } },
    _count: { _all: true },
  });

  const winnersByDraw = new Map<string, typeof winnerGroups>();
  for (const group of winnerGroups) {
    const existing = winnersByDraw.get(group.drawId) ?? [];
    existing.push(group);
    winnersByDraw.set(group.drawId, existing);
  }

  const drawsPayload = draws.map((draw) => {
    const groups = winnersByDraw.get(draw.id) ?? [];
    const tiers = { five: 0, four: 0, three: 0 };
    const prizes: { five?: number; four?: number; three?: number } = {};

    for (const group of groups) {
      const count = group._count._all;
      const amount = toNumber(group.prizeAmount) ?? 0;
      if (group.matchType === "5") {
        tiers.five += count;
        prizes.five = amount;
      }
      if (group.matchType === "4") {
        tiers.four += count;
        prizes.four = amount;
      }
      if (group.matchType === "3") {
        tiers.three += count;
        prizes.three = amount;
      }
    }

    return {
      id: draw.id,
      drawDate: draw.drawDate.toISOString(),
      drawNumbers: draw.drawNumbers,
      drawType: draw.drawType,
      jackpotAmount: toNumber(draw.jackpotAmount) ?? 0,
      published: draw.published,
      jackpotRolled: tiers.five === 0,
      tiers,
      prizes,
    };
  });

  return res.status(200).json({ draws: drawsPayload });
};
