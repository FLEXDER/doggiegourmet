/* ============================================================
   DOGGIE GOURMET — cart-button.jsx
   Botón del nav que muestra el ícono de carrito con badge
   de cantidad. Cuando se le da click, abre el drawer.

   Depende de: cart-hook.jsx (useCart), Icon
   Expone:    CartButton
   ============================================================ */

import { Icon } from './icon';
import { useCart } from './cart-hook';

export function CartButton({ onClick }) {
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
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--brown)';
        e.currentTarget.style.background = 'var(--paper)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)';
        e.currentTarget.style.background = 'transparent';
      }}>
      <Icon name="cart" size={18} />
      {count > 0 && (
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
      )}
    </button>
  );
}

