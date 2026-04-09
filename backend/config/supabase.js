import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ SUPABASE URL OR ANON KEY IS MISSING in backend/.env!");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
