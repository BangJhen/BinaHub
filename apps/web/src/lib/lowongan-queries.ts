import { createClient } from "@/utils/supabase/server";

import type { MatchLabel } from "./match-utils";

export type WorkerLowongan = {
  id: string;
  title: string;
  location: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  published_at: string | null;
  saved_at?: string | null;
  umkm_name: string;
  business_sector: string | null;
  business_address: string | null;
  isSaved: boolean;
  skills: string[] | null;
  education_level_required: string | null;
  experience_required: string | null;
  // computed client-side
  matchScore?: number;
  matchLabel?: MatchLabel;
};

export async function getWorkerLowonganData(): Promise<WorkerLowongan[]> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !userProfile || userProfile.role !== "worker") {
    throw new Error("Forbidden");
  }
  
  // Ambil lowongan dengan status 'open'
  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, umkm_id, title, location, employment_type, salary_min, salary_max, published_at, skills, education_level, experience_required")
    .eq("status", "open")
    .order("published_at", { ascending: false });

  if (jobsError || !jobs) {
    console.error("Error fetching jobs:", jobsError);
    return [];
  }

  if (jobs.length === 0) return [];

  // Ambil data umkm terkait
  const umkmIds = Array.from(new Set(jobs.map(j => j.umkm_id)));
  
  const { data: umkms, error: umkmsError } = await supabase
    .from("umkm_profiles")
    .select("user_id, business_name, business_sector, business_address")
    .in("user_id", umkmIds);

  const umkmMap = new Map();
  if (!umkmsError && umkms) {
    for (const u of umkms) {
      umkmMap.set(u.user_id, u);
    }
  }

  const jobIds = jobs.map((job) => job.id);
  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("worker_id", authData.user.id)
    .in("job_id", jobIds);

  const savedSet = new Set((savedJobs || []).map((item) => item.job_id));

  return jobs.map(job => {
    const umkm = umkmMap.get(job.umkm_id);
    return {
      id: job.id,
      title: job.title,
      location: job.location ?? "-",
      employment_type: job.employment_type ?? "Full-time",
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      published_at: job.published_at,
      umkm_name: umkm?.business_name ?? "UMKM",
      business_sector: umkm?.business_sector ?? null,
      business_address: umkm?.business_address ?? null,
      isSaved: savedSet.has(job.id),
      skills: job.skills ?? null,
      education_level_required: job.education_level ?? null,
      experience_required: job.experience_required ?? null,
    };
  });
}

export async function getWorkerSavedLowonganData(): Promise<WorkerLowongan[]> {
  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error("Unauthorized");
  }

  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !userProfile || userProfile.role !== "worker") {
    throw new Error("Forbidden");
  }

  const { data: savedJobs, error: savedError } = await supabase
    .from("saved_jobs")
    .select("job_id, created_at")
    .eq("worker_id", authData.user.id)
    .order("created_at", { ascending: false });

  if (savedError || !savedJobs || savedJobs.length === 0) {
    return [];
  }

  const jobIds = savedJobs.map((item) => item.job_id);
  const savedAtMap = new Map(savedJobs.map((item) => [item.job_id, item.created_at]));

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, umkm_id, title, location, employment_type, salary_min, salary_max, published_at, skills, education_level, experience_required")
    .in("id", jobIds)
    .order("published_at", { ascending: false });

  if (jobsError || !jobs) {
    console.error("Error fetching saved jobs:", jobsError);
    return [];
  }

  const umkmIds = Array.from(new Set(jobs.map((job) => job.umkm_id)));
  const { data: umkms, error: umkmsError } = await supabase
    .from("umkm_profiles")
    .select("user_id, business_name, business_sector, business_address")
    .in("user_id", umkmIds);

  const umkmMap = new Map();
  if (!umkmsError && umkms) {
    for (const u of umkms) {
      umkmMap.set(u.user_id, u);
    }
  }

  return jobs.map((job) => {
    const umkm = umkmMap.get(job.umkm_id);
    return {
      id: job.id,
      title: job.title,
      location: job.location ?? "-",
      employment_type: job.employment_type ?? "Full-time",
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      published_at: job.published_at,
      saved_at: savedAtMap.get(job.id) ?? null,
      umkm_name: umkm?.business_name ?? "UMKM",
      business_sector: umkm?.business_sector ?? null,
      business_address: umkm?.business_address ?? null,
      isSaved: true,
      skills: job.skills ?? null,
      education_level_required: job.education_level ?? null,
      experience_required: job.experience_required ?? null,
    };
  });
}
