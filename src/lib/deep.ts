// KharchaBae — deep, in-city cost intelligence.
// Neighborhood-level rents + extra buckets so the city view is genuinely "in-depth".

export type Area = { name: string; rent1bhk: number; note: string };
export type CityDeep = {
  slug: string;
  // neighborhood rents (1BHK, INR/mo)
  areas: Area[];
  // extra line items beyond the 6 base buckets
  extras: { label: string; cost: number; note: string }[];
  // typical salary context (informative)
  avgTakeHome: number;
  tip: string;
};

export const CITY_DEEP: Record<string, CityDeep> = {
  bangalore: {
    slug: "bangalore",
    areas: [
      { name: "Indiranagar", rent1bhk: 32000, note: "Trendy, pubs, premium." },
      { name: "Whitefield", rent1bhk: 19000, note: "IT corridors, commute heavy." },
      { name: "Koramangala", rent1bhk: 28000, note: "Startup hub, cafés." },
      { name: "BTM Layout", rent1bhk: 16000, note: "Student-friendly, value." },
      { name: "Electronic City", rent1bhk: 13000, note: "Cheapest, far south." },
    ],
    extras: [
      { label: "Maid (monthly)", cost: 2500, note: "2x week cleaning." },
      { label: "Gym membership", cost: 1800, note: "Mid-tier chain." },
      { label: "Electricity (AC user)", cost: 2200, note: "Summer slab." },
      { label: "Weekend pub night", cost: 1500, note: "Per outing, avg." },
    ],
    avgTakeHome: 75000,
    tip: "Live near your office — Bangalore traffic turns distance into rent you pay twice.",
  },
  mumbai: {
    slug: "mumbai",
    areas: [
      { name: "Bandra", rent1bhk: 55000, note: "Posh, sea, celebs." },
      { name: "Andheri", rent1bhk: 35000, note: "Suburban hub." },
      { name: "Navi Mumbai", rent1bhk: 22000, note: "Planned, spacious." },
      { name: "Thane", rent1bhk: 20000, note: "Value, far." },
      { name: "Borivali", rent1bhk: 28000, note: "Family suburb." },
    ],
    extras: [
      { label: "Local train pass", cost: 300, note: "First-class monthly." },
      { label: "Maid (monthly)", cost: 3000, note: "2x week." },
      { label: "Gym membership", cost: 2500, note: "Premium." },
      { label: "Vada pav diet", cost: 1500, note: "Street food heavy." },
    ],
    avgTakeHome: 90000,
    tip: "Space is a luxury in Mumbai. Many trade a 2BHK dream for a 1BHK near the coast.",
  },
  delhi: {
    slug: "delhi",
    areas: [
      { name: "Connaught Place", rent1bhk: 38000, note: "Centre, pricey." },
      { name: "Dwarka", rent1bhk: 18000, note: "Planned, spacious." },
      { name: "Saket", rent1bhk: 28000, note: "South, posh." },
      { name: "Rohini", rent1bhk: 16000, note: "Value suburb." },
      { name: "Gurgaon (Cyber City)", rent1bhk: 26000, note: "Corporate, modern." },
    ],
    extras: [
      { label: "Metro pass", cost: 1500, note: "Monthly." },
      { label: "Maid (monthly)", cost: 2500, note: "2x week." },
      { label: "Gym membership", cost: 2000, note: "Mid-tier." },
      { label: "Winter heating (ngl)", cost: 1200, note: "Geyser + room heater." },
    ],
    avgTakeHome: 80000,
    tip: "Delhi NCR is huge — living in Gurgaon vs Delhi changes your cost more than your salary.",
  },
  hyderabad: {
    slug: "hyderabad",
    areas: [
      { name: "Banjara Hills", rent1bhk: 35000, note: "Elite." },
      { name: "Gachibowli", rent1bhk: 22000, note: "IT, modern." },
      { name: "Kukatpally", rent1bhk: 15000, note: "Value, dense." },
      { name: "Madhapur", rent1bhk: 24000, note: "Startup hub." },
      { name: "Uppal", rent1bhk: 12000, note: "Cheapest." },
    ],
    extras: [
      { label: "Metro pass", cost: 1800, note: "Monthly." },
      { label: "Maid (monthly)", cost: 2000, note: "2x week." },
      { label: "Gym membership", cost: 1500, note: "Value." },
      { label: "Biryani fund", cost: 2000, note: "Non-negotiable." },
    ],
    avgTakeHome: 70000,
    tip: "Best rent-to-salary ratio in India. The biryani is free publicity.",
  },
  pune: {
    slug: "pune",
    areas: [
      { name: "Koregaon Park", rent1bhk: 30000, note: "Elite, green." },
      { name: "Hinjewadi", rent1bhk: 17000, note: "IT, far west." },
      { name: "Viman Nagar", rent1bhk: 22000, note: "Airport, young." },
      { name: "Kothrud", rent1bhk: 15000, note: "Value." },
      { name: "Wakad", rent1bhk: 16000, note: "IT adjacent." },
    ],
    extras: [
      { label: "Metro/PMT pass", cost: 1500, note: "Monthly." },
      { label: "Maid (monthly)", cost: 2000, note: "2x week." },
      { label: "Gym membership", cost: 1500, note: "Value." },
      { label: "Weekend Lonavala trip", cost: 2000, note: "Per month avg." },
    ],
    avgTakeHome: 65000,
    tip: "Pune's charm is the weekend getaways — budget for them or you'll resent the rent.",
  },
  chennai: {
    slug: "chennai",
    areas: [
      { name: "T. Nagar", rent1bhk: 28000, note: "Commercial core." },
      { name: "OMR (IT corridor)", rent1bhk: 18000, note: "Tech, coastal." },
      { name: "Adyar", rent1bhk: 25000, note: "South, posh." },
      { name: "Tambaram", rent1bhk: 13000, note: "Cheap, far." },
      { name: "Anna Nagar", rent1bhk: 22000, note: "Planned, green." },
    ],
    extras: [
      { label: "Metro/Suburban pass", cost: 1500, note: "Monthly." },
      { label: "Maid (monthly)", cost: 2200, note: "2x week." },
      { label: "Gym membership", cost: 1500, note: "Value." },
      { label: "Filter coffee fund", cost: 800, note: "Daily tumbler." },
    ],
    avgTakeHome: 68000,
    tip: "Chennai's heat makes AC a necessity, not luxury — budget electricity accordingly.",
  },
  kolkata: {
    slug: "kolkata",
    areas: [
      { name: "Salt Lake", rent1bhk: 18000, note: "Planned, IT." },
      { name: "Park Street", rent1bhk: 22000, note: "Central, heritage." },
      { name: "New Town", rent1bhk: 16000, note: "Modern, spacious." },
      { name: "Howrah", rent1bhk: 10000, note: "Cheapest." },
      { name: "Gariahat", rent1bhk: 14000, note: "South, value." },
    ],
    extras: [
      { label: "Metro pass", cost: 1200, note: "Monthly." },
      { label: "Maid (monthly)", cost: 1800, note: "2x week." },
      { label: "Gym membership", cost: 1200, note: "Value." },
      { label: "Rosogolla fund", cost: 600, note: "Essential." },
    ],
    avgTakeHome: 55000,
    tip: "Cheapest metro by far. Your money goes furthest here — at the cost of fewer tech jobs.",
  },
  goa: {
    slug: "goa",
    areas: [
      { name: "North Goa (Calangute)", rent1bhk: 30000, note: "Tourist, peak." },
      { name: "Panjim", rent1bhk: 20000, note: "Capital, calm." },
      { name: "South Goa", rent1bhk: 18000, note: "Quiet, cheap." },
      { name: "Anjuna", rent1bhk: 25000, note: "Digital nomad." },
      { name: "Vasco", rent1bhk: 15000, note: "Local, value." },
    ],
    extras: [
      { label: "Scooter rental", cost: 3500, note: "Monthly." },
      { label: "Maid (monthly)", cost: 2500, note: "2x week." },
      { label: "Gym membership", cost: 2000, note: "Boutique." },
      { label: "Beach shack fund", cost: 2500, note: "Weekends." },
    ],
    avgTakeHome: 70000,
    tip: "Goa is a lifestyle premium. Great remote-working, but daily costs run high vs income.",
  },
  ahmedabad: {
    slug: "ahmedabad",
    areas: [
      { name: "Satellite", rent1bhk: 20000, note: "Upmarket." },
      { name: "Bodakdev", rent1bhk: 22000, note: "Elite." },
      { name: "Navrangpura", rent1bhk: 16000, note: "Central, value." },
      { name: "Maninagar", rent1bhk: 12000, note: "Local." },
      { name: "SG Highway", rent1bhk: 18000, note: "Modern corridor." },
    ],
    extras: [
      { label: "BRTS/AMTS pass", cost: 1200, note: "Monthly." },
      { label: "Maid (monthly)", cost: 1800, note: "2x week." },
      { label: "Gym membership", cost: 1400, note: "Value." },
      { label: "Fafda-jalebi fund", cost: 700, note: "Sunday ritual." },
    ],
    avgTakeHome: 60000,
    tip: "Clean, organised, wallet-friendly. The most underrated value city in the west.",
  },
  jaipur: {
    slug: "jaipur",
    areas: [
      { name: "C-Scheme", rent1bhk: 18000, note: "Upmarket." },
      { name: "Vaishali Nagar", rent1bhk: 13000, note: "Value, green." },
      { name: "Malviya Nagar", rent1bhk: 14000, note: "Student hub." },
      { name: "Mansarovar", rent1bhk: 10000, note: "Cheapest, big." },
      { name: "Tonk Road", rent1bhk: 11000, note: "IT adjacent." },
    ],
    extras: [
      { label: "City bus pass", cost: 1000, note: "Monthly." },
      { label: "Maid (monthly)", cost: 1500, note: "2x week." },
      { label: "Gym membership", cost: 1200, note: "Value." },
      { label: "Dal-baati fund", cost: 800, note: "Heritage meal." },
    ],
    avgTakeHome: 50000,
    tip: "Lowest cost tier among the metros. Great for bootstrapping savings or a side hustle.",
  },
};
