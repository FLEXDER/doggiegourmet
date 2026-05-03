/* ============================================================
   DOGGIE GOURMET — cart-store.js
   Estado global del carrito con persistencia en localStorage y
   eventos custom para que React se entere de los cambios.

   Depende de: cart-helpers.js (constantes window.CART_*)
   Expone:    window.cartStore, window.addToCart
   ============================================================ */

window.cartStore = (function () {
  let items = [];

  // Carga inicial desde localStorage
  try {
    const raw = localStorage.getItem(window.CART_STORAGE_KEY);
    if (raw) items = JSON.parse(raw) || [];
  } catch (e) {
    items = [];
  }

  /**
   * Persiste a localStorage y dispara evento global para que
   * los hooks (useCart, useCartItemQuantity) se re-rendericen.
   */
  const persist = () => {
    try {
      localStorage.setItem(window.CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // localStorage puede estar deshabilitado (modo incógnito estricto, etc).
      // No bloqueamos al usuario, solo no persiste entre sesiones.
    }
    window.dispatchEvent(new CustomEvent('cart-changed'));
  };

  /**
   * Dispara evento custom para que CartToast muestre la notificación.
   */
  const emitToast = (product) => {
    window.dispatchEvent(new CustomEvent('cart-toast', { detail: { product } }));
  };

  return {
    getItems: () => items.slice(),

    add: (product) => {
      const existing = items.find((it) => it.id === product.id);
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
      items = items.filter((it) => it.id !== id);
      persist();
    },

    setQuantity: (id, quantity) => {
      const q = Math.max(0, Math.floor(Number(quantity) || 0));
      const item = items.find((it) => it.id === id);
      if (!item) return;
      if (q === 0) {
        items = items.filter((it) => it.id !== id);
      } else {
        item.quantity = q;
      }
      persist();
    },

    increment: (id) => {
      const item = items.find((it) => it.id === id);
      if (item) {
        item.quantity += 1;
        persist();
      }
    },

    decrement: (id) => {
      const item = items.find((it) => it.id === id);
      if (!item) return;
      if (item.quantity <= 1) {
        items = items.filter((it) => it.id !== id);
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

/**
 * API pública para agregar al carrito desde otros componentes.
 * Es un atajo: window.addToCart(product) === window.cartStore.add(product)
 * pero con validación mínima.
 */
window.addToCart = function (product) {
  if (!product || !product.id) return;
  window.cartStore.add(product);
};
