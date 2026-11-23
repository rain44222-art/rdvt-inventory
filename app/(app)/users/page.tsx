import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createStaff } from './actions'
import { UserPlus } from 'lucide-react'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  
  if (profile?.role !== 'admin') redirect('/')

  const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800">User Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BORANG TAMBAH STAFF */}
        <div className="bg-white border rounded-xl p-5 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} /> Add New Staff
          </h2>
          <form action={createStaff} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input name="full_name" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="E.g: Ali Bin Abu" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input name="email" type="email" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="staff@rdvt.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input name="password" type="password" required minLength={6} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min 6 characters" />
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">
              Create Account
            </button>
          </form>
        </div>

        {/* SENARAI STAFF */}
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Current Users</h2>
          <ul className="divide-y divide-slate-100">
            {profiles?.map((p) => (
              <li key={p.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{p.full_name}</p>
                  <p className="text-xs text-slate-500 uppercase">{p.role}</p>
                </div>
                {p.role === 'admin' && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">ADMIN</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}