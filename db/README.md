# BinaHub Database (PostgreSQL)

## Struktur
- `schema.sql`: definisi enum, tabel, relasi, constraint, index.
- `seed.sql`: data awal untuk demo prototype.
- `seed-dashboard.sql`: data dummy lebih besar untuk uji dashboard (admin/UMKM/worker).

## Entitas utama
- `users`: akun semua role (`admin`, `umkm`, `worker`).
- `worker_profiles`, `umkm_profiles`: detail profil per role.
- `jobs`, `job_applications`, `placements`: alur rekrutmen dan penempatan kerja.
- `checkins`: laporan kondisi harian pekerja (teks/suara).
- `risk_assessments`: hasil analisis risiko (`green/yellow/red`).
- `alerts`: notifikasi ke pihak UMKM.

## Cara pakai cepat
1. Buat database PostgreSQL, contoh: `binahub_db`.
2. Jalankan schema:
   ```bash
   psql -d binahub_db -f db/schema.sql
   ```
3. Isi data demo:
   ```bash
   psql -d binahub_db -f db/seed.sql
   ```
4. (Opsional, direkomendasikan untuk uji dashboard) isi data dummy tambahan:
   ```bash
   psql -d binahub_db -f db/seed-dashboard.sql
   ```

## Catatan
- `password_hash` di `seed.sql` masih dummy dan bukan hash asli.
- Untuk integrasi aplikasi, gunakan hash password valid (misalnya `bcrypt`).
- `risk_assessments` mendukung kombinasi rule-based + AI model (`model_name`).
