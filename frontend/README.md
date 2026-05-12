# BinaHub Frontend (Next.js)

Struktur awal frontend untuk framework Next.js (App Router).

Dokumentasi onboarding lintas tim tersedia di root project: `../README.md`.

## Integrasi Supabase (Aktif)

Frontend sudah terhubung ke Supabase untuk auth dan data dashboard. Data dummy dari `src/features/*` tidak lagi dipakai di halaman dashboard.

### Environment variable

Pastikan `frontend/.env.local` berisi:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Setup schema database

Di Supabase SQL Editor, jalankan berurutan:

1. `db/schema.sql`
2. `db/seed.sql`

File referensi schema ada di folder root project: `../db`.

### Endpoint dashboard (live DB)

- `GET /api/dashboard/admin`
- `GET /api/dashboard/umkm`
- `GET /api/dashboard/worker`

Endpoint di atas menggunakan query layer:

- `src/lib/dashboard-queries.ts`

### Halaman yang sudah live dari Supabase

- `/admin/dashboard`
- `/admin/umkm/[umkmId]`
- `/admin/umkm/[umkmId]/workers/[workerId]`
- `/umkm/dashboard`
- `/umkm/workers/[workerId]`
- `/umkm/matching`
- `/worker/dashboard`

### Catatan registrasi

`src/app/auth/actions.ts` sekarang menyimpan data baru ke:

- `users`
- `umkm_profiles` (jika role `umkm`)
- `worker_profiles` (jika role `worker`)

Jadi data dari user baru bisa langsung masuk ke ekosistem dashboard.

## Struktur
- `public/`
- `src/app/`
- `src/app/api/`
- `src/components/`
- `src/features/`
- `src/hooks/`
- `src/lib/`
- `src/styles/`
- `src/types/`
