import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Box, Clock, User, Pencil, Trash2 } from 'lucide-react'
import { recordMovement, deleteAsset } from '../actions'

export const instant = false

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isAdmin = profile?.role === 'admin'

  const [{ data: asset }, { data: movements }, { data: locations }, { data: profiles }] = await Promise.all([
    supabase.from('assets').select('*, category:categories(name), location:locations(label)').eq('id', id).single(),
    supabase.from('asset_movements').select('*, profile:profiles(full_name)').eq('asset_id', id).order('created_at', { ascending: false }),
    supabase.from('locations').select('*').order('rack_code').order('level'),
    supabase.from('profiles').select('id, full_name').order('full_name'),
  ])

  if (!asset) notFound()

  const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]))
  const locMap = new Map(locations?.map((l) => [l.id, l.label]))
  
  const del = deleteAsset.bind(null, id)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/assets" className="text-sm text-blue-600 flex items-center gap-1 hover:underline mb-2">
        <ArrowLeft size={16} /> Back to Assets
      </Link>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{asset.name}</h1>
            <p className="text-slate-500 mt-1">{asset.brand} {asset.model}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
              asset.status === 'available' ? 'bg-green-100 text-green-700' :
              asset.status === 'in_use' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
            }`}>
              {asset.status}
            </span>

            {isAdmin && (
              <div className="flex gap-2 ml-2 border-l pl-2 border-slate-200">
                <Link href={`/assets/${id}/edit`} className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600 transition-colors" title="Edit">
                  <Pencil size={16} />
                </Link>
                <form action={del}>
                  <button className="p-2 border rounded-lg hover:bg-red-50 text-red-600 transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-500 mb-1 flex items-center gap-1"><Box size={14} /> Category</p>
            <p className="font-medium text-slate-800">{asset.category?.name || '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-500 mb-1 flex items-center gap-1"><MapPin size={14} /> Location</p>
            <p className="font-medium text-slate-800">{asset.location?.label || '-'}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-500 mb-1">Quantity</p>
            <p className="font-medium text-slate-800">{asset.quantity || 1}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-slate-500 mb-1 flex items-center gap-1"><User size={14} /> Assigned To</p>
            <p className="font-medium text-slate-800 truncate">{profileMap.get(asset.assigned_to) || '-'}</p>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Record Movement</h2>
          <form action={recordMovement} className="space-y-4">
            <input type="hidden" name="asset_id" value={id} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Action</label>
                <select name="movement_type" required className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="check_out">Check Out (Assign to user)</option>
                  <option value="check_in">Check In (Return to store)</option>
                  <option value="transfer">Transfer (Move location)</option>
                  <option value="maintenance">Send to Maintenance</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assign To (Staff)</label>
                <select name="to_user" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- None --</option>
                  {profiles?.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Location</label>
                <select name="to_location_id" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Keep Current --</option>
                  {locations?.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <input name="notes" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="E.g: Taking for project Alpha..." />
            </div>

            <button className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 font-medium text-sm transition-colors">
              Save Movement
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Movement History</h2>
        {!movements?.length ? (
          <p className="text-slate-500 text-sm">No movements recorded yet.</p>
        ) : (
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {movements.map((m) => (
              <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Clock size={16} />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-lg border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800 capitalize">{m.movement_type.replace('_', ' ')}</span>
                    <span className="text-xs text-slate-500">{m.created_at.substring(0, 10)}</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    By <span className="font-medium text-slate-800">{m.profile?.full_name || 'Unknown'}</span>
                  </p>
                  {m.to_user && <p className="text-xs text-slate-500 mt-1">Assigned to: {profileMap.get(m.to_user)}</p>}
                  {m.to_location_id && <p className="text-xs text-slate-500">Location: {locMap.get(m.to_location_id)}</p>}
                  {m.notes && <p className="text-xs text-slate-600 mt-2 italic bg-white p-2 rounded border">"{m.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}