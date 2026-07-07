import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_XLSX = ROOT / "data" / "interview" / "raw" / "dirty_bina_job_pipeline.xlsx"
DEFAULT_REFERENCE = ROOT / "data" / "interview" / "raw" / "reference_users.json"
OUT_DIR = ROOT / "data" / "interview" / "output"


STATUS_JOB = {"open": "open", "opened": "open", "terbit": "open", "dibuka": "open", "draft": "draft", "closed": "closed", "tutup": "closed", "cancelled": "cancelled"}
STATUS_APP = {"submitted": "submitted", "reviewed": "reviewed", "diterima": "accepted", "accepted": "accepted", "ditolak": "rejected", "rejected": "rejected", "withdrawn": "withdrawn"}


def norm_text(v):
    if pd.isna(v):
        return None
    s = re.sub(r"\s+", " ", str(v).strip())
    return s or None


def norm_email(v):
    s = norm_text(v)
    return s.lower() if s else None


def split_list(v):
    s = norm_text(v)
    if not s or s == "-":
        return []
    parts = re.split(r"[,;|/]", s)
    return sorted({p.strip().title() for p in parts if p.strip() and p.strip() != "-"})


def parse_money(v):
    s = norm_text(v)
    if not s:
        return None
    raw = s.lower().replace("rp", "").replace(" ", "").replace(",", ".")
    if "jt" in raw or "juta" in raw:
        raw = raw.replace("juta", "").replace("jt", "")
        return int(float(raw) * 1_000_000)
    digits = re.sub(r"[^0-9]", "", raw)
    return int(digits) if digits else None


def parse_date(v):
    s = norm_text(v)
    if not s:
        return None
    months = {"januari": "01", "februari": "02", "maret": "03", "april": "04", "mei": "05", "juni": "06", "juli": "07", "agustus": "08", "september": "09", "oktober": "10", "november": "11", "desember": "12"}
    lowered = s.lower()
    for name, num in months.items():
        lowered = lowered.replace(name, num)
    for dayfirst in (False, True):
        dt = pd.to_datetime(lowered, errors="coerce", dayfirst=dayfirst)
        if pd.notna(dt):
            if getattr(dt, "tzinfo", None) is None:
                dt = dt.tz_localize(timezone.utc)
            return dt.isoformat()
    return None


class SupabaseRest:
    def __init__(self, url, key):
        self.url = url.rstrip("/")
        self.headers = {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

    def get(self, table, select="*", **filters):
        params = {"select": select, **filters}
        qs = urllib.parse.urlencode(params)
        return self._request("GET", f"/rest/v1/{table}?{qs}")

    def insert(self, table, rows):
        if not rows:
            return []
        headers = {**self.headers, "Prefer": "return=representation"}
        return self._request("POST", f"/rest/v1/{table}", rows, headers=headers)

    def _request(self, method, path, body=None, headers=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request(self.url + path, data=data, method=method, headers=headers or self.headers)
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                payload = res.read().decode()
                return json.loads(payload) if payload else []
        except urllib.error.HTTPError as e:
            detail = e.read().decode()
            raise RuntimeError(f"Supabase {method} {path} failed: {e.code} {detail}") from e


def normalize_jobs(df, umkm_by_email):
    clean, rejects, seen = [], [], set()
    for i, row in df.iterrows():
        code = norm_text(row.get("external_job_code"))
        email = norm_email(row.get("umkm_email"))
        title = norm_text(row.get("title"))
        if not code or code in seen:
            rejects.append({"sheet": "raw_jobs", "row": i + 2, "reason": "missing_or_duplicate_external_job_code", "code": code})
            continue
        seen.add(code)
        if email not in umkm_by_email:
            rejects.append({"sheet": "raw_jobs", "row": i + 2, "reason": "umkm_email_not_found", "code": code, "email": email})
            continue
        if not title:
            rejects.append({"sheet": "raw_jobs", "row": i + 2, "reason": "missing_title", "code": code})
            continue
        salary_min, salary_max = parse_money(row.get("salary_min")), parse_money(row.get("salary_max"))
        if salary_min and salary_max and salary_min > salary_max:
            salary_min, salary_max = salary_max, salary_min
        status = STATUS_JOB.get((norm_text(row.get("status")) or "draft").lower(), "draft")
        clean.append({
            "_external_job_code": code,
            "umkm_id": umkm_by_email[email],
            "title": title.title(),
            "description": norm_text(row.get("description")) or "Deskripsi belum lengkap dari file Excel mentah.",
            "requirements": norm_text(row.get("requirements")),
            "employment_type": (norm_text(row.get("employment_type")) or "full_time").lower().replace("kontrak", "contract"),
            "location": norm_text(row.get("location")) or "Belum ditentukan",
            "salary_min": salary_min,
            "salary_max": salary_max,
            "status": status,
            "published_at": parse_date(row.get("published_at")) if status == "open" else None,
            "skills": split_list(row.get("skills")),
            "benefits": split_list(row.get("benefits")),
            "education_level": norm_text(row.get("education_level")),
            "experience_required": norm_text(row.get("experience_required")),
            "age_range": norm_text(row.get("age_range")),
        })
    return clean, rejects


def normalize_applications(df, worker_by_email, job_id_by_code):
    clean, rejects, seen = [], [], set()
    for i, row in df.iterrows():
        code, email = norm_text(row.get("external_job_code")), norm_email(row.get("worker_email"))
        key = (code, email)
        if key in seen:
            rejects.append({"sheet": "raw_applications", "row": i + 2, "reason": "duplicate_application", "code": code, "email": email})
            continue
        seen.add(key)
        if code not in job_id_by_code:
            rejects.append({"sheet": "raw_applications", "row": i + 2, "reason": "job_code_not_found", "code": code, "email": email})
            continue
        if email not in worker_by_email:
            rejects.append({"sheet": "raw_applications", "row": i + 2, "reason": "worker_email_not_found", "code": code, "email": email})
            continue
        status = STATUS_APP.get((norm_text(row.get("status")) or "submitted").lower(), "submitted")
        clean.append({
            "job_id": job_id_by_code[code],
            "worker_id": worker_by_email[email],
            "cover_letter": norm_text(row.get("cover_letter")) or "Cover letter kosong di Excel; diisi default oleh pipeline.",
            "status": status,
            "applied_at": parse_date(row.get("applied_at")) or datetime.now(timezone.utc).isoformat(),
        })
    return clean, rejects


def normalize_saved_jobs(df, worker_by_email, job_id_by_code):
    clean, rejects, seen = [], [], set()
    for i, row in df.iterrows():
        code, email = norm_text(row.get("external_job_code")), norm_email(row.get("worker_email"))
        key = (code, email)
        if key in seen:
            continue
        seen.add(key)
        if code not in job_id_by_code:
            rejects.append({"sheet": "raw_saved_jobs", "row": i + 2, "reason": "job_code_not_found", "code": code, "email": email})
            continue
        if email not in worker_by_email:
            rejects.append({"sheet": "raw_saved_jobs", "row": i + 2, "reason": "worker_email_not_found", "code": code, "email": email})
            continue
        clean.append({"job_id": job_id_by_code[code], "worker_id": worker_by_email[email], "created_at": parse_date(row.get("saved_at")) or datetime.now(timezone.utc).isoformat()})
    return clean, rejects


def load_reference_data(api):
    users = api.get("users", select="id,email,role")
    umkm = {u["email"].lower(): u["id"] for u in users if u["role"] == "umkm" and u.get("email")}
    worker = {u["email"].lower(): u["id"] for u in users if u["role"] == "worker" and u.get("email")}
    return umkm, worker


def load_reference_json(path):
    users = json.loads(Path(path).read_text(encoding="utf-8"))
    umkm = {u["email"].lower(): u["id"] for u in users if u["role"] == "umkm" and u.get("email")}
    worker = {u["email"].lower(): u["id"] for u in users if u["role"] == "worker" and u.get("email")}
    return umkm, worker


def main():
    parser = argparse.ArgumentParser(description="Clean dirty BinaHub Excel and push to Supabase REST API.")
    parser.add_argument("--file", default=str(DEFAULT_XLSX))
    parser.add_argument("--reference-json", default=str(DEFAULT_REFERENCE), help="Offline user reference for --dry-run without Supabase credentials.")
    parser.add_argument("--commit", action="store_true", help="Insert cleaned rows into Supabase. Default is dry-run only.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and write report without inserting.")
    args = parser.parse_args()

    url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if args.commit and (not url or not key):
        print("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY", file=sys.stderr)
        sys.exit(2)

    xlsx = Path(args.file)
    sheets = pd.read_excel(xlsx, sheet_name=None)
    api = SupabaseRest(url, key) if url and key else None
    umkm_by_email, worker_by_email = load_reference_data(api) if api else load_reference_json(args.reference_json)

    jobs, rejects = normalize_jobs(sheets["raw_jobs"], umkm_by_email)
    report = {"source_file": str(xlsx), "dry_run": not args.commit, "counts": {}, "rejects": []}

    if args.commit:
        jobs_payload = [{k: v for k, v in j.items() if not k.startswith("_")} for j in jobs]
        inserted_jobs = api.insert("jobs", jobs_payload)
        job_id_by_code = {jobs[i]["_external_job_code"]: inserted_jobs[i]["id"] for i in range(len(inserted_jobs))}
    else:
        job_id_by_code = {j["_external_job_code"]: f"DRY-RUN-JOB-ID-{i+1}" for i, j in enumerate(jobs)}

    apps, app_rejects = normalize_applications(sheets["raw_applications"], worker_by_email, job_id_by_code)
    saved, saved_rejects = normalize_saved_jobs(sheets["raw_saved_jobs"], worker_by_email, job_id_by_code)
    rejects.extend(app_rejects)
    rejects.extend(saved_rejects)

    if args.commit:
        api.insert("job_applications", apps)
        api.insert("saved_jobs", saved)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    report["counts"] = {"jobs_clean": len(jobs), "applications_clean": len(apps), "saved_jobs_clean": len(saved), "rejected_rows": len(rejects)}
    report["rejects"] = rejects
    (OUT_DIR / "pipeline_run_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    with pd.ExcelWriter(OUT_DIR / "cleaned_preview.xlsx", engine="openpyxl") as writer:
        pd.DataFrame([{k: v for k, v in row.items() if not k.startswith("_")} for row in jobs]).to_excel(writer, sheet_name="clean_jobs", index=False)
        pd.DataFrame(apps).to_excel(writer, sheet_name="clean_applications", index=False)
        pd.DataFrame(saved).to_excel(writer, sheet_name="clean_saved_jobs", index=False)
        pd.DataFrame(rejects).to_excel(writer, sheet_name="rejected_rows", index=False)
    print(json.dumps(report["counts"], indent=2))
    print(f"Report: {OUT_DIR / 'pipeline_run_report.json'}")
    print(f"Preview: {OUT_DIR / 'cleaned_preview.xlsx'}")


if __name__ == "__main__":
    main()
