import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma.js";

const toNumber = (value: Prisma.Decimal | number | null) => {
  if (value === null) return null;
  if (typeof value === "number") return value;
  return Number.parseFloat(value.toString());
};

const serializeCharity = (charity: {
  id: string;
  name: string;
  description: string | null;
  fullDescription: string | null;
  imageUrl: string | null;
  causeType: string | null;
  upcomingEvents: Prisma.JsonValue | null;
  totalContributions: Prisma.Decimal;
  goalAmount: Prisma.Decimal | null;
}) => ({
  id: charity.id,
  name: charity.name,
  description: charity.description,
  fullDescription: charity.fullDescription,
  imageUrl: charity.imageUrl,
  causeType: charity.causeType,
  upcomingEvents: charity.upcomingEvents ?? [],
  totalContributions: toNumber(charity.totalContributions) ?? 0,
  goalAmount: toNumber(charity.goalAmount),
});

export const listCharities = async (req: Request, res: Response) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const cause = typeof req.query.cause === "string" ? req.query.cause.trim() : "";

  const where: Prisma.CharityWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { fullDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  if (cause && cause !== "All") {
    where.causeType = { equals: cause };
  }

  const charities = await prisma.charity.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return res.status(200).json({
    charities: charities.map((charity) => serializeCharity(charity)),
  });
};

export const getCharityById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Missing charity id." });
  }

  const charity = await prisma.charity.findUnique({ where: { id } });
  if (!charity) {
    return res.status(404).json({ error: "Charity not found." });
  }

  return res.status(200).json({ charity: serializeCharity(charity) });
};
