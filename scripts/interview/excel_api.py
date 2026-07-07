import math
import sys
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse

sys.path.append(str(Path(__file__).resolve().parent))

from import_dirty_excel_to_supabase import (
    DEFAULT_REFERENCE,
    DEFAULT_XLSX,
    load_reference_json,
    normalize_applications,
    normalize_jobs,
    normalize_saved_jobs,
)


app = FastAPI(
    title="BinaHub Dirty Excel Local API",
    description="Local-only FastAPI service for parsing, inspecting, and cleaning messy Excel data without writing to SQL.",
    version="1.0.0",
)


def safe_value(value):
    if value is None:
        return None
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return None
    if pd.isna(value):
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


def records(df: pd.DataFrame):
    return [{k: safe_value(v) for k, v in row.items()} for row in df.to_dict(orient="records")]


def load_workbook(path: Path = DEFAULT_XLSX):
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Excel file not found: {path}")
    return pd.read_excel(path, sheet_name=None)


def cleaned_payload(path: Path = DEFAULT_XLSX, reference_path: Path = DEFAULT_REFERENCE):
    sheets = load_workbook(path)
    umkm_by_email, worker_by_email = load_reference_json(reference_path)
    jobs, rejects = normalize_jobs(sheets["raw_jobs"], umkm_by_email)
    job_id_by_code = {j["_external_job_code"]: f"LOCAL-API-JOB-ID-{i + 1}" for i, j in enumerate(jobs)}
    applications, app_rejects = normalize_applications(sheets["raw_applications"], worker_by_email, job_id_by_code)
    saved_jobs, saved_rejects = normalize_saved_jobs(sheets["raw_saved_jobs"], worker_by_email, job_id_by_code)
    rejects = [*rejects, *app_rejects, *saved_rejects]
    clean_jobs = [{k: v for k, v in row.items() if not k.startswith("_")} for row in jobs]
    return {
        "source_file": str(path),
        "reference_file": str(reference_path),
        "counts": {
            "raw_jobs": len(sheets["raw_jobs"]),
            "raw_applications": len(sheets["raw_applications"]),
            "raw_saved_jobs": len(sheets["raw_saved_jobs"]),
            "clean_jobs": len(clean_jobs),
            "clean_applications": len(applications),
            "clean_saved_jobs": len(saved_jobs),
            "rejected_rows": len(rejects),
        },
        "clean_jobs": clean_jobs,
        "clean_applications": applications,
        "clean_saved_jobs": saved_jobs,
        "rejected_rows": rejects,
    }


@app.middleware("http")
async def local_only(request: Request, call_next):
    client_host = request.client.host if request.client else "unknown"
    if client_host not in {"127.0.0.1", "::1", "localhost"}:
        return JSONResponse(status_code=403, content={"detail": "Local access only"})
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok", "service": "dirty-excel-local-api"}


@app.get("/excel/summary")
def excel_summary():
    sheets = load_workbook()
    payload = cleaned_payload()
    return {
        "file": str(DEFAULT_XLSX),
        "sheets": {name: {"rows": len(df), "columns": list(df.columns)} for name, df in sheets.items()},
        "cleaning_result": payload["counts"],
    }


@app.get("/excel/raw/{sheet_name}")
def raw_sheet(sheet_name: str, limit: int = Query(20, ge=1, le=200), offset: int = Query(0, ge=0)):
    sheets = load_workbook()
    if sheet_name not in sheets:
        raise HTTPException(status_code=404, detail={"available_sheets": list(sheets.keys())})
    df = sheets[sheet_name].iloc[offset : offset + limit]
    return {"sheet": sheet_name, "offset": offset, "limit": limit, "rows": records(df)}


@app.get("/excel/clean/jobs")
def clean_jobs(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = cleaned_payload()["clean_jobs"]
    return {"total": len(rows), "offset": offset, "limit": limit, "rows": rows[offset : offset + limit]}


@app.get("/excel/clean/applications")
def clean_applications(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = cleaned_payload()["clean_applications"]
    return {"total": len(rows), "offset": offset, "limit": limit, "rows": rows[offset : offset + limit]}


@app.get("/excel/clean/saved-jobs")
def clean_saved_jobs(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = cleaned_payload()["clean_saved_jobs"]
    return {"total": len(rows), "offset": offset, "limit": limit, "rows": rows[offset : offset + limit]}


@app.get("/excel/rejects")
def rejects(limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0)):
    rows = cleaned_payload()["rejected_rows"]
    return {"total": len(rows), "offset": offset, "limit": limit, "rows": rows[offset : offset + limit]}


@app.get("/excel/payload")
def payload():
    data = cleaned_payload()
    return {
        "source_file": data["source_file"],
        "reference_file": data["reference_file"],
        "counts": data["counts"],
        "payload": {
            "jobs": data["clean_jobs"],
            "job_applications": data["clean_applications"],
            "saved_jobs": data["clean_saved_jobs"],
        },
        "rejected_rows": data["rejected_rows"],
    }
