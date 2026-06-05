# BinaHub Database (Supabase / PostgreSQL)

Sumber kebenaran tunggal untuk skema dan data database BinaHub.

## Struktur

```
supabase/
├── config.toml      # Konfigurasi Supabase CLI (local dev)
├── schema.sql       # Definisi lengkap enum, tabel, relasi, constraint, index
├── migrations/      # Migrasi inkremental (dijalankan berurutan oleh Supabase CLI)
└── seed/            # Data awal untuk demo & pengujian
    ├── seed.sql            # Data demo prototype dasar
    ├── seed-auth.sql       # Akun auth (admin/umkm/worker)
    ├── seed-dashboard.sql  # Data dummy besar untuk uji dashboard
    └── seed-lowongan.sql   # Data lowongan & lamaran
```

## Entitas utama
- `users`: akun semua role (`admin`, `umkm`, `worker`).
- `worker_profiles`, `umkm_profiles`: detail profil per role.
- `jobs`, `job_applications`, `placements`: alur rekrutmen dan penempatan kerja.
- `checkins`: laporan kondisi harian pekerja (teks/suara).
- `risk_assessments`: hasil analisis risiko (`green/yellow/red`).
- `alerts`: notifikasi ke pihak UMKM.

Lihat diagram relasi di [`docs/database/ERD.md`](../docs/database/ERD.md).

## Cara pakai

### Menggunakan Supabase CLI (direkomendasikan)
```bash
supabase start          # jalankan stack lokal
supabase db reset       # terapkan migrations + seed
```

### Manual via psql
```bash
psql -d binahub_db -f supabase/schema.sql
psql -d binahub_db -f supabase/seed/seed.sql
psql -d binahub_db -f supabase/seed/seed-dashboard.sql   # opsional, untuk uji dashboard
```

### Seed via Node script
```bash
npm run seed:auth        # buat akun auth
npm run seed:lowongan    # isi data lowongan
```

## Catatan
- `password_hash` di `seed.sql` masih dummy dan bukan hash asli. Gunakan hash valid (mis. `bcrypt`) untuk integrasi nyata.
- `risk_assessments` mendukung kombinasi rule-based + AI model (`model_name`).
