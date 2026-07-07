from pathlib import Path

import pandas as pd

from import_dirty_excel_to_supabase import (
    DEFAULT_REFERENCE,
    DEFAULT_XLSX,
    OUT_DIR,
    load_reference_json,
    normalize_applications,
    normalize_jobs,
    normalize_saved_jobs,
)


SQL_OUT = OUT_DIR / "load_cleaned_excel_payload.sql"


def lit(v):
    if v is None or (isinstance(v, float) and pd.isna(v)):
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


def arr(values):
    if not values:
        return "ARRAY[]::text[]"
    return "ARRAY[" + ", ".join(lit(v) for v in values) + "]::text[]"


def main():
    sheets = pd.read_excel(DEFAULT_XLSX, sheet_name=None)
    umkm_by_email, worker_by_email = load_reference_json(DEFAULT_REFERENCE)
    jobs, rejects = normalize_jobs(sheets["raw_jobs"], umkm_by_email)
    job_id_by_code = {j["_external_job_code"]: j["_external_job_code"] for j in jobs}
    apps, app_rejects = normalize_applications(sheets["raw_applications"], worker_by_email, job_id_by_code)
    saved, saved_rejects = normalize_saved_jobs(sheets["raw_saved_jobs"], worker_by_email, job_id_by_code)
    rejects.extend(app_rejects)
    rejects.extend(saved_rejects)

    lines = [
        "BEGIN;",
        "CREATE TEMP TABLE _pipeline_job_map (external_job_code text PRIMARY KEY, id uuid NOT NULL) ON COMMIT DROP;",
    ]
    for j in jobs:
        lines.append(f"INSERT INTO _pipeline_job_map VALUES ({lit(j['_external_job_code'])}, gen_random_uuid());")

    lines.append("\n-- Insert normalized jobs")
    for j in jobs:
        lines.append(
            "INSERT INTO public.jobs (id, umkm_id, title, description, requirements, employment_type, location, salary_min, salary_max, status, published_at, skills, benefits, education_level, experience_required, age_range) VALUES ("
            f"(SELECT id FROM _pipeline_job_map WHERE external_job_code = {lit(j['_external_job_code'])}), "
            f"{lit(j['umkm_id'])}::uuid, {lit(j['title'])}, {lit(j['description'])}, {lit(j['requirements'])}, {lit(j['employment_type'])}, {lit(j['location'])}, "
            f"{lit(j['salary_min'])}, {lit(j['salary_max'])}, {lit(j['status'])}::job_status, {lit(j['published_at'])}::timestamptz, "
            f"{arr(j['skills'])}, {arr(j['benefits'])}, {lit(j['education_level'])}, {lit(j['experience_required'])}, {lit(j['age_range'])}"
            ");"
        )

    lines.append("\n-- Insert normalized applications")
    for a in apps:
        lines.append(
            "INSERT INTO public.job_applications (job_id, worker_id, cover_letter, status, applied_at) VALUES ("
            f"(SELECT id FROM _pipeline_job_map WHERE external_job_code = {lit(a['job_id'])}), "
            f"{lit(a['worker_id'])}::uuid, {lit(a['cover_letter'])}, {lit(a['status'])}::application_status, {lit(a['applied_at'])}::timestamptz"
            ");"
        )

    lines.append("\n-- Insert normalized saved jobs")
    for s in saved:
        lines.append(
            "INSERT INTO public.saved_jobs (job_id, worker_id, created_at) VALUES ("
            f"(SELECT id FROM _pipeline_job_map WHERE external_job_code = {lit(s['job_id'])}), "
            f"{lit(s['worker_id'])}::uuid, {lit(s['created_at'])}::timestamptz"
            ");"
        )

    lines.extend([
        "COMMIT;",
        "",
        f"-- Clean jobs: {len(jobs)}",
        f"-- Clean applications: {len(apps)}",
        f"-- Clean saved_jobs: {len(saved)}",
        f"-- Rejected rows: {len(rejects)}",
    ])
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    SQL_OUT.write_text("\n".join(lines), encoding="utf-8")
    print(SQL_OUT)


if __name__ == "__main__":
    main()
