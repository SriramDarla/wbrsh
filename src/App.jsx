import { useEffect, useState } from 'react';
import LoaderMarquee from './LoaderMarquee.jsx';
import HomePage from './HomePage.jsx';
import InnerPage from './pages/InnerPage.jsx';
import { PAGES } from './pages/pages.js';
import { ToastProvider } from './components/index.js';

const BRAND = 'Your Life, In Receipts';

/**
 * Minimal hash-based router.
 * /          → home  (HomePage)
 * /#<id>     → InnerPage for that module (story, receipts, connections, patterns)
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

  // check if this is an experience page
  const activePage = PAGES.find((p) => p.id === route) ?? null;

  // If landing directly on an experience page (deep link / refresh), skip the intro.
  const skipIntro = activePage !== null;

  const navigate = (id) => {
    if (id === 'home' || !id) {
      window.location.hash = '';
    } else {
      window.location.hash = id;
    }
  };

  // Build the page element — either home or the matched experience module
  const pageEl = activePage ? (
    <InnerPage
      brand={BRAND}
      page={activePage}
      onNavigate={navigate}
    />
  ) : (
    <HomePage
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
