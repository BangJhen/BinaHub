import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request, { params }: { params: { appId: string } }) {
  try {
    const supabase = createClient();

    // 1. Validasi Autentikasi & Authorization (UMKM)
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== "umkm") {
      return NextResponse.json({ error: "Forbidden. Hanya UMKM yang berhak mengakses fungsi ini." }, { status: 403 });
    }

    // 2. Parse Body Request
    const body = await request.json();
    const { decision } = body;
    if (!decision || (decision !== "accept" && decision !== "reject")) {
      return NextResponse.json({ error: "Invalid decision. Gunakan 'accept' atau 'reject'." }, { status: 400 });
    }

    // 3. Validasi Job Application & Kepemilikan Job
    const { data: application, error: appError } = await supabase
      .from("job_applications")
      .select(`
        id, job_id, worker_id, status,
        jobs ( id, umkm_id )
      `)
      .eq("id", params.appId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: "Data lamaran tidak ditemukan." }, { status: 404 });
    }

    // Validasi Foreign Tabel relasi Jobs dengan Worker
    const jobData = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs;
    if (!jobData || jobData.umkm_id !== authData.user.id) {
      return NextResponse.json({ error: "Akses ditolak: Lamaran bukan untuk lowongan Anda." }, { status: 403 });
    }

    if (application.status === "accepted" || application.status === "rejected") {
      return NextResponse.json({ error: "Kandidat ini sudah direspons sebelumnya." }, { status: 409 });
    }

    const { appId } = params;

    // 4. Eksekusi Keputusan
    if (decision === "reject") {
      const { error: rejectError } = await supabase
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", appId);

      if (rejectError) throw rejectError;

      return NextResponse.json({ success: true, message: "Kandidat berhasil ditolak." });
    }

    if (decision === "accept") {
      const { error: acceptUpdateError } = await supabase
        .from("job_applications")
        .update({ status: "accepted" })
        .eq("id", appId);

      if (acceptUpdateError) throw acceptUpdateError;

      const { data: existingPlacement } = await supabase
        .from("placements")
        .select("id")
        .eq("worker_id", application.worker_id)
        .eq("job_id", application.job_id)
        .eq("umkm_id", authData.user.id)
        .maybeSingle();

      if (!existingPlacement) {
        const { error: placementError } = await supabase
          .from("placements")
          .insert({
            worker_id: application.worker_id,
            umkm_id: authData.user.id,
            job_id: application.job_id,
            status: "active"
          });

        if (placementError) throw placementError;
      }

      return NextResponse.json({ success: true, message: "Kandidat berhasil diterima." });
    }

  } catch (error: any) {
    console.error("Action Respond Applicant Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error." }, { status: 500 });
  }
}