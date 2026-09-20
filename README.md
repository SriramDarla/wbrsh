# Your Life, In Receipts

An empirical interactive web application that visualizes **11.4 years of living** (July 2013 → December 2024) by connecting long-term musical listening history with daily household ledgers and multi-facet mobility records.

> **Concept:** What if you could browse your own life like an archive? Not a feed. Not a dashboard. An ordered record of moments — where a Spotify stream and a transaction collided within the same hour, and left evidence.

---

## The Problem It Solves

Most personal data tools chart trends. This application does something different: it asks whether disconnected digital-life records — streaming history, household ledgers, transport receipts — can be assembled into a coherent **human story**.

The answer it proposes is: **yes, through temporal co-occurrence.**

When a song plays and a purchase happens within the same hour, on the same day, with matching contextual signals (a late-night transit purchase and a mobile Spotify stream), those two records become a *moment*. Five hundred of the strongest such moments are curated, scored, and displayed as physical thermal receipts.

---

## Datasets

| Dataset | Period | Records | Description |
|---|---|---|---|
| **Spotify Extended Streaming History** | 2013–2024 | 149,860 | Millisecond-level playback timestamps, track, artist, album, platform |
| **Daily Household Transactions** | 2015–2018 | 2,461 | Daily financial ledger: Mumbai transit, groceries, utilities, cash, banking |
| **Augmented India Transactions** | 2022–2024 | 9,417 | Multi-facet records: travel, entertainment, fitness, retail, digital payments |

> **Temporal Boundaries:** The two transaction datasets do not overlap in time. They are independently scored against the continuous Spotify timeline (2013–2024). Cross-era connections are structurally impossible and explicitly enforced.

---

## Connection Scoring Algorithm

Each co-occurrence is scored **deterministically** using verifiable temporal and contextual evidence. No machine learning, no inference, no LLMs.

### Scoring Signals (max 10 points)

| Signal | Points | Condition |
|---|---|---|
| Same calendar day | 3 | Transaction date = Spotify date |
| Within 1 hour | 3 | Timestamps within 60 minutes |
| Within 3 hours | 1 | Timestamps within 180 minutes |
| Mobile listening | 1 | `platform` = Android / iOS |
| Transportation purchase | 1 | Category = `transit` / `transport` |
| Late-night activity | 1 | Both events 11 PM – 5 AM IST |
| Shared entertainment context | 1 | Both are entertainment-category events |
| Monthly milestone | 1 | First/last day of month for both |

Scores are capped at 10. Only co-occurrences scoring ≥ 5 are shown. The top 500 are curated for display.

**CORRELATION ≠ CAUSATION.** No causal link between any stream and any purchase is implied or claimed.

---

## Story Generation

Four life chapters are derived from **dataset boundaries**, not from inference:

| Chapter | Period | Primary Dataset | Story |
|---|---|---|---|
| The Formative Years | 2013–2014 | Spotify only | Early discovery, web player era |
| The Daily Ledger | 2015–2018 | Spotify + Household | Mobile listening meets everyday spending |
| The Pure Sound Era | 2019–2021 | Spotify only | Continuous soundtrack through shifting routines |
| Multi-Facet Mobility | 2022–2024 | Spotify + India Transact | Modern travel, UPI, lifestyle diversification |

Chapter narratives are authored from verified data facts (stream counts, spending totals, top artists, circadian distributions). No synthetic text.

---

## Architecture & Data Pipeline

Production is **frontend-only**. Python handles offline preprocessing only — never at runtime.

```
RAW CSV DATA
(public/data/*.csv)
      ↓
Offline Preprocessing
python3 scripts/build_data_pipeline.py
      ↓
Compact JSON Artifacts
public/data/processed/*.json  (~600 KB total)
      ↓
React + Vite Frontend
Client-side rendering, zero backend, zero API calls
      ↓
Browser UI
```

### Frontend Architecture

```
src/
├── App.jsx                    # Hash-based router (home | #story | #receipts | ...)
├── LoaderMarquee.jsx          # Cinematic intro sequence + persistent navigation bar
├── HomePage.jsx               # Archive overview: hero, metric cycler, module cards
├── pages/
│   ├── InnerPage.jsx          # Archive folder header + lazy-loaded module shell
│   └── pages.js               # Page manifest (id, title, subtitle, palette, icon)
├── components/
│   ├── timeline/StoryChapters.jsx     # Chapter spine + archive page layout
│   ├── receipts/ThermalReceipt.jsx    # Thermal receipt explorer with search + filter
│   ├── connections/ConnectionMatrix.jsx  # Evidence board with search + pagination
│   └── analytics/BehavioralRadar.jsx  # Four analytical artifact cards
└── services/dataService.js    # Fetch, cache, and format all JSON data
```

### Preprocessed Artifacts (`public/data/processed/`)
- `curated_connections.json` (469 KB) — Top 500 scored co-occurrences
- `spotify_summary.json` (50 KB) — Annual stream totals, top artists, circadian distribution
- `india_transact_summary.json` (50 KB) — Category, city, payment mode analysis (2022–2024)
- `household_summary.json` (36 KB) — Spending, income, payment modes (2015–2018)
- `chapters.json` (4.3 KB) — Chapter metadata, verified patterns, data highlights

---

## Experience Modules

### 1. Life Chapters (`#story`)
Four archive pages, each corresponding to a data-bounded era. Left spine navigation, chapter-specific accent colors, artist music slips, and a verified circadian discovery note pinned across all chapters.

### 2. Receipt Printer (`#receipts`)
500 authentic thermal receipts — cream paper on black, monospace typography, torn edges, barcode. Each receipt is a verified co-occurrence. Features:
- Full-text search (track, artist, merchant, category, city)
- Era filter (All / 2015–2018 / 2022–2024)
- Keyboard navigation (← → arrow keys)
- Random receipt
- Physical print output

### 3. Co-Occurrences (`#connections`)
Evidence board of 500 scored connection pairs. Each pair shows two physical artifacts side by side — a dark music ticket and a cream receipt — joined by a pink evidence thread and a score seal. Features:
- Live search across all fields
- Era filter
- Paginated (8 per page)
- Score scale legend (Moderate / Strong / Maximum)

### 4. Behavioural Radar (`#patterns`)
Four analytical artifact cards, each answering a single question:
- *When did you listen?* — 24-hour canvas circadian clock
- *Who defined each year?* — Top artists by year selector
- *How did you pay?* — Payment mode evolution (Cash → Banking → Digital)
- *Where did the money go?* — India transaction category breakdown

---

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Python 3 (optional — only for regenerating data artifacts)

### Installation & Run

```bash
git clone https://github.com/SriramDarla/wbrsh.git
cd wbrsh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
# Output in dist/ — fully static, deployable to any CDN
```

### Regenerate Data Pipeline (Optional)

```bash
npm run pipeline
# or: python3 scripts/build_data_pipeline.py
```

Only needed if the raw CSV source files change.

---

## Design Philosophy

The application is built around a single metaphor: **a personal archive, not a dashboard.**

- Dark world (black/charcoal) = the archive environment
- Paper elements (cream/warm) = physical artifacts within it
- Pink (#EA9DFF) = annotation threads, connection evidence, highlights
- IBM Plex Mono = machine-printed data, receipts, labels
- Bricolage Grotesque = editorial narrative, headings

Interaction is progressive: receipts are browsed one at a time, connections are paginated, analytics are presented as discrete artifact cards. The experience rewards exploration over overview.
