# BinaHub Interview Data Pipeline

Pipeline ini dibuat untuk demo **Poin 4 interview: normalisasi Excel kotor ke SQL/API dengan Python**.

## File yang dibuat

- `generate_dirty_excel.py` — membuat file Excel mentah/kotor.
- `import_dirty_excel_to_supabase.py` — membaca Excel, membersihkan data, validasi FK user/job, lalu push ke Supabase REST API.
- `requirements.txt` — dependency Python minimal.

## Cara demo

```bash
python3 scripts/interview/generate_dirty_excel.py
python3 scripts/interview/import_dirty_excel_to_supabase.py --dry-run
python3 scripts/interview/import_dirty_excel_to_supabase.py --commit
```

Untuk `--commit`, siapkan environment variable:

```bash
export SUPABASE_URL="https://<project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
```

## Data yang diproses

- Sheet `raw_jobs`: data lowongan dari UMKM.
- Sheet `raw_applications`: data lamaran worker ke lowongan.
- Sheet `raw_saved_jobs`: data bookmark lowongan oleh worker.

Pipeline sengaja memasukkan data kotor: email kapital/spasi, salary format campur (`Rp 3.000.000`, `2.5jt`), status campur bahasa, tanggal campur format, duplicate row, dan row invalid. Importer akan membersihkan, menormalisasi, lalu membuat reject report.
