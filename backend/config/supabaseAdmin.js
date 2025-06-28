// SEGSYNC/backend/config/supabaseAdmin.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("🔴 Supabase URL or Service Key is missing in .env. These are required for admin operations.");
  throw new Error('Supabase URL and Service Key must be provided in .env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    // autoRefreshToken: false, // Default is true, generally okay
    persistSession: false,   // Service role doesn't need to persist sessions
    // detectSessionInUrl: false, // Not relevant for service role
  }
});

console.log('👑 Supabase Admin client initialized.');

module.exports = supabaseAdmin;