import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

let adminClient: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (!adminClient) {
    if (!supabaseUrl || !serviceKey) {
      throw new Error(
        "Supabase admin client missing envs. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only)."
      );
    }
    adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: {
        // Service role should never be used in the browser
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClient;
}

