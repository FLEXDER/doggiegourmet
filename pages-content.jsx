/* global React, PRODUCTS, CATEGORY_ORDER, Icon, EMAIL */
const { useState: useState2, useMemo: useMemo2 } = React;

function ProductsPage({ setRoute }) {
  const [active, setActive] = useState2('all');
  const cats = CATEGORY_ORDER;

  const labels = { barf: 'BARF', paletas: 'Paletas', perfumes: 'Perfumes' };

  React.useEffect(() => {
    const pending = window.__pendingCat;
    if (pending && cats.includes(pending)) {
      setActive(pending);
      window.__pendingCat = null;
      // scroll after layout
      setTimeout(() => {
        const el = document.getElementById(`cat-${pending}`);
        if (el) {
          const navOffset = 88;
          const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }, 120);
    }
  }, []);

  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="page-head-grid">
            <div>
              <div className="eyebrow">Catálogo · 15 SKUs</div>
              <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginTop: 12 }}>
                Productos gourmet <em>buenos chicos</em>.
              </h1>
            </div>
            <p className="lead" style={{ height: "80.35px" }}>Tenemos diferentes productos pensados y diseñados en los diferentes tipos de mascota y necesidades de cada una de ellas. Desde su comida, su snack y hasta el perfume para antes de que llegue visita.

            </p>
          </div>
          <div className="cat-tabs">
            <button className={`cat-tab ${active === 'all' ? 'active' : ''}`} onClick={() => setActive('all')}>
              Todo <span className="cat-tab-count">15</span>
            </button>
            {cats.map((id) =>
            <button key={id} className={`cat-tab ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
                {labels[id]} <span className="cat-tab-count">{PRODUCTS[id].items.length}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {cats.filter((id) => active === 'all' || active === id).map((id, idx) => {
          const cat = PRODUCTS[id];
          return (
            <section key={id} id={`cat-${id}`} className="cat-section" style={{ scrollMarginTop: 88 }}>
              <div className="cat-section-head">
                <div>
                  <div className="num">0{idx + 1} · {labels[id].toUpperCase()}</div>
                  <h3>{id === 'barf' ? <>Alimento <em>BARF</em></> : id === 'paletas' ? <>Paletas <em>Congeladas</em></> : <>Perfumes <em>para Mascotas</em></>}</h3>
                </div>
                <p>{cat.title}.<br />{cat.desc}</p>
              </div>
              <div className="product-grid">
                {cat.items.map((p) => <ProductCard key={p.id} p={p} category={id} />)}
              </div>
            </section>);

        })}
      </div>

      <section className="section">
        <div className="container">
          <div className="banner-inv" style={{ backgroundColor: "rgb(92, 122, 47)" }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--green-soft)' }}>¿Ya eres punto de venta?</div>
              <h2 style={{ marginTop: 14 }}>Olvídate del correo — <em>reporta tu inventario</em>.</h2>
              <p>Usa la herramienta de inventario para decirnos qué te queda en anaquel. Resurtidos más rápidos, menos llamadas.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setRoute('inventory')}>
                Abrir herramienta <Icon name="arrow" />
              </button>
            </div>
            <div className="banner-mock">
              <div className="banner-mock-head">▮ Reporte · ejemplo</div>
              <div className="banner-mock-row"><span>BARF · Original 500g</span><span>12</span></div>
              <div className="banner-mock-row"><span>BARF · Premium 500g</span><span>8</span></div>
              <div className="banner-mock-row"><span>Paleta · Plátano</span><span>20</span></div>
              <div className="banner-mock-row"><span>Perfume · Pawer Bomb</span><span>5</span></div>
            </div>
          </div>
        </div>
      </section>
    </>);

}

function ProductCard({ p, category }) {
  const imgClass = category === 'perfumes' ? 'product-img tall' : category === 'paletas' ? 'product-img paleta' : 'product-img';
  const tagClass = category === 'barf' ? 'product-tag green' : 'product-tag';
  return (
    <article className="product-card">
      <div className={imgClass}>
        <span className={tagClass}>{p.tag}</span>
        <img src={p.img} alt={p.name} />
      </div>
      <div className="product-body">
        <div className="product-name">{p.name}</div>
        <p className="product-desc">{p.desc}</p>
        <div className="product-foot">
          <span className="product-size">{p.size}</span>
          <button className="product-arrow" aria-label="Detalle"><Icon name="arrow" size={14} /></button>
        </div>
      </div>
    </article>);

}

function AboutPage({ setRoute }) {
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="page-head-grid">
            <div>
              <div className="eyebrow">Nosotros</div>
              <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginTop: 12 }}>
                Comida real <em>para quienes más quieres</em>.
              </h1>
            </div>
            <p className="lead">Doggie Gourmet nació en una pequeña cocina en Guadalajara en 2022. Todo empezó con una decisión: alimentar mejor a quienes más queremos.

            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="about-hero">
          <div>
            <div className="eyebrow">Nuestra promesa</div>
            <h2 className="h-section" style={{ marginTop: 12 }}>Comida <em>que reconoces</em>. Cariño <em>que merecen</em>.</h2>
            <p className="lead" style={{ marginTop: 20 }}>Cada receta se diseña junto a nutriólogos veterinarios, se prepara en lotes pequeños y se congela el mismo día. Sin conservadores. Solo ingredientes reales en las proporciones correctas.

            </p>
            <p className="lead" style={{ marginTop: 14 }}>
              Vendemos exclusivamente a través de veterinarias y pet shops porque queremos que la comida sea recomendada, no solo comprada.
            </p>
          </div>
          <div
            className="about-img-block about-img-photo"
            role="img"
            aria-label="Carne fresca preparada para alimentación BARF"
            style={{
              backgroundImage: "url('assets/about/transicion-barf.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'transparent'
            }}>
          </div>
        </div>
      </div>

      <section className="section section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Valores</div>
              <h2 className="h-section" style={{ marginTop: 12 }}>Tres cosas, <em>no negociables</em>.</h2>
            </div>
          </div>
          <div className="about-values">
            <div className="about-value">
              <div className="num">VAL · 01</div>
              <h4>Ingredientes <em>reales, siempre</em></h4>
              <p>Si el ingrediente no nos lo comeríamos nosotros, no entra. Carnes de origen único. Verduras reales. Cero subproductos.</p>
            </div>
            <div className="about-value">
              <div className="num">VAL · 02</div>
              <h4>Lento, <em>a mano</em></h4>
              <p>Lotes pequeños, todos los días. Congelamos en horas para que abras lo mismo que preparamos.</p>
            </div>
            <div className="about-value">
              <div className="num">VAL · 03</div>
              <h4>Honesto, <em>sin excepciones</em>.</h4>
              <p>Si un lote sale corto, te avisamos. Si una receta cambia, te decimos. La salud de tu mascota se toma en serio.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Proceso</div>
              <h2 className="h-section" style={{ marginTop: 12 }}>De la <em>cocina</em> al plato.</h2>
            </div>
          </div>
          <div className="about-process">
            <div className="process-step">
              <div className="step">PASO · 01</div>
              <h5>Origen</h5>
              <p>Carnes y verduras locales, entregadas a diario por proveedores que conocemos por nombre.</p>
            </div>
            <div className="process-step">
              <div className="step">PASO · 02</div>
              <h5>Formulación</h5>
              <p>Recetas balanceadas por nutriólogos veterinarios según etapa de vida y tamaño.</p>
            </div>
            <div className="process-step">
              <div className="step">PASO · 03</div>
              <h5>Porcionado</h5>
              <p>Porcionado a mano la misma mañana en empaques resellables grado alimenticio.</p>
            </div>
            <div className="process-step">
              <div className="step">PASO · 04</div>
              <h5>Congelado y envío</h5>
              <p>Congelado a −18 °C, enviado en cadena fría a veterinarias y pet shops del país.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container">
          <div className="banner-inv" style={{ backgroundColor: "rgb(92, 122, 47)" }}>
            <div>
              <div className="eyebrow" style={{ color: 'var(--green-soft)' }}>Vende nuestra línea</div>
              <h2 style={{ marginTop: 14 }}>Sé un <em>punto de venta</em>.</h2>
              <p>Trabajamos con veterinarias, pet shops y distribuidores que se preocupan por lo que recomiendan. Cuéntanos sobre tu negocio y te respondemos en 48 horas.</p>
              <button className="btn btn-primary btn-lg" onClick={() => setRoute('contact')}>
                Contáctanos <Icon name="arrow" />
              </button>
            </div>
            <div className="banner-mock">
              <div className="banner-mock-head">▮ Programa de distribuidores</div>
              <div className="banner-mock-row"><span>Margen mayorista</span><span>hasta 38%</span></div>
              <div className="banner-mock-row"><span>Pedido mínimo</span><span>20 unidades</span></div>
              <div className="banner-mock-row"><span>Frecuencia de resurtido</span><span>semanal</span></div>
              <div className="banner-mock-row"><span>Kit de marketing</span><span>incluido</span></div>
              <div className="banner-mock-row"><span>Onboarding</span><span>48h</span></div>
            </div>
          </div>
        </div>
      </section>
    </>);

}

window.ProductsPage = ProductsPage;
window.AboutPage = AboutPage;