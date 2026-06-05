'use server'

import { headers } from 'next/headers'
import { createClient } from '@/shared/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import {
  loginSchema,
  signupUmkmSchema,
  signupWorkerSchema,
  validateDocumentFile,
  generateSafeFileName,
} from '@/shared/lib/security/validation'
import { checkRateLimit, RATE_LIMITS } from '@/shared/lib/security/rate-limiter'
import { ZodError } from 'zod'

// ─── Helper: ambil IP dari request header ─────────────────────────────────────
function getClientIp(): string {
  const headersList = headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'unknown'
  )
}

// ─── Helper: normalisasi pesan error Supabase ──────────────────────────────────
function normalizeAuthError(message: string): string {
  const lowered = message.toLowerCase()
  if (lowered.includes('email rate limit exceeded')) {
    return 'Pendaftaran ditolak sementara karena batas pengiriman email tercapai. Coba lagi 5–10 menit lagi.'
  }
  if (lowered.includes('user already registered') || lowered.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.'
  }
  if (lowered.includes('invalid login credentials')) {
    return 'Email atau password salah. Periksa kembali dan coba lagi.'
  }
  // Kembalikan pesan generik — jangan expose detail internal ke user
  return 'Terjadi kesalahan autentikasi. Silakan coba lagi.'
}

// ─── Helper: format pesan error Zod menjadi string ringkas ────────────────────
function formatZodError(err: ZodError): string {
  // Zod v4 menggunakan .issues, fallback ke .errors untuk kompatibilitas
  const issues = (err as any).issues ?? (err as any).errors ?? []
  return (issues as Array<{ message: string }>).map((e) => e.message).join('. ')
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
export async function signup(formData: FormData) {
  // [FIX MEDIUM] Rate limiting — cegah brute force / spam akun baru
  const ip = getClientIp()
  const rateLimitResult = checkRateLimit(`signup:${ip}`, RATE_LIMITS.signup)
  if (!rateLimitResult.allowed) {
    return { success: false, message: rateLimitResult.message }
  }

  // Ekstrak field dari FormData
  const raw = {
    email: (formData.get('email') as string | null) ?? '',
    password: (formData.get('password') as string | null) ?? '',
    name: (formData.get('name') as string | null) ?? '',
    role: (formData.get('role') as string | null) ?? '',
    // UMKM specific
    businessName: (formData.get('businessName') as string | null) ?? '',
    businessType: (formData.get('businessType') as string | null) ?? '',
    businessAddress: (formData.get('businessAddress') as string | null) ?? '',
    // Worker specific
    nik: (formData.get('nik') as string | null) ?? '',
    workerAddress: (formData.get('workerAddress') as string | null) ?? '',
    skills: (formData.get('skills') as string | null) ?? '',
    experience: (formData.get('experience') as string | null) ?? '',
  }
  const documentFile = formData.get('document') as File | null

  // [FIX HIGH] Validasi input menggunakan Zod schema sesuai role
  try {
    if (raw.role === 'umkm') {
      signupUmkmSchema.parse(raw)
    } else if (raw.role === 'worker') {
      signupWorkerSchema.parse(raw)
      // [FIX HIGH] Validasi file upload — tipe, ukuran, dan ekstensi
      const fileCheck = validateDocumentFile(documentFile)
      if (!fileCheck.valid) {
        return { success: false, message: fileCheck.message }
      }
    } else {
      return { success: false, message: 'Peran tidak valid. Pilih UMKM atau Pekerja.' }
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return { success: false, message: formatZodError(err) }
    }
    return { success: false, message: 'Data tidak valid. Periksa kembali semua isian.' }
  }

  // [FIX CRITICAL] Guard auto-confirm — DILARANG aktif di lingkungan production
  const autoconfirmEnabled = process.env.AUTH_AUTOCONFIRM === 'true'
  if (autoconfirmEnabled && process.env.NODE_ENV === 'production') {
    // [FIX MEDIUM] Log internal, bukan ekspos ke user
    console.error('[SECURITY] AUTH_AUTOCONFIRM=true terdeteksi di environment production. Permintaan signup ditolak.')
    return {
      success: false,
      message: 'Konfigurasi server tidak valid. Hubungi administrator.',
    }
  }

  const supabase = createClient()

  // Kumpulkan metadata sesuai role
  let metadata: Record<string, string> = { name: raw.name, role: raw.role }

  if (raw.role === 'umkm') {
    metadata = {
      ...metadata,
      businessName: raw.businessName,
      businessType: raw.businessType,
      businessAddress: raw.businessAddress,
    }
  } else if (raw.role === 'worker') {
    metadata = {
      ...metadata,
      nik: raw.nik,
      workerAddress: raw.workerAddress,
      skills: raw.skills,
      experience: raw.experience,
    }
  }

  // [FIX HIGH] Upload dokumen dengan validasi lengkap dan nama file aman
  if (raw.role === 'worker' && documentFile && typeof documentFile !== 'string' && documentFile.size > 0) {
    // [FIX HIGH] Nama file menggunakan UUID — tidak bisa ditebak
    const safeFileName = generateSafeFileName(raw.role, documentFile.name)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(safeFileName, documentFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      // [FIX MEDIUM] Log hanya kode/tipe error — jangan log path/kredensial
      console.error('[STORAGE] Gagal upload dokumen:', {
        errorName: uploadError.name,
        errorCode: (uploadError as any).statusCode,
      })
      // Untuk worker, dokumen adalah syarat wajib — tolak jika upload gagal
      return { success: false, message: 'Gagal mengunggah dokumen. Pastikan file valid dan coba lagi.' }
    }

    if (uploadData) {
      metadata = { ...metadata, documentUrl: uploadData.path }
    }
  }

  // Buat akun auth
  let authUser: { id: string; email_confirmed_at?: string | null } | null = null

  if (autoconfirmEnabled) {
    // Mode development: auto-confirm aktif
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        success: false,
        message: 'Konfigurasi server tidak lengkap untuk mode auto-confirm.',
      }
    }

    const adminSupabase = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: raw.email,
      password: raw.password,
      email_confirm: true,
      user_metadata: metadata,
    })

    if (error) {
      // [FIX MEDIUM] Log error internal tanpa detail sensitif ke output user
      console.error('[AUTH] Gagal membuat akun (auto-confirm):', error.status)
      return { success: false, message: normalizeAuthError(error.message) }
    }

    authUser = data.user
      ? { id: data.user.id, email_confirmed_at: data.user.email_confirmed_at }
      : null
  } else {
    // Mode normal: kirim email konfirmasi
    const { data: signupData, error } = await supabase.auth.signUp({
      email: raw.email,
      password: raw.password,
      options: { data: metadata },
    })

    if (error) {
      console.error('[AUTH] Gagal signup:', error.status)
      return { success: false, message: normalizeAuthError(error.message) }
    }

    authUser = signupData.user
  }

  // Sinkronisasi data ke tabel aplikasi
  if (authUser) {
    const { error: userInsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email: raw.email,
          password_hash: 'managed-by-supabase-auth',
          full_name: raw.name,
          role: raw.role,
          is_verified: Boolean(authUser.email_confirmed_at),
        },
        { onConflict: 'id' }
      )

    if (userInsertError) {
      // [FIX MEDIUM] Jangan expose detail DB error ke user
      console.error('[DB] Gagal upsert users:', userInsertError.code)
      return {
        success: false,
        message: 'Registrasi berhasil tetapi sinkronisasi data gagal. Hubungi administrator.',
      }
    }

    if (raw.role === 'umkm') {
      const { error: umkmProfileError } = await supabase
        .from('umkm_profiles')
        .upsert(
          {
            user_id: authUser.id,
            business_name: raw.businessName,
            business_sector: raw.businessType,
            business_address: raw.businessAddress,
          },
          { onConflict: 'user_id' }
        )

      if (umkmProfileError) {
        console.error('[DB] Gagal upsert umkm_profiles:', umkmProfileError.code)
        return {
          success: false,
          message: 'Akun dibuat, tetapi profil UMKM gagal disimpan. Hubungi administrator.',
        }
      }
    }

    if (raw.role === 'worker') {
      const { error: workerProfileError } = await supabase
        .from('worker_profiles')
        .upsert(
          {
            user_id: authUser.id,
            skills: raw.skills,
            experience_summary: raw.experience,
            city: raw.workerAddress,
          },
          { onConflict: 'user_id' }
        )

      if (workerProfileError) {
        console.error('[DB] Gagal upsert worker_profiles:', workerProfileError.code)
        return {
          success: false,
          message: 'Akun dibuat, tetapi profil pekerja gagal disimpan. Hubungi administrator.',
        }
      }
    }
  }

  return {
    success: true,
    message: autoconfirmEnabled
      ? 'Registrasi berhasil! Akun langsung aktif. Anda bisa langsung login.'
      : 'Registrasi berhasil! Silakan cek email Anda untuk memverifikasi akun.',
  }
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login(formData: FormData) {
  // [FIX MEDIUM] Rate limiting — cegah brute force login
  const ip = getClientIp()
  const rateLimitResult = checkRateLimit(`login:${ip}`, RATE_LIMITS.login)
  if (!rateLimitResult.allowed) {
    return { success: false, message: rateLimitResult.message }
  }

  const raw = {
    email: (formData.get('email') as string | null) ?? '',
    password: (formData.get('password') as string | null) ?? '',
  }

  // [FIX HIGH] Validasi input menggunakan Zod schema
  try {
    loginSchema.parse(raw)
  } catch (err) {
    if (err instanceof ZodError) {
      return { success: false, message: formatZodError(err) }
    }
    return { success: false, message: 'Data tidak valid.' }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: raw.email,
    password: raw.password,
  })

  if (error) {
    // [FIX MEDIUM] Log internal, kembalikan pesan generik ke user
    console.error('[AUTH] Login gagal:', error.status)
    return { success: false, message: normalizeAuthError(error.message) }
  }

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
