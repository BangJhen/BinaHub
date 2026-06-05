/**
 * In-memory rate limiter untuk mencegah abuse pada endpoint signup dan login.
 *
 * Catatan: Implementasi ini menggunakan memory proses Next.js.
 * Untuk multi-instance production, ganti dengan Redis (Upstash/etc).
 */

type RateLimitEntry = {
  count: number
  firstRequestAt: number
}

// Simpan state rate limit di memori
const store = new Map<string, RateLimitEntry>()

// Bersihkan entri lama setiap 15 menit untuk mencegah memory leak
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstRequestAt > CLEANUP_INTERVAL_MS) {
      store.delete(key)
    }
  }
}, CLEANUP_INTERVAL_MS)

export type RateLimitConfig = {
  /** Jumlah maksimum request yang diizinkan dalam window */
  maxRequests: number
  /** Durasi window dalam milidetik */
  windowMs: number
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; message: string }

/**
 * Cek apakah key (biasanya IP) masih dalam batas rate limit.
 *
 * @example
 * const result = checkRateLimit('signup:192.168.1.1', { maxRequests: 5, windowMs: 60_000 })
 * if (!result.allowed) return { success: false, message: result.message }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  // Jika tidak ada entri atau window sudah kadaluarsa, reset
  if (!entry || now - entry.firstRequestAt >= config.windowMs) {
    store.set(key, { count: 1, firstRequestAt: now })
    return { allowed: true }
  }

  // Masih dalam window — cek batas
  if (entry.count >= config.maxRequests) {
    const windowRemainingMs = config.windowMs - (now - entry.firstRequestAt)
    const retryAfterSeconds = Math.ceil(windowRemainingMs / 1000)
    const retryMinutes = Math.ceil(retryAfterSeconds / 60)

    return {
      allowed: false,
      retryAfterSeconds,
      message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${retryMinutes} menit.`,
    }
  }

  // Masih oke — increment
  entry.count += 1
  store.set(key, entry)
  return { allowed: true }
}

// ─── Konfigurasi bawaan per endpoint ─────────────────────────────────────────
export const RATE_LIMITS = {
  /** Maksimum 5 percobaan signup per IP per jam */
  signup: { maxRequests: 5, windowMs: 60 * 60 * 1000 } satisfies RateLimitConfig,
  /** Maksimum 10 percobaan login per IP per 15 menit */
  login: { maxRequests: 10, windowMs: 15 * 60 * 1000 } satisfies RateLimitConfig,
} as const
