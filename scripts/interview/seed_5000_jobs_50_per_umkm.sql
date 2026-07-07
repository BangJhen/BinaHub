-- ==============================================================================
-- Interview Seed: 5,000 jobs (50 jobs for each of 100 UMKM)
-- ==============================================================================
-- Purpose:
--   Prepare large-enough transactional data for interview demos:
--   100 UMKM x 50 jobs = 5,000 rows in public.jobs.
--
-- Important:
--   This script resets job-related transactional rows first so final total jobs
--   is exactly 5,000. It keeps users, UMKM profiles, and worker profiles intact.
--
-- Idempotency:
--   Safe to re-run. It deletes prior job-related rows and rebuilds exactly 5,000.
-- ==============================================================================

BEGIN;

-- Reset job-related transactional data from child tables to parent tables.
DELETE FROM public.alerts;
DELETE FROM public.risk_assessments;
DELETE FROM public.checkins;
DELETE FROM public.saved_jobs;
DELETE FROM public.job_applications;
DELETE FROM public.placements;
DELETE FROM public.jobs;

WITH umkms AS (
  SELECT
    u.id AS umkm_id,
    row_number() OVER (ORDER BY u.created_at, u.id) AS umkm_no,
    COALESCE(up.business_name, u.full_name, 'UMKM') AS business_name,
    COALESCE(up.business_sector, 'Operasional') AS business_sector,
    COALESCE(up.city, 'Bandung') AS city,
    COALESCE(up.province, 'Jawa Barat') AS province
  FROM public.users u
  LEFT JOIN public.umkm_profiles up ON up.user_id = u.id
  WHERE u.role = 'umkm'
  ORDER BY u.created_at, u.id
  LIMIT 100
), job_numbers AS (
  SELECT generate_series(1, 50) AS job_no
), templates AS (
  SELECT * FROM (VALUES
    (0, 'Kasir Operasional', 'Kasir, Customer Service, POS System', 'SMA/SMK', 'full_time', 'Melayani transaksi pelanggan, menjaga kas, dan membuat laporan penjualan harian.'),
    (1, 'Staf Gudang', 'Gudang, Packing, Manajemen Stok', 'SMA/SMK', 'contract', 'Menerima barang, melakukan packing, mencatat stok, dan menjaga kerapian gudang.'),
    (2, 'Admin Data Excel', 'Administrasi, Input Data, Excel', 'SMA/SMK', 'part_time', 'Menginput data operasional, merapikan dokumen, dan membantu laporan sederhana.'),
    (3, 'Kurir Area Kota', 'Kurir, SIM C, Navigasi', 'SMA', 'full_time', 'Mengirim barang ke pelanggan, mencatat bukti pengiriman, dan menjaga komunikasi.'),
    (4, 'Helper Produksi', 'Produksi, Kebersihan, Quality Control', 'SMP', 'contract', 'Membantu proses produksi, menjaga kebersihan area kerja, dan melakukan pengecekan awal.'),
    (5, 'Operator Konveksi', 'Konveksi, Menjahit, Finishing', 'SMA/SMK', 'full_time', 'Mengerjakan jahit dasar, finishing produk, dan kontrol kualitas sederhana.'),
    (6, 'Asisten Dapur', 'Dapur, Food Prep, Kebersihan', 'SMP', 'shift', 'Membantu persiapan bahan makanan, kebersihan dapur, dan packing pesanan.'),
    (7, 'Pramuniaga Toko', 'Operasional Toko, Display Produk, Pelayanan Pelanggan', 'SMA/SMK', 'full_time', 'Merapikan display produk, membantu pelanggan, dan mencatat kebutuhan stok.'),
    (8, 'Customer Service Online', 'Customer Service, Marketplace, Komunikasi', 'SMA/SMK', 'full_time', 'Membalas chat pelanggan marketplace dan membantu penyelesaian komplain.'),
    (9, 'Staff Kebersihan', 'Kebersihan, Operasional, Disiplin', 'SMP', 'part_time', 'Menjaga kebersihan area kerja dan mendukung operasional harian usaha.')
  ) AS t(idx, title, skills, education_level, employment_type, description)
)
INSERT INTO public.jobs (
  umkm_id,
  title,
  description,
  requirements,
  employment_type,
  location,
  salary_min,
  salary_max,
  status,
  published_at,
  skills,
  benefits,
  education_level,
  experience_required,
  age_range
)
SELECT
  u.umkm_id,
  t.title || ' #' || lpad(j.job_no::text, 2, '0') || ' - ' || u.business_name,
  t.description || ' Lowongan ini dibuat sebagai seed data interview untuk menguji volume, filtering, dan query performa.',
  'Memiliki komitmen kerja, disiplin, dapat mengikuti SOP, dan bersedia mengikuti onboarding singkat.',
  t.employment_type,
  u.city || ', ' || u.province,
  salary.salary_min,
  salary.salary_min + (700000 + ((u.umkm_no + j.job_no) % 5) * 200000)::numeric,
  'open'::job_status,
  now() - ((u.umkm_no + j.job_no) || ' hours')::interval,
  regexp_split_to_array(t.skills, ',\s*')::text[],
  ARRAY[
    'Onboarding singkat',
    CASE WHEN j.job_no % 2 = 0 THEN 'Makan siang' ELSE 'Transport allowance' END,
    CASE WHEN j.job_no % 3 = 0 THEN 'Bonus performa' ELSE 'Jadwal terstruktur' END
  ]::text[],
  t.education_level,
  CASE
    WHEN j.job_no % 4 = 0 THEN '1-2 tahun'
    WHEN j.job_no % 4 = 1 THEN 'fresh graduate'
    WHEN j.job_no % 4 = 2 THEN '0-1 tahun'
    ELSE 'tidak wajib'
  END,
  CASE
    WHEN j.job_no % 3 = 0 THEN '18-35'
    WHEN j.job_no % 3 = 1 THEN '20-40'
    ELSE '22-45'
  END
FROM umkms u
CROSS JOIN job_numbers j
JOIN templates t ON t.idx = ((u.umkm_no + j.job_no) % 10)
CROSS JOIN LATERAL (
  SELECT (1800000 + ((u.umkm_no + j.job_no + t.idx) % 8) * 250000)::numeric AS salary_min
) salary;

COMMIT;

-- Verification:
-- SELECT count(*) AS total_jobs FROM public.jobs;
-- SELECT min(job_count), max(job_count), count(*) AS umkm_count
-- FROM (SELECT umkm_id, count(*) AS job_count FROM public.jobs GROUP BY umkm_id) x;
