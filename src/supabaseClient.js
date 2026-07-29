import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY " +
    "(in a local .env file, or in Vercel's Environment Variables settings)."
  );
}

// createClient throws synchronously on a missing/invalid URL, which would
// otherwise crash the whole bundle before React ever renders (a blank white
// page with no explanation). Fall back to a syntactically-valid placeholder
// so the app can boot and show ConfigNeeded instead -- every call against it
// will simply fail over the network, which the rest of the app already
// handles as a normal error state.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);
