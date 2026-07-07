import { createClient } from "@/shared/supabase/server";

import type { MatchLabel } from "./match";

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
  isApplied: boolean;
  applicationStatus?: string | null;
  skills: string[] | null;
  education_level_required: string | null;
  experience_required: string | null;
  // computed client-side
  matchScore?: number;
  matchLabel?: MatchLabel;
};

export type WorkerLowonganPage = {
  items: WorkerLowongan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type WorkerLowonganQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  location?: string;
  types?: string[];
  systems?: string[];
  experiences?: string[];
  sortBy?: "newest" | "salary";
};

type WorkerLowonganJobRow = {
  id: string;
  umkm_id: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  published_at: string | null;
  skills: string[] | null;
  education_level: string | null;
  experience_required: string | null;
};

const SUPABASE_PAGE_SIZE = 1000;

const DEFAULT_PAGE_SIZE = 10;

function normalizeEmploymentType(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function mapExperienceFilter(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "fresh graduate") return ["fresh", "0-1", "tidak wajib"];
  if (normalized === "1-3 tahun") return ["1-2", "1-3", "0-1"];
  if (normalized === "3-5 tahun") return ["3-5"];
  if (normalized === "senior") return ["senior"];
  return [normalized];
}

async function fetchAllOpenJobs(): Promise<WorkerLowonganJobRow[]> {
  const supabase = createClient();
  const rows: WorkerLowonganJobRow[] = [];
  let from = 0;

  while (true) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("jobs")
      .select("id, umkm_id, title, location, employment_type, salary_min, salary_max, published_at, skills, education_level, experience_required")
      .eq("status", "open")
      .order("published_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const batch = (data ?? []) as WorkerLowonganJobRow[];
    rows.push(...batch);

    if (batch.length < SUPABASE_PAGE_SIZE) {
      break;
    }

    from += SUPABASE_PAGE_SIZE;
  }

  return rows;
}

export async function getWorkerLowonganData(): Promise<WorkerLowongan[]> {
  const page = await getWorkerLowonganPage({ page: 1, pageSize: SUPABASE_PAGE_SIZE });
  return page.items;
}

export async function getWorkerLowonganPage(query: WorkerLowonganQuery = {}): Promise<WorkerLowonganPage> {
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
  
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let jobsQuery = supabase
    .from("jobs")
    .select("id, umkm_id, title, location, employment_type, salary_min, salary_max, published_at, skills, education_level, experience_required", { count: "exact" })
    .eq("status", "open");

  const search = query.search?.trim();
  if (search) {
    const { data: matchingUmkms } = await supabase
      .from("umkm_profiles")
      .select("user_id")
      .ilike("business_name", `%${search}%`)
      .limit(100);

    const matchingUmkmIds = (matchingUmkms ?? []).map((item) => item.user_id);
    const filters = [`title.ilike.%${search}%`];
    if (matchingUmkmIds.length > 0) {
      filters.push(`umkm_id.in.(${matchingUmkmIds.join(",")})`);
    }
    jobsQuery = jobsQuery.or(filters.join(","));
  }

  const location = query.location?.trim();
  if (location) {
    jobsQuery = jobsQuery.ilike("location", `%${location}%`);
  }

  const types = (query.types ?? []).map(normalizeEmploymentType).filter(Boolean);
  if (types.length > 0) {
    jobsQuery = jobsQuery.in("employment_type", types);
  }

  const systems = query.systems ?? [];
  if (systems.length > 0 && !systems.includes("Work from Office")) {
    // Seeded jobs are on-site/WFO. Hybrid/Remote are intentionally empty filters.
    jobsQuery = jobsQuery.eq("employment_type", "__no_matching_work_system__");
  }

  const experiences = (query.experiences ?? []).flatMap(mapExperienceFilter);
  if (experiences.length > 0) {
    jobsQuery = jobsQuery.or(
      experiences.map((item) => `experience_required.ilike.%${item}%`).join(",")
    );
  }

  if (query.sortBy === "salary") {
    jobsQuery = jobsQuery.order("salary_max", { ascending: false, nullsFirst: false });
  } else {
    jobsQuery = jobsQuery.order("published_at", { ascending: false, nullsFirst: false });
  }

  const { data: jobsData, error: jobsError, count } = await jobsQuery.range(from, to);

  if (jobsError || !jobsData) {
    console.error("Error fetching jobs:", jobsError);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const jobs = jobsData as WorkerLowonganJobRow[];

  if (jobs.length === 0) return { items: [], total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) };

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

  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("job_id")
    .eq("worker_id", authData.user.id);

  const savedSet = new Set((savedJobs || []).map((item) => item.job_id));

  const jobIds = jobs.map((job) => job.id);
  const { data: applications } = await supabase
    .from("job_applications")
    .select("job_id, status")
    .eq("worker_id", authData.user.id)
    .in("job_id", jobIds.length > 0 ? jobIds : ["00000000-0000-0000-0000-000000000000"]);

  const applicationMap = new Map((applications || []).map((item) => [item.job_id, item.status]));

  const items = jobs.map(job => {
    const umkm = umkmMap.get(job.umkm_id);
    const applicationStatus = applicationMap.get(job.id) ?? null;
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
      isApplied: Boolean(applicationStatus),
      applicationStatus,
      skills: job.skills ?? null,
      education_level_required: job.education_level ?? null,
      experience_required: job.experience_required ?? null,
    };
  });

  const total = count ?? items.length;
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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
      isApplied: false,
      applicationStatus: null,
      skills: job.skills ?? null,
      education_level_required: job.education_level ?? null,
      experience_required: job.experience_required ?? null,
    };
  });
}
