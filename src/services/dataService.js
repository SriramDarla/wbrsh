/**
 * dataService.js
 * Asynchronously loads the offline-preprocessed JSON artifacts from public/data/processed/
 * and provides utility functions for filtering, querying, and formatting records.
 *
 * All heavy computation (150k Spotify rows) was done at build-time by the Python pipeline.
 * This module only loads ~600 KB of compact, pre-indexed summaries — no main-thread blocking.
 */

const BASE = '/data/processed';

// In-memory cache so each file is only fetched once per session
const _cache = {};

async function loadJSON(filename) {
  if (_cache[filename]) return _cache[filename];
  const res = await fetch(`${BASE}/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
  const data = await res.json();
  _cache[filename] = data;
  return data;
}

// ─── Public loaders ──────────────────────────────────────────────────────────

export async function loadChapters() {
  return loadJSON('chapters.json');
}

export async function loadSpotifySummary() {
  return loadJSON('spotify_summary.json');
}

export async function loadHouseholdSummary() {
  return loadJSON('household_summary.json');
}

export async function loadIndiaTransactSummary() {
  return loadJSON('india_transact_summary.json');
}

export async function loadCuratedConnections() {
  return loadJSON('curated_connections.json');
}

/** Load all five artifacts in parallel and return a combined state object */
export async function loadAll() {
  const [chapters, spotify, household, india, connections] = await Promise.all([
    loadChapters(),
    loadSpotifySummary(),
    loadHouseholdSummary(),
    loadIndiaTransactSummary(),
    loadCuratedConnections(),
  ]);
  return { chapters, spotify, household, india, connections };
}

// ─── Utility functions ────────────────────────────────────────────────────────

/** Format milliseconds to readable listening time */
export function fmtMs(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Format hours to "Xh" or "X days Xh" */
export function fmtHours(h) {
  const days = Math.floor(h / 24);
  const rem = Math.round(h % 24);
  if (days === 0) return `${Math.round(h)}h`;
  return `${days}d ${rem}h`;
}

/** Format INR amounts compactly */
export function fmtINR(n) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

/** Format large numbers with commas */
export function fmtNum(n) {
  return n.toLocaleString('en-IN');
}

/** Format a percentage */
export function fmtPct(ratio) {
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Filter connections by era, minimum score, and a text query
 * @param {Array} connections
 * @param {{ era?: string, minScore?: number, query?: string }} opts
 */
export function filterConnections(connections, { era, minScore = 5, query = '' } = {}) {
  let filtered = connections;
  if (era) filtered = filtered.filter((c) => c.era === era);
  if (minScore) filtered = filtered.filter((c) => c.score >= minScore);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter((c) => {
      const sp = c.spotify;
      const tx = c.transaction;
      return (
        (sp.track && sp.track.toLowerCase().includes(q)) ||
        (sp.artist && sp.artist.toLowerCase().includes(q)) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(q)) ||
        (tx.city && tx.city.toLowerCase().includes(q))
      );
    });
  }
  return filtered;
}

/**
 * Get the 24-hour listening distribution across all years (already summed in chapters.json)
 */
export function getHourlyDistribution(chaptersData) {
  return chaptersData?.verified_patterns?.hourly_listening_distribution ?? new Array(24).fill(0);
}

/**
 * Get payment mode timeline from household data (year → mode → count)
 */
export function getPaymentModesByYear(chaptersData) {
  return chaptersData?.verified_patterns?.household_payment_modes_by_year ?? {};
}

/**
 * Build a sorted year list from spotify summary
 */
export function getSpotifyYears(spotifyData) {
  return Object.keys(spotifyData?.years ?? {}).sort();
}

/**
 * Get top N artists for a given year
 */
export function getTopArtists(spotifyData, year, n = 10) {
  return (spotifyData?.years?.[year]?.top_artists ?? []).slice(0, n);
}

/** Score label from numeric score (max theoretical score is 10 after double-count fix) */
export function scoreLabel(score) {
  if (score >= 10) return { label: 'Maximum', color: '#22d3ee' };
  if (score >= 7) return { label: 'Strong', color: '#a78bfa' };
  if (score >= 5) return { label: 'Moderate', color: '#fbbf24' };
  return { label: 'Weak', color: '#6b7280' };
}
