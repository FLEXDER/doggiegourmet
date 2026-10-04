import { useState as uS, useEffect as uE } from 'react';
import { AboutPage, ProductsPage } from './pages-content';
import { CalculatorPage } from './page-calculator';
import { ContactPage } from './page-contact';
import { Footer, HomePage, Nav } from './app-shell';
import { InventoryPage } from './pages-inv';
import { PuntosVentaPage } from './page-puntos';

export function App() {
  const [route, setRouteRaw] = uS(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });

  const setRoute = (r, opt) => {
    if (opt) window.__pendingCat = opt;
    setRouteRaw(r);
    window.location.hash = r;
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  };

  uE(() => {
    const onHash = () => setRouteRaw(window.location.hash.replace('#', '') || 'home');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  let Page;
  if (route === 'products') Page = <ProductsPage setRoute={setRoute}/>;
  else if (route === 'about') Page = <AboutPage setRoute={setRoute}/>;
  else if (route === 'inventory') Page = <InventoryPage setRoute={setRoute}/>;
  else if (route === 'contact') Page = <ContactPage setRoute={setRoute}/>;
  else if (route === 'calculator') Page = <CalculatorPage setRoute={setRoute}/>;
  else if (route === 'puntos') Page = <PuntosVentaPage setRoute={setRoute}/>;
  else Page = <HomePage setRoute={setRoute}/>;

  return (
    <div className="app">
      <Nav route={route} setRoute={setRoute}/>
      <div style={{flex: 1}}>{Page}</div>
      <Footer setRoute={setRoute}/>
    </div>
  );
}
