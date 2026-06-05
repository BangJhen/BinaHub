import { NextResponse } from "next/server";
import { createClient } from "@/shared/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { data: profile, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single();

    return NextResponse.json({ profile: profile ?? null, user: userData ?? null });
  } catch (e) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Determine if profile is complete enough
    const requiredFields = ["full_name", "gender", "age", "city", "education_level", "skills"];
    const isComplete = requiredFields.every(f => body[f] && String(body[f]).trim() !== "");

    const profileData = {
      user_id: user.id,
      full_name: body.full_name ?? null,
      gender: body.gender ?? null,
      nik: body.nik ?? null,
      phone: body.phone ?? null,
      address: body.address ?? null,
      age: body.age ? parseInt(body.age) : null,
      city: body.city ?? null,
      province: body.province ?? null,
      birth_date: body.birth_date ?? null,
      education_level: body.education_level ?? null,
      skills: body.skills ?? null,
      experience_summary: body.experience_summary ?? null,
      rehabilitation_program: body.rehabilitation_program ?? null,
      rehabilitation_status: body.rehabilitation_status ?? "not_started",
      // Criminal background
      crime_type: body.crime_type ?? null,
      sentence_years: body.sentence_years ? parseFloat(body.sentence_years) : null,
      release_date: body.release_date ?? null,
      lapas_name: body.lapas_name ?? null,
      // Completion
      profile_completed: isComplete,
      profile_completed_at: isComplete ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("worker_profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    // Also update full_name and phone in users table
    if (body.full_name || body.phone) {
      await supabase.from("users").update({
        ...(body.full_name && { full_name: body.full_name }),
        ...(body.phone && { phone: body.phone }),
      }).eq("id", user.id);
    }

    return NextResponse.json({ success: true, profile_completed: isComplete });
  } catch (e) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
