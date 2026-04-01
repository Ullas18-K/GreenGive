import type { Request, Response } from "express";
import { prisma } from "../db/prisma.js";

type ScoreBody = {
  userId: string;
  scoreValue: number;
  scoreDate: string;
};

const clampScore = (value: number) => Math.max(1, Math.min(45, Math.trunc(value)));

export const createScore = async (req: Request, res: Response) => {
  const { userId, scoreValue, scoreDate } = req.body as ScoreBody;

  if (!userId || !scoreDate || typeof scoreValue !== "number") {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const value = clampScore(scoreValue);
  const date = new Date(scoreDate);
  if (Number.isNaN(date.getTime())) {
    return res.status(400).json({ error: "Invalid score date." });
  }

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.score.create({
      data: {
        userId,
        scoreValue: value,
        scoreDate: date,
      },
    });

    const extraScores = await tx.score.findMany({
      where: { userId },
      orderBy: [{ scoreDate: "desc" }, { createdAt: "desc" }],
      select: { id: true },
      skip: 5,
    });

    if (extraScores.length > 0) {
      await tx.score.deleteMany({
        where: { id: { in: extraScores.map((score) => score.id) } },
      });
    }

    const latestScores = await tx.score.findMany({
      where: { userId },
      orderBy: [{ scoreDate: "desc" }, { createdAt: "desc" }],
      select: { id: true, scoreValue: true, scoreDate: true },
      take: 5,
    });

    return { created, latestScores };
  });

  return res.status(201).json({
    score: {
      id: result.created.id,
      scoreValue: result.created.scoreValue,
      scoreDate: result.created.scoreDate.toISOString(),
    },
    latestScores: result.latestScores.map((score) => ({
      id: score.id,
      scoreValue: score.scoreValue,
      scoreDate: score.scoreDate.toISOString(),
    })),
  });
};
