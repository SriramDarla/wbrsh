import { useEffect, useRef, useState } from 'react';
import { PAGES } from './pages/pages.js';
import './HomePage.css';

const smooth = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

// Small diagonal arrow used on cards
const Arrow = () => (
  <svg viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true">
    <path d="M3 2v7h9M9 6l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// Four data pillars highlighting verified dataset metrics
const DATA_METRICS = [
  { metric: '149,860', label: 'Spotify Streams', detail: '11.4 Years of Listening (2013–2024)' },
  { metric: '2,461', label: 'Household Receipts', detail: 'Daily Living Ledger & Transactions (2015–2018)' },
  { metric: '9,417', label: 'India Transactions', detail: 'Multi-Facet Mobility & Lifestyle (2022–2024)' },
  { metric: '500+', label: 'Scored Co-Occurrences', detail: 'Evidence-Based Temporal Connections' },
];

/** Auto-advancing metric card cycler */
function MetricCycler({ metrics = DATA_METRICS, intervalMs = 3400 }) {
  const [current, setCurrent] = useState(0);
  const total = metrics.length;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % total), intervalMs);
    return () => clearInterval(id);
  }, [total, intervalMs]);

  return (
    <div className="pg-cycler" aria-label="Dataset highlights" aria-live="off">
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`pg-cycler__slide${i === current ? ' is-active' : ''}`}
          aria-hidden={i !== current}
        >
          <div className="pg-cycler__metric-card">
            <span className="pg-cycler__metric-tag">DATASET METRIC {String(i + 1).padStart(2, '0')}</span>
            <div className="pg-cycler__metric-val">{m.metric}</div>
            <div className="pg-cycler__metric-label">{m.label}</div>
            <div className="pg-cycler__metric-detail">{m.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------ rotating circle logo ------ */
const LOGO_TEXT = '· YOUR LIFE · IN RECEIPTS · 2013–2024 · SOUND & SPEND ';

function RotatingLogo({ text = LOGO_TEXT, size = 130 }) {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2;
  const innerR = outerR * 0.50;
  const textR = outerR * 0.72;
  const fontSize = size * 0.11;

  const pad = fontSize * 0.85;
  const vbSize = size + pad * 2;
  const circlePath = `M ${cx + pad},${cy + pad - textR} A ${textR},${textR} 0 1,1 ${cx + pad - 0.001},${cy + pad - textR}`;

  return (
    <div className="pg-logo" aria-label="Your Life, In Receipts logo" title="Your Life, In Receipts">
      <svg
        viewBox={`0 0 ${vbSize} ${vbSize}`}
        width={size}
        height={size}
        overflow="visible"
        aria-hidden="true"
      >
        <defs>
          <mask id="pg-logo-ring-mask">
            <circle cx={cx + pad} cy={cy + pad} r={outerR} fill="white" />
            <circle cx={cx + pad} cy={cy + pad} r={innerR} fill="black" />
          </mask>
          <path id="pg-logo-circle" d={circlePath} />
        </defs>

        <circle
          cx={cx + pad}
          cy={cy + pad}
          r={outerR}
          fill="#EA9DFF"
          mask="url(#pg-logo-ring-mask)"
        />

        <text
          className="pg-logo__text"
          fill="#080509"
          fontSize={fontSize}
          fontWeight="600"
          letterSpacing="0.03em"
          fontFamily="inherit"
        >
          <textPath href="#pg-logo-circle" startOffset="0%">
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

function CardStrip({ pages, onNavigate }) {
  const stripRef = useRef(null);
  const [active, setActive] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  const total = pages.length;

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const update = () => {
      const { scrollLeft, scrollWidth } = strip;
      const cardWidth = scrollWidth / total;
      const idx = Math.round(scrollLeft / cardWidth);
      setActive(Math.min(Math.max(idx, 0), total - 1));
    };
    strip.addEventListener('scroll', update, { passive: true });
    return () => strip.removeEventListener('scroll', update);
  }, [total]);

  const scrollToCard = (idx) => {
    const strip = stripRef.current;
    if (!strip) return;
    const card = strip.querySelectorAll('.pg-card')[idx];
    if (card) {
      const cardLeft = card.offsetLeft;
      strip.scrollTo({ left: cardLeft - parseInt(getComputedStyle(strip).paddingLeft || 0, 10), behavior: smooth() });
    }
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX;
    startScroll.current = stripRef.current.scrollLeft;
    stripRef.current.style.cursor = 'grabbing';
    stripRef.current.style.userSelect = 'none';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    stripRef.current.scrollLeft = startScroll.current - (e.pageX - startX.current);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (stripRef.current) {
      stripRef.current.style.cursor = 'grab';
      stripRef.current.style.userSelect = '';
    }
  };

  return (
    <section className="pg-row pg-strip-row" aria-label="Experience Modules">
      <div className="pg-cell pg-cell--side pg-strip-side">
        <div className="pg-strip-counter" aria-live="polite" aria-atomic="true">
          <span>{String(active + 1).padStart(2, '0')}</span>
          <span className="pg-strip-sep">/</span>
          <span>{String(total).padStart(2, '0')}</span>
        </div>
        <div className="pg-strip-arrows">
          <button
            id="strip-prev"
            type="button"
            className="pg-arrow-btn"
            aria-label="Previous module"
            disabled={active === 0}
            onClick={() => scrollToCard(active - 1)}
          >
            ←
          </button>
          <button
            id="strip-next"
            type="button"
            className="pg-arrow-btn"
            aria-label="Next module"
            disabled={active === total - 1}
            onClick={() => scrollToCard(active + 1)}
          >
            →
          </button>
        </div>
      </div>

      <div
        className="pg-cell pg-cell--main pg-strip-wrap"
        ref={stripRef}
        role="list"
        style={{ cursor: 'grab' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {pages.map((p, i) => (
          <button
            key={p.id}
            id={`card-${p.id}`}
            type="button"
            role="listitem"
            className="pg-card"
            onClick={() => onNavigate(p.id)}
            aria-label={`${p.title} – ${p.subtitle}`}
          >
            <div
              className={`pg-card__art pg-art pg-art--${p.art}`}
              style={{ '--c1': p.palette[0], '--c2': p.palette[1] }}
              aria-hidden="true"
            />
            <div className="pg-card__body">
              <span className="pg-card__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="pg-card__title">{p.title}</span>
              <span className="pg-card__sub">{p.subtitle}</span>
              <span className="pg-card__arrow" aria-hidden="true"><Arrow /></span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------ Home Page Content & Structure ------ */
const CONTENT = {
  statement: [
    'Your Life,',
    'In Receipts.',
    '11.4 years of sound,',
    'spending &',
    'living — visualised.',
  ],
  availability: { label: 'Temporal span', value: 'July 2013 → December 2024' },
  metrics: [
    '149,860 Spotify streams across 11.4 yrs',
    '2,461 daily household transactions',
    '9,417 multi-facet India transactions',
    '500 curated temporal co-occurrences',
  ],
  exploreLinks: [
    { label: 'Life Chapters', href: '#story' },
    { label: 'Receipt Printer', href: '#receipts' },
    { label: 'Co-Occurrences', href: '#connections' },
    { label: 'Behavioural Radar', href: '#patterns' },
  ],
  cta: 'Explore 11.4 years of digital life through sound and spending.',
  location: 'Coverage: India (Mumbai, Bengaluru, Delhi & more)',
  coordinates: '2013–2024 · Spotify + Household + India Transact',
};

export default function HomePage({ brand = 'Your Life, In Receipts', onReplay, onNavigate }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const els = rootRef.current ? rootRef.current.querySelectorAll('[data-reveal]') : [];
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="pg" ref={rootRef}>
      {/* ── Row 1: intro ── */}
      <section className="pg-row pg-intro">
        <div className="pg-cell pg-cell--side">
          <div className="pg-cycler-wrap" data-reveal style={{ '--d': '.6s' }}>
            <MetricCycler />
          </div>
        </div>

        <div className="pg-cell pg-cell--main">
          <RotatingLogo />

          <h1 className="pg-statement" data-reveal style={{ '--d': '.7s' }}>
            {CONTENT.statement.map((line, i) => (
              <span key={i} className="pg-statement__line">{line}</span>
            ))}
          </h1>
          <div className="pg-cell__foot" data-reveal style={{ '--d': '.9s' }}>
            <dl className="pg-meta">
              <div>
                <dt>{CONTENT.availability.label}</dt>
                <dd>{CONTENT.availability.value}</dd>
              </div>
            </dl>
            <span className="pg-scroll">Explore ↓</span>
          </div>
        </div>
      </section>

      {/* ── Row 2: horizontal card strip ── */}
      <CardStrip pages={PAGES} onNavigate={onNavigate} />

      {/* ── Info / dataset summary footer ── */}
      <section className="pg-info" id="info">
        <div>
          <h2 className="pg-cta" data-reveal>
            {CONTENT.cta}
          </h2>
        </div>

        <div>
          <div className="pg-cols" data-reveal>
            <div>
              <h3>Dataset Coverage</h3>
              <ul>
                <li>{CONTENT.location}</li>
                <li>{CONTENT.coordinates}</li>
              </ul>
            </div>
            <div>
              <h3>Empirical Records</h3>
              <ul>
                {CONTENT.metrics.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Experience Modules</h3>
              <ul>
                {CONTENT.exploreLinks.map((s) => (
                  <li key={s.label}>
                    <a href={s.href}>{s.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pg-base">
            <span>© {new Date().getFullYear()} {brand} · An Empirical Data Experience</span>
            <span className="pg-base__actions">
              {onReplay && (
                <button type="button" className="pg-textbtn" onClick={onReplay}>
                  Replay intro
                </button>
              )}
              <button
                type="button"
                className="pg-textbtn"
                onClick={() => window.scrollTo({ top: 0, behavior: smooth() })}
              >
                Back to top
              </button>
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
