import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'

export const instant = false

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav profile={profile} />
      <main className="md:ml-60 pb-20 md:pb-8 px-4 md:px-8 pt-6">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}