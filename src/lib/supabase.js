import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "")
  .trim()
  .replace(/\/$/, "");
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""
).trim();

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "PERINGATAN: NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY belum terisi di .env.local!",
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
