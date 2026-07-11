import { PrismaClient } from "@prisma/client";

// Lazily construct so a missing DATABASE_URL (e.g. on a DB-less deploy)
// doesn't crash module load. Callers should treat a thrown error as "no DB".
let client: PrismaClient | null = null;
let failed = false;

function getClient(): PrismaClient | null {
  if (failed) return null;
  if (client) return client;
  try {
    client = new PrismaClient();
    return client;
  } catch {
    failed = true;
    return null;
  }
}

// Proxy so existing `prisma.city...` calls keep working; if unavailable, the
// first call throws and the caller's try/catch falls back to seed data.
export const prisma = new Proxy({} as PrismaClient, {
  get(_t, prop) {
    const c = getClient();
    if (!c) throw new Error("prisma-unavailable");
    const val = (c as any)[prop];
    return typeof val === "function" ? val.bind(c) : val;
  },
});
