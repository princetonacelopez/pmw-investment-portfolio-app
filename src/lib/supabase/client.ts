import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

/**
 * Singleton Supabase browser client.
 * Uses anon key + RLS. Safe to use in all components.
 */
export function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}
