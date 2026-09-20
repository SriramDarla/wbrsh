import { useState, useEffect, useRef } from 'react';
import {
  loadCuratedConnections,
  loadChapters,
  fmtINR,
  fmtMs,
  fmtNum,
} from '../../services/dataService';
import './ThermalReceipt.css';

/* ── helpers ── */
const pad = (n) => String(n).padStart(2, '0');
function now8601() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function barcode(seed) {
  // Deterministic fake barcode using seed chars
  const chars = '|!|!||!!!!||!|!||!||!||!!|!|!!|!|!|!|!!!|!||!!|!||!|!|||||!|!!|!|!!|';
  let out = '';
  let pos = (seed.charCodeAt(0) ?? 42) % 10;
  for (let i = 0; i < 42; i++) {
    pos = (pos + (seed.charCodeAt(i % seed.length) ?? 7)) % chars.length;
    out += chars[pos];
  }
  return out;
}

/* ── ReceiptPrinter component ── */
function ReceiptPrinter({ conn }) {
  const { score, reasons, era, transaction: tx, spotify: sp } = conn;
  const ref = useRef(null);

  const handlePrint = () => {
    const el = ref.current;
    if (!el) return;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Life Receipt</title><style>
      body { font-family: 'Courier New', monospace; background: #fff; margin: 0; padding: 20px; }
      .receipt { max-width: 340px; margin: 0 auto; white-space: pre-wrap; }
    </style></head><body><div class="receipt">${el.innerText}</div></body></html>`);
    w.document.close();
    w.print();
  };

  const seed = conn.connection_id ?? 'default';
  const storeId = `LIFE-${seed.slice(-4).toUpperCase()}-${score}`;

  return (
    <div className="tr-wrap">
      <div className="tr-paper" ref={ref} role="article" aria-label="Life receipt">
        {/* Tear edge top */}
        <div className="tr-tear tr-tear--top" aria-hidden="true" />

        {/* Header */}
        <div className="tr-header">
          <div className="tr-logo">◈ YOUR LIFE ◈</div>
          <div className="tr-logo-sub">In Receipts</div>
          <div className="tr-store-id">{storeId}</div>
          <div className="tr-ts">{now8601()} IST</div>
        </div>

        <div className="tr-divider">- - - - - - - - - - - - - - - - - - - -</div>

        {/* Section A — Audio */}
        <div className="tr-section">
          <div className="tr-section__head">AUDIO LEDGER ♫</div>
          <div className="tr-row">
            <span className="tr-row__label">Track</span>
            <span className="tr-row__value">{sp.track?.slice(0, 28) || '???'}</span>
          </div>
          <div className="tr-row">
            <span className="tr-row__label">Artist</span>
            <span className="tr-row__value">{sp.artist?.slice(0, 28) || '???'}</span>
          </div>
          <div className="tr-row">
            <span className="tr-row__label">Album</span>
            <span className="tr-row__value tr-row__value--sm">{sp.album?.slice(0, 28) || '???'}</span>
          </div>
          <div className="tr-row">
            <span className="tr-row__label">Platform</span>
            <span className="tr-row__value">{sp.platform}</span>
          </div>
          <div className="tr-row">
            <span className="tr-row__label">Duration</span>
            <span className="tr-row__value">{fmtMs(sp.ms_played)}</span>
          </div>
          <div className="tr-row">
            <span className="tr-row__label">Timestamp</span>
            <span className="tr-row__value tr-row__value--sm">{sp.ts?.slice(0, 16)} IST</span>
          </div>
        </div>

        <div className="tr-divider">- - - - - - - - - - - - - - - - - - - -</div>

        {/* Section B — Financial */}
        <div className="tr-section">
          <div className="tr-section__head">FINANCIAL LEDGER ₹</div>
          {tx.note && (
            <div className="tr-row">
              <span className="tr-row__label">Note</span>
              <span className="tr-row__value">{tx.note.slice(0, 28)}</span>
            </div>
          )}
          {tx.merchant && (
            <div className="tr-row">
              <span className="tr-row__label">Merchant</span>
              <span className="tr-row__value">{tx.merchant.slice(0, 26)}</span>
            </div>
          )}
          <div className="tr-row">
            <span className="tr-row__label">Category</span>
            <span className="tr-row__value">{tx.category?.replace(/_/g,' ')}</span>
          </div>
          {tx.subcategory && (
            <div className="tr-row">
              <span className="tr-row__label">Sub-cat</span>
              <span className="tr-row__value">{tx.subcategory}</span>
            </div>
          )}
          {tx.amount > 0 && (
            <div className="tr-row tr-row--total">
              <span className="tr-row__label">Amount</span>
              <span className="tr-row__value">{fmtINR(tx.amount)}</span>
            </div>
          )}
          {tx.mode && (
            <div className="tr-row">
              <span className="tr-row__label">Paid via</span>
              <span className="tr-row__value">{tx.mode}</span>
            </div>
          )}
          {tx.city && (
            <div className="tr-row">
              <span className="tr-row__label">Location</span>
              <span className="tr-row__value">{tx.city}{tx.state ? `, ${tx.state}` : ''}</span>
            </div>
          )}
          <div className="tr-row">
            <span className="tr-row__label">Date</span>
            <span className="tr-row__value">{tx.date} {tx.time?.slice(0,5) ?? ''}</span>
          </div>
        </div>

        <div className="tr-divider">- - - - - - - - - - - - - - - - - - - -</div>

        {/* Co-occurrence score */}
        <div className="tr-section">
          <div className="tr-section__head">CO-OCCURRENCE SCORE</div>
          <div className="tr-score">
            <span className="tr-score__num">{score}</span>
            <span className="tr-score__denom">/12</span>
          </div>
          <div className="tr-reasons">
            {reasons.map((r, i) => (
              <div key={i} className="tr-reason">
                <span className="tr-reason__dot">✓</span>
                <span className="tr-reason__text">{r}</span>
              </div>
            ))}
          </div>
          <div className="tr-disclaimer">
            CORRELATION ≠ CAUSATION. This is a temporal
            co-occurrence only. No causal link implied.
          </div>
        </div>

        <div className="tr-divider">- - - - - - - - - - - - - - - - - - - -</div>

        {/* Barcode */}
        <div className="tr-barcode" aria-hidden="true">{barcode(seed)}</div>
        <div className="tr-barcode-num" aria-label={`Receipt ID ${storeId}`}>{storeId}</div>

        {/* Footer */}
        <div className="tr-footer">
          DATASET ERA: {era} · NON-CAUSAL · OFFLINE GENERATED
          <br />⟐ YOUR LIFE, IN RECEIPTS ⟐
        </div>

        {/* Tear edge bottom */}
        <div className="tr-tear tr-tear--bottom" aria-hidden="true" />
      </div>

      <button className="tr-print-btn" onClick={handlePrint}>🖨 Print this receipt</button>
    </div>
  );
}

/* ── Main export ── */
export default function ThermalReceipt() {
  const [conns, setConns] = useState([]);
  const [chapters, setChapters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [idx, setIdx] = useState(0);
  const [era, setEra] = useState('');

  useEffect(() => {
    Promise.all([loadCuratedConnections(), loadChapters()])
      .then(([d, ch]) => { setConns(d.connections ?? []); setChapters(ch); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = era ? conns.filter((c) => c.era === era) : conns;
  const conn = filtered[idx] ?? null;

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(filtered.length - 1, i + 1));
  const random = () => setIdx(Math.floor(Math.random() * filtered.length));

  useEffect(() => { setIdx(0); }, [era]);

  if (loading) return <div className="tr-loading"><span className="tr-spinner" />Printing receipts…</div>;
  if (error) return <div className="tr-error">Error: {error}</div>;
  if (!conn) return <div className="tr-error">No receipts found.</div>;

  const totals = chapters?.chapters ?? [];

  return (
    <div className="tr-root">
      {/* Page header */}
      <div className="tr-page-header">
        <h2 className="tr-page-title">🧾 Receipt Printer</h2>
        <p className="tr-page-sub">
          {fmtNum(filtered.length)} co-occurrence receipts · each one a real moment from the data
        </p>

        {/* Chapter totals strip */}
        <div className="tr-totals">
          {totals.map((ch) => (
            <div key={ch.id} className="tr-total-pill">
              <span className="tr-total-pill__period">{ch.period}</span>
              <span className="tr-total-pill__streams">{fmtNum(ch.streams)} streams</span>
              {ch.transactions_count && (
                <span className="tr-total-pill__tx">{fmtNum(ch.transactions_count)} receipts</span>
              )}
            </div>
          ))}
        </div>

        {/* Era filter */}
        <div className="tr-era-filter">
          {['', '2015-2018', '2022-2024'].map((e) => (
            <button
              key={e || 'all'}
              className={`tr-era-btn ${era === e ? 'is-active' : ''}`}
              onClick={() => setEra(e)}
            >
              {e || 'All Eras'}
            </button>
          ))}
        </div>
      </div>

      {/* Receipt + controls */}
      <div className="tr-stage">
        <div className="tr-controls tr-controls--left">
          <button className="tr-ctrl-btn" onClick={prev} disabled={idx === 0}>←</button>
        </div>

        <ReceiptPrinter conn={conn} key={conn.connection_id} />

        <div className="tr-controls tr-controls--right">
          <button className="tr-ctrl-btn" onClick={next} disabled={idx >= filtered.length - 1}>→</button>
        </div>
      </div>

      <div className="tr-nav-row">
        <button className="tr-ctrl-btn tr-ctrl-btn--mobile" onClick={prev} disabled={idx === 0} aria-label="Previous receipt">←</button>
        <span className="tr-nav-count">{idx + 1} / {filtered.length}</span>
        <button className="tr-random-btn" onClick={random}>🎲 Random Receipt</button>
        <button className="tr-ctrl-btn tr-ctrl-btn--mobile" onClick={next} disabled={idx >= filtered.length - 1} aria-label="Next receipt">→</button>
      </div>
    </div>
  );
}
