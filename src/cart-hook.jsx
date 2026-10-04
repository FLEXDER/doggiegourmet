/* ============================================================
   DOGGIE GOURMET — cart-hook.jsx
   Hooks de React que conectan los componentes al store.
   Cualquier componente que use estos hooks se re-renderiza
   automáticamente cuando el carrito cambia.

   Depende de: cart-store.js (cartStore)
   Expone:    useCart, useCartItemQuantity
   ============================================================ */

import { useState as useSCart, useEffect as useECart, useMemo as useMCart } from 'react';
import { cartStore } from './cart-store';

/**
 * Hook principal del carrito. Retorna el estado completo + totales.
 * Se re-renderiza cuando el carrito cambia (escuchando 'cart-changed').
 *
 * Uso:
 *   const { items, total, count } = useCart();
 */
export const useCart = function () {
  const [items, setItems] = useSCart(cartStore.getItems());

  useECart(() => {
    const handler = () => setItems(cartStore.getItems());
    window.addEventListener('cart-changed', handler);
    return () => window.removeEventListener('cart-changed', handler);
  }, []);

  const total = useMCart(
    () => items.reduce((a, it) => a + it.price * it.quantity, 0),
    [items]
  );
  const count = useMCart(
    () => items.reduce((a, it) => a + it.quantity, 0),
    [items]
  );

  return { items, total, count };
};

/**
 * Hook para obtener la cantidad de un producto específico en el carrito.
 * Re-renderiza automáticamente cuando cambia. Útil para mostrar +/- en
 * cards de productos donde solo importa esa pieza.
 *
 * Uso:
 *   const qty = useCartItemQuantity('barf-original-500');
 */
export const useCartItemQuantity = function (productId) {
  const [qty, setQty] = useSCart(() => {
    const item = cartStore.getItems().find((it) => it.id === productId);
    return item ? item.quantity : 0;
  });

  useECart(() => {
    const handler = () => {
      const item = cartStore.getItems().find((it) => it.id === productId);
      setQty(item ? item.quantity : 0);
    };
    window.addEventListener('cart-changed', handler);
    return () => window.removeEventListener('cart-changed', handler);
  }, [productId]);

  return qty;
};
