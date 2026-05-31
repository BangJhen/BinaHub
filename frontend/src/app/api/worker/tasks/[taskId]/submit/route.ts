import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = params;
    const body = await request.json();
    const { proof_text, proof_media_url, proof_media_type } = body;

    const { data, error } = await supabase
      .from("tasks")
      .update({
        status: "waiting_approval",
        proof_text: proof_text || null,
        proof_media_url: proof_media_url || null,
        proof_media_type: proof_media_type || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .eq("worker_id", user.id) // Ensure only the assigned worker can update
      .select()
      .single();

    if (error) {
      console.error("Submit task proof error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    console.error("Submit task proof exception:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
