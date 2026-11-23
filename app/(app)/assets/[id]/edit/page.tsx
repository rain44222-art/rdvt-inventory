import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AssetForm from '@/components/AssetForm'
import { updateAsset } from '../../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const instant = false

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  
  if (profile?.role !== 'admin') redirect(`/assets/${id}`)

  const [{ data: asset }, { data: categories }, { data: locations }] = await Promise.all([
    supabase.from('assets').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
    supabase.from('locations').select('*').order('rack_code').order('level'),
  ])

  if (!asset) notFound()

  const action = updateAsset.bind(null, id)

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Link href={`/assets/${id}`} className="text-sm text-blue-600 flex items-center gap-1 hover:underline mb-2">
        <ArrowLeft size={16} /> Back to Asset
      </Link>
      <h1 className="text-2xl font-bold text-slate-800">Edit Asset</h1>
      <AssetForm 
        action={action} 
        asset={asset} 
        categories={categories ?? []} 
        locations={locations ?? []} 
        submitLabel="Update Asset" 
      />
    </div>
  )
}