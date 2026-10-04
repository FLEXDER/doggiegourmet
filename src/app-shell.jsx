import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { CartButton } from './cart-button';
import { CartDrawer } from './cart-drawer';
import { CartToast } from './cart-toast';
import { Icon } from './icon';

const NAV_ITEMS = [
{ id: 'home', label: 'Inicio' },
{ id: 'products', label: 'Productos' },
{ id: 'about', label: 'Nosotros' },
{ id: 'puntos', label: 'Puntos de venta' },
{ id: 'inventory', label: 'Reporte de Inventario' },
{ id: 'contact', label: 'Contacto' },
{ id: 'calculator', label: <>Calculadora <span translate="no">BARF</span></>, cta: true }];


export function Nav({ route, setRoute }) {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <div className="nav-brand" onClick={() => {setRoute('home');setOpen(false);}}>
            <img src="assets/brand/isotipo.png" alt="Doggie Gourmet" />
            <div>
              <div className="nav-brand-text">Doggie Gourmet</div>
              <div className="nav-brand-sub">Alimento · Estilo de vida</div>
            </div>
          </div>
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            {NAV_ITEMS.map((item) =>
            <button key={item.id}
            className={`nav-link ${item.cta ? 'nav-link-cta' : ''} ${route === item.id ? 'active' : ''}`}
            onClick={() => {setRoute(item.id);setOpen(false);}}>
                {item.label}
              </button>
            )}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CartButton onClick={() => setCartOpen(true)} />
            <button className="nav-mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menú">
              <Icon name={open ? 'x' : 'menu'} size={20} />
            </button>
          </div>
        </div>
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <CartToast suppressed={cartOpen} />
    </>);

}

export const INSTAGRAM_URL = 'https://www.instagram.com/doggie_gourmet?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';
export const EMAIL = 'doggiegourmetmx@gmail.com';

export function Footer({ setRoute }) {
  return (
    <footer className="footer" style={{ backgroundColor: "rgb(92, 122, 47)" }}>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="assets/brand/logo.png" alt="Doggie Gourmet" />
            <p>Alimento crudo premium, paletas congeladas y perfumes para mascotas — formulado por nutriólogos veterinarios para perros y gatos que merecen lo mejor.</p>
          </div>
          <div>
            <h5>Tienda</h5>
            <button className="footer-link" onClick={() => setRoute('products', 'barf')}>Alimento <span translate="no">BARF</span></button>
            <button className="footer-link" onClick={() => setRoute('products', 'paletas')}>Paletas</button>
            <button className="footer-link" onClick={() => setRoute('products', 'perfumes')}>Perfumes</button>
            <button className="footer-link" onClick={() => setRoute('calculator')}>Calculadora <span translate="no">BARF</span></button>
          </div>
          <div>
            <h5>Negocios</h5>
            <button className="footer-link" onClick={() => setRoute('inventory')}>Reportar Inventario</button>
            <button className="footer-link" onClick={() => setRoute('contact')}>Ser Distribuidor</button>
            <button className="footer-link" onClick={() => setRoute('contact')}>Mayoreo</button>
          </div>
          <div>
            <h5>Conecta</h5>
            <button className="footer-link" onClick={() => setRoute('about')}>Nosotros</button>
            <button className="footer-link" onClick={() => setRoute('contact')}>Contacto</button>
            <a className="footer-link" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="instagram" size={14} /> Instagram
            </a>
            <a className="footer-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </div>
        </div>
        <div className="footer-bot">
          <span>© 2026 Doggie Gourmet · Hecho con cariño en México</span>
          <span className="mono">v 4.2 · <span translate="no">BARF</span> · PALETAS · PERFUME</span>
        </div>
      </div>
    </footer>);

}

/**
 * Hook + componente para carruseles con scroll-snap.
 * Acopla unos dots indicadores al elemento del carrusel y permite
 * scrollear a un slide específico. Solo se renderiza en mobile.
 *
 * Uso:
 *   const ref = useRef(null);
 *   <div ref={ref} className="cat-grid">...</div>
 *   <CarouselDots targetRef={ref} count={3} />
 */
function useIsMobile(breakpoint = 720) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= breakpoint
  );
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
}

function CarouselDots({ targetRef, count, autoplayMs = 0 }) {
  const isMobile = useIsMobile();
  const [active, setActive] = useState(0);
  const userInteractedRef = useRef(false);
  const interactionTimerRef = useRef(null);

  // Tracking del scroll para actualizar el dot activo
  useEffect(() => {
    if (!isMobile) return;
    const el = targetRef.current;
    if (!el) return;

    const onScroll = () => {
      // Marcar interacción del usuario para pausar autoplay temporal
      userInteractedRef.current = true;
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = setTimeout(() => {
        userInteractedRef.current = false;
      }, 2000);

      // Determinar slide activo basado en scroll
      const slideWidth = el.scrollWidth / count;
      const currentIdx = Math.round(el.scrollLeft / slideWidth);
      setActive(Math.min(Math.max(currentIdx, 0), count - 1));
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, [isMobile, targetRef, count]);

  // Autoplay opcional
  useEffect(() => {
    if (!isMobile || !autoplayMs) return;
    const interval = setInterval(() => {
      if (userInteractedRef.current) return;
      const el = targetRef.current;
      if (!el) return;
      const next = (active + 1) % count;
      const slideWidth = el.scrollWidth / count;
      el.scrollTo({ left: next * slideWidth, behavior: 'smooth' });
    }, autoplayMs);
    return () => clearInterval(interval);
  }, [isMobile, autoplayMs, active, count, targetRef]);

  const goTo = (idx) => {
    const el = targetRef.current;
    if (!el) return;
    const slideWidth = el.scrollWidth / count;
    el.scrollTo({ left: idx * slideWidth, behavior: 'smooth' });
    userInteractedRef.current = true;
    if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    interactionTimerRef.current = setTimeout(() => {
      userInteractedRef.current = false;
    }, 4000);
  };

  if (!isMobile) return null;

  return (
    <div className="carousel-dots" role="tablist" aria-label="Navegación del carrusel">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          className={`carousel-dot ${i === active ? 'is-active' : ''}`}
          onClick={() => goTo(i)}
          role="tab"
          aria-selected={i === active}
          aria-label={`Ir al elemento ${i + 1}`}
        />
      ))}
    </div>
  );
}

export function HomePage({ setRoute }) {
  const catGridRef = useRef(null);
  const whyGridRef = useRef(null);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow-row">
              <div className="dot" />
              <span>Calcula tu dieta · Disponible en 3 puntos de venta</span>
            </div>
            <h1 className="h-display">
              Comida <br /><em>Gourmet y natural</em><br />para tu mascota.
            </h1>
            <p className="lead" style={{ marginTop: 24 }}>Somos una empresa dedicada a ofrecer alimento congelado para perros basado en la dieta <span translate="no">BARF</span>, diseñada para replicar una
alimentación natural y balanceada. Nuestro objetivo es mejorar la calidad de vida de los perritos a través de una nutrición saludable y personalizada.
            </p>
            <div className="hero-cta-row">
              <button className="btn btn-primary btn-lg" onClick={() => setRoute('products')}>
                Ver el catálogo <Icon name="arrow" />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => setRoute('calculator')}>
                Calcular porción <Icon name="calc" />
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">100%</div>
                <div className="hero-stat-lbl">Ingredientes naturales</div>
              </div>
              <div>
                <div className="hero-stat-num">15</div>
                <div className="hero-stat-lbl">Productos disponibles</div>
              </div>
              <div>
                <div className="hero-stat-num">3+</div>
                <div className="hero-stat-lbl">Puntos de venta</div>
              </div>
            </div>
          </div>

          <div className="hero-image-stack">
            <div className="hero-image-main">
              <img src="assets/products/barf-premium-500.webp" alt="Premium BARF 500g" />
            </div>
            <div className="hero-image-tag">
              <div className="hero-image-tag-dot" />
              <div className="hero-image-tag-text">
                <strong>Congelado en su punto</strong>
                <small>−18 °C · entrega en cadena fría</small>
              </div>
            </div>
            <div className="hero-image-badge">
              <div className="ico">★</div>
              <div className="lbl">Formulado por nutriólogos veterinarios desde 2024.</div>
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="strip-inner">
          {Array.from({ length: 4 }).map((_, k) =>
          <div className="strip-set" key={k} aria-hidden={k > 0 ? 'true' : undefined}>
              <span className="strip-item">100% Natural</span>
              <span className="strip-dot" />
              <span className="strip-item">Alimento <em translate="no">BARF</em></span>
              <span className="strip-dot" />
              <span className="strip-item">Paletas Congeladas</span>
              <span className="strip-dot" />
              <span className="strip-item">Perfumes <em>Pet-safe</em></span>
              <span className="strip-dot" />
              <span className="strip-item">Hecho en México</span>
              <span className="strip-dot" />
            </div>
          )}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Tres Líneas · Un Estándar</div>
              <h2 className="h-section" style={{ marginTop: 12 }}>Cada comida, premio y ritual <em>cubierto</em>.</h2>
            </div>
            <button className="section-head-link" onClick={() => setRoute('products')}>
              Ver catálogo completo <Icon name="arrow" size={14} />
            </button>
          </div>

          <div className="cat-grid" ref={catGridRef}>
            <CategoryCard num="01" title="BARF" count={5} img="assets/products/barf-original-500.webp" onClick={() => setRoute('products', 'barf')} />
            <CategoryCard num="02" title="Paletas" count={4} img="assets/products/paleta-platano.webp" onClick={() => setRoute('products', 'paletas')} />
            <CategoryCard num="03" title="Perfumes" count={6} img="assets/products/perfume-woof-girl.webp" onClick={() => setRoute('products', 'perfumes')} />
          </div>
          <CarouselDots targetRef={catGridRef} count={3} autoplayMs={5000} />
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">¿Por qué Doggie Gourmet?</div>
              <h2 className="h-section" style={{ marginTop: 12 }}>La diferencia se nota <em>en el plato</em>.</h2>
            </div>
          </div>
          <div className="why-grid" ref={whyGridRef}>
            <div className="why-cell"><div className="ico"><Icon name="leaf" /></div><h4>Ingredientes íntegros</h4><p>Carnes y verduras de origen único. Sin rellenos, subproductos ni conservadores artificiales.</p></div>
            <div className="why-cell"><div className="ico"><Icon name="shield" /></div><h4>Formulado por veterinarios</h4><p>Cada receta aprobada por nutriólogos veterinarios certificados para alimentación diaria.</p></div>
            <div className="why-cell"><div className="ico"><Icon name="snow" /></div><h4>Cadena fría</h4><p>Congelado al instante y enviado a −18 °C para que llegue tal como lo preparamos.</p></div>
            <div className="why-cell"><div className="ico"><Icon name="sparkle" /></div><h4>Lifestyle Premium</h4><p>Desde la cocina hasta el cuidado personal, con el detalle que marca la diferencia.</p></div>
          </div>
          <CarouselDots targetRef={whyGridRef} count={4} autoplayMs={5000} />
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="banner-inv" style={{ backgroundColor: "rgb(92, 122, 47)" }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--green-soft)' }}>¿No sabes cuánto darle?</div>
              <h2 style={{ marginTop: 14 }}>Calcula su porción <em>en 1 minuto</em>.</h2>
              <p>Dinos peso, edad y nivel de actividad. Te decimos cuántas bolsas necesita por quincena, por mes y cuál presentación le queda mejor.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setRoute('calculator')}>
                Abrir Calculadora <span translate="no">BARF</span> <Icon name="arrow" />
              </button>
            </div>
            <div className="banner-mock">
              <div className="banner-mock-head">▮ Ejemplo · Perro de 15 kg</div>
              <div className="banner-mock-row"><span>Gramos por día</span><span>450 g</span></div>
              <div className="banner-mock-row"><span>Producto sugerido</span><span>Original 500g</span></div>
              <div className="banner-mock-row"><span>Bolsas / quincena</span><span>14</span></div>
              <div className="banner-mock-row"><span>Bolsas / mes</span><span>27</span></div>
              <div className="banner-mock-row"><span>Entrega a domicilio</span><span>GRATIS</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== Instagram feed ============== */}
      <section className="section" style={{ paddingTop: 72, paddingBottom: 96 }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: 40
          }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              <span className="eyebrow-dot" style={{ background: 'var(--green)' }}></span>
              Instagram
            </div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>
              Síguenos en <em>@doggie_gourmet</em>
            </h2>
            <p className="lead" style={{ maxWidth: 560, color: 'var(--brown-soft)', marginBottom: 24 }}>
              Consejos, recetas y momentos con nuestros clientes de cuatro patas.
              Sé el primero en enterarte de novedades y promociones.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Ver perfil en Instagram <Icon name="arrow" size={16} />
            </a>
          </div>

          {/* Widget de Behold (feed de Instagram) */}
          <div className="ig-feed-wrap">
            <behold-widget feed-id="eAdNh8K4mRWl3EgaXtWn"></behold-widget>
          </div>
        </div>
      </section>
    </>);
}

function CategoryCard({ num, title, count, img, onClick }) {
  return (
    <div className="cat-card" onClick={onClick}>
      <img src={img} alt={title} />
      <div className="cat-card-overlay">
        <div className="cat-card-num">{num} / 03</div>
        <div className="cat-card-bottom">
          <div className="cat-card-title">{title}</div>
          <div className="cat-card-meta">
            <div className="cat-card-count">{count} productos</div>
            <div className="cat-card-arrow"><Icon name="arrow" size={16} /></div>
          </div>
        </div>
      </div>
    </div>);

}

