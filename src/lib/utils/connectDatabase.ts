import { container } from "@sapphire/pieces";
import { Prisma, PrismaClient } from "@prisma/client";

export default async function connectPrisma() {
  const prisma = new PrismaClient({
    log: [
      {
        emit: "event",
        level: "query",
      },
    ],
  });

  prisma.$use(logger);

  prisma.$on("query", e => {
    container.logger.debug("Query: " + e.query);
  });

  await prisma.$connect();

  container.database = prisma;
}

const logger: Prisma.Middleware<any> = async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  container.logger.trace(`Query ${params.model}.${params.action} took ${after - before}ms`);
  container.logger.trace(JSON.stringify(params.args));

  return result;
};
