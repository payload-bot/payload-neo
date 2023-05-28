import { PrismaClient } from "@prisma/client";
import { pickRandom } from "@sapphire/utilities";
import { weightedRandom } from "../src/lib/utils/random";

const prisma = new PrismaClient();

const guildIds = ["428020381413277706", "696904091246526494"];
const userIds = ["176457969465163776", "625378080093110272"];

async function seedPushcartResults() {
  const randomNumber = weightedRandom([
    { number: 3, weight: 2 },
    { number: 4, weight: 3 },
    { number: 5, weight: 5 },
    { number: 6, weight: 8 },
    { number: 7, weight: 16 },
    { number: 8, weight: 16 },
    { number: 9, weight: 16 },
    { number: 10, weight: 16 },
    { number: 11, weight: 18 },
    { number: 12, weight: 18 },
    { number: 13, weight: 16 },
    { number: 14, weight: 8 },
    { number: 15, weight: 5 },
    { number: 16, weight: 3 },
    { number: 17, weight: 2 },
  ]);

  await prisma.pushcart.create({
    data: {
      pushed: randomNumber,
      guildId: pickRandom(guildIds),
      userId: pickRandom(userIds),
    },
    select: { pushed: true },
  });
}

async function seed() {
  console.log("🌱 Seeding...");
  console.time("🌱 Database has been seeded");

  if (process.env.NODE_ENV === "production") {
    console.log("Skipping seeding, production env detected");
    console.timeEnd("🌱 Database has been seeded");

    return;
  }

  for (let i = 0; i < 1_000_000; i++) {
    await seedPushcartResults();
  }

  console.timeEnd("🌱 Database has been seeded");
}

await seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
