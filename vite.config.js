import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vista previa (opcional): DG_PREVIEW=1 construye el sitio para
// doggiegourmet.com.mx/preview/, con la franja "VISTA PREVIA" y sin indexar en
// buscadores. El workflow Deploy no la usa; para volver a publicarla hay que
// agregarle un segundo build con DG_PREVIEW=1 copiado a dist/preview/.
const PREVIEW = process.env.DG_PREVIEW === '1';

function previewBanner() {
  return {
    name: 'dg-preview-banner',
    transformIndexHtml() {
      return [
        { tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' },
        {
          tag: 'div',
          attrs: {
            style:
              'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;pointer-events:none;' +
              'background:#B3261E;color:#fff;text-align:center;padding:3px 8px;' +
              'font:600 11px/1.5 system-ui,-apple-system,sans-serif;letter-spacing:.12em;',
          },
          children: 'VISTA PREVIA · no es el sitio publicado',
          injectTo: 'body',
        },
      ];
    },
  };
}

export default defineConfig({
  root: 'src',
  base: PREVIEW ? '/preview/' : '/',
  publicDir: '../public',
  plugins: [react(), PREVIEW && previewBanner()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // Los archivos generados van en _app/ para no mezclarse con las fotos de assets/.
    assetsDir: '_app',
  },
});
