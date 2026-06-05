BEGIN;

-- Dashboard-focused dummy dataset (idempotent):
-- - 3 UMKM
-- - 6 workers
-- - active placements, checkins, risk assessments, alerts

-- ------------------------------------------------------------
-- 1) Cleanup previous dashboard seed data
-- ------------------------------------------------------------
DELETE FROM alerts
WHERE umkm_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003'
)
OR worker_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM risk_assessments
WHERE worker_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM checkins
WHERE worker_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM placements
WHERE id IN (
  '70000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000002',
  '70000000-0000-0000-0000-000000000003',
  '70000000-0000-0000-0000-000000000004',
  '70000000-0000-0000-0000-000000000005',
  '70000000-0000-0000-0000-000000000006'
)
OR umkm_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003'
)
OR worker_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM job_applications
WHERE id IN (
  '60000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000002',
  '60000000-0000-0000-0000-000000000003',
  '60000000-0000-0000-0000-000000000004',
  '60000000-0000-0000-0000-000000000005',
  '60000000-0000-0000-0000-000000000006'
)
OR job_id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003'
)
OR worker_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM jobs
WHERE id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003'
)
OR umkm_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003'
);

DELETE FROM worker_profiles
WHERE user_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

DELETE FROM umkm_profiles
WHERE user_id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003'
);

DELETE FROM users
WHERE id IN (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

-- ------------------------------------------------------------
-- 2) Base users (UMKM + workers)
-- ------------------------------------------------------------
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_verified, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'umkm.surya@binahub.id', 'demo-hash-umkm', 'UMKM Surya Pangan', '081200000101', 'umkm', TRUE, NOW() - INTERVAL '120 days', NOW()),
  ('30000000-0000-0000-0000-000000000002', 'umkm.kriya@binahub.id', 'demo-hash-umkm', 'UMKM Kriya Nusantara', '081200000102', 'umkm', TRUE, NOW() - INTERVAL '110 days', NOW()),
  ('30000000-0000-0000-0000-000000000003', 'umkm.segara@binahub.id', 'demo-hash-umkm', 'UMKM Segara Retail', '081200000103', 'umkm', TRUE, NOW() - INTERVAL '100 days', NOW()),
  ('40000000-0000-0000-0000-000000000001', 'worker.andi@binahub.id', 'demo-hash-worker', 'Andi Pratama', '081300000201', 'worker', TRUE, NOW() - INTERVAL '95 days', NOW()),
  ('40000000-0000-0000-0000-000000000002', 'worker.budi@binahub.id', 'demo-hash-worker', 'Budi Santoso', '081300000202', 'worker', TRUE, NOW() - INTERVAL '90 days', NOW()),
  ('40000000-0000-0000-0000-000000000003', 'worker.citra@binahub.id', 'demo-hash-worker', 'Citra Lestari', '081300000203', 'worker', TRUE, NOW() - INTERVAL '85 days', NOW()),
  ('40000000-0000-0000-0000-000000000004', 'worker.deni@binahub.id', 'demo-hash-worker', 'Deni Saputra', '081300000204', 'worker', TRUE, NOW() - INTERVAL '80 days', NOW()),
  ('40000000-0000-0000-0000-000000000005', 'worker.eka@binahub.id', 'demo-hash-worker', 'Eka Wulandari', '081300000205', 'worker', TRUE, NOW() - INTERVAL '75 days', NOW()),
  ('40000000-0000-0000-0000-000000000006', 'worker.fajar@binahub.id', 'demo-hash-worker', 'Fajar Maulana', '081300000206', 'worker', TRUE, NOW() - INTERVAL '70 days', NOW());

INSERT INTO umkm_profiles (user_id, business_name, business_sector, city, province, business_address, company_description, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', 'UMKM Surya Pangan', 'Kuliner', 'Bandung', 'Jawa Barat', 'Jl. Cibaduyut No. 12, Bandung', 'Usaha kuliner rumahan dengan 3 outlet aktif.', NOW() - INTERVAL '120 days', NOW()),
  ('30000000-0000-0000-0000-000000000002', 'UMKM Kriya Nusantara', 'Kerajinan', 'Yogyakarta', 'DI Yogyakarta', 'Jl. Malioboro No. 23, Yogyakarta', 'Kerajinan tangan dan souvenir untuk pasar lokal.', NOW() - INTERVAL '110 days', NOW()),
  ('30000000-0000-0000-0000-000000000003', 'UMKM Segara Retail', 'Retail', 'Surabaya', 'Jawa Timur', 'Jl. Darmo No. 44, Surabaya', 'Retail kebutuhan harian dengan fokus pelayanan cepat.', NOW() - INTERVAL '100 days', NOW());

INSERT INTO worker_profiles (user_id, birth_date, city, province, skills, education_level, rehabilitation_program, experience_summary, status, created_at, updated_at)
VALUES
  ('40000000-0000-0000-0000-000000000001', '1997-02-10', 'Bandung', 'Jawa Barat', 'Kasir, Operasional Toko', 'SMA', 'Pelatihan Kemandirian Kerja', 'Pernah bekerja sebagai kasir minimarket.', 'active', NOW() - INTERVAL '95 days', NOW()),
  ('40000000-0000-0000-0000-000000000002', '1996-09-05', 'Bandung', 'Jawa Barat', 'Gudang, Stok Barang', 'SMA', 'Program Pembinaan Kerja', 'Berpengalaman di penyusunan stok gudang.', 'active', NOW() - INTERVAL '90 days', NOW()),
  ('40000000-0000-0000-0000-000000000003', '1999-06-16', 'Yogyakarta', 'DI Yogyakarta', 'Admin, Input Data', 'SMK', 'Pelatihan Administrasi Dasar', 'Terbiasa input data harian dan laporan sederhana.', 'active', NOW() - INTERVAL '85 days', NOW()),
  ('40000000-0000-0000-0000-000000000004', '1998-11-21', 'Yogyakarta', 'DI Yogyakarta', 'Kurir, Komunikasi Pelanggan', 'SMA', 'Pelatihan Layanan Pelanggan', 'Pernah menjadi kurir internal UMKM.', 'active', NOW() - INTERVAL '80 days', NOW()),
  ('40000000-0000-0000-0000-000000000005', '1995-04-08', 'Surabaya', 'Jawa Timur', 'Operasional, Penataan Display', 'SMA', 'Program Adaptasi Dunia Kerja', 'Memiliki pengalaman 2 tahun di toko retail.', 'active', NOW() - INTERVAL '75 days', NOW()),
  ('40000000-0000-0000-0000-000000000006', '2000-01-29', 'Surabaya', 'Jawa Timur', 'Kasir, Pelayanan', 'SMK', 'Pelatihan Etos Kerja', 'Terbiasa menangani transaksi harian dan pelanggan.', 'active', NOW() - INTERVAL '70 days', NOW());

-- ------------------------------------------------------------
-- 3) Jobs, applications, placements
-- ------------------------------------------------------------
INSERT INTO jobs (
  id, umkm_id, title, description, requirements, employment_type, location,
  salary_min, salary_max, status, published_at, created_at, updated_at
)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'Staff Operasional Toko',
    'Menangani operasional harian toko dan pelayanan pelanggan.',
    'Disiplin, komunikatif, siap kerja shift.',
    'full-time',
    'Bandung',
    2800000,
    3600000,
    'open',
    NOW() - INTERVAL '45 days',
    NOW() - INTERVAL '50 days',
    NOW()
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000002',
    'Admin Gudang',
    'Mengelola stok barang dan administrasi gudang.',
    'Teliti, mampu bekerja dengan target.',
    'full-time',
    'Yogyakarta',
    3000000,
    3800000,
    'open',
    NOW() - INTERVAL '42 days',
    NOW() - INTERVAL '48 days',
    NOW()
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000003',
    'Kasir Shift Sore',
    'Melayani transaksi sore hingga malam dan rekap harian.',
    'Ramah, cekatan, dan teliti.',
    'full-time',
    'Surabaya',
    2900000,
    3700000,
    'open',
    NOW() - INTERVAL '40 days',
    NOW() - INTERVAL '45 days',
    NOW()
  );

INSERT INTO job_applications (id, job_id, worker_id, cover_letter, status, applied_at, updated_at)
VALUES
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Siap bekerja dan belajar konsisten.', 'accepted', NOW() - INTERVAL '44 days', NOW()),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'Berpengalaman di operasional harian.', 'accepted', NOW() - INTERVAL '43 days', NOW()),
  ('60000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', 'Fokus pada ketelitian administrasi.', 'accepted', NOW() - INTERVAL '41 days', NOW()),
  ('60000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', 'Siap memenuhi target kerja tim.', 'accepted', NOW() - INTERVAL '39 days', NOW()),
  ('60000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', 'Siap bekerja shift sore dengan konsisten.', 'accepted', NOW() - INTERVAL '37 days', NOW()),
  ('60000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', 'Memiliki pengalaman pelayanan pelanggan.', 'accepted', NOW() - INTERVAL '36 days', NOW());

INSERT INTO placements (id, job_id, worker_id, umkm_id, application_id, start_date, status, notes, created_at, updated_at)
VALUES
  ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', CURRENT_DATE - 42, 'active', 'Adaptasi cepat dan responsif.', NOW() - INTERVAL '42 days', NOW()),
  ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000002', CURRENT_DATE - 40, 'active', 'Perlu monitoring ritme kerja.', NOW() - INTERVAL '40 days', NOW()),
  ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000003', CURRENT_DATE - 38, 'active', 'Stabil dan cukup konsisten.', NOW() - INTERVAL '38 days', NOW()),
  ('70000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000004', CURRENT_DATE - 35, 'active', 'Butuh pendampingan komunikasi tim.', NOW() - INTERVAL '35 days', NOW()),
  ('70000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000005', CURRENT_DATE - 33, 'active', 'Kinerja cenderung meningkat.', NOW() - INTERVAL '33 days', NOW()),
  ('70000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000006', CURRENT_DATE - 30, 'active', 'Perlu menjaga konsistensi check-in.', NOW() - INTERVAL '30 days', NOW());

-- ------------------------------------------------------------
-- 4) Checkins (45 hari terakhir, sengaja ada hari bolong)
-- ------------------------------------------------------------
INSERT INTO checkins (id, worker_id, placement_id, channel, content, sentiment_score, submitted_at)
SELECT
  gen_random_uuid(),
  p.worker_id,
  p.id,
  CASE WHEN (gs.day_offset % 5 = 0) THEN 'voice'::checkin_channel ELSE 'text'::checkin_channel END,
  CASE
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000001' THEN 'Hari ini fokus, pekerjaan selesai tepat waktu.'
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000002' THEN 'Pekerjaan berjalan, masih perlu adaptasi ritme.'
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000003' THEN 'Cukup stabil, ada sedikit hambatan administrasi.'
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000004' THEN 'Merasa tertekan oleh target hari ini.'
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000005' THEN 'Semangat kerja baik, komunikasi tim lancar.'
    ELSE 'Kondisi campuran, perlu evaluasi konsistensi.'
  END,
  CASE
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000001' THEN 0.52 - ((gs.day_offset % 6) * 0.05)
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000002' THEN 0.18 - ((gs.day_offset % 5) * 0.07)
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000003' THEN 0.26 - ((gs.day_offset % 8) * 0.06)
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000004' THEN -0.08 - ((gs.day_offset % 6) * 0.07)
    WHEN p.worker_id = '40000000-0000-0000-0000-000000000005' THEN 0.40 - ((gs.day_offset % 7) * 0.05)
    ELSE 0.14 - ((gs.day_offset % 7) * 0.08)
  END,
  NOW() - (gs.day_offset || ' days')::interval + INTERVAL '08 hours'
FROM placements p
CROSS JOIN LATERAL generate_series(0, 44) AS gs(day_offset)
WHERE p.id IN (
  '70000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000002',
  '70000000-0000-0000-0000-000000000003',
  '70000000-0000-0000-0000-000000000004',
  '70000000-0000-0000-0000-000000000005',
  '70000000-0000-0000-0000-000000000006'
)
AND (gs.day_offset % 7) <> 6;

-- ------------------------------------------------------------
-- 5) Risk assessments (turunan dari sentiment)
-- ------------------------------------------------------------
INSERT INTO risk_assessments (
  id, worker_id, placement_id, checkin_id, risk_level, risk_score,
  trigger_reason, recommendation, model_name, assessed_at
)
SELECT
  gen_random_uuid(),
  c.worker_id,
  c.placement_id,
  c.id,
  CASE
    WHEN c.sentiment_score <= -0.20 THEN 'red'::risk_level
    WHEN c.sentiment_score >= 0.25 THEN 'green'::risk_level
    ELSE 'yellow'::risk_level
  END,
  CASE
    WHEN c.sentiment_score <= -0.20 THEN 82
    WHEN c.sentiment_score >= 0.25 THEN 24
    ELSE 56
  END,
  CASE
    WHEN c.sentiment_score <= -0.20 THEN 'Indikasi tekanan psikologis tinggi dan kelelahan kerja.'
    WHEN c.sentiment_score >= 0.25 THEN 'Kondisi stabil dan emosi cenderung positif.'
    ELSE 'Perlu pemantauan berkala karena kondisi fluktuatif.'
  END,
  CASE
    WHEN c.sentiment_score <= -0.20 THEN 'Jadwalkan mentoring intensif 2x minggu ini dan evaluasi beban tugas.'
    WHEN c.sentiment_score >= 0.25 THEN 'Pertahankan rutinitas dan beri target peningkatan bertahap.'
    ELSE 'Lakukan coaching singkat dan monitoring 3 hari ke depan.'
  END,
  'seed-rule-v1',
  c.submitted_at + INTERVAL '10 minutes'
FROM checkins c
WHERE c.worker_id IN (
  '40000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000003',
  '40000000-0000-0000-0000-000000000004',
  '40000000-0000-0000-0000-000000000005',
  '40000000-0000-0000-0000-000000000006'
);

-- ------------------------------------------------------------
-- 6) Alerts (ambil risiko non-green terbaru per worker)
-- ------------------------------------------------------------
WITH latest_non_green AS (
  SELECT
    r.id AS risk_assessment_id,
    r.worker_id,
    r.placement_id,
    r.risk_level,
    r.recommendation,
    r.assessed_at,
    p.umkm_id,
    u.full_name,
    ROW_NUMBER() OVER (PARTITION BY r.worker_id ORDER BY r.assessed_at DESC) AS rn
  FROM risk_assessments r
  JOIN placements p ON p.id = r.placement_id
  JOIN users u ON u.id = r.worker_id
  WHERE r.worker_id IN (
    '40000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000004',
    '40000000-0000-0000-0000-000000000005',
    '40000000-0000-0000-0000-000000000006'
  )
  AND r.risk_level <> 'green'
)
INSERT INTO alerts (
  id, umkm_id, worker_id, placement_id, risk_assessment_id,
  title, message, status, created_at, read_at, resolved_at
)
SELECT
  gen_random_uuid(),
  lng.umkm_id,
  lng.worker_id,
  lng.placement_id,
  lng.risk_assessment_id,
  CASE
    WHEN lng.risk_level = 'red' THEN 'Peringatan Risiko Tinggi'
    ELSE 'Peringatan Risiko Menengah'
  END,
  lng.full_name || ': ' || COALESCE(lng.recommendation, 'Perlu monitoring tambahan.'),
  CASE
    WHEN lng.risk_level = 'red' THEN 'unread'::alert_status
    ELSE 'read'::alert_status
  END,
  lng.assessed_at + INTERVAL '5 minutes',
  CASE
    WHEN lng.risk_level = 'red' THEN NULL
    ELSE lng.assessed_at + INTERVAL '2 hours'
  END,
  NULL
FROM latest_non_green lng
WHERE lng.rn = 1;

COMMIT;
