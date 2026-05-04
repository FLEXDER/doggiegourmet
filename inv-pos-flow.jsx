/* global React, Icon, EMAIL */
/* ============================================================
   DOGGIE GOURMET — inv-pos-flow.jsx
   Flujo completo del Punto de Venta (POS):
   - PinGate: validación de PIN de 4 dígitos contra Supabase RPC
   - PosHeader: barra superior con datos del negocio + logout
   - BizField: campo readonly de info del negocio
   - PosReportForm: formulario para capturar productos + envío
   - PosSuccessView: pantalla de confirmación post-envío

   Depende de: window.supabaseClient (sb), Icon, EMAIL,
              window.INV_PRODUCT_SUGGESTIONS, window.INV_SUBMIT_REPORT_URL,
              window.CART_SUPABASE_KEY (compartida desde cart-helpers.js)
   Expone:    window.PinGate, window.PosReportForm
   ============================================================ */

const { useState: useSPos, useEffect: useEPos, useRef: useRPos, useMemo: useMPos } = React;

const sbPos = window.supabaseClient;

/* ------------ PIN GATE ------------ */
function PinGate({ onUnlock, onMasterClick }) {
  const [pin, setPin] = useSPos('');
  const [error, setError] = useSPos('');
  const [shake, setShake] = useSPos(false);
  const [loading, setLoading] = useSPos(false);
  const inputRefs = useRPos([]);

  useEPos(() => {
    inputRefs.current[0] && inputRefs.current[0].focus();
  }, []);

  const setDigit = (idx, val) => {
    if (loading) return;
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

  const tryUnlock = async (code) => {
    setLoading(true);
    setError('');
    try {
      const { data, error: rpcError } = await sbPos.rpc('verify_pin', { p_pin: code });
      if (rpcError) throw rpcError;
      const profile = data && data.length > 0 ? data[0] : null;
      if (profile && profile.role === 'pos') {
        onUnlock(profile);
        return;
      }
      // PIN no encontrado o rol incorrecto
      setError('PIN incorrecto. Intenta de nuevo.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
        inputRefs.current[0] && inputRefs.current[0].focus();
      }, 500);
    } catch (err) {
      console.error('verify_pin error:', err);
      setError('Error de conexión. Verifica tu internet.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin('');
        inputRefs.current[0] && inputRefs.current[0].focus();
      }, 500);
    } finally {
      setLoading(false);
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

          <div className={`pin-row ${shake ? 'shake' : ''}`} style={{ opacity: loading ? 0.6 : 1 }}>
            {[0, 1, 2, 3].map((i) => (
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
                autoComplete="off"
                disabled={loading} />
            ))}
          </div>

          {loading && (
            <div style={{ color: 'var(--brown-soft)', fontSize: 13, marginTop: 12, textAlign: 'center' }}>
              Validando...
            </div>
          )}
          {error && !loading && <div className="pin-err">{error}</div>}

          <div className="pin-gate-foot">
            <Icon name="lock" size={12} />
            <span>Datos protegidos · uso interno Doggie Gourmet</span>
          </div>

          <button
            type="button"
            onClick={onMasterClick}
            style={{
              marginTop: 20,
              background: 'transparent',
              border: 'none',
              color: 'var(--green)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              padding: 4
            }}>
            Acceso de administración →
          </button>
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
    </div>
  );
}

/* ------------ HELPERS DEL FORM ------------ */

function BizField({ label, value, full }) {
  return (
    <div className={`inv2-biz-field ${full ? 'full' : ''}`}>
      <div className="inv2-biz-label">{label}</div>
      <div className="inv2-biz-value">{value}</div>
    </div>
  );
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
    </div>
  );
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
              {report.items.map((it, i) => (
                <div className="inv2-success-row" key={i}>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="prod">{it.product}</span>
                  <span className="qty"><em>solicita</em> <strong>{it.requested}</strong></span>
                </div>
              ))}
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
    </div>
  );
}

/* ------------ POS REPORT FORM ------------ */
function PosReportForm({ profile, onLogout }) {
  const [rows, setRows] = useSPos([
    { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), product: '', requested: '', notes: '' }
  ]);
  const [submitted, setSubmitted] = useSPos(null);
  const [sending, setSending] = useSPos(false);
  const [sendError, setSendError] = useSPos('');

  const updateRow = (id, key, val) => {
    setRows((r) => r.map((row) => row.id === id ? { ...row, [key]: val } : row));
  };
  const addRow = () => {
    setRows((r) => [
      ...r,
      { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), product: '', requested: '', notes: '' }
    ]);
  };
  const removeRow = (id) => {
    setRows((r) => r.length === 1 ? r : r.filter((row) => row.id !== id));
  };

  const validRows = useMPos(
    () => rows.filter((r) => r.product.trim() && r.requested !== ''),
    [rows]
  );
  const canSubmit = validRows.length > 0;

  const submit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);
    setSendError('');

    const itemsToInsert = validRows.map((r) => ({
      product: r.product.trim(),
      requested: Number(r.requested) || 0,
      notes: r.notes.trim() || null
    }));

    let savedReport = null;

    // 1) Insertar el reporte en Supabase
    try {
      const { data: reportData, error: reportError } = await sbPos
        .from('inventory_reports')
        .insert({
          pos_id: profile.id,
          business: profile.business,
          contact: profile.contact,
          status: 'Recibido'
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Insertar los items del reporte
      const itemsWithReportId = itemsToInsert.map((it) => ({ ...it, report_id: reportData.id }));
      const { error: itemsError } = await sbPos
        .from('inventory_report_items')
        .insert(itemsWithReportId);

      if (itemsError) throw itemsError;

      savedReport = {
        id: reportData.id,
        submittedAt: reportData.submitted_at,
        posId: reportData.pos_id,
        business: reportData.business,
        contact: reportData.contact,
        phone: profile.phone,
        city: profile.city,
        status: reportData.status,
        items: itemsToInsert.map((it) => ({ ...it, notes: it.notes || '' }))
      };
    } catch (err) {
      console.error('Supabase insert error:', err);
      setSendError('No se pudo guardar el reporte. Verifica tu internet e intenta de nuevo.');
      setSending(false);
      return;
    }

    // 2) Mandar correo de notificación via Edge Function submit-inventory-report
    //    (la WEB3FORMS_KEY vive en el servidor de Supabase, no en el frontend).
    //    No bloqueante: si falla el correo, el reporte ya quedó guardado en BD.
    try {
      await fetch(window.INV_SUBMIT_REPORT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: window.CART_SUPABASE_KEY,
          Authorization: `Bearer ${window.CART_SUPABASE_KEY}`
        },
        body: JSON.stringify({
          business: profile.business,
          contact: profile.contact,
          phone: profile.phone || '',
          city: profile.city || '',
          report_id: savedReport.id,
          submitted_at: savedReport.submittedAt,
          items: itemsToInsert
        })
      });
    } catch (err) {
      console.warn('Notificación por correo falló (no bloqueante):', err);
    }

    setSubmitted(savedReport);
    setSending(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startNew = () => {
    setRows([
      { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), product: '', requested: '', notes: '' }
    ]);
    setSubmitted(null);
    setSendError('');
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
                {window.INV_PRODUCT_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
              </datalist>

              <div className="inv2-rows">
                <div className="inv2-rows-head">
                  <span></span>
                  <span>Producto</span>
                  <span>Cantidad solicitada</span>
                  <span>Notas</span>
                  <span></span>
                </div>

                {rows.map((row, idx) => (
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
                ))}
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
    </div>
  );
}

window.PinGate = PinGate;
window.PosReportForm = PosReportForm;
