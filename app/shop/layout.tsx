export const dynamic = 'force-dynamic'

import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/phos/build-snapshot'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  let signedIn = false

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    signedIn = Boolean(user)
  }

  return <DashboardShell signedIn={signedIn}>{children}</DashboardShell>
}
