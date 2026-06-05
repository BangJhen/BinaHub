# BinaHub Web (Next.js)

Aplikasi web BinaHub berbasis Next.js (App Router). Dokumentasi onboarding lintas tim ada di root project: [`../../README.md`](../../README.md).

## Environment

Buat `apps/web/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AI_SERVICE_URL` (opsional, default `http://localhost:8000`)

Setup database lihat [`../../supabase/README.md`](../../supabase/README.md).

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
```

## Struktur `src` (feature-based)

```
src/
├── app/                  # Routes & API (Next.js App Router)
├── features/             # Kode per domain
│   ├── home/             # Section landing page
│   ├── auth/             # Komponen autentikasi
│   ├── admin/ umkm/ worker/   # Komponen & navigasi per role
│   └── lowongan/         # Domain lowongan: api, queries, format, match, types
├── shared/
│   ├── components/       # UI generik lintas-domain
│   ├── lib/              # dashboard-queries, icon-utils, security, ...
│   └── supabase/         # Client Supabase (browser/server/middleware)
└── middleware.ts
```

Alias import: `@/*` → `src/*`.

## Integrasi Supabase (Aktif)

Auth & data dashboard sudah terhubung ke Supabase.

### Endpoint dashboard (live DB)
- `GET /api/dashboard/admin`
- `GET /api/dashboard/umkm`
- `GET /api/dashboard/worker`

Query layer terpusat: `src/shared/lib/dashboard-queries.ts`.

### Registrasi
`src/app/auth/actions.ts` menyimpan data baru ke `users`, dan `umkm_profiles`/`worker_profiles` sesuai role. Validasi input & file upload ada di `src/shared/lib/security/`.

### Halaman live dari Supabase
`/admin/dashboard`, `/admin/umkm/[umkmId]`, `/admin/umkm/[umkmId]/workers/[workerId]`, `/umkm/dashboard`, `/umkm/workers/[workerId]`, `/umkm/matching`, `/worker/dashboard`
