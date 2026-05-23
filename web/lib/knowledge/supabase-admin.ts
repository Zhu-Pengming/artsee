import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (_supabaseAdmin) {
    return _supabaseAdmin;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return _supabaseAdmin;
}

export const supabaseAdmin = {
  get from() {
    return getSupabaseAdmin().from.bind(getSupabaseAdmin());
  },
} as any;
