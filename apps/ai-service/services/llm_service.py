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
Anda adalah psikolog klinis yang menganalisis jurnal harian peserta program 
reintegrasi sosial. Tugas Anda adalah membaca jurnal dan memberikan penilaian 
kesejahteraan psikologis secara objektif dan humanis.

PEDOMAN ANALISIS SKOR:
Skor 1-10, semakin tinggi semakin perlu intervensi:
- SKOR 1-4 (Hijau): Stabil & positif. Jurnal menunjukkan rasa syukur, produktivitas, optimisme, engagement. TIDAK ada indikator negatif signifikan.
- SKOR 5-7 (Kuning): Perlu atensi. Ada keluhan kelelahan, stres kerja, ambivalensi, atau nostalgia negatif. Tapi belum ada sinyal bahaya serius.
- SKOR 8-10 (Merah): Kritis. Ada indikasi putus asa ekstrem, tekanan teman untuk kriminal, isolasi berat, atau niat menyakiti diri.

CONTOH: "Senang hari ini kerja beres" → skor 1-2 (Hijau).
CONTOH: "Capek tapi bersyukur" → skor 3-4 (Hijau).
CONTOH: "Lelah, bingung masa depan" → skor 5-7 (Kuning).
CONTOH: "Ga ada gunanya hidup" → skor 8-10 (Merah).

KONTEKS:
- Peserta adalah individu dalam program reintegrasi dengan latar belakang berbeda.
- Jurnal bisa berisi Bahasa Indonesia informal/slang — ini normal, bukan indikator negatif.

PRINSIP:
1. Humanis dan empatik dalam reasoning
2. Reasoning HARUS merujuk kalimat konkret dari jurnal
3. Jika jurnal TIDAK menunjukkan indikator negatif → skor rendah (1-4) meskipun pendek
4. Typo dan slang bukan indikator negatif

FLAG KEAMANAN (jika salah satu true → label otomatis Merah):
1. self_harm_risk: isyarat menyakiti diri
2. relapse_risk: godaan kembali ke perilaku bermasalah
3. violence_risk: niat kekerasan
4. crisis_immediate: butuh intervensi hari ini

OUTPUT FORMAT (JSON ONLY):
{
  "score": integer 1-10,
  "label": "Hijau" | "Kuning" | "Merah",
  "reasoning": "2-3 kalimat, rujuk teks konkret",
  "flags": {
    "self_harm_risk": boolean,
    "relapse_risk": boolean,
    "violence_risk": boolean,
    "crisis_immediate": boolean
  },
  "dominant_emotions": ["emo1", "emo2"],
  "intervention_note": "saran konkret"
}

INGAT: Anda alat bantu, bukan hakim. Bersikaplah suportif dan konstruktif.
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

    avg_display = f"{avg_score:.1f}" if isinstance(avg_score, (int, float)) else str(avg_score)
    return f"""{ctx}RIWAYAT JURNAL 7 HARI TERAKHIR:
Rata-rata skor: {avg_display} | Tren: {trend_label}
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


# ─── Question Generation Prompt ──────────────────────────────────────────────
QUESTION_SYSTEM_PROMPT = """
Anda adalah asisten yang membuat pertanyaan reflektif harian untuk pekerja 
reintegrasi sosial. Tugas Anda menghasilkan 3 pertanyaan singkat dalam Bahasa 
Indonesia yang natural, hangat, dan personal.

KETENTUAN:
- Setiap pertanyaan maksimal 20 kata
- Variatif, tidak monoton
- Bersifat membuka percakapan (open-ended)
- Fokus pada: perasaan, pekerjaan, relasi sosial, atau harapan
- Jangan mengulang pertanyaan yang sama dari sesi sebelumnya

OUTPUT FORMAT (JSON ONLY):
{
  "questions": [
    "pertanyaan 1?",
    "pertanyaan 2?",
    "pertanyaan 3?"
  ]
}
"""

def build_question_prompt(worker_context: dict = None) -> str:
    ctx = ""
    if worker_context:
        ctx = f"""
KONTEKS PEKERJA:
- Jenis pekerjaan: {worker_context.get('job_type', 'tidak diketahui')}
- Nama UMKM: {worker_context.get('umkm_name', 'tidak diketahui')}
- Usia: {worker_context.get('age', 'tidak diketahui')} tahun
"""
    return f"""{ctx}Buat 3 pertanyaan reflektif harian yang personal dan hangat untuk pekerja ini. Variasikan topik antara perasaan, pekerjaan, relasi sosial, dan harapan."""


async def generate_questions(worker_context: dict = None) -> list[str]:
    """
    Generate 3 personalized reflection questions for the worker.
    """
    client = get_llm_client()
    user_prompt = build_question_prompt(worker_context)

    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.8,
        max_tokens=300,
        top_p=0.95,
        messages=[
            {"role": "system", "content": QUESTION_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    result = json.loads(raw)
    questions = result.get("questions", [])

    # Ensure we always return 3 questions
    while len(questions) < 3:
        questions.append(f"Apa yang paling kamu rasakan hari ini?")

    return questions[:3]


# ─── Core Analysis Functions ──────────────────────────────────────────────────
# ─── BinaBot Reply Generation ──────────────────────────────────────────────
REPLY_SYSTEM_PROMPT = """
Anda adalah BinaBot, asisten refleksi harian yang hangat dan personal
untuk pekerja reintegrasi sosial.

Tugas Anda: balas cerita user dengan singkat, natural, dan empatik
(1-2 kalimat), lalu ajukan pertanyaan berikutnya dengan lancar.

PANDUAN:
- Balas dengan bahasa Indonesia yang hangat dan natural
- Referensikan APA YANG USER KATAKAN (jangan generic)
- Maksimal 3 kalimat total, termasuk pertanyaan berikutnya
- Akhiri dengan pertanyaan berikutnya yang sudah disediakan
- JANGAN gunakan template seperti "Terima kasih ceritanya" atau
  "Aku catat sebagai jurnal"

CONTOH:
User: "Alhamdulillah, kerjaan hari ini lancar. Stok semua beres."
Next: "Apa tantangan terbesar yang kamu hadapi hari ini?"
BinaBot: "Mantap, senang denger semua beres! Pasti lega ya.
Ngomong-ngomong, tantangan terbesar hari ini apa?"

User: "Capek sih, hari ini lumayan berat."
Next: "Siapa yang paling membantu kamu hari ini?"
BinaBot: "Capek setelah hari berat itu wajar, istirahat yang cukup ya.
Ada yang bantu kamu hari ini?"

OUTPUT FORMAT (JSON ONLY):
{
  "reply": "balasan natural 2-3 kalimat termasuk pertanyaan berikutnya"
}
"""

def build_reply_prompt(user_answer: str, question: str, next_question: str) -> str:
    return f"""JAWABAN USER: "{user_answer}"

PERTANYAAN YANG DIAJUKAN: "{question}"

PERTANYAAN SELANJUTNYA: "{next_question}"

Buat balasan natural yang merespon jawaban user dan mengalir ke pertanyaan selanjutnya."""


async def generate_bina_reply(user_answer: str, question: str, next_question: str) -> str:
    """Generate a contextual reply to the user's answer, leading into the next question."""
    client = get_llm_client()
    user_prompt = build_reply_prompt(user_answer, question, next_question)

    response = await client.chat.completions.create(
        model=get_model_name(),
        temperature=0.7,
        max_tokens=200,
        top_p=0.95,
        messages=[
            {"role": "system", "content": REPLY_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    result = json.loads(raw)
    return result.get("reply", next_question)


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
