'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAsset(fd: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { error } = await supabase.from('assets').insert({
    name: String(fd.get('name')),
    category_id: Number(fd.get('category_id')) || null,
    brand: String(fd.get('brand')) || null,
    model: String(fd.get('model')) || null,
    status: String(fd.get('status')) || 'available',
    location_id: Number(fd.get('location_id')) || null,
    quantity: Number(fd.get('quantity')) || 1,
    created_by: user!.id
  })

  if (error) throw new Error(error.message)
  
  revalidatePath('/assets')
  redirect('/assets')
}

export async function updateAsset(id: string, fd: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const { error } = await supabase.from('assets').update({
    name: String(fd.get('name')),
    category_id: Number(fd.get('category_id')) || null,
    brand: String(fd.get('brand')) || null,
    model: String(fd.get('model')) || null,
    status: String(fd.get('status')) || 'available',
    location_id: Number(fd.get('location_id')) || null,
    quantity: Number(fd.get('quantity')) || 1,
    updated_at: new Date().toISOString()
  }).eq('id', id)

  if (error) throw new Error(error.message)
  
  revalidatePath('/assets')
  revalidatePath(`/assets/${id}`)
  redirect(`/assets/${id}`)
}

export async function deleteAsset(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  await supabase.from('assets').delete().eq('id', id)
  
  revalidatePath('/assets')
  redirect('/assets')
}

export async function recordMovement(fd: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const assetId = String(fd.get('asset_id'))
  const type = String(fd.get('movement_type'))
  const toLoc = fd.get('to_location_id') ? Number(fd.get('to_location_id')) : null
  const toUser = fd.get('to_user') ? String(fd.get('to_user')) : null
  const notes = fd.get('notes') ? String(fd.get('notes')) : null

  const { data: asset } = await supabase.from('assets').select('*').eq('id', assetId).single()
  if (!asset) throw new Error('Asset not found')

  await supabase.from('asset_movements').insert({
    asset_id: assetId, movement_type: type, from_location_id: asset.location_id,
    to_location_id: toLoc, from_user: asset.assigned_to, to_user: toUser,
    performed_by: user!.id, notes
  })

  const updateData: any = { updated_at: new Date().toISOString() }
  
  if (type === 'check_out') {
    updateData.status = 'in_use'; updateData.assigned_to = toUser
    if (toLoc) updateData.location_id = toLoc
  } else if (type === 'check_in') {
    updateData.status = 'available'; updateData.assigned_to = null
    if (toLoc) updateData.location_id = toLoc
  } else if (type === 'transfer') {
    if (toLoc) updateData.location_id = toLoc
  } else if (type === 'maintenance') {
    updateData.status = 'maintenance'
  }

  await supabase.from('assets').update(updateData).eq('id', assetId)
  revalidatePath(`/assets/${assetId}`)
  revalidatePath('/assets')
}