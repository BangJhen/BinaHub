BEGIN;

-- ============================================================
-- LOWONGAN SEED
-- Aligns with seed-dashboard.sql UMKM and worker locations:
--   UMKM 1 (Surya Pangan)    -> Bandung, Kuliner
--   UMKM 2 (Kriya Nusantara) -> Yogyakarta, Kerajinan
--   UMKM 3 (Segara Retail)   -> Surabaya, Retail
-- ============================================================

-- Idempotent cleanup
DELETE FROM saved_jobs
WHERE job_id IN (
  '80000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000003',
  '80000000-0000-0000-0000-000000000004',
  '80000000-0000-0000-0000-000000000005',
  '80000000-0000-0000-0000-000000000006',
  '80000000-0000-0000-0000-000000000007',
  '80000000-0000-0000-0000-000000000008',
  '80000000-0000-0000-0000-000000000009',
  '80000000-0000-0000-0000-00000000000a',
  '80000000-0000-0000-0000-00000000000b',
  '80000000-0000-0000-0000-00000000000c'
);

DELETE FROM job_applications
WHERE id IN (
  '90000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000002',
  '90000000-0000-0000-0000-000000000003',
  '90000000-0000-0000-0000-000000000004',
  '90000000-0000-0000-0000-000000000005',
  '90000000-0000-0000-0000-000000000006',
  '90000000-0000-0000-0000-000000000007',
  '90000000-0000-0000-0000-000000000008',
  '90000000-0000-0000-0000-000000000009',
  '90000000-0000-0000-0000-00000000000a',
  '90000000-0000-0000-0000-00000000000b',
  '90000000-0000-0000-0000-00000000000c'
);

DELETE FROM jobs
WHERE id IN (
  '80000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000003',
  '80000000-0000-0000-0000-000000000004',
  '80000000-0000-0000-0000-000000000005',
  '80000000-0000-0000-0000-000000000006',
  '80000000-0000-0000-0000-000000000007',
  '80000000-0000-0000-0000-000000000008',
  '80000000-0000-0000-0000-000000000009',
  '80000000-0000-0000-0000-00000000000a',
  '80000000-0000-0000-0000-00000000000b',
  '80000000-0000-0000-0000-00000000000c'
);

-- ============================================================
-- JOBS
-- ============================================================

INSERT INTO jobs (
  id, umkm_id, title, description, requirements, employment_type, location,
  salary_min, salary_max, skills, benefits,
  education_level, experience_required, age_range,
  status, published_at
)
VALUES
-- ------------------------------------------------------------
-- UMKM Surya Pangan (Bandung, Kuliner)
-- ------------------------------------------------------------
(
  '80000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'Barista Kafe Cabang Cibaduyut',
  E'Meracik berbagai jenis minuman kopi sesuai resep standar kafe.\nMelayani pelanggan dengan ramah dan menjaga kualitas rasa konsisten.\nMenjaga kebersihan area bar dan peralatan kerja.\nMembantu rekap penjualan minuman setiap akhir shift.',
  E'Pendidikan minimal SMA/SMK sederajat.\nLebih disukai berpengalaman sebagai barista atau pelatihan kopi.\nRamah, cekatan, dan menyukai dunia kopi.\nBersedia bekerja shift pagi atau sore.',
  'Full Time',
  'Bandung',
  3000000,
  4200000,
  ARRAY['Latte Art', 'Customer Service', 'Meracik Kopi', 'Operasional Bar'],
  ARRAY['BPJS Kesehatan', 'Makan Siang', 'Tips Pelanggan', 'Pelatihan Kopi'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 30 Tahun',
  'open',
  NOW() - INTERVAL '2 days'
),
(
  '80000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000001',
  'Staff Operasional Toko Pusat',
  E'Menangani operasional harian toko dari opening hingga closing.\nMelayani pelanggan dan menjaga ketersediaan produk di rak.\nMembantu pengelolaan stok dan rekap penjualan harian.\nMenjaga kebersihan dan kerapihan area toko.',
  E'Pendidikan minimal SMA/SMK.\nDisiplin, komunikatif, dan siap bekerja shift.\nFresh graduate dipersilakan melamar.\nDomisili Bandung dan sekitarnya.',
  'Full Time',
  'Bandung',
  2800000,
  3600000,
  ARRAY['Customer Service', 'Operasional Toko', 'Manajemen Stok', 'Komunikasi'],
  ARRAY['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Bonus Bulanan', 'THR'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 28 Tahun',
  'open',
  NOW() - INTERVAL '5 days'
),
(
  '80000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0000-000000000001',
  'Kasir Outlet Bandung Selatan',
  E'Melayani pembayaran pelanggan dengan ramah dan akurat.\nMengelola transaksi tunai dan non-tunai (QRIS, debit, kredit).\nMembuat laporan penjualan harian dan rekap kas.\nMenjaga kerapihan area kasir.',
  E'Pendidikan minimal SMA/SMK.\nMampu menghitung cepat, jujur, dan teliti.\nKomunikatif dan ramah dengan pembeli.',
  'Full Time',
  'Bandung',
  2700000,
  3300000,
  ARRAY['Kasir', 'POS System', 'Customer Service', 'Menghitung Cepat'],
  ARRAY['BPJS Kesehatan', 'Bonus Kehadiran', 'Makan Siang'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 30 Tahun',
  'open',
  NOW() - INTERVAL '1 days'
),
(
  '80000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0000-000000000001',
  'Helper Dapur (Part Time)',
  E'Membantu chef menyiapkan bahan baku masakan.\nMembersihkan peralatan dapur dan menjaga sanitasi.\nMembantu plating sederhana saat jam sibuk.',
  E'Sehat jasmani dan kuat fisik.\nBersedia bekerja shift sore (15.00 - 22.00).\nLebih disukai punya pengalaman F&B.',
  'Part Time',
  'Bandung',
  1500000,
  2200000,
  ARRAY['Food Safety', 'Sanitasi Dapur', 'Tanggap', 'Tim Player'],
  ARRAY['Makan 2x', 'Bonus Kehadiran'],
  'SMP/SMA',
  'Fresh Graduate diperbolehkan',
  '18 - 35 Tahun',
  'open',
  NOW() - INTERVAL '7 days'
),

-- ------------------------------------------------------------
-- UMKM Kriya Nusantara (Yogyakarta, Kerajinan)
-- ------------------------------------------------------------
(
  '80000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0000-000000000002',
  'Admin Gudang Workshop',
  E'Mengelola stok bahan baku dan barang jadi workshop kerajinan.\nMencatat data inventory secara rapi pada sistem.\nMembuat laporan harian stok masuk dan keluar.\nBerkoordinasi dengan tim produksi terkait kebutuhan material.',
  E'Pendidikan minimal SMA/SMK.\nTeliti dan menguasai Microsoft Excel dasar.\nTerbiasa bekerja dengan deadline.\nDomisili Yogyakarta atau sekitarnya.',
  'Full Time',
  'Yogyakarta',
  3000000,
  3800000,
  ARRAY['Ms. Excel', 'Manajemen Stok', 'Administrasi', 'Input Data'],
  ARRAY['BPJS Ketenagakerjaan', 'Makan Siang', 'Bonus Lembur'],
  'SMA/SMK',
  '1 Tahun',
  '20 - 35 Tahun',
  'open',
  NOW() - INTERVAL '3 days'
),
(
  '80000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0000-000000000002',
  'Sales Counter Galeri Souvenir',
  E'Memberikan informasi produk kerajinan kepada pelanggan domestik dan turis.\nMembantu pelanggan memilih produk sesuai kebutuhan dan budget.\nMencapai target penjualan bulanan.\nMengelola display produk agar selalu menarik.',
  E'Komunikasi yang baik dalam bahasa Indonesia. Bahasa Inggris dasar nilai tambah.\nRamah dan termotivasi mengejar target.\nBerpenampilan rapi.',
  'Full Time',
  'Yogyakarta',
  2900000,
  4500000,
  ARRAY['Sales', 'Customer Service', 'Negosiasi', 'Bahasa Inggris Dasar'],
  ARRAY['Komisi Penjualan', 'BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'THR'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 30 Tahun',
  'open',
  NOW() - INTERVAL '6 days'
),
(
  '80000000-0000-0000-0000-000000000007',
  '30000000-0000-0000-0000-000000000002',
  'Kurir Pengantar Pesanan',
  E'Mengantarkan paket pesanan online ke alamat pelanggan area DIY.\nMemastikan paket sampai dalam kondisi baik dan tepat waktu.\nMembuat laporan pengantaran harian.',
  E'Memiliki SIM C aktif dan kendaraan motor pribadi.\nHafal area Yogyakarta dan sekitarnya.\nJujur, disiplin, dan tepat waktu.',
  'Full Time',
  'Yogyakarta',
  2800000,
  3800000,
  ARRAY['SIM C', 'Navigasi', 'Tepat Waktu', 'Komunikasi Pelanggan'],
  ARRAY['Uang Bensin', 'Insentif Pengiriman', 'BPJS Kesehatan'],
  'SMP/SMA',
  'Fresh Graduate diperbolehkan',
  '20 - 40 Tahun',
  'open',
  NOW() - INTERVAL '4 days'
),
(
  '80000000-0000-0000-0000-000000000008',
  '30000000-0000-0000-0000-000000000002',
  'Pengrajin Kayu (Workshop)',
  E'Membuat produk kerajinan kayu sesuai desain dan pesanan.\nMenjaga kualitas hasil akhir produk.\nBerkolaborasi dengan tim desain untuk eksperimen produk baru.',
  E'Berpengalaman membuat kerajinan kayu minimal 1 tahun.\nMemiliki ketelitian tinggi dan menyukai detail finishing.\nBersedia bekerja di workshop.',
  'Contract',
  'Yogyakarta',
  3500000,
  5200000,
  ARRAY['Pertukangan', 'Desain Produk', 'Finishing Kayu', 'Detail Oriented'],
  ARRAY['Makan Siang', 'Bonus Proyek', 'Pelatihan Gratis'],
  'SMP/SMA',
  '1 Tahun',
  '20 - 45 Tahun',
  'open',
  NOW() - INTERVAL '12 days'
),

-- ------------------------------------------------------------
-- UMKM Segara Retail (Surabaya, Retail)
-- ------------------------------------------------------------
(
  '80000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0000-000000000003',
  'Kasir Shift Sore Cabang Darmo',
  E'Melayani transaksi sore hingga malam (14.00 - 22.00).\nMengelola transaksi tunai dan non-tunai.\nMerekap penjualan harian dan menyetorkan kas ke supervisor.\nMenjaga kerapihan area kasir.',
  E'Pendidikan minimal SMA/SMK.\nRamah, cekatan, dan teliti.\nBersedia bekerja shift sore.\nDomisili Surabaya dan sekitarnya.',
  'Full Time',
  'Surabaya',
  2900000,
  3700000,
  ARRAY['Kasir', 'POS System', 'Customer Service', 'Menghitung Cepat'],
  ARRAY['BPJS Kesehatan', 'Tunjangan Shift Sore', 'Makan Malam'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 30 Tahun',
  'open',
  NOW() - INTERVAL '1 days'
),
(
  '80000000-0000-0000-0000-00000000000a',
  '30000000-0000-0000-0000-000000000003',
  'Staff Display & Penataan Produk',
  E'Menata produk di rak sesuai planogram cabang.\nMemastikan label harga akurat dan bersih.\nMembantu pengelolaan stok dan reorder produk yang habis.\nMenjaga kerapihan area belanja pelanggan.',
  E'Pendidikan minimal SMA/SMK.\nFisik kuat, cekatan, dan terbiasa berdiri lama.\nMemiliki rasa estetika yang baik untuk display.',
  'Full Time',
  'Surabaya',
  2800000,
  3500000,
  ARRAY['Penataan Display', 'Manajemen Stok', 'Operasional Toko', 'Detail'],
  ARRAY['BPJS Kesehatan', 'BPJS Ketenagakerjaan', 'Bonus Bulanan'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 35 Tahun',
  'open',
  NOW() - INTERVAL '8 days'
),
(
  '80000000-0000-0000-0000-00000000000b',
  '30000000-0000-0000-0000-000000000003',
  'Customer Service In-Store',
  E'Melayani pertanyaan dan keluhan pelanggan di toko.\nMembantu pelanggan menemukan produk yang dibutuhkan.\nMencatat dan meneruskan keluhan ke supervisor untuk follow-up.',
  E'Pendidikan minimal SMA/SMK.\nKomunikatif, ramah, dan sabar.\nBersedia bekerja shift.',
  'Full Time',
  'Surabaya',
  3000000,
  4000000,
  ARRAY['Customer Service', 'Komunikasi', 'Problem Solving', 'Pelayanan'],
  ARRAY['BPJS Kesehatan', 'Bonus Servis', 'Makan Siang'],
  'SMA/SMK',
  'Fresh Graduate diperbolehkan',
  '18 - 30 Tahun',
  'open',
  NOW() - INTERVAL '3 days'
),
(
  '80000000-0000-0000-0000-00000000000c',
  '30000000-0000-0000-0000-000000000003',
  'Helper Toko (Part Time)',
  E'Membantu menata produk di rak toko.\nMembantu pelanggan mengangkat barang ke kendaraan.\nMembersihkan area toko secara berkala.',
  E'Sehat jasmani dan kuat fisik.\nRamah dan suka membantu.\nBersedia bekerja shift sore.',
  'Part Time',
  'Surabaya',
  1500000,
  2000000,
  ARRAY['Tanggap', 'Fisik Kuat', 'Service Minded'],
  ARRAY['Makan Sore', 'Bonus Kehadiran'],
  'SMP/SMA',
  'Fresh Graduate diperbolehkan',
  '18 - 30 Tahun',
  'draft',
  NULL
);

-- ============================================================
-- JOB APPLICATIONS (kandidat melamar lowongan)
-- ============================================================
INSERT INTO job_applications (id, job_id, worker_id, cover_letter, status, applied_at)
VALUES
-- Bandung workers (Andi, Budi) -> Bandung jobs (UMKM 1)
(
  '90000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000001',
  'Saya Andi, pernah bekerja sebagai kasir minimarket dan terbiasa shift. Saya tertarik dengan posisi staff operasional toko ini.',
  'submitted',
  NOW() - INTERVAL '1 days'
),
(
  '90000000-0000-0000-0000-000000000002',
  '80000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000001',
  'Saya berpengalaman sebagai kasir dan terbiasa transaksi non-tunai. Mohon dipertimbangkan.',
  'reviewed',
  NOW() - INTERVAL '2 days'
),
(
  '90000000-0000-0000-0000-000000000003',
  '80000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  'Saya tertarik mengembangkan diri sebagai barista. Siap mengikuti pelatihan kopi dari awal.',
  'submitted',
  NOW() - INTERVAL '3 days'
),
(
  '90000000-0000-0000-0000-000000000004',
  '80000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000002',
  'Pengalaman menyusun stok gudang akan saya bawa ke posisi staff operasional ini.',
  'reviewed',
  NOW() - INTERVAL '4 days'
),

-- Yogyakarta workers (Citra, Deni) -> Yogyakarta jobs (UMKM 2)
(
  '90000000-0000-0000-0000-000000000005',
  '80000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000003',
  'Saya Citra, terbiasa input data harian dan laporan. Excel saya cukup baik untuk laporan stok.',
  'accepted',
  NOW() - INTERVAL '5 days'
),
(
  '90000000-0000-0000-0000-000000000006',
  '80000000-0000-0000-0000-000000000006',
  '40000000-0000-0000-0000-000000000003',
  'Saya senang berinteraksi dengan pelanggan dan ingin mencoba bidang sales.',
  'submitted',
  NOW() - INTERVAL '2 days'
),
(
  '90000000-0000-0000-0000-000000000007',
  '80000000-0000-0000-0000-000000000007',
  '40000000-0000-0000-0000-000000000004',
  'Saya pernah jadi kurir internal UMKM, hafal jalan Yogya, punya SIM C aktif.',
  'accepted',
  NOW() - INTERVAL '6 days'
),
(
  '90000000-0000-0000-0000-000000000008',
  '80000000-0000-0000-0000-000000000006',
  '40000000-0000-0000-0000-000000000004',
  'Pengalaman melayani pelanggan saya akan membantu meraih target penjualan.',
  'reviewed',
  NOW() - INTERVAL '1 days'
),

-- Surabaya workers (Eka, Fajar) -> Surabaya jobs (UMKM 3)
(
  '90000000-0000-0000-0000-000000000009',
  '80000000-0000-0000-0000-00000000000a',
  '40000000-0000-0000-0000-000000000005',
  'Saya berpengalaman 2 tahun di toko retail, terbiasa menata display dan mengelola stok.',
  'accepted',
  NOW() - INTERVAL '7 days'
),
(
  '90000000-0000-0000-0000-00000000000a',
  '80000000-0000-0000-0000-00000000000b',
  '40000000-0000-0000-0000-000000000005',
  'Pengalaman saya melayani pelanggan retail siap saya bawa ke posisi customer service.',
  'submitted',
  NOW() - INTERVAL '2 days'
),
(
  '90000000-0000-0000-0000-00000000000b',
  '80000000-0000-0000-0000-000000000009',
  '40000000-0000-0000-0000-000000000006',
  'Saya Fajar, terbiasa menangani transaksi harian. Bersedia shift sore sesuai kebutuhan kafe.',
  'submitted',
  NOW() - INTERVAL '1 days'
),
(
  '90000000-0000-0000-0000-00000000000c',
  '80000000-0000-0000-0000-00000000000b',
  '40000000-0000-0000-0000-000000000006',
  'Pengalaman saya di pelayanan pelanggan akan menjadi nilai tambah untuk posisi ini.',
  'reviewed',
  NOW() - INTERVAL '3 days'
);

-- ============================================================
-- SAVED JOBS (worker bookmark)
-- ============================================================
INSERT INTO saved_jobs (job_id, worker_id, created_at)
VALUES
-- Andi simpan barista & kasir (kepingin coba bidang baru)
('80000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 days'),
('80000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),

-- Budi simpan barista
('80000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days'),

-- Citra simpan kurir & pengrajin (mau eksplor)
('80000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 days'),
('80000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000003', NOW() - INTERVAL '4 days'),

-- Deni simpan admin gudang
('80000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000004', NOW() - INTERVAL '2 days'),

-- Eka simpan kasir shift sore
('80000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000005', NOW() - INTERVAL '1 days'),

-- Fajar simpan staff display
('80000000-0000-0000-0000-00000000000a', '40000000-0000-0000-0000-000000000006', NOW() - INTERVAL '5 days');

COMMIT;
