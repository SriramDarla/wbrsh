import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import './LoaderMarquee.css';
import { Navbar } from './components/index.js';

const DEFAULT_ITEMS = [
  'Creative brand studio',
  'Create, refresh and boost',
  'Design · Strategy · Motion',
  'Open for new projects',
];

// Phase order matters: each phase ADDS its class to the previous ones.
const PHASES = ['loading', 'band', 'open', 'settled', 'done', 'nav'];

/** A small label that trails the mouse pointer. On touch screens CSS pins it above the band. */
function CursorHint({ label }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(hover: none)').matches) return undefined;

    let raf = 0;
    let running = false;
    let seen = false;
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;

    const tick = () => {
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x + 18}px, ${y + 18}px, 0)`;
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        seen = true;
        x = tx;
        y = ty;
        el.classList.add('is-on');
      }
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="lm-cursor" ref={ref} aria-hidden="true">
      {label}
    </div>
  );
}

/**
 * The info drawer – slides in from the right.
 * pages  – array of {id, title} entries from PAGES
 * active – the current page id (or null = home)
 * onNav  – called with an id to navigate
 */
function InfoDrawer({ pages, active, isOpen, onClose, onNav }) {
  const drawerRef = useRef(null);

  // Trap focus inside the drawer when open; restore on close
  useEffect(() => {
    if (!isOpen) return;
    const el = drawerRef.current;
    if (!el) return;

    // Focus the close button when the drawer opens
    const close = el.querySelector('.lm-drawer-close');
    close?.focus();

    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = [...el.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* dim overlay */}
      <div
        className={`lm-drawer-overlay${isOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* drawer panel */}
      <aside
        ref={drawerRef}
        className={`lm-drawer${isOpen ? ' is-open' : ''}`}
        aria-label="Navigation menu"
        aria-modal="true"
        role="dialog"
      >
        {/* header */}
        <div className="lm-drawer-head">
          <span className="lm-drawer-label">Menu</span>
          <button
            type="button"
            className="lm-drawer-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        {/* page list */}
        <nav aria-label="Site pages">
          <ul className="lm-drawer-list">
            {pages.map((p, i) => (
              <li key={p.id} className="lm-drawer-item">
                <button
                  type="button"
                  className={`lm-drawer-link${active === p.id ? ' is-active' : ''}`}
                  onClick={() => { onNav(p.id); onClose(); }}
                >
                  <span className="lm-drawer-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="lm-drawer-title">{p.title}</span>
                  <span className="lm-drawer-arrow" aria-hidden="true">→</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

/**
 * Core loading + marquee sequence.
 * Remounting (via `key`) restarts the whole sequence.
 */
function Sequence({ items, brand, hint, loadMs, speed, reduced, skipIntro, onDone, onNav, onInfo, onInfoPanel }) {
  // Lock skip at mount time — we never want prop changes after mount to re-run the animation.
  const initialSkip = useRef(reduced || skipIntro);
  const skip = initialSkip.current;
  const [phase, setPhase] = useState(skip ? 'done' : 'loading');
  const [progress, setProgress] = useState(skip ? 100 : 0);

  const trackRef = useRef(null);
  const groupRef = useRef(null);
  const animRef = useRef(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const onNavRef = useRef(onNav);
  onNavRef.current = onNav;

  /* ---- loading sequence: bar → band → split open → dock ---- */
  useEffect(() => {
    if (skip) {
      onDoneRef.current?.();
      return undefined;
    }

    let cancelled = false;
    let raf = 0;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const startMarquee = () => {
      const track = trackRef.current;
      const group = groupRef.current;
      if (!track || !group) return;
      const width = group.getBoundingClientRect().width;
      animRef.current = track.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
        { duration: (width / speed) * 1000, iterations: Infinity }
      );
    };

    const ramp = (from, to, ms) => {
      const start = performance.now();
      const frame = (now) => {
        const k = Math.min((now - start) / ms, 1);
        if (animRef.current) {
          animRef.current.playbackRate = from + (to - from) * (1 - Math.pow(1 - k, 3));
        }
        if (k < 1 && !cancelled) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    (async () => {
      await Promise.race([document.fonts?.ready, wait(1200)]);
      if (cancelled) return;
      startMarquee();
      await wait(250);
      if (cancelled) return;

      // 1. bar fills, skipping logo gap
      const t0 = performance.now();
      await new Promise((resolve) => {
        const frame = (now) => {
          if (cancelled) return resolve();
          const t = Math.min((now - t0) / loadMs, 1);
          // eased version of t
          const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          setProgress(eased * 100);
          if (t < 1) raf = requestAnimationFrame(frame);
          else resolve();
        };
        raf = requestAnimationFrame(frame);
      });
      if (cancelled) return;
      setProgress(100);
      await wait(350);
      if (cancelled) return;

      // 2. line thickens into marquee band
      if (animRef.current) animRef.current.playbackRate = 10;
      setPhase('band');
      await wait(1000);
      if (cancelled) return;

      // 3. loader splits open around the band
      setPhase('open');
      await wait(650);
      if (cancelled) return;

      // 4. band settles; marquee slows to resting speed
      setPhase('settled');
      ramp(10, 1, 2600);
      await wait(1100);
      if (cancelled) return;

      // 5. done
      setPhase('done');
      onDoneRef.current?.();
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      animRef.current?.cancel();
      animRef.current = null;
    };
  }, [loadMs, speed]); // skip is locked to mount-time value via ref — intentionally omitted

  /* ---- click anywhere → band travels to top → nav ---- */
  useEffect(() => {
    if (phase !== 'done') return undefined;

    const toNav = () => {
      setPhase('nav');
      onNavRef.current?.();
      window.setTimeout(() => animRef.current?.pause(), 800);
    };
    const onClick = (e) => {
      if (e.target.closest?.('.lm-replay')) return;
      toNav();
    };
    const onKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === document.body) {
        e.preventDefault();
        toNav();
      }
    };

    window.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [phase]);

  const step = PHASES.indexOf(phase);
  const className = [
    'lm-seq',
    step >= 1 && 'is-band',
    step >= 2 && 'is-open',
    step >= 3 && 'is-settled',
    step >= 4 && 'is-done',
    step >= 5 && 'is-nav',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      {/* The loader panels that split apart */}
      <div className="lm-loader" aria-hidden="true">
        <div className="lm-panel lm-panel--top" />
        <div className="lm-panel lm-panel--bottom" />

        {/* Company name in the centre of the loader */}
        <div className="lm-loader-brand" aria-label={brand}>
          {brand}
        </div>

        {/* The split progress bar: left segment + right segment around the name */}
        <div className="lm-bar-wrap" aria-hidden="true">
          <div className="lm-bar lm-bar--left" style={{ transform: `scaleX(${progress / 100})` }} />
          <div className="lm-bar lm-bar--right" style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
      </div>

      {/* The marquee / nav band */}
      <div className="lm-band" style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}>
        <div className="lm-track" ref={trackRef}>
          {[0, 1].map((g) => (
            <div
              className="lm-group"
              key={g}
              ref={g === 0 ? groupRef : undefined}
              aria-hidden={g === 1 ? true : undefined}
            >
              {[0, 1].flatMap((rep) =>
                items.map((text, i) => (
                  <span className="lm-item" key={`${rep}-${i}`}>
                    {text}
                    <i className="lm-dot" />
                  </span>
                ))
              )}
            </div>
          ))}
        </div>

        {/* Nav bar (hidden until the band has docked at the top) */}
        <Navbar
          className="lm-nav"
          left={
            <a
              className="lm-brand"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
              }}
            >
              {brand}
            </a>
          }
          right={
            <div className="lm-nav-actions">
              <button className="lm-info" type="button" onClick={onInfoPanel}>
                <span className="lm-plus" aria-hidden="true">+</span>
                Info
              </button>
              <button className="lm-info" type="button" onClick={onInfo}>
                <span className="lm-plus" aria-hidden="true">+</span>
                Nav
              </button>
            </div>
          }
        />
      </div>

      {step >= 4 && <CursorHint label={hint} />}
    </div>
  );
}

/* ================================================================
   Info Panel component
================================================================ */

/**
 * "+ Info" top drop-down panel.
 * Slides down from behind the navbar with a translucent pink background.
 * Edit INFO_CONTENT below to populate it.
 */
const INFO_CONTENT = {
  tagline: 'A creative studio built at the intersection of design and technology.',
  about:
    'We partner with founders, brands and product teams to craft identities, digital experiences and motion work that people actually remember. Every project starts with a problem worth solving.',
  links: [
    { label: 'Instagram',  href: '#' },
    { label: 'LinkedIn',   href: '#' },
    { label: 'Dribbble',   href: '#' },
    { label: 'Read.cv',    href: '#' },
  ],
  contact: 'hello@example.com',
};

function InfoPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* backdrop – click to close */}
      <div
        className={`lm-panel-overlay${isOpen ? ' is-open' : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* the drop-down */}
      <div
        ref={panelRef}
        className={`lm-info-panel${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-label="Site information"
        aria-modal="true"
      >
        <div className="lm-info-panel__inner">
          {/* tagline */}
          <p className="lm-info-panel__tagline">{INFO_CONTENT.tagline}</p>

          {/* about */}
          <p className="lm-info-panel__body">{INFO_CONTENT.about}</p>

          <div className="lm-info-panel__cols">
            {/* links */}
            <div>
              <h3 className="lm-info-panel__heading">Connect</h3>
              <ul className="lm-info-panel__links">
                {INFO_CONTENT.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label} ↗</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* contact */}
            <div>
              <h3 className="lm-info-panel__heading">Contact</h3>
              <a className="lm-info-panel__mail" href={`mailto:${INFO_CONTENT.contact}`}>
                {INFO_CONTENT.contact}
              </a>
            </div>
          </div>

          {/* close */}
          <button
            type="button"
            className="lm-info-panel__close"
            onClick={onClose}
            aria-label="Close info panel"
          >
            Close ×
          </button>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   Public component
================================================================ */
export default function LoaderMarquee({
  headline = 'Create, refresh and boost',
  brand = 'Studio',
  hint = 'Click anywhere',
  items = DEFAULT_ITEMS,
  loadMs = 2800,
  speed = 110,
  page,
  pages = [],          // array of { id, title } from PAGES
  activePage = null,   // current page id (null = home)
  onNavigate,          // (id) => void
  onInfo,              // override for "+ Nav" (defaults to open the side drawer)
  skipIntro = false,   // true = skip the loader animation (used on deep-linked pages)
}) {
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const skip = reduced || skipIntro;
  const [runKey, setRunKey] = useState(0);
  const [done, setDone] = useState(skip);
  const [navigated, setNavigated] = useState(skip); // skip intro = jump straight to page
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);

  const replay = () => {
    setDone(false);
    setNavigated(false);
    setDrawerOpen(false);
    setInfoPanelOpen(false);
    setRunKey((k) => k + 1);
    window.scrollTo(0, 0);
  };

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  // "+ Nav" button = side drawer
  const handleNav = () => {
    if (onInfo) { onInfo(); return; }
    openDrawer();
  };

  // "+ Info" button = top drop-down panel
  const handleInfoPanel = () => setInfoPanelOpen((v) => !v);
  const closeInfoPanel = () => setInfoPanelOpen(false);

  const handleNavFromDrawer = (id) => {
    onNavigate?.(id);
  };

  const showPage = navigated && Boolean(page);

  return (
    <div className={showPage ? 'lm is-page' : 'lm'}>
      <div className="lm-grain" aria-hidden="true" />

      <section className="lm-hero">
        <h1 className="lm-title">{headline}</h1>
      </section>

      {showPage && (
        <main className="lm-page">
          {isValidElement(page) ? cloneElement(page, { onReplay: replay }) : page}
        </main>
      )}

      {!reduced && (
        <button className="lm-replay" type="button" onClick={replay} disabled={!done}>
          Replay intro
        </button>
      )}

      <Sequence
        key={runKey}
        items={items}
        brand={brand}
        hint={hint}
        loadMs={loadMs}
        speed={speed}
        reduced={reduced}
        skipIntro={skipIntro}
        onDone={() => setDone(true)}
        onNav={() => setNavigated(true)}
        onInfo={handleNav}
        onInfoPanel={handleInfoPanel}
      />

      {/* Side nav drawer (+ Nav) */}
      <InfoDrawer
        pages={pages}
        active={activePage}
        isOpen={drawerOpen}
        onClose={closeDrawer}
        onNav={handleNavFromDrawer}
      />

      {/* Top info drop-down (+ Info) */}
      <InfoPanel
        isOpen={infoPanelOpen}
        onClose={closeInfoPanel}
      />
    </div>
  );
}
