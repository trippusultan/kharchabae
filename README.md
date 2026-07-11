# KharchaBae

**India ka asli monthly kharcha.** A cost-of-living intelligence web app for India —
spin an interactive zoomable map, land on a city, and see exactly where your salary
goes (rent, food, commute, the whole *kharcha*).

Built with **Next.js (App Router) + TypeScript + Tailwind**, with a hand-rolled
**d3-geo** map (no map library) for buttery-smooth zoom/pan.

---

## Features

- **Interactive India map (the heart of the app)**
  - Zoomable / pannable drill-down: country → state → city → neighborhood.
  - Inertial drag, cursor-anchored wheel zoom, eased fly-to (imperative `requestAnimationFrame`,
    zero React re-renders per frame).
  - Heat-tinted states (green = cheaper → gold = pricier) so cost reads at a glance.
  - Parallax dot-grid background, constellation network lines, staggered city-pin pop-in.
  - **Live minimap** with a draggable viewport rectangle (click/drag to recenter).
- **Cost breakdown** — six buckets per city (housing, food, commute, utilities, internet, misc),
  with neighborhood-level deep dive (rent, food, commute, the *bae* tip).
- **Compare two cities** — pick any two pins, get a connected line on the map + a side-by-side
  cost dock with the delta. **Shareable**: the comparison is encoded in the URL hash and restores on load.
- **Live data via Bright Data** — median rents scraped with the Scraping Browser (with a Web
  Unlocker fallback). Food/commute pulled from Swiggy/Zomato/metro where available.
- **Razorpay UPI payments** — server-side order + HMAC-verified webhook.
- **Accessible** — keyboard-navigable pins, ARIA labels, `:focus-visible` gold rings,
  `prefers-reduced-motion` aware.

## Tech stack

| Layer        | Choice |
|--------------|--------|
| Framework    | Next.js 16 (App Router, Turbopack) |
| Language     | TypeScript |
| Styling      | Tailwind v4 + custom neomorphic gold/black theme |
| Map          | d3-geo (`geoMercator` / `geoPath`), raw GeoJSON |
| DB (dev)     | SQLite via Prisma |
| DB (prod)    | PostgreSQL (swap `DATABASE_URL`) |
| Scraping     | Bright Data (Scraping Browser + Web Unlocker) |
| Payments     | Razorpay (UPI / test mode) |
| Queue (opt)  | BullMQ + Redis (fails fast if Redis absent) |

## Getting started

```bash
# 1. install
npm install

# 2. configure env (copy and fill in your keys)
cp .env.example .env

# 3. set up the database + seed
npx prisma generate
npx prisma db push
npm run seed

# 4. run
npm run dev
# open http://localhost:3000
```

### Required env vars

See `.env.example`. The essentials:

- `DATABASE_URL` — SQLite (`file:./dev.db`) for dev, Postgres URL for prod.
- `BRIGHTDATA_API_KEY` — Bright Data API key (zone `kharchabae`).
- `SBR_WS_ENDPOINT` — Scraping Browser WebSocket endpoint.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay API keys.

> Without Bright Data / Razorpay keys the app still runs — it falls back to seeded data
> and shows the integration status in the **Setup status** panel.

## Scripts

| Command           | Description |
|-------------------|-------------|
| `npm run dev`     | Start dev server (Turbopack) |
| `npm run build`   | Production build |
| `npm run start`   | Serve the production build |
| `npm run seed`    | Seed cities, costs, neighborhoods |
| `npm run refresh` | Trigger a live data refresh via Bright Data |

## API routes

- `GET /api/cities` — list cities + costs
- `GET /api/compare?a=&b=` — compare two cities
- `POST /api/refresh` — refresh live data (Bright Data)
- `POST /api/pay` — create a Razorpay order
- `POST /api/razorpay-webhook` — verify payment (HMAC)

## Deploy

Push to GitHub and import into **Vercel**. Set the env vars above, switch
`DATABASE_URL` to a hosted Postgres (e.g. Supabase / Neon), and deploy.

---

Made with 💛 by [@trippusultan](https://github.com/trippusultan) — *Paisa samajh lo.*
