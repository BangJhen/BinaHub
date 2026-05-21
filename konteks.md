# Konteks BinaHub untuk PowerPoint

Dokumen ini merangkum konteks proyek BinaHub sebagai bahan presentasi dan prompting. Fokusnya: gambaran produk, tech stack, struktur, alur setup, serta area kode/UI yang relevan untuk ditampilkan.

## 1) Ringkasan Produk
BinaHub adalah aplikasi web berbasis role dengan tiga tipe pengguna:
- Admin: memantau UMKM dan pekerja.
- UMKM: memantau pekerja aktif, alert, dan matching.
- Worker: melihat dashboard kondisi/performa pribadi.

Data dashboard sudah terhubung ke Supabase (bukan dummy data frontend).

## 2) Tech Stack Utama
- Framework: Next.js 14.2.5 (App Router)
- UI: React 18.3.1
- Bahasa: TypeScript
- Animasi: framer-motion
- Backend service: Supabase (Auth, Postgres, Storage)
- Supabase libs: @supabase/ssr, @supabase/supabase-js

## 3) Struktur Folder Inti
- frontend/: aplikasi Next.js
- db/: schema dan seed SQL (schema.sql, seed.sql, seed-dashboard.sql)
- README tambahan:
  - frontend/README.md
  - db/README.md

## 4) Alur Setup Ringkas
Prasyarat: Node.js >= 18, npm, project Supabase aktif.

Buat frontend/.env.local:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Opsional testing signup:
- AUTH_AUTOCONFIRM=true
- SUPABASE_SERVICE_ROLE_KEY

Setup database di Supabase SQL Editor (urutan):
1) db/schema.sql
2) db/seed.sql
3) db/seed-dashboard.sql (opsional, direkomendasikan)

Jalankan frontend:
- npm install
- npm run dev
- Akses http://localhost:3000

## 5) Integrasi Supabase (Poin Presentasi)
Auth:
- File: frontend/src/app/auth/actions.ts
- Registrasi menyimpan sinkronisasi ke tabel:
  - users
  - umkm_profiles (role UMKM)
  - worker_profiles (role worker)

Dashboard API (live database):
- GET /api/dashboard/admin
- GET /api/dashboard/umkm
- GET /api/dashboard/worker

Query layer terpusat:
- frontend/src/lib/dashboard-queries.ts

## 6) Halaman dengan Data Live
- /admin/dashboard
- /admin/umkm/[umkmId]
- /admin/umkm/[umkmId]/workers/[workerId]
- /umkm/dashboard
- /umkm/workers/[workerId]
- /umkm/matching
- /worker/dashboard

## 7) Saran Materi Slide (Prompting + Demo)
Gunakan poin ini untuk menyusun prompt dan alur demo:

1. Masalah dan Solusi
- Masalah: monitoring UMKM dan pekerja sulit jika data terpisah.
- Solusi: dashboard berbasis role, data terintegrasi via Supabase.

2. Arsitektur Singkat
- Next.js App Router di frontend.
- Supabase sebagai Auth + Database + Storage.
- Query terpusat di dashboard-queries.ts.

3. Demo UI (Tampilkan Halaman)
- Admin: /admin/dashboard
- UMKM: /umkm/dashboard
- Worker: /worker/dashboard

4. Demo Code (Tampilkan File)
- Auth flow: frontend/src/app/auth/actions.ts
- Dashboard queries: frontend/src/lib/dashboard-queries.ts
- Contoh page route: frontend/src/app/.../page.tsx

5. Validasi Data Live
- Tunjukkan bahwa data berasal dari Supabase (bukan dummy).
- Jelaskan alur seed SQL untuk data uji.

## 8) Catatan Keamanan
- SUPABASE_SERVICE_ROLE_KEY adalah secret admin-level.
- Jangan expose ke client/browser.
- Gunakan hanya server-side.

## 9) Troubleshooting Cepat (Untuk Slide Lampiran)
- Dashboard kosong: cek RLS policy dan seed data.
- Email konfirmasi: cek rate limit, gunakan AUTH_AUTOCONFIRM untuk testing.
- Signup gagal: pastikan env valid dan restart dev server.
- Upload dokumen worker: pastikan bucket "documents" dan policy aksesnya.

## 10) Konteks Bisnis BinaHub
Bagian ini merangkum sudut pandang bisnis untuk presentasi non-teknis.

### Masalah yang Disasar
- Monitoring UMKM dan pekerja sering terfragmentasi di banyak alat atau catatan manual.
- UMKM sulit memantau produktivitas dan kondisi pekerja secara konsisten.
- Admin membutuhkan visibilitas menyeluruh untuk pengambilan keputusan.

### Solusi yang Ditawarkan
- Dashboard berbasis role (admin, UMKM, worker) untuk akses data yang relevan.
- Data terintegrasi dan real-time via Supabase agar keputusan lebih cepat.
- Alur kerja yang jelas: monitoring, alert, dan matching berbasis data.

### Nilai Bisnis Utama
- Efisiensi operasional: pengawasan dan pelaporan lebih cepat.
- Keputusan berbasis data: tren dan performa terlihat di dashboard.
- Transparansi: setiap role melihat data yang sesuai kebutuhannya.

### Target Pengguna
- Admin instansi atau pengelola program.
- Pelaku UMKM sebagai pengelola pekerja.
- Worker sebagai penerima manfaat dan pemantau performa.

### Dampak yang Diharapkan
- UMKM lebih siap meningkatkan produktivitas dan kualitas kerja.
- Pengelola program lebih akurat dalam evaluasi dan intervensi.
- Worker lebih paham kondisi dan progres pribadi.

### Model Implementasi
- Aplikasi web dengan login berbasis role.
- Integrasi data terpusat (Auth + Database + Storage).
- Dapat diadopsi bertahap mulai dari pilot di beberapa UMKM.

## 11) Contoh Prompt Singkat (Untuk Dihubungkan ke Konteks)
Gunakan salah satu prompt berikut saat menyiapkan materi PPT atau demo.

Prompt 1 (Ringkasan Produk):
"Ringkas proyek BinaHub dalam 5-7 poin untuk slide pembuka. Tekankan role admin, UMKM, dan worker serta integrasi data live via Supabase."

Prompt 2 (Arsitektur Singkat):
"Buatkan 1 slide arsitektur BinaHub: Next.js App Router sebagai frontend, Supabase sebagai Auth + Database + Storage, dan query terpusat di dashboard-queries.ts."

Prompt 3 (Alur Demo):
"Susun alur demo 3 langkah untuk BinaHub: login per role, buka dashboard, dan tunjukkan data live dari Supabase. Sertakan rute halaman yang ditampilkan."

Prompt 4 (Slide Code + UI):
"Pilih 2 file code dan 2 halaman UI BinaHub untuk ditampilkan di PPT. Jelaskan alasan pemilihannya dalam 1-2 kalimat."
