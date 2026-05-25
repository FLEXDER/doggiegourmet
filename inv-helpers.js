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
 * Productos agrupados por categoría para los chips Quick-add del form POS.
 * El form muestra chips BARF/Paletas/Perfumes y al tap expande los productos
 * de esa categoría para que el POS los seleccione con un tap en lugar de
 * tener que escribir el nombre completo.
 */
window.INV_PRODUCT_CATEGORIES = {
  barf: {
    label: 'BARF',
    products: [
      'BARF Original 500g',
      'BARF Original Perros Chicos 250g',
      'BARF Gatos 250g',
      'BARF Premium 500g',
      'BARF Original con Betabel 500g'
    ]
  },
  paletas: {
    label: 'Paletas',
    products: [
      'Paleta Plátano 90g',
      'Paleta Zanahoria 90g',
      'Paleta Pollo 90g',
      'Paleta Hígado 90g'
    ]
  },
  perfumes: {
    label: 'Perfumes',
    products: [
      'Perfume Bad Pup 100ml',
      'Perfume Fur Leather 100ml',
      'Perfume Dog Sauvage 100ml',
      'Perfume Woof Girl 100ml',
      'Perfume Pawer Bomb 100ml',
      'Perfume La Vie Est Woof 100ml'
    ]
  }
};

/**
 * Sugerencias planas (legacy). Se genera desde INV_PRODUCT_CATEGORIES para
 * mantener una sola fuente de verdad. Usado por el datalist del input
 * "Nombre del producto" en el form POS.
 */
window.INV_PRODUCT_SUGGESTIONS = Object.values(window.INV_PRODUCT_CATEGORIES)
  .flatMap((cat) => cat.products);

/**
 * Lista de puntos de venta para el InventoryView (admin).
 * Estos IDs deben coincidir con los IDs en la tabla `points_of_sale`
 * de Supabase para que la persistencia funcione.
 */
window.INV_POS_LIST = [
  { id: 'vitalpets', name: 'VitalPets', business: 'Hospital Veterinario VitalPets' },
  { id: 'animalia', name: 'Animalia', business: 'Animalia Clínica Veterinaria' },
  { id: 'wuftown', name: 'Wuftown', business: 'Wuftown' },
  { id: 'venelatto', name: 'Venelatto', business: 'Venelatto' },
  { id: 'paleteria-michoacana', name: 'Paletería La Michoacana', business: 'Paletería La Michoacana' },
  { id: 'gran-michoacana', name: 'La Gran Michoacana', business: 'La Gran Michoacana' },
  { id: 'hielito-lindo', name: 'Hielito Lindo', business: 'Hielito Lindo Nieve de Garrafa' }
];
