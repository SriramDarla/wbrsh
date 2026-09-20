import { cloneElement, isValidElement, useEffect, useState } from 'react';
import LoaderMarquee from './LoaderMarquee.jsx';
import StudioPage from './StudioPage.jsx';
import InnerPage from './pages/InnerPage.jsx';
import { PAGES } from './pages/pages.js';
import { ToastProvider } from './components/index.js';
import Showcase from './components/Showcase.jsx';

const BRAND = 'Studio'; // ← your company name

/**
 * Minimal hash-based router.
 * /          → home  (StudioPage)
 * /#<id>     → InnerPage for that id
 * /#components → component showcase (dev only)
 */
function useHashRoute() {
  const getRoute = () => {
    const h = window.location.hash.slice(1) || '';
    return h || 'home';
  };

  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

export default function App() {
  const route = useHashRoute();

  // component showcase
  if (route === 'components') {
    return (
      <ToastProvider>
        <Showcase />
      </ToastProvider>
    );
  }

  // check if this is an inner page
  const activePage = PAGES.find((p) => p.id === route) ?? null;

  // If landing directly on an inner page (deep link / refresh), skip the intro.
  const skipIntro = activePage !== null;

  const navigate = (id) => {
    if (id === 'home' || !id) {
      window.location.hash = '';
    } else {
      window.location.hash = id;
    }
  };

  // Build the page element — either home or the matched inner page
  const pageEl = activePage ? (
    <InnerPage
      brand={BRAND}
      page={activePage}
      onNavigate={navigate}
    />
  ) : (
    <StudioPage
      brand={BRAND}
      onNavigate={navigate}
    />
  );

  return (
    <ToastProvider>
      <LoaderMarquee
        brand={BRAND}
        pages={PAGES}
        activePage={activePage?.id ?? null}
        onNavigate={navigate}
        skipIntro={skipIntro}
        page={pageEl}
      />
    </ToastProvider>
  );
}
