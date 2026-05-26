# 🌱 BinaHub Dummy Data Setup Guide

Panduan lengkap untuk setup dan menggunakan dummy data lowongan, aplikasi, dan auth users di BinaHub.

---

## 📋 Prerequisites

Sebelum mulai, pastikan Anda punya:

- ✅ Supabase project sudah dibuat
- ✅ Database schema sudah di-apply (`db/schema.sql`)
- ✅ Seed dashboard sudah di-apply (`db/seed-dashboard.sql`)
- ✅ Node.js >= 18 installed (untuk method Node.js)
- ✅ Environment variables di `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```

---

## 🔐 Step 1: Create Auth Users

Ada 2 cara untuk membuat auth users. Pilih salah satu:

### Cara A: Via SQL (Recommended untuk quick setup)

1. Buka Supabase Dashboard → SQL Editor
2. Klik "+ New Query"
3. Copy-paste isi file: `db/seed-auth.sql`
4. **PENTING**: Pastikan menggunakan **Service Role Key**, bukan Anon Key
5. Klik "Run" (tombol play)
6. Tunggu sampai selesai (lihat "Success" notification)

**Output yang diharapkan:**
```
✓ 3 UMKM users created
✓ 6 Worker users created
✓ users table updated
```

### Cara B: Via Node.js Script

1. Install dependencies:
   ```bash
   npm install
   ```

2. Jalankan seed script:
   ```bash
   npm run seed:auth
   ```

3. Script akan membuat 9 auth users secara otomatis

**Output yang diharapkan:**
```
🌱 Starting Supabase Auth seed...

✅ umkm.surya@binahub.id (umkm)
✅ umkm.kriya@binahub.id (umkm)
✅ umkm.segara@binahub.id (umkm)
✅ worker.andi@binahub.id (worker)
✅ worker.budi@binahub.id (worker)
✅ worker.citra@binahub.id (worker)
✅ worker.deni@binahub.id (worker)
✅ worker.eka@binahub.id (worker)
✅ worker.fajar@binahub.id (worker)

📊 Summary: 9 created, 0 errors
✨ Auth seed completed successfully!
```

---

## 📊 Step 2: Seed Lowongan Data

1. Buka Supabase Dashboard → SQL Editor
2. Klik "+ New Query"
3. Copy-paste isi file: `db/seed-lowongan.sql`
4. Klik "Run"
5. Tunggu sampai selesai

**Data yang di-insert:**
- 12 lowongan (4 per UMKM)
- 12 job applications (status: submitted/reviewed/accepted)
- 8 saved jobs (worker bookmarks)

---

## 👥 Test Accounts

Semua akun menggunakan password: **`demo-password-123`**

### UMKM Accounts

| Email | Role | Lokasi | Sektor | Lowongan |
|-------|------|--------|--------|----------|
| `umkm.surya@binahub.id` | UMKM | Bandung | Kuliner | 4 (Barista, Staff Ops, Kasir, Helper) |
| `umkm.kriya@binahub.id` | UMKM | Yogyakarta | Kerajinan | 4 (Admin, Sales, Kurir, Pengrajin) |
| `umkm.segara@binahub.id` | UMKM | Surabaya | Retail | 4 (Kasir, Display, CS, Helper) |

### Worker Accounts

| Email | Role | Kota | Skills | Status |
|-------|------|------|--------|--------|
| `worker.andi@binahub.id` | Worker | Bandung | Kasir, Operasional | 2 applications, 2 saved |
| `worker.budi@binahub.id` | Worker | Bandung | Gudang, Stok | 1 application |
| `worker.citra@binahub.id` | Worker | Yogyakarta | Admin, Input Data | 1 accepted, 2 saved |
| `worker.deni@binahub.id` | Worker | Yogyakarta | Kurir, Komunikasi | 1 accepted |
| `worker.eka@binahub.id` | Worker | Surabaya | Operasional, Display | 1 accepted, 1 saved |
| `worker.fajar@binahub.id` | Worker | Surabaya | Kasir, Pelayanan | 1 application |

---

## 🧪 Test Scenarios

### Scenario 1: UMKM Dashboard Lowongan

```
1. Login: umkm.surya@binahub.id / demo-password-123
2. Klik "Lowongan" di sidebar
3. Lihat 4 lowongan Bandung dengan:
   ✓ KPI cards (4 lowongan, 6 pelamar, 2 hired, 12 views)
   ✓ List dengan filter status (Aktif/Draft/Ditutup)
   ✓ Preview panel kanan dengan detail pelamar
4. Klik lowongan  lihat daftar pelamar dengan status
5. Klik pelamar → lihat detail profil + surat lamaran
```

### Scenario 2: UMKM Matching (Job Matching)

```
1. Login: umkm.kriya@binahub.id / demo-password-123
2. Klik "Matching" di sidebar
3. Pilih lowongan di kiri (Admin Gudang, Sales, Kurir, Pengrajin)
4. Lihat ranking kandidat dengan score breakdown:
   ✓ Skill match (35%)
   ✓ Lokasi (15%)
   ✓ Performa (35%)
   ✓ Kondisi (15%)
5. Lihat matched skills ter-highlight
6. Klik "Lihat Profil" → buka profil worker
```

### Scenario 3: Worker Cari Lowongan

```
1. Login: worker.andi@binahub.id / demo-password-123
2. Klik "Lowongan" di sidebar
3. Lihat hero search + filter sidebar (tipe, sistem, pengalaman)
4. Lihat 12 lowongan dari 3 UMKM
5. Klik lowongan → detail page dengan:
   ✓ Hero card gradient
   ✓ Quick info strip
   ✓ Deskripsi, syarat, skills, benefit
   ✓ Tombol Lamar, Simpan, Bagikan
6. Klik "Simpan" → card masuk ke Lowongan Tersimpan
```

### Scenario 4: Worker Lowongan Tersimpan

```
1. Login: worker.andi@binahub.id / demo-password-123
2. Klik "Lowongan Tersimpan" di sidebar
3. Lihat 2 lowongan yang sudah disimpan (Barista, Helper)
4. Klik "Lihat Detail" → buka detail page
5. Klik tombol unsave → card hilang dari list (instant feedback)
```

### Scenario 5: UMKM Buat Lowongan Baru

```
1. Login: umkm.segara@binahub.id / demo-password-123
2. Klik "Lowongan" → tombol "+ Buat Lowongan"
3. Isi form 5 section:
   ✓ Info Dasar (posisi, lokasi, tipe, jumlah)
   ✓ Kualifikasi (pendidikan, pengalaman, usia)
   ✓ Gaji (min-max)
   ✓ Deskripsi & Syarat
   ✓ Skills & Benefit
4. Klik "Buat Lowongan" → redirect ke list dengan lowongan baru
```

### Scenario 6: UMKM Edit Lowongan

```
1. Login: umkm.surya@binahub.id / demo-password-123
2. Klik lowongan → preview panel → tombol "Edit"
3. Ubah data (misal gaji, skills)
4. Klik "Simpan Perubahan" → kembali ke list
```

---

## 📊 Data Structure

Setelah seed berhasil, Anda punya:

```
users (9 total)
├── 3 UMKM (Surya, Kriya, Segara)
└── 6 workers (Andi, Budi, Citra, Deni, Eka, Fajar)

jobs (12 total)
├── 4 dari UMKM Surya (Bandung)
├── 4 dari UMKM Kriya (Yogyakarta)
└── 4 dari UMKM Segara (Surabaya)

job_applications (12 total)
├── Status: submitted (5), reviewed (3), accepted (4)
└── Sesuai worker location

saved_jobs (8 total)
└── Workers bookmark lowongan untuk lamar nanti

worker_profiles (6 total)
└── Skills, experience, city, education_level
```

---

## 🐛 Troubleshooting

### Error: "User already exists"

**Penyebab:** Auth users sudah ada dari seed sebelumnya

**Solusi:**
1. Buka Supabase Dashboard → Authentication → Users
2. Hapus semua users dengan email `@binahub.id`
3. Jalankan seed lagi

### Error: "Service role key not found"

**Penyebab:** Environment variable `SUPABASE_SERVICE_ROLE_KEY` tidak diset

**Solusi:**
1. Buka Supabase Dashboard → Settings → API
2. Copy "Service Role" key (bukan Anon Key)
3. Paste ke `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_key_here
   ```
4. Jalankan seed lagi

### Error: "Foreign key constraint failed"

**Penyebab:** Schema atau seed dashboard belum di-apply

**Solusi:**
1. Jalankan `db/schema.sql` terlebih dahulu
2. Jalankan `db/seed-dashboard.sql`
3. Baru jalankan `db/seed-auth.sql` dan `db/seed-lowongan.sql`

### Lowongan tidak muncul di worker page

**Penyebab:** Lowongan status masih "draft"

**Solusi:**
1. Login UMKM
2. Klik lowongan → Edit
3. Ubah status ke "Aktif"
4. Simpan

---

## ✅ Verification Checklist

Setelah seed selesai, verifikasi dengan:

- [ ] Login UMKM → lihat 4 lowongan di dashboard
- [ ] Login Worker → lihat 12 lowongan di list
- [ ] Login UMKM → Matching → lihat ranking kandidat
- [ ] Login Worker → Lowongan Tersimpan → lihat 2 saved jobs
- [ ] Login UMKM → Pelamar → lihat daftar aplikasi dengan status

---

## 📝 Notes

- Semua lowongan sudah punya full data: deskripsi, syarat, skills, benefit, education_level, experience_required, age_range
- Aplikasi sudah punya cover letter dan status bervariasi
- Worker profiles sudah punya skills, experience, city, education_level
- Matching score sudah dihitung berdasarkan skill, lokasi, performa, kondisi
- Dummy data sesuai geografis: Bandung (Kuliner), Yogyakarta (Kerajinan), Surabaya (Retail)

---

## 🚀 Next Steps

Setelah dummy data siap:

1. Test semua fitur lowongan (create, edit, delete, matching)
2. Test worker flow (search, apply, save, detail)
3. Test UMKM flow (dashboard, pelamar, matching)
4. Collect feedback dan iterate

Happy testing! 🎉
