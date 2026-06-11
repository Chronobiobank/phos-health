export const dynamic = 'force-dynamic'

import { EmployerShell } from '@/components/org/EmployerShell'
import { getEmployerContext } from '@/lib/org/employer-context'
import { isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { createClient } from '@/lib/supabase/server'

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  let signedIn = false
  let organisationName: string | undefined

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    signedIn = Boolean(user)

    if (user) {
      const context = await getEmployerContext(supabase, user.id)
      organisationName = context?.organisationName
    }
  }

  return (
    <EmployerShell signedIn={signedIn} organisationName={organisationName}>
      {children}
    </EmployerShell>
  )
}
