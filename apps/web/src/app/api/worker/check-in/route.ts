import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || "binahub-ai-secret-key";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, physicalRating, mentalRating, promptAnswers } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ message: "Konten jurnal harian tidak boleh kosong." }, { status: 400 });
    }

    // ── Insert checkin ke Supabase ────────────────────────────────────────────
    const payload: any = {
      worker_id: user.id,
      content: content.trim(),
      channel: "text"
    };

    const { data, error } = await supabase
      .from("checkins")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("DB Error Checkin:", error);
      return NextResponse.json({ message: "Gagal menyimpan jurnal harian." }, { status: 500 });
    }

    // ── Simpan guided prompt answers (jika ada) ───────────────────────────────
    if (data && promptAnswers && promptAnswers.length > 0) {
      const answersToInsert = promptAnswers.map((pa: any) => ({
        checkin_id: data.id,
        prompt_category: pa.category,
        prompt_question: pa.question,
        answer_text: pa.answer
      }));
      await supabase.from("checkin_answers").insert(answersToInsert).then(res => {
         if(res.error) console.log("DB Insert Checkin Answers Error:", res.error.message);
      });
    }

    // ── Ambil konteks pekerja untuk AI ───────────────────────────────────────
    let workerContext: any = null;
    try {
      const [profileRes, placementRes] = await Promise.all([
        supabase.from("worker_profiles").select("birth_date, rehabilitation_program").eq("user_id", user.id).single(),
        supabase.from("placements").select("*, jobs(title, employment_type), umkm_profiles(business_name)").eq("worker_id", user.id).eq("status", "active").limit(1).single()
      ]);

      const age = profileRes.data?.birth_date
        ? Math.floor((Date.now() - new Date(profileRes.data.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000))
        : null;

      workerContext = {
        age,
        job_type: placementRes.data?.jobs?.title ?? "tidak diketahui",
        umkm_name: (placementRes.data as any)?.umkm_profiles?.business_name ?? "tidak diketahui"
      };

      // ── 🔥 Trigger AI Service (fire-and-forget, non-blocking) ────────────────
      fetch(`${AI_SERVICE_URL}/api/v1/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-secret": AI_SERVICE_SECRET
        },
        body: JSON.stringify({
          worker_id: user.id,
          checkin_id: data.id,
          journal_text: content.trim(),
          umkm_id: placementRes.data?.umkm_id ?? null,
          placement_id: placementRes.data?.id ?? null,
          worker_context: workerContext
        })
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.text();
          console.error("AI Service error:", err);
        } else {
          console.log(`✅ AI analysis triggered for checkin ${data.id}`);
        }
      }).catch(e => {
        console.error("AI Service unreachable (is it running?):", e.message);
      });

    } catch (ctxErr) {
      console.error("Failed to fetch worker context for AI:", ctxErr);
      
      // Trigger AI anyway without context (still useful)
      fetch(`${AI_SERVICE_URL}/api/v1/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-secret": AI_SERVICE_SECRET
        },
        body: JSON.stringify({
          worker_id: user.id,
          checkin_id: data.id,
          journal_text: content.trim()
        })
      }).catch(() => {}); // silent fail
    }

    // ── Pesan afirmasi hangat (sementara, akan diganti oleh AI Response Card) ─
    const aiReplies = [
      "Terima kasih sudah jujur melapor hari ini. Satu persatu kita jalani sama-sama ya!",
      "Laporan diterima. Kerja bagus hari ini, jangan lupa istirahat yang cukup.",
      "Kami membaca ceritamu. Hebat sekali bisa menahan rintangan hari ini, Bapas bangga padamu.",
      "Setiap langkah kecil adalah kemajuan. Tetap semangat untuk esok hari!"
    ];
    const randomAiReply = aiReplies[Math.floor(Math.random() * aiReplies.length)];

    return NextResponse.json({ 
      message: "Berhasil menyimpan jurnal harian.", 
      checkin: data,
      ai_reply: randomAiReply,
      ai_analyzing: true  // Signal to frontend: AI is processing in background
    }, { status: 201 });
  } catch (error) {
    console.error("Internal Checkin Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

