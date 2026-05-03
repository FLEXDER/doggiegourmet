/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — inv-master-dashboard.jsx
   Orquestador del dashboard admin. Maneja:
   - Header con eyebrow, título y subtítulo dinámicos por tab
   - Tabs entre Reportes, Catálogo e Inventario
   - Logout

   Depende de: Icon, window.ReportsView, window.CatalogView,
              window.InventoryView
   Expone:    window.MasterDashboard
   ============================================================ */

const { useState: useSDash } = React;

function MasterDashboard({ session, onLogout }) {
  const [view, setView] = useSDash('reports'); // 'reports' | 'catalog' | 'inventory'

  // Profile sintético del master (no viene de tabla, viene de auth)
  const profile = {
    id: 'master',
    role: 'master',
    business: 'Master Interno',
    contact: (session && session.user && session.user.email) || 'Doggie Gourmet'
  };

  const titles = {
    reports: {
      h1: <>Reportes <em>de inventario</em></>,
      sub: 'Resumen de todos los reportes enviados por los puntos de venta. Cambia el estatus conforme avanzas en la operación.'
    },
    catalog: {
      h1: <>Catálogo <em>de productos</em></>,
      sub: 'Administra los productos disponibles. Estos productos aparecen como sugerencias en los reportes y son la base del control de inventario.'
    },
    inventory: {
      h1: <>Control <em>de inventario</em></>,
      sub: 'Lleva el inventario consignado en cada punto de venta. Registra entregas, ventas y ajustes para mantener el saldo actualizado.'
    }
  };

  const tabStyle = (active) => ({
    background: 'transparent',
    border: 'none',
    color: active ? 'var(--cream)' : 'rgba(250, 247, 242, 0.5)',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    padding: '14px 20px',
    cursor: 'pointer',
    borderBottom: active ? '2px solid var(--green)' : '2px solid transparent',
    marginBottom: -1,
    transition: 'all 0.15s ease',
    letterSpacing: '0.01em'
  });

  // Aliases locales
  const ReportsView = window.ReportsView;
  const CatalogView = window.CatalogView;
  const InventoryView = window.InventoryView;

  return (
    <div className="inv2-page master">
      <div className="inv2-master-hero">
        <div className="container">
          <div className="inv2-hero-row">
            <div>
              <div className="inv2-hero-eyebrow master">
                <span className="dot" />
                <span>Master Interno · {profile.contact}</span>
              </div>
              <h1 className="inv2-hero-title light">
                {titles[view].h1}
              </h1>
              <p className="inv2-hero-sub light">
                {titles[view].sub}
              </p>
            </div>
            <button className="inv2-logout master" onClick={onLogout}>
              <Icon name="lock" size={12} /> Salir
            </button>
          </div>

          {/* TABS */}
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 28,
            marginBottom: 4,
            borderBottom: '1px solid rgba(250, 247, 242, 0.12)',
            paddingBottom: 0,
            flexWrap: 'wrap'
          }}>
            <button onClick={() => setView('reports')} style={tabStyle(view === 'reports')}>
              Reportes
            </button>
            <button onClick={() => setView('catalog')} style={tabStyle(view === 'catalog')}>
              Catálogo
            </button>
            <button onClick={() => setView('inventory')} style={tabStyle(view === 'inventory')}>
              Inventario
            </button>
          </div>
        </div>
      </div>

      {view === 'reports' && <ReportsView />}
      {view === 'catalog' && <CatalogView />}
      {view === 'inventory' && <InventoryView />}
    </div>
  );
}

window.MasterDashboard = MasterDashboard;
