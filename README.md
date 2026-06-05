# BinaHub — Developer Documentation

BinaHub adalah platform job-matching & monitoring tenaga kerja untuk UMKM. Dokumen ini untuk mempermudah onboarding antar developer: memahami arsitektur, struktur repo, dan cara setup lokal.

## 1) Gambaran Proyek

Aplikasi web berbasis role:
- `admin`: memantau UMKM dan pekerja
- `umkm`: memantau pekerja aktif, alert, lowongan, dan matching
- `worker`: dashboard kondisi/performa pribadi, check-in harian, lamaran kerja

Data dashboard terhubung langsung ke Supabase (bukan dummy frontend). Analisis kondisi pekerja & generasi pertanyaan check-in ditangani oleh AI service terpisah.

## 2) Arsitektur & Tech Stack

```
Browser ──▶ apps/web (Next.js)  ──▶ Supabase (Auth, Postgres, Storage)
                  │
                  └── HTTP (AI_SERVICE_URL) ──▶ apps/ai-service (FastAPI + LLM/RAG)
```

- **Web**: Next.js 14 (App Router), React 18, TypeScript, framer-motion
- **AI Service**: Python, FastAPI, LLM + RAG (lihat `apps/ai-service/`)
- **Database/Auth/Storage**: Supabase (`@supabase/ssr`, `@supabase/supabase-js`)

## 3) Struktur Repository (Monorepo)

```
.
├── apps/
│   ├── web/                  # Aplikasi Next.js (frontend + API routes)
│   └── ai-service/           # FastAPI AI service (analisis & RAG)
├── packages/
│   └── db-tools/             # Script Node untuk seeding & admin (seed-auth, seed-lowongan, create-admin)
├── supabase/                 # Sumber kebenaran tunggal database
│   ├── config.toml
│   ├── schema.sql
│   ├── migrations/
│   └── seed/
├── docs/                     # Dokumentasi
│   ├── database/             # ERD.md + diagram
│   ├── planning/             # Dokumen perencanaan
│   └── monitoring/           # Konsep RAG & monitoring AI
├── package.json              # Orkestrasi monorepo + script db-tools
└── README.md
```

### Struktur `apps/web/src` (feature-based)

```
src/
├── app/                      # Next.js App Router (routes + API)
├── features/                 # Kode per domain
│   ├── home/                 # Section landing page
│   ├── auth/                 # Komponen autentikasi
│   ├── admin/ umkm/ worker/  # Navigasi & komponen per role
│   └── lowongan/             # Domain lowongan (api, queries, format, match, types)
├── shared/                   # Lintas-domain
│   ├── components/           # UI generik (IconButton, AvatarCropModal, ...)
│   ├── lib/                  # dashboard-queries, icon-utils, security, ...
│   └── supabase/             # Supabase client (browser/server/middleware)
└── middleware.ts
```

Import menggunakan alias `@/*` → `src/*` (mis. `@/features/lowongan/queries`, `@/shared/supabase/server`).

## 4) Prasyarat

- Node.js `>= 18` & npm
- Python `>= 3.9` (untuk `apps/ai-service`)
- Project Supabase aktif

## 5) Setup Environment

Buat `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# Opsional — koneksi ke AI service
AI_SERVICE_URL=http://localhost:8000
```

Untuk auto-confirm saat testing signup (jangan dipakai di production):

```env
AUTH_AUTOCONFIRM=true
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> **Keamanan**: `SUPABASE_SERVICE_ROLE_KEY` adalah secret admin-level. Jangan expose ke client; gunakan hanya server-side. Auto-confirm otomatis diblokir saat `NODE_ENV=production`.

AI service punya env sendiri — salin `apps/ai-service/.env.example` ke `apps/ai-service/.env`.

## 6) Setup Database

Lihat [`supabase/README.md`](supabase/README.md). Ringkas via Supabase CLI:

```bash
supabase start
supabase db reset      # apply migrations + seed
```

Atau manual via SQL Editor: jalankan `supabase/schema.sql`, lalu file di `supabase/seed/`.

Seeding via Node (dari root repo):

```bash
npm run seed:auth        # akun auth
npm run seed:lowongan    # data lowongan
npm run create:admin     # akun admin
```

## 7) Menjalankan Aplikasi

Dari root repository:

```bash
# Web (Next.js)
npm install --prefix apps/web
npm run dev              # passthrough ke apps/web → http://localhost:3000

# AI service (FastAPI)
cd apps/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Script root: `npm run dev | build | lint` (passthrough ke `apps/web`).

## 8) Integrasi Supabase

### Auth
- Registrasi/login: `apps/web/src/app/auth/actions.ts`
- Sinkronisasi ke tabel `users`, `umkm_profiles` (UMKM), `worker_profiles` (worker)
- Validasi input & file upload terpusat di `apps/web/src/shared/lib/security/`

### Dashboard API (live database)
- `GET /api/dashboard/{admin|umkm|worker}`
- Query layer terpusat: `apps/web/src/shared/lib/dashboard-queries.ts`

## 9) Halaman dengan Data Live

`/admin/dashboard`, `/admin/umkm/[umkmId]`, `/umkm/dashboard`, `/umkm/workers/[workerId]`, `/umkm/matching`, `/worker/dashboard`

## 10) Troubleshooting Cepat

- **Dashboard kosong**: cek RLS policy Supabase & pastikan seed sudah dijalankan.
- **Email konfirmasi tidak masuk**: cek rate limit email Supabase; untuk testing aktifkan `AUTH_AUTOCONFIRM=true` + service role key.
- **Signup gagal env**: pastikan `apps/web/.env.local` benar; restart dev server.
- **Upload dokumen gagal**: pastikan bucket Storage `documents` ada & policy sesuai.
- **AI check-in error**: pastikan `apps/ai-service` jalan & `AI_SERVICE_URL` benar.

## 11) Onboarding Developer Baru

1. Clone repo.
2. Setup `apps/web/.env.local` (dan `apps/ai-service/.env` jika perlu AI).
3. Setup DB Supabase (lihat `supabase/README.md`).
4. Jalankan web (`npm install --prefix apps/web`, `npm run dev`).
5. (Opsional) jalankan AI service.
6. Uji register/login & dashboard per role.
7. Jalankan `npm run lint` sebelum push.
