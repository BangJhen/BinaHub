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

## FastAPI lokal dari file Excel kotor

Skenario ini **berbeda** dari Excel ke SQL. API ini hanya membaca file Excel kotor secara lokal, melakukan parsing/cleansing di memory, lalu mengembalikan hasilnya sebagai JSON.

Install dependency dan jalankan server lokal:

```bash
python3 -m venv .venv_interview
.venv_interview/bin/python -m pip install -r scripts/interview/requirements.txt
.venv_interview/bin/uvicorn scripts.interview.excel_api:app --host 127.0.0.1 --port 8008 --reload
```

Endpoint demo:

```bash
curl http://127.0.0.1:8008/health
curl http://127.0.0.1:8008/excel/summary
curl "http://127.0.0.1:8008/excel/raw/raw_jobs?limit=5"
curl "http://127.0.0.1:8008/excel/clean/jobs?limit=5"
curl "http://127.0.0.1:8008/excel/rejects"
curl http://127.0.0.1:8008/excel/payload
```

Local-only guard aktif: request dari host selain `127.0.0.1`, `::1`, atau `localhost` akan ditolak `403`.

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
