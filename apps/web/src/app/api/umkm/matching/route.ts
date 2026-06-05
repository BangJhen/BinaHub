import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

export const dynamic = "force-dynamic";

type WorkerCandidate = {
  id: string;
  name: string;
  city: string | null;
  skills: string;
  experienceSummary: string | null;
  educationLevel: string | null;
  attendanceRate: number;
  checkinConsistency: number;
  productivityScore: number;
  latestCondition: "green" | "yellow" | "red";
};

type JobLite = {
  id: string;
  title: string;
  location: string | null;
  skills: string[];
  educationLevel: string | null;
  applicants: number;
};

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make sure caller is UMKM
    const { data: profile } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "umkm") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch UMKM jobs (only open) with applicant counts
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        location,
        skills,
        education_level,
        status,
        published_at,
        job_applications(id)
      `)
      .eq("umkm_id", user.id)
      .order("published_at", { ascending: false });

    if (jobsError) throw jobsError;

    const openJobs: JobLite[] = (jobs || [])
      .filter((j: any) => j.status === "open")
      .map((j: any) => ({
        id: j.id,
        title: j.title,
        location: j.location,
        skills: Array.isArray(j.skills) ? j.skills : [],
        educationLevel: j.education_level,
        applicants: (j.job_applications || []).length
      }));

    // Fetch all active workers
    const { data: workers, error: workersError } = await supabase
      .from("worker_profiles")
      .select(`
        user_id,
        skills,
        experience_summary,
        education_level,
        city,
        province,
        status,
        users:user_id (
          full_name
        )
      `)
      .eq("status", "active");

    if (workersError) throw workersError;

    const workerIds = (workers || []).map((w: any) => w.user_id);

    // Compute attendance/checkin/condition stats per worker (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const { data: checkins } = await supabase
      .from("checkins")
      .select("id, worker_id, sentiment_score, submitted_at")
      .in("worker_id", workerIds.length > 0 ? workerIds : ["00000000-0000-0000-0000-000000000000"])
      .gte("submitted_at", since.toISOString());

    const { data: latestRisk } = await supabase
      .from("risk_assessments")
      .select("worker_id, risk_level, assessed_at")
      .in("worker_id", workerIds.length > 0 ? workerIds : ["00000000-0000-0000-0000-000000000000"])
      .order("assessed_at", { ascending: false });

    const latestRiskMap = new Map<string, "green" | "yellow" | "red">();
    for (const r of latestRisk || []) {
      if (!latestRiskMap.has(r.worker_id)) {
        latestRiskMap.set(r.worker_id, r.risk_level);
      }
    }

    const checkinStats = new Map<string, { count: number; avgSentiment: number }>();
    for (const c of checkins || []) {
      const cur = checkinStats.get(c.worker_id) || { count: 0, avgSentiment: 0 };
      cur.count += 1;
      cur.avgSentiment += Number(c.sentiment_score) || 0;
      checkinStats.set(c.worker_id, cur);
    }

    const candidates: WorkerCandidate[] = (workers || []).map((w: any) => {
      const stat = checkinStats.get(w.user_id) || { count: 0, avgSentiment: 0 };
      const checkinConsistency = Math.min(100, Math.round((stat.count / 30) * 100));
      const avgSent = stat.count > 0 ? stat.avgSentiment / stat.count : 0;
      const productivityScore = Math.max(0, Math.min(100, Math.round(50 + avgSent * 50)));
      // attendance heuristic from check-in consistency + 5 baseline
      const attendanceRate = Math.min(100, Math.max(40, Math.round(checkinConsistency * 0.8 + 25)));
      const condition = latestRiskMap.get(w.user_id) || "yellow";

      return {
        id: w.user_id,
        name: (w.users as any)?.full_name || "Pekerja",
        city: w.city,
        skills: w.skills || "",
        experienceSummary: w.experience_summary,
        educationLevel: w.education_level,
        attendanceRate,
        checkinConsistency,
        productivityScore,
        latestCondition: condition
      };
    });

    return NextResponse.json({ jobs: openJobs, candidates });
  } catch (error: any) {
    console.error("Matching error", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
