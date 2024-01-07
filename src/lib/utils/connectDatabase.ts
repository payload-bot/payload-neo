import { container } from "@sapphire/pieces";
import { PrismaClient } from "@prisma/client";

export default async function connectPrisma() {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  prisma.$on("query", e => {
    container.logger.debug("Query: " + e.query);
  });

  await prisma.$connect();

  container.database = prisma;
}
