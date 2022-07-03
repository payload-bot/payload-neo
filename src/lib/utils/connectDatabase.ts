import { container } from "@sapphire/pieces";
import { Prisma, PrismaClient } from "@prisma/client";

export default async function connectPrisma() {
  const prisma = new PrismaClient();

  prisma.$use(logger);

  await prisma.$connect();

  container.database = prisma;
}

const logger: Prisma.Middleware<any> = async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  container.logger.debug(`Query ${params.model}.${params.action} took ${after - before}ms`);
  container.logger.debug(JSON.stringify(params.args));

  return result;
};
