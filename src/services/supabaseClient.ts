import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create a Supabase client only if env vars are present. This lets the app
// run without Supabase configured (it will fallback to local data).
const url = process.env.REACT_APP_SUPABASE_URL;
const anonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (url && anonKey) {
  supabase = createClient(url, anonKey);
}

export default supabase;
