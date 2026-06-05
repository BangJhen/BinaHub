import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

type RelatedJob = {
  id: string;
  title: string;
  salary: string;
  contract: string;
  duration: string;
  level: string;
  company: string;
  location: string;
  posted: string;
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return "Gaji dirahasiakan";
  const format = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(value);

  if (min && max) return `${format(min)} - ${format(max)}`;
  if (min) return `Mulai dari ${format(min)}`;
  return `Hingga ${format(max ?? 0)}`;
}

function toBulletList(text?: string | null) {
  if (!text) return [] as string[];
  return text
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== "worker") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(
        "id, umkm_id, title, description, requirements, employment_type, location, salary_min, salary_max, published_at, status, skills, benefits, education_level, experience_required, age_range"
      )
      .eq("id", params.id)
      .single();

    if (jobError || !job || job.status !== "open") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: umkmProfile } = await supabase
      .from("umkm_profiles")
      .select("business_name, business_sector, business_address, company_description")
      .eq("user_id", job.umkm_id)
      .single();

    const { data: existingApplication } = await supabase
      .from("job_applications")
      .select("id, status")
      .eq("job_id", job.id)
      .eq("worker_id", authData.user.id)
      .maybeSingle();

    const { data: existingSaved } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("job_id", job.id)
      .eq("worker_id", authData.user.id)
      .maybeSingle();

    const { data: relatedJobs } = await supabase
      .from("jobs")
      .select("id, umkm_id, title, employment_type, salary_min, salary_max, location, published_at")
      .eq("status", "open")
      .neq("id", job.id)
      .order("published_at", { ascending: false })
      .limit(3);

    const relatedUmkmIds = (relatedJobs || []).map((item) => item.umkm_id);
    const { data: relatedUmkms } = await supabase
      .from("umkm_profiles")
      .select("user_id, business_name")
      .in("user_id", relatedUmkmIds.length > 0 ? relatedUmkmIds : ["00000000-0000-0000-0000-000000000000"]);

    const umkmMap = new Map((relatedUmkms || []).map((item) => [item.user_id, item.business_name]));

    const relatedMapped: RelatedJob[] = (relatedJobs || []).map((item) => ({
      id: item.id,
      title: item.title,
      salary: formatSalary(item.salary_min, item.salary_max),
      contract: item.employment_type || "Full-time",
      duration: "-",
      level: "-",
      company: umkmMap.get(item.umkm_id) || "UMKM",
      location: item.location || "-",
      posted: item.published_at
        ? new Date(item.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })
        : "Baru saja"
    }));

    const descriptionBullets = [
      ...toBulletList(job.description),
      ...toBulletList(job.requirements)
    ];

    return NextResponse.json({
      data: {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        employmentType: job.employment_type || "Full-time",
        location: job.location || "-",
        salary: {
          min: job.salary_min,
          max: job.salary_max,
          display: formatSalary(job.salary_min, job.salary_max)
        },
        publishedAt: job.published_at,
        company: {
          id: job.umkm_id,
          name: umkmProfile?.business_name || "UMKM",
          sector: umkmProfile?.business_sector || "-",
          address: umkmProfile?.business_address || "-",
          description: umkmProfile?.company_description || ""
        },
        descriptionBullets,
        skills: job.skills || [],
        benefits: job.benefits || [],
        educationLevel: job.education_level || "Tidak disebutkan",
        experienceRequired: job.experience_required || "Tidak disebutkan",
        ageRange: job.age_range || "Tidak disebutkan",
        relatedJobs: relatedMapped,
        isApplied: Boolean(existingApplication?.id),
        applicationStatus: existingApplication?.status || null,
        isSaved: Boolean(existingSaved?.id)
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch job detail" }, { status: 500 });
  }
}
