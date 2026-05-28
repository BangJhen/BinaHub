import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { data: profile, error } = await supabase
      .from("umkm_profiles")
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

    // Count total workers who have ever been placed at this UMKM
    const { count: totalWorkers } = await supabase
      .from("placements")
      .select("*", { count: "exact", head: true })
      .eq("umkm_id", user.id);

    // Count currently active workers
    const { count: activeWorkers } = await supabase
      .from("placements")
      .select("*", { count: "exact", head: true })
      .eq("umkm_id", user.id)
      .eq("status", "active");

    return NextResponse.json({
      profile: profile ?? null,
      user: userData ?? null,
      stats: {
        totalWorkers: totalWorkers ?? 0,
        activeWorkers: activeWorkers ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const requiredFields = ["business_name", "business_sector", "city", "owner_name", "phone"];
    const isComplete = requiredFields.every(f => body[f] && String(body[f]).trim() !== "");

    const profileData = {
      user_id: user.id,
      business_name: body.business_name ?? null,
      business_sector: body.business_sector ?? null,
      city: body.city ?? null,
      province: body.province ?? null,
      business_address: body.business_address ?? null,
      company_description: body.company_description ?? null,
      owner_name: body.owner_name ?? null,
      phone: body.phone ?? null,
      website: body.website ?? null,
      established_year: body.established_year ? parseInt(body.established_year) : null,
      business_license: body.business_license ?? null,
      profile_completed: isComplete,
      profile_completed_at: isComplete ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from("umkm_profiles")
      .upsert(profileData, { onConflict: "user_id" });

    if (error) return NextResponse.json({ message: error.message }, { status: 500 });

    // Also sync owner_name and phone to users table
    await supabase.from("users").update({
      ...(body.owner_name && { full_name: body.owner_name }),
      ...(body.phone && { phone: body.phone }),
    }).eq("id", user.id);

    return NextResponse.json({ success: true, profile_completed: isComplete });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
