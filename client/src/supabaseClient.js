// src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message = "CRITICAL: Supabase URL or Anon Key is missing. Check your client/.env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
  console.error(message);
  // Consider throwing an error or showing a more user-friendly message in the UI
  // For now, an alert during development is okay.
  // alert(message);
  throw new Error(message); // Halt app if Supabase isn't configured, essential for auth.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // Important for OAuth callbacks and email confirmation
  }
});