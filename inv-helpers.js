/* ============================================================
   DOGGIE GOURMET — inv-helpers.js
   Constantes globales del módulo de inventario.
   Se carga PRIMERO de los archivos inv-*.

   NOTA DE SEGURIDAD: WEB3FORMS_KEY está hardcodeada aquí.
   Pendiente: migrar el envío de notificaciones a una Edge
   Function (similar a submit-order y submit-contact) para
   ocultar la key. No es bloqueante: el flujo es interno
   (POSes reportando inventario), no clientes finales.
   ============================================================ */

window.INV_WEB3FORMS_KEY = '242b11d0-38a4-48f3-b031-fa3730aac48d';
window.INV_WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/**
 * Sugerencias de productos para el datalist del form POS.
 * Permite que los puntos de venta vean opciones rápidas en
 * lugar de tener que escribir nombres de productos completos.
 */
window.INV_PRODUCT_SUGGESTIONS = [
  'BARF Original 500g',
  'BARF Original Perros Chicos 250g',
  'BARF Gatos 250g',
  'BARF Premium 500g',
  'BARF Original con Betabel 500g',
  'Paleta Plátano 90g',
  'Paleta Zanahoria 90g',
  'Paleta Pollo 90g',
  'Paleta Hígado 90g',
  'Perfume Bad Pup 100ml',
  'Perfume Fur Leather 100ml',
  'Perfume Dog Sauvage 100ml',
  'Perfume Woof Girl 100ml',
  'Perfume Pawer Bomb 100ml',
  'Perfume La Vie Est Woof 100ml'
];

/**
 * Lista de puntos de venta para el InventoryView (admin).
 * Estos IDs deben coincidir con los IDs en la tabla `puntos_venta`
 * de Supabase para que la persistencia funcione.
 */
window.INV_POS_LIST = [
  { id: 'vitalpets', name: 'VitalPets', business: 'Hospital Veterinario VitalPets' },
  { id: 'wuftown', name: 'Wuftown', business: 'Wuftown' },
  { id: 'venelatto', name: 'Venelatto', business: 'Venelatto' }
];
