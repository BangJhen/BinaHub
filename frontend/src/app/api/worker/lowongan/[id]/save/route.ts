import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    const { data: job } = await supabase
      .from("jobs")
      .select("id, status")
      .eq("id", params.id)
      .single();

    if (!job || job.status !== "open") {
      return NextResponse.json({ error: "Job not available" }, { status: 404 });
    }

    const { data: existingSaved } = await supabase
      .from("saved_jobs")
      .select("id")
      .eq("job_id", params.id)
      .eq("worker_id", authData.user.id)
      .maybeSingle();

    if (existingSaved?.id) {
      return NextResponse.json({ success: true, saved: true });
    }

    const { error: insertError } = await supabase
      .from("saved_jobs")
      .insert({
        job_id: params.id,
        worker_id: authData.user.id
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, saved: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save job" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const { error: deleteError } = await supabase
      .from("saved_jobs")
      .delete()
      .eq("job_id", params.id)
      .eq("worker_id", authData.user.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, saved: false });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove saved job" }, { status: 500 });
  }
}
