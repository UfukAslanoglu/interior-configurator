import { createClient } from '@supabase/supabase-js';

/**
 * Single shared Supabase client for the whole app. URL + anon key are read
 * from Vite env vars (never hardcoded here) so they can differ between
 * local/dev/prod and never get committed to the repo — see .env.example.
 *
 * The "anon" key is safe to ship to the browser (it's public by design);
 * real protection comes from Row Level Security policies on each table,
 * not from hiding this key.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file (see .env.example).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
