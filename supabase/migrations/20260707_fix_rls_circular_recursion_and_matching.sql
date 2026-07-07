-- ==============================================================================
-- Migration: Fix RLS Circular Recursion + Matching Access
-- ==============================================================================
-- Masalah:
--   1. jobs SELECT policy nge-query job_applications
--      dan job_applications SELECT policy nge-query jobs balik
--      → infinite recursion ("infinite recursion detected in policy")
--   2. placements INSERT policy juga nge-query jobs → kena efek yang sama
--   3. worker_profiles SELECT cuma allow UMKM lewat placements → matching
--      nggak bisa lihat worker aktif yg belum di-hire
--   4. users SELECT juga cuma allow lewat placements → matching nggak bisa
--      lihat nama worker
--
-- Solusi: Helper functions SECURITY DEFINER (bypass RLS) untuk cross-table
-- checks, + tambah aturan khusus untuk halaman matching.
-- ==============================================================================

-- ==============================================================================
-- 1. HELPER FUNCTIONS (SECURITY DEFINER — bypass RLS)
-- ==============================================================================

-- Cek apakah current user adalah pemilik lowongan (UMKM yang buat job)
CREATE OR REPLACE FUNCTION public.is_umkm_job_owner(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.jobs
    WHERE id = p_job_id AND umkm_id = auth.uid()
  );
$$;

-- Cek apakah current user adalah pelamar lowongan (worker yang apply)
CREATE OR REPLACE FUNCTION public.is_applicant_for_job(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_applications
    WHERE job_id = p_job_id AND worker_id = auth.uid()
  );
$$;

-- Cek apakah current user punya role UMKM
CREATE OR REPLACE FUNCTION public.is_umkm()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'umkm'
  );
$$;

-- Revoke EXECUTE dari PUBLIC (hanya owner / superuser yang bisa panggil)
REVOKE EXECUTE ON FUNCTION public.is_umkm_job_owner(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_applicant_for_job(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_umkm() FROM PUBLIC;

-- ==============================================================================
-- 2. FIX CIRCULAR DEPENDENCY: jobs ↔ job_applications
-- ==============================================================================

-- Drop policies yang referencing satu sama lain secara langsung
DROP POLICY IF EXISTS "job_applications_select" ON public.job_applications;
DROP POLICY IF EXISTS "job_applications_update" ON public.job_applications;
DROP POLICY IF EXISTS "jobs_select" ON public.jobs;
DROP POLICY IF EXISTS "placements_insert" ON public.placements;

-- Re-create pake helper functions yang bypass RLS

-- job_applications: Worker bisa lihat aplikasi sendiri.
-- UMKM (pemilik job) bisa lihat aplikasi ke job mereka — pakai helper.
CREATE POLICY "job_applications_select" ON public.job_applications
  FOR SELECT
  TO public
  USING (
    worker_id = auth.uid()
    OR is_admin()
    OR is_umkm_job_owner(job_id)
  );

-- job_applications: Worker bisa update aplikasi sendiri.
-- UMKM (pemilik job) bisa update aplikasi ke job mereka — pakai helper.
CREATE POLICY "job_applications_update" ON public.job_applications
  FOR UPDATE
  TO public
  USING (
    worker_id = auth.uid()
    OR is_umkm_job_owner(job_id)
  );

-- jobs: UMKM lihat job sendiri, admin lihat semua, public lihat yg open,
-- worker lihat job yg mereka apply/place — pakai helper.
CREATE POLICY "jobs_select" ON public.jobs
  FOR SELECT
  TO public
  USING (
    umkm_id = auth.uid()
    OR is_admin()
    OR status = 'open'::job_status
    OR EXISTS (
      SELECT 1 FROM public.placements
      WHERE placements.job_id = jobs.id AND placements.worker_id = auth.uid()
    )
    OR is_applicant_for_job(id)
  );

-- placements: UMKM bisa insert placement cuma untuk job mereka sendiri
CREATE POLICY "placements_insert" ON public.placements
  FOR INSERT
  TO public
  WITH CHECK (
    is_umkm_job_owner(job_id)
  );


-- ==============================================================================
-- 3. FIX MATCHING ACCESS: UMKM bisa lihat semua active worker di matching
-- ==============================================================================

-- Drop & recreate worker_profiles SELECT policy untuk UMKM bisa lihat
-- semua worker aktif (dibutuhkan halaman matching)
DROP POLICY IF EXISTS "worker_profiles_select" ON public.worker_profiles;

CREATE POLICY "worker_profiles_select" ON public.worker_profiles
  FOR SELECT
  TO public
  USING (
    user_id = auth.uid()                           -- worker lihat profil sendiri
    OR is_admin()                                  -- admin lihat semua
    OR is_umkm()                                   -- UMKM lihat semua worker
    OR EXISTS (
      SELECT 1 FROM public.placements
      WHERE placements.worker_id = worker_profiles.user_id
        AND placements.umkm_id = auth.uid()
    )
  );

-- Drop & recreate users SELECT policy untuk UMKM bisa lihat
-- data dasar worker (nama, dibutuhkan halaman matching)
DROP POLICY IF EXISTS "users_select" ON public.users;

CREATE POLICY "users_select" ON public.users
  FOR SELECT
  TO public
  USING (
    id = auth.uid()                                -- lihat data sendiri
    OR is_admin()                                  -- admin lihat semua
    OR (
      is_umkm()                                    -- UMKM bisa lihat...
      AND EXISTS (
        SELECT 1 FROM public.worker_profiles       -- ...user yg punya worker_profiles
        WHERE worker_profiles.user_id = users.id
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.placements
      WHERE (
        placements.worker_id = users.id
        OR placements.umkm_id = users.id
      ) AND (
        placements.umkm_id = auth.uid()
        OR placements.worker_id = auth.uid()
      )
    )
  );


-- ==============================================================================
-- 4. RIAS — REVOKE PUBLIC EXECUTE juga dari helper-function yg lama
--    (beberapa mungkin masih bisa dipanggil oleh anon/authenticated)
-- ==============================================================================
-- handle_new_user() udah di-revoke di migration revoke_public_trigger_functions
-- Tapi kita pastikan nggak ada function lain yang lolos
REVOKE EXECUTE ON FUNCTION public.is_umkm() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_umkm_job_owner(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_applicant_for_job(UUID) FROM PUBLIC;
