import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ message: "Konten jurnal harian tidak boleh kosong." }, { status: 400 });
    }

    // Insert into checkins
    const { data, error } = await supabase
      .from("checkins")
      .insert({
        worker_id: user.id,
        content: content.trim(),
        channel: "text" // Default to text for now
      })
      .select()
      .single();

    if (error) {
      console.error("DB Error Checkin:", error);
      return NextResponse.json({ message: "Gagal menyimpan jurnal harian." }, { status: 500 });
    }

    return NextResponse.json({ message: "Berhasil menyimpan jurnal harian.", checkin: data }, { status: 201 });
  } catch (error) {
    console.error("Internal Checkin Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
