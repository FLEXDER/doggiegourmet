// Catálogo de productos
window.PRODUCTS = {
  barf: {
    id: 'barf',
    label: 'BARF',
    title: 'Alimento crudo, perfectamente porcionado',
    desc: 'Alimentación biológicamente apropiada formulada por nutriólogos veterinarios. Congelado en su punto máximo de frescura.',
    items: [
      { id: 'barf-original-500', name: 'Original', tag: 'Pollo', size: '500 g', sku: 'DG-OR-500', img: 'assets/products/barf-original-500.webp', desc: 'Mezcla BARF a base de pollo con verduras y suplementos. Nuestra fórmula favorita para perros adultos.' },
      { id: 'barf-original-250', name: 'Original Perros Chicos', tag: 'Razas pequeñas', size: '250 g', sku: 'DG-OS-250', img: 'assets/products/barf-original-perros-chicos-250.webp', desc: 'Porciones reducidas para razas pequeñas, cachorros y perros toy. La misma fórmula confiable.' },
      { id: 'barf-cats-250', name: 'Gatos', tag: 'Felinos', size: '250 g', sku: 'DG-CA-250', img: 'assets/products/barf-gatos-250.webp', desc: 'Balanceado especialmente para nutrición felina, con taurina y carnes altas en proteína.' },
      { id: 'barf-premium-500', name: 'Premium', tag: '70% Pollo / 30% Carne', size: '500 g', sku: 'DG-PR-500', img: 'assets/products/barf-premium-500.webp', desc: 'Nuestra mezcla más completa con pollo y carne de res, ideal para perros activos y de alta energía.' },
      { id: 'barf-betabel-500', name: 'Original con Betabel', tag: 'Con remolacha', size: '500 g', sku: 'DG-BT-500', img: 'assets/products/betabel-500.webp', desc: 'La receta original enriquecida con betabel para más antioxidantes y un pelaje saludable.' },
    ],
  },
  paletas: {
    id: 'paletas',
    label: 'Paletas',
    title: 'Deliciosas y saludables paletas para refrescar a tu mascota',
    desc: 'Un snack único y diferente.',
    items: [
      { id: 'paleta-platano', name: 'Plátano', tag: 'Banana', size: '90 g', sku: 'DG-PL-PLA', img: 'assets/products/paleta-platano.webp', desc: 'Paleta de plátano natural, dulce y rica en potasio.' },
      { id: 'paleta-zanahoria', name: 'Zanahoria', tag: 'Carrot', size: '90 g', sku: 'DG-PL-ZAN', img: 'assets/products/paleta-zanahoria.webp', desc: 'Paleta de zanahoria, crujiente al medio descongelar. Beta-caroteno para una vista sana.' },
      { id: 'paleta-pollo', name: 'Pollo', tag: 'Chicken', size: '90 g', sku: 'DG-PL-POL', img: 'assets/products/paleta-pollo.webp', desc: 'Paleta de caldo de pollo, sabrosa e hidratante para los días calurosos.' },
      { id: 'paleta-higado', name: 'Hígado', tag: 'Liver', size: '90 g', sku: 'DG-PL-HIG', img: 'assets/products/paleta-higado.webp', desc: 'Paleta de hígado — premio favorito de entrenadores y consentido de cualquier perro.' },
    ],
  },
  perfumes: {
    id: 'perfumes',
    label: 'Perfumes',
    title: 'Perfumes premium diseñados para consentir a tu mascota',
    desc: 'Con ingredientes seguros para su piel, un aroma delicioso y sin preocupaciones. Inspirados en fragancias de lujo.',
    items: [
      { id: 'perfume-bad-pup', name: 'Bad Pup', tag: 'Macho', size: '100 ml', sku: 'DG-PF-BP', img: 'assets/products/perfume-bad-pup.webp', desc: 'Inspirado en Bad Boy. Atrevido, amaderado y moderno.' },
      { id: 'perfume-fur-leather', name: 'Fur Leather', tag: 'Macho', size: '100 ml', sku: 'DG-PF-FL', img: 'assets/products/perfume-fur-leather.webp', desc: 'Inspirado en Ombré Leather. Ahumado, refinado y masculino.' },
      { id: 'perfume-dog-sauvage', name: 'Dog Sauvage', tag: 'Macho', size: '100 ml', sku: 'DG-PF-DS', img: 'assets/products/perfume-dog-sauvage.webp', desc: 'Inspirado en Sauvage. Fresco, especiado y libre.' },
      { id: 'perfume-woof-girl', name: 'Woof Girl', tag: 'Hembra', size: '100 ml', sku: 'DG-PF-WG', img: 'assets/products/perfume-woof-girl.webp', desc: 'Inspirado en Good Girl. Floral, seguro y elegante.' },
      { id: 'perfume-pawer-bomb', name: 'Pawer Bomb', tag: 'Hembra', size: '100 ml', sku: 'DG-PF-PB', img: 'assets/products/perfume-pawer-bomb.webp', desc: 'Inspirado en Flower Bomb. Explosión floral y dulce.' },
      { id: 'perfume-la-vie-est-woof', name: 'La Vie Est Woof', tag: 'Hembra', size: '100 ml', sku: 'DG-PF-LV', img: 'assets/products/perfume-la-vie-est-woof.webp', desc: 'Inspirado en La Vie Est Belle. Suave, alegre, con iris y praliné.' },
    ],
  },
};

window.CATEGORY_ORDER = ['barf', 'paletas', 'perfumes'];

// =============== Tabla de alimentación BARF (Doggie Gourmet) ===============
// Datos derivados de la guía oficial. bolsasMes asume bolsa de 500g.
// Para razas pequeñas/cachorros se usará la presentación de 250g cuando aplique.
window.FEEDING_TABLE = [
  // peso, adulto (bolsas/mes 500g), joven, cachorro
  { peso: 5,  adulto: 9,  joven: 11.5, cachorro: 14.5 },
  { peso: 10, adulto: 18, joven: 22.5, cachorro: 28 },
  { peso: 12, adulto: 22, joven: 27.5, cachorro: 34 },
  { peso: 15, adulto: 27, joven: 33.5, cachorro: 41.5 },
  { peso: 20, adulto: 36, joven: 45,   cachorro: 56 },
  { peso: 25, adulto: 40, joven: 50,   cachorro: 62 },
  { peso: 30, adulto: 44, joven: 55,   cachorro: 68 },
  { peso: 35, adulto: 48, joven: 60,   cachorro: 74.5 },
  { peso: 40, adulto: 50, joven: 62.5, cachorro: 77.5 },
];

// Multiplicadores por nivel de actividad (sobre la base)
window.ACTIVITY_MULT = {
  baja: 0.9,
  moderada: 1.0,
  alta: 1.15,
};

// Razas (categorización por tamaño esperado para sugerir presentación)
window.BREEDS = [
  'Mestizo / Sin raza',
  'Akita',
  'Akita Americano',
  'American Bully',
  'American Pitbull Terrier',
  'Beagle',
  'Border Collie',
  'Boxer',
  'Bull Terrier',
  'Bulldog Americano',
  'Bulldog Francés',
  'Bulldog Inglés',
  'Cane Corso',
  'Chihuahua',
  'Chow Chow',
  'Cocker Spaniel',
  'Dálmata',
  'Doberman',
  'Golden Retriever',
  'Gran Danés',
  'Husky Siberiano',
  'Labrador Retriever',
  'Maltés',
  'Pastor Alemán',
  'Pastor Australiano',
  'Pastor Belga',
  'Pitbull',
  'Pointer',
  'Pomerania',
  'Pug',
  'Rottweiler',
  'Samoyedo',
  'San Bernardo',
  'Schnauzer',
  'Setter Irlandés',
  'Shar Pei',
  'Shiba Inu',
  'Shih Tzu',
  'Staffordshire Terrier',
  'Vizsla',
  'Weimaraner',
  'Xoloitzcuintle',
  'Yorkshire Terrier',
];
