/* global React */
/* ============================================================
   DOGGIE GOURMET — pages-inv.jsx
   Orquestador root del módulo de inventario.
   Máquina de estados de autenticación:
   - Sin sesión, modo POS    → PinGate
   - Sin sesión, modo Master → MasterLogin
   - Con sesión POS (PIN OK) → PosReportForm
   - Con sesión Master (auth) → MasterDashboard

   Este archivo SE CARGA AL FINAL de los inv-* y referencia
   los componentes vía window.* (todos cargados antes).

   Depende de: window.supabaseClient, window.PinGate,
              window.MasterLogin, window.PosReportForm,
              window.MasterDashboard
   Expone:    window.InventoryPage
   ============================================================ */

const { useState: useSRoot, useEffect: useERoot } = React;
const sbRoot = window.supabaseClient;

function InventoryPage() {
  const [posProfile, setPosProfile] = useSRoot(null);
  const [masterSession, setMasterSession] = useSRoot(undefined); // undefined = aún cargando
  const [showMasterLogin, setShowMasterLogin] = useSRoot(false);

  // Detecta sesión activa de master al cargar y se suscribe a cambios
  useERoot(() => {
    sbRoot.auth.getSession().then(({ data }) => {
      setMasterSession(data.session || null);
    });
    const { data: { subscription } } = sbRoot.auth.onAuthStateChange((_event, session) => {
      setMasterSession(session || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Aliases locales para legibilidad
  const PinGate = window.PinGate;
  const MasterLogin = window.MasterLogin;
  const PosReportForm = window.PosReportForm;
  const MasterDashboard = window.MasterDashboard;

  // Estado: cargando sesión inicial
  if (masterSession === undefined) {
    return (
      <div className="pin-gate-page">
        <div className="pin-gate-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="pin-gate-card" style={{ textAlign: 'center', padding: 60, minWidth: 280 }}>
            <p style={{ color: 'var(--brown-soft)', fontSize: 14 }}>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Estado: master con sesión activa
  if (masterSession) {
    return (
      <MasterDashboard
        session={masterSession}
        onLogout={async () => { await sbRoot.auth.signOut(); }} />
    );
  }

  // Estado: POS con PIN ya validado
  if (posProfile) {
    return <PosReportForm profile={posProfile} onLogout={() => setPosProfile(null)} />;
  }

  // Estado: usuario en pantalla de login master
  if (showMasterLogin) {
    return <MasterLogin onCancel={() => setShowMasterLogin(false)} />;
  }

  // Estado por defecto: PIN gate del POS
  return (
    <PinGate
      onUnlock={setPosProfile}
      onMasterClick={() => setShowMasterLogin(true)} />
  );
}

window.InventoryPage = InventoryPage;
