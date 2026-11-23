'use server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStaff(fd: FormData) {
  // Check admin dulu
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (profile?.role !== 'admin') throw new Error('Forbidden')

  const email = String(fd.get('email'))
  const password = String(fd.get('password'))
  const fullName = String(fd.get('full_name'))

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  })

  if (error) throw new Error(error.message)
  
  revalidatePath('/users')
}