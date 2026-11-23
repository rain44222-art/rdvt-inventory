import { createClient } from '@/lib/supabase/server'
import { ArrowLeftRight, Clock, User, MapPin } from 'lucide-react'

export const instant = false

export default async function MovementsPage() {
  const supabase = await createClient()

  const [{ data: movements }, { data: assets }, { data: profiles }, { data: locations }] =
    await Promise.all([
      supabase.from('asset_movements').select('*').order('created_at', { ascending: false }).limit(200),
      supabase.from('assets').select('id, name'),
      supabase.from('profiles').select('id, full_name'),
      supabase.from('locations').select('*'),
    ])

  const assetMap = new Map(assets?.map((a) => [a.id, a.name]))
  const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]))
  const locMap = new Map(locations?.map((l) => [l.id, l.label]))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Movements</h1>
        <p className="text-sm text-slate-500 mt-1">Global history of all asset check-ins and check-outs.</p>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        {!movements?.length ? (
          <div className="p-8 text-center text-slate-500">
            No movements recorded yet.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {movements.map((m) => (
              <li key={m.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-blue-100 text-blue-600 p-2 rounded-full shrink-0">
                    <ArrowLeftRight size={18} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-4">
                      <div>
                        <p className="font-semibold text-slate-800 text-lg truncate">
                          {assetMap.get(m.asset_id) || 'Unknown Asset'}
                        </p>
                        <p className="text-sm font-medium text-slate-600 capitalize mt-0.5">
                          {m.movement_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                        <Clock size={12} />
                        {m.created_at.replace('T', ' ').substring(0, 16)}
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1">
                        <User size={14} className="text-slate-400" />
                        By <span className="font-medium">{profileMap.get(m.performed_by) || 'Unknown'}</span>
                      </span>
                      
                      {m.to_user && (
                        <span className="flex items-center gap-1">
                          <User size={14} className="text-green-500" />
                          To <span className="font-medium">{profileMap.get(m.to_user)}</span>
                        </span>
                      )}

                      {m.to_location_id && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} className="text-slate-400" />
                          Moved to <span className="font-medium">{locMap.get(m.to_location_id)}</span>
                        </span>
                      )}
                    </div>

                    {m.notes && (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-100 p-2 rounded border inline-block">
                        "{m.notes}"
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}