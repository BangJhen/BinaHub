import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

export async function POST(request: Request, { params }: { params: { id: string } }) {
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
      .select("id, status, umkm_id, title")
      .eq("id", params.id)
      .single();

    if (jobError || !job || job.status !== "open") {
      return NextResponse.json({ error: "Job not available" }, { status: 404 });
    }

    const { data: existingApplication } = await supabase
      .from("job_applications")
      .select("id, job_id, worker_id, status, applied_at")
      .eq("job_id", params.id)
      .eq("worker_id", authData.user.id)
      .maybeSingle();

    if (existingApplication?.id) {
      return NextResponse.json({
        success: true,
        alreadyApplied: true,
        application: existingApplication,
        message: "Lamaran sudah pernah dikirim"
      });
    }

    const { data: application, error: insertError } = await supabase
      .from("job_applications")
      .insert({
        job_id: params.id,
        worker_id: authData.user.id,
        status: "submitted",
        cover_letter: "Lamaran dikirim melalui halaman worker lowongan."
      })
      .select("id, job_id, worker_id, status, applied_at")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: duplicateApplication } = await supabase
          .from("job_applications")
          .select("id, job_id, worker_id, status, applied_at")
          .eq("job_id", params.id)
          .eq("worker_id", authData.user.id)
          .maybeSingle();

        return NextResponse.json({
          success: true,
          alreadyApplied: true,
          application: duplicateApplication,
          message: "Lamaran sudah pernah dikirim"
        });
      }
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      alreadyApplied: false,
      application,
      message: "Lamaran berhasil dikirim dan tercatat di dashboard UMKM"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to apply" }, { status: 500 });
  }
}
