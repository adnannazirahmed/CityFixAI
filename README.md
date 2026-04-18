# CityFix AI

> **Report once. Route smart. Fix faster.**

CityFix AI is an AI-powered civic issue reporting and prioritization platform that helps residents report city problems easily and helps city administrators decide what to fix first.

---

## Demo Credentials

| Role  | Email               | Password              |
|-------|---------------------|-----------------------|
| Admin | admin@cityfix.ai    | cityfix-admin-2024    |

---

## Quick Start

### 1. Clone and install

```bash
cd cityfix-ai
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see below).

### 3. Run in demo mode (no Supabase/OpenAI required)

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The app uses built-in demo data with 25 realistic reports, 4 clusters, and full analytics.

---

## Full Setup (with Supabase + OpenAI)

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New Project.

Copy your:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Run the database migration

In your Supabase project → **SQL Editor**, paste and run:

```sql
-- contents of supabase/migrations/001_initial.sql
```

### 3. Load seed data

In **SQL Editor**, paste and run:

```sql
-- contents of supabase/seed.sql
```

### 4. Create storage bucket

In **Supabase Dashboard → Storage**, create a bucket named `report-images` and set it to **public**.

### 5. Configure OpenAI

Get an API key from [platform.openai.com](https://platform.openai.com).

Set `OPENAI_API_KEY=sk-...` in `.env.local`.

The app uses `gpt-4o-mini` by default for cost efficiency. Change to `gpt-4o` in `src/lib/openai/analyze.ts` for better accuracy.

### 6. Set admin credentials

```env
ADMIN_EMAIL=admin@cityfix.ai
ADMIN_PASSWORD=your-secure-password
```

### 7. Run the app

```bash
npm run dev
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Admin Auth
ADMIN_EMAIL=admin@cityfix.ai
ADMIN_PASSWORD=cityfix-admin-2024

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Demo mode (set to "true" to skip DB/AI setup)
NEXT_PUBLIC_DEMO_MODE=false
```

---

## Project Structure

```
cityfix-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── report/page.tsx          # Report submission
│   │   ├── report/success/page.tsx  # Success confirmation
│   │   ├── map/page.tsx             # Public issue map
│   │   ├── admin/
│   │   │   ├── login/page.tsx       # Admin login
│   │   │   ├── page.tsx             # Admin dashboard
│   │   │   ├── reports/page.tsx     # All reports
│   │   │   ├── reports/[id]/page.tsx # Report detail
│   │   │   └── analytics/page.tsx   # Analytics & insights
│   │   └── api/
│   │       ├── reports/             # Report CRUD
│   │       ├── ai/analyze/          # AI analysis
│   │       ├── clusters/            # Duplicate clusters
│   │       ├── insights/            # Area insights + stats
│   │       ├── admin/login/         # Admin auth
│   │       └── upload/              # Image upload
│   ├── components/
│   │   ├── ui/                      # shadcn/ui base components
│   │   ├── layout/                  # Navbar, admin sidebar
│   │   ├── map/                     # Leaflet map component
│   │   ├── dashboard/               # Stats, charts, tables
│   │   ├── forms/                   # Report submission form
│   │   └── shared/                  # Badges, AI analysis card
│   ├── lib/
│   │   ├── supabase/                # Supabase clients
│   │   ├── openai/                  # AI analysis
│   │   ├── scoring/                 # Priority scoring logic
│   │   ├── demo-data.ts             # 25 demo reports
│   │   └── utils.ts                 # Shared utilities
│   └── types/index.ts               # TypeScript interfaces
├── supabase/
│   ├── migrations/001_initial.sql   # DB schema
│   └── seed.sql                     # Demo data
├── .env.example
├── package.json
└── README.md
```

---

## Key Features

### For Residents
- **Report Issues** — Photo upload + location + description
- **AI Classification** — Instant category and severity detection
- **AI Summary Preview** — See what city staff will see before submitting
- **Issue Map** — View all active reports near you

### For City Admins
- **Smart Dashboard** — Stats, trends, critical alerts
- **AI Priority Scores** — Urgency (0-100), Impact (0-100), Priority (0-100)
- **Duplicate Detection** — Clustered similar reports from the same area
- **Status Management** — Update report status with one click
- **Equity Heatmap** — Identify underserved neighborhoods
- **Analytics** — Category breakdown, trends, cluster visualization

### AI Features
- **GPT-4o Vision** — Analyzes images + text descriptions
- **Structured JSON Output** — Validated schema for all AI responses
- **Smart Fallback** — Rule-based scoring if OpenAI key not configured
- **Priority Scoring** — Considers category, severity, sensitive locations, duplicates, time

---

## Priority Scoring Logic

Each report gets three scores (0-100):

| Score | Description |
|-------|-------------|
| **Urgency** | How urgently action is needed (safety, time-sensitive) |
| **Impact** | How many people are affected |
| **Priority** | Weighted composite (60% urgency, 40% impact) |

**Boosters:**
- Proximity to schools, hospitals, bus stops (+10–30 pts)
- Number of duplicate reports (+5 pts each, max +20)
- Days unresolved (+1.5 pts/day, max +15)
- Accessibility impact (+10 pts)

**Priority Levels:**
- 🔴 **Critical**: 85-100
- 🟠 **High**: 65-84
- 🟡 **Medium**: 40-64
- 🟢 **Low**: 0-39

---

## Demo Walkthrough

1. Open [http://localhost:3000](http://localhost:3000) — landing page
2. Click **"Report an Issue"** — step-by-step form
3. Click **"Analyze with AI"** — see AI scores
4. Submit the report
5. Go to [/admin/login](http://localhost:3000/admin/login) — use demo credentials
6. Explore the **Dashboard** — stats, critical alerts, map, recent reports
7. Click **"All Reports"** — filter, sort, update statuses
8. Click any report — see full AI analysis card
9. Go to **Analytics** — equity heatmap, charts, clusters

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI | OpenAI GPT-4o Vision |
| Maps | Leaflet (react-leaflet) |
| Charts | Recharts |
| Auth | Cookie-based admin session |
| Forms | React Hook Form + Zod |
| Notifications | Sonner |

---

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard.

### Other platforms

Standard Next.js build:

```bash
npm run build
npm start
```

---

## Built for Hackathon

CityFix AI was designed to demonstrate how AI can transform civic infrastructure management:
- **Residents** get a simple, fast reporting experience
- **Cities** get intelligent prioritization and equity insights
- **Communities** get fairer distribution of city attention

---

*Powered by GPT-4o · Next.js · Supabase · Leaflet · Recharts*
