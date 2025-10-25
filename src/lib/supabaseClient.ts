// src/lib/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ⚠️ Ces 2 variables doivent venir de .env.local
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Vérifications + message explicite en cas d’oubli
if (!url || !anonKey) {
  const missing = [
    !url && 'VITE_SUPABASE_URL',
    !anonKey && 'VITE_SUPABASE_ANON_KEY',
  ]
    .filter(Boolean)
    .join(', ');

  throw new Error(
    `Supabase: variable(s) manquante(s): ${missing}. ` +
      `Ajoute-les dans .env.local puis relance Vite (npm run dev).`
  );
}

// ✅ Client public uniquement (jamais la Service Role Key côté front)
export const supabase: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// (Optionnel) petit debug en DEV uniquement, sans fuite en prod
if (import.meta.env.DEV) {
  // Affiche juste le préfixe de la clé, pas la clé entière
  console.debug(
    '[Supabase] URL =',
    url,
    '| ANON prefix =',
    (anonKey ?? '').slice(0, 8)
  );
}

/*
  ❌ Ne PAS créer/Exporter de "supabaseAdmin" ici.
  La Service Role Key doit rester côté serveur (Edge Function, API route, script admin),
  jamais dans l’app web publique.
*/
