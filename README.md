# Doggie Gourmet — Sitio web

Sitio estático listo para GitHub Pages. SPA en React (Babel en navegador).

## Despliegue en GitHub Pages

1. Sube el contenido de esta carpeta a la raíz de tu repo (ej. `usuario/doggie-gourmet`).
2. Settings → Pages → Source: `Deploy from a branch` → branch `main` / folder `/ (root)`.
3. Visita `https://usuario.github.io/doggie-gourmet/`.

## Desarrollo local

Los archivos `.jsx` no cargan vía `file://`. Sirve por HTTP:

```bash
python3 -m http.server 8000
# o
npx serve .
```

Abre http://localhost:8000.

## Estructura

```
index.html              # Entrada principal
styles.css              # Estilos globales
data.js                 # Catálogo y datos
app-shell.jsx           # Layout (nav, footer, hero)
app.jsx                 # Router raíz
pages-content.jsx       # Páginas: home, productos, about
pages-inv.jsx           # Inventario + contacto
page-calculator.jsx     # Calculadora BARF
page-puntos.jsx         # Puntos de venta
assets/
  brand/                # Logo, isotipo
  products/             # Fotos de producto
  about/                # Imágenes editoriales
  locations/            # Fotos de tiendas
.nojekyll               # Evita que Jekyll procese el sitio
```

## Notas

- React, ReactDOM y Babel se cargan desde unpkg (CDN público).
- Fuentes desde Google Fonts.
- Todas las rutas son relativas — no requiere configuración de base.
