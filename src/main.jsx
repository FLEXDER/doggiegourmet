/* Punto de entrada: carga los estilos y monta la app en #root. */
import { createRoot } from 'react-dom/client';
import { App } from './app';
import './styles.css';

createRoot(document.getElementById('root')).render(<App/>);
