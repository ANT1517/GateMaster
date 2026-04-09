import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE URL OR ANON KEY IS MISSING! Check your .env file in 'gate-frontend' folder.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
