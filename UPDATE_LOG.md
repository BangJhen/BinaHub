# BinaHub Update Log

Tanggal: 2026-05-23

## Ringkasan
Update ini menambahkan fitur Simpan & Bagikan lowongan, field skills/benefits, serta field pendidikan/pengalaman/rentang usia pada job detail. Perubahan mencakup skema database, migrasi Supabase, endpoint API, dan UI/form di frontend.

## Database
- Menambahkan tabel `saved_jobs` untuk menyimpan lowongan yang disimpan pekerja.
- Menambahkan kolom `skills` dan `benefits` bertipe `TEXT[]` pada tabel `jobs`.
- Menambahkan kolom `education_level`, `experience_required`, dan `age_range` pada tabel `jobs`.
- Migrasi Supabase terkait berada di:
  - supabase/migrations/2026052301_add_job_skills_benefits.sql
  - supabase/migrations/20260523_add_saved_jobs.sql
  - supabase/migrations/20260523102041_add_job_requirements.sql
- Skema lokal diperbarui di db/schema.sql.

## API (Next.js App Router)
- Worker job detail mengembalikan `skills`, `benefits`, `educationLevel`, `experienceRequired`, `ageRange`.
  - frontend/src/app/api/worker/lowongan/[id]/route.ts
- Simpan lowongan worker melalui endpoint save.
  - frontend/src/app/api/worker/lowongan/[id]/save/route.ts
- UMKM create/edit lowongan menyimpan field baru.
  - frontend/src/app/api/umkm/lowongan/route.ts
  - frontend/src/app/api/umkm/lowongan/[id]/route.ts

## Frontend UI
- Form create/edit UMKM menambahkan input:
  - Skills, Benefits (comma separated)
  - Pendidikan, Pengalaman, Rentang Usia
  - frontend/src/app/umkm/lowongan/create/components/LowonganForm.tsx
  - frontend/src/app/umkm/lowongan/[id]/edit/page.tsx
- Halaman detail lowongan worker menampilkan data real untuk quick summary dan tag skills/benefits.
  - frontend/src/app/worker/lowongan/[id]/page.tsx

## Types
- Menambahkan field baru pada tipe `Lowongan`.
  - frontend/src/types/lowongan.ts

## Catatan Migrasi
- Konflik versi migrasi `20260523` diselesaikan dengan repair dan push ulang.
- `saved_jobs` sudah ada di database, sehingga push menghasilkan NOTICE dan tetap aman.

## Status
- Build Next.js sukses dijalankan (`npm run build`).
- Aplikasi siap dijalankan dengan `npm run dev`.
