// GET /api/compare?from=bangalore&to=mumbai — how much you'd save/lose by moving.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inr } from "@/lib/cost";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  if (!from || !to) return NextResponse.json({ error: "pass ?from=&to=" }, { status: 400 });

  const month = new Date().toISOString().slice(0, 7);
  const get = (slug: string) =>
    prisma.costSnapshot.findFirst({
      where: { city: { slug }, month },
      orderBy: { month: "desc" },
    });

  const a = await get(from);
  const b = await get(to);
  if (!a || !b) return NextResponse.json({ error: "no data, hit /api/refresh first" }, { status: 404 });

  const diff = a.total - b.total;
  const pct = Math.round((diff / a.total) * 100);
  return NextResponse.json({
    from: { name: from, total: a.total, inr: inr(a.total) },
    to: { name: to, total: b.total, inr: inr(b.total) },
    difference: diff,
    inrDiff: inr(Math.abs(diff)),
    pct,
    verdict:
      diff > 0
        ? `Shift kar ${to}? tu ${inr(Math.abs(diff))}/mo bachayega (${pct}%) 💰`
        : `Ruk ja! ${to} me ${inr(Math.abs(diff))}/mo zyada kharcha parega 😭`,
  });
}
