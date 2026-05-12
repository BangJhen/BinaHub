'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

function normalizeSignupError(message: string) {
  const lowered = message.toLowerCase()
  if (lowered.includes('email rate limit exceeded')) {
    return 'Pendaftaran ditolak sementara karena batas pengiriman email tercapai. Coba lagi 5-10 menit lagi, atau aktifkan mode auto-confirm untuk testing.'
  }

  return message
}

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

  const autoconfirmEnabled = process.env.AUTH_AUTOCONFIRM === 'true'
  let authUser: { id: string; email_confirmed_at?: string | null } | null = null

  if (autoconfirmEnabled) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        message:
          'Mode auto-confirm aktif, tetapi NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local.',
      }
    }

    const adminSupabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    })

    if (error) {
      return { success: false, message: normalizeSignupError(error.message) }
    }

    authUser = data.user ? { id: data.user.id, email_confirmed_at: data.user.email_confirmed_at } : null
  } else {
    const { data: signupData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    if (error) {
      return { success: false, message: normalizeSignupError(error.message) }
    }

    authUser = signupData.user
  }

  if (authUser) {
    const { error: userInsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email,
          password_hash: 'managed-by-supabase-auth',
          full_name: name,
          role,
          is_verified: Boolean(authUser.email_confirmed_at),
        },
        { onConflict: 'id' }
      )

    if (userInsertError) {
      return { success: false, message: `Registrasi auth berhasil, tetapi sinkronisasi data user gagal: ${userInsertError.message}` }
    }

    if (role === 'umkm') {
      const { error: umkmProfileError } = await supabase
        .from('umkm_profiles')
        .upsert(
          {
            user_id: authUser.id,
            business_name: businessName,
            business_sector: businessType,
            business_address: businessAddress,
          },
          { onConflict: 'user_id' }
        )

      if (umkmProfileError) {
        return { success: false, message: `Akun dibuat, tetapi profil UMKM gagal disimpan: ${umkmProfileError.message}` }
      }
    }

    if (role === 'worker') {
      const { error: workerProfileError } = await supabase
        .from('worker_profiles')
        .upsert(
          {
            user_id: authUser.id,
            skills,
            experience_summary: experience,
            city: workerAddress,
          },
          { onConflict: 'user_id' }
        )

      if (workerProfileError) {
        return { success: false, message: `Akun dibuat, tetapi profil worker gagal disimpan: ${workerProfileError.message}` }
      }
    }
  }

  return {
    success: true,
    message: autoconfirmEnabled
      ? 'Registrasi berhasil! Akun langsung aktif (auto-confirm mode). Anda bisa langsung login.'
      : 'Registrasi berhasil! Silakan cek email Anda untuk memverifikasi akun.',
  }
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
