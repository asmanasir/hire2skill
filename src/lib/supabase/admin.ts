import { createClient } from '@supabase/supabase-js'
import { getSupabaseServiceEnv } from '@/lib/env/server'

export function createAdminClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv()
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
