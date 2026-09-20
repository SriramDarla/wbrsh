import { useState, useEffect, useRef } from 'react';
import {
  loadChapters,
  loadSpotifySummary,
  loadHouseholdSummary,
  loadIndiaTransactSummary,
  fmtNum,
  getHourlyDistribution,
  getPaymentModesByYear,
  getSpotifyYears,
  getTopArtists,
} from '../../services/dataService';
import './BehavioralRadar.css';

/* ─── 24h Circadian Clock ──────────────────────────────────── */
function CircadianClock({ hourly }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hourly?.length) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const outerR = Math.min(cx, cy) - 16;
    const innerR = outerR * 0.42;
    const max = Math.max(...hourly);

    ctx.clearRect(0, 0, W, H);

    for (let h = 0; h < 24; h++) {
      const startAngle = ((h / 24) * 2 * Math.PI) - Math.PI / 2;
      const endAngle = (((h + 1) / 24) * 2 * Math.PI) - Math.PI / 2;
      const ratio = hourly[h] / max;
      const barR = innerR + (outerR - innerR) * ratio;

      let hue = 200;
      if (h >= 5 && h < 9) hue = 40;
      if (h >= 9 && h < 17) hue = 160;
      if (h >= 17 && h < 21) hue = 270;
      if (h >= 21 || h < 1) hue = 200;

      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(startAngle) * innerR, cy + Math.sin(startAngle) * innerR);
      ctx.arc(cx, cy, barR, startAngle, endAngle);
      ctx.arc(cx, cy, innerR, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.2 + ratio * 0.7})`;
      ctx.fill();
    }

    ctx.font = `bold ${Math.round(outerR * 0.09)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    [0, 6, 12, 18].forEach((h) => {
      const angle = ((h / 24) * 2 * Math.PI) - Math.PI / 2;
      const labelR = outerR + 14;
      const x = cx + Math.cos(angle) * labelR;
      const y = cy + Math.sin(angle) * labelR;
      ctx.fillText(`${h}:00`, x, y);
    });

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${Math.round(outerR * 0.22)}px sans-serif`;
    ctx.fillStyle = '#22d3ee';
    ctx.fillText('24h', cx, cy - 8);
    ctx.font = `${Math.round(outerR * 0.1)}px monospace`;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('RHYTHM', cx, cy + 14);
  }, [hourly]);

  return (
    <canvas
      ref={canvasRef}
      className="br-clock"
      width={320}
      height={320}
      role="img"
      aria-label="24-hour circadian listening distribution"
    />
  );
}

/* ─── Artist Year View ─────────────────────────────────────── */
function ArtistYearView({ spotify }) {
  const years = getSpotifyYears(spotify);
  const [yr, setYr] = useState(years[years.length - 1] ?? '2024');
  const artists = getTopArtists(spotify, yr, 10);
  const maxPlays = artists[0]?.plays ?? 1;

  return (
    <div className="br-artist-view">
      <div className="br-artist-view__controls">
        <span className="br-artifact-label">MUSIC LOG</span>
        <select
          className="br-select"
          value={yr}
          onChange={(e) => setYr(e.target.value)}
          aria-label="Select year"
          id="artist-year-select"
        >
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="br-artist-bars">
        {artists.map((a, i) => (
          <div key={a.name} className="br-artist-bar">
            <span className="br-artist-bar__rank">#{i + 1}</span>
            <div className="br-artist-bar__track-wrap">
              <div
                className="br-artist-bar__track"
                style={{ '--w': `${(a.plays / maxPlays) * 100}%` }}
              />
            </div>
            <span className="br-artist-bar__name">{a.name}</span>
            <span className="br-artist-bar__plays">{fmtNum(a.plays)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Payment Mode Timeline ────────────────────────────────── */
function PaymentModeLine({ modes }) {
  const years = Object.keys(modes).sort();
  const allModes = new Set();
  years.forEach((y) => Object.keys(modes[y]).forEach((m) => allModes.add(m)));
  const modeList = [...allModes];

  const modeColors = [
    '#22d3ee', '#a78bfa', '#4ade80', '#fb923c', '#f472b6', '#facc15', '#38bdf8',
  ];

  return (
    <div className="br-payment">
      <div className="br-artifact-label">PAYMENT LEDGER · 2015–2018</div>
      <div className="br-payment__disclaimer">
        Values reflect only the actual payment modes recorded in the Household dataset.
        No additional payment methods have been inferred.
      </div>
      <div className="br-payment__grid">
        {years.map((y) => {
          const total = Object.values(modes[y]).reduce((s, v) => s + v, 0);
          return (
            <div key={y} className="br-payment__col">
              <div className="br-payment__year">{y}</div>
              <div className="br-payment__bar-stack">
                {modeList.map((m, mi) => {
                  const count = modes[y][m] ?? 0;
                  if (!count) return null;
                  const pct = (count / total) * 100;
                  return (
                    <div
                      key={m}
                      className="br-payment__segment"
                      style={{ height: `${pct}%`, background: modeColors[mi % modeColors.length] }}
                      title={`${m}: ${count} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              <div className="br-payment__total">{total}</div>
            </div>
          );
        })}
      </div>
      <div className="br-payment__legend">
        {modeList.map((m, mi) => (
          <div key={m} className="br-payment__legend-item">
            <span style={{ background: modeColors[mi % modeColors.length] }} className="br-payment__legend-dot" />
            <span>{m}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── India Category Chart ─────────────────────────────────── */
function IndiaCategoryChart({ categories }) {
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const COLORS = ['#fb923c', '#22d3ee', '#a78bfa', '#4ade80'];
  let cumulPct = 0;

  return (
    <div className="br-india">
      <div className="br-artifact-label">SPENDING BREAKDOWN · 2022–2024</div>
      <div className="br-india__donut-wrap">
        <svg viewBox="0 0 120 120" className="br-donut" aria-label="Category donut chart">
          {entries.map(([cat, val], i) => {
            const pct = val / total;
            const startPct = cumulPct;
            cumulPct += pct;
            const start = startPct * 2 * Math.PI - Math.PI / 2;
            const end = cumulPct * 2 * Math.PI - Math.PI / 2;
            const r = 44;
            const x1 = 60 + r * Math.cos(start);
            const y1 = 60 + r * Math.sin(start);
            const x2 = 60 + r * Math.cos(end);
            const y2 = 60 + r * Math.sin(end);
            const large = pct > 0.5 ? 1 : 0;
            return (
              <path
                key={cat}
                d={`M 60 60 L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
                fill={COLORS[i % COLORS.length]}
                opacity={0.85}
              />
            );
          })}
          <circle cx="60" cy="60" r="30" fill="#0C0B0E" />
          <text x="60" y="56" textAnchor="middle" fill="white" fontSize="7" fontFamily="monospace">{fmtNum(total)}</text>
          <text x="60" y="66" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="5" fontFamily="monospace">transactions</text>
        </svg>
        <div className="br-donut-legend">
          {entries.map(([cat, val], i) => (
            <div key={cat} className="br-donut-legend__item">
              <span className="br-donut-legend__dot" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="br-donut-legend__cat">{cat.replace(/_/g, ' ')}</span>
              <span className="br-donut-legend__pct">{((val / total) * 100).toFixed(1)}%</span>
              <span className="br-donut-legend__n">{fmtNum(val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Global Spotify Stats ─────────────────────────────────── */
function SpotifyGlobalStats({ spotify }) {
  const items = [
    { label: 'Total Streams', value: fmtNum(spotify.total_streams) },
    { label: 'Listening Time', value: `${fmtNum(Math.round(spotify.total_hours_played))}h` },
    { label: 'Skip Rate', value: `${(spotify.overall_skip_rate * 100).toFixed(1)}%` },
    { label: 'Shuffle Rate', value: `${(spotify.overall_shuffle_rate * 100).toFixed(1)}%` },
    { label: 'Years Tracked', value: `${Object.keys(spotify.years ?? {}).length}` },
  ];
  return (
    <div className="br-global" role="region" aria-label="Archive dataset totals">
      <div className="br-global__header">
        <span className="br-global__tag">// ARCHIVAL METRICS</span>
        <span className="br-global__span">2013 — 2024 · 11.4 YEARS</span>
      </div>
      <div className="br-global__items">
        {items.map((it) => (
          <div key={it.label} className="br-global__item">
            <span className="br-global__label">{it.label}</span>
            <span className="br-global__value">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Artifact Card wrapper ────────────────────────────────── */
function ArtifactCard({ title, sub, stamp, accentColor, children, full = false }) {
  return (
    <div
      className={`br-artifact-card ${full ? 'br-artifact-card--full' : ''}`}
      style={{ '--card-accent': accentColor }}
    >
      <div className="br-artifact-card__header">
        <div className="br-artifact-card__header-left">
          <div className="br-artifact-card__title">{title}</div>
          {sub && <div className="br-artifact-card__sub">{sub}</div>}
        </div>
        {stamp && (
          <div className="br-artifact-card__stamp">{stamp}</div>
        )}
      </div>
      <div className="br-artifact-card__body">
        {children}
      </div>
    </div>
  );
}

/* ─── Main Export ──────────────────────────────────────────── */
export default function BehavioralRadar() {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      loadChapters(),
      loadSpotifySummary(),
      loadHouseholdSummary(),
      loadIndiaTransactSummary(),
    ])
      .then(([chapters, spotify, household, india]) => {
        setState({ chapters, spotify, household, india });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="br-loading">
        <span className="br-spinner" />
        <span>Reading the archive patterns…</span>
      </div>
    );
  }
  if (error) return <div className="br-error">Error: {error}</div>;

  const { chapters, spotify, household, india } = state;
  const hourly = getHourlyDistribution(chapters);
  const paymentModes = getPaymentModesByYear(chapters);
  const nightOwlPct = chapters.verified_patterns?.night_owl_percentage ?? 0;
  const indiaCategories = chapters.verified_patterns?.india_categories ?? {};

  return (
    <div className="br-root">

      {/* ── Archive header ── */}
      <div className="br-archive-header">
        <div className="br-archive-header__label">BEHAVIOURAL ARCHIVE</div>
        <h2 className="br-archive-header__title">Patterns in the Data</h2>
        <p className="br-archive-header__sub">
          Extracted exclusively from the verified dataset. No hypotheses — only evidence.
        </p>
      </div>

      {/* ── Global Spotify stats ── */}
      <SpotifyGlobalStats spotify={spotify} />

      {/* ── Artifact grid ── */}
      <div className="br-grid">

        {/* Circadian time-card */}
        <ArtifactCard
          title="Circadian Listening Rhythm"
          sub="24-hour distribution across all 149,860 streams (IST)"
          stamp="TIME CARD"
          accentColor="#22d3ee"
        >
          <div className="br-clock-wrap">
            <CircadianClock hourly={hourly} />
            <div className="br-clock-facts">
              <div className="br-fact">
                <span className="br-fact__val">5:00 AM</span>
                <span className="br-fact__label">busiest hour ({fmtNum(hourly[5])} streams)</span>
              </div>
              <div className="br-fact">
                <span className="br-fact__val">{nightOwlPct.toFixed(1)}%</span>
                <span className="br-fact__label">streams 11 PM – 5 AM</span>
              </div>
              <div className="br-fact">
                <span className="br-fact__val">5:00 PM</span>
                <span className="br-fact__label">quietest hour ({fmtNum(hourly[17])} streams)</span>
              </div>
            </div>
          </div>
        </ArtifactCard>

        {/* Artist year view */}
        <ArtifactCard
          title="Artist Rankings by Year"
          sub="Top 10 artists — select a year to explore"
          stamp="MUSIC LOG"
          accentColor="#a78bfa"
        >
          <ArtistYearView spotify={spotify} />
        </ArtifactCard>

        {/* Payment modes — full width */}
        <ArtifactCard
          title="Payment Mode Evolution"
          sub="2015–2018 · Household ledger dataset only"
          stamp="LEDGER"
          accentColor="#4ade80"
          full
        >
          <PaymentModeLine modes={paymentModes} />
        </ArtifactCard>

        {/* India categories — full width */}
        <ArtifactCard
          title="India Transaction Breakdown"
          sub="4 verified spending categories · 2022–2024"
          stamp="SPENDING RECORD"
          accentColor="#fb923c"
          full
        >
          <IndiaCategoryChart categories={indiaCategories} />
        </ArtifactCard>

      </div>
    </div>
  );
}
