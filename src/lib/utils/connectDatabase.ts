import { container } from "@sapphire/pieces";
import { PrismaClient } from "@prisma/client";

export default async function connectPrisma() {
  const prisma = new PrismaClient();

  await prisma.$connect();

  container.database = prisma;
}
