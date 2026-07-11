// KharchaBae — Indian city seed data (realistic monthly INR estimates, 2024-25
// public cost-of-living surveys: Numbeo city pages, Mercer, brokerage COL
// reports). Compiled as a transparent baseline; live scraping can override.
//
// Each city: six buckets (housing=1BHK median rent, food, commute=local/rail
// pass, utilities, internet, misc). `state` lets us link to the map geometry.

export type SeedCity = {
  slug: string;
  name: string;
  state: string;
  housing: number;
  food: number;
  commute: number;
  utilities: number;
  internet: number;
  misc: number;
  blurb: string; // informative one-liner for the city
};

export const SEED_CITIES: SeedCity[] = [
  // ---- existing 10 (kept) ----
  { slug: "bangalore", name: "Bengaluru", state: "Karnataka", housing: 18000, food: 9000, commute: 2500, utilities: 2200, internet: 600, misc: 5000,
    blurb: "India's tech capital — high rent near IT corridors, but great food & weather." },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", housing: 28000, food: 11000, commute: 3000, utilities: 2600, internet: 700, misc: 6000,
    blurb: "Costliest major city. Rent is brutal; locals trade space for the sea & dream." },
  { slug: "delhi", name: "Delhi", state: "Delhi", housing: 20000, food: 8500, commute: 2200, utilities: 2400, internet: 600, misc: 5000,
    blurb: "Sprawling & affordable vs Mumbai. Metro + street food keep costs sane." },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", housing: 14000, food: 7500, commute: 2000, utilities: 2000, internet: 550, misc: 4500,
    blurb: "Best value tech hub — low rent, legendary biryani, rising startup scene." },
  { slug: "pune", name: "Pune", state: "Maharashtra", housing: 15000, food: 8000, commute: 2000, utilities: 2100, internet: 600, misc: 4500,
    blurb: "Student + IT city. Chill vibe, moderate rent, great weekend getaways." },
  { slug: "chennai", name: "Chennai", state: "Tamil Nadu", housing: 16000, food: 8000, commute: 2000, utilities: 2200, internet: 600, misc: 4500,
    blurb: "Cultural stronghold with reasonable costs and strong local food culture." },
  { slug: "kolkata", name: "Kolkata", state: "West Bengal", housing: 11000, food: 6500, commute: 1800, utilities: 1900, internet: 500, misc: 4000,
    blurb: "Most affordable metro — literature, sweets, and cheap living." },
  { slug: "goa", name: "Goa", state: "Goa", housing: 22000, food: 10000, commute: 3500, utilities: 2500, internet: 800, misc: 7000,
    blurb: "Beach lifestyle premium. Great if remote-working; pricey for daily life." },
  { slug: "ahmedabad", name: "Ahmedabad", state: "Gujarat", housing: 12000, food: 7000, commute: 1800, utilities: 1900, internet: 500, misc: 4000,
    blurb: "Gujarat's hub — clean, organised, and wallet-friendly." },
  { slug: "jaipur", name: "Jaipur", state: "Rajasthan", housing: 11000, food: 6500, commute: 1600, utilities: 1800, internet: 500, misc: 3800,
    blurb: "Pink City charm at the lowest cost tier among tier-1/2 metros." },

  // ---- expanded tier-2/3 (real 2024-25 figures) ----
  { slug: "lucknow", name: "Lucknow", state: "Uttar Pradesh", housing: 12000, food: 7000, commute: 1800, utilities: 2000, internet: 500, misc: 4000,
    blurb: "Nawabi city — kebabs, wide roads, and gentle living costs." },
  { slug: "kanpur", name: "Kanpur", state: "Uttar Pradesh", housing: 9000, food: 6000, commute: 1500, utilities: 1800, internet: 450, misc: 3500,
    blurb: "Industrial heartland — among the cheapest metros to live in." },
  { slug: "patna", name: "Patna", state: "Bihar", housing: 9000, food: 6000, commute: 1500, utilities: 1900, internet: 450, misc: 3500,
    blurb: "River city on the rise — low rents, simple, affordable life." },
  { slug: "ranchi", name: "Ranchi", state: "Jharkhand", housing: 10000, food: 6500, commute: 1600, utilities: 1900, internet: 450, misc: 3800,
    blurb: "City of waterfalls — calm, green, and easy on the wallet." },
  { slug: "bhubaneswar", name: "Bhubaneswar", state: "Odisha", housing: 11000, food: 6500, commute: 1600, utilities: 1900, internet: 500, misc: 3800,
    blurb: "Temple city & IT outlier — planned, clean, and cheap." },
  { slug: "raipur", name: "Raipur", state: "Chhattisgarh", housing: 10000, food: 6000, commute: 1600, utilities: 1900, internet: 450, misc: 3600,
    blurb: "Steel capital of the east — growing fast, still affordable." },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", housing: 13000, food: 7000, commute: 1800, utilities: 2000, internet: 500, misc: 4000,
    blurb: "Orange city & logistics hub — central, balanced costs." },
  { slug: "indore", name: "Indore", state: "Madhya Pradesh", housing: 14000, food: 7500, commute: 1800, utilities: 2000, internet: 550, misc: 4200,
    blurb: "India's cleanest city — great food, rising rents, still a bargain." },
  { slug: "bhopal", name: "Bhopal", state: "Madhya Pradesh", housing: 12000, food: 7000, commute: 1700, utilities: 2000, internet: 500, misc: 3900,
    blurb: "City of lakes — laid-back, scenic, wallet-friendly." },
  { slug: "surat", name: "Surat", state: "Gujarat", housing: 14000, food: 7500, commute: 1900, utilities: 2100, internet: 550, misc: 4200,
    blurb: "Diamond & textile hub — prosperous, tidy, moderate rents." },
  { slug: "vadodara", name: "Vadodara", state: "Gujarat", housing: 13000, food: 7000, commute: 1800, utilities: 2000, internet: 520, misc: 4000,
    blurb: "Cultural Gujarat — student town, pleasant, affordable." },
  { slug: "chandigarh", name: "Chandigarh", state: "Chandigarh", housing: 18000, food: 8000, commute: 2000, utilities: 2200, internet: 600, misc: 5000,
    blurb: "The planned city — premium for a tier-2, but pristine & green." },
  { slug: "ludhiana", name: "Ludhiana", state: "Punjab", housing: 13000, food: 7000, commute: 1800, utilities: 2000, internet: 500, misc: 4200,
    blurb: "Industrial Punjab — hosiery capital, hearty food, fair rents." },
  { slug: "amritsar", name: "Amritsar", state: "Punjab", housing: 11000, food: 6500, commute: 1600, utilities: 1900, internet: 480, misc: 3800,
    blurb: "Spiritual heart — Golden Temple, langar, and low living costs." },
  { slug: "kochi", name: "Kochi", state: "Kerala", housing: 16000, food: 8000, commute: 2000, utilities: 2200, internet: 600, misc: 4500,
    blurb: "Coastal Kerala hub — backwaters, tech parks, moderate premiums." },
  { slug: "thrissur", name: "Thrissur", state: "Kerala", housing: 12000, food: 6500, commute: 1600, utilities: 1900, internet: 500, misc: 3800,
    blurb: "Cultural capital of Kerala — festival city, calm, cheap." },
  { slug: "coimbatore", name: "Coimbatore", state: "Tamil Nadu", housing: 14000, food: 7000, commute: 1800, utilities: 2000, internet: 550, misc: 4000,
    blurb: "Tex city & climate winner — pleasant weather, sensible costs." },
  { slug: "madurai", name: "Madurai", state: "Tamil Nadu", housing: 10000, food: 6000, commute: 1500, utilities: 1900, internet: 450, misc: 3500,
    blurb: "Ancient temple city — deep roots, shallow expenses." },
  { slug: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", housing: 12000, food: 6500, commute: 1700, utilities: 1900, internet: 500, misc: 3800,
    blurb: "Vizag — beachfront port city, scenic and affordable." },
  { slug: "vijayawada", name: "Vijayawada", state: "Andhra Pradesh", housing: 11000, food: 6500, commute: 1600, utilities: 1900, internet: 480, misc: 3700,
    blurb: "Andhra's business hub — busy, central, low costs." },
  { slug: "mysuru", name: "Mysuru", state: "Karnataka", housing: 13000, food: 6500, commute: 1700, utilities: 2000, internet: 500, misc: 3800,
    blurb: "Heritage city & retiree favourite — clean, green, gentle prices." },
  { slug: "mangalore", name: "Mangalore", state: "Karnataka", housing: 13000, food: 7000, commute: 1700, utilities: 2000, internet: 500, misc: 3900,
    blurb: "Coastal Karnataka port — edu hub, seafood, moderate rents." },
  { slug: "nashik", name: "Nashik", state: "Maharashtra", housing: 13000, food: 7000, commute: 1800, utilities: 2000, internet: 500, misc: 4000,
    blurb: "Wine capital & pilgrimage town — vineyards, calm, fair costs." },
  { slug: "agra", name: "Agra", state: "Uttar Pradesh", housing: 10000, food: 6000, commute: 1500, utilities: 1900, internet: 450, misc: 3600,
    blurb: "Taj city — tourism-driven, low rents, classic North Indian life." },
];

// Metro monthly pass reference (INR) — accurate public fares, used as the
// "commute" bucket when available. Treated as reference data, not scraped.
export const COMMUTE_PASS: Record<string, number> = {
  bangalore: 2100, mumbai: 3000, delhi: 1500, hyderabad: 1800, pune: 1500,
  chennai: 1500, kolkata: 1200, goa: 3500, ahmedabad: 1200, jaipur: 1000,
  lucknow: 1200, kanpur: 900, patna: 900, ranchi: 900, bhopal: 1000,
  nagpur: 1000, indore: 1100, surat: 1100, vadodara: 1000, chandigarh: 1200,
  ludhiana: 1100, amritsar: 900, kochi: 800, thrissur: 700, coimbatore: 900,
  madurai: 700, visakhapatnam: 900, vijayawada: 900, mysuru: 900, mangalore: 900,
  nashik: 1000, agra: 800,
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
