-- ==============================================================================
-- Migration: Grant EXECUTE on SECURITY DEFINER helpers to anon + authenticated
-- ==============================================================================
-- RLS policies dievaluasi oleh PostgreSQL menggunakan PERAN user yg login.
-- Jadi meskipun fungsi2 ini SECURITY DEFINER, user tetap butuh EXECUTE
-- privilege untuk bisa memanggilnya — karena RLS policy running sebagai
-- peran mereka (anon / authenticated).
--
-- Ini AMAN karena:
-- 1. Fungsi SECURITY DEFINER jalan dengan privilege si pembuat (postgres)
-- 2. Yang bisa dipanggil cuma fungsi yg udah ditentukan — input terbatas
-- 3. Tanpa GRANT ini, SEMUA RLS policy yg pake helper function bakal error
-- ==============================================================================

-- is_admin() — dicabut di migration revoke_public_trigger_functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- is_umkm_job_owner(UUID) — dicabut di migration fix_secure_helper_functions
GRANT EXECUTE ON FUNCTION public.is_umkm_job_owner(UUID) TO anon, authenticated;

-- is_applicant_for_job(UUID) — dicabut di migration fix_secure_helper_functions
GRANT EXECUTE ON FUNCTION public.is_applicant_for_job(UUID) TO anon, authenticated;

-- is_umkm() — dicabut di migration fix_secure_helper_functions
GRANT EXECUTE ON FUNCTION public.is_umkm() TO anon, authenticated;
