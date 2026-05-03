/* global React, ReactDOM, PRODUCTS, CATEGORY_ORDER */
const { useState, useEffect, useMemo, useRef, Fragment } = React;

const Icon = ({ name, size = 16 }) => {
  const ic = {
    arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    check: <path d="M20 6 9 17l-5-5" />,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    leaf: <><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c.41 1.39.6 2.84.5 4.27c0 7-6 13-8.7 12.77z" /><path d="M2 21c0-3 1.85-5.36 5.08-6" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    snow: <><path d="M2 12h20M12 2v20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" /></>,
    sparkle: <><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6 7.7 7.7M16.3 16.3l2.1 2.1M5.6 18.4 7.7 16.3M16.3 7.7l2.1-2.1" /></>,
    box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
    menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></>,
    bldg: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8M7 3v5h8" /></>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" /></>,
    fb: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    wa: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />,
    calc: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h8" /></>,
    paw: <><circle cx="11" cy="4" r="2" /><circle cx="18" cy="8" r="2" /><circle cx="4" cy="8" r="2" /><circle cx="20" cy="16" r="2" transform="rotate(0)" /><path d="M11 12c-3 0-5 3-5 5 0 2 2 3 5 3s5-1 5-3c0-2-2-5-5-5z" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    inventory: <><path d="M3 9h18M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9M9 14h6" /></>,
    refresh: <><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3" /><path d="M21 3v6h-6M3 21v-6h6" /></>,
    cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" /></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ic[name]}
    </svg>);

};

const NAV_ITEMS = [
{ id: 'home', label: 'Inicio' },
{ id: 'products', label: 'Productos' },
{ id: 'about', label: 'Nosotros' },
{ id: 'puntos', label: 'Puntos de venta' },
{ id: 'inventory', label: 'Reporte de Inventario' },
{ id: 'contact', label: 'Contacto' },
{ id: 'calculator', label: 'Calculadora BARF', cta: true }];


function Nav({ route, setRoute }) {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  return (
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
          <window.CartButton onClick={() => setCartOpen(true)} />
          <button className="nav-mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menú">
            <Icon name={open ? 'x' : 'menu'} size={20} />
          </button>
        </div>
      </div>
      <window.CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <window.CartToast />
    </header>);

}

const INSTAGRAM_URL = 'https://www.instagram.com/doggie_gourmet?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';
const EMAIL = 'doggiegourmetmx@gmail.com';

function Footer({ setRoute }) {
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
            <button className="footer-link" onClick={() => setRoute('products', 'barf')}>Alimento BARF</button>
            <button className="footer-link" onClick={() => setRoute('products', 'paletas')}>Paletas</button>
            <button className="footer-link" onClick={() => setRoute('products', 'perfumes')}>Perfumes</button>
            <button className="footer-link" onClick={() => setRoute('calculator')}>Calculadora BARF</button>
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
          <span className="mono">v 4.2 · BARF · PALETAS · PERFUME</span>
        </div>
      </div>
    </footer>);

}

function HomePage({ setRoute }) {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="hero-eyebrow-row">
              <div className="dot" />
              <span>Calcula tu dieta · Disponible en 3 puntos de venta</span>
            </div>
            <h1 className="h-display" style={{ fontSize: "76px" }}>
              Comida <br /><em>Gourmet y natural</em><br />para tu mascota.
            </h1>
            <p className="lead" style={{ marginTop: 24 }}>Somos una empresa dedicada a ofrecer alimento congelado para perros basado en la dieta BARF, diseñada para replicar una
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

          <div className="cat-grid">
            <CategoryCard num="01" title="BARF" count={5} img="assets/products/barf-original-500.webp" onClick={() => setRoute('products', 'barf')} />
            <CategoryCard num="02" title="Paletas" count={4} img="assets/products/paleta-platano.webp" onClick={() => setRoute('products', 'paletas')} />
            <CategoryCard num="03" title="Perfumes" count={6} img="assets/products/perfume-woof-girl.webp" onClick={() => setRoute('products', 'perfumes')} />
          </div>
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
          <div className="why-grid">
            <div className="why-cell"><div className="ico"><Icon name="leaf" /></div><h4>Ingredientes íntegros</h4><p>Carnes y verduras de origen único. Sin rellenos, subproductos ni conservadores artificiales.</p></div>
            <div className="why-cell"><div className="ico"><Icon name="shield" /></div><h4>Formulado por veterinarios</h4><p>Cada receta aprobada por nutriólogos veterinarios certificados para alimentación diaria.</p></div>
            <div className="why-cell"><div className="ico"><Icon name="snow" /></div><h4>Cadena fría</h4><p>Congelado al instante y enviado a −18 °C para que llegue tal como lo preparamos.</p></div>
            <div className="why-cell"><div className="ico"><Icon name="sparkle" /></div><h4>Lifestyle Premium</h4><p>Desde la cocina hasta el cuidado personal, con el detalle que marca la diferencia.</p></div>
          </div>
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
                Abrir Calculadora BARF <Icon name="arrow" />
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

      <section className="section section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="banner-inv" style={{ background: 'var(--paper)', color: 'var(--brown)', border: '1px solid var(--line)', backgroundColor: "rgb(248, 240, 225)" }}>
            <div>
              <div className="eyebrow">Para Veterinarias · Pet Shops · Distribuidores</div>
              <h2 style={{ marginTop: 14, color: 'var(--brown)' }}>Resurte <em style={{ color: "rgb(92, 122, 47)" }}>en menos de un minuto</em>.</h2>
              <p style={{ color: 'var(--brown-soft)' }}>Compártenos tu inventario actual y la cantidad de productos que necesitas.
Te confirmamos y coordinamos la entrega.</p>
              <button className="btn btn-dark btn-lg" onClick={() => setRoute('inventory')}>
                Reportar inventario <Icon name="arrow" />
              </button>
            </div>
            <div className="banner-mock" style={{ background: 'var(--cream)', color: 'var(--brown)', border: '1px solid var(--line)' }}>
              <div className="banner-mock-head" style={{ color: 'var(--green)' }}>▮ Reporte de stock · ejemplo</div>
              <div className="banner-mock-row" style={{ borderColor: 'var(--line)' }}><span style={{ color: 'var(--brown-soft)' }}>BARF · Original 500g</span><span style={{ color: 'var(--green)' }}>12</span></div>
              <div className="banner-mock-row" style={{ borderColor: 'var(--line)' }}><span style={{ color: 'var(--brown-soft)' }}>BARF · Premium 500g</span><span style={{ color: 'var(--green)' }}>8</span></div>
              <div className="banner-mock-row" style={{ borderColor: 'var(--line)' }}><span style={{ color: 'var(--brown-soft)' }}>Paleta · Plátano</span><span style={{ color: 'var(--green)' }}>20</span></div>
              <div className="banner-mock-row" style={{ borderColor: 'var(--line)' }}><span style={{ color: 'var(--brown-soft)' }}>Perfume · Bad Pup</span><span style={{ color: 'var(--green)' }}>3</span></div>
            </div>
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

window.HomePage = HomePage;
window.Nav = Nav;
window.Footer = Footer;
window.Icon = Icon;
window.INSTAGRAM_URL = INSTAGRAM_URL;
window.EMAIL = EMAIL;
