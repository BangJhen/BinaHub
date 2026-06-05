import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) return NextResponse.json({ message: "Tidak ada file yang dikirim" }, { status: 400 });

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Format file tidak didukung. Gunakan JPG, PNG, atau WebP." }, { status: 400 });
    }

    // Validate file size (max 2MB)
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ message: "Ukuran file terlalu besar. Maksimal 2MB." }, { status: 400 });
    }

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filePath = `${user.id}/avatar.${ext}`;

    // Convert File to ArrayBuffer then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage (upsert to replace existing)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) return NextResponse.json({ message: uploadError.message }, { status: 500 });

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Add cache-busting timestamp to URL
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    // Determine role and update the correct profile table
    const role = user.user_metadata?.role;
    if (role === "worker") {
      await supabase.from("worker_profiles").upsert({ user_id: user.id, avatar_url: avatarUrl }, { onConflict: "user_id" });
    } else if (role === "umkm") {
      await supabase.from("umkm_profiles").upsert({ user_id: user.id, avatar_url: avatarUrl }, { onConflict: "user_id" });
    }

    return NextResponse.json({ success: true, avatar_url: avatarUrl });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
