/* global React, Icon */
/* ============================================================
   DOGGIE GOURMET — cart-toast.jsx
   Toast (notificación) que aparece arriba a la derecha cuando
   el usuario agrega un producto al carrito. Auto-desaparece
   después de 3 segundos.

   Se suprime automáticamente cuando el drawer del carrito está
   abierto (para no duplicar feedback al usuario).

   Depende de: Icon (global), evento custom 'cart-toast'
   Expone:    window.CartToast
   ============================================================ */

const { useState: useSToast, useEffect: useEToast } = React;

function CartToast({ suppressed = false }) {
  const [toast, setToast] = useSToast(null); // { product, id }
  const [visible, setVisible] = useSToast(false);

  useEToast(() => {
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

  if (!toast || suppressed) return null;

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
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--brown)',
            marginBottom: 2
          }}>
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
        {toast.product.img && (
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
        )}
      </div>
    </div>
  );
}

window.CartToast = CartToast;
