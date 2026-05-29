# AI Monitoring BinaHub: LLM-Based Psychological Risk Detection

## 📌 Executive Summary

BinaHub menggunakan **Large Language Models (LLM)** — spesifik **Azure OpenAI GPT-4o mini** — untuk analisis real-time kondisi psikologis ex-narapidana melalui jurnal harian mereka. Sistem ini dirancang untuk mendeteksi sinyal bahaya (self-harm, relapse, kekerasan) dan memicu intervensi otomatis, menciptakan pengaman manusia untuk setiap pekerja.

---

## 🎯 1. Latar Belakang: Mengapa LLM?

### Masalah dengan NLP Klasik

**Rule-Based / NLP Klasik** (sentiment analysis tradisional):
- ❌ Hanya bedakan: positif/negatif/netral
- ❌ Gagal tangkap konteks, nuansa, makna tersembunyi
- ❌ Tidak paham slang Bahasa Indonesia informal
- ❌ Blind terhadap ironi, sarkasme, sinyal implisit

#### **Contoh Failure Case NLP Klasik:**

| Case | Teks | NLP Output | Masalah |
|------|------|-----------|---------|
| 1 | "Kalo ga inget keluarga mah udh gue tinggalin nih bengkel." | ✅ Positif (sebut keluarga) | Tidak menangkap: "niat keluar ditahan keluarga, bukan karena stabil/puas" |
| 2 | "Temen lama gue nelpon, ngajakin main lagi." | ⚪ Netral (ambigu) | Tidak menangkap konteks: ajakan kembali ke aktivitas kriminal |
| 3 | "Bos hari ini asik, bayarnya lumayan lah." | ✅ Positif | Tidak menangkap: gratifikasi instan = simtom hedonisme, potensi relapse |

### Mengapa LLM Cocok?

**LLM (GPT-4o mini)** memahami:
- ✅ **Konteks psikologis** — Nada, motivasi tersembunyi, emotional undertone
- ✅ **Slang & linguistik informal** — Bahasa Indonesia sehari-hari, typo, kolokial
- ✅ **Sinyal implisit** — Self-harm ideation, nostalgic triggers, cognitive distortion
- ✅ **Dinamika sosial** — Peer pressure, stigma, isolation cues
- ✅ **Personalisasi** — Riwayat individu dipertimbangkan dalam konteks

#### **Keunggulan LLM untuk Safety-Critical Domain:**

```
NLP Klasik:
Input: "Ga ada gunanya gue nyoba berubah"
Output: Negatif (confidence: 0.87)
→ Flag: "sentiment negatif"

LLM (dengan prompt context-aware):
Input: "Ga ada gunanya gue nyoba berubah. Orang ttp aja ngeliat gue sampah."
Output: {
  "score": 10,
  "label": "Merah (Kritis)",
  "reasoning": "Subjek mengalami keputusasaan ekstrem, hopelessness, self-deprecation. 
               Kombinasi ini adalah marker klasik suicidal ideation pada population 
               dengan riwayat self-harm.",
  "flags": {
    "self_harm_risk": true,      ← Safety flag!
    "crisis_immediate": true      ← Trigger alert!
  }
}
```

---

## 🧠 2. Arsitektur LLM Monitoring Pipeline

### 2.1 End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     INPUT LAYER (Data Ingestion)                 │
├─────────────────────────────────────────────────────────────────┤
│ User Input:                                                       │
│ • Daily Journal (Text) — Jurnal harian pekerja                   │
│ • Voice Note (Audio) — Catatan suara via mobile app              │
│ • Micro Check-in (Chat) — Chatbot AI tanya-jawab hariannya      │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                  PRE-PROCESSING LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Speech-to-Text (Azure AI Speech)                              │
│    Input: Audio (.wav, .mp3)                                     │
│    Output: Teks transkrip (normalized)                           │
│                                                                   │
│ 2. Text Normalization                                            │
│    • Clean: typo, formatting                                     │
│    • Preserve: slang, konteks informal (JANGAN "clean" terlalu)  │
│    • Tokenize: siapkan untuk LLM                                 │
│                                                                   │
│ 3. Context Enrichment                                            │
│    • Ambil: riwayat jurnal 7 hari sebelumnya                    │
│    • Ambil: demographic data (usia, crime history, placement)    │
│    • Jangan: identitas pribadi (privacy-first)                  │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                   AI INFERENCE LAYER (LLM)                        │
├─────────────────────────────────────────────────────────────────┤
│ Model: Azure OpenAI GPT-4o mini                                  │
│ Temperature: 0.2 (konsistensi > variasi)                        │
│                                                                   │
│ Input Prompt:                                                     │
│ • System prompt (behavioral criteria)                            │
│ • Teks jurnal + konteks riwayat                                 │
│                                                                   │
│ Output JSON:                                                      │
│ {                                                                 │
│   "score": 1-10,                                                 │
│   "label": "Hijau|Kuning|Merah",                                │
│   "reasoning": "eksplanasi psikologis",                         │
│   "flags": {                                                      │
│     "self_harm_risk": bool,                                      │
│     "relapse_risk": bool,                                        │
│     "violence_risk": bool,                                       │
│     "crisis_immediate": bool                                     │
│   },                                                              │
│   "dominant_emotions": [...],                                    │
│   "intervention_note": "saran intervensi"                       │
│ }                                                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│              POST-PROCESSING & SAFETY OVERRIDE                    │
├─────────────────────────────────────────────────────────────────┤
│ Jika ANY flag (self_harm, relapse, violence, crisis) = true:    │
│   → FORCE label = "Merah" (regardless of score)                  │
│   → TRIGGER immediate alert (Email + SMS ke Bapas/Admin)        │
│                                                                   │
│ Validation:                                                       │
│   • Cek JSON structure valid                                     │
│   • Cek score 1-10 range                                         │
│   • Fallback: jika error → default Kuning (conservative)        │
└────────────────┬────────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────────┐
│           OUTPUT & ACTION LAYER (Dashboards & Alerts)             │
├─────────────────────────────────────────────────────────────────┤
│ 1. Dashboard UMKM                                                │
│    • Visualisasi status warna (Hijau/Kuning/Merah) real-time    │
│    • Trend 7-hari: stacked chart                                │
│    • Alert list: filter by level                                │
│                                                                   │
│ 2. Dashboard Worker (Ex-Napi)                                    │
│    • Personal score historis                                     │
│    • Sentiment trend                                             │
│    • Saran intervensi konseling                                 │
│                                                                   │
│ 3. Alert Notification (Bapas/Admin)                              │
│    • Email/SMS instan untuk Merah (crisis_immediate = true)     │
│    • Recommended action dari sistem                              │
│                                                                   │
│ 4. Database Logging                                              │
│    • Simpan: score, label, flags, reasoning                     │
│    • Timestamp: kapan analisis dilakukan                        │
│    • Audit trail: untuk compliance & improvement                │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow: Dari Input hingga Action

```
TIMELINE: Jurnal Masuk → AI Analysis → Alert Terkirim

t=0       t=+2s        t=+5s           t=+10s
│         │            │               │
Pekerja   Speech→Text  LLM Process    Database Save
submit    (jika audio) (inference)     + Dashboard Update
journal                               + Alert Send
   │         │            │               │
   └─────────┴────────────┴───────────────┘
            TOTAL LATENCY: ~10 detik
         (Real-time monitoring achieved)
```

---

## 🎓 3. Prompt Engineering: Cara AI "Diajarkan" Menilai

### 3.1 Sistem Prompt (System Context)

```python
SYSTEM_PROMPT = """
Anda adalah psikolog forensik berpengalaman yang mengevaluasi jurnal harian 
dari ex-narapidana (ex-napi) yang sedang dalam program reintegrasi sosial. 

TUGAS:
Analisis sentimen & risiko psikologis dalam jurnal mereka menggunakan skala 
1-10 (Hijau: 1-4, Kuning: 5-7, Merah: 8-10).

KONTEKS KHUSUS:
- Populasi ini memiliki riwayat trauma, stigma, dan rentan relapse.
- Jurnal berisi Bahasa Indonesia informal/slang — ini NORMAL, bukan indikator 
  negatif.
- Cari: sinyal implicit (hopelessness, peer pressure kriminal, isolation) 
  bukan hanya kata-kata negatif eksplisit.

KATEGORI LABEL:

┌─────────────────────────────────────────────────────────────────┐
│ HIJAU (Skor 1-4): STABIL                                        │
├─────────────────────────────────────────────────────────────────┤
│ Ciri:                                                             │
│ • Nada positif, aktivitas produktif                             │
│ • Ungkapan syukur, apresiasi terhadap lingkungan                │
│ • Engagement dengan pekerjaan, keluarga                         │
│ • Rencana masa depan, tujuan yang realistis                     │
│                                                                   │
│ Contoh:                                                          │
│ "Alhamdulillah hari ini toko rame banget. Gue dapet bonus dari │
│  bos karena target jualan tembus."                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ KUNING (Skor 5-7): PERLU ATENSI                                 │
├─────────────────────────────────────────────────────────────────┤
│ Ciri:                                                             │
│ • Keluhan berulang (kelelahan, stress pekerjaan)                │
│ • Menarik diri dari interaksi sosial (tanpa alasan jelas)       │
│ • Ambivalensi: ingin berubah vs. ragu kemampuan diri            │
│ • Nostalgia masa lalu (netral-negatif)                          │
│ • Godaan minor (bukan ajakan langsung)                          │
│                                                                   │
│ Contoh:                                                          │
│ "Kerjaan makin numpuk, gue ngerasa overwork. Udah gitu temen   │
│  kerja kyk ngejauhin gue, gatau knp apa krn masa lalu gue ya." │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MERAH (Skor 8-10): KRITIS - BUTUH INTERVENSI SEGERA              │
├─────────────────────────────────────────────────────────────────┤
│ Ciri:                                                             │
│ • Suicidal ideation / self-harm explicit atau implicit          │
│ • Hopelessness ekstrem ("ga ada gunanya", "capek hidup")        │
│ • Niat kabur / ajakan kembali ke kriminal (dari peer)           │
│ • Rencana konkret berbahaya                                      │
│ • Dissosiasi / depersonalisasi                                  │
│                                                                   │
│ Contoh:                                                          │
│ "Ga ada gunanya gue nyoba berubah. Orang ttp aja ngeliat gue   │
│  sampah. Mending udahan aja lah semuanya, capek gue idup."      │
└─────────────────────────────────────────────────────────────────┘

EMPAT PRINSIP PENILAIAN:

1️⃣  HUMANIS
   • Reasoning harus empatik, bukan judgmental
   • Pahami latar belakang trauma, bukan "judge" karakter
   
2️⃣  KONSERVATIF
   • Jika ragu antara Kuning vs Merah → pilih Merah
   • False positive (false alarm) lebih baik dari missed crisis
   
3️⃣  SPESIFIK
   • Reasoning HARUS rujuk kalimat konkret dari teks
   • Jangan generalisasi tanpa bukti
   
4️⃣  KONTEKSTUAL
   • Typo & slang BUKAN indikator negatif
   • Pahami Bahasa Indonesia informal, kolokial
   • Pertimbangkan demografi & riwayat individu jika tersedia

EMPAT FLAG INDEPENDEN (Mutually Triggered):

┌─────────────────────────────────────────┐
│ 1. self_harm_risk                       │
│    Isyarat menyakiti diri sendiri       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 2. relapse_risk                         │
│    Godaan/niat kembali ke perilaku      │
│    kriminal (drugs, gang, dll)          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 3. violence_risk                        │
│    Niat kekerasan ke orang/properti     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 4. crisis_immediate                     │
│    Situasi yang butuh intervensi HARI   │
│    INI (jangan tunggu besok)            │
└─────────────────────────────────────────┘

⚠️  CRITICAL: Jika ANY flag = true → override label otomatis ke MERAH

OUTPUT FORMAT (JSON ONLY):
{
  "score": integer (1-10),
  "label": string ("Hijau"|"Kuning"|"Merah"),
  "reasoning": string (2-3 kalimat, rujuk teks konkret),
  "flags": {
    "relapse_risk": boolean,
    "self_harm_risk": boolean,
    "violence_risk": boolean,
    "crisis_immediate": boolean
  },
  "dominant_emotions": array of strings (e.g., ["optimis", "pasrah"]),
  "intervention_note": string (saran action konkret)
}

INGAT: Tujuan adalah melindungi jiwa, bukan menghukum. Jadilah advocate untuk 
ex-napi ini, dengan tetap menjaga keamanan semua pihak.
"""
```

### 3.2 User Prompt (Per Jurnal)

```python
USER_PROMPT_TEMPLATE = f"""
KONTEKS INDIVIDU:
- Nama: {worker_name} (anonymized untuk privacy)
- Usia: {age}
- Masa depan: {future_history} (e.g., "armed robbery, 8 years, released 6 months ago")
- Placement: {job_type} (e.g., "asisten toko pakaian di Bandung")
- Supervisor UMKM: {umkm_name}

RIWAYAT JURNAL 7 HARI TERAKHIR (TREND):
{previous_7_days_summary}

JURNAL HARI INI:
---
{todays_journal_text}
---

Berikan analisis sentiment & risiko dengan format JSON.
"""
```

### 3.3 Contoh Real: Jurnal Merah

```python
# INPUT
USER_PROMPT = """
KONTEKS:
- Worker: Budi, 34 tahun
- Riwayat: Narkoba (3 tahun), keluar 2 bulan lalu
- Placement: Bengkel mobil, Bandung
- Trend 7 hari: Hijau → Hijau → Kuning → Kuning → Kuning → Kuning → [HARI INI]

JURNAL HARI INI:
---
"Ga ada gunanya gue nyoba berubah. Orang ttp aja ngeliat gue sampah. 
Mending udahan aja lah semuanya, capek gue idup. Tadi Tito (temen lama) 
nelpon, ngajakin main ke rumahnya malam. Gue gatau lagi harus gimana..."
---

Analisis risk profile.
"""

# EXPECTED OUTPUT (dari LLM)
{
  "score": 10,
  "label": "Merah",
  "reasoning": "Subjek mengalami keputusasaan ekstrem ('ga ada gunanya', 'capek gue idup') 
               disertai ideasi self-harm implisit. Kombinasi hopelessness + social 
               withdrawal + peer pressure (Tito mengajak) = marker suicidal ideation. 
               Trend: eskalasi Kuning selama 4 hari menunjukkan decompensation.",
  "flags": {
    "self_harm_risk": true,      ← CRITICAL
    "relapse_risk": true,         ← Tito ajak ke rumah (coded language?)
    "violence_risk": false,
    "crisis_immediate": true      ← TRIGGER ALERT
  },
  "dominant_emotions": ["putus asa", "pasrah", "terisolasi", "ragu"],
  "intervention_note": "Contact Bapas hari ini. Home visit. Pisahkan dari Tito. 
                        Escalate ke psikolog klinik untuk assessment suicidal risk."
}
```

---

## 📊 4. Dataset & Model Training Data

### 4.1 Dataset Simulasi (200 records)

BinaHub telah generate **200 synthetic journal entries** berdasarkan real clinical insights untuk MVP:

```
Distribusi Kelas:
├─ HIJAU (Stabil): 80 records     (40%)
├─ KUNING (Atensi): 80 records    (40%)
└─ MERAH (Kritis): 40 records     (20%)

Total: 200 records ✓
```

#### **Contoh Record Hijau (Score 1-4)**

```
{
  "worker_id": "W001",
  "date": "2024-05-15",
  "journal_text": "Alhamdulillah hari ini toko rame banget. Gue dapet bonus dari 
                   bos karena target jualan tembus. Pulang langsung beli 
                   makan enak buat istri. Besok semoga hari yang baik juga.",
  "expected_score": 2,
  "expected_label": "Hijau",
  "expected_flags": {
    "self_harm_risk": false,
    "relapse_risk": false,
    "violence_risk": false,
    "crisis_immediate": false
  }
}
```

#### **Contoh Record Kuning (Score 5-7)**

```
{
  "worker_id": "W045",
  "date": "2024-06-10",
  "journal_text": "Kerjaan hari ini berat banget. Bos maksa harus selesai target 
                   padahal equipment rusak. Badan capek, kepala pusing. 
                   Temen kerja juga kyk jauh-jauh dari gue. Gatau kenapa 
                   mereka jadi dingin. Kalo terus begini gue beneran mau 
                   keluar dari sini.",
  "expected_score": 6,
  "expected_label": "Kuning",
  "expected_flags": {
    "self_harm_risk": false,
    "relapse_risk": false,        ← not explicit
    "violence_risk": false,
    "crisis_immediate": false
  },
  "notes": "Social withdrawal + occupational stress. Needs check-in, 
            tidak urgent tapi monitor."
}
```

#### **Contoh Record Merah (Score 8-10)**

```
{
  "worker_id": "W089",
  "date": "2024-06-22",
  "journal_text": "Ga ada gunanya gue nyoba berubah. Orang ttp aja ngeliat gue 
                   sampah. Mending udahan aja lah semuanya, capek gue idup. 
                   Tadi Tito (temen lama) nelpon, ngajakin main lagi. Gue 
                   gatau lagi harus gimana, semua terasa berat.",
  "expected_score": 10,
  "expected_label": "Merah",
  "expected_flags": {
    "self_harm_risk": true,       ← CRITICAL
    "relapse_risk": true,         ← Tito = peer from past crime
    "violence_risk": false,
    "crisis_immediate": true      ← ALERT NOW
  },
  "intervention_actions": [
    "Immediate contact Bapas/Supervisor",
    "Psychological assessment",
    "Separate from Tito",
    "Consider crisis hotline"
  ]
}
```

### 4.2 EDA (Exploratory Data Analysis) Dashboard

```
📊 Distribusi Panjang Teks:
   Hijau: Mean 150 kata (range: 50-300)
   Kuning: Mean 180 kata (range: 80-400)
   Merah: Mean 160 kata (range: 40-350)
   → Panjang teks TIDAK reliable predictor (semua balanced)

📊 Distribusi Skor Risiko (1-10):
   Peak di: 1-4 (Hijau), 5-7 (Kuning), 8-10 (Merah)
   Distribution: ~ normal per kelas
   → Imbalanced dataset (40%-40%-20%) OK untuk safety-critical
   → Prioritas: recall pada Merah > precision pada Hijau

📊 Emotional Lexicon Analysis:
   Hijau top emotions: syukur, senang, optimis, harap
   Kuning top emotions: capek, stress, bingung, khawatir, sedih
   Merah top emotions: putus asa, lepas, sampah, capek, mati
   → LLM perlu understand emotional gradient, not just keywords
```

---

## 🔐 5. Safety Mechanisms & Error Handling

### 5.1 Post-Processing Layer (Python Safety Override)

```python
def apply_safety_override(llm_output: dict) -> dict:
    """
    Post-processing: ensure LLM output aman, 
    dan force Merah jika ada safety flag.
    """
    
    # Validate JSON structure
    required_fields = ["score", "label", "reasoning", "flags", 
                       "dominant_emotions", "intervention_note"]
    if not all(field in llm_output for field in required_fields):
        # Fallback: conservative estimate
        return {
            "score": 5,
            "label": "Kuning",
            "reasoning": "JSON parsing error - defaulting to cautious label",
            "flags": {
                "self_harm_risk": False,
                "relapse_risk": False,
                "violence_risk": False,
                "crisis_immediate": False
            },
            "intervention_note": "Manual review required"
        }
    
    # Validate score range
    if not (1 <= llm_output["score"] <= 10):
        llm_output["score"] = max(1, min(10, llm_output["score"]))
    
    # ⚠️  SAFETY OVERRIDE: Any flag = Merah
    if any([
        llm_output["flags"].get("self_harm_risk", False),
        llm_output["flags"].get("relapse_risk", False),
        llm_output["flags"].get("violence_risk", False),
        llm_output["flags"].get("crisis_immediate", False)
    ]):
        llm_output["label"] = "Merah"  # Force override
        llm_output["score"] = max(8, llm_output["score"])
        
        # Log for audit
        print(f"⚠️  SAFETY OVERRIDE TRIGGERED: {llm_output['flags']}")
    
    return llm_output
```

### 5.2 Temperature & Consistency

```python
# Production Settings:
MODEL = "gpt-4o-mini"
TEMPERATURE = 0.2          # 🎯 Low temp = konsistensi > kreativitas
                            #    (output deterministic untuk safety)
MAX_TOKENS = 500           # Enough for detailed reasoning
TOP_P = 0.9                # Nucleus sampling: focus on likely outputs
```

**Mengapa temperature 0.2?**
- Safety-critical domain tidak boleh "creative"
- Score 8 harus konsisten Score 8, tidak boleh fluktuasi 5-9
- False positive (alert salah) lebih baik dari missed crisis

---

## 🚨 6. Alert & Notification System

### 6.1 Alert Routing

```
LLM Output
    │
    ├─ Merah + crisis_immediate=true
    │   └─→ [PRIORITY] Email + SMS Bapas/Admin (IMMEDIATE)
    │       └─ Template: "CRISIS ALERT: Worker XYZ menunjukkan 
    │                    suicidal ideation. Recommended: contact hari ini."
    │
    ├─ Merah + crisis_immediate=false
    │   └─→ [HIGH] Email Supervisor UMKM + log dashboard
    │       └─ Template: "Risk Alert: Worker XYZ skor Merah. 
    │                    Recommend: check-in 24jam."
    │
    └─ Kuning
        └─→ [MEDIUM] Dashboard flag + weekly summary ke UMKM
            └─ Template: "Attention: Worker XYZ menunjukkan peningkatan 
                          stress. Siap untuk mentoring?"
```

### 6.2 Intervention Workflow (Bapas POV)

```
┌─────────────────────────────────┐
│ Receive SMS/Email (Merah Alert) │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│ Log into BinaHub Admin Dashboard │
│ View worker profile + journal    │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│ Read AI reasoning & flags        │
│ (self_harm_risk? relapse_risk?)  │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│ Action Menu:                     │
│ □ Call worker (voice check)      │
│ □ Schedule home visit            │
│ □ Refer to psychologist          │
│ □ Escalate to crisis hotline     │
│ □ Mark as "handled"              │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│ Log action + outcome in system   │
│ (feedback loop untuk AI)         │
└─────────────────────────────────┘
```

---

## 💡 7. Keputusan Teknis: Trade-offs

| **Keputusan** | **Pilihan** | **Alasan** |
|---|---|---|
| **NLP vs LLM** | LLM (GPT-4o mini) | Data terlalu nuanced — slang, nada tersembunyi, konteks kriminal |
| **Model Size** | GPT-4o mini (bukan GPT-4 full) | Hemat biaya, cukup untuk nuance Bahasa Indonesia, volume tinggi |
| **Temperature** | 0.2 | Konsistensi penilaian > variasi output. Safety > diversity. |
| **Threshold Override** | Post-processing Python | LLM tidak 100% reliable untuk safety-critical → ada layer validasi |
| **RAG** | ❌ Not now (MVP) | Belum ada historical context yang perlu di-retrieve |
| **RAG Future** | ✅ Planned | Ketika fitur "tren kondisi 7 hari" dibutuhkan → pakai pgvector |
| **Fine-tuning** | ❌ Not done (prompt-based) | 200 samples terlalu sedikit. Prompt engineering sufficient untuk MVP. |

---

## 🔄 8. Iterasi & Continuous Improvement

### 8.1 Feedback Loop

```
┌──────────────────────────────┐
│ Model predicts Kuning        │
│ (tidak ada alert)            │
└────────────┬─────────────────┘
             │
     [24-48 jam kemudian]
             │
┌────────────▼─────────────────┐
│ Worker escalates to Merah     │
│ (atau crisis reported)        │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│ Log as "MISS" case           │
│ → Label hari sebelumnya: Y   │
│ → Model predict: N           │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│ Analyze: apa yang dilewat?   │
│ • Teks apa yang mislead?     │
│ • Apakah prompt criteria     │
│   perlu refined?             │
└────────────┬─────────────────┘
             │
┌────────────▼─────────────────┐
│ Update system prompt         │
│ (e.g., tambah sub-criteria)  │
└──────────────────────────────┘
```

### 8.2 Metrics to Track

```
🎯 Precision (Merah):
   TP / (TP + FP)
   Target: > 0.90 (minimize false alarms)

🎯 Recall (Merah):
   TP / (TP + FN)
   Target: > 0.95 (catch actual crisis)
   
   ⚠️ Safety philosophy: Recall > Precision
   → Better to over-alert than miss crisis

🎯 F1-Score:
   Harmonic mean of precision & recall
   Target: > 0.92

🎯 Latency:
   Input → Alert notification
   Target: < 15 seconds

🎯 Cost per Inference:
   API cost / month
   Baseline: ~$0.02 per journal analysis
```

---

## 🌍 9. Limitations & Ethical Considerations

### 9.1 Keterbatasan LLM

| **Limitation** | **Impact** | **Mitigation** |
|---|---|---|
| Hallucination | Bisa "invent" reasoning yang plausible tapi salah | Post-processing: require quotes dari teks asli |
| Bias in training | Model belajar dari data bias → bias output | Diverse system prompt, human validation |
| Variability | Same input, beda suara → beda output | Temperature 0.2 + override layer |
| No ground truth | Psychological assessment tidak punya "label baku" | Human expert validation, feedback loop |
| Privacy leaks | Model bisa "remember" data training | Local deployment, privacy-first prompt |

### 9.2 Ethical Concerns

```
⚠️  CONCERN 1: Over-surveillance
    Risk: Jurnal digunakan untuk discipline/punishment instead of help
    Mitigation: 
    - Transparansi: worker tahu jurnal di-monitor
    - Data access control: hanya Bapas & Supervisor UMKM
    - Use case clarity: untuk intervensi, bukan punishment

⚠️  CONCERN 2: Algorithmic bias
    Risk: Model underestimate risk untuk certain demographics
    Mitigation:
    - Diverse test data (gender, age, crime type)
    - Regular audit dengan psychologist
    - Manual override always possible

⚠️  CONCERN 3: False positives
    Risk: Worker sering di-alert → trust eroded → disobey system
    Mitigation:
    - High precision threshold (> 0.90)
    - Smart override: prioritize crisis signals
    - Human validation before action
```

---

## 📈 10. Roadmap: MVP → Production → Scale

### Phase 1: MVP (Week 7-12) ✅ [CURRENT]
- ✅ 200 synthetic journal dataset
- ✅ System prompt finalized
- ✅ LLM inference working
- ✅ Post-processing layer
- ⏳ Dashboard visualization (in progress)

### Phase 2: Early Validation (Week 13-14)
- [ ] 5-10 real ex-napi volunteers (beta test)
- [ ] Collect real journal data (anonymized)
- [ ] Validate LLM outputs vs. psychologist assessment
- [ ] Refine system prompt based on real data

### Phase 3: Production (Week 15+)
- [ ] Deploy to Azure production
- [ ] Real alert notifications (Bapas & UMKM)
- [ ] Dashboard live monitoring
- [ ] SLA: 99.9% uptime, < 30s latency

### Phase 4: Scale (Future)
- [ ] RAG layer: 7-day history context window
- [ ] Fine-tuning: on validated real data
- [ ] Multimodal: video journal analysis
- [ ] Causal inference: what interventions work?

---

## 📚 Referensi & Resources

### LLM & NLP
- [OpenAI GPT-4 Technical Report](https://arxiv.org/abs/2303.08774)
- [Prompt Engineering for LLMs](https://platform.openai.com/docs/guides/prompt-engineering)

### Safety-Critical ML
- [AI Safety & Alignment](https://www.anthropic.com/research)

### Psychology & Ex-Offender Rehabilitation
- Maruna, S. (2001). "Making Good: How ex-offenders reform and rebuild their lives"
- VanBenschoten, S. (2008). "Risk and Resiliency Factors Associated with Gang Involvement..."

---

## ✅ Kesimpulan

BinaHub menggunakan **LLM-based monitoring** untuk menjembatani gap antara surveillance tradisional (manual, tidak scalable) dan kebutuhan safety-critical (real-time, humanis, konteks-aware). 

**Keunggulan pendekatan ini:**
1. ✨ Memahami nuansa Bahasa Indonesia informal
2. 🎯 Deteksi sinyal implisit (bukan cuma keywords)
3. 🚀 Scalable ke ribuan pekerja
4. 🛡️ Safety first: conservative thresholds, human override always possible
5. ❤️ Humanis: untuk help, bukan punishment

**Next steps:** Real-world validation dengan psychologists & ex-napi untuk memastikan sistem benar-benar bermanfaat, bukan harmful.

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*Maintained by: Kelompok 8 (BinaHub Team)*
