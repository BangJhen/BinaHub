'use server'

import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const role = formData.get('role') as string
  
  const documentFile = formData.get('document') as File | null;
  
  // UMKM specific
  const businessName = formData.get('businessName') as string
  const businessType = formData.get('businessType') as string
  const businessAddress = formData.get('businessAddress') as string
  
  // Worker specific
  const nik = formData.get('nik') as string
  const workerAddress = formData.get('workerAddress') as string
  const skills = formData.get('skills') as string
  const experience = formData.get('experience') as string

  if (!email || !password || !name || !role) {
    return { success: false, message: 'Informasi personal wajib diisi' }
  }

  if (role !== 'umkm' && role !== 'worker') {
    return { success: false, message: 'Peran tidak valid' }
  }

  const supabase = createClient()

  // Collect role specific metadata
  let metadata: Record<string, any> = { name, role }
  
  if (role === 'umkm') {
    if (!businessName || !businessType || !businessAddress) {
      return { success: false, message: 'Detail UMKM wajib diisi lengkap' }
    }
    metadata = { ...metadata, businessName, businessType, businessAddress }
  } else if (role === 'worker') {
    if (!nik || !workerAddress || !skills || !experience || !documentFile || typeof documentFile === 'string' || documentFile.size === 0) {
      return { success: false, message: 'Detail pekerja wajib diisi lengkap termasuk dokumen' }
    }
    metadata = { ...metadata, nik, workerAddress, skills, experience }
  }

  // Handle Document Upload
  if (documentFile && typeof documentFile !== 'string' && documentFile.size > 0) {
    const fileExt = documentFile.name.split('.').pop()
    const fileName = `${role}_${Date.now()}.${fileExt}`
    
    // Note: This requires the 'documents' bucket to exist and be accessible
    const { data, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, documentFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      // Log the error but proceed. In production, we might want to block registration
      // if the document upload is strictly required and fails.
      console.error('Storage Upload Error:', uploadError)
    } else if (data) {
      metadata = { ...metadata, documentUrl: data.path }
    }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: 'Registrasi berhasil! Silakan cek email Anda untuk memverifikasi akun.' }
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, message: 'Email dan password wajib diisi' }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: error.message }
  }

  // Get user role from metadata to determine redirect URL
  const role = data.user.user_metadata?.role

  let redirectUrl = '/'
  if (role === 'umkm') {
    redirectUrl = '/umkm/dashboard'
  } else if (role === 'worker') {
    redirectUrl = '/worker/dashboard'
  } else if (role === 'admin') {
    redirectUrl = '/admin/dashboard'
  }

  return { success: true, redirectUrl }
}
