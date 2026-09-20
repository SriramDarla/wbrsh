import { useEffect, useRef, lazy, Suspense } from 'react';
import './InnerPage.css';

// Lazy-load the experience components so they don't block initial paint
const StoryChapters  = lazy(() => import('../components/timeline/StoryChapters.jsx'));
const ThermalReceipt = lazy(() => import('../components/receipts/ThermalReceipt.jsx'));
const ConnectionMatrix = lazy(() => import('../components/connections/ConnectionMatrix.jsx'));
const BehavioralRadar  = lazy(() => import('../components/analytics/BehavioralRadar.jsx'));

const PAGE_COMPONENTS = {
  story:       StoryChapters,
  receipts:    ThermalReceipt,
  connections: ConnectionMatrix,
  patterns:    BehavioralRadar,
};

// Archive folder labels for each module
const FOLDER_LABELS = {
  story:       'ARCHIVE · LIFE CHAPTERS',
  receipts:    'ARCHIVE · RECEIPT PRINTER',
  connections: 'ARCHIVE · CO-OCCURRENCES',
  patterns:    'ARCHIVE · BEHAVIOURAL PATTERNS',
};

const smooth = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function SuspenseFallback({ accent = '#a78bfa' }) {
  return (
    <div className="ip-suspense">
      <span className="ip-suspense__spinner" style={{ borderTopColor: accent }} />
      <span className="ip-suspense__text">Opening archive…</span>
    </div>
  );
}

const MODULE_NAV = [
  { id: 'story',       num: '01', label: 'Chapters',  icon: '◎' },
  { id: 'receipts',   num: '02', label: 'Receipts',  icon: '◈' },
  { id: 'connections',num: '03', label: 'Evidence',  icon: '⬡' },
  { id: 'patterns',   num: '04', label: 'Patterns',  icon: '◉' },
];

export default function InnerPage({ brand = 'Your Life, In Receipts', page, onReplay, onNav, onNavigate }) {
  const rootRef = useRef(null);
  const navFn = onNavigate || onNav;

  // Fade-in on scroll
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
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [page?.id]);

  if (!page) return null;

  const ExperienceComponent = PAGE_COMPONENTS[page.id] ?? null;
  const accent = page.palette?.[1] ?? '#a78bfa';
  const folderLabel = FOLDER_LABELS[page.id] ?? 'ARCHIVE FILE';

  return (
    <div className="ip" ref={rootRef}>
      {/* ── Top archive navigation index bar ── */}
      <nav className="ip-topnav" aria-label="Archive navigation">
        <button
          type="button"
          className="ip-topnav__home"
          onClick={() => navFn?.('home')}
          aria-label="Return to archive index"
        >
          ← ARCHIVE INDEX
        </button>
        <div className="ip-topnav__modules" role="tablist">
          {MODULE_NAV.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={page.id === m.id}
              className={`ip-topnav__tab ${page.id === m.id ? 'is-active' : ''}`}
              onClick={() => navFn?.(m.id)}
            >
              <span className="ip-topnav__tab-num">{m.num}</span>
              <span className="ip-topnav__tab-icon" aria-hidden="true">{m.icon}</span>
              <span className="ip-topnav__tab-label">{m.label}</span>
            </button>
          ))}
        </div>
        <div className="ip-topnav__status" aria-hidden="true">
          <span className="ip-topnav__status-dot" />
          <span className="ip-topnav__status-text">{folderLabel}</span>
        </div>
      </nav>

      {/* ── Archive folder tab ── */}
      <header className="ip-folder" style={{ '--pg-accent': accent }}>
        <div className="ip-folder__tab">
          <span className="ip-folder__label">{folderLabel}</span>
          <span className="ip-folder__icon" aria-hidden="true">{page.icon}</span>
        </div>
        <div className="ip-folder__body" data-reveal>
          <h1 className="ip-folder__title">{page.title}</h1>
          <p className="ip-folder__sub">{page.subtitle}</p>
        </div>
        {/* Top-border accent line */}
        <div className="ip-folder__accent-bar" aria-hidden="true" />
      </header>

      {/* ── Dynamic experience ── */}
      {ExperienceComponent ? (
        <Suspense fallback={<SuspenseFallback accent={accent} />}>
          <ExperienceComponent onNavigate={navFn} />
        </Suspense>
      ) : (
        <section className="ip-row ip-details" data-reveal>
          <div className="ip-cell ip-cell--main">
            <p className="ip-body">
              Content for <strong>{page.title}</strong> is coming soon.
            </p>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="ip-info" id="info">
        <div className="ip-base">
          <span>© {new Date().getFullYear()} {brand} · An Empirical Data Experience</span>
          <span className="ip-base__actions">
            {onReplay && (
              <button type="button" className="ip-textbtn" onClick={onReplay}>
                Replay intro
              </button>
            )}
            <button
              type="button"
              className="ip-textbtn"
              onClick={() => window.scrollTo({ top: 0, behavior: smooth() })}
            >
              Back to top ↑
            </button>
          </span>
        </div>
      </footer>
    </div>
  );
}
