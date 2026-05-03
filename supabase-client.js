/* ============================================================
   DOGGIE GOURMET — Cliente Supabase
   Inicializa la conexión con la base de datos.
   Se carga UNA VEZ al inicio de la página.
   ============================================================ */

const SUPABASE_URL = 'https://oaurovkvyrywmdsjhgaj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4ORlrwn6sRWVEQ_XTwiOwQ_wbI0UTwF';

/* Crea el cliente y lo expone como window.supabaseClient
   para que los demás archivos lo puedan usar. */
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,        // Recuerda al master logueado entre visitas
      autoRefreshToken: true,      // Renueva el token automáticamente
      detectSessionInUrl: false    // No usamos magic links por URL
    }
  }
);
