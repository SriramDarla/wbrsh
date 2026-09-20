# Your Life, In Receipts

An empirical interactive web application that visualizes **11.4 years of living** (July 2013 → December 2024) by connecting long-term musical listening history with daily household ledgers and multi-facet mobility records.

---

## Overview

"Your Life, In Receipts" synthesizes three real-world datasets into an itemized, interactive digital archive. Rather than assuming causation, the application identifies and scores **evidence-based temporal and contextual co-occurrences** between soundtrack moments (Spotify streams) and real-life expenses (local transit, groceries, travel, lifestyle).

### Key Datasets

| Dataset | Period | Records | Description |
|---|---|---|---|
| **Spotify Extended Streaming History** | 2013 – 2024 | 149,860 | Millisecond-level playback timestamps, track, artist, album, and listening platform. |
| **Daily Household Transactions** | 2015 – 2018 | 2,461 | Detailed daily financial ledger capturing Mumbai transit, groceries, utilities, cash, and banking. |
| **Augmented India Transactions** | 2022 – 2024 | 9,417 | Multi-facet transaction records spanning travel, entertainment, fitness, retail, and digital payment modes. |

> **Temporal Boundaries:** Daily Household Transactions (2015–2018) and India Transactions (2022–2024) do not overlap temporally. They are independently cross-referenced against the continuous Spotify timeline (2013–2024).

### The Core Story Loop

The application centers around a three-step exploratory loop:
1. **Explore Receipts**: Browse 500 curated, tactile thermal receipts capturing moments where music and spending intersected.
2. **Find a Connection**: Inspect deterministic, evidence-based co-occurrence scores (up to 10 points) broken down by time proximity, mobile transit context, and shared temporal windows.
3. **Understand the Story**: Step through 11.4 years organized into four chronological Life Chapters and the multi-dimensional Behavioural Radar.

---

## Architecture & Data Pipeline

The application is strictly **frontend-only** in production. Python is used solely as an offline preprocessing tool and is **never required at runtime**.

```
RAW CSV DATA
(public/data/*.csv)
      ↓
Offline Preprocessing (`python3 scripts/build_data_pipeline.py`)
      ↓
Compact JSON Artifacts (`public/data/processed/*.json`, ~600 KB total)
      ↓
React + Vite Frontend (Client-side fast rendering, zero backend required)
      ↓
Browser UI
```

### Preprocessed Artifacts (`public/data/processed/`)
- `chapters.json` (4.3 KB): Chronological story eras derived from dataset boundaries, plus verified circadian and payment pattern summaries.
- `curated_connections.json` (469 KB): Top 500 deduplicated, highest-scoring verified co-occurrences between audio streams and financial transactions.
- `household_summary.json` (36 KB): Aggregated annual spending, income, payment modes, and categories (2015–2018).
- `india_transact_summary.json` (50 KB): Aggregated multi-facet spending by category, city, and payment mode (2022–2024).
- `spotify_summary.json` (50 KB): Annual stream totals, listening hours, top artist rankings, and platform distributions (2013–2024).

---

## Core Features & Experience Modules

1. **📖 Life Chapters (`#story`)**
   - Four distinct eras grounded in verified dataset coverage:
     - *Act I: The Formative Playlist (2013–2014)* — Early Spotify web player discovery.
     - *Act II: The Daily Ledger & Transactions (2015–2018)* — Overlap between transportation purchases, household expenses, and mobile Spotify sessions on the same days.
     - *Act III: The Pure Sound Interlude (2019–2021)* — Three-year continuous soundtrack during shifting global routines.
     - *Act IV: Multi-Facet Mobility (2022–2024)* — Modern travel, entertainment, fitness transactions, and platform diversification.

2. **🧾 Receipt Printer (`#receipts`)**
   - Renders 500 physical-style thermal receipts itemizing temporal intersections of songs and purchases.
   - Includes printable receipt formatting, evidence-based score badges, and era filtering.

3. **🔗 Co-Occurrences Matrix (`#connections`)**
   - Search and filter scored intersections by artist, track, category, merchant, or city.
   - Real-time scoring breakdown (up to 10 points, audited and evidence-grounded) with explainable signals (same calendar day [+2], minute proximity [+3], mobile transit context [+3], late-night window [+2], or shared entertainment [+2]).

4. **📡 Behavioural Radar (`#patterns`)**
   - **24-Hour Circadian Clock**: Canvas-based visualization of listening intensity throughout the day.
   - **Top Artists by Year**: Interactive year selector showing listening evolution across 11.4 years.
   - **Payment Mode Evolution**: Historical transition across Cash, Banking, and modern payment methods.
   - **Lifestyle Spending Breakdown**: Proportional analysis of modern transactions across categories and cities.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python 3 (only needed if regenerating the data artifacts from raw CSVs)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/SriramDarla/wbrsh.git
cd wbrsh

# 2. Install dependencies
npm install
```

### Running Locally

```bash
# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

The output bundle in `dist/` is completely static and can be deployed to any static web host (Vercel, Cloudflare Pages, GitHub Pages, Netlify).

### Re-running Preprocessing (Optional)

If the raw CSV files are modified, rebuild the JSON artifacts with:

```bash
npm run pipeline
# or: python3 scripts/build_data_pipeline.py
```
