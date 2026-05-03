/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — inv-ui.jsx
   Componentes UI reusables del dashboard de inventario:
   - Stat: card de estadística (total, pendientes, etc.)
   - FilterGroup / FilterChip: chips de filtro tipo segmented
   - StatusBadge: pill con dot de color por estado
   - ReportCard: card expandible con detalles de un reporte

   Depende de: Icon (global)
   Expone:    window.InvStat, window.InvFilterGroup,
              window.InvFilterChip, window.InvStatusBadge,
              window.InvReportCard
   ============================================================ */

function InvStat({ label, value, accent }) {
  return (
    <div className={`inv2-stat ${accent || ''}`}>
      <div className="inv2-stat-val">{value}</div>
      <div className="inv2-stat-lbl">{label}</div>
    </div>
  );
}

function InvFilterGroup({ label, children }) {
  return (
    <div className="inv2-filter-group">
      <span className="inv2-filter-label">{label}</span>
      <div className="inv2-filter-chips">{children}</div>
    </div>
  );
}

function InvFilterChip({ active, onClick, children }) {
  return (
    <button className={`inv2-chip ${active ? 'active' : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

function InvStatusBadge({ status }) {
  const map = {
    'Recibido': 'amber',
    'En proceso': 'blue',
    'Completado': 'green'
  };
  return (
    <span className={`inv2-status ${map[status] || ''}`}>
      <span className="dot" />
      {status}
    </span>
  );
}

function InvReportCard({ report, expanded, onExpand, onStatusChange, onRemove }) {
  const date = new Date(report.submittedAt);
  const totalReq = report.items.reduce((a, b) => a + b.requested, 0);

  return (
    <div className={`inv2-report ${expanded ? 'open' : ''}`}>
      <button className="inv2-report-summary" onClick={onExpand}>
        <div className="inv2-report-date">
          <div className="d">
            {date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
          </div>
          <div className="t">
            {date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="inv2-report-biz">
          <div className="name">{report.business}</div>
          <div className="meta">
            <span>{report.contact}</span>
            {report.phone && (
              <>
                <span className="sep">·</span>
                <span>{report.phone}</span>
              </>
            )}
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
        <InvStatusBadge status={report.status} />
        <div className="inv2-report-chev"><Icon name="arrow" size={14} /></div>
      </button>

      {expanded && (
        <div className="inv2-report-body">
          <div className="inv2-report-actions">
            <div className="inv2-report-status-pick">
              <span className="lbl">Cambiar estatus:</span>
              {['Recibido', 'En proceso', 'Completado'].map((s) => (
                <button
                  key={s}
                  className={`inv2-status-btn ${report.status === s ? 'active' : ''}`}
                  onClick={() => onStatusChange(s)}>
                  {s}
                </button>
              ))}
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
              {report.items.map((it, i) => (
                <tr key={i}>
                  <td className="mono">{String(i + 1).padStart(2, '0')}</td>
                  <td><strong>{it.product}</strong></td>
                  <td className="num"><strong>{it.requested}</strong></td>
                  <td className="notes">{it.notes || <em>—</em>}</td>
                </tr>
              ))}
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
      )}
    </div>
  );
}

window.InvStat = InvStat;
window.InvFilterGroup = InvFilterGroup;
window.InvFilterChip = InvFilterChip;
window.InvStatusBadge = InvStatusBadge;
window.InvReportCard = InvReportCard;
