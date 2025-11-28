// lib/supabase/client.ts
// BarrelVerse Supabase Client - Browser

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for client-side use
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}
