/* global React */
const { useMemo: useMemoP } = React;

const LOCATIONS = [
  {
    id: 'vitalpets',
    name: 'Hospital Veterinario VitalPets',
    category: 'Hospital veterinario',
    rating: 4.5,
    reviews: 292,
    image: 'assets/locations/vitalpets.jpg',
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
    id: 'wuftown',
    name: 'Wuftown',
    category: 'Estética canina + cafetería',
    rating: 5.0,
    reviews: 22,
    image: 'assets/locations/wuftown.jpg',
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
    image: 'assets/locations/venelatto.jpg',
    blurb: 'Disfruta de una buena nieve mientras tu perro hace lo mismo con nuestras paletas Doggie Gourmet.',
    inventory: 'Solo paletas',
    addressLine: 'Plaza Terranova',
    address: 'Herrera y Cairo 2810, Local J4–J5',
    city: 'Guadalajara, Jalisco',
    phone: '33 1880 9946',
    phoneIntl: '523318809946',
    maps: 'https://www.google.com/maps/search/?api=1&query=Venelatto+Plaza+Terranova+Herrera+y+Cairo+2810+Guadalajara',
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

function LocationCard({ loc }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address + ', ' + loc.city)}`;
  return (
    <article className={`puntos-card ${loc.featured ? 'is-featured' : ''}`}>
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

      {/* Cards grid */}
      <section className="puntos-grid-section">
        <div className="container">
          <div className="puntos-grid">
            {LOCATIONS.map((loc) => <LocationCard key={loc.id} loc={loc}/>)}
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
