/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — inv-inventory.jsx
   Tab "Inventario" del MasterDashboard.
   Control de inventario por punto de venta:
   - Selector de POS, stats agregados
   - InventoryTable: tabla de saldos actuales con valor total
   - MovementsTable: histórico de últimos 50 movimientos
   - MovementModal: capturar entrada / venta / ajuste

   Depende de: window.supabaseClient, Icon,
              window.INV_POS_LIST, window.InvStat
   Expone:    window.InventoryView
   ============================================================ */

const { useState: useSInv, useEffect: useEInv, useMemo: useMInv } = React;
const sbInv = window.supabaseClient;

/* ------------ TABLA DE SALDOS ------------ */
function InventoryTable({ rows }) {
  const categoryColors = {
    'BARF': '#73963C',
    'Paletas': '#D4A04C',
    'Perfumes': '#8B6F47'
  };

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1.5px solid var(--line)',
      borderRadius: 16,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 2fr 110px 120px 130px 150px',
        gap: 16,
        padding: '14px 20px',
        background: 'var(--cream)',
        borderBottom: '1px solid var(--line)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--brown-soft)',
        fontWeight: 600
      }}>
        <div></div>
        <div>Producto</div>
        <div>Categoría</div>
        <div style={{ textAlign: 'right' }}>Precio unit.</div>
        <div style={{ textAlign: 'right' }}>Cantidad</div>
        <div style={{ textAlign: 'right' }}>Valor total</div>
      </div>

      {/* Rows */}
      {rows.map((row) => {
        const isNegative = Number(row.current_quantity) < 0;
        return (
          <div
            key={row.product_id}
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 2fr 110px 120px 130px 150px',
              gap: 16,
              padding: '14px 20px',
              borderBottom: '1px solid var(--line)',
              alignItems: 'center',
              background: isNegative ? '#fef5f0' : 'transparent',
              transition: 'background 0.15s ease'
            }}>
            {/* Imagen miniatura */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              background: row.image_url
                ? `url(${row.image_url}) center/cover`
                : 'linear-gradient(135deg, var(--cream), #f0e9d8)',
              border: '1px solid var(--line)'
            }} />

            <div style={{ fontWeight: 600, color: 'var(--brown)', fontSize: 15 }}>
              {row.product_name}
            </div>

            <div>
              <span style={{
                background: categoryColors[row.category] || 'var(--brown-soft)',
                color: 'white',
                padding: '3px 10px',
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                {row.category}
              </span>
            </div>

            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--brown-soft)'
            }}>
              ${Number(row.unit_price).toFixed(0)}
            </div>

            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              color: isNegative ? '#c0392b' : 'var(--brown)',
              letterSpacing: '-0.02em'
            }}>
              {Number(row.current_quantity)}
            </div>

            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 600,
              color: isNegative ? '#c0392b' : 'var(--green-dark)',
              letterSpacing: '-0.02em'
            }}>
              ${Number(row.current_value).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </div>
          </div>
        );
      })}

      {/* Footer total */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 2fr 110px 120px 130px 150px',
        gap: 16,
        padding: '16px 20px',
        background: 'var(--cream)',
        borderTop: '2px solid var(--line-strong)',
        alignItems: 'center'
      }}>
        <div></div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--brown-soft)',
          fontWeight: 600
        }}>
          Total consignado
        </div>
        <div></div>
        <div></div>
        <div style={{
          textAlign: 'right',
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 600,
          color: 'var(--brown)',
          letterSpacing: '-0.02em'
        }}>
          {rows.reduce((a, r) => a + Number(r.current_quantity || 0), 0)}
        </div>
        <div style={{
          textAlign: 'right',
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--green-dark)',
          letterSpacing: '-0.02em'
        }}>
          ${rows.reduce((a, r) => a + Number(r.current_value || 0), 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </div>
      </div>
    </div>
  );
}

/* ------------ TABLA DE MOVIMIENTOS ------------ */
function MovementsTable({ movements }) {
  const typeConfig = {
    'entrada': { label: 'Entrada', color: '#73963C', sign: '+' },
    'venta': { label: 'Venta', color: '#D4A04C', sign: '−' },
    'ajuste_pos': { label: 'Ajuste +', color: '#5A8DB8', sign: '+' },
    'ajuste_neg': { label: 'Ajuste −', color: '#c0392b', sign: '−' }
  };

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1.5px solid var(--line)',
      borderRadius: 16,
      overflow: 'hidden'
    }}>
      {movements.map((m, idx) => {
        const cfg = typeConfig[m.movement_type] || {
          label: m.movement_type,
          color: 'var(--brown-soft)',
          sign: ''
        };
        const subtotal = Number(m.quantity) * Number(m.unit_price);
        const date = new Date(m.movement_date);
        return (
          <div
            key={m.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 130px 1fr 90px 100px 130px',
              gap: 16,
              padding: '14px 20px',
              borderBottom: idx < movements.length - 1 ? '1px solid var(--line)' : 'none',
              alignItems: 'center'
            }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--brown-soft)' }}>
              {date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
            </div>

            <div>
              <span style={{
                background: cfg.color,
                color: 'white',
                padding: '4px 12px',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                {cfg.label}
              </span>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: 'var(--brown)', fontSize: 14 }}>
                {m.products && m.products.name}
              </div>
              {m.notes && (
                <div style={{
                  fontSize: 12,
                  color: 'var(--brown-soft)',
                  marginTop: 2,
                  fontStyle: 'italic'
                }}>
                  {m.notes}
                </div>
              )}
            </div>

            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              fontWeight: 600,
              color: cfg.color,
              letterSpacing: '-0.02em'
            }}>
              {cfg.sign}{m.quantity}
            </div>

            <div style={{
              textAlign: 'right',
              fontSize: 13,
              color: 'var(--brown-soft)',
              fontFamily: 'var(--font-mono)'
            }}>
              ${Number(m.unit_price).toFixed(0)}
            </div>

            <div style={{
              textAlign: 'right',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--brown)'
            }}>
              ${subtotal.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------ MODAL DE MOVIMIENTOS ------------ */
function MovementModal({ type, posId, posName, products, inventory, onClose, onSaved }) {
  const isEntrada = type === 'entrada';
  const isVenta = type === 'venta';
  const isAjuste = type === 'ajuste';

  // Para ajuste, el usuario elige si suma o resta
  const [adjustDirection, setAdjustDirection] = useSInv('add'); // 'add' | 'subtract'
  const [date, setDate] = useSInv(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useSInv([
    { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), product_id: '', quantity: '', unit_price: '', notes: '' }
  ]);
  const [saving, setSaving] = useSInv(false);
  const [error, setError] = useSInv('');

  // Cuando seleccionan un producto, autollena el precio
  const handleProductChange = (rowId, productId) => {
    const product = products.find((p) => p.id === productId);
    setRows((rs) => rs.map((r) => {
      if (r.id !== rowId) return r;
      let priceToUse = r.unit_price;
      if (product && (!r.unit_price || r.unit_price === '')) {
        // Buscar último precio en el inventario actual de este POS
        const invRow = inventory.find((i) => i.product_id === productId);
        if (invRow) {
          priceToUse = String(Number(invRow.unit_price));
        } else {
          priceToUse = String(Number(product.default_price));
        }
      }
      return { ...r, product_id: productId, unit_price: priceToUse };
    }));
  };

  const updateRow = (rowId, key, val) => {
    setRows((rs) => rs.map((r) => r.id === rowId ? { ...r, [key]: val } : r));
  };

  const addRow = () => {
    setRows((rs) => [
      ...rs,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
        product_id: '',
        quantity: '',
        unit_price: '',
        notes: ''
      }
    ]);
  };

  const removeRow = (rowId) => {
    setRows((rs) => rs.length === 1 ? rs : rs.filter((r) => r.id !== rowId));
  };

  const validRows = useMInv(
    () => rows.filter((r) => r.product_id && r.quantity && Number(r.quantity) > 0),
    [rows]
  );

  const totalUnits = validRows.reduce((a, r) => a + Number(r.quantity || 0), 0);
  const totalValue = validRows.reduce((a, r) => a + (Number(r.quantity) * Number(r.unit_price || 0)), 0);

  const save = async () => {
    if (validRows.length === 0) {
      setError('Captura al menos un producto.');
      return;
    }
    setSaving(true);
    setError('');

    const movementType = isEntrada
      ? 'entrada'
      : isVenta
      ? 'venta'
      : adjustDirection === 'add' ? 'ajuste_pos' : 'ajuste_neg';

    const payload = validRows.map((r) => ({
      pos_id: posId,
      product_id: r.product_id,
      movement_type: movementType,
      quantity: Number(r.quantity),
      unit_price: Number(r.unit_price) || 0,
      notes: r.notes.trim() || null,
      movement_date: date
    }));

    const { error: insertErr } = await sbInv
      .from('inventory_movements')
      .insert(payload);

    if (insertErr) {
      console.error(insertErr);
      setError('No se pudo guardar. Intenta de nuevo.');
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  };

  const config = {
    entrada: {
      title: 'Dejar mercancía',
      eyebrow: 'Nueva entrada',
      sub: 'Captura los productos y cantidades que estás consignando.',
      btnLabel: 'Registrar entrada',
      accent: '#73963C'
    },
    venta: {
      title: 'Registrar ventas',
      eyebrow: 'Corte de ventas',
      sub: 'Captura los productos vendidos en el corte. El inventario se actualiza automáticamente.',
      btnLabel: 'Registrar venta',
      accent: '#D4A04C'
    },
    ajuste: {
      title: 'Ajustar inventario',
      eyebrow: 'Ajuste manual',
      sub: 'Para correcciones, mermas, devoluciones o productos encontrados.',
      btnLabel: 'Registrar ajuste',
      accent: adjustDirection === 'add' ? '#5A8DB8' : '#c0392b'
    }
  }[type];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 15, 5, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 1000
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          borderRadius: 20,
          maxWidth: 880,
          width: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          boxShadow: '0 20px 60px -10px rgba(74, 59, 16, 0.35)',
          border: '1.5px solid var(--line-strong)'
        }}>

        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 20
        }}>
          <div>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              color: config.accent,
              marginBottom: 4,
              fontWeight: 600
            }}>
              {config.eyebrow} · {posName}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              color: 'var(--brown)',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {config.title}
            </h2>
            <p style={{
              color: 'var(--brown-soft)',
              fontSize: 13,
              marginTop: 6,
              marginBottom: 0
            }}>
              {config.sub}
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 28px' }}>

          {/* Toggle de dirección para ajuste */}
          {isAjuste && (
            <div style={{
              display: 'flex',
              gap: 8,
              marginBottom: 18,
              padding: 4,
              background: 'var(--cream)',
              borderRadius: 100,
              border: '1px solid var(--line)',
              width: 'fit-content'
            }}>
              <button
                onClick={() => setAdjustDirection('add')}
                style={{
                  background: adjustDirection === 'add' ? '#5A8DB8' : 'transparent',
                  color: adjustDirection === 'add' ? 'white' : 'var(--brown)',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                + Sumar (encontrado / devolución)
              </button>
              <button
                onClick={() => setAdjustDirection('subtract')}
                style={{
                  background: adjustDirection === 'subtract' ? '#c0392b' : 'transparent',
                  color: adjustDirection === 'subtract' ? 'white' : 'var(--brown)',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit'
                }}>
                − Restar (merma / caducidad)
              </button>
            </div>
          )}

          {/* Fecha */}
          <div className="field" style={{ marginBottom: 18, maxWidth: 220 }}>
            <label className="field-label">
              <span>Fecha del movimiento</span>
            </label>
            <input
              className="field-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={saving} />
          </div>

          {/* Header de filas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '40px 2.5fr 100px 110px 1fr 36px',
            gap: 12,
            padding: '0 8px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--brown-soft)',
            fontWeight: 600,
            borderBottom: '1px solid var(--line)',
            marginBottom: 8
          }}>
            <div>#</div>
            <div>Producto</div>
            <div style={{ textAlign: 'right' }}>Cantidad</div>
            <div style={{ textAlign: 'right' }}>Precio unit.</div>
            <div>Notas</div>
            <div></div>
          </div>

          {/* Rows */}
          {rows.map((row, idx) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 2.5fr 100px 110px 1fr 36px',
                gap: 12,
                padding: '8px',
                alignItems: 'center',
                marginBottom: 4
              }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--brown-soft)'
              }}>
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Producto */}
              <select
                className="field-input"
                value={row.product_id}
                onChange={(e) => handleProductChange(row.id, e.target.value)}
                disabled={saving}
                style={{ cursor: 'pointer' }}>
                <option value="">Selecciona un producto...</option>
                {['BARF', 'Paletas', 'Perfumes'].map((cat) => (
                  <optgroup key={cat} label={cat}>
                    {products.filter((p) => p.category === cat).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>

              {/* Cantidad */}
              <input
                className="field-input"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="0"
                value={row.quantity}
                onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                disabled={saving}
                style={{ textAlign: 'right' }} />

              {/* Precio */}
              <input
                className="field-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={row.unit_price}
                onChange={(e) => updateRow(row.id, 'unit_price', e.target.value)}
                disabled={saving}
                style={{ textAlign: 'right' }} />

              {/* Notas */}
              <input
                className="field-input"
                type="text"
                placeholder="Lote, comentario..."
                value={row.notes}
                onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                disabled={saving} />

              {/* Eliminar fila */}
              <button
                onClick={() => removeRow(row.id)}
                disabled={rows.length === 1 || saving}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--line)',
                  borderRadius: 100,
                  width: 28,
                  height: 28,
                  cursor: rows.length === 1 ? 'not-allowed' : 'pointer',
                  color: 'var(--brown-soft)',
                  opacity: rows.length === 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                ×
              </button>
            </div>
          ))}

          {/* Agregar fila */}
          <button
            onClick={addRow}
            disabled={saving}
            style={{
              background: 'transparent',
              border: '1.5px dashed var(--line-strong)',
              borderRadius: 12,
              padding: '12px 18px',
              marginTop: 8,
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--green-dark)',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.15s ease'
            }}>
            + Agregar producto
          </button>

          {/* Resumen */}
          <div style={{
            marginTop: 22,
            padding: '14px 18px',
            background: 'var(--cream)',
            borderRadius: 12,
            border: '1px solid var(--line)',
            display: 'flex',
            gap: 30,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', gap: 30 }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--brown-soft)',
                  fontWeight: 600
                }}>
                  Productos
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--brown)'
                }}>
                  {validRows.length}
                </div>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--brown-soft)',
                  fontWeight: 600
                }}>
                  Unidades
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--brown)'
                }}>
                  {totalUnits}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--brown-soft)',
                fontWeight: 600
              }}>
                Valor total
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 26,
                fontWeight: 700,
                color: config.accent,
                letterSpacing: '-0.02em'
              }}>
                ${totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: 14,
              padding: '10px 14px',
              background: '#fee',
              color: '#c0392b',
              borderRadius: 8,
              fontSize: 13,
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px 24px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end'
        }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={saving}>
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving || validRows.length === 0}
            style={{
              background: config.accent,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 100,
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving || validRows.length === 0 ? 'not-allowed' : 'pointer',
              opacity: saving || validRows.length === 0 ? 0.5 : 1,
              transition: 'all 0.15s ease'
            }}>
            {saving ? 'Guardando...' : config.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------ VISTA PRINCIPAL ------------ */
function InventoryView() {
  const [selectedPos, setSelectedPos] = useSInv('vitalpets');
  const [inventory, setInventory] = useSInv([]);
  const [movements, setMovements] = useSInv([]);
  const [products, setProducts] = useSInv([]);
  const [loading, setLoading] = useSInv(true);
  const [movementModal, setMovementModal] = useSInv(null); // null | 'entrada' | 'venta' | 'ajuste'

  const refresh = async () => {
    setLoading(true);
    // Saldos vista pos_inventory_summary
    const { data: summaryData, error: summaryErr } = await sbInv
      .from('pos_inventory_summary')
      .select('*')
      .eq('pos_id', selectedPos)
      .order('product_name', { ascending: true });

    // Histórico
    const { data: movData, error: movErr } = await sbInv
      .from('inventory_movements')
      .select(`
        id, movement_type, quantity, unit_price, notes, movement_date, created_at,
        product_id,
        products ( name, category, image_url )
      `)
      .eq('pos_id', selectedPos)
      .order('created_at', { ascending: false })
      .limit(50);

    // Productos activos
    const { data: prodData, error: prodErr } = await sbInv
      .from('products')
      .select('*')
      .eq('active', true)
      .order('category')
      .order('name');

    if (summaryErr) console.error('Inventory error:', summaryErr);
    if (movErr) console.error('Movements error:', movErr);
    if (prodErr) console.error('Products error:', prodErr);

    setInventory(summaryData || []);
    setMovements(movData || []);
    setProducts(prodData || []);
    setLoading(false);
  };

  useEInv(() => { refresh(); }, [selectedPos]);

  const onMovementSaved = () => {
    setMovementModal(null);
    refresh();
  };

  const stats = useMInv(() => {
    const productCount = inventory.length;
    const totalUnits = inventory.reduce((a, r) => a + Number(r.current_quantity || 0), 0);
    const totalValue = inventory.reduce((a, r) => a + Number(r.current_value || 0), 0);
    const negativeProducts = inventory.filter((r) => Number(r.current_quantity) < 0).length;
    return { productCount, totalUnits, totalValue, negativeProducts };
  }, [inventory]);

  const currentPos = window.INV_POS_LIST.find((p) => p.id === selectedPos);
  const Stat = window.InvStat;

  return (
    <>
      {/* Selector de POS + stats */}
      <div className="inv2-master-hero" style={{ paddingTop: 32, paddingBottom: 36 }}>
        <div className="container">
          {/* Selector de POS */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            {window.INV_POS_LIST.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPos(p.id)}
                style={{
                  background: selectedPos === p.id ? 'var(--green)' : 'rgba(250, 247, 242, 0.08)',
                  color: selectedPos === p.id ? 'white' : 'var(--cream)',
                  border: selectedPos === p.id
                    ? '1.5px solid var(--green)'
                    : '1.5px solid rgba(250, 247, 242, 0.18)',
                  padding: '14px 24px',
                  borderRadius: 100,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.01em'
                }}>
                {p.name}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="inv2-master-stats">
            <Stat label="Productos consignados" value={stats.productCount} />
            <Stat label="Unidades totales" value={stats.totalUnits} />
            <Stat
              label="Valor consignado"
              value={`$${stats.totalValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`}
              accent="green" />
            {stats.negativeProducts > 0 && (
              <Stat label="Saldos negativos" value={stats.negativeProducts} accent="amber" />
            )}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Toolbar de acciones */}
        <div className="inv2-master-toolbar">
          <div style={{ flex: 1 }}>
            <div className="inv2-filter-label" style={{ marginBottom: 4 }}>Punto de venta activo</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--brown)',
              letterSpacing: '-0.01em'
            }}>
              {currentPos ? currentPos.business : ''}
            </div>
          </div>
          <div className="inv2-master-tools" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
              <Icon name="refresh" size={12} /> {loading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setMovementModal('ajuste')}>
              <Icon name="plus" size={12} /> Ajustar
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setMovementModal('venta')}
              style={{ background: '#D4A04C', color: 'white' }}>
              Registrar ventas
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setMovementModal('entrada')}>
              <Icon name="plus" size={12} /> Dejar mercancía
            </button>
          </div>
        </div>

        {loading ? (
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Cargando inventario...</h3>
          </div>
        ) : inventory.length === 0 ? (
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Sin inventario en {currentPos.name}</h3>
            <p>Para empezar, dale a "Dejar mercancía" y captura los productos que vas a consignar a este punto de venta.</p>
          </div>
        ) : (
          <InventoryTable rows={inventory} />
        )}

        {/* Histórico de movimientos */}
        {!loading && movements.length > 0 && (
          <div style={{ marginTop: 48, marginBottom: 60 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 600,
              color: 'var(--brown)',
              letterSpacing: '-0.01em',
              marginBottom: 8
            }}>
              Histórico <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--green-dark)' }}>de movimientos</em>
            </h2>
            <p style={{ color: 'var(--brown-soft)', marginBottom: 24, fontSize: 14 }}>
              Últimos {movements.length} movimientos en {currentPos.name}.
            </p>
            <MovementsTable movements={movements} />
          </div>
        )}
      </div>

      {movementModal && (
        <MovementModal
          type={movementModal}
          posId={selectedPos}
          posName={currentPos.name}
          products={products}
          inventory={inventory}
          onClose={() => setMovementModal(null)}
          onSaved={onMovementSaved} />
      )}
    </>
  );
}

window.InventoryView = InventoryView;
