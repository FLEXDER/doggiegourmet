/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — inv-master-login.jsx
   Login del administrador con email + password (Supabase Auth).
   El cambio de sesión es detectado por InventoryPage vía
   onAuthStateChange.

   Depende de: window.supabaseClient, Icon
   Expone:    window.MasterLogin
   ============================================================ */

const { useState: useSMaster } = React;
const sbMaster = window.supabaseClient;

function MasterLogin({ onCancel }) {
  const [email, setEmail] = useSMaster('');
  const [password, setPassword] = useSMaster('');
  const [loading, setLoading] = useSMaster(false);
  const [error, setError] = useSMaster('');

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const { error: authError } = await sbMaster.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      // El cambio de sesión es manejado por onAuthStateChange en InventoryPage
    } catch (err) {
      console.error('Login error:', err);
      setError('Email o contraseña incorrectos.');
      setLoading(false);
    }
  };

  return (
    <div className="pin-gate-page">
      <div className="pin-gate-shell">
        <div className="pin-gate-card">
          <div className="pin-gate-eyebrow">
            <span className="dot" />
            <span>Administración</span>
          </div>
          <h1 className="pin-gate-title">
            Master <em>Interno</em>
          </h1>
          <p className="pin-gate-sub">
            Ingresa con tu correo y contraseña para acceder al dashboard de reportes.
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 4 }}>
            <div className="field">
              <label className="field-label"><span>Correo</span></label>
              <input
                className="field-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                disabled={loading}
                autoComplete="email" />
            </div>
            <div className="field">
              <label className="field-label"><span>Contraseña</span></label>
              <input
                className="field-input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password" />
            </div>

            {error && <div className="pin-err">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !email || !password}
              style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? 'Validando...' : <>Entrar <Icon name="arrow" size={14} /></>}
            </button>
          </form>

          <div className="pin-gate-foot">
            <Icon name="lock" size={12} />
            <span>Acceso restringido · solo administradores</span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            style={{
              marginTop: 20,
              background: 'transparent',
              border: 'none',
              color: 'var(--brown-soft)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              padding: 4
            }}>
            ← Volver al acceso de puntos de venta
          </button>
        </div>

        <div className="pin-gate-aside">
          <div className="pin-gate-aside-eyebrow">Master interno</div>
          <p>
            Esta área es solo para administradores de Doggie Gourmet. Aquí puedes ver todos los reportes de inventario enviados por los puntos de venta.
          </p>
          <div className="pin-gate-aside-list">
            <div><span>01</span> Reportes en tiempo real</div>
            <div><span>02</span> Historial completo de pedidos</div>
            <div><span>03</span> Cambia el estatus de cada reporte</div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.MasterLogin = MasterLogin;
