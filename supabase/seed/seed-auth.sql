-- ============================================================
-- SUPABASE AUTH USERS SEED
-- ============================================================
-- Jalankan di Supabase SQL Editor
-- PENTING: Gunakan service role key, bukan anon key
-- 
-- Script ini membuat auth users yang match dengan users table
-- Password: demo-password-123 (untuk semua akun)
-- ============================================================

BEGIN;

-- Cleanup existing auth users (optional, uncomment jika perlu reset)
-- DELETE FROM auth.users WHERE email LIKE '%@binahub.id';

-- ============================================================
-- UMKM USERS
-- ============================================================
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    'umkm.surya@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'umkm',
      'name', 'UMKM Surya Pangan',
      'businessName', 'UMKM Surya Pangan'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    'umkm.kriya@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'umkm',
      'name', 'UMKM Kriya Nusantara',
      'businessName', 'UMKM Kriya Nusantara'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    'umkm.segara@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'umkm',
      'name', 'UMKM Segara Retail',
      'businessName', 'UMKM Segara Retail'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );

-- ============================================================
-- WORKER USERS
-- ============================================================
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'worker.andi@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'worker',
      'name', 'Andi Pratama'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'worker.budi@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'worker',
      'name', 'Budi Santoso'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'worker.citra@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'worker',
      'name', 'Citra Lestari'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'worker.deni@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'worker',
      'name', 'Deni Saputra'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    'worker.eka@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'worker',
      'name', 'Eka Wulandari'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  ),
  (
    '40000000-0000-0000-0000-000000000006',
    'worker.fajar@binahub.id',
    crypt('demo-password-123', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'role', 'worker',
      'name', 'Fajar Maulana'
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );

-- ============================================================
-- UPDATE users TABLE (sync dengan auth)
-- ============================================================
UPDATE users 
SET password_hash = 'managed-by-supabase-auth'
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

COMMIT;
