/* ============================================================
   DOGGIE GOURMET — Cliente Supabase
   Inicializa la conexión con la base de datos.
   Se carga UNA VEZ al inicio de la página.
   ============================================================ */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oaurovkvyrywmdsjhgaj.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_4ORlrwn6sRWVEQ_XTwiOwQ_wbI0UTwF';

/* Crea el cliente y lo expone como supabaseClient
   para que los demás archivos lo puedan usar. */
export const supabaseClient = createClient(
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
