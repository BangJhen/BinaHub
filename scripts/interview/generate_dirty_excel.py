from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "data" / "interview" / "raw" / "dirty_bina_job_pipeline.xlsx"


UMKMS = [
    ("yasernurtaxiano@gmail.com", "Toko Palsnups"),
    ("snapsnipsnup@gmail.com", "toko palsnip"),
    ("abrar266@gmail.com", "Toko abrar jaya"),
    ("umkm.surya@binahub.id", "UMKM Surya Pangan"),
    ("umkm.kriya@binahub.id", "UMKM Kriya Nusantara"),
    ("umkm.segara@binahub.id", "UMKM Segara Retail"),
]

WORKERS = [
    "prabowo@gmail.com",
    "jhenerar21@gmail.com",
    "ammarridho66@gmail.com",
    "yashanathaniel26@gmail.com",
    "worker.andi@binahub.id",
    "worker.budi@binahub.id",
    "worker.citra@binahub.id",
    "worker.deni@binahub.id",
    "worker.eka@binahub.id",
    "worker.fajar@binahub.id",
]


def dirty_jobs():
    templates = [
        ("Kasir Shift Pagi", "Melayani pelanggan dan input transaksi POS", "Jujur, teliti, ramah", "full_time", "Bandung", "Rp 2.500.000", "3.200.000", "open", "2026-07-01", "kasir; POS ; customer service", "makan siang, BPJS", "SMA/SMK", "0-1 tahun", "20-35"),
        ("Staf Gudang", "Menerima barang, packing, stok opname", "Kuat fisik, rapi", "Kontrak", "Jakarta", "2.8jt", "Rp3.600.000", "Terbit", "01/07/2026", "gudang|packing|stok", "transport; makan", "SMA", "1 tahun", "22 - 40"),
        ("Admin Excel", "Input data penjualan harian", "Bisa Excel dasar", "part_time", "Depok", "1,800,000", "2500000", "OPEN", "2026/07/02", "Excel, Administrasi, Input Data", "fleksibel", "SMA/SMK", "fresh graduate", "18-30"),
        ("Kurir Motor", "Pengiriman barang area kota", "Punya SIM C", "full_time", "Bekasi", "Rp 2 jt", "Rp 3 jt", "dibuka", "2 Juli 2026", "Kurir; SIM C; Navigasi", "bonus target", "SMA", "0-2 tahun", "20-38"),
        ("Helper Produksi", "Bantu proses produksi makanan", "Disiplin dan bersih", "contract", "Bogor", "2300000", "2800000", "draft", "", "Produksi, Kebersihan", "seragam", "SMP", "tidak wajib", "18-45"),
        ("Customer Service Online", "Balas chat pelanggan marketplace", "Komunikatif", "full_time", "Surabaya", "Rp 2.700.000", "Rp 3.500.000", "open", "2026-07-05 09:00", "customer service / marketplace / komunikasi", "internet allowance", "SMA/SMK", "1-2 tahun", "20-35"),
    ]
    rows = []
    for i in range(18):
        umkm_email, _ = UMKMS[i % len(UMKMS)]
        t = templates[i % len(templates)]
        rows.append({
            "external_job_code": f"JOB-{i+1:03d}",
            "umkm_email": ("  " + umkm_email.upper() + "  ") if i % 4 == 0 else umkm_email,
            "title": t[0] if i != 7 else "   " + t[0].lower() + "   ",
            "description": t[1] if i != 10 else "",
            "requirements": t[2],
            "employment_type": t[3],
            "location": t[4] if i != 13 else None,
            "salary_min": t[5],
            "salary_max": t[6],
            "status": t[7],
            "published_at": t[8],
            "skills": t[9],
            "benefits": t[10],
            "education_level": t[11],
            "experience_required": t[12],
            "age_range": t[13],
        })
    rows.append(rows[2].copy())
    rows[-1]["title"] = "Admin Excel Duplicate Row"
    rows.append({
        "external_job_code": "JOB-BAD-UMKM",
        "umkm_email": "not.registered.umkm@example.com",
        "title": "Lowongan Invalid UMKM",
        "description": "Harus masuk reject report",
        "requirements": "-",
        "employment_type": "full_time",
        "location": "Bandung",
        "salary_min": "abc",
        "salary_max": "xyz",
        "status": "open",
        "published_at": "not a date",
        "skills": "unknown",
        "benefits": "-",
        "education_level": "SMA",
        "experience_required": "-",
        "age_range": "-",
    })
    return pd.DataFrame(rows)


def dirty_applications():
    rows = []
    statuses = ["submitted", "reviewed", "Diterima", "ditolak", "withdrawn", "SUBMITTED"]
    for i in range(42):
        rows.append({
            "external_job_code": f"JOB-{(i % 18) + 1:03d}",
            "worker_email": (" " + WORKERS[i % len(WORKERS)].upper() + " ") if i % 5 == 0 else WORKERS[i % len(WORKERS)],
            "cover_letter": "Saya siap bekerja, disiplin, dan ingin berkontribusi." if i % 7 else None,
            "status": statuses[i % len(statuses)],
            "applied_at": ["2026-07-03", "03/07/2026", "2026/07/04 10:15", "4 Juli 2026"][i % 4],
        })
    rows.append({
        "external_job_code": "JOB-999",
        "worker_email": WORKERS[0],
        "cover_letter": "Job code tidak ada, harus reject.",
        "status": "submitted",
        "applied_at": "2026-07-06",
    })
    rows.append({
        "external_job_code": "JOB-001",
        "worker_email": "ghost.worker@example.com",
        "cover_letter": "Worker tidak ada, harus reject.",
        "status": "submitted",
        "applied_at": "2026-07-06",
    })
    return pd.DataFrame(rows)


def dirty_saved_jobs():
    rows = []
    for i in range(25):
        rows.append({
            "external_job_code": f"JOB-{(i % 18) + 1:03d}",
            "worker_email": WORKERS[(i * 3) % len(WORKERS)],
            "saved_at": ["2026-07-01", "01/07/2026", "2026/07/02"][i % 3],
        })
    rows.append({"external_job_code": "JOB-404", "worker_email": WORKERS[1], "saved_at": "bad date"})
    return pd.DataFrame(rows)


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    readme = pd.DataFrame([
        {"catatan": "File ini sengaja kotor untuk demo cleansing Excel ke SQL/API."},
        {"catatan": "Contoh masalah: email spasi/kapital, salary campur, tanggal campur, duplicate, FK invalid."},
        {"catatan": "Jalankan importer dengan --dry-run dulu, lalu --commit untuk insert ke Supabase."},
    ])
    with pd.ExcelWriter(OUT, engine="openpyxl") as writer:
        readme.to_excel(writer, sheet_name="README", index=False)
        dirty_jobs().to_excel(writer, sheet_name="raw_jobs", index=False)
        dirty_applications().to_excel(writer, sheet_name="raw_applications", index=False)
        dirty_saved_jobs().to_excel(writer, sheet_name="raw_saved_jobs", index=False)
    print(OUT)


if __name__ == "__main__":
    main()
