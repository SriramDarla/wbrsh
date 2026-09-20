import { useState, useEffect } from 'react';
import { loadAll, fmtHours, fmtINR, fmtNum, getTopArtists } from '../../services/dataService';
import './StoryChapters.css';

const CHAPTER_ICONS = ['🎵', '🧾', '🎧', '✈️'];
const CHAPTER_COLORS = [
  { bg: '#1a0a2e', accent: '#a78bfa', glow: 'rgba(167,139,250,0.25)' },
  { bg: '#0a1628', accent: '#22d3ee', glow: 'rgba(34,211,238,0.25)' },
  { bg: '#0f1a12', accent: '#4ade80', glow: 'rgba(74,222,128,0.25)' },
  { bg: '#1a0f0a', accent: '#fb923c', glow: 'rgba(251,146,60,0.25)' },
];

export default function StoryChapters() {
  const [data, setData] = useState(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAll()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="sc-loading"><span className="sc-spinner" />Loading chapters…</div>;
  if (error) return <div className="sc-error">Error: {error}</div>;

  const { chapters: chapData, spotify } = data;
  const chapters = chapData?.chapters ?? [];
  const patterns = chapData?.verified_patterns ?? {};
  const ch = chapters[active] ?? {};
  const colors = CHAPTER_COLORS[active];

  // Top artists for this chapter era
  const eraYear = ch.period?.split('—')?.[0]?.trim();
  const topArtists = getTopArtists(spotify, eraYear, 8);

  return (
    <div className="sc-root" style={{ '--accent': colors.accent, '--ch-bg': colors.bg, '--glow': colors.glow }}>

      {/* ── Chapter selector tabs ── */}
      <div className="sc-tabs" role="tablist">
        {chapters.map((c, i) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={i === active}
            className={`sc-tab ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            <span className="sc-tab__icon">{CHAPTER_ICONS[i]}</span>
            <span className="sc-tab__period">{c.period}</span>
            <span className="sc-tab__title">{c.title}</span>
          </button>
        ))}
      </div>

      {/* ── Active chapter panel ── */}
      <div className="sc-panel" key={active}>

        {/* Header */}
        <div className="sc-panel__header">
          <div className="sc-panel__number">Chapter {String(active + 1).padStart(2, '0')}</div>
          <h2 className="sc-panel__title">{ch.title}</h2>
          <p className="sc-panel__period">{ch.period}</p>
          <div className="sc-panel__datasets">
            <span className="sc-badge">{ch.primary_dataset}</span>
          </div>
        </div>

        {/* Narrative */}
        <blockquote className="sc-narrative">{ch.narrative}</blockquote>

        {/* Key stats grid */}
        <div className="sc-stats">
          <div className="sc-stat">
            <span className="sc-stat__value">{fmtNum(ch.streams ?? 0)}</span>
            <span className="sc-stat__label">streams</span>
          </div>
          <div className="sc-stat">
            <span className="sc-stat__value">{fmtHours(ch.hours ?? 0)}</span>
            <span className="sc-stat__label">listening time</span>
          </div>
          {ch.transactions_count && (
            <div className="sc-stat">
              <span className="sc-stat__value">{fmtNum(ch.transactions_count)}</span>
              <span className="sc-stat__label">receipts</span>
            </div>
          )}
          {ch.total_expense_inr && (
            <div className="sc-stat">
              <span className="sc-stat__value">{fmtINR(ch.total_expense_inr)}</span>
              <span className="sc-stat__label">expenses recorded</span>
            </div>
          )}
          {ch.total_income_inr && (
            <div className="sc-stat">
              <span className="sc-stat__value">{fmtINR(ch.total_income_inr)}</span>
              <span className="sc-stat__label">income recorded</span>
            </div>
          )}
          {ch.top_artist && (
            <div className="sc-stat sc-stat--wide">
              <span className="sc-stat__value sc-stat__value--artist">🎤 {ch.top_artist}</span>
              <span className="sc-stat__label">most played artist ({eraYear})</span>
            </div>
          )}
          {ch.top_payment_mode && (
            <div className="sc-stat sc-stat--wide">
              <span className="sc-stat__value">💳 {ch.top_payment_mode}</span>
              <span className="sc-stat__label">top payment mode (2015–2018)</span>
            </div>
          )}
          {ch.top_category && (
            <div className="sc-stat sc-stat--wide">
              <span className="sc-stat__value">🛒 {ch.top_category.replace(/_/g, ' ')}</span>
              <span className="sc-stat__label">top spending category</span>
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="sc-highlights">
          <h3 className="sc-highlights__heading">Data Highlights</h3>
          <ul className="sc-highlights__list">
            {(ch.highlights ?? []).map((h, i) => (
              <li key={i} className="sc-highlight-item">
                <span className="sc-highlight-item__dot" />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {/* Top artists strip for this era's first year */}
        {topArtists.length > 0 && (
          <div className="sc-artists">
            <h3 className="sc-artists__heading">Top artists — {eraYear}</h3>
            <div className="sc-artists__list">
              {topArtists.map((a, i) => (
                <div key={a.name} className="sc-artist-pill">
                  <span className="sc-artist-pill__rank">#{i + 1}</span>
                  <span className="sc-artist-pill__name">{a.name}</span>
                  <span className="sc-artist-pill__plays">{fmtNum(a.plays)} plays</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Night-owl pattern (all chapters share this global insight) */}
        <div className="sc-pattern">
          <h3 className="sc-pattern__heading">🦉 Verified Listening Pattern</h3>
          <p className="sc-pattern__body">
            Across all 11.4 years, <strong>{(patterns.night_owl_percentage ?? 0).toFixed(1)}%</strong> of all streams
            occurred between 11 PM and 5 AM (IST). The single busiest hour in the entire 149,860-record
            dataset is <strong>5:00 AM</strong> with {fmtNum(patterns.hourly_listening_distribution?.[5] ?? 0)} streams —
            followed by 6:00 AM and 2:00 AM. Afternoon listening hits a minimum at 5:00 PM.
          </p>
        </div>

        {/* Chapter progress indicator */}
        <div className="sc-progress">
          {chapters.map((_, i) => (
            <button
              key={i}
              className={`sc-progress__dot ${i === active ? 'is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Chapter ${i + 1}`}
            />
          ))}
          <div className="sc-progress__nav">
            {active > 0 && (
              <button className="sc-nav-btn" onClick={() => setActive(active - 1)}>← Previous</button>
            )}
            {active < chapters.length - 1 && (
              <button className="sc-nav-btn sc-nav-btn--next" onClick={() => setActive(active + 1)}>Next →</button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
