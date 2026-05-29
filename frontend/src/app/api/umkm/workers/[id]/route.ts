import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    
    // Auth Check
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== "umkm") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ambil data detail Worker
    const { data: workerData, error: workerErr } = await supabase
      .from("users")
      .select(`
        id, email, phone, full_name,
        worker_profiles (
          city, province, skills, experience_summary, education_level, gender, age
        )
      `)
      .eq("id", params.id)
      .single();

    if (workerErr || !workerData) {
      return NextResponse.json({ error: "Pekerja tidak ditemukan di server" }, { status: 404 });
    }

    const p = workerData.worker_profiles ? (Array.isArray(workerData.worker_profiles) ? workerData.worker_profiles[0] : workerData.worker_profiles) : {};
    
    const mapped = {
      id: workerData.id,
      name: workerData.full_name || "Guest Worker",
      email: workerData.email || "",
      phone: workerData.phone || "Tidak dicantumkan",
      role: "Pekerja",
      location: p.city ? `${p.city}, ${p.province || ""}`.trim() : "Tidak disebutkan",
      skills: p.skills || "Tidak dituliskan",
      experienceSummary: p.experience_summary || "Tidak ada detail pengalaman.",
      educationLevel: p.education_level || "-",
      gender: p.gender || "-",
      age: p.age || "-"
    };

    return NextResponse.json({ data: mapped });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}