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

   Depende de: supabaseClient, PinGate,
              MasterLogin, PosReportForm,
              MasterDashboard
   Expone:    InventoryPage
   ============================================================ */

import { useState as useSRoot, useEffect as useERoot } from 'react';
import { MasterDashboard } from './inv-master-dashboard';
import { MasterLogin } from './inv-master-login';
import { PinGate, PosReportForm } from './inv-pos-flow';
import { supabaseClient } from './supabase-client';

const sbRoot = supabaseClient;

export function InventoryPage() {
  // { profile, pin } del POS. El PIN solo vive en memoria (se pierde al
  // recargar) y se manda a submit_inventory_report para validarlo de nuevo.
  const [posSession, setPosSession] = useSRoot(null);
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
  if (posSession) {
    return (
      <PosReportForm
        profile={posSession.profile}
        pin={posSession.pin}
        onLogout={() => setPosSession(null)} />
    );
  }

  // Estado: usuario en pantalla de login master
  if (showMasterLogin) {
    return <MasterLogin onCancel={() => setShowMasterLogin(false)} />;
  }

  // Estado por defecto: PIN gate del POS
  return (
    <PinGate
      onUnlock={(profile, pin) => setPosSession({ profile, pin })}
      onMasterClick={() => setShowMasterLogin(true)} />
  );
}

