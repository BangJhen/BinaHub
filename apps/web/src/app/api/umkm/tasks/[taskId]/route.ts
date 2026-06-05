import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = params;
    const body = await request.json();
    const { status, feedback } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: "Valid status ('approved', 'rejected') is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({
        status,
        feedback: feedback || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .eq("umkm_id", user.id) // Ensure only the owner UMKM can update
      .select()
      .single();

    if (error) {
      console.error("Update task error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    console.error("Update task exception:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
