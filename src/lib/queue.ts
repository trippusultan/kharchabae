// KharchaBae — BullMQ queue + worker (mirrors the dev.to article's pattern).
// A job refreshes cost snapshots for all cities; the worker runs the scraper.
// Redis is OPTIONAL: if REDIS_URL is unreachable, we fall back to a direct
// (synchronous) refresh so the app runs with zero infra.

import { Queue, Worker, type Job } from "bullmq";
import { SEED_CITIES } from "./seed";
import { getCityCost } from "./scraper";
import { prisma } from "./db";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
export const QUEUE_NAME = "kharchabae-cost-refresh";

// Fail fast if Redis is absent (no 30s hangs in dev).
const REDIS_CONN = { url: REDIS_URL, enableOfflineQueue: false, maxRetriesPerRequest: 0, connectionTimeout: 2000 };

let queue: Queue | null = null;
function getQueue() {
  if (!queue) queue = new Queue(QUEUE_NAME, { connection: REDIS_CONN });
  return queue;
}

// Run a full refresh of all city cost snapshots.
export async function runRefresh() {
  const month = new Date().toISOString().slice(0, 7); // "2026-07"
  for (const city of SEED_CITIES) {
    const { break: b, total, source, sources } = await getCityCost(city);
    let cityRow = await prisma.city.findUnique({ where: { slug: city.slug } });
    if (!cityRow) cityRow = await prisma.city.create({ data: { slug: city.slug, name: city.name } });
    await prisma.costSnapshot.upsert({
      where: { cityId_month: { cityId: cityRow.id, month } },
      update: { ...b, total, source, sources },
      create: { cityId: cityRow.id, month, ...b, total, source, sources },
    });
  }
  return { ok: true, month, cities: SEED_CITIES.length };
}

export async function enqueueRefresh() {
  try {
    await getQueue().add("refresh-all", {}, { jobId: "refresh-all", removeOnComplete: 5 });
    return { queued: true };
  } catch {
    // No Redis — fall back to a direct refresh.
    return runRefresh();
  }
}

let workerStarted = false;
export function startWorker() {
  if (workerStarted) return;
  try {
    workerStarted = true;
    const worker = new Worker(
      QUEUE_NAME,
      async (job: Job) => runRefresh(),
      { connection: REDIS_CONN, concurrency: 2 }
    );
    worker.on("completed", (j) => console.log(`[worker] ${j.id} done`));
    worker.on("failed", (j, err) => console.error(`[worker] ${j?.id} failed:`, err.message));
  } catch {
    // Redis unavailable — worker disabled, direct fallback handles refreshes.
    workerStarted = false;
  }
}
