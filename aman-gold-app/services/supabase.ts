import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Public, read-only anon client for the `gold_price_history` reference table (see delivery-pack for the schema
 * and seed script). RLS on that table allows SELECT only — this key can never write. null when env vars are
 * missing (e.g. a fresh checkout without .env.local): callers must fall back to the local simulation.
 */
export const supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
