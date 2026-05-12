# BinaHub - Developer Documentation

Dokumentasi ini dibuat untuk mempermudah onboarding antar developer: memahami tech stack, cara setup lokal, menjalankan website, dan integrasi Supabase.

## 1) Gambaran Proyek

BinaHub adalah aplikasi web berbasis role:
- `admin`: memantau UMKM dan pekerja
- `umkm`: memantau pekerja aktif, alert, dan matching
- `worker`: melihat dashboard kondisi/performa pribadi

Data dashboard sudah terhubung ke Supabase (bukan dummy data frontend).

## 2) Tech Stack

- Frontend framework: `Next.js 14.2.5` (App Router)
- UI library: `React 18.3.1`
- Language: `TypeScript`
- Animation: `framer-motion`
- Backend service: `Supabase` (Auth, Postgres, Storage)
- Supabase client libs:
  - `@supabase/ssr`
  - `@supabase/supabase-js`

## 3) Struktur Folder Utama

- `frontend/`: aplikasi Next.js
- `db/`: schema dan seed SQL
  - `schema.sql`
  - `seed.sql`
  - `seed-dashboard.sql`

Dokumentasi detail tambahan:
- `frontend/README.md`
- `db/README.md`

## 4) Prasyarat Development

- Node.js `>= 18`
- npm (menggunakan `package-lock.json`)
- Project Supabase aktif

## 5) Setup Environment

Buat file `frontend/.env.local` lalu isi minimal:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Untuk mode auto-confirm saat testing signup:

```env
AUTH_AUTOCONFIRM=true
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Catatan keamanan:
- `SUPABASE_SERVICE_ROLE_KEY` adalah secret admin-level.
- Jangan expose ke client/browser.
- Gunakan hanya pada server-side flow.

## 6) Setup Database (Supabase SQL Editor)

Jalankan SQL berikut secara berurutan:

1. `db/schema.sql`
2. `db/seed.sql`
3. `db/seed-dashboard.sql` (opsional, direkomendasikan untuk uji dashboard)

Script `seed-dashboard.sql` menambahkan data uji yang lebih kaya untuk role admin/UMKM/worker.

## 7) Menjalankan Website (Local)

Di folder `frontend/`:

```bash
npm install
npm run dev
```

Aplikasi berjalan di:
- `http://localhost:3000`

Script penting:
- `npm run dev` - development server
- `npm run build` - production build
- `npm run start` - run production build
- `npm run lint` - linting code

## 8) Integrasi Supabase yang Sudah Aktif

### Auth
- Registrasi/login ada di: `frontend/src/app/auth/actions.ts`
- Registrasi menyimpan sinkronisasi data ke tabel:
  - `users`
  - `umkm_profiles` (role UMKM)
  - `worker_profiles` (role worker)

### Dashboard API (live database)
- `GET /api/dashboard/admin`
- `GET /api/dashboard/umkm`
- `GET /api/dashboard/worker`

Query layer terpusat:
- `frontend/src/lib/dashboard-queries.ts`

## 9) Halaman yang Menggunakan Data Live

- `/admin/dashboard`
- `/admin/umkm/[umkmId]`
- `/admin/umkm/[umkmId]/workers/[workerId]`
- `/umkm/dashboard`
- `/umkm/workers/[workerId]`
- `/umkm/matching`
- `/worker/dashboard`

## 10) Troubleshooting Cepat

### A) Dashboard kosong padahal data ada
- Cek RLS policy/tabel di Supabase.
- Pastikan query role terkait bisa membaca data sesuai policy.
- Validasi data sudah terisi dari `seed.sql` / `seed-dashboard.sql`.

### B) Email konfirmasi tidak masuk
- Cek batas rate limit email Supabase.
- Untuk testing cepat, aktifkan:
  - `AUTH_AUTOCONFIRM=true`
  - `SUPABASE_SERVICE_ROLE_KEY` terisi valid.

### C) Signup gagal karena env
- Pastikan semua env di `frontend/.env.local` benar.
- Restart dev server setelah ubah env (`npm run dev`).

### D) Upload dokumen worker gagal
- Pastikan bucket Supabase Storage `documents` sudah ada dan policy akses sesuai.

## 11) Alur Onboarding Developer Baru (Rekomendasi)

1. Clone repo.
2. Setup `frontend/.env.local`.
3. Jalankan SQL setup di Supabase (`schema` -> `seed` -> `seed-dashboard`).
4. Jalankan frontend (`npm install`, `npm run dev`).
5. Uji register/login dan akses dashboard sesuai role.
6. Jalankan `npm run lint` sebelum push perubahan.
