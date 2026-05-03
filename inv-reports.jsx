/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — inv-reports.jsx
   Tab "Reportes" del MasterDashboard.
   Lista todos los reportes de inventario enviados por los POS,
   con filtros por punto de venta y estatus, stats agregados,
   y acciones para cambiar estatus o eliminar.

   Depende de: window.supabaseClient, Icon,
              window.InvStat, window.InvFilterGroup,
              window.InvFilterChip, window.InvReportCard
   Expone:    window.ReportsView
   ============================================================ */

const { useState: useSReports, useEffect: useEReports, useMemo: useMReports } = React;
const sbReports = window.supabaseClient;

function ReportsView() {
  const [reports, setReports] = useSReports([]);
  const [loadingReports, setLoadingReports] = useSReports(true);
  const [filter, setFilter] = useSReports('all');
  const [statusFilter, setStatusFilter] = useSReports('all');
  const [expanded, setExpanded] = useSReports(null);

  const refresh = async () => {
    setLoadingReports(true);
    const { data, error } = await sbReports
      .from('inventory_reports')
      .select(`
        id, pos_id, business, contact, status, submitted_at,
        inventory_report_items (id, product, requested, notes)
      `)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    } else {
      const transformed = (data || []).map((r) => ({
        id: r.id,
        posId: r.pos_id,
        business: r.business,
        contact: r.contact,
        phone: '',
        city: '',
        status: r.status,
        submittedAt: r.submitted_at,
        items: (r.inventory_report_items || []).map((it) => ({
          product: it.product,
          requested: it.requested,
          notes: it.notes || ''
        }))
      }));
      setReports(transformed);
    }
    setLoadingReports(false);
  };

  useEReports(() => { refresh(); }, []);

  const updateStatus = async (id, status) => {
    const { error } = await sbReports
      .from('inventory_reports')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error('Error updating status:', error);
      window.alert('No se pudo actualizar el estatus. Intenta de nuevo.');
      return;
    }
    setReports((rs) => rs.map((r) => r.id === id ? { ...r, status } : r));
  };

  const removeReport = async (id) => {
    if (!window.confirm('¿Eliminar este reporte? Esta acción no se puede deshacer.')) return;
    const { error } = await sbReports
      .from('inventory_reports')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting report:', error);
      window.alert('No se pudo eliminar el reporte. Intenta de nuevo.');
      return;
    }
    setReports((rs) => rs.filter((r) => r.id !== id));
  };

  const visible = useMReports(() => {
    return reports.filter((r) => {
      if (filter !== 'all' && r.posId !== filter) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      return true;
    });
  }, [reports, filter, statusFilter]);

  const stats = useMReports(() => {
    const total = reports.length;
    const recibido = reports.filter((r) => r.status === 'Recibido').length;
    const proceso = reports.filter((r) => r.status === 'En proceso').length;
    const completado = reports.filter(
      (r) => r.status === 'Completado' || r.status === 'Surtido'
    ).length;
    const productos = reports.reduce(
      (a, r) => a + r.items.reduce((b, i) => b + i.requested, 0),
      0
    );
    return { total, recibido, proceso, completado, productos };
  }, [reports]);

  // Aliases locales para legibilidad
  const Stat = window.InvStat;
  const FilterGroup = window.InvFilterGroup;
  const FilterChip = window.InvFilterChip;
  const ReportCard = window.InvReportCard;

  return (
    <>
      <div className="inv2-master-hero" style={{ paddingTop: 0, paddingBottom: 36 }}>
        <div className="container">
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
            <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loadingReports}>
              <Icon name="refresh" size={12} /> {loadingReports ? 'Cargando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        {loadingReports ? (
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Cargando reportes...</h3>
            <p>Obteniendo datos en tiempo real de la base de datos.</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Sin reportes {reports.length > 0 ? 'con esos filtros' : 'todavía'}</h3>
            <p>{reports.length > 0 ? 'Ajusta los filtros para ver más resultados.' : 'Cuando los puntos de venta envíen su reporte, aparecerá aquí.'}</p>
          </div>
        ) : (
          <div className="inv2-master-list">
            {visible.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                expanded={expanded === r.id}
                onExpand={() => setExpanded(expanded === r.id ? null : r.id)}
                onStatusChange={(s) => updateStatus(r.id, s)}
                onRemove={() => removeReport(r.id)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

window.ReportsView = ReportsView;
