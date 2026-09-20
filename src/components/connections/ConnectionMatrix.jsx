import { useState, useEffect, useCallback } from 'react';
import {
  loadCuratedConnections,
  filterConnections,
  fmtINR,
  fmtMs,
  scoreLabel,
} from '../../services/dataService';
import './ConnectionMatrix.css';

/* ── Reason icon map ─────────────────────────────────────────── */
const REASON_ICONS = {
  'Same calendar day': '📅',
  'Within': '⏱',
  'Mobile Spotify stream': '📱',
  'Mobile listening': '📱',
  'Transportation purchase': '🚉',
  'Travel purchase': '✈',
  'Late-night': '🌙',
  'Shared digital entertainment': '🎬',
  'Shared entertainment theme': '🎬',
  'Travel purchase and music': '✈',
  'Transportation purchase and music': '🚉',
  'Monthly milestone': '💰',
};

function getReasonIcon(reason) {
  for (const [key, icon] of Object.entries(REASON_ICONS)) {
    if (reason.startsWith(key)) return icon;
  }
  return '●';
}

/* ── Evidence Pair ───────────────────────────────────────────── */
function EvidencePair({ conn }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { score, reasons, era, transaction: tx, spotify: sp } = conn;
  const sl = scoreLabel(score);

  const txLabel = tx.note || tx.merchant || tx.category?.replace(/_/g, ' ') || '—';
  const txCat = tx.category?.replace(/_/g, ' ');
  const txSub = tx.subcategory || '';
  const txDate = tx.date || '';
  const txTime = tx.time?.slice(0, 5) || '';
  const spDate = sp.ts?.slice(0, 10) || '';
  const spTime = sp.ts?.slice(11, 16) || '';

  return (
    <article className={`ep ${isRevealed ? 'is-revealed' : ''}`} aria-label={`Connection: ${sp.track} with ${txLabel}`}>
      {/* ── Top meta bar ── */}
      <div className="ep__bar">
        <span className="ep__era">{era}</span>
        <span className="ep__date">{txDate}</span>
        <span className="ep__id">{conn.connection_id}</span>
      </div>

      {/* ── Two artifacts + connector ── */}
      <div className="ep__body">

        {/* LEFT — music artifact */}
        <div className="ep__artifact ep__artifact--music" role="region" aria-label="Music record">
          <div className="ep__artifact-type">
            <span className="ep__artifact-dot" />
            AUDIO RECORD
          </div>
          <div className="ep__track">{sp.track || 'Unknown track'}</div>
          <div className="ep__artist">{sp.artist || 'Unknown artist'}</div>
          <div className="ep__album ep__muted">{sp.album?.slice(0, 32)}</div>
          <div className="ep__artifact-foot">
            <span className="ep__platform">{sp.platform}</span>
            <span className="ep__duration">{fmtMs(sp.ms_played)}</span>
          </div>
          <div className="ep__timestamp">{spDate}<br />{spTime} IST</div>
        </div>

        {/* CENTER — evidence connector */}
        <div className="ep__connector" aria-hidden="true">
          <div className="ep__thread ep__thread--top" />
          <button
            type="button"
            className="ep__score-seal"
            style={{ '--seal-color': sl.color }}
            onClick={() => setIsRevealed((v) => !v)}
            title={isRevealed ? 'Hide evidence' : 'Inspect evidence'}
            aria-label={`Score ${score} out of 10. Click to inspect evidence.`}
          >
            <span className="ep__score-num">{score}</span>
            <span className="ep__score-denom">/10</span>
            <span className="ep__score-label">{sl.label}</span>
          </button>
          <div className="ep__thread ep__thread--bot" />
        </div>

        {/* RIGHT — transaction/receipt artifact */}
        <div className="ep__artifact ep__artifact--receipt" role="region" aria-label="Transaction record">
          <div className="ep__artifact-type ep__artifact-type--dark">
            <span className="ep__artifact-dot ep__artifact-dot--ink" />
            {tx.dataset === 'india_transact' ? 'TRANSACTION RECORD' : 'HOUSEHOLD LEDGER'}
          </div>
          <div className="ep__tx-primary">{txLabel.slice(0, 36)}</div>
          <div className="ep__tx-cat">{txCat}{txSub ? ` · ${txSub}` : ''}</div>
          {tx.amount > 0 && <div className="ep__tx-amount">{fmtINR(tx.amount)}</div>}
          {tx.city && (
            <div className="ep__tx-location ep__muted-ink">
              📍 {tx.city}{tx.state ? `, ${tx.state}` : ''}
            </div>
          )}
          {tx.mode && <div className="ep__muted-ink ep__tx-mode">via {tx.mode}</div>}
          <div className="ep__timestamp ep__timestamp--ink">{txDate}<br />{txTime}</div>
        </div>
      </div>

      {/* ── Evidence disclosure trigger ── */}
      <div className="ep__foot">
        <button
          type="button"
          className="ep__toggle-btn"
          onClick={() => setIsRevealed((v) => !v)}
          aria-expanded={isRevealed}
        >
          <span className="ep__toggle-label">
            {isRevealed ? 'Hide forensic signals' : `Inspect evidence signals (${reasons.length})`}
          </span>
          <span className="ep__toggle-icon" aria-hidden="true">
            {isRevealed ? '▴' : '▾'}
          </span>
        </button>
      </div>

      {/* ── Progressive disclosure of evidence signals ── */}
      {isRevealed && (
        <div className="ep__evidence">
          <div className="ep__evidence-pills">
            {reasons.map((r, i) => (
              <span key={i} className="ep__pill">
                <span className="ep__pill-icon">{getReasonIcon(r)}</span>
                {r}
              </span>
            ))}
          </div>
          <div className="ep__disclaimer">
            Co-occurrence only · No causal relationship implied or claimed
          </div>
        </div>
      )}
    </article>
  );
}

/* ── Archive Search Bar ──────────────────────────────────────── */
function ArchiveSearch({ query, onQuery, era, onEra, count, total }) {
  return (
    <div className="cm-search-bar">
      <div className="cm-search-bar__field">
        <span className="cm-search-bar__icon" aria-hidden="true">⌕</span>
        <input
          className="cm-search-bar__input"
          type="search"
          placeholder="Search artists, tracks, notes, merchants, cities…"
          value={query}
          onChange={onQuery}
          aria-label="Search connections"
          id="conn-search"
        />
      </div>
      <select
        className="cm-era-select"
        value={era}
        onChange={onEra}
        aria-label="Filter by era"
        id="conn-era"
      >
        <option value="">All Eras</option>
        <option value="2015-2018">2015–2018 · Household</option>
        <option value="2022-2024">2022–2024 · India Transact</option>
      </select>
      <span className="cm-count">
        {count.toLocaleString()} <span className="cm-count__of">of {total.toLocaleString()}</span>
      </span>
    </div>
  );
}

/* ── Main Export ─────────────────────────────────────────────── */
export default function ConnectionMatrix() {
  const [allConns, setAllConns] = useState([]);
  const [meta, setMeta] = useState({ total_scored_connections: 0, curated_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [era, setEra] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 8;

  useEffect(() => {
    loadCuratedConnections()
      .then((d) => {
        setAllConns(d.connections ?? []);
        setMeta({ total_scored_connections: d.total_scored_connections, curated_count: d.curated_count });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterConnections(allConns, { era: era || undefined, minScore: 5, query });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleQuery = useCallback((e) => { setQuery(e.target.value); setPage(0); }, []);
  const handleEra = useCallback((e) => { setEra(e.target.value); setPage(0); }, []);

  if (loading) {
    return (
      <div className="cm-loading">
        <span className="cm-spinner" />
        <span>Assembling the evidence board…</span>
      </div>
    );
  }
  if (error) return <div className="cm-error">Error loading connections: {error}</div>;

  return (
    <div className="cm-root">

      {/* ── Archive header ── */}
      <div className="cm-archive-header">
        <div className="cm-archive-header__top">
          <div className="cm-archive-header__label">EVIDENCE ARCHIVE</div>
          <div className="cm-archive-header__stats">
            <span><strong>{meta.total_scored_connections.toLocaleString()}</strong> pairs scored</span>
            <span className="cm-archive-header__sep">·</span>
            <span><strong>{meta.curated_count}</strong> curated by strength</span>
            <span className="cm-archive-header__sep">·</span>
            <span>Household ↔ India: <strong className="cm-no-connect">0 connections</strong> (era boundary enforced)</span>
          </div>
        </div>

        {/* Score scale */}
        <div className="cm-scale">
          <div className="cm-scale__item">
            <span className="cm-scale__pip" style={{ background: '#22d3ee' }} />
            <span>10 · Maximum (all signals)</span>
          </div>
          <div className="cm-scale__item">
            <span className="cm-scale__pip" style={{ background: '#a78bfa' }} />
            <span>7–9 · Strong</span>
          </div>
          <div className="cm-scale__item">
            <span className="cm-scale__pip" style={{ background: '#fbbf24' }} />
            <span>5–6 · Moderate</span>
          </div>
        </div>
      </div>

      {/* ── Search / filter ── */}
      <ArchiveSearch
        query={query}
        onQuery={handleQuery}
        era={era}
        onEra={handleEra}
        count={filtered.length}
        total={allConns.length}
      />

      {/* ── Evidence pairs ── */}
      {visible.length === 0 ? (
        <div className="cm-empty">
          <span>No evidence found for this search.</span>
          <span className="cm-empty__sub">Try a different search term or era filter.</span>
        </div>
      ) : (
        <div className="cm-board">
          {visible.map((c) => (
            <EvidencePair key={c.connection_id} conn={c} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="cm-pagination" role="navigation" aria-label="Page navigation">
          <button
            className="cm-page-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            aria-label="Previous page"
          >
            ← Prev
          </button>
          <span className="cm-page-info">
            {page + 1} <span className="cm-page-of">/ {totalPages}</span>
          </span>
          <button
            className="cm-page-btn"
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
