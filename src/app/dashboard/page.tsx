import { createClient } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = data?.claims?.email as string | undefined

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1
          className="text-3xl font-semibold tracking-tight text-[#0e0e0e]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Dashboard
        </h1>
        {email && (
          <p className="text-sm text-[#6b6b6b] mt-1">Signed in as User</p>
        )}
      </div>
      <DashboardClient />
    </div>
  )
}
