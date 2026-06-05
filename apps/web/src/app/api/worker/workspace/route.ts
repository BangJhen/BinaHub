import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Dapatkan Penempatan Aktif
    const { data: placementData, error: placementError } = await supabase
      .from("placements")
      .select("*, jobs(title, employment_type)")
      .eq("worker_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    const placement = placementData && placementData.length > 0 ? placementData[0] : null;

    let umkmProfile = null;
    if (placement) {
      const { data: umkm } = await supabase
        .from("umkm_profiles")
        .select("business_name, city")
        .eq("user_id", placement.umkm_id)
        .single();
      umkmProfile = umkm;
    }

    // 2. Dapatkan Riwayat Jurnal (Check-in) Terakhir
    const { data: checkins } = await supabase
      .from("checkins")
      .select("id, content, submitted_at")
      .eq("worker_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(5);

    // 3. Ambil Tasks riil dari DB, jika gagal/kosong gunakan Mock Data
    let realTasks: any[] = [];
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("worker_id", user.id)
        .order("created_at", { ascending: false });
        
      if (!tasksError && tasksData && tasksData.length > 0) {
        realTasks = tasksData.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          proofText: t.proof_text,
          proofMediaUrl: t.proof_media_url,
          proofMediaType: t.proof_media_type,
          feedback: t.feedback,
        }));
      }
    } catch (e) {
      console.log("Tasks table not ready yet, falling back to mock");
    }

    // Status enum: "todo" | "waiting_approval" | "approved" | "rejected"
    const mockTasks = placement ? [
      { 
        id: "mock-1", 
        title: "Datang tepat waktu",
        description: "Datang tepat waktu dan buka pintu toko.", 
        status: "approved", 
        proofText: "Sudah dibuka jam 07:30 bos.",
        feedback: "Mantap, pertahankan kedisiplinannya.",
      },
      { 
        id: "mock-2", 
        title: "Siapkan stok barang",
        description: "Menyiapkan alat dan bahan stok di gudang belakang.", 
        status: "waiting_approval",
        proofText: "Barang sudah saya susun rapi sesuai abjad seperti instruksi kemarin.",
        feedback: null,
      },
      { 
        id: "mock-3", 
        title: "Bersihkan etalase",
        description: "Membersihkan etalase depan.", 
        status: "rejected",
        proofText: "Sudah di lap pakai kain basah.",
        feedback: "Masih banyak debu di rak paling atas, tolong dikerjakan ulang dengan kemoceng dulu ya.",
      },
      { 
        id: "mock-4", 
        title: "Laporan harian ke BinaHub",
        description: "Laporan harian ke BinaHub.", 
        status: "todo",
        proofText: null,
        feedback: null,
      }
    ] : [];

    return NextResponse.json({
      placement: placement ? { ...placement, umkm: umkmProfile } : null,
      history: checkins || [],
      tasks: realTasks.length > 0 ? realTasks : mockTasks
    });

  } catch (error) {
    console.error("Workspace API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
