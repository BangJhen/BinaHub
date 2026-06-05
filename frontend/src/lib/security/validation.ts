/**
 * Validation schemas menggunakan Zod untuk semua input auth.
 * Semua validasi dipusatkan di sini agar mudah di-maintain.
 */

import { z } from 'zod'

// ─── Konstanta Validasi File ──────────────────────────────────────────────────
export const FILE_UPLOAD = {
  ALLOWED_MIME_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_EXTENSIONS: ['pdf', 'jpg', 'jpeg', 'png'],
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5 MB
  MAX_SIZE_LABEL: '5MB',
} as const

// ─── Schema Login ─────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── Schema Signup Base (data yang wajib ada untuk semua role) ───────────────
const signupBaseSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .max(128, 'Password terlalu panjang')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
  name: z
    .string()
    .min(3, 'Nama minimal 3 karakter')
    .max(150, 'Nama terlalu panjang')
    .regex(/^[a-zA-Z\s'.,-]+$/, 'Nama hanya boleh mengandung huruf dan karakter umum'),
  role: z.enum(['umkm', 'worker'], {
    error: 'Peran tidak valid. Pilih umkm atau worker.',
  }),
})

// ─── Schema Signup UMKM ───────────────────────────────────────────────────────
export const signupUmkmSchema = signupBaseSchema.extend({
  role: z.literal('umkm'),
  businessName: z
    .string()
    .min(3, 'Nama usaha minimal 3 karakter')
    .max(150, 'Nama usaha terlalu panjang'),
  businessType: z
    .string()
    .min(2, 'Jenis usaha wajib diisi')
    .max(120, 'Jenis usaha terlalu panjang'),
  businessAddress: z
    .string()
    .min(10, 'Alamat usaha minimal 10 karakter')
    .max(500, 'Alamat usaha terlalu panjang'),
})

export type SignupUmkmInput = z.infer<typeof signupUmkmSchema>

// ─── Schema Signup Worker ─────────────────────────────────────────────────────
export const signupWorkerSchema = signupBaseSchema.extend({
  role: z.literal('worker'),
  nik: z
    .string()
    .length(16, 'NIK harus tepat 16 digit')
    .regex(/^\d{16}$/, 'NIK hanya boleh berisi angka'),
  workerAddress: z
    .string()
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat terlalu panjang'),
  skills: z
    .string()
    .min(5, 'Keahlian minimal 5 karakter')
    .max(500, 'Deskripsi keahlian terlalu panjang'),
  experience: z
    .string()
    .min(10, 'Ringkasan pengalaman minimal 10 karakter')
    .max(1000, 'Ringkasan pengalaman terlalu panjang'),
})

export type SignupWorkerInput = z.infer<typeof signupWorkerSchema>

// ─── Helper: Validasi File Upload ─────────────────────────────────────────────
export type FileValidationResult =
  | { valid: true }
  | { valid: false; message: string }

export function validateDocumentFile(file: File | null | string): FileValidationResult {
  if (!file || typeof file === 'string' || file.size === 0) {
    return { valid: false, message: 'Dokumen identitas wajib diunggah' }
  }

  if (!FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type as typeof FILE_UPLOAD.ALLOWED_MIME_TYPES[number])) {
    return {
      valid: false,
      message: `Tipe file tidak didukung. Hanya PDF, JPG, dan PNG yang diizinkan.`,
    }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(ext as typeof FILE_UPLOAD.ALLOWED_EXTENSIONS[number])) {
    return {
      valid: false,
      message: `Ekstensi file tidak valid. Gunakan .pdf, .jpg, atau .png`,
    }
  }

  if (file.size > FILE_UPLOAD.MAX_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      message: `Ukuran file (${sizeMb}MB) melebihi batas maksimum ${FILE_UPLOAD.MAX_SIZE_LABEL}`,
    }
  }

  return { valid: true }
}

// ─── Helper: Generate nama file aman ─────────────────────────────────────────
export function generateSafeFileName(role: string, originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'bin'
  // Gunakan crypto.randomUUID() agar nama file tidak bisa ditebak/diprediksi
  const randomId = crypto.randomUUID()
  return `${role}_doc_${randomId}.${ext}`
}
