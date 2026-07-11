// GET /api/cities — list cities with latest monthly cost snapshot.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rankCities, inr } from "@/lib/cost";

export async function GET() {
  const cities = await prisma.city.findMany({
    include: { snapshots: { orderBy: { month: "desc" }, take: 1 } },
  });
  const rows = cities
    .filter((c) => c.snapshots[0])
    .map((c) => ({ slug: c.slug, name: c.name, total: c.snapshots[0].total, source: c.snapshots[0].source }));
  return NextResponse.json({ cities: rankCities(rows.map((r) => ({ ...r, name: r.name }))) });
}
