import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Cari penempatan aktif pekerja
    const { data: placement } = await supabase
      .from("placements")
      .select("umkm_id, id")
      .eq("worker_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!placement) {
      return NextResponse.json({ message: "Tidak ada pekerjaan aktif untuk dilaporkan." }, { status: 400 });
    }

    // Masukkan ke tabel alerts Supabase
    // (Admin Bapas akan memantau tabel ini untuk penanganan darurat)
    const { error: alertError } = await supabase.from("alerts").insert({
      umkm_id: placement.umkm_id,
      worker_id: user.id,
      placement_id: placement.id,
      title: "Darurat (S.O.S) dari Pekerja",
      message: "Pekerja menekan tombol bantuan darurat dari Meja Kerja. Mohon segera hubungi pekerja yang bersangkutan untuk mengecek kondisinya.",
      status: "unread"
    });

    if (alertError) throw alertError;

    return NextResponse.json({ success: true, message: "Sinyal bantuan berhasil dikirim ke pendamping." }, { status: 201 });
  } catch (error) {
    console.error("SOS API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
