import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../db/prisma";
import { supabaseAdmin } from "../services/supabase";
import { notifyWinner, notifyWinnerPaid, notifyWinnerVerified } from "../services/notifications";

const toNumber = (value: Prisma.Decimal | number | null) => {
  if (value === null) return null;
  if (typeof value === "number") return value;
  return Number.parseFloat(value.toString());
};

const requireAdmin = async (req: Request, res: Response) => {
  const adminKey = req.header("x-admin-key");
  if (adminKey && adminKey === env.adminApiKey) {
    return true;
  }

  const authHeader = req.header("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing admin credentials." });
    return false;
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({ error: "Invalid auth token." });
    return false;
  }

  const role = await prisma.userRole.findFirst({
    where: { userId: data.user.id, role: "admin" },
    select: { userId: true },
  });

  if (!role) {
    res.status(403).json({ error: "Forbidden." });
    return false;
  }

  return true;
};

const getUserProfile = async (userId: string) => {
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

  return {
    email: data.user.email ?? null,
    name,
  };
};

export const listAdminCharities = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const charities = await prisma.charity.findMany({ orderBy: { name: "asc" } });
  return res.status(200).json({
    charities: charities.map((charity) => ({
      id: charity.id,
      name: charity.name,
      description: charity.description,
      fullDescription: charity.fullDescription,
      imageUrl: charity.imageUrl,
      causeType: charity.causeType,
      totalContributions: toNumber(charity.totalContributions) ?? 0,
      goalAmount: toNumber(charity.goalAmount),
      upcomingEvents: charity.upcomingEvents ?? [],
    })),
  });
};

export const createAdminCharity = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { name, description, fullDescription, imageUrl, causeType, goalAmount, upcomingEvents } = req.body as {
    name?: string;
    description?: string;
    fullDescription?: string;
    imageUrl?: string;
    causeType?: string;
    goalAmount?: number;
    upcomingEvents?: unknown;
  };

  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }

  const charity = await prisma.charity.create({
    data: {
      name,
      description: description ?? null,
      fullDescription: fullDescription ?? null,
      imageUrl: imageUrl ?? null,
      causeType: causeType ?? null,
      goalAmount: Number.isFinite(goalAmount) ? new Prisma.Decimal(goalAmount as number) : null,
      upcomingEvents: upcomingEvents ?? null,
    },
  });

  return res.status(201).json({ charity: { id: charity.id } });
};

export const updateAdminCharity = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.params;
  const { name, description, fullDescription, imageUrl, causeType, goalAmount, upcomingEvents } = req.body as {
    name?: string;
    description?: string;
    fullDescription?: string;
    imageUrl?: string;
    causeType?: string;
    goalAmount?: number;
    upcomingEvents?: unknown;
  };

  const charity = await prisma.charity.update({
    where: { id },
    data: {
      name,
      description,
      fullDescription,
      imageUrl,
      causeType,
      goalAmount: Number.isFinite(goalAmount) ? new Prisma.Decimal(goalAmount as number) : undefined,
      upcomingEvents,
    },
  });

  return res.status(200).json({ charity: { id: charity.id } });
};

export const deleteAdminCharity = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.params;
  await prisma.charity.delete({ where: { id } });
  return res.status(204).send();
};

export const listAdminDraws = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const draws = await prisma.draw.findMany({ orderBy: { drawDate: "desc" } });
  return res.status(200).json({
    draws: draws.map((draw) => ({
      id: draw.id,
      drawDate: draw.drawDate.toISOString(),
      drawNumbers: draw.drawNumbers,
      drawType: draw.drawType,
      jackpotAmount: toNumber(draw.jackpotAmount) ?? 0,
      published: draw.published,
    })),
  });
};

export const createAdminDraw = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { drawDate, drawNumbers, drawType, jackpotAmount, published } = req.body as {
    drawDate?: string;
    drawNumbers?: number[];
    drawType?: string;
    jackpotAmount?: number;
    published?: boolean;
  };

  if (!drawDate || !Array.isArray(drawNumbers) || drawNumbers.length !== 5 || !drawType || !Number.isFinite(jackpotAmount)) {
    return res.status(400).json({ error: "Missing draw configuration." });
  }

  const draw = await prisma.draw.create({
    data: {
      drawDate: new Date(drawDate),
      drawNumbers: drawNumbers.map((n) => Math.trunc(n)),
      drawType,
      jackpotAmount: new Prisma.Decimal(jackpotAmount as number),
      published: Boolean(published),
    },
  });

  return res.status(201).json({ draw: { id: draw.id } });
};

export const updateAdminDraw = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.params;
  const { drawDate, drawNumbers, drawType, jackpotAmount, published } = req.body as {
    drawDate?: string;
    drawNumbers?: number[];
    drawType?: string;
    jackpotAmount?: number;
    published?: boolean;
  };

  const draw = await prisma.draw.update({
    where: { id },
    data: {
      drawDate: drawDate ? new Date(drawDate) : undefined,
      drawNumbers: drawNumbers ? drawNumbers.map((n) => Math.trunc(n)) : undefined,
      drawType,
      jackpotAmount: Number.isFinite(jackpotAmount) ? new Prisma.Decimal(jackpotAmount as number) : undefined,
      published,
    },
  });

  return res.status(200).json({ draw: { id: draw.id } });
};

export const listAdminWinners = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const winners = await prisma.winner.findMany({ orderBy: { createdAt: "desc" } });
  const userProfiles = await Promise.all(winners.map((winner) => getUserProfile(winner.userId)));
  return res.status(200).json({
    winners: winners.map((winner, index) => ({
      id: winner.id,
      drawId: winner.drawId,
      userId: winner.userId,
      userEmail: userProfiles[index]?.email ?? null,
      userName: userProfiles[index]?.name ?? null,
      matchType: winner.matchType,
      prizeAmount: toNumber(winner.prizeAmount) ?? 0,
      proofUrl: winner.proofUrl,
      verified: winner.verified,
      paid: winner.paid,
      createdAt: winner.createdAt.toISOString(),
    })),
  });
};

type SimulationResult = {
  entryCount: number;
  tiers: { five: number; four: number; three: number };
  prizes: { five: number; four: number; three: number };
  drawNumbers: number[];
};

const calculateMatchCount = (drawNumbers: number[], userScores: number[]) => {
  const drawSet = new Set(drawNumbers.map((n) => Math.trunc(n)));
  const uniqueScores = Array.from(new Set(userScores.map((n) => Math.trunc(n))));
  return uniqueScores.reduce((count, score) => (drawSet.has(score) ? count + 1 : count), 0);
};

export const simulateAdminDraw = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.params;
  const draw = await prisma.draw.findUnique({ where: { id } });

  if (!draw) {
    return res.status(404).json({ error: "Draw not found." });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { status: "active" },
    select: { userId: true, amount: true },
  });

  if (subscriptions.length === 0) {
    return res.status(400).json({ error: "No active subscribers." });
  }

  const userIds = subscriptions.map((sub) => sub.userId);
  const scores = await prisma.score.findMany({
    where: { userId: { in: userIds } },
    orderBy: [{ scoreDate: "desc" }, { createdAt: "desc" }],
    select: { userId: true, scoreValue: true },
  });

  const scoresByUser = new Map<string, number[]>();
  for (const score of scores) {
    const list = scoresByUser.get(score.userId) ?? [];
    if (list.length < 5) {
      list.push(score.scoreValue);
      scoresByUser.set(score.userId, list);
    }
  }

  const entries = subscriptions
    .map((sub) => ({ userId: sub.userId, scores: scoresByUser.get(sub.userId) ?? [] }))
    .filter((entry) => entry.scores.length === 5);

  if (entries.length === 0) {
    return res.status(400).json({ error: "No eligible users with 5 scores." });
  }

  const totalPool = subscriptions.reduce((sum, sub) => {
    const amount = toNumber(sub.amount) ?? 0;
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);

  const tierPools = {
    five: totalPool * 0.4,
    four: totalPool * 0.35,
    three: totalPool * 0.25,
  };

  const winnersRaw: Array<{ userId: string; matchType: "5" | "4" | "3" }> = [];
  const tierCounts = { five: 0, four: 0, three: 0 };

  for (const entry of entries) {
    const matchCount = calculateMatchCount(draw.drawNumbers, entry.scores);
    if (matchCount >= 5) {
      winnersRaw.push({ userId: entry.userId, matchType: "5" });
      tierCounts.five += 1;
    } else if (matchCount === 4) {
      winnersRaw.push({ userId: entry.userId, matchType: "4" });
      tierCounts.four += 1;
    } else if (matchCount === 3) {
      winnersRaw.push({ userId: entry.userId, matchType: "3" });
      tierCounts.three += 1;
    }
  }

  const prizes = {
    five: tierCounts.five > 0 ? tierPools.five / tierCounts.five : 0,
    four: tierCounts.four > 0 ? tierPools.four / tierCounts.four : 0,
    three: tierCounts.three > 0 ? tierPools.three / tierCounts.three : 0,
  };

  const simulation = await prisma.$transaction(async (tx) => {
    await tx.winner.deleteMany({ where: { drawId: draw.id } });
    await tx.drawEntry.deleteMany({ where: { drawId: draw.id } });

    await tx.drawEntry.createMany({
      data: entries.map((entry) => ({
        drawId: draw.id,
        userId: entry.userId,
        userScores: entry.scores,
      })),
    });

    if (winnersRaw.length > 0) {
      await tx.winner.createMany({
        data: winnersRaw.map((winner) => ({
          drawId: draw.id,
          userId: winner.userId,
          matchType: winner.matchType,
          prizeAmount: new Prisma.Decimal(
            winner.matchType === "5" ? prizes.five : winner.matchType === "4" ? prizes.four : prizes.three
          ),
        })),
      });
    }

    await tx.draw.update({
      where: { id: draw.id },
      data: {
        jackpotAmount: new Prisma.Decimal(totalPool),
      },
    });

    const result: SimulationResult = {
      entryCount: entries.length,
      tiers: tierCounts,
      prizes,
      drawNumbers: draw.drawNumbers,
    };

    return result;
  });

  if (winnersRaw.length > 0) {
    const winners = await prisma.winner.findMany({
      where: { drawId: draw.id },
      select: { userId: true, matchType: true, prizeAmount: true },
    });

    await Promise.all(
      winners.map((winner) => {
        const prize = toNumber(winner.prizeAmount) ?? 0;
        return notifyWinner(winner.userId, winner.matchType, prize, draw.drawDate);
      })
    );
  }

  return res.status(200).json({ simulation });
};

export const updateAdminWinner = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const { id } = req.params;
  const { matchType, prizeAmount, proofUrl, verified, paid } = req.body as {
    matchType?: string;
    prizeAmount?: number;
    proofUrl?: string | null;
    verified?: boolean;
    paid?: boolean;
  };

  const existing = await prisma.winner.findUnique({ where: { id } });

  const winner = await prisma.winner.update({
    where: { id },
    data: {
      matchType,
      prizeAmount: Number.isFinite(prizeAmount) ? new Prisma.Decimal(prizeAmount as number) : undefined,
      proofUrl,
      verified,
      paid,
    },
  });

  if (existing && !existing.verified && winner.verified) {
    const prize = toNumber(winner.prizeAmount) ?? 0;
    await notifyWinnerVerified(winner.userId, prize);
  }

  if (existing && !existing.paid && winner.paid) {
    const prize = toNumber(winner.prizeAmount) ?? 0;
    await notifyWinnerPaid(winner.userId, prize);
  }

  return res.status(200).json({ winner: { id: winner.id } });
};

export const listAdminUsers = async (req: Request, res: Response) => {
  if (!(await requireAdmin(req, res))) return;

  const subscriptions = await prisma.subscription.findMany({ orderBy: { updatedAt: "desc" } });
  const users = await Promise.all(
    subscriptions.map(async (sub) => {
      const [scores, profile] = await Promise.all([
        prisma.score.findMany({
          where: { userId: sub.userId },
          orderBy: [{ scoreDate: "desc" }, { createdAt: "desc" }],
          select: { scoreValue: true },
          take: 5,
        }),
        getUserProfile(sub.userId),
      ]);

      return {
        id: sub.userId,
        name: profile.name,
        email: profile.email,
        plan: sub.plan,
        status: sub.status,
        charity: sub.charityName,
        scores: scores.map((score) => score.scoreValue),
      };
    })
  );

  return res.status(200).json({ users });
};
