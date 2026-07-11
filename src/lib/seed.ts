// KharchaBae — Indian city seed data (realistic monthly INR estimates) + informative copy.

export type SeedCity = {
  slug: string;
  name: string;
  housing: number;
  food: number;
  commute: number;
  utilities: number;
  internet: number;
  misc: number;
  blurb: string; // informative one-liner for the city
};

export const SEED_CITIES: SeedCity[] = [
  { slug: "bangalore", name: "Bengaluru", housing: 18000, food: 9000, commute: 2500, utilities: 2200, internet: 600, misc: 5000,
    blurb: "India's tech capital — high rent near IT corridors, but great food & weather." },
  { slug: "mumbai", name: "Mumbai", housing: 28000, food: 11000, commute: 3000, utilities: 2600, internet: 700, misc: 6000,
    blurb: "Costliest major city. Rent is brutal; locals trade space for the sea & dream." },
  { slug: "delhi", name: "Delhi", housing: 20000, food: 8500, commute: 2200, utilities: 2400, internet: 600, misc: 5000,
    blurb: "Sprawling & affordable vs Mumbai. Metro + street food keep costs sane." },
  { slug: "hyderabad", name: "Hyderabad", housing: 14000, food: 7500, commute: 2000, utilities: 2000, internet: 550, misc: 4500,
    blurb: "Best value tech hub — low rent, legendary biryani, rising startup scene." },
  { slug: "pune", name: "Pune", housing: 15000, food: 8000, commute: 2000, utilities: 2100, internet: 600, misc: 4500,
    blurb: "Student + IT city. Chill vibe, moderate rent, great weekend getaways." },
  { slug: "chennai", name: "Chennai", housing: 16000, food: 8000, commute: 2000, utilities: 2200, internet: 600, misc: 4500,
    blurb: "Cultural stronghold with reasonable costs and strong local food culture." },
  { slug: "kolkata", name: "Kolkata", housing: 11000, food: 6500, commute: 1800, utilities: 1900, internet: 500, misc: 4000,
    blurb: "Most affordable metro — literature, sweets, and cheap living." },
  { slug: "goa", name: "Goa", housing: 22000, food: 10000, commute: 3500, utilities: 2500, internet: 800, misc: 7000,
    blurb: "Beach lifestyle premium. Great if remote-working; pricey for daily life." },
  { slug: "ahmedabad", name: "Ahmedabad", housing: 12000, food: 7000, commute: 1800, utilities: 1900, internet: 500, misc: 4000,
    blurb: "Gujarat's hub — clean, organised, and wallet-friendly." },
  { slug: "jaipur", name: "Jaipur", housing: 11000, food: 6500, commute: 1600, utilities: 1800, internet: 500, misc: 3800,
    blurb: "Pink City charm at the lowest cost tier among tier-1/2 metros." },
];

// Metro monthly pass reference (INR) — accurate public fares, used as the
// "commute" bucket when available. Treated as reference data, not scraped.
export const COMMUTE_PASS: Record<string, number> = {
  bangalore: 2100,
  mumbai: 3000,
  delhi: 1500,
  hyderabad: 1800,
  pune: 1500,
  chennai: 1500,
  kolkata: 1200,
  goa: 3500,
  ahmedabad: 1200,
  jaipur: 1000,
};

// What each cost bucket means (informative)
export const COST_CATEGORIES: { key: string; label: string; desc: string }[] = [
  { key: "housing", label: "Housing", desc: "Monthly rent for a 1BHK in a decent locality (median of live listings)." },
  { key: "food", label: "Food", desc: "Home cooking + 8–10 eats out / month (tiffin, cafés, delivery)." },
  { key: "commute", label: "Commute", desc: "Metro pass / fuel / auto-rides for a daily office commute." },
  { key: "utilities", label: "Utilities", desc: "Electricity, water, LPG, and society maintenance." },
  { key: "internet", label: "Internet", desc: "Broadband + mobile data (unlimited fiber plan)." },
  { key: "misc", label: "Misc", desc: "Gym, subscriptions, groceries beyond food, occasional shopping." },
];

export function totalOf(c: {
  housing: number; food: number; commute: number; utilities: number; internet: number; misc: number;
}) {
  return c.housing + c.food + c.commute + c.utilities + c.internet + c.misc;
}
