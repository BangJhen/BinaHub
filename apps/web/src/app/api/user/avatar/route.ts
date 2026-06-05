import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ avatar_url: null });

    const role = user.user_metadata?.role;
    let avatar_url: string | null = null;

    if (role === "worker") {
      const { data } = await supabase
        .from("worker_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();
      avatar_url = data?.avatar_url ?? null;
    } else if (role === "umkm") {
      const { data } = await supabase
        .from("umkm_profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();
      avatar_url = data?.avatar_url ?? null;
    }

    return NextResponse.json({ avatar_url });
  } catch {
    return NextResponse.json({ avatar_url: null });
  }
}
