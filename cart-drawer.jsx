/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — cart-drawer.jsx
   Drawer (panel lateral derecho) con la lista completa de
   productos en el carrito, controles de cantidad, total,
   bypass de mayoreo y botón de checkout que dispara la
   Edge Function submit-order + abre WhatsApp.

   No bloquea el scroll del body, así el usuario puede seguir
   navegando el catálogo con el drawer abierto.

   Depende de: cart-hook.jsx (window.useCart), cart-helpers.js
              (constantes + buildOrderText + submitOrderToBackend
              + openWholesaleWhatsapp), Icon (global)
   Expone:    window.CartDrawer
   ============================================================ */

const { useState: useSDrawer, useEffect: useEDrawer } = React;

function CartDrawer({ open, onClose }) {
  const { items, total, count } = window.useCart();
  const [sending, setSending] = useSDrawer(false);

  // Listener Escape para cerrar (no bloqueamos el scroll del body para
  // que el usuario pueda seguir navegando el catálogo con el drawer abierto)
  useEDrawer(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const meetsMinimum = total >= window.CART_MIN_TOTAL;
  const missing = Math.max(0, window.CART_MIN_TOTAL - total);

  const proceedToCheckout = async () => {
    if (!meetsMinimum || sending) return;
    setSending(true);

    // 1) Submit al backend (guarda en BD + manda correo desde el server).
    //    No await: no bloqueamos al usuario, que pueda abrir WhatsApp en
    //    paralelo. Si el backend falla, igual abrimos WhatsApp.
    window.submitOrderToBackend(items);

    // 2) Abrir WhatsApp con el pedido pre-armado
    const text = encodeURIComponent(window.buildOrderText(items, total));
    window.open(`https://wa.me/${window.CART_WHATSAPP}?text=${text}`, '_blank');

    setSending(false);
  };

  return (
    <>
      {/* Drawer (sin backdrop — permite seguir navegando el catálogo) */}
      <aside style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: 500,
        background: 'var(--paper)',
        zIndex: 999,
        boxShadow: '-20px 0 60px -10px rgba(74, 59, 16, 0.18)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: open ? 'auto' : 'none'
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)',
              color: 'var(--brown-soft)',
              marginBottom: 2,
              fontWeight: 600
            }}>
              Tu carrito
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              color: 'var(--brown)',
              margin: 0,
              letterSpacing: '-0.01em'
            }}>
              {count === 0 ? 'Vacío' : `${count} ${count === 1 ? 'producto' : 'productos'}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'transparent',
              border: '1.5px solid var(--line)',
              borderRadius: 100,
              width: 36,
              height: 36,
              cursor: 'pointer',
              color: 'var(--brown)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Body — productos */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--paper)',
          minHeight: 0
        }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 30px',
              color: 'var(--brown-soft)',
              background: 'var(--paper)'
            }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: 100,
                background: 'var(--cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                color: 'var(--brown-soft)'
              }}>
                <Icon name="cart" size={26} />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--brown)',
                margin: '0 0 6px',
                fontWeight: 600
              }}>
                Aún no hay productos
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                Explora el catálogo y agrega tus favoritos.
              </p>
            </div>
          ) : (
            items.map((it) => (
              <div key={it.id} style={{
                display: 'flex',
                gap: 14,
                padding: '16px 24px',
                borderBottom: '1px solid var(--line)',
                background: 'var(--paper)',
                position: 'relative'
              }}>
                {/* Imagen */}
                <div style={{
                  width: 90,
                  height: 90,
                  borderRadius: 12,
                  background: 'var(--cream)',
                  border: '1px solid var(--line)',
                  flexShrink: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {it.img && (
                    <img
                      src={it.img}
                      alt={it.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                      }} />
                  )}
                </div>

                {/* Info */}
                <div style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ paddingRight: 24 }}>
                    <div style={{
                      fontWeight: 600,
                      color: 'var(--brown)',
                      fontSize: 15,
                      lineHeight: 1.25,
                      marginBottom: 4
                    }}>
                      {it.name}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: 'var(--brown-soft)',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em'
                    }}>
                      {it.size} · ${it.price} c/u
                    </div>
                  </div>

                  {/* Controles cantidad + total línea */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8
                  }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0,
                      border: '1.5px solid var(--line)',
                      borderRadius: 100,
                      overflow: 'hidden',
                      background: 'var(--paper)'
                    }}>
                      <button
                        onClick={() => window.cartStore.decrement(it.id)}
                        aria-label="Quitar uno"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          width: 30,
                          height: 30,
                          cursor: 'pointer',
                          color: 'var(--brown)',
                          fontSize: 16,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        −
                      </button>
                      <div style={{
                        minWidth: 32,
                        textAlign: 'center',
                        fontWeight: 700,
                        color: 'var(--brown)',
                        fontSize: 14
                      }}>
                        {it.quantity}
                      </div>
                      <button
                        onClick={() => window.cartStore.increment(it.id)}
                        aria-label="Agregar uno"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          width: 30,
                          height: 30,
                          cursor: 'pointer',
                          color: 'var(--brown)',
                          fontSize: 16,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        +
                      </button>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--green-dark)',
                      letterSpacing: '-0.01em'
                    }}>
                      ${(it.price * it.quantity).toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>

                {/* Eliminar (esquina superior derecha) */}
                <button
                  onClick={() => window.cartStore.remove(it.id)}
                  aria-label="Eliminar"
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 18,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brown-soft)',
                    cursor: 'pointer',
                    padding: 4,
                    fontSize: 14,
                    opacity: 0.6,
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.6; }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer — total + checkout (solo si hay items) */}
        {items.length > 0 && (
          <div style={{
            padding: '18px 24px 22px',
            borderTop: '1px solid var(--line-strong)',
            background: 'var(--paper)',
            flexShrink: 0
          }}>
            {/* Aviso de mínimo */}
            {!meetsMinimum && (
              <div style={{
                background: '#fef5e7',
                border: '1px solid #f5d99a',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 12,
                fontSize: 12.5,
                color: '#8a6d1f',
                lineHeight: 1.4
              }}>
                <strong>Faltan ${missing.toLocaleString('es-MX')} MXN</strong> para llegar al pedido mínimo de ${window.CART_MIN_TOTAL} MXN.
              </div>
            )}

            {/* Total */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 14
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--brown-soft)',
                fontWeight: 600
              }}>
                Total
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--brown)',
                letterSpacing: '-0.02em'
              }}>
                ${total.toLocaleString('es-MX')}{' '}
                <span style={{ fontSize: 14, color: 'var(--brown-soft)', fontWeight: 500 }}>
                  MXN
                </span>
              </div>
            </div>

            {/* Botón checkout */}
            <button
              onClick={proceedToCheckout}
              disabled={!meetsMinimum || sending}
              style={{
                width: '100%',
                background: meetsMinimum ? 'var(--green)' : 'var(--brown-soft)',
                color: 'white',
                border: 'none',
                padding: '14px 20px',
                borderRadius: 100,
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                cursor: meetsMinimum ? 'pointer' : 'not-allowed',
                opacity: meetsMinimum ? 1 : 0.55,
                transition: 'all 0.15s ease'
              }}>
              {sending ? 'Procesando...' : meetsMinimum ? 'Proceder al pedido' : `Mínimo $${window.CART_MIN_TOTAL} MXN`}
            </button>

            {/* Aviso de mayoreo (compacto, una sola fila) */}
            <div style={{
              marginTop: 10,
              padding: '10px 12px',
              background: 'var(--cream)',
              borderRadius: 10,
              border: '1px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              color: 'var(--brown)',
              lineHeight: 1.35
            }}>
              <span style={{ flex: 1 }}>
                <strong>¿Pedido más grande?</strong>{' '}
                <span style={{ color: 'var(--brown-soft)' }}>Mejor precio por volumen.</span>
              </span>
              <button
                onClick={window.openWholesaleWhatsapp}
                style={{
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: 100,
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                Cotizar
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

window.CartDrawer = CartDrawer;
