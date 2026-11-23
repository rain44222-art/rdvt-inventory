import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AssetForm from '@/components/AssetForm'
import { createAsset } from '../actions'

export default async function NewAssetPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  
  if (profile?.role !== 'admin') redirect('/assets')

  const [{ data: categories }, { data: locations }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('locations').select('*').order('rack_code').order('level'),
  ])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Add New Asset</h1>
      <AssetForm action={createAsset} categories={categories ?? []} locations={locations ?? []} />
    </div>
  )
}