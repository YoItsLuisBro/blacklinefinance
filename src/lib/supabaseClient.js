import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
    throw new Error(
        "Missing Supabase env vars. Set VITE_SUPABSE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
    );
}

export const supabase = createClient(url, anon);