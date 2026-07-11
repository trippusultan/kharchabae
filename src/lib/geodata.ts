// KharchaBae — geographic linkage: states → our cities → neighborhoods.
// City coords are approximate real lat/long. Neighborhoods are small offsets.

export type CityGeo = {
  slug: string; state: string; name: string; lat: number; lng: number;
};

// state name (as in india-states.geojson NAME_1) -> cities
export const STATE_OF: Record<string, string> = {
  bangalore: "Karnataka",
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  goa: "Goa",
  delhi: "Delhi",
  hyderabad: "Telangana",
  chennai: "Tamil Nadu",
  kolkata: "West Bengal",
  ahmedabad: "Gujarat",
  jaipur: "Rajasthan",
};

export const CITIES_GEO: CityGeo[] = [
  { slug: "bangalore", state: "Karnataka", name: "Bengaluru", lat: 12.97, lng: 77.59 },
  { slug: "mumbai", state: "Maharashtra", name: "Mumbai", lat: 19.08, lng: 72.88 },
  { slug: "pune", state: "Maharashtra", name: "Pune", lat: 18.52, lng: 73.86 },
  { slug: "goa", state: "Goa", name: "Goa", lat: 15.3, lng: 74.12 },
  { slug: "delhi", state: "Delhi", name: "Delhi", lat: 28.61, lng: 77.21 },
  { slug: "hyderabad", state: "Telangana", name: "Hyderabad", lat: 17.39, lng: 78.49 },
  { slug: "chennai", state: "Tamil Nadu", name: "Chennai", lat: 13.08, lng: 80.27 },
  { slug: "kolkata", state: "West Bengal", name: "Kolkata", lat: 22.57, lng: 88.36 },
  { slug: "ahmedabad", state: "Gujarat", name: "Ahmedabad", lat: 23.02, lng: 72.57 },
  { slug: "jaipur", state: "Rajasthan", name: "Jaipur", lat: 26.91, lng: 75.79 },
];

// neighborhood offsets (degrees) around each city, for drill-down pins
export const AREA_OFFSETS: Record<string, { name: string; dlat: number; dlng: number }[]> = {
  bangalore: [
    { name: "Indiranagar", dlat: 0.03, dlng: 0.02 },
    { name: "Whitefield", dlat: -0.05, dlng: 0.06 },
    { name: "Koramangala", dlat: -0.02, dlng: 0.03 },
    { name: "BTM Layout", dlat: -0.04, dlng: 0.01 },
    { name: "Electronic City", dlat: -0.10, dlng: 0.04 },
  ],
  mumbai: [
    { name: "Bandra", dlat: 0.02, dlng: -0.01 },
    { name: "Andheri", dlat: 0.04, dlng: -0.06 },
    { name: "Navi Mumbai", dlat: -0.04, dlng: 0.05 },
    { name: "Thane", dlat: 0.06, dlng: 0.04 },
    { name: "Borivali", dlat: 0.08, dlng: -0.05 },
  ],
  delhi: [
    { name: "Connaught Place", dlat: 0.01, dlng: 0.0 },
    { name: "Dwarka", dlat: -0.07, dlng: -0.06 },
    { name: "Saket", dlat: -0.04, dlng: 0.03 },
    { name: "Rohini", dlat: 0.06, dlng: -0.05 },
    { name: "Gurgaon", dlat: -0.06, dlng: 0.04 },
  ],
  hyderabad: [
    { name: "Banjara Hills", dlat: 0.02, dlng: 0.01 },
    { name: "Gachibowli", dlat: -0.03, dlng: -0.04 },
    { name: "Kukatpally", dlat: 0.01, dlng: 0.02 },
    { name: "Madhapur", dlat: -0.02, dlng: -0.02 },
    { name: "Uppal", dlat: -0.05, dlng: 0.05 },
  ],
  pune: [
    { name: "Koregaon Park", dlat: 0.02, dlng: 0.02 },
    { name: "Hinjewadi", dlat: 0.06, dlng: -0.06 },
    { name: "Viman Nagar", dlat: 0.03, dlng: 0.05 },
    { name: "Kothrud", dlat: -0.02, dlng: -0.03 },
    { name: "Wakad", dlat: 0.04, dlng: -0.04 },
  ],
  chennai: [
    { name: "T. Nagar", dlat: 0.01, dlng: 0.0 },
    { name: "OMR", dlat: -0.05, dlng: 0.06 },
    { name: "Adyar", dlat: -0.01, dlng: 0.02 },
    { name: "Tambaram", dlat: -0.08, dlng: 0.0 },
    { name: "Anna Nagar", dlat: 0.04, dlng: -0.03 },
  ],
  kolkata: [
    { name: "Salt Lake", dlat: 0.03, dlng: 0.03 },
    { name: "Park Street", dlat: 0.0, dlng: 0.0 },
    { name: "New Town", dlat: 0.05, dlng: 0.04 },
    { name: "Howrah", dlat: -0.02, dlng: -0.06 },
    { name: "Gariahat", dlat: -0.04, dlng: 0.01 },
  ],
  goa: [
    { name: "Calangute", dlat: 0.04, dlng: -0.02 },
    { name: "Panjim", dlat: 0.02, dlng: 0.0 },
    { name: "South Goa", dlat: -0.06, dlng: 0.02 },
    { name: "Anjuna", dlat: 0.05, dlng: -0.04 },
    { name: "Vasco", dlat: -0.05, dlng: 0.03 },
  ],
  ahmedabad: [
    { name: "Satellite", dlat: 0.02, dlng: 0.02 },
    { name: "Bodakdev", dlat: 0.03, dlng: 0.03 },
    { name: "Navrangpura", dlat: 0.01, dlng: 0.0 },
    { name: "Maninagar", dlat: -0.04, dlng: 0.02 },
    { name: "SG Highway", dlat: 0.02, dlng: 0.05 },
  ],
  jaipur: [
    { name: "C-Scheme", dlat: 0.02, dlng: 0.01 },
    { name: "Vaishali Nagar", dlat: 0.04, dlng: -0.03 },
    { name: "Malviya Nagar", dlat: -0.03, dlng: 0.02 },
    { name: "Mansarovar", dlat: -0.06, dlng: 0.03 },
    { name: "Tonk Road", dlat: -0.02, dlng: -0.03 },
  ],
};
