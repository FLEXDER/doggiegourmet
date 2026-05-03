/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — Sistema de carrito de compras
   - State global con localStorage
   - Eventos custom para sincronizar componentes
   - CartDrawer (panel lateral derecho)
   - CartButton (ícono nav con badge)
   - Toast (notificación al agregar)
   - Mínimo de compra $500
   ============================================================ */

const { useState: useSC, useEffect: useEC, useMemo: useMC } = React;

const CART_STORAGE_KEY = 'dg_cart_v1';
const CART_MIN_TOTAL = 500;
const CART_WHATSAPP = '523318440265';
const CART_WEB3FORMS_KEY = '242b11d0-38a4-48f3-b031-fa3730aac48d';

/* ============================================================
   STORE: funciones globales del carrito
   ============================================================ */
window.cartStore = (function () {
  let items = [];

  // Carga inicial desde localStorage
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) items = JSON.parse(raw) || [];
  } catch (e) {
    items = [];
  }

  const persist = () => {
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
    window.dispatchEvent(new CustomEvent('cart-changed'));
  };

  const emitToast = (product) => {
    window.dispatchEvent(new CustomEvent('cart-toast', { detail: { product } }));
  };

  return {
    getItems: () => items.slice(),

    add: (product) => {
      const existing = items.find(it => it.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({
          id: product.id,
          name: product.name,
          price: Number(product.price) || 0,
          img: product.img,
          size: product.size || '',
          tag: product.tag || '',
          quantity: 1
        });
      }
      persist();
      emitToast(product);
    },

    remove: (id) => {
      items = items.filter(it => it.id !== id);
      persist();
    },

    setQuantity: (id, quantity) => {
      const q = Math.max(0, Math.floor(Number(quantity) || 0));
      const item = items.find(it => it.id === id);
      if (!item) return;
      if (q === 0) {
        items = items.filter(it => it.id !== id);
      } else {
        item.quantity = q;
      }
      persist();
    },

    increment: (id) => {
      const item = items.find(it => it.id === id);
      if (item) {
        item.quantity += 1;
        persist();
      }
    },

    decrement: (id) => {
      const item = items.find(it => it.id === id);
      if (!item) return;
      if (item.quantity <= 1) {
        items = items.filter(it => it.id !== id);
      } else {
        item.quantity -= 1;
      }
      persist();
    },

    clear: () => {
      items = [];
      persist();
    },

    getCount: () => items.reduce((a, it) => a + it.quantity, 0),
    getTotal: () => items.reduce((a, it) => a + it.price * it.quantity, 0)
  };
})();

/* ============================================================
   HOOK: useCart — re-renderiza cuando el carrito cambia
   ============================================================ */
function useCart() {
  const [items, setItems] = useSC(window.cartStore.getItems());

  useEC(() => {
    const handler = () => setItems(window.cartStore.getItems());
    window.addEventListener('cart-changed', handler);
    return () => window.removeEventListener('cart-changed', handler);
  }, []);

  const total = useMC(() => items.reduce((a, it) => a + it.price * it.quantity, 0), [items]);
  const count = useMC(() => items.reduce((a, it) => a + it.quantity, 0), [items]);

  return { items, total, count };
}

/* ============================================================
   CART BUTTON — ícono en el nav con badge
   ============================================================ */
function CartButton({ onClick }) {
  const { count } = useCart();
  return (
    <button
      onClick={onClick}
      aria-label="Carrito"
      style={{
        position: 'relative',
        background: 'transparent',
        border: '1.5px solid var(--line)',
        borderRadius: 100,
        width: 42,
        height: 42,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--brown)',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brown)'; e.currentTarget.style.background = 'var(--paper)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.background = 'transparent'; }}>
      <Icon name="cart" size={18} />
      {count > 0 &&
        <span style={{
          position: 'absolute',
          top: -4,
          right: -4,
          background: 'var(--green)',
          color: 'white',
          borderRadius: 100,
          minWidth: 20,
          height: 20,
          fontSize: 11,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 6px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          {count}
        </span>
      }
    </button>);

}

window.CartButton = CartButton;

/* ============================================================
   TOAST — notificación al agregar
   ============================================================ */
function CartToast() {
  const [toast, setToast] = useSC(null); // {product, id}
  const [visible, setVisible] = useSC(false);

  useEC(() => {
    let timer;
    const handler = (e) => {
      const product = e.detail.product;
      setToast({ product, id: Date.now() });
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setVisible(false), 3000);
    };
    window.addEventListener('cart-toast', handler);
    return () => {
      window.removeEventListener('cart-toast', handler);
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 9999,
      pointerEvents: 'none',
      transform: visible ? 'translateX(0)' : 'translateX(120%)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{
        background: 'var(--paper)',
        border: '1.5px solid var(--line-strong)',
        borderRadius: 14,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        boxShadow: '0 10px 30px -8px rgba(74, 59, 16, 0.25)',
        maxWidth: 340,
        pointerEvents: 'auto'
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 100,
          background: 'rgba(115, 150, 60, 0.12)',
          color: 'var(--green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon name="check" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--brown)', marginBottom: 2 }}>
            Agregado al carrito
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--brown-soft)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {toast.product.name}
          </div>
        </div>
        {toast.product.img &&
          <img
            src={toast.product.img}
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: 'cover',
              border: '1px solid var(--line)',
              flexShrink: 0
            }} />
        }
      </div>
    </div>);

}

window.CartToast = CartToast;

/* ============================================================
   CART DRAWER — panel lateral derecho
   ============================================================ */
function CartDrawer({ open, onClose }) {
  const { items, total, count } = useCart();
  const [sending, setSending] = useSC(false);

  // Listener Escape para cerrar (no bloqueamos el scroll del body
  // para que el usuario pueda seguir navegando el catálogo con el drawer abierto)
  useEC(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const meetsMinimum = total >= CART_MIN_TOTAL;
  const missing = Math.max(0, CART_MIN_TOTAL - total);

  const buildOrderText = () => {
    const lines = [];
    lines.push('*Pedido Doggie Gourmet*');
    lines.push('');
    items.forEach((it, i) => {
      lines.push(`${i + 1}. ${it.name} (${it.size}) x${it.quantity} — $${(it.price * it.quantity).toLocaleString('es-MX')}`);
    });
    lines.push('');
    lines.push(`*Total: $${total.toLocaleString('es-MX')} MXN*`);
    lines.push('');
    lines.push('¿Me ayudan a confirmar disponibilidad y entrega?');
    return lines.join('\n');
  };

  const sendNotificationEmail = async () => {
    try {
      const productosTxt = items.map((it, i) =>
        `${String(i + 1).padStart(2, '0')}. ${it.name} (${it.size}) — ${it.quantity} uds. — $${(it.price * it.quantity).toLocaleString('es-MX')}`
      ).join('\n');

      const message =
        `NUEVO PEDIDO — DOGGIE GOURMET\n` +
        `${'─'.repeat(40)}\n\n` +
        `Fecha: ${new Date().toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}\n` +
        `Total: $${total.toLocaleString('es-MX')} MXN\n` +
        `Productos: ${count} unidades en ${items.length} líneas\n\n` +
        `DETALLE\n${'─'.repeat(40)}\n${productosTxt}\n\n` +
        `El cliente fue redirigido a WhatsApp para confirmar el pedido.`;

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: CART_WEB3FORMS_KEY,
          subject: `Nuevo pedido en línea · $${total.toLocaleString('es-MX')} MXN`,
          from_name: 'Doggie Gourmet · Tienda en línea',
          message,
          total: total,
          unidades: count,
          lineas: items.length
        })
      });
    } catch (err) {
      console.warn('Email notification failed (no bloqueante):', err);
    }
  };

  const proceedToCheckout = async () => {
    if (!meetsMinimum || sending) return;
    setSending(true);
    // 1) Mandar correo (no bloqueante)
    sendNotificationEmail();
    // 2) Abrir WhatsApp
    const text = encodeURIComponent(buildOrderText());
    window.open(`https://wa.me/${CART_WHATSAPP}?text=${text}`, '_blank');
    setSending(false);
  };

  const openWholesaleWhatsapp = () => {
    const text = encodeURIComponent('¡Hola! Quiero información para pedidos al mayoreo de Doggie Gourmet.');
    window.open(`https://wa.me/${CART_WHATSAPP}?text=${text}`, '_blank');
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
        maxWidth: 420,
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.length === 0 ?
            <div style={{
              textAlign: 'center',
              padding: '60px 30px',
              color: 'var(--brown-soft)'
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
            </div> :

            items.map((it) =>
              <div key={it.id} style={{
                display: 'flex',
                gap: 14,
                padding: '14px 24px',
                borderBottom: '1px solid var(--line)'
              }}>
                {/* Imagen */}
                <div style={{
                  width: 76,
                  height: 76,
                  borderRadius: 10,
                  background: it.img ? `url(${it.img}) center/cover` : 'var(--cream)',
                  border: '1px solid var(--line)',
                  flexShrink: 0
                }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    color: 'var(--brown)',
                    fontSize: 14,
                    lineHeight: 1.3,
                    marginBottom: 2
                  }}>
                    {it.name}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: 'var(--brown-soft)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.04em',
                    marginBottom: 8
                  }}>
                    {it.size} · ${it.price} c/u
                  </div>

                  {/* Controles cantidad + total */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0,
                      border: '1.5px solid var(--line)',
                      borderRadius: 100,
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => window.cartStore.decrement(it.id)}
                        aria-label="Quitar uno"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          width: 28,
                          height: 28,
                          cursor: 'pointer',
                          color: 'var(--brown)',
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                        −
                      </button>
                      <div style={{
                        minWidth: 30,
                        textAlign: 'center',
                        fontWeight: 600,
                        color: 'var(--brown)',
                        fontSize: 13
                      }}>
                        {it.quantity}
                      </div>
                      <button
                        onClick={() => window.cartStore.increment(it.id)}
                        aria-label="Agregar uno"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          width: 28,
                          height: 28,
                          cursor: 'pointer',
                          color: 'var(--brown)',
                          fontSize: 14,
                          fontWeight: 600
                        }}>
                        +
                      </button>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--green-dark)'
                    }}>
                      ${(it.price * it.quantity).toLocaleString('es-MX')}
                    </div>
                  </div>
                </div>

                {/* Eliminar */}
                <button
                  onClick={() => window.cartStore.remove(it.id)}
                  aria-label="Eliminar"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--brown-soft)',
                    cursor: 'pointer',
                    padding: 4,
                    height: 'fit-content',
                    fontSize: 14
                  }}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            )
          }
        </div>

        {/* Footer — total + checkout */}
        {items.length > 0 &&
          <div style={{
            padding: '18px 24px 22px',
            borderTop: '1px solid var(--line-strong)',
            background: 'var(--paper)',
            flexShrink: 0
          }}>
            {/* Aviso de minimo */}
            {!meetsMinimum &&
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
                <strong>Faltan ${missing.toLocaleString('es-MX')} MXN</strong> para llegar al pedido mínimo de ${CART_MIN_TOTAL} MXN.
              </div>
            }

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
                ${total.toLocaleString('es-MX')} <span style={{ fontSize: 14, color: 'var(--brown-soft)', fontWeight: 500 }}>MXN</span>
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
                padding: '16px 20px',
                borderRadius: 100,
                fontFamily: 'inherit',
                fontSize: 15,
                fontWeight: 600,
                cursor: meetsMinimum ? 'pointer' : 'not-allowed',
                opacity: meetsMinimum ? 1 : 0.55,
                transition: 'all 0.15s ease',
                marginBottom: 10
              }}>
              {sending ? 'Procesando...' : meetsMinimum ? 'Proceder al pedido' : `Mínimo $${CART_MIN_TOTAL} MXN`}
            </button>

            {/* Aviso de mayoreo */}
            <div style={{
              padding: '12px 14px',
              background: 'var(--cream)',
              borderRadius: 10,
              border: '1px solid var(--line)',
              fontSize: 12.5,
              color: 'var(--brown)',
              lineHeight: 1.5
            }}>
              <strong style={{ display: 'block', marginBottom: 4, color: 'var(--brown)' }}>
                ¿Pedido más grande?
              </strong>
              <span style={{ color: 'var(--brown-soft)' }}>
                Si tu pedido es de mayor volumen, los precios pueden mejorar dependiendo de la cantidad. Contáctanos directo para cotizarlo.
              </span>
              <button
                onClick={openWholesaleWhatsapp}
                style={{
                  marginTop: 10,
                  width: '100%',
                  background: '#25D366',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 100,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}>
                Cotizar por WhatsApp
              </button>
            </div>

            {/* Nota legal */}
            <p style={{
              fontSize: 11,
              color: 'var(--brown-soft)',
              marginTop: 10,
              marginBottom: 0,
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              Al continuar, te llevamos a WhatsApp para confirmar entrega y pago.
            </p>
          </div>
        }
      </aside>
    </>);

}

window.CartDrawer = CartDrawer;

/* ============================================================
   API pública para agregar al carrito desde otros componentes
   ============================================================ */
window.addToCart = (product) => {
  if (!product || !product.id) return;
  window.cartStore.add(product);
};
