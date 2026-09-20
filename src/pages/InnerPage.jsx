import { useEffect, useRef, lazy, Suspense } from 'react';
import './InnerPage.css';

// Lazy-load the experience components so they don't block initial paint
const StoryChapters = lazy(() => import('../components/timeline/StoryChapters.jsx'));
const ThermalReceipt = lazy(() => import('../components/receipts/ThermalReceipt.jsx'));
const ConnectionMatrix = lazy(() => import('../components/connections/ConnectionMatrix.jsx'));
const BehavioralRadar = lazy(() => import('../components/analytics/BehavioralRadar.jsx'));

const PAGE_COMPONENTS = {
  story: StoryChapters,
  receipts: ThermalReceipt,
  connections: ConnectionMatrix,
  patterns: BehavioralRadar,
};

const smooth = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function SuspenseFallback({ accent = '#a78bfa' }) {
  return (
    <div className="ip-suspense">
      <span className="ip-suspense__spinner" style={{ borderTopColor: accent }} />
      <span className="ip-suspense__text">Loading experience…</span>
    </div>
  );
}

export default function InnerPage({ brand = 'Your Life, In Receipts', page, onReplay, onNav }) {
  const rootRef = useRef(null);

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

  return (
    <div className="ip" ref={rootRef}>
      {/* ── Thin hero bar ── */}
      <header className="ip-mini-hero" style={{ '--pg-accent': accent, '--pg-bg': page.palette?.[0] }}>
        <div className="ip-mini-hero__art" data-art={page.art} aria-hidden="true" />
        <div className="ip-mini-hero__text">
          <span className="ip-mini-hero__icon">{page.icon}</span>
          <h1 className="ip-mini-hero__title" data-reveal>{page.title}</h1>
          <p className="ip-mini-hero__sub" data-reveal style={{ '--d': '.2s' }}>{page.subtitle}</p>
        </div>
      </header>

      {/* ── Dynamic experience ── */}
      {ExperienceComponent ? (
        <Suspense fallback={<SuspenseFallback accent={accent} />}>
          <ExperienceComponent />
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
