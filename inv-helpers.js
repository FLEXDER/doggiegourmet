/* ============================================================
   DOGGIE GOURMET — inv-helpers.js
   Constantes globales del módulo de inventario.
   Se carga PRIMERO de los archivos inv-*.

   La WEB3FORMS_KEY se movió a la Edge Function submit-inventory-report
   (Supabase) para que no quede expuesta en el frontend. El form solo
   conoce la URL del endpoint, no la access_key.
   ============================================================ */

window.INV_SUBMIT_REPORT_URL =
  'https://oaurovkvyrywmdsjhgaj.supabase.co/functions/v1/submit-inventory-report';

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
