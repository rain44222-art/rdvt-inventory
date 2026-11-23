import { createClient } from '@/lib/supabase/server'
import { Package, CheckCircle2, Wrench, UserCheck } from 'lucide-react'

export const instant = false

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const [{ count: total }, { count: inUse }, { count: maint }, { count: avail }] =
    await Promise.all([
      supabase.from('assets').select('*', { count: 'exact', head: true }),
      supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'in_use'),
      supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'maintenance'),
      supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    ])

  const stats = [
    { label: 'Total Asset', value: total ?? 0, color: 'bg-blue-600', icon: Package },
    { label: 'Available', value: avail ?? 0, color: 'bg-green-600', icon: CheckCircle2 },
    { label: 'In Use', value: inUse ?? 0, color: 'bg-orange-500', icon: UserCheck },
    { label: 'Maintenance', value: maint ?? 0, color: 'bg-red-500', icon: Wrench },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`${s.color} text-white p-4 rounded-xl shadow-sm`}>
            <s.icon size={24} className="opacity-80 mb-3" />
            <p className="text-sm md:text-base opacity-90 font-medium">{s.label}</p>
            <p className="text-3xl md:text-4xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}