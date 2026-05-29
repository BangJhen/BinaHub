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

    return NextResponse.json({
      placement: placement ? { ...placement, umkm: umkmProfile } : null,
      history: checkins || []
    });

  } catch (error) {
    console.error("Workspace API Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
