import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side / user-scoped (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnon);

// Server-side / service role (bypasses RLS — only use in API routes + cron)
export const supabaseAdmin = createClient(supabaseUrl, supabaseService, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Alias used across API routes
export const createServiceClient = () => supabaseAdmin;
