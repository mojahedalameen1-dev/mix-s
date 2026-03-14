const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ CRITICAL: Missing SUPABASE_URL environment variable!');
}
if (!supabaseAnonKey) {
  console.error('❌ CRITICAL: Missing SUPABASE_ANON_KEY environment variable!');
}

let supabase;
try {
  supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');
} catch (err) {
  console.error('❌ Failed to initialize Supabase client:', err.message);
}

module.exports = supabase;
