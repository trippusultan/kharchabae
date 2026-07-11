// KharchaBae — one-off seeder: writes seeded city cost snapshots into Postgres.
// Run with: DATABASE_URL=... npx tsx src/lib/seed-db.ts
// Safe without Bright Data: it just persists the realistic seed estimates.

import { prisma } from "./db";
import { SEED_CITIES, totalOf } from "./seed";

async function main() {
  const month = new Date().toISOString().slice(0, 7);
  let count = 0;
  for (const c of SEED_CITIES) {
    const total = totalOf(c);
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name },
    });
    await prisma.costSnapshot.upsert({
      where: { cityId_month: { cityId: city.id, month } },
      update: {
        housing: c.housing, food: c.food, commute: c.commute,
        utilities: c.utilities, internet: c.internet, misc: c.misc,
        total, source: "seed", sources: JSON.stringify({ housing: "seed", food: "seed", commute: "seed", utilities: "est", internet: "est", misc: "est" }),
      },
      create: {
        cityId: city.id, month,
        housing: c.housing, food: c.food, commute: c.commute,
        utilities: c.utilities, internet: c.internet, misc: c.misc,
        total, source: "seed", sources: JSON.stringify({ housing: "seed", food: "seed", commute: "seed", utilities: "est", internet: "est", misc: "est" }),
      },
    });
    count++;
  }
  console.log(`Seeded ${count} cities for ${month}`);
}

main()
  .catch((e) => { console.error("Seed failed:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
