# Doggie Gourmet — Sitio web

Tienda en [doggiegourmet.com.mx](https://doggiegourmet.com.mx). React construido con
[Vite](https://vite.dev) y publicado en GitHub Pages con GitHub Actions.

## Cómo se publica

Cada commit a `main` (por ejemplo, al guardar un archivo desde la web de GitHub)
lanza el workflow **Deploy** (`.github/workflows/deploy.yml`):

1. Instala las dependencias.
2. Revisa el código de `src/`: si un archivo usa algo que no importó, se detiene.
3. Construye el sitio con Vite en `dist/`.
4. Publica `dist/` en GitHub Pages.

Tarda 1–3 minutos. En la pestaña **Actions**:

- 🟡 está construyendo.
- ✅ ya está publicado.
- ❌ falló y **el sitio sigue con la versión anterior**. Abre la corrida para ver el error.

También se puede lanzar a mano: Actions → Deploy → **Run workflow**.

## Dónde está cada cosa

| Qué quieres cambiar | Archivo |
|---|---|
| Productos, precios, tabla de la calculadora, razas | `src/data.js` |
| Estilos | `src/styles.css` |
| Puntos de venta (tarjetas de la página) | `src/page-puntos.jsx` |
| Lista de puntos de venta del inventario | `src/inv-helpers.js` |
| Inicio, menú y pie de página | `src/app-shell.jsx` |
| Productos y Nosotros | `src/pages-content.jsx` |
| Contacto | `src/page-contact.jsx` |
| Calculadora BARF | `src/page-calculator.jsx` |
| Carrito | `src/cart-*.js`, `src/cart-*.jsx` |
| Reporte de inventario y panel master | `src/pages-inv.jsx`, `src/inv-*.js(x)` |
| Fotos | `public/assets/…` |
| Favicons, `CNAME`, `404.html` | `public/` |

## Fotos nuevas

Súbelas a la carpeta que corresponda dentro de `public/assets/` (por ejemplo
`public/assets/products/`). En el código se escriben **sin** `public/`, igual que
antes:

```js
img: 'assets/products/mi-foto.webp'
```

## Reglas

- No hace falta `?v=…` para que se vea lo nuevo: Vite le pone nombres únicos a los
  archivos en cada build.
- Un archivo `.jsx` nuevo no se agrega con `<script>` en `index.html`: hay que
  importarlo desde el archivo que lo usa.
- No edites `package.json`, `package-lock.json`, `vite.config.js`,
  `eslint.config.js` ni `.github/workflows/deploy.yml`.
- `supabase/sql/` y `.github/workflows/keepalive.yml` no forman parte del sitio
  y no se publican.

## Si algo sale mal después de publicar

- **Rápido (sin tocar código):** Actions → Deploy → abre la última corrida ✅
  anterior al problema → **Re-run all jobs**. Vuelve a publicar esa versión. El
  siguiente commit a `main` publicará lo más nuevo otra vez.
- **Definitivo:** en el pull request o commit que causó el problema, usa
  **Revert** y fusiona el cambio.

## Estructura

```
src/                 Código del sitio
  index.html         Página base (fuentes, favicons, widget de Instagram)
  main.jsx           Monta la app y carga los estilos
  app.jsx            Rutas por hash (#products, #inventory, …)
  icon.jsx           Íconos SVG
  …
public/              Se copia tal cual al sitio
  assets/            Fotos (brand, hero, products, about, locations)
  CNAME              Dominio propio
  404.html           Redirige al inicio
vite.config.js       Configuración del build
eslint.config.js     Revisión del código antes de cada build
supabase/sql/        Scripts SQL para correr a mano en Supabase (no se publican)
```

## Desarrollo local (opcional)

Requiere Node 22.

```bash
npm install
npm run dev      # servidor local con recarga automática
npm run lint     # revisión del código
npm run build    # construye dist/
```
