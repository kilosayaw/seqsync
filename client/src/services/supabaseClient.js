// SEGSYNC/client/src/services/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const message = "CRITICAL: Supabase URL or Anon Key is missing. Check your client/.env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
  console.error(message);
  alert(message); // Make it very obvious during development
  // You might want to throw an error to halt app initialization if these are missing for your app to function.
  // For example: throw new Error(message);
}

// This is the ONLY export from this file.
// It exports the initialized Supabase client instance as a named export 'supabase'.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,   // Default: true - keeps the session alive
    persistSession: true,     // Default: true - stores session in localStorage
    detectSessionInUrl: true, // Default: true - crucial for OAuth and email confirmation links
  }
});

// ====================================================================================
// THERE SHOULD BE NO OTHER CODE OR EXPORTS BELOW THIS LINE IN THIS FILE.
// ESPECIALLY, THE LINE 'export default EmailConfirmationPage;' MUST BE REMOVED.
// ====================================================================================