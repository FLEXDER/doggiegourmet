/* global React, Icon, EMAIL, INSTAGRAM_URL */
const { useState: useS3, useMemo: useM3, useEffect: useE3, useRef: useR3 } = React;

/* ============================================================
   PIN PROFILES — easy to change later or swap for Supabase auth
   ============================================================ */
const PIN_PROFILES = {
  '4827': {
    id: 'vitalpets',
    role: 'pos',
    business: 'Hospital Veterinario VitalPets',
    contact: 'Maite o Dr. Mario',
    email: '',
    phone: '3313300906',
    city: 'Av. Tepeyac 4153'
  },
  '7394': {
    id: 'wuftown',
    role: 'pos',
    business: 'Wuftown',
    contact: 'Sofia',
    email: '',
    phone: '3334450519',
    city: 'C. José María Morelos 1862'
  },
  '6158': {
    id: 'venelatto',
    role: 'pos',
    business: 'Venelatto',
    contact: 'Pato',
    email: '',
    phone: '3330176961',
    city: 'Plaza Terranova, Local J4–J5'
  },
  '9063': {
    id: 'master',
    role: 'master',
    business: 'Master Interno',
    contact: 'Doggie Gourmet',
    email: '',
    phone: '',
    city: ''
  }
};

const STORAGE_KEY = 'dg_inventory_reports_v1';

/* ============================================================
   EMAIL DELIVERY — Web3Forms
   Cambia WEB3FORMS_KEY por tu access key real (web3forms.com).
   El correo llega a la cuenta que registraste en Web3Forms.
   ============================================================ */
const WEB3FORMS_KEY = '242b11d0-38a4-48f3-b031-fa3730aac48d';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/* Default product list — used as suggestions when adding rows */
const PRODUCT_SUGGESTIONS = [
  'BARF Original 500g',
  'BARF Original Perros Chicos 250g',
  'BARF Gatos 250g',
  'BARF Premium 500g',
  'BARF Original con Betabel 500g',
  'Paleta Plátano 90g',
  'Paleta Zanahoria 90g',
  'Paleta Pollo 90g',
  'Paleta Hígado 90g',
  'Perfume Bad Pup 100ml',
  'Perfume Fur Leather 100ml',
  'Perfume Dog Sauvage 100ml',
  'Perfume Woof Girl 100ml',
  'Perfume Pawer Bomb 100ml',
  'Perfume La Vie Est Woof 100ml'
];

/* ------------ Storage helpers (swap with Supabase later) ------------ */
function loadReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function saveReports(list) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
}

/* ============================================================
   ROOT — handles PIN gate and routes to POS form or Master
   ============================================================ */
function InventoryPage() {
  const [profile, setProfile] = useS3(null);

  if (!profile) {
    return <PinGate onUnlock={setProfile} />;
  }
  if (profile.role === 'master') {
    return <MasterDashboard profile={profile} onLogout={() => setProfile(null)} />;
  }
  return <PosReportForm profile={profile} onLogout={() => setProfile(null)} />;
}

/* ============================================================
   PIN GATE
   ============================================================ */
function PinGate({ onUnlock }) {
  const [pin, setPin] = useS3('');
  const [error, setError] = useS3('');
  const [shake, setShake] = useS3(false);
  const inputRefs = useR3([]);

  useE3(() => { inputRefs.current[0] && inputRefs.current[0].focus(); }, []);

  const setDigit = (idx, val) => {
    const clean = val.replace(/\D/g, '').slice(0, 1);
    const arr = pin.padEnd(4, ' ').split('');
    arr[idx] = clean || ' ';
    const next = arr.join('').replace(/ /g, '');
    setPin(next);
    setError('');
    if (clean && idx < 3) {
      inputRefs.current[idx + 1] && inputRefs.current[idx + 1].focus();
    }
    if (next.length === 4) tryUnlock(next);
  };

  const onKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
      inputRefs.current[idx - 1] && inputRefs.current[idx - 1].focus();
    }
  };

  const tryUnlock = (code) => {
    const p = PIN_PROFILES[code];
    if (p) {
      onUnlock(p);
    } else {
      setError('PIN incorrecto. Intenta de nuevo.');
      setShake(true);
      setTimeout(() => { setShake(false); setPin(''); inputRefs.current[0] && inputRefs.current[0].focus(); }, 500);
    }
  };

  return (
    <div className="pin-gate-page">
      <div className="pin-gate-shell">
        <div className="pin-gate-card">
          <div className="pin-gate-eyebrow">
            <span className="dot" />
            <span>Acceso seguro</span>
          </div>
          <h1 className="pin-gate-title">
            Reporte de <em>Inventario</em>
          </h1>
          <p className="pin-gate-sub">
            Ingresa el PIN de tu punto de venta para acceder al formulario.
          </p>

          <div className={`pin-row ${shake ? 'shake' : ''}`}>
            {[0, 1, 2, 3].map((i) =>
              <input
                key={i}
                ref={(el) => inputRefs.current[i] = el}
                className={`pin-input ${error ? 'err' : ''}`}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={pin[i] || ''}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                autoComplete="off" />
            )}
          </div>

          {error && <div className="pin-err">{error}</div>}

          <div className="pin-gate-foot">
            <Icon name="lock" size={12} />
            <span>Datos protegidos · uso interno Doggie Gourmet</span>
          </div>
        </div>

        <div className="pin-gate-aside">
          <div className="pin-gate-aside-eyebrow">¿Primera vez?</div>
          <p>
            Si eres uno de nuestros puntos de venta y no tienes tu PIN, escríbenos a <strong>{EMAIL}</strong> o por WhatsApp al <strong>+52 33 1844 0265</strong>.
          </p>
          <div className="pin-gate-aside-list">
            <div><span>01</span> Ingresa tu PIN de 4 dígitos</div>
            <div><span>02</span> Tus datos de negocio aparecen prellenados</div>
            <div><span>03</span> Captura inventario y envía el reporte</div>
          </div>
        </div>
      </div>
    </div>);

}

/* ============================================================
   POS REPORT FORM
   ============================================================ */
function PosReportForm({ profile, onLogout }) {
  const [rows, setRows] = useS3([
    { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), product: '', requested: '', notes: '' }
  ]);
  const [submitted, setSubmitted] = useS3(null);

  const updateRow = (id, key, val) => {
    setRows((r) => r.map((row) => row.id === id ? { ...row, [key]: val } : row));
  };
  const addRow = () => {
    setRows((r) => [...r, { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), product: '', requested: '', notes: '' }]);
  };
  const removeRow = (id) => {
    setRows((r) => r.length === 1 ? r : r.filter((row) => row.id !== id));
  };

  const validRows = useM3(() => rows.filter((r) => r.product.trim() && r.requested !== ''), [rows]);
  const canSubmit = validRows.length > 0;

  const [sending, setSending] = useS3(false);
  const [sendError, setSendError] = useS3('');

  const submit = async () => {
    if (!canSubmit || sending) return;
    const report = {
      id: 'rep-' + Date.now(),
      submittedAt: new Date().toISOString(),
      posId: profile.id,
      business: profile.business,
      contact: profile.contact,
      phone: profile.phone,
      city: profile.city,
      status: 'Recibido',
      items: validRows.map((r) => ({
        product: r.product.trim(),
        requested: Number(r.requested) || 0,
        notes: r.notes.trim()
      }))
    };

    // 1) Guardar en localStorage (compatibilidad con vista local)
    const all = loadReports();
    all.unshift(report);
    saveReports(all);

    // 2) Enviar correo vía Web3Forms
    setSending(true);
    setSendError('');

    const totalUds = report.items.reduce((a, b) => a + b.requested, 0);
    const fechaMx = new Date(report.submittedAt).toLocaleString('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
    const productosTxt = report.items.
      map((it, i) =>
      `${String(i + 1).padStart(2, '0')}. ${it.product} — ${it.requested} uds.${it.notes ? ' (' + it.notes + ')' : ''}`
      ).
      join('\n');

    const message =
    `REPORTE DE INVENTARIO\n` +
    `${'─'.repeat(40)}\n\n` +
    `Punto de venta: ${report.business}\n` +
    `Contacto: ${report.contact}\n` +
    `Teléfono: ${report.phone || '—'}\n` +
    `Ubicación: ${report.city || '—'}\n` +
    `Fecha: ${fechaMx}\n` +
    `ID del reporte: ${report.id.toUpperCase()}\n\n` +
    `PRODUCTOS SOLICITADOS (${report.items.length})\n` +
    `${'─'.repeat(40)}\n` +
    `${productosTxt}\n\n` +
    `Total de unidades solicitadas: ${totalUds}\n`;

    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Reporte de inventario · ${report.business}`,
          from_name: `Doggie Gourmet · ${report.business}`,
          message,
          // Campos extra (visibles en el dashboard de Web3Forms)
          negocio: report.business,
          contacto: report.contact,
          telefono: report.phone || '',
          ubicacion: report.city || '',
          total_productos: report.items.length,
          total_unidades: totalUds,
          report_id: report.id
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Error desconocido');
      }
      setSubmitted(report);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Web3Forms error:', err);
      setSendError(
        'No se pudo enviar el reporte por correo. Quedó guardado localmente. Revisa tu conexión e intenta de nuevo.'
      );
    } finally {
      setSending(false);
    }
  };

  const startNew = () => {
    setRows([{ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), product: '', requested: '', notes: '' }]);
    setSubmitted(null);
  };

  if (submitted) {
    return <PosSuccessView report={submitted} onNew={startNew} onLogout={onLogout} />;
  }

  return (
    <div className="inv2-page">
      <PosHeader profile={profile} onLogout={onLogout} />

      <div className="container">
        <div className="inv2-grid">
          {/* LOCKED BUSINESS INFO */}
          <section className="inv2-card inv2-biz-card">
            <header className="inv2-card-head">
              <div className="inv2-card-head-l">
                <span className="inv2-card-num">01</span>
                <div>
                  <h3>Datos del negocio</h3>
                  <p>Información prellenada según tu perfil. <em>Solo lectura.</em></p>
                </div>
              </div>
              <div className="inv2-locked-badge">
                <Icon name="lock" size={11} />
                <span>Bloqueado</span>
              </div>
            </header>
            <div className="inv2-card-body">
              <div className="inv2-biz-grid">
                <BizField label="Nombre del negocio" value={profile.business} />
                <BizField label="Persona de contacto" value={profile.contact} />
                <BizField label="Teléfono" value={profile.phone || '—'} />
                <BizField label="Ciudad / Ubicación" value={profile.city || '—'} full />
              </div>
            </div>
          </section>

          {/* PRODUCT ROWS */}
          <section className="inv2-card">
            <header className="inv2-card-head">
              <div className="inv2-card-head-l">
                <span className="inv2-card-num">02</span>
                <div>
                  <h3>Productos e inventario</h3>
                  <p>Agrega los productos que necesitas reportar y solicitar.</p>
                </div>
              </div>
              <div className="inv2-row-count">
                <strong>{validRows.length}</strong>
                <span>{validRows.length === 1 ? 'producto' : 'productos'}</span>
              </div>
            </header>

            <div className="inv2-card-body">
              <datalist id="dg-product-suggestions">
                {PRODUCT_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
              </datalist>

              <div className="inv2-rows">
                <div className="inv2-rows-head">
                  <span></span>
                  <span>Producto</span>
                  <span>Cantidad solicitada</span>
                  <span>Notas</span>
                  <span></span>
                </div>

                {rows.map((row, idx) =>
                <div className="inv2-prow" key={row.id}>
                    <div className="inv2-prow-num">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="inv2-prow-cell inv2-prow-product">
                      <input
                      list="dg-product-suggestions"
                      className="inv2-input"
                      placeholder="Nombre del producto"
                      value={row.product}
                      onChange={(e) => updateRow(row.id, 'product', e.target.value)} />
                    </div>
                    <div className="inv2-prow-cell" data-lbl="Cantidad solicitada">
                      <input
                      type="number"
                      min="0"
                      className="inv2-input inv2-input-num"
                      placeholder="0"
                      value={row.requested}
                      onChange={(e) => updateRow(row.id, 'requested', e.target.value)} />
                    </div>
                    <div className="inv2-prow-cell" data-lbl="Notas">
                      <input
                      className="inv2-input"
                      placeholder="Caducidad, lote, comentario…"
                      value={row.notes}
                      onChange={(e) => updateRow(row.id, 'notes', e.target.value)} />
                    </div>
                    <button
                    className="inv2-prow-remove"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    aria-label="Eliminar fila"
                    title={rows.length === 1 ? 'Mínimo una fila' : 'Eliminar producto'}>

                      <Icon name="x" size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button className="inv2-add-btn" onClick={addRow}>
                <span className="plus">+</span> Agregar producto
              </button>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="inv2-submit-bar">
            <div className="inv2-submit-info">
              <strong>{validRows.length} {validRows.length === 1 ? 'producto listo' : 'productos listos'} para enviar</strong>
              <span>{profile.business} · {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              {sendError && <span style={{ color: '#c0392b', marginTop: 6, display: 'block' }}>{sendError}</span>}
            </div>
            <button className="btn btn-primary btn-lg" disabled={!canSubmit || sending} onClick={submit}>
              {sending ? 'Enviando…' : <>Enviar reporte de inventario <Icon name="arrow" size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>);

}

function BizField({ label, value, full }) {
  return (
    <div className={`inv2-biz-field ${full ? 'full' : ''}`}>
      <div className="inv2-biz-label">{label}</div>
      <div className="inv2-biz-value">{value}</div>
    </div>);

}

function PosHeader({ profile, onLogout }) {
  return (
    <div className="inv2-hero">
      <div className="container">
        <div className="inv2-hero-row">
          <div>
            <div className="inv2-hero-eyebrow">
              <span className="dot" />
              <span>Sesión activa · {profile.business}</span>
            </div>
            <h1 className="inv2-hero-title">
              Reporte de <em>inventario</em>
            </h1>
            <p className="inv2-hero-sub">
              Captura los productos y la cantidad que solicitas. Lo recibimos en tiempo real.
            </p>
          </div>
          <button className="inv2-logout" onClick={onLogout}>
            <Icon name="lock" size={12} /> Salir
          </button>
        </div>
      </div>
    </div>);

}

function PosSuccessView({ report, onNew, onLogout }) {
  const totalRequested = report.items.reduce((a, b) => a + b.requested, 0);
  return (
    <div className="inv2-page">
      <PosHeader profile={{ business: report.business }} onLogout={onLogout} />
      <div className="container">
        <div className="inv2-success">
          <div className="inv2-success-check">
            <Icon name="check" size={32} />
          </div>
          <h2 className="inv2-success-title">
            Reporte enviado <em>correctamente.</em>
          </h2>
          <p className="inv2-success-sub">
            Recibimos tu inventario, {report.contact.split(' ')[0] || 'amig@'}. Lo procesaremos en las próximas horas y te confirmaremos el envío.
          </p>

          <div className="inv2-success-card">
            <div className="inv2-success-card-head">
              <div>
                <div className="lbl">Reporte</div>
                <div className="val mono">{report.id.toUpperCase()}</div>
              </div>
              <div>
                <div className="lbl">Fecha y hora</div>
                <div className="val">{new Date(report.submittedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</div>
              </div>
              <div>
                <div className="lbl">Punto de venta</div>
                <div className="val">{report.business}</div>
              </div>
              <div>
                <div className="lbl">Productos</div>
                <div className="val">{report.items.length} · {totalRequested} unidades solicitadas</div>
              </div>
            </div>

            <div className="inv2-success-list">
              {report.items.map((it, i) =>
                <div className="inv2-success-row" key={i}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="prod">{it.product}</span>
                  <span className="qty"><em>solicita</em> <strong>{it.requested}</strong></span>
                </div>
              )}
            </div>
          </div>

          <div className="inv2-success-actions">
            <button className="btn btn-ghost" onClick={onLogout}>Cerrar sesión</button>
            <button className="btn btn-primary" onClick={onNew}>
              Nuevo reporte <Icon name="arrow" size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>);

}

/* ============================================================
   MASTER DASHBOARD
   ============================================================ */
function MasterDashboard({ profile, onLogout }) {
  const [reports, setReports] = useS3(() => loadReports());
  const [filter, setFilter] = useS3('all');
  const [statusFilter, setStatusFilter] = useS3('all');
  const [expanded, setExpanded] = useS3(null);

  const refresh = () => setReports(loadReports());

  useE3(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const updateStatus = (id, status) => {
    const all = loadReports().map((r) => r.id === id ? { ...r, status } : r);
    saveReports(all);
    setReports(all);
  };

  const removeReport = (id) => {
    if (!window.confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) return;
    const all = loadReports().filter((r) => r.id !== id);
    saveReports(all);
    setReports(all);
  };

  const clearAll = () => {
    if (!window.confirm('¿Eliminar TODOS los reportes guardados? Esta acción no se puede deshacer.')) return;
    saveReports([]);
    setReports([]);
  };

  const visible = useM3(() => {
    return reports.filter((r) => {
      if (filter !== 'all' && r.posId !== filter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [reports, filter, statusFilter]);

  const stats = useM3(() => {
    const total = reports.length;
    const recibido = reports.filter((r) => r.status === 'Recibido').length;
    const proceso = reports.filter((r) => r.status === 'En proceso').length;
    const completado = reports.filter((r) => r.status === 'Completado').length;
    const productos = reports.reduce((a, r) => a + r.items.reduce((b, i) => b + i.requested, 0), 0);
    return { total, recibido, proceso, completado, productos };
  }, [reports]);

  return (
    <div className="inv2-page master">
      <div className="inv2-master-hero">
        <div className="container">
          <div className="inv2-hero-row">
            <div>
              <div className="inv2-hero-eyebrow master">
                <span className="dot" />
                <span>Master Interno · Vista de administración</span>
              </div>
              <h1 className="inv2-hero-title light">
                Reportes <em>de inventario</em>
              </h1>
              <p className="inv2-hero-sub light">
                Resumen de todos los reportes enviados por los puntos de venta. Cambia el estatus conforme avanzas en la operación.
              </p>
            </div>
            <button className="inv2-logout master" onClick={onLogout}>
              <Icon name="lock" size={12} /> Salir
            </button>
          </div>

          <div className="inv2-master-stats">
            <Stat label="Reportes totales" value={stats.total} />
            <Stat label="Recibidos" value={stats.recibido} accent="amber" />
            <Stat label="En proceso" value={stats.proceso} accent="blue" />
            <Stat label="Completados" value={stats.completado} accent="green" />
            <Stat label="Unidades solicitadas" value={stats.productos} />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="inv2-master-toolbar">
          <div className="inv2-master-filters">
            <FilterGroup label="Punto de venta">
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>Todos</FilterChip>
              <FilterChip active={filter === 'vitalpets'} onClick={() => setFilter('vitalpets')}>VitalPets</FilterChip>
              <FilterChip active={filter === 'wuftown'} onClick={() => setFilter('wuftown')}>Wuftown</FilterChip>
              <FilterChip active={filter === 'venelatto'} onClick={() => setFilter('venelatto')}>Venelatto</FilterChip>
            </FilterGroup>
            <FilterGroup label="Estatus">
              <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>Todos</FilterChip>
              <FilterChip active={statusFilter === 'Recibido'} onClick={() => setStatusFilter('Recibido')}>Recibido</FilterChip>
              <FilterChip active={statusFilter === 'En proceso'} onClick={() => setStatusFilter('En proceso')}>En proceso</FilterChip>
              <FilterChip active={statusFilter === 'Completado'} onClick={() => setStatusFilter('Completado')}>Completado</FilterChip>
            </FilterGroup>
          </div>
          <div className="inv2-master-tools">
            <button className="btn btn-ghost btn-sm" onClick={refresh}>
              <Icon name="arrow" size={12} /> Actualizar
            </button>
            {reports.length > 0 &&
              <button className="inv2-clear-btn" onClick={clearAll}>
                Limpiar todos
              </button>
            }
          </div>
        </div>

        {visible.length === 0 ?
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Sin reportes {reports.length > 0 ? 'con esos filtros' : 'todavía'}</h3>
            <p>{reports.length > 0 ? 'Ajusta los filtros para ver más resultados.' : 'Cuando los puntos de venta envíen su reporte, aparecerá aquí.'}</p>
          </div> :

          <div className="inv2-master-list">
            {visible.map((r) =>
            <ReportCard
              key={r.id}
              report={r}
              expanded={expanded === r.id}
              onExpand={() => setExpanded(expanded === r.id ? null : r.id)}
              onStatusChange={(s) => updateStatus(r.id, s)}
              onRemove={() => removeReport(r.id)} />

            )}
          </div>
        }
      </div>
    </div>);

}

function Stat({ label, value, accent }) {
  return (
    <div className={`inv2-stat ${accent || ''}`}>
      <div className="inv2-stat-val">{value}</div>
      <div className="inv2-stat-lbl">{label}</div>
    </div>);

}

function FilterGroup({ label, children }) {
  return (
    <div className="inv2-filter-group">
      <span className="inv2-filter-label">{label}</span>
      <div className="inv2-filter-chips">{children}</div>
    </div>);

}

function FilterChip({ active, onClick, children }) {
  return (
    <button className={`inv2-chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>);

}

function StatusBadge({ status }) {
  const map = {
    'Recibido': 'amber',
    'En proceso': 'blue',
    'Completado': 'green'
  };
  return <span className={`inv2-status ${map[status] || ''}`}><span className="dot" />{status}</span>;
}

function ReportCard({ report, expanded, onExpand, onStatusChange, onRemove }) {
  const date = new Date(report.submittedAt);
  const totalReq = report.items.reduce((a, b) => a + b.requested, 0);
  return (
    <div className={`inv2-report ${expanded ? 'open' : ''}`}>
      <button className="inv2-report-summary" onClick={onExpand}>
        <div className="inv2-report-date">
          <div className="d">{date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</div>
          <div className="t">{date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        <div className="inv2-report-biz">
          <div className="name">{report.business}</div>
          <div className="meta">
            <span>{report.contact}</span>
            {report.phone && <><span className="sep">·</span><span>{report.phone}</span></>}
          </div>
        </div>
        <div className="inv2-report-counts">
          <strong>{report.items.length}</strong>
          <span>productos</span>
        </div>
        <div className="inv2-report-counts">
          <strong>{totalReq}</strong>
          <span>solicitadas</span>
        </div>
        <StatusBadge status={report.status} />
        <div className="inv2-report-chev"><Icon name="arrow" size={14} /></div>
      </button>

      {expanded &&
        <div className="inv2-report-body">
          <div className="inv2-report-actions">
            <div className="inv2-report-status-pick">
              <span className="lbl">Cambiar estatus:</span>
              {['Recibido', 'En proceso', 'Completado'].map((s) =>
              <button
                key={s}
                className={`inv2-status-btn ${report.status === s ? 'active' : ''}`}
                onClick={() => onStatusChange(s)}>

                  {s}
                </button>
              )}
            </div>
            <button className="inv2-clear-btn ghost" onClick={onRemove}>
              <Icon name="x" size={12} /> Eliminar
            </button>
          </div>

          <table className="inv2-report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th className="num">Solicitado</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              {report.items.map((it, i) =>
              <tr key={i}>
                  <td className="mono">{String(i + 1).padStart(2, '0')}</td>
                  <td><strong>{it.product}</strong></td>
                  <td className="num"><strong>{it.requested}</strong></td>
                  <td className="notes">{it.notes || <em>—</em>}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="inv2-report-meta-grid">
            <div><span>ID</span><strong className="mono">{report.id.toUpperCase()}</strong></div>
            <div><span>Punto de venta</span><strong>{report.business}</strong></div>
            <div><span>Contacto</span><strong>{report.contact}</strong></div>
            <div><span>Teléfono</span><strong>{report.phone || '—'}</strong></div>
            <div><span>Ciudad</span><strong>{report.city || '—'}</strong></div>
            <div><span>Enviado</span><strong>{date.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>
          </div>
        </div>
      }
    </div>);

}

/* ============================================================
   CONTACT PAGE — unchanged from before
   ============================================================ */
function ContactPage() {
  const [form, setForm] = useS3({ name: '', email: '', business: '', message: '' });
  const [sent, setSent] = useS3(false);
  const submit = (e) => { e.preventDefault(); setSent(true); };
  return (
    <>
      <div className="page-head">
        <div className="container">
          <div className="page-head-grid">
            <div>
              <div className="eyebrow">Contacto</div>
              <h1 className="h-display" style={{ fontSize: 'clamp(36px, 5vw, 64px)', marginTop: 12 }}>
                Estamos <em>para ayudarte</em>.
              </h1>
            </div>
            <p className="lead">
              Dudas, distribución o solo saludar? Respondemos cada mensaje — normalmente en menos de un día.
            </p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="contact-card">
              <div className="ico"><Icon name="mail" /></div>
              <h4>Correo</h4>
              <p>Información, preguntas, colaboraciones.</p>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </div>
            <div className="contact-card">
              <div className="ico"><Icon name="phone" /></div>
              <h4>Teléfono y WhatsApp</h4>
              <p>Lun–Vie, 9am–6pm</p>
              <a href="tel:+523312345678">+52 33 1844 0265</a>
            </div>
            <div className="contact-card">
              <div className="ico"><Icon name="instagram" /></div>
              <h4>Instagram</h4>
              <p>Síguenos para nuevos lotes y consejos</p>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@doggie_gourmet</a>
            </div>
            <div className="contact-card">
              <div className="ico"><Icon name="pin" /></div>
              <h4>Cocina y oficina</h4>
              <p>Av. Topacio 2451<br />Guadalajara, Jalisco · México</p>
            </div>
          </div>

          <div className="contact-form-wrap">
            {!sent ?
              <>
                <h3>Envíanos un mensaje</h3>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="field">
                    <label className="field-label"><span>Tu nombre</span><span className="req">requerido</span></label>
                    <input className="field-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Juan Pérez" />
                  </div>
                  <div className="field">
                    <label className="field-label"><span>Correo</span><span className="req">requerido</span></label>
                    <input className="field-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="tu@correo.com" />
                  </div>
                  <div className="field">
                    <label className="field-label"><span>Negocio</span><span style={{ color: 'var(--brown-soft)' }}>opcional</span></label>
                    <input className="field-input" value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} placeholder="VetCare Guadalajara" />
                  </div>
                  <div className="field">
                    <label className="field-label"><span>Mensaje</span><span className="req">requerido</span></label>
                    <textarea className="field-input" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Cuéntanos cómo te podemos ayudar..." />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: 8, alignSelf: 'flex-start' }}>
                    Enviar mensaje <Icon name="arrow" />
                  </button>
                </form>
              </> :

              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div className="modal-check" style={{ margin: '0 auto 20px' }}><Icon name="check" size={28} /></div>
                <h3 className="h-section" style={{ fontSize: 28 }}>Enviado. <em>¡Gracias!</em></h3>
                <p style={{ color: 'var(--brown-soft)', marginTop: 12 }}>Te respondemos en menos de un día.</p>
                <button className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => { setSent(false); setForm({ name: '', email: '', business: '', message: '' }); }}>
                  Enviar otro
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </>);

}

window.InventoryPage = InventoryPage;
window.ContactPage = ContactPage;
