import { useState, useEffect } from 'react';
import { loadAll, fmtHours, fmtINR, fmtNum, getTopArtists } from '../../services/dataService';
import './StoryChapters.css';

/* ── Chapter configuration ─────────────────────────────────── */
const CHAPTER_META = [
  { icon: '◎', period: '2013–2014', color: '#a78bfa', label: 'THE FORMATIVE YEARS' },
  { icon: '◉', period: '2015–2018', color: '#22d3ee', label: 'THE DAILY LEDGER' },
  { icon: '◈', period: '2019–2021', color: '#4ade80', label: 'THE PURE SOUND ERA' },
  { icon: '◆', period: '2022–2024', color: '#fb923c', label: 'MULTI-FACET MOBILITY' },
];

const ROMAN_NUMS = ['I', 'II', 'III', 'IV'];

/* ── Archive Chapter Spine ─────────────────────────────────── */
function ChapterSpine({ chapters, active, onSelect }) {
  return (
    <nav className="sc-spine" role="tablist" aria-label="Life chapters">
      <div className="sc-spine__label">ARCHIVE FOLIOS</div>
      {chapters.map((ch, i) => {
        const meta = CHAPTER_META[i] ?? CHAPTER_META[0];
        return (
          <button
            key={ch.id}
            role="tab"
            aria-selected={i === active}
            className={`sc-spine__entry ${i === active ? 'is-active' : ''}`}
            style={{ '--ch-color': meta.color }}
            onClick={() => onSelect(i)}
          >
            <span className="sc-spine__num" aria-hidden="true">
              {ROMAN_NUMS[i] ?? String(i + 1).padStart(2, '0')}
            </span>
            <span className="sc-spine__icon" aria-hidden="true">{meta.icon}</span>
            <span className="sc-spine__content">
              <span className="sc-spine__period">{ch.period ?? meta.period}</span>
              <span className="sc-spine__title">{ch.title}</span>
            </span>
            <span className="sc-spine__indicator" aria-hidden="true" />
          </button>
        );
      })}
    </nav>
  );
}

/* ── Stat Ledger Entry ─────────────────────────────────────── */
function LedgerEntry({ label, value, accent = false }) {
  if (!value) return null;
  return (
    <div className={`sc-ledger__entry ${accent ? 'sc-ledger__entry--accent' : ''}`}>
      <span className="sc-ledger__label">{label}</span>
      <span className="sc-ledger__dots" aria-hidden="true" />
      <span className="sc-ledger__value">{value}</span>
    </div>
  );
}

/* ── Music Slip ─────────────────────────────────────────────── */
function MusicSlip({ artists, year }) {
  if (!artists?.length) return null;
  return (
    <div className="sc-music-slip">
      <div className="sc-music-slip__header">
        <span className="sc-music-slip__icon" aria-hidden="true">♫</span>
        <span>TOP ARTISTS · {year}</span>
      </div>
      <div className="sc-music-slip__list">
        {artists.map((a, i) => (
          <div key={a.name} className="sc-music-slip__row">
            <span className="sc-music-slip__rank">#{i + 1}</span>
            <span className="sc-music-slip__name">{a.name}</span>
            <span className="sc-music-slip__plays">{fmtNum(a.plays)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Discovery Note ─────────────────────────────────────────── */
function DiscoveryNote({ patterns }) {
  const pct = (patterns.night_owl_percentage ?? 0).toFixed(1);
  const peak = fmtNum(patterns.hourly_listening_distribution?.[5] ?? 0);
  return (
    <div className="sc-discovery">
      <div className="sc-discovery__pin" aria-hidden="true">📌</div>
      <div className="sc-discovery__content">
        <div className="sc-discovery__label">VERIFIED PATTERN · ALL ERAS</div>
        <p className="sc-discovery__body">
          <strong>{pct}%</strong> of all 149,860 streams occurred between
          11 PM and 5 AM (IST). Peak hour across the entire archive:{' '}
          <strong>5:00 AM</strong> with {peak} streams. Quietest hour: 5:00 PM.
        </p>
        <div className="sc-discovery__stamp">EMPIRICALLY VERIFIED</div>
      </div>
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────────── */
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

  if (loading) {
    return (
      <div className="sc-loading">
        <span className="sc-spinner" />
        <span>Opening the archive…</span>
      </div>
    );
  }
  if (error) return <div className="sc-error">Error: {error}</div>;

  const { chapters: chapData, spotify } = data;
  const chapters = chapData?.chapters ?? [];
  const patterns = chapData?.verified_patterns ?? {};
  const ch = chapters[active] ?? {};
  const meta = CHAPTER_META[active] ?? CHAPTER_META[0];

  const eraYear = ch.period?.split('—')?.[0]?.trim()?.replace(' ', '');
  const topArtists = getTopArtists(spotify, eraYear, 8);

  return (
    <div className="sc-root" style={{ '--ch-accent': meta.color }}>

      {/* ── Archive spine ── */}
      <ChapterSpine chapters={chapters} active={active} onSelect={setActive} />

      {/* ── Chapter page ── */}
      <div className="sc-page" key={active} role="tabpanel" aria-label={`Chapter ${active + 1}: ${ch.title}`}>

        {/* Chapter header */}
        <div className="sc-page__header">
          <div className="sc-page__num">
            CHAPTER <span>{String(active + 1).padStart(2, '0')}</span> OF {String(chapters.length).padStart(2, '0')}
          </div>
          <h2 className="sc-page__title">{ch.title}</h2>
          <div className="sc-page__period">{ch.period}</div>
          <div className="sc-page__dataset">{ch.primary_dataset}</div>
        </div>

        {/* Narrative */}
        <blockquote className="sc-page__narrative">
          {ch.narrative}
        </blockquote>

        {/* Ledger — key data logged in this era */}
        <div className="sc-ledger">
          <div className="sc-ledger__title">RECORDED IN THIS ERA</div>
          <div className="sc-ledger__body">
            <LedgerEntry label="Streams" value={fmtNum(ch.streams ?? 0)} />
            <LedgerEntry label="Listening time" value={fmtHours(ch.hours ?? 0)} />
            {ch.transactions_count && (
              <LedgerEntry label="Receipts logged" value={fmtNum(ch.transactions_count)} />
            )}
            {ch.total_expense_inr && (
              <LedgerEntry label="Expenses recorded" value={fmtINR(ch.total_expense_inr)} />
            )}
            {ch.total_income_inr && (
              <LedgerEntry label="Income recorded" value={fmtINR(ch.total_income_inr)} />
            )}
            {ch.top_artist && (
              <LedgerEntry label={`Most played (${eraYear})`} value={ch.top_artist} accent />
            )}
            {ch.top_payment_mode && (
              <LedgerEntry label="Top payment mode" value={ch.top_payment_mode} />
            )}
            {ch.top_category && (
              <LedgerEntry label="Top spending category" value={ch.top_category.replace(/_/g, ' ')} />
            )}
          </div>
        </div>

        {/* Data highlights */}
        {(ch.highlights ?? []).length > 0 && (
          <div className="sc-highlights">
            <div className="sc-highlights__title">DATA HIGHLIGHTS</div>
            <ul className="sc-highlights__list">
              {(ch.highlights ?? []).map((h, i) => (
                <li key={i} className="sc-highlight-item">
                  <span className="sc-highlight-item__marker" aria-hidden="true">—</span>
                  {h}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Music slip */}
        <MusicSlip artists={topArtists} year={eraYear} />

        {/* Discovery note — pinned to every chapter */}
        <DiscoveryNote patterns={patterns} />

        {/* Chapter navigation */}
        <div className="sc-page__nav">
          <div className="sc-page__dots">
            {chapters.map((_, i) => (
              <button
                key={i}
                className={`sc-dot ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Go to chapter ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
              />
            ))}
          </div>
          <div className="sc-page__nav-btns">
            {active > 0 && (
              <button className="sc-nav-btn" onClick={() => setActive(active - 1)}>
                ← Previous chapter
              </button>
            )}
            {active < chapters.length - 1 && (
              <button className="sc-nav-btn sc-nav-btn--next" onClick={() => setActive(active + 1)}>
                Next chapter →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
