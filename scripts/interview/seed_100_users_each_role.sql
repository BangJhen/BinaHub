-- ==============================================================================
-- Interview Seed: Top-up users until 100 UMKM + 100 Worker
-- ==============================================================================
-- Purpose:
--   Prepare enough profile data for interview demos and later job generation.
--
-- Important:
--   This inserts into public.users + public.umkm_profiles/public.worker_profiles.
--   These seed accounts are intended for relational demo data, not Supabase Auth
--   login accounts. Real login-capable users must be created through Supabase Auth.
--
-- Idempotency:
--   Safe to re-run. If role count is already >= 100, it inserts 0 for that role.
-- ==============================================================================

BEGIN;

WITH current_umkm AS (
  SELECT count(*)::int AS c FROM public.users WHERE role = 'umkm'
), inserted_umkm AS (
  INSERT INTO public.users (email, password_hash, full_name, phone, role, is_verified)
  SELECT
    'seed.umkm.' || lpad((current_umkm.c + gs)::text, 3, '0') || '@binahub.test' AS email,
    'seeded-no-auth' AS password_hash,
    'Pemilik UMKM Seed ' || lpad((current_umkm.c + gs)::text, 3, '0') AS full_name,
    '+62812' || lpad((70000000 + current_umkm.c + gs)::text, 8, '0') AS phone,
    'umkm'::user_role AS role,
    true AS is_verified
  FROM current_umkm
  CROSS JOIN generate_series(1, greatest(0, 100 - current_umkm.c)) AS gs
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email, full_name, phone
)
INSERT INTO public.umkm_profiles (
  user_id,
  business_name,
  business_sector,
  city,
  province,
  business_address,
  company_description,
  owner_name,
  phone,
  website,
  established_year,
  business_license,
  profile_completed,
  profile_completed_at
)
SELECT
  id,
  'UMKM Seed ' || regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1'),
  CASE (regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1')::int % 6)
    WHEN 0 THEN 'Kuliner'
    WHEN 1 THEN 'Retail'
    WHEN 2 THEN 'Konveksi'
    WHEN 3 THEN 'Logistik'
    WHEN 4 THEN 'Jasa Kebersihan'
    ELSE 'Manufaktur Ringan'
  END,
  CASE (regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1')::int % 8)
    WHEN 0 THEN 'Bandung'
    WHEN 1 THEN 'Jakarta'
    WHEN 2 THEN 'Depok'
    WHEN 3 THEN 'Bekasi'
    WHEN 4 THEN 'Bogor'
    WHEN 5 THEN 'Surabaya'
    WHEN 6 THEN 'Yogyakarta'
    ELSE 'Semarang'
  END,
  CASE (regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1')::int % 4)
    WHEN 0 THEN 'Jawa Barat'
    WHEN 1 THEN 'DKI Jakarta'
    WHEN 2 THEN 'Jawa Timur'
    ELSE 'Jawa Tengah'
  END,
  'Jl. Seed UMKM No. ' || regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1'),
  'Profil UMKM seed untuk demo interview: data bisnis sederhana yang siap menerima lowongan dan lamaran.',
  full_name,
  phone,
  'https://umkm-seed-' || regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1') || '.example.test',
  2015 + (regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1')::int % 10),
  'NIB-SEED-' || regexp_replace(email, '^seed\.umkm\.([0-9]+)@.*$', '\1'),
  true,
  now()
FROM inserted_umkm
ON CONFLICT (user_id) DO NOTHING;


WITH current_worker AS (
  SELECT count(*)::int AS c FROM public.users WHERE role = 'worker'
), inserted_worker AS (
  INSERT INTO public.users (email, password_hash, full_name, phone, role, is_verified)
  SELECT
    'seed.worker.' || lpad((current_worker.c + gs)::text, 3, '0') || '@binahub.test' AS email,
    'seeded-no-auth' AS password_hash,
    'Worker Seed ' || lpad((current_worker.c + gs)::text, 3, '0') AS full_name,
    '+62813' || lpad((80000000 + current_worker.c + gs)::text, 8, '0') AS phone,
    'worker'::user_role AS role,
    true AS is_verified
  FROM current_worker
  CROSS JOIN generate_series(1, greatest(0, 100 - current_worker.c)) AS gs
  ON CONFLICT (email) DO NOTHING
  RETURNING id, email, full_name, phone
)
INSERT INTO public.worker_profiles (
  user_id,
  full_name,
  gender,
  nik,
  phone,
  birth_date,
  city,
  province,
  address,
  age,
  skills,
  education_level,
  rehabilitation_program,
  experience_summary,
  status,
  crime_type,
  sentence_years,
  release_date,
  lapas_name,
  rehabilitation_status,
  profile_completed,
  profile_completed_at
)
SELECT
  id,
  full_name,
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 2)
    WHEN 0 THEN 'Laki-laki'
    ELSE 'Perempuan'
  END,
  '3273' || lpad(regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1'), 12, '0'),
  phone,
  make_date(1984 + (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 20), 1 + (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 12), 1 + (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 27)),
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 8)
    WHEN 0 THEN 'Bandung'
    WHEN 1 THEN 'Jakarta'
    WHEN 2 THEN 'Depok'
    WHEN 3 THEN 'Bekasi'
    WHEN 4 THEN 'Bogor'
    WHEN 5 THEN 'Surabaya'
    WHEN 6 THEN 'Yogyakarta'
    ELSE 'Semarang'
  END,
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 4)
    WHEN 0 THEN 'Jawa Barat'
    WHEN 1 THEN 'DKI Jakarta'
    WHEN 2 THEN 'Jawa Timur'
    ELSE 'Jawa Tengah'
  END,
  'Jl. Seed Worker No. ' || regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1'),
  22 + (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 18),
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 8)
    WHEN 0 THEN 'Kasir, Customer Service, POS System'
    WHEN 1 THEN 'Gudang, Packing, Manajemen Stok'
    WHEN 2 THEN 'Administrasi, Input Data, Excel'
    WHEN 3 THEN 'Kurir, SIM C, Navigasi'
    WHEN 4 THEN 'Produksi, Kebersihan, Quality Control'
    WHEN 5 THEN 'Konveksi, Menjahit, Finishing'
    WHEN 6 THEN 'Dapur, Food Prep, Kebersihan'
    ELSE 'Operasional Toko, Display Produk, Pelayanan Pelanggan'
  END,
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 4)
    WHEN 0 THEN 'SMP'
    WHEN 1 THEN 'SMA/SMK'
    WHEN 2 THEN 'SMA/SMK/Sederajat'
    ELSE 'Diploma'
  END,
  'Program reintegrasi dan pelatihan kerja dasar.',
  'Worker seed dengan pengalaman operasional dasar untuk demo matching lowongan dan pipeline data.',
  'active'::worker_status,
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 5)
    WHEN 0 THEN 'Pelanggaran ringan'
    WHEN 1 THEN 'Ekonomi'
    WHEN 2 THEN 'Lalu lintas'
    WHEN 3 THEN 'Administratif'
    ELSE 'Tidak disebutkan'
  END,
  1 + (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 4),
  current_date - ((30 + regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int) || ' days')::interval,
  'Lapas Seed ' || (1 + (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 5)),
  CASE (regexp_replace(email, '^seed\.worker\.([0-9]+)@.*$', '\1')::int % 3)
    WHEN 0 THEN 'completed'
    WHEN 1 THEN 'certified'
    ELSE 'ongoing'
  END,
  true,
  now()
FROM inserted_worker
ON CONFLICT (user_id) DO NOTHING;

COMMIT;

-- Verification query:
-- SELECT role, count(*) FROM public.users GROUP BY role ORDER BY role;
-- SELECT 'umkm_profiles', count(*) FROM public.umkm_profiles
-- UNION ALL SELECT 'worker_profiles', count(*) FROM public.worker_profiles;
