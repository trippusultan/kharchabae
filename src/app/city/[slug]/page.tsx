import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { inr } from "@/lib/cost";
import { SEED_CITIES, COST_CATEGORIES } from "@/lib/seed";
import { CompareWidget } from "@/components/CompareWidget";
import { CityBreakdown } from "@/components/CityBreakdown";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return SEED_CITIES.map((c) => ({ slug: c.slug }));
}

export default async function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = SEED_CITIES.find((c) => c.slug === slug);
  if (!seed) notFound();

  const month = new Date().toISOString().slice(0, 7);
  const cityRow = await prisma.city.findUnique({ where: { slug } });
  const snap = cityRow
    ? await prisma.costSnapshot.findFirst({ where: { cityId: cityRow.id, month }, orderBy: { month: "desc" } })
    : null;

  const b = snap
    ? { housing: snap.housing, food: snap.food, commute: snap.commute, utilities: snap.utilities, internet: snap.internet, misc: snap.misc }
    : { housing: seed.housing, food: seed.food, commute: seed.commute, utilities: seed.utilities, internet: seed.internet, misc: seed.misc };
  const total = snap?.total ?? (b.housing + b.food + b.commute + b.utilities + b.internet + b.misc);
  const sources: Record<string, string> = snap?.sources ? JSON.parse(snap.sources) : {};

  return (
    <main className="max-w-3xl mx-auto px-5 py-12">
      <a href="/" className="text-sm gold">← back to all cities</a>

      <header className="neo p-8 mt-4 text-center">
        <h1 className="text-4xl font-black gold-text">{seed.name}</h1>
        <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto">{seed.blurb}</p>
        <p className="text-3xl font-extrabold gold-text mt-4">{inr(total)}<span className="text-base text-[var(--muted)]">/month</span></p>
        <p className="text-xs text-[var(--muted)] mt-1">
          {snap?.source === "live" ? "● live-scraped" : "○ demo estimate"}
        </p>
      </header>

      <CityBreakdown b={b} total={total} sources={sources} />

      <section className="neo p-7 mt-8">
        <h2 className="text-xl font-bold gold-text">What's included</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {COST_CATEGORIES.map((cat) => (
            <div key={cat.key} className="neo-inset p-4">
              <div className="font-semibold gold">{cat.label}</div>
              <div className="text-sm text-[var(--muted)] mt-1">{cat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <CompareWidget cities={SEED_CITIES.map((c) => ({ slug: c.slug, name: c.name }))} />
    </main>
  );
}
