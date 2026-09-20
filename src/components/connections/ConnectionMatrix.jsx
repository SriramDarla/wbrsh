import { useState, useEffect, useCallback } from 'react';
import {
  loadCuratedConnections,
  filterConnections,
  fmtINR,
  fmtMs,
  scoreLabel,
} from '../../services/dataService';
import './ConnectionMatrix.css';

const SCORE_REASONS_ICONS = {
  'Same calendar day': '📅',
  'Within': '⏱️',
  'Mobile listening': '📱',
  'Commute transit': '🚉',
  'Late-night': '🌙',
  'Shared entertainment': '🎬',
  'Travel': '✈️',
  'Mobile audio in transit': '📱',
  'Monthly milestone': '💰',
};

function getReasonIcon(reason) {
  for (const [key, icon] of Object.entries(SCORE_REASONS_ICONS)) {
    if (reason.startsWith(key)) return icon;
  }
  return '●';
}

function ConnectionCard({ conn }) {
  const { score, reasons, era, transaction: tx, spotify: sp } = conn;
  const sl = scoreLabel(score);
  return (
    <article className="cm-card">
      {/* Score badge */}
      <div className="cm-card__score-row">
        <span className="cm-card__score" style={{ '--sl-color': sl.color }}>
          {score}/12
        </span>
        <span className="cm-card__score-label" style={{ color: sl.color }}>{sl.label}</span>
        <span className="cm-card__era">{era}</span>
      </div>

      {/* Two-column body */}
      <div className="cm-card__body">
        {/* Left: Spotify */}
        <div className="cm-card__col cm-card__col--spotify">
          <div className="cm-card__col-label">🎵 Spotify</div>
          <p className="cm-card__track">{sp.track || 'Unknown track'}</p>
          <p className="cm-card__artist">{sp.artist || 'Unknown artist'}</p>
          <p className="cm-card__meta">{sp.album}</p>
          <p className="cm-card__meta">{sp.platform} · {fmtMs(sp.ms_played)}</p>
          <p className="cm-card__ts">{sp.ts?.slice(0, 16).replace('T', ' ')}</p>
        </div>

        {/* Divider */}
        <div className="cm-card__divider" aria-hidden="true">⟷</div>

        {/* Right: Transaction */}
        <div className="cm-card__col cm-card__col--tx">
          <div className="cm-card__col-label">
            {tx.dataset === 'india_transact' ? '🧾 Transaction' : '🏠 Household'}
          </div>
          {tx.note && <p className="cm-card__track">{tx.note}</p>}
          {tx.merchant && <p className="cm-card__track">{tx.merchant}</p>}
          <p className="cm-card__artist">
            {tx.category?.replace(/_/g, ' ')}{tx.subcategory ? ` · ${tx.subcategory}` : ''}
          </p>
          {tx.amount && <p className="cm-card__meta">{fmtINR(tx.amount)}</p>}
          {tx.city && <p className="cm-card__meta">📍 {tx.city}{tx.state ? `, ${tx.state}` : ''}</p>}
          {tx.mode && <p className="cm-card__meta">💳 {tx.mode}</p>}
          <p className="cm-card__ts">{tx.date} {tx.time?.slice(0, 5) ?? ''}</p>
        </div>
      </div>

      {/* Reasons */}
      <ul className="cm-card__reasons">
        {reasons.map((r, i) => (
          <li key={i} className="cm-reason-pill">
            <span className="cm-reason-pill__icon">{getReasonIcon(r)}</span>
            {r}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function ConnectionMatrix() {
  const [allConns, setAllConns] = useState([]);
  const [meta, setMeta] = useState({ total_scored_connections: 0, curated_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [era, setEra] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

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

  if (loading) return <div className="cm-loading"><span className="cm-spinner" />Loading co-occurrences…</div>;
  if (error) return <div className="cm-error">Error: {error}</div>;

  return (
    <div className="cm-root">
      {/* Header */}
      <div className="cm-header">
        <h2 className="cm-header__title">Co-Occurrence Explorer</h2>
        <p className="cm-header__sub">
          <strong style={{ color: '#4ade80' }}>{meta.total_scored_connections.toLocaleString()}</strong> total scored pairs detected ·
          top <strong style={{ color: '#4ade80' }}>{meta.curated_count}</strong> curated by score · showing <strong>{filtered.length}</strong>
        </p>
        <div className="cm-header__disclaimer">
          ⚠️ Connections are temporal/contextual co-occurrences only. No causal relationship is implied or claimed.
        </div>
      </div>

      {/* Filters */}
      <div className="cm-filters">
        <input
          className="cm-search"
          type="search"
          placeholder="Search artists, tracks, notes, merchants, cities…"
          value={query}
          onChange={handleQuery}
          aria-label="Search connections"
        />
        <select className="cm-select" value={era} onChange={handleEra} aria-label="Filter by era">
          <option value="">All Eras</option>
          <option value="2015-2018">2015–2018 (Household)</option>
          <option value="2022-2024">2022–2024 (India Transact)</option>
        </select>
      </div>

      {/* Score legend */}
      <div className="cm-legend">
        <div className="cm-legend__item"><span style={{ background: '#22d3ee', borderRadius: 3 }}>◼</span> 12 = Perfect (all 5 factors)</div>
        <div className="cm-legend__item"><span style={{ color: '#a78bfa' }}>◼</span> 9–11 = Strong</div>
        <div className="cm-legend__item"><span style={{ color: '#fbbf24' }}>◼</span> 6–8 = Moderate</div>
        <div className="cm-legend__item">Household ↔ India: <strong style={{ color: '#f87171' }}>0 connections (boundary enforced)</strong></div>
      </div>

      {/* Cards grid */}
      {visible.length === 0 ? (
        <div className="cm-empty">No connections match your filters. Try a different search term.</div>
      ) : (
        <div className="cm-grid">
          {visible.map((c) => <ConnectionCard key={c.connection_id} conn={c} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="cm-pagination">
          <button className="cm-page-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>← Prev</button>
          <span className="cm-page-info">{page + 1} / {totalPages}</span>
          <button className="cm-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
