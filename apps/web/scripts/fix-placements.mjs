import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "frontend", ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data: apps } = await supabase
    .from("job_applications")
    .select("*, jobs(umkm_id)")
    .eq("status", "accepted");

  for (const app of apps || []) {
    const { data: placement } = await supabase
      .from("placements")
      .select("*")
      .eq("application_id", app.id)
      .maybeSingle();

    if (!placement) {
      console.log(`Fixing missing placement for application ${app.id}...`);
      await supabase.from("placements").insert({
        worker_id: app.worker_id,
        umkm_id: app.jobs.umkm_id,
        job_id: app.job_id,
        application_id: app.id,
        start_date: new Date().toISOString().split('T')[0],
        status: "active"
      });
    }
  }
  console.log("Done fixing.");
}

fix();
