import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || "binahub-ai-secret-key";

export async function POST() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ── Ambil konteks pekerja untuk personalisasi pertanyaan ──────────────
    let workerContext: any = null;
    try {
      const [profileRes, placementRes] = await Promise.all([
        supabase.from("worker_profiles").select("birth_date").eq("user_id", user.id).single(),
        supabase.from("placements").select("*, jobs(title), umkm_profiles(business_name)").eq("worker_id", user.id).eq("status", "active").limit(1).single()
      ]);

      const age = profileRes.data?.birth_date
        ? Math.floor((Date.now() - new Date(profileRes.data.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
        : null;

      workerContext = {
        age,
        job_type: placementRes.data?.jobs?.title ?? "tidak diketahui",
        umkm_name: (placementRes.data as any)?.umkm_profiles?.business_name ?? "tidak diketahui"
      };
    } catch (err) {
      console.error("Gagal mengambil konteks pekerja:", err);
    }

    // ── Panggil backend untuk generate pertanyaan ────────────────────────
    const aiRes = await fetch(`${AI_SERVICE_URL}/api/v1/generate-questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-ai-secret": AI_SERVICE_SECRET
      },
      body: JSON.stringify({
        worker_id: user.id,
        worker_context: workerContext
      })
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI Service generate-questions error:", errText);
      throw new Error("AI Service gagal");
    }

    const data = await aiRes.json();
    return NextResponse.json({ questions: data.questions }, { status: 200 });

  } catch (error) {
    console.error("Generate questions error:", error);
    // Fallback questions jika AI service gagal
    return NextResponse.json({
      questions: [
        "Gimana kabarmu setelah bekerja hari ini?",
        "Apa hal yang paling berkesan hari ini?",
        "Ada yang ingin kamu ceritakan lebih lanjut?"
      ]
    }, { status: 200 });
  }
}
