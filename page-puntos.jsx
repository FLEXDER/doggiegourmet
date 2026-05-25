/* global React */
const { useMemo: useMemoP, useState: useStateP, useEffect: useEffectP, useRef: useRefP } = React;

const LOCATIONS = [
  {
    id: 'vitalpets',
    name: 'Hospital Veterinario VitalPets',
    category: 'Hospital veterinario',
    rating: 4.5,
    reviews: 292,
    image: 'assets/locations/vitalpets.webp',
    blurb: 'Punto de venta con catálogo completo Doggie Gourmet, ideal para encontrar nuestra línea de productos en un entorno profesional y confiable.',
    inventory: 'Catálogo completo',
    featured: true,
    addressLine: 'Tepeyac',
    address: 'Av. Tepeyac 4153',
    city: 'Zapopan, Jalisco',
    phone: '33 3121 6772',
    phoneIntl: '523331216772',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hospital+Veterinario+VitalPets+Av+Tepeyac+4153+Zapopan',
  },
  {
    id: 'animalia',
    name: 'Animalia Clínica Veterinaria',
    category: 'Clínica veterinaria',
    rating: 4.4,
    reviews: 181,
    image: 'assets/locations/animalia.webp',
    blurb: 'Punto de venta con catálogo completo Doggie Gourmet dentro de una clínica veterinaria de confianza en la zona de Francisco Villa.',
    inventory: 'Catálogo completo',
    featured: true,
    addressLine: 'Francisco Villa',
    address: 'Av. Valdepeñas 2796',
    city: 'Zapopan, Jalisco',
    phone: '33 3834 9935',
    phoneIntl: '523338349935',
    maps: 'https://www.google.com/maps/search/?api=1&query=Animalia+Cl%C3%ADnica+Veterinaria+Av+Valdepe%C3%B1as+2796+Zapopan',
  },
  {
    id: 'wuftown',
    name: 'Wuftown',
    category: 'Estética canina + cafetería',
    rating: 5.0,
    reviews: 22,
    image: 'assets/locations/wuftown.webp',
    blurb: 'Un espacio pet friendly donde puedes encontrar productos Doggie Gourmet mientras cuidas y consientes a tu mascota.',
    inventory: 'Solo paletas',
    addressLine: 'Colonia Americana',
    address: 'C. José María Morelos 1862',
    city: 'Guadalajara, Jalisco',
    phone: '33 1900 8078',
    phoneIntl: '523319008078',
    maps: 'https://www.google.com/maps/search/?api=1&query=Wuftown+pet+salon+coffee+Morelos+1862+Guadalajara',
  },
  {
    id: 'venelatto',
    name: 'Venelatto',
    category: 'Heladería',
    rating: 4.6,
    reviews: 38,
    image: 'assets/locations/venelatto.webp',
    blurb: 'Disfruta de una buena nieve mientras tu perro hace lo mismo con nuestras paletas Doggie Gourmet.',
    inventory: 'Solo paletas',
    addressLine: 'Plaza Terranova',
    address: 'Herrera y Cairo 2810, Local J4–J5',
    city: 'Guadalajara, Jalisco',
    phone: '33 1880 9946',
    phoneIntl: '523318809946',
    maps: 'https://www.google.com/maps/search/?api=1&query=Venelatto+Plaza+Terranova+Herrera+y+Cairo+2810+Guadalajara',
  },
  {
    id: 'paleteria-michoacana',
    name: 'Paletería La Michoacana',
    category: 'Heladería',
    rating: 4.3,
    reviews: 32,
    image: 'assets/locations/paleteria-michoacana.webp',
    blurb: 'Un clásico de Lomas Universidad para refrescarte con paletas, nieves y aguas frescas, ahora también con paletas Doggie Gourmet para tu perro.',
    inventory: 'Solo paletas',
    addressLine: 'Lomas Universidad',
    address: 'Rosario Castellanos 6042, Local 4',
    city: 'Zapopan, Jalisco',
    phone: '33 1833 9592',
    phoneIntl: '523318339592',
    maps: 'https://www.google.com/maps/search/?api=1&query=Paleter%C3%ADa+La+Michoacana+Rosario+Castellanos+6042+Lomas+Universidad+Zapopan',
  },
  {
    id: 'gran-michoacana',
    name: 'La Gran Michoacana',
    category: 'Heladería',
    rating: 4.8,
    reviews: 18,
    image: 'assets/locations/gran-michoacana.webp',
    blurb: 'Paletas, nieves y aguas frescas para toda la familia, incluyendo nuestras paletas Doggie Gourmet para los más consentidos de cuatro patas.',
    inventory: 'Solo paletas',
    addressLine: 'Rinconada de la Calma',
    address: 'Av. Conchita s/n',
    city: 'Zapopan, Jalisco',
    phone: '33 1610 7317',
    phoneIntl: '523316107317',
    maps: 'https://www.google.com/maps/search/?api=1&query=La+Gran+Michoacana+Av+Conchita+Rinconada+de+la+Calma+Zapopan',
  },
  {
    id: 'hielito-lindo',
    name: 'Hielito Lindo Nieve de Garrafa',
    category: 'Heladería',
    rating: 4.9,
    reviews: 96,
    image: 'assets/locations/hielito-lindo.webp',
    blurb: 'Nieve de garrafa artesanal en Plaza de Asís, ahora también con paletas Doggie Gourmet para que tu perro se anime al paseo.',
    inventory: 'Solo paletas',
    addressLine: 'Plaza de Asís',
    address: 'Av. Inglaterra 6765',
    city: 'Zapopan, Jalisco',
    phone: '33 2615 6494',
    phoneIntl: '523326156494',
    maps: 'https://www.google.com/maps/search/?api=1&query=Hielito+Lindo+Nieve+De+Garrafa+Av+Inglaterra+6765+Plaza+de+Asis+Zapopan',
  },
];

function StarRow({ rating }) {
  // Render 5 stars: full / half / empty based on rating value
  const stars = [];
  for (let i = 0; i < 5; i++) {
    const diff = rating - i;
    let fill;
    if (diff >= 1) fill = 1;
    else if (diff >= 0.5) fill = 0.5;
    else fill = 0;
    stars.push(
      <svg key={i} className="puntos-star" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id={`s-${i}-${rating}`}>
            <stop offset={`${fill * 100}%`} stopColor="#1F1F1F"/>
            <stop offset={`${fill * 100}%`} stopColor="rgba(31,31,31,0.18)"/>
          </linearGradient>
        </defs>
        <path
          fill={`url(#s-${i}-${rating})`}
          d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
        />
      </svg>
    );
  }
  return <span className="puntos-stars">{stars}</span>;
}

function LocationCard({ loc, index }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address + ', ' + loc.city)}`;
  return (
    <article className={`puntos-card ${loc.featured ? 'is-featured' : ''}`} data-index={index}>
      {loc.featured && <span className="puntos-badge">Catálogo completo</span>}
      <div
        className="puntos-card-img"
        style={{ backgroundImage: `url('${loc.image}')` }}
        role="img"
        aria-label={loc.name}
      />
      <div className="puntos-card-body">
        <div className="puntos-card-cat">{loc.category}</div>
        <h3 className="puntos-card-name">{loc.name}</h3>
        <div className="puntos-rating">
          <StarRow rating={loc.rating}/>
          <span className="puntos-rating-num">{loc.rating.toFixed(1)}</span>
          <span className="puntos-rating-count">· {loc.reviews} opiniones</span>
        </div>
        <p className="puntos-card-blurb">{loc.blurb}</p>
        <div className="puntos-card-meta">
          <div className="puntos-meta-row">
            <span className="puntos-meta-label">Disponibilidad</span>
            <span className="puntos-meta-value">{loc.inventory}</span>
          </div>
          <div className="puntos-meta-row">
            <span className="puntos-meta-label">Dirección</span>
            <span className="puntos-meta-value">
              {loc.addressLine ? <em className="puntos-meta-em">{loc.addressLine} · </em> : null}
              {loc.address}
              <br/>
              {loc.city}
            </span>
          </div>
          <div className="puntos-meta-row">
            <span className="puntos-meta-label">Teléfono</span>
            <a className="puntos-meta-value puntos-phone" href={`tel:+${loc.phoneIntl}`}>{loc.phone}</a>
          </div>
        </div>
        <div className="puntos-actions">
          <a className="puntos-btn puntos-btn-primary" href={directions} target="_blank" rel="noopener noreferrer">
            Cómo llegar
          </a>
          <a className="puntos-btn puntos-btn-secondary" href={loc.maps} target="_blank" rel="noopener noreferrer">
            Ver en Google Maps
          </a>
        </div>
      </div>
    </article>
  );
}

function PuntosVentaPage({ setRoute }) {
  const stats = useMemoP(() => ({
    locations: LOCATIONS.length,
    cities: new Set(LOCATIONS.map(l => l.city.split(',')[1].trim())).size,
  }), []);

  // Tracking del slide activo para los dots del carrusel mobile.
  // Usa IntersectionObserver sobre el grid container; el card que ocupa
  // más del 60% del viewport horizontal se considera activo.
  const gridRef = useRefP(null);
  const [activeIdx, setActiveIdx] = useStateP(0);

  useEffectP(() => {
    const grid = gridRef.current;
    if (!grid) return;
    // Solo activamos el observer en mobile (los dots solo se muestran <720px).
    // En desktop el grid es estático y no aplica.
    if (window.matchMedia('(min-width: 721px)').matches) return;

    const cards = grid.querySelectorAll('.puntos-card');
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          const idx = parseInt(entry.target.dataset.index, 10);
          if (!isNaN(idx)) setActiveIdx(idx);
        }
      });
    }, {
      root: grid,
      threshold: [0.6]
    });

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="puntos-page">
      {/* Hero */}
      <section className="puntos-hero">
        <div className="container">
          <div className="puntos-hero-inner">
            <div className="puntos-eyebrow">
              <span className="puntos-eyebrow-dot"/>
              Puntos de venta
            </div>
            <h1 className="puntos-h1">
              Encuéntranos <em>cerca de ti.</em>
            </h1>
            <p className="puntos-lede">
              Nuestros productos están disponibles en espacios seleccionados — lugares donde la calidad,
              el cuidado y la atención al detalle ya son parte de la conversación.
            </p>
            <div className="puntos-hero-stats">
              <div className="puntos-stat">
                <div className="puntos-stat-num">{stats.locations}</div>
                <div className="puntos-stat-lbl">Puntos de venta</div>
              </div>
              <div className="puntos-stat">
                <div className="puntos-stat-num">{stats.cities}</div>
                <div className="puntos-stat-lbl">Ciudad</div>
              </div>
              <div className="puntos-stat">
                <div className="puntos-stat-num">100%</div>
                <div className="puntos-stat-lbl">Productos naturales</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards grid + dots */}
      <section className="puntos-grid-section">
        <div className="container">
          <div className="puntos-grid" ref={gridRef}>
            {LOCATIONS.map((loc, idx) => <LocationCard key={loc.id} loc={loc} index={idx}/>)}
          </div>
          <div className="puntos-dots" role="tablist" aria-label="Indicador de slide">
            {LOCATIONS.map((_, idx) => (
              <span
                key={idx}
                className={`puntos-dot ${idx === activeIdx ? 'active' : ''}`}
                role="tab"
                aria-selected={idx === activeIdx}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Closing band */}
      <section className="puntos-closing-light">
        <div className="container">
          <div className="puntos-closing-light-inner">
            <p className="puntos-closing-light-text">
              Estamos presentes en espacios que comparten <em>nuestra forma de entender la calidad.</em>
            </p>
            <button className="puntos-closing-light-cta" onClick={() => setRoute('contact')}>
              ¿Quieres ser punto de venta? <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

window.PuntosVentaPage = PuntosVentaPage;
