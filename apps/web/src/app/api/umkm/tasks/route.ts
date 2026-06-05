import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { worker_id, title, description, priority, due_date, location, target, checklist } = body;

    if (!worker_id || !title) {
      return NextResponse.json({ message: "Worker ID and Title are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        umkm_id: user.id,
        worker_id,
        title,
        description,
        priority: priority || "medium",
        due_date,
        location,
        target,
        checklist: checklist || [],
        status: "todo"
      })
      .select()
      .single();

    if (error) {
      console.error("Insert task error:", error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ task: data });
  } catch (error) {
    console.error("Create task exception:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
