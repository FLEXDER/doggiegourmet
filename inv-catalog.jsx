/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — inv-catalog.jsx
   Tab "Catálogo" del MasterDashboard.
   Gestión completa de productos: lista en grid, búsqueda,
   filtro por categoría, modal de creación/edición/eliminación
   con upload de imagen a Supabase Storage.

   Depende de: window.supabaseClient, Icon,
              window.InvStat, window.InvFilterGroup, window.InvFilterChip
   Expone:    window.CatalogView
   ============================================================ */

const { useState: useSCat, useEffect: useECat, useMemo: useMCat, useRef: useRCat } = React;
const sbCat = window.supabaseClient;

/* ------------ CARD (item del grid) ------------ */
function CatalogProductCard({ product, onClick }) {
  const categoryColors = {
    'BARF': { bg: '#73963C', label: 'BARF' },
    'Paletas': { bg: '#D4A04C', label: 'Paletas' },
    'Perfumes': { bg: '#8B6F47', label: 'Perfumes' }
  };
  const cat = categoryColors[product.category] || {
    bg: 'var(--brown-soft)',
    label: product.category
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--paper)',
        border: '1.5px solid var(--line)',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: product.active ? 1 : 0.55,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--line-strong)';
        e.currentTarget.style.boxShadow = '0 6px 20px -8px rgba(74, 59, 16, 0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--line)';
        e.currentTarget.style.boxShadow = 'none';
      }}>

      {/* Imagen */}
      <div style={{
        height: 200,
        background: product.image_url
          ? `url(${product.image_url}) center/cover`
          : 'linear-gradient(135deg, var(--cream), #f0e9d8)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {!product.image_url && (
          <div style={{
            color: 'var(--brown-soft)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)'
          }}>
            Sin imagen
          </div>
        )}

        {/* Badge categoría */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          background: cat.bg,
          color: 'white',
          padding: '5px 12px',
          borderRadius: 100,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase'
        }}>
          {cat.label}
        </div>

        {/* Badge inactivo */}
        {!product.active && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(74, 59, 16, 0.85)',
            color: 'var(--cream)',
            padding: '5px 12px',
            borderRadius: 100,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Inactivo
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '18px 20px 20px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--brown)',
          margin: '0 0 4px',
          lineHeight: 1.2,
          letterSpacing: '-0.01em'
        }}>
          {product.name}
        </h3>
        {product.sku && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--brown-soft)',
            letterSpacing: '0.04em',
            marginBottom: 10
          }}>
            SKU: {product.sku}
          </div>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--line)'
        }}>
          <span style={{
            fontSize: 11,
            color: 'var(--brown-soft)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)'
          }}>
            Precio base
          </span>
          <span style={{ flex: 1 }}></span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 600,
            color: 'var(--green-dark)',
            letterSpacing: '-0.02em'
          }}>
            ${Number(product.default_price).toFixed(0)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--brown-soft)' }}>MXN</span>
        </div>
      </div>
    </div>
  );
}

/* ------------ MODAL DE EDICIÓN ------------ */
function ProductEditModal({ product, onClose, onSaved }) {
  const isNew = !product || !product.id;
  const [form, setForm] = useSCat({
    name: (product && product.name) || '',
    sku: (product && product.sku) || '',
    category: (product && product.category) || 'BARF',
    default_price: (product && product.default_price !== undefined) ? product.default_price : 0,
    image_url: (product && product.image_url) || '',
    active: (product && product.active !== undefined) ? product.active : true
  });
  const [uploading, setUploading] = useSCat(false);
  const [saving, setSaving] = useSCat(false);
  const [error, setError] = useSCat('');
  const fileInputRef = useRCat(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe pesar más de 5MB.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadErr } = await sbCat.storage
        .from('product-images')
        .upload(filename, file, { contentType: file.type, upsert: false });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = sbCat.storage
        .from('product-images')
        .getPublicUrl(filename);

      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
      setError('No se pudo subir la imagen. Intenta de nuevo.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, image_url: '' }));
  };

  const save = async () => {
    if (!form.name.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      category: form.category,
      default_price: Number(form.default_price) || 0,
      image_url: form.image_url || null,
      active: form.active
    };

    let result;
    if (isNew) {
      result = await sbCat.from('products').insert(payload).select().single();
    } else {
      result = await sbCat.from('products').update(payload).eq('id', product.id).select().single();
    }

    if (result.error) {
      console.error(result.error);
      setError('No se pudo guardar el producto. Intenta de nuevo.');
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved(result.data);
  };

  const remove = async () => {
    if (!window.confirm(`¿Eliminar "${product.name}" del catálogo? Esta acción no se puede deshacer.`)) return;
    const { error: delErr } = await sbCat.from('products').delete().eq('id', product.id);
    if (delErr) {
      console.error(delErr);
      window.alert('No se pudo eliminar el producto. Si tiene movimientos asociados, mejor desactívalo.');
      return;
    }
    onSaved(null);
  };

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
        zIndex: 1000,
        animation: 'fadeIn 0.15s ease'
      }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          borderRadius: 20,
          maxWidth: 560,
          width: '100%',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          boxShadow: '0 20px 60px -10px rgba(74, 59, 16, 0.35)',
          border: '1.5px solid var(--line-strong)'
        }}>

        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid var(--line)'
        }}>
          <div style={{
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            color: 'var(--brown-soft)',
            marginBottom: 4
          }}>
            {isNew ? 'Nuevo producto' : 'Editar producto'}
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            color: 'var(--brown)',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {isNew ? 'Agregar al catálogo' : form.name || 'Producto sin nombre'}
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>

          {/* Imagen */}
          <div style={{ marginBottom: 22 }}>
            <div className="field-label" style={{ marginBottom: 10 }}>
              <span>Imagen</span>
              <span style={{ color: 'var(--brown-soft)' }}>opcional</span>
            </div>
            <div style={{
              height: 220,
              borderRadius: 12,
              border: '2px dashed var(--line-strong)',
              background: form.image_url ? `url(${form.image_url}) center/cover` : 'var(--cream)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: uploading ? 'wait' : 'pointer',
              transition: 'all 0.15s ease'
            }}
            onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}>
              {uploading ? (
                <div style={{ color: 'var(--brown-soft)', fontSize: 13 }}>Subiendo imagen...</div>
              ) : !form.image_url && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--brown-soft)',
                  fontSize: 13
                }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>+</div>
                  <div>Click para subir imagen</div>
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>JPG, PNG o WebP · máx 5MB</div>
                </div>
              )}

              {form.image_url && !uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(); }}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(20, 15, 5, 0.8)',
                    color: 'var(--cream)',
                    border: 'none',
                    borderRadius: 100,
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  ×
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }} />
          </div>

          {/* Nombre */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field-label">
              <span>Nombre del producto</span>
              <span className="req">requerido</span>
            </label>
            <input
              className="field-input"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="BARF Original 500g"
              disabled={saving} />
          </div>

          {/* SKU + Categoría */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div className="field">
              <label className="field-label">
                <span>SKU</span>
                <span style={{ color: 'var(--brown-soft)' }}>opcional</span>
              </label>
              <input
                className="field-input"
                type="text"
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                placeholder="DG-BARF-500"
                disabled={saving} />
            </div>
            <div className="field">
              <label className="field-label"><span>Categoría</span></label>
              <select
                className="field-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                disabled={saving}
                style={{ cursor: 'pointer' }}>
                <option value="BARF">BARF</option>
                <option value="Paletas">Paletas</option>
                <option value="Perfumes">Perfumes</option>
              </select>
            </div>
          </div>

          {/* Precio */}
          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field-label">
              <span>Precio base (MXN)</span>
              <span style={{ color: 'var(--brown-soft)' }}>editable después por POS</span>
            </label>
            <input
              className="field-input"
              type="number"
              min="0"
              step="0.01"
              value={form.default_price}
              onChange={(e) => setForm((f) => ({ ...f, default_price: e.target.value }))}
              placeholder="40"
              disabled={saving} />
          </div>

          {/* Activo */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            background: 'var(--cream)',
            borderRadius: 10,
            border: '1px solid var(--line)',
            cursor: 'pointer',
            marginBottom: 8
          }}>
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              disabled={saving}
              style={{ width: 16, height: 16, accentColor: 'var(--green)' }} />
            <div>
              <div style={{ fontWeight: 600, color: 'var(--brown)', fontSize: 14 }}>
                Producto activo
              </div>
              <div style={{ fontSize: 12, color: 'var(--brown-soft)', marginTop: 2 }}>
                Los productos inactivos no aparecen como sugerencia para los POS
              </div>
            </div>
          </label>

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
          alignItems: 'center'
        }}>
          {!isNew && (
            <button
              onClick={remove}
              disabled={saving}
              style={{
                background: 'transparent',
                border: '1.5px solid #fcc',
                color: '#c0392b',
                padding: '10px 16px',
                borderRadius: 100,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}>
              Eliminar
            </button>
          )}
          <div style={{ flex: 1 }}></div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            disabled={saving}>
            Cancelar
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={saving || uploading || !form.name.trim()}>
            {saving ? 'Guardando...' : (isNew ? 'Crear producto' : 'Guardar cambios')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------ VISTA PRINCIPAL ------------ */
function CatalogView() {
  const [products, setProducts] = useSCat([]);
  const [loading, setLoading] = useSCat(true);
  const [categoryFilter, setCategoryFilter] = useSCat('all');
  const [search, setSearch] = useSCat('');
  const [editing, setEditing] = useSCat(null); // null = cerrado, {} = nuevo, {id, ...} = editar

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await sbCat
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useECat(() => { refresh(); }, []);

  const handleSaved = () => {
    setEditing(null);
    refresh();
  };

  const visible = useMCat(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.sku || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [products, categoryFilter, search]);

  const stats = useMCat(() => {
    const total = products.length;
    const active = products.filter((p) => p.active).length;
    const barf = products.filter((p) => p.category === 'BARF').length;
    const paletas = products.filter((p) => p.category === 'Paletas').length;
    const perfumes = products.filter((p) => p.category === 'Perfumes').length;
    return { total, active, barf, paletas, perfumes };
  }, [products]);

  // Aliases locales para legibilidad
  const Stat = window.InvStat;
  const FilterGroup = window.InvFilterGroup;
  const FilterChip = window.InvFilterChip;

  return (
    <>
      <div className="inv2-master-hero" style={{ paddingTop: 0, paddingBottom: 36 }}>
        <div className="container">
          <div className="inv2-master-stats">
            <Stat label="Productos totales" value={stats.total} />
            <Stat label="Activos" value={stats.active} accent="green" />
            <Stat label="BARF" value={stats.barf} />
            <Stat label="Paletas" value={stats.paletas} />
            <Stat label="Perfumes" value={stats.perfumes} />
          </div>
        </div>
      </div>

      <div className="container">
        <div className="inv2-master-toolbar">
          <div className="inv2-master-filters">
            <FilterGroup label="Categoría">
              <FilterChip active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>Todas</FilterChip>
              <FilterChip active={categoryFilter === 'BARF'} onClick={() => setCategoryFilter('BARF')}>BARF</FilterChip>
              <FilterChip active={categoryFilter === 'Paletas'} onClick={() => setCategoryFilter('Paletas')}>Paletas</FilterChip>
              <FilterChip active={categoryFilter === 'Perfumes'} onClick={() => setCategoryFilter('Perfumes')}>Perfumes</FilterChip>
            </FilterGroup>
            <div className="inv2-filter-group" style={{ flex: '0 0 auto', minWidth: 240 }}>
              <span className="inv2-filter-label">Buscar</span>
              <input
                type="text"
                placeholder="Nombre o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="field-input"
                style={{ padding: '10px 14px', fontSize: 14 }} />
            </div>
          </div>
          <div className="inv2-master-tools">
            <button className="btn btn-ghost btn-sm" onClick={refresh} disabled={loading}>
              <Icon name="refresh" size={12} /> {loading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setEditing({})}>
              <Icon name="plus" size={12} /> Nuevo producto
            </button>
          </div>
        </div>

        {loading ? (
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Cargando catálogo...</h3>
          </div>
        ) : visible.length === 0 ? (
          <div className="inv2-empty">
            <div className="inv2-empty-ico"><Icon name="inventory" size={28} /></div>
            <h3>Sin productos {products.length > 0 ? 'con esos filtros' : 'todavía'}</h3>
            <p>{products.length > 0 ? 'Ajusta los filtros para ver más resultados.' : 'Crea tu primer producto con el botón "Nuevo producto".'}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
            marginBottom: 60
          }}>
            {visible.map((p) => (
              <CatalogProductCard
                key={p.id}
                product={p}
                onClick={() => setEditing(p)} />
            ))}
          </div>
        )}
      </div>

      {editing !== null && (
        <ProductEditModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved} />
      )}
    </>
  );
}

window.CatalogView = CatalogView;
