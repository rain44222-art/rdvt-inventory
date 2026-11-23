import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, MapPin, Search, FilterX } from 'lucide-react'

export const instant = false

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; loc?: string; status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isAdmin = profile?.role === 'admin'

  const [{ data: categories }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('locations').select('*').order('rack_code').order('level'),
  ])

  let query = supabase
    .from('assets')
    .select('*, category:categories(name), location:locations(label)')
    .order('created_at', { ascending: false })

  if (params.q) query = query.or(`name.ilike.%${params.q}%,brand.ilike.%${params.q}%,model.ilike.%${params.q}%`)
  if (params.cat) query = query.eq('category_id', params.cat)
  if (params.loc) query = query.eq('location_id', params.loc)
  if (params.status) query = query.eq('status', params.status)

  const { data: assets } = await query

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Asset List</h1>
        {isAdmin && (
          <Link href="/assets/new" className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-700 text-sm font-medium">
            <Plus size={18} /> Add Asset
          </Link>
        )}
      </div>

      <form className="bg-white p-4 rounded-xl border shadow-sm grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              name="q" 
              defaultValue={params.q || ''} 
              placeholder="Name, brand, model..." 
              className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
          <select name="cat" defaultValue={params.cat || ''} className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
          <select name="loc" defaultValue={params.loc || ''} className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            {locations?.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select name="status" defaultValue={params.status || ''} className="w-full border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="col-span-2 md:col-span-1 flex gap-2">
          <button type="submit" className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-900 transition-colors">
            Apply
          </button>
          <Link href="/assets" className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center" title="Clear Filters">
            <FilterX size={18} />
          </Link>
        </div>
      </form>

      <p className="text-sm text-slate-500">Showing {assets?.length || 0} assets</p>

      <div className="md:hidden space-y-3">
        {assets?.map((a) => (
          <Link href={`/assets/${a.id}`} key={a.id} className="block bg-white p-4 rounded-xl border shadow-sm hover:border-blue-400 transition-colors">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-semibold text-slate-800">{a.name}</p>
                <p className="text-xs text-slate-500">{a.category?.name || 'No Category'}</p>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase tracking-wider ${
                a.status === 'available' ? 'bg-green-100 text-green-700' :
                a.status === 'in_use' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
              }`}>
                {a.status}
              </span>
            </div>
            <div className="flex gap-4 mt-3 text-sm text-slate-600 items-center">
              <span className="flex items-center gap-1"><MapPin size={14} /> {a.location?.label || 'No Location'}</span>
              <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded text-xs">Qty: {a.quantity || 1}</span>
            </div>
          </Link>
        ))}
        {!assets?.length && <p className="text-center text-slate-500 py-8">No assets found matching your search.</p>}
      </div>

      <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Asset Name</th>
              <th className="p-4 font-semibold text-slate-600">Category</th>
              <th className="p-4 font-semibold text-slate-600">Location</th>
              <th className="p-4 font-semibold text-slate-600 text-center">Qty</th>
              <th className="p-4 font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assets?.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 group">
                <td className="p-4 font-medium text-slate-800">
                  <Link href={`/assets/${a.id}`} className="group-hover:text-blue-600 transition-colors">
                    {a.name}
                  </Link>
                  <div className="text-xs text-slate-500">{a.brand} {a.model}</div>
                </td>
                <td className="p-4 text-slate-600">{a.category?.name || '-'}</td>
                <td className="p-4 text-slate-600">{a.location?.label || '-'}</td>
                <td className="p-4 text-slate-600 font-medium text-center">{a.quantity || 1}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    a.status === 'available' ? 'bg-green-100 text-green-700' :
                    a.status === 'in_use' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!assets?.length && <p className="p-8 text-center text-slate-500">No assets found matching your search.</p>}
      </div>
    </div>
  )
}