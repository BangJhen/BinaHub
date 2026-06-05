import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Find Robyn Sanjaya
    const { data: worker, error: workerErr } = await supabase
      .from("users")
      .select("id")
      .ilike("full_name", "%Robyn%")
      .limit(1)
      .single();
      
    if (workerErr || !worker) {
      return NextResponse.json({ message: "Worker Robyn not found" }, { status: 404 });
    }

    // Find their active placement to get UMKM ID
    const { data: placement, error: placeErr } = await supabase
      .from("placements")
      .select("umkm_id")
      .eq("worker_id", worker.id)
      .eq("status", "active")
      .limit(1)
      .single();

    if (placeErr || !placement) {
      return NextResponse.json({ message: "Placement not found for Robyn" }, { status: 404 });
    }

    const umkmId = placement.umkm_id;
    const workerId = worker.id;

    const dummyTasks = [
      { title: "Rapikan gudang belakang", description: "Susun barang baru sesuai abjad", status: "todo", priority: "high", location: "Gudang Belakang" },
      { title: "Cek stok minimarket", description: "Hitung sisa mie instan", status: "todo", priority: "medium", location: "Rak Depan" },
      { title: "Bersihkan area kasir", description: "Sapu dan pel", status: "todo", priority: "low", location: "Kasir" },
      { title: "Input data barang masuk", description: "Masukkan ke sistem POS", status: "todo", priority: "high", location: "Office" },
      { title: "Siapkan pesanan online", description: "Packing 5 pesanan GoFood", status: "waiting_approval", priority: "high", proof_text: "Sudah dipacking dan diserahkan ke driver." },
      { title: "Buang sampah", description: "Buang sampah kering dan basah", status: "waiting_approval", priority: "low", proof_text: "Tong sampah sudah kosong dan plastik diganti." },
      { title: "Update label harga", description: "Ganti label harga promo di rak A", status: "waiting_approval", priority: "medium", proof_text: "Semua label kuning sudah terpasang." },
      { title: "Laporan harian", description: "Buat laporan shift pagi", status: "approved", priority: "high", proof_text: "Laporan terlampir.", feedback: "Bagus, laporannya lengkap." },
      { title: "Cek suhu chiller", description: "Pastikan suhu chiller daging stabil di -4C", status: "approved", priority: "medium", proof_text: "Suhu saat ini -4.5C.", feedback: "Sip, pertahankan." },
      { title: "Bersihkan kaca depan", description: "Lap kaca depan toko", status: "approved", priority: "low", proof_text: "Sudah dibersihkan.", feedback: "Terima kasih, sangat bersih." },
      { title: "Hitung uang kas", description: "Setor uang kas shift malam", status: "rejected", priority: "high", proof_text: "Sudah dihitung, total 2jt.", feedback: "Ada selisih 50rb, tolong dihitung ulang dengan teliti." },
      { title: "Tata display promo", description: "Susun barang promo di depan pintu", status: "rejected", priority: "medium", proof_text: "Sudah disusun menyamping.", feedback: "Salah susun, tolong lihat panduan plano." },
      { title: "Pel lantai area sayur", description: "Pastikan lantai tidak licin", status: "todo", priority: "medium", location: "Area Sayur" },
      { title: "Cek expired date", description: "Pisahkan produk yang expired bulan ini", status: "todo", priority: "high", location: "Seluruh Rak" },
      { title: "Rapikan troli", description: "Kumpulkan troli di depan toko", status: "todo", priority: "low", location: "Parkiran" },
    ];

    const tasksToInsert = dummyTasks.map(t => ({
      ...t,
      umkm_id: umkmId,
      worker_id: workerId,
      due_date: new Date().toISOString().split('T')[0]
    }));

    const { error: insertErr } = await supabase.from("tasks").insert(tasksToInsert);

    if (insertErr) {
      return NextResponse.json({ message: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Successfully generated 15 dummy tasks for Robyn", tasks_inserted: 15 });

  } catch (error) {
    console.error("Generate tasks error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
