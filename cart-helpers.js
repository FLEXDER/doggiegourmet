/* ============================================================
   DOGGIE GOURMET — cart-helpers.js
   Constantes globales y funciones utilitarias puras (sin React).
   Todo se expone vía window.* para que los demás módulos del cart
   puedan consumirlo. Este archivo se carga PRIMERO de los cart-*.
   ============================================================ */

window.CART_STORAGE_KEY = 'dg_cart_v1';
window.CART_MIN_TOTAL = 500;
window.CART_WHATSAPP = '523318440265';

// La WEB3FORMS_KEY se movió al servidor (Edge Function de Supabase)
// por seguridad. El frontend solo invoca submit-order, no maneja la key.
window.CART_SUPABASE_URL = 'https://oaurovkvyrywmdsjhgaj.supabase.co';
window.CART_SUPABASE_KEY = 'sb_publishable_4ORlrwn6sRWVEQ_XTwiOwQ_wbI0UTwF';

/**
 * Formatea un número como moneda mexicana sin símbolo.
 * formatMXN(1234) → "1,234"
 */
window.formatMXN = function (n) {
  return Number(n || 0).toLocaleString('es-MX');
};

/**
 * Construye el texto del pedido para mandar por WhatsApp.
 * Recibe el array de items y el total calculado.
 */
window.buildOrderText = function (items, total) {
  const lines = [];
  lines.push('¡Hola! Quisiera hacer un pedido Doggie Gourmet');
  lines.push('');
  items.forEach((it, i) => {
    lines.push(
      `${i + 1}. ${it.name} (${it.size}) x${it.quantity} — $${(it.price * it.quantity).toLocaleString('es-MX')}`
    );
  });
  lines.push('');
  lines.push(`*Total: $${total.toLocaleString('es-MX')} MXN*`);
  lines.push('');
  lines.push('¿Me ayudan a confirmar disponibilidad y entrega?');
  return lines.join('\n');
};

/**
 * Llama a la Edge Function submit-order para guardar pedido en BD
 * y mandar correo desde el servidor (con la WEB3FORMS_KEY oculta).
 * No es bloqueante: si falla, regresa null y se ignora el error.
 */
window.submitOrderToBackend = async function (items) {
  try {
    const payload = {
      items: items.map((it) => ({
        id: it.id,
        name: it.name,
        size: it.size,
        img: it.img,
        price: it.price,
        quantity: it.quantity
      }))
    };

    const response = await fetch(
      `${window.CART_SUPABASE_URL}/functions/v1/submit-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': window.CART_SUPABASE_KEY,
          'Authorization': `Bearer ${window.CART_SUPABASE_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.warn('Edge Function error (no bloqueante):', response.status, errorBody);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('Submit order failed (no bloqueante):', err);
    return null;
  }
};

/**
 * Abre WhatsApp con un mensaje pre-armado para pedidos al mayoreo.
 */
window.openWholesaleWhatsapp = function () {
  const text = encodeURIComponent(
    '¡Hola! Quiero información para pedidos al mayoreo de Doggie Gourmet.'
  );
  window.open(`https://wa.me/${window.CART_WHATSAPP}?text=${text}`, '_blank');
};
