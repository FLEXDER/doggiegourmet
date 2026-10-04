// Revisión que corre antes de cada build: si un archivo usa un nombre que no
// importó ni definió (por ejemplo un componente de otro archivo), el build falla
// y el sitio publicado no cambia.
import globals from 'globals';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-undef': 'error',
      // Atrapa variables usadas antes de declararse en el mismo bloque
      // (con Babel en el navegador daban undefined; con módulos truenan).
      'no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
    },
  },
];
