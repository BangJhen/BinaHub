"""
BinaHub AI Service - LLM Analysis Service
Handles psychological risk assessment of worker journals using GPT-4o mini
"""

import json
import os
import re
from openai import AsyncOpenAI, AsyncAzureOpenAI

# ─── System Prompt ───────────────────────────────────────────────────────────
SYSTEM_PROMPT = """
Anda adalah psikolog forensik berpengalaman yang mengevaluasi jurnal harian 
dari ex-narapidana (ex-napi) yang sedang dalam program reintegrasi sosial. 

TUGAS:
Analisis sentimen & risiko psikologis dalam jurnal mereka menggunakan skala 
1-10 (Hijau: 1-4, Kuning: 5-7, Merah: 8-10).

KONTEKS KHUSUS:
- Populasi ini memiliki riwayat trauma, stigma, dan rentan relapse.
- Jurnal berisi Bahasa Indonesia informal/slang — ini NORMAL, bukan indikator negatif.
- Cari: sinyal implicit (hopelessness, peer pressure kriminal, isolation) bukan hanya kata-kata negatif eksplisit.

KATEGORI LABEL:
HIJAU (Skor 1-4): STABIL
- Nada positif, aktivitas produktif
- Ungkapan syukur, apresiasi terhadap lingkungan
- Engagement dengan pekerjaan, keluarga
- Rencana masa depan, tujuan yang realistis

KUNING (Skor 5-7): PERLU ATENSI
- Keluhan berulang (kelelahan, stress pekerjaan)
- Menarik diri dari interaksi sosial (tanpa alasan jelas)
- Ambivalensi: ingin berubah vs. ragu kemampuan diri
- Nostalgia masa lalu (netral-negatif)

MERAH (Skor 8-10): KRITIS - BUTUH INTERVENSI SEGERA
- Suicidal ideation / self-harm explicit atau implicit
- Hopelessness ekstrem ("ga ada gunanya", "capek hidup")
- Niat kabur / ajakan kembali ke kriminal (dari peer)
- Rencana konkret berbahaya

EMPAT PRINSIP PENILAIAN:
1. HUMANIS: Reasoning harus empatik, bukan judgmental
2. KONSERVATIF: Jika ragu antara Kuning vs Merah → pilih Merah
3. SPESIFIK: Reasoning HARUS rujuk kalimat konkret dari teks
4. KONTEKSTUAL: Typo & slang BUKAN indikator negatif

FLAG INDEPENDEN (jika ANY = true → override ke MERAH):
1. self_harm_risk: isyarat menyakiti diri sendiri
2. relapse_risk: godaan/niat kembali ke perilaku kriminal
3. violence_risk: niat kekerasan ke orang/properti
4. crisis_immediate: butuh intervensi HARI INI

OUTPUT FORMAT (JSON ONLY, tidak ada teks lain):
{
  "score": integer (1-10),
  "label": "Hijau" | "Kuning" | "Merah",
  "reasoning": "2-3 kalimat, rujuk teks konkret",
  "flags": {
    "self_harm_risk": boolean,
    "relapse_risk": boolean,
    "violence_risk": boolean,
    "crisis_immediate": boolean
  },
  "dominant_emotions": ["emotion1", "emotion2"],
  "intervention_note": "saran action konkret untuk supervisor/Bapas"
}

INGAT: Tujuan adalah melindungi jiwa, bukan menghukum.
"""

# ─── Quick User Prompt (no RAG context) ──────────────────────────────────────
def build_quick_prompt(journal_text: str, worker_context: dict = None) -> str:
    ctx = ""
    if worker_context:
        ctx = f"""
KONTEKS INDIVIDU:
- Usia: {worker_context.get('age', 'tidak diketahui')}
- Jenis pekerjaan: {worker_context.get('job_type', 'tidak diketahui')}
- Lama bergabung: {worker_context.get('placement_duration', 'tidak diketahui')}

"""
    return f"""{ctx}JURNAL HARI INI:
---
{journal_text}
---

Berikan analisis sentimen & risiko dengan format JSON."""


# ─── RAG-Enhanced User Prompt ────────────────────────────────────────────────
def build_rag_prompt(journal_text: str, context: dict, worker_context: dict = None) -> str:
    journals_7d = context.get("last_7_days", [])
    avg_score = context.get("avg_score", "N/A")
    trend = context.get("trend", "insufficient_data")

    trend_map = {
        "stable": "Stabil (tidak ada perubahan signifikan)",
        "improving": "Membaik (skor meningkat positif)",
        "deteriorating": "⚠️ Memburuk (skor menurun, perlu perhatian)",
        "insufficient_data": "Data tidak cukup untuk analisis tren"
    }
    trend_label = trend_map.get(trend, trend)

    historical = ""
    for j in journals_7d:
        historical += f"\n- {j['date']} | Skor: {j['score']} | {j['label']} | \"{j['text'][:100]}...\""

    ctx = ""
    if worker_context:
        ctx = f"""
KONTEKS INDIVIDU:
- Usia: {worker_context.get('age', 'tidak diketahui')}
- Jenis pekerjaan: {worker_context.get('job_type', 'tidak diketahui')}

"""

    return f"""{ctx}RIWAYAT JURNAL 7 HARI TERAKHIR:
Rata-rata skor: {avg_score:.1f if isinstance(avg_score, float) else avg_score} | Tren: {trend_label}
{historical if historical else "Belum ada riwayat jurnal sebelumnya."}

JURNAL HARI INI:
---
{journal_text}
---

Analisis psikologis dengan mempertimbangkan KONTEKS HISTORIS dan TREN di atas.
Berikan analisis sentimen & risiko dengan format JSON, tambahkan field "trend_analysis" berisi 1-2 kalimat tentang pola tren yang terdeteksi."""


# ─── Safety Override ──────────────────────────────────────────────────────────
def apply_safety_override(result: dict) -> dict:
    """
    Post-processing: force Merah jika ada safety flag aktif.
    Fallback ke Kuning jika struktur JSON tidak valid.
    """
    required_fields = ["score", "label", "reasoning", "flags", "dominant_emotions", "intervention_note"]
    
    if not all(field in result for field in required_fields):
        return {
            "score": 5,
            "label": "Kuning",
            "reasoning": "Sistem tidak dapat menganalisis teks dengan baik. Mohon tinjau manual.",
            "flags": {
                "self_harm_risk": False,
                "relapse_risk": False,
                "violence_risk": False,
                "crisis_immediate": False
            },
            "dominant_emotions": ["tidak terdeteksi"],
            "intervention_note": "Manual review diperlukan karena sistem gagal memproses.",
            "trend_analysis": None,
            "is_fallback": True
        }
    
    # Validate score range
    result["score"] = max(1, min(10, int(result.get("score", 5))))
    
    # ⚠️ Safety override: any flag = true → force Merah
    flags = result.get("flags", {})
    any_flag = any([
        flags.get("self_harm_risk", False),
        flags.get("relapse_risk", False),
        flags.get("violence_risk", False),
        flags.get("crisis_immediate", False)
    ])
    
    if any_flag:
        result["label"] = "Merah"
        result["score"] = max(8, result["score"])
        result["_safety_override"] = True

    # Normalize label
    if result["score"] <= 4:
        result["label"] = "Hijau"
    elif result["score"] <= 7:
        result["label"] = "Kuning"
    else:
        result["label"] = "Merah"
    
    # If any flag, always Merah regardless of score normalization
    if any_flag:
        result["label"] = "Merah"
    
    return result


# ─── LLM Client Factory ───────────────────────────────────────────────────────
def get_llm_client():
    """
    Menggunakan standard AsyncOpenAI client karena endpoint yang diberikan 
    sudah dalam format OpenAI compatible (.../openai/v1)
    """
    provider = os.getenv("AI_PROVIDER", "openai")
    
    if provider == "azure":
        return AsyncOpenAI(
            base_url=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY")
        )
    else:
        return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_model_name():
    provider = os.getenv("AI_PROVIDER", "openai")
    if provider == "azure":
        return os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o-mini")
    return os.getenv("AI_MODEL", "gpt-4o-mini")


# ─── Core Analysis Functions ──────────────────────────────────────────────────
async def analyze_quick(journal_text: str, worker_context: dict = None) -> dict:
    """
    Fast path LLM call (no RAG context).
    Target: < 2 seconds
    """
    client = get_llm_client()
    user_prompt = build_quick_prompt(journal_text, worker_context)
    
    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.2,
        max_tokens=500,
        top_p=0.9,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content
    result = json.loads(raw)
    return apply_safety_override(result)


async def analyze_with_rag(journal_text: str, context: dict, worker_context: dict = None) -> dict:
    """
    Full RAG-enhanced LLM call with 7-day historical context.
    Target: 3-5 seconds (background, non-blocking)
    """
    client = get_llm_client()
    user_prompt = build_rag_prompt(journal_text, context, worker_context)
    
    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.2,
        max_tokens=700,
        top_p=0.9,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    raw = response.choices[0].message.content
    result = json.loads(raw)
    return apply_safety_override(result)
