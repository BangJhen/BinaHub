# RAG (Retrieval-Augmented Generation) untuk BinaHub AI Monitoring
## Konsep Sistem: Fast, Efficient, Dashboard-Ready

---

## 📌 **1. Overview: Apa itu RAG untuk BinaHub?**

### **Traditional LLM Monitoring (Current MVP):**
```
Jurnal Hari Ini → LLM → Score + Flags
(Context-blind: tidak ada riwayat)

Problem:
- Tidak bisa deteksi TREND (escalation pattern)
- Tidak bisa compare dengan baseline individu
- Miss context: "ini stabil?" vs "ini drop dari yang biasanya?"
```

### **RAG-Enhanced Monitoring (Future Production):**
```
Jurnal Hari Ini
    ↓
[RETRIEVE] Ambil 7 hari jurnal terakhir dari vector DB
    ↓
[AUGMENT] Gabung dengan konteks historis
    ↓
[GENERATE] LLM analisis dengan full context
    ↓
Output: Score + Flags + TREND ANALYSIS
```

**Value Add:**
- ✅ Trend detection: "Kuning 3 hari → escalating risk"
- ✅ Baseline comparison: "drop 5 poin dari usual state"
- ✅ Pattern recognition: "cycle: stress → isolation → crisis"
- ✅ Personalization: "untuk Budi, worry about X; untuk Ahmad, worry about Y"
- ✅ Smarter intervention: "tidak escalate jika stable trend" vs "escalate jika deteriorating"

---

## 🏗️ **2. Architecture Overview**

### **2.1 High-Level Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                        DASHBOARD / MOBILE APP                    │
│              (Next.js frontend + React components)                │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ POST /api/journal/analyze (async)
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RAG API (Python/FastAPI)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 1. RETRIEVAL ENGINE (Vector Search)                    │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ Input: worker_id, date                                 │    │
│  │ Query: SELECT 7 days of journals from pgvector         │    │
│  │        using similarity search                         │    │
│  │ Output: top_k similar journal embeddings               │    │
│  └────────────────────────────────────────────────────────┘    │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 2. CONTEXT AUGMENTATION                                │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ Combine:                                               │    │
│  │ • Retrieved journals (7-day context)                  │    │
│  │ • Current journal (today)                             │    │
│  │ • Metadata (scores, flags from history)               │    │
│  │ • Worker profile (age, crime type, placement)         │    │
│  │                                                        │    │
│  │ Output: Augmented prompt ready for LLM                │    │
│  └────────────────────────────────────────────────────────┘    │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 3. LLM INFERENCE (with RAG context)                    │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ System Prompt + Augmented Context                      │    │
│  │ → Azure OpenAI GPT-4o mini                            │    │
│  │ → Generate: score, label, flags, trend_analysis      │    │
│  └────────────────────────────────────────────────────────┘    │
│                     ↓                                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 4. POST-PROCESSING & CACHING                           │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ • Safety override (any flag → Merah)                  │    │
│  │ • Cache result (Redis): worker_id + date              │    │
│  │ • Log to database (audit trail)                       │    │
│  │ • Publish to Message Queue (notifications)            │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                   │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ Stream result back to dashboard (WebSocket)
                   ↓
        ┌──────────────────────────────┐
        │   REAL-TIME DASHBOARD UPDATE  │
        │  (Show score + trend chart)   │
        └──────────────────────────────┘
```

### **2.2 Data Flow: Synchronous vs Asynchronous**

```
SYNCHRONOUS (Fast path - score only):
User submit journal
    ↓ (< 5s)
Show score immediately (from cache or quick LLM)
    ↓
ASYNCHRONOUS (Background - enrichment):
Meanwhile, RAG retrieves history
    ↓ (5-30s)
LLM re-analyzes with context
    ↓
Update dashboard with trend analysis

Result: User sees score fast, trend appears after.
```

---

## 💾 **3. Database Layer: pgvector + Supabase**

### **3.1 Schema Design**

```sql
-- 1. Main journals table (sudah ada)
CREATE TABLE journals (
  id UUID PRIMARY KEY,
  worker_id UUID NOT NULL REFERENCES workers(id),
  date DATE NOT NULL,
  text_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- AI Analysis Results
  score INT CHECK (score >= 1 AND score <= 10),
  label VARCHAR(10) CHECK (label IN ('Hijau', 'Kuning', 'Merah')),
  reasoning TEXT,
  
  -- Flags
  self_harm_risk BOOLEAN DEFAULT FALSE,
  relapse_risk BOOLEAN DEFAULT FALSE,
  violence_risk BOOLEAN DEFAULT FALSE,
  crisis_immediate BOOLEAN DEFAULT FALSE,
  
  UNIQUE(worker_id, date)
);
CREATE INDEX idx_journals_worker_date ON journals(worker_id, date DESC);

-- 2. Vector embeddings table (NEW)
CREATE TABLE journal_embeddings (
  id UUID PRIMARY KEY,
  journal_id UUID NOT NULL UNIQUE REFERENCES journals(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id),
  
  -- Vector embedding (dari sentence-transformers model)
  embedding vector(384),  -- 384-dim untuk model 'all-MiniLM-L6-v2'
  
  embedding_model VARCHAR(50) DEFAULT 'all-MiniLM-L6-v2',
  embedding_created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
);

-- 3. Worker context cache (optional but useful)
CREATE TABLE worker_context_cache (
  id UUID PRIMARY KEY,
  worker_id UUID NOT NULL UNIQUE REFERENCES workers(id),
  
  -- Cached 7-day summary
  last_7_days_summary TEXT,  -- JSON or plain text summary
  avg_score_7d FLOAT,
  trend_direction VARCHAR(20),  -- 'stable', 'improving', 'deteriorating'
  
  last_updated TIMESTAMP DEFAULT NOW(),
  cache_ttl INTERVAL DEFAULT '1 hour'
);

-- 4. RAG Analysis results (audit trail)
CREATE TABLE rag_analyses (
  id UUID PRIMARY KEY,
  worker_id UUID NOT NULL,
  journal_id UUID NOT NULL REFERENCES journals(id),
  
  analysis_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Retrieved context info
  retrieved_journals_count INT,
  similarity_scores FLOAT8[],  -- Top-k similarity scores
  
  -- LLM output
  rag_score INT,
  rag_label VARCHAR(10),
  rag_reasoning TEXT,
  trend_analysis TEXT,  -- NEW: trend insights
  
  -- Performance metrics
  retrieval_time_ms INT,
  llm_inference_time_ms INT,
  total_latency_ms INT,
  
  model_version VARCHAR(20),
  
  FOREIGN KEY (worker_id) REFERENCES workers(id)
);
```

### **3.2 Indices untuk Performance**

```sql
-- Untuk vector similarity search (cepat)
CREATE INDEX idx_journal_embeddings_vector 
  ON journal_embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Untuk timestamp filtering (cepat retrieve 7-day window)
CREATE INDEX idx_journals_date ON journals(worker_id, date DESC);

-- Untuk cache lookup
CREATE INDEX idx_worker_context_cache ON worker_context_cache(worker_id);
```

---

## 🔍 **4. Retrieval Engine: Vector Search Strategy**

### **4.1 Embedding Model Choice**

```python
# Comparison: Trade-off antara quality vs speed/cost

┌────────────────────────┬──────────┬────────┬───────────┬─────────┐
│ Model                  │ Dim      │ Speed  │ Quality   │ Cost    │
├────────────────────────┼──────────┼────────┼───────────┼─────────┤
│ all-MiniLM-L6-v2       │ 384      │ ⚡⚡⚡  │ ✅✅      │ FREE    │ ← CHOICE
│ all-mpnet-base-v2      │ 768      │ ⚡⚡   │ ✅✅✅    │ FREE    │
│ OpenAI text-embedding-3│ 1536     │ ⚡    │ ✅✅✅✅  │ $$ 💰  │
│ Azure AI Search Custom │ variable │ ⚡    │ Custom    │ $$$     │
└────────────────────────┴──────────┴────────┴───────────┴─────────┘

CHOICE: all-MiniLM-L6-v2
WHY:
✅ Fast inference (2-5ms per embedding)
✅ Small model (22MB) → run locally
✅ Good enough untuk Bahasa Indonesia journal classification
✅ Free (HuggingFace, no API cost)
✅ Dapat di-fine-tune jika diperlukan

ALTERNATIVE: Jika budget ada → OpenAI text-embedding-3-small
(lebih akurat, tapi +$$ per API call)
```

### **4.2 Retrieval Strategy**

```python
def retrieve_relevant_context(worker_id: str, current_journal: str, k: int = 5):
    """
    Smart retrieval: get top-k similar journals dari 7 hari terakhir
    
    Args:
        worker_id: UUID of worker
        current_journal: Text of today's journal
        k: Number of similar journals to retrieve (default 5)
    
    Returns:
        List of (journal_text, score, label, date)
    """
    
    # Step 1: Embed current journal
    current_embedding = embed(current_journal)  # 384-dim vector
    
    # Step 2: Vector similarity search (pgvector)
    # SELECT similarity journals from last 7 days
    query = """
    SELECT 
        j.id,
        j.text_content,
        j.score,
        j.label,
        j.date,
        1 - (je.embedding <=> %s) as similarity
    FROM journals j
    JOIN journal_embeddings je ON j.id = je.journal_id
    WHERE j.worker_id = %s
      AND j.date >= CURRENT_DATE - INTERVAL '7 days'
      AND j.date < CURRENT_DATE  -- Exclude today (not analyzed yet)
    ORDER BY je.embedding <=> %s  -- Cosine distance
    LIMIT %s;
    """
    
    results = db.query(query, (current_embedding, worker_id, current_embedding, k))
    
    return results
    
    # Latency: ~50-100ms (index lookup + retrieval)
    # Cost: Minimal (pure PostgreSQL, no API calls)
```

### **4.3 Retrieval Optimization: Smart Caching**

```python
class RAGRetriever:
    def __init__(self, db, cache_ttl: int = 3600):
        self.db = db
        self.cache = Redis(host='localhost', port=6379)  # Fast in-memory cache
        self.cache_ttl = cache_ttl  # 1 hour default
    
    def get_context(self, worker_id: str, current_journal: str):
        """
        Retrieve with 2-level caching:
        L1 Cache: worker context (7-day summary)
        L2: Database (vector search)
        """
        
        # L1: Check if 7-day summary cached
        cache_key = f"worker_context:{worker_id}"
        cached = self.cache.get(cache_key)
        
        if cached and self.is_cache_fresh(worker_id):
            print(f"✅ Cache HIT for {worker_id}")
            return json.loads(cached)
        
        # L2: Vector search + aggregate
        print(f"🔍 Cache MISS for {worker_id}, retrieving...")
        
        retrieved_journals = retrieve_relevant_context(worker_id, current_journal, k=5)
        
        # Aggregate into context object
        context = {
            "worker_id": worker_id,
            "retrieved_count": len(retrieved_journals),
            "last_7_days": [
                {
                    "date": j.date.isoformat(),
                    "text": j.text_content,
                    "score": j.score,
                    "label": j.label,
                    "similarity": j.similarity
                }
                for j in retrieved_journals
            ],
            "avg_score": np.mean([j.score for j in retrieved_journals]),
            "trend": self._analyze_trend([j.score for j in retrieved_journals]),
            "retrieved_at": datetime.now().isoformat()
        }
        
        # Cache for 1 hour
        self.cache.setex(
            cache_key,
            self.cache_ttl,
            json.dumps(context, default=str)
        )
        
        return context
    
    def _analyze_trend(self, scores: List[int]):
        """Simple trend detection"""
        if len(scores) < 2:
            return "insufficient_data"
        
        first_half = np.mean(scores[:len(scores)//2])
        second_half = np.mean(scores[len(scores)//2:])
        
        diff = second_half - first_half
        if abs(diff) < 1:
            return "stable"
        elif diff > 0:
            return "deteriorating"
        else:
            return "improving"
```

---

## ⚡ **5. API Design: Fast & Efficient**

### **5.1 Endpoint: Async Analysis with Streaming**

```python
# FastAPI endpoint
from fastapi import FastAPI, BackgroundTasks
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

@app.post("/api/v1/journal/analyze")
async def analyze_journal_with_rag(
    request: JournalAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Fast-path API: Return quick result, enrich in background
    
    Request body:
    {
        "worker_id": "uuid",
        "journal_text": "...",
        "voice_url": "optional s3 url"  # untuk audio
    }
    
    Response: {
        "status": "analyzing",
        "job_id": "uuid",
        "quick_result": {
            "score": 5,
            "label": "Kuning",
            "is_preliminary": true
        }
    }
    
    Then WebSocket atau polling untuk hasil lengkap.
    """
    
    worker_id = request.worker_id
    journal_text = request.journal_text
    job_id = str(uuid4())
    
    # Handle audio (if provided)
    if request.voice_url:
        journal_text = await transcribe_audio(request.voice_url)
    
    # ============ FAST PATH (< 2s) ============
    # 1. Quick embedding + cache check
    try:
        cached_result = redis.get(f"result:{worker_id}:{date.today()}")
        if cached_result:
            return {
                "status": "cached",
                "job_id": job_id,
                "result": json.loads(cached_result),
                "is_cached": True
            }
    except:
        pass
    
    # 2. Quick LLM call (no RAG context yet)
    # Use smaller context for speed
    quick_system_prompt = "You are a risk assessment AI..."
    quick_result = await llm_analyze_quick(journal_text, quick_system_prompt)
    
    # Return immediately
    quick_response = {
        "status": "analyzing",
        "job_id": job_id,
        "quick_result": quick_result,
        "is_preliminary": True,  # Signal to frontend: more data coming
    }
    
    # ============ BACKGROUND ENRICHMENT (10-30s) ============
    # 3. Enrich with RAG context in background
    background_tasks.add_task(
        enrich_with_rag,
        worker_id=worker_id,
        journal_text=journal_text,
        job_id=job_id,
        quick_result=quick_result
    )
    
    return quick_response


async def enrich_with_rag(
    worker_id: str,
    journal_text: str,
    job_id: str,
    quick_result: dict
):
    """
    Runs in background, no need to block response
    """
    try:
        # Retrieve 7-day context
        context = rag_retriever.get_context(worker_id, journal_text)
        
        # Build augmented prompt
        augmented_prompt = build_augmented_prompt(journal_text, context)
        
        # Full LLM analysis with RAG
        rag_result = await llm_analyze_with_rag(augmented_prompt)
        
        # Post-processing
        final_result = apply_safety_override(rag_result)
        
        # Save to DB + cache
        save_analysis_result(worker_id, final_result, job_id, context)
        
        # Publish to WebSocket / Message Queue
        await publish_result(job_id, final_result)
        
        # Alert if needed
        if final_result['label'] == 'Merah' and final_result['flags']['crisis_immediate']:
            await send_alert(worker_id, final_result)
        
        print(f"✅ RAG enrichment completed for job {job_id}")
        
    except Exception as e:
        print(f"❌ RAG enrichment failed: {e}")
        await publish_error(job_id, str(e))


# WebSocket for real-time updates
@app.websocket("/ws/analysis/{job_id}")
async def websocket_analysis_status(websocket: WebSocket, job_id: str):
    """
    Real-time updates on analysis progress
    """
    await websocket.accept()
    
    try:
        while True:
            # Check result status
            result = redis.get(f"analysis_result:{job_id}")
            if result:
                await websocket.send_json(json.loads(result))
                break
            
            # Send progress
            await websocket.send_json({"status": "analyzing"})
            await asyncio.sleep(1)
    
    except Exception as e:
        await websocket.send_json({"error": str(e)})
    finally:
        await websocket.close()
```

### **5.2 Request/Response Examples**

```python
# REQUEST
POST /api/v1/journal/analyze
Content-Type: application/json

{
    "worker_id": "550e8400-e29b-41d4-a716-446655440000",
    "journal_text": "Hari ini toko rame. Tapi capek sih, overload kerjaan...",
    "voice_url": null
}

# RESPONSE (Immediate, < 2s)
{
    "status": "analyzing",
    "job_id": "a1b2c3d4-e5f6-4a5b-9c8d-7e6f5g4h3i2j",
    "quick_result": {
        "score": 5,
        "label": "Kuning",
        "reasoning": "Mentioned fatigue and workload stress",
        "flags": {
            "self_harm_risk": false,
            "relapse_risk": false,
            "violence_risk": false,
            "crisis_immediate": false
        }
    },
    "is_preliminary": true,
    "websocket_url": "ws://localhost:8000/ws/analysis/a1b2c3d4-e5f6-4a5b-9c8d-7e6f5g4h3i2j"
}

# AFTER 10-30s (via WebSocket)
{
    "status": "completed",
    "job_id": "a1b2c3d4-e5f6-4a5b-9c8d-7e6f5g4h3i2j",
    "result": {
        "score": 6,
        "label": "Kuning",
        "reasoning": "Increased stress with social withdrawal signals",
        "flags": {...},
        "trend_analysis": {
            "7_day_avg": 5.2,
            "trend_direction": "stable",
            "pattern": "cyclical stress (Tue-Fri), better on weekends",
            "recommendation": "Monitor next 3 days, offer mentoring"
        },
        "context_used": {
            "retrieved_journals": 5,
            "date_range": "2024-06-15 to 2024-06-22",
            "avg_similarity": 0.78
        }
    },
    "is_preliminary": false
}
```

---

## 📊 **6. Context Augmentation: Building the Prompt**

### **6.1 Augmented Prompt Structure**

```python
def build_augmented_prompt(current_journal: str, context: dict) -> str:
    """
    Construct enriched system + user prompt with RAG context
    """
    
    # Historical summary
    historical_summary = format_historical_context(context)
    
    # Trend insight
    trend_insight = format_trend_insight(context)
    
    # Augmented user prompt
    augmented_prompt = f"""
HISTORICAL CONTEXT (Last 7 Days):
{historical_summary}

TREND ANALYSIS:
{trend_insight}

TODAY'S JOURNAL:
---
{current_journal}
---

Given the above context and trend, analyze the psychological risk profile.
Focus on: 
1. Whether today's journal represents escalation, maintenance, or improvement
2. Pattern recognition: Is this cycle normal for this worker?
3. Recommendation: What intervention level needed?
"""
    
    return augmented_prompt


def format_historical_context(context: dict) -> str:
    """
    Format 7-day journals into readable summary
    """
    
    journals = context['last_7_days']
    
    summary = f"""
    7-Day Overview (Average Score: {context['avg_score']:.1f}, Trend: {context['trend']})
    
    """
    
    for j in journals:
        summary += f"""
    Date: {j['date']} | Score: {j['score']} | Label: {j['label']} | Similarity: {j['similarity']:.2f}
    "{j['text'][:100]}..."
    """
    
    return summary


def format_trend_insight(context: dict) -> str:
    """
    Provide narrative about trend
    """
    
    scores = [j['score'] for j in context['last_7_days']]
    avg = np.mean(scores)
    
    if context['trend'] == 'stable':
        return f"Baseline stable around score {avg:.1f}. No significant escalation."
    elif context['trend'] == 'improving':
        return f"Positive trend: average improving from {scores[0]} to {scores[-1]}."
    elif context['trend'] == 'deteriorating':
        return f"⚠️ Declining trend: average declining from {scores[0]} to {scores[-1]}. Monitor closely."
    else:
        return "Insufficient data for trend analysis."
```

### **6.2 Example Augmented Output**

```
SYSTEM PROMPT:
[Same as before: Humanis, Konservatif, Spesifik, Kontekstual]

HISTORICAL CONTEXT (Last 7 Days):
7-Day Overview (Average Score: 5.4, Trend: deteriorating)

Date: 2024-06-15 | Score: 4 | Label: Hijau | Similarity: 0.68
"Toko rame, dapet bonus dari bos..."

Date: 2024-06-16 | Score: 5 | Label: Kuning | Similarity: 0.71
"Kerjaan agak numpuk, tapi masih manageable..."

Date: 2024-06-17 | Score: 6 | Label: Kuning | Similarity: 0.79
"Badan capek nih, overload kerjaan..."

Date: 2024-06-18 | Score: 6 | Label: Kuning | Similarity: 0.82
"Stress pakerjaan makin berat. Temen kerja jauh-jauh dari gue..."

Date: 2024-06-19 | Score: 5 | Label: Kuning | Similarity: 0.75
"Weekend, sedikit tenang. Tapi masih ngerasa isolasi dari temen kantor..."

Date: 2024-06-20 | Score: 6 | Label: Kuning | Similarity: 0.80
"Kerjaan Senin-Jumat berat. Kepala pusing, badan capek..."

TREND ANALYSIS:
⚠️ Declining trend: average declining from 4 (Hijau) to 6 (Kuning).
Pattern: Work-related stress escalating Mon-Fri, slight relief on weekends,
         but overall trajectory is deteriorating over 7 days.
Recommendation: Monitor closely. If next journal stays at 6+, escalate to mentoring.
```

---

## 🚀 **7. Performance Optimization & Benchmarks**

### **7.1 Latency Breakdown**

```
┌─────────────────────────────────────────────────────────────────┐
│                    LATENCY ANALYSIS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ FAST PATH (Preliminary result - blocking):                      │
│ ├─ Input parsing + preprocessing: 50ms                          │
│ ├─ LLM call (no RAG, quicker): 1,500ms                         │
│ ├─ Safety override: 20ms                                        │
│ ├─ Response serialization: 10ms                                 │
│ └─ TOTAL FAST PATH: ~1,580ms (1.6s) ✅                         │
│                                                                   │
│ BACKGROUND ENRICHMENT (Async, non-blocking):                    │
│ ├─ Embedding current journal: 50ms                              │
│ ├─ Vector retrieval (similarity search): 100ms                  │
│ ├─ Fetch 7-day journal texts from DB: 150ms                    │
│ ├─ Context aggregation: 50ms                                    │
│ ├─ Build augmented prompt: 50ms                                 │
│ ├─ Full LLM call (with RAG context): 2,000ms                  │
│ ├─ Post-processing & override: 30ms                             │
│ ├─ Database save: 100ms                                         │
│ ├─ Cache update: 50ms                                           │
│ ├─ Alert notification (if needed): 500ms                        │
│ └─ TOTAL BACKGROUND: ~3,080ms (3.1s) ✅                        │
│                                                                   │
│ USER EXPERIENCE:                                                 │
│ t=0s:     User submits journal                                  │
│ t=1.6s:   Score appears on dashboard (preliminary)             │
│ t=3.1s:   Trend analysis appears (WebSocket update)            │
│ t=5s:     Alert sent if needed (Bapas notified)               │
│                                                                   │
│ Total time to full result: ~3-5 seconds ✅ (excellent UX)      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### **7.2 Cost & Resource Analysis**

```python
COST BREAKDOWN (per journal analysis):

1. Embedding Generation:
   - Model: all-MiniLM-L6-v2 (local, no API)
   - Cost: ~0.1 cents (electricity only)
   - Time: 50ms

2. Vector Search (pgvector):
   - Database query: ~100ms
   - Cost: ~0.001 cents (Supabase)

3. LLM Calls:
   - Quick call (no context): $0.0002 per call
   - Full call (with context): $0.0005 per call
   - Total LLM cost per journal: ~$0.0007

4. Database Operations:
   - 7-day retrieval + save: ~250ms
   - Cost: ~0.01 cents (Supabase)

5. Caching (Redis):
   - 1 hour TTL per worker
   - Cost: ~$0.0001 (negligible)

TOTAL COST PER ANALYSIS: ~$0.0009 (0.1 cents) 💰

SCALING ESTIMATE (1000 workers, 1 journal/day):
- Daily cost: $0.90
- Monthly cost: ~$27
- Annual cost: ~$330 (+ infrastructure)

Compare:
- Hiring 1 full-time psychologist: $30k+/year
- BinaHub RAG system: $0.3k+/year 💎
```

### **7.3 Throughput & Concurrency**

```python
# System can handle concurrent requests:

Assumptions:
- API server: 4 CPU cores, 8GB RAM
- FastAPI async: 1000s concurrent connections
- LLM provider: Rate limit ~100 requests/minute per account

Bottleneck Analysis:
┌──────────────────────┬──────────┬──────────────────────┐
│ Component            │ Limit    │ Status               │
├──────────────────────┼──────────┼──────────────────────┤
│ API server           │ unlimited│ ✅ Async handles 1000s│
│ Vector DB (pgvector) │ ~500 qps │ ✅ Usually < 10 qps  │
│ LLM API (Azure)      │ ~100 rpm │ ⚠️  Might be limit   │
│ Redis cache          │ unlimited│ ✅ Very fast         │
│ Supabase (Postgres)  │ unlimited│ ✅ Scalable          │
└──────────────────────┴──────────┴──────────────────────┘

For BinaHub scale (100 workers, 1 journal/day):
- 100 journals/day = 0.07 journals/second
- Well under all limits ✅

For enterprise scale (10k workers):
- 10k journals/day = 7 journals/second
- Still comfortable, only LLM rate limit might be concern
- Solution: Batch requests or upgrade Azure tier
```

---

## 🔌 **8. Integration with Dashboard**

### **8.1 Frontend WebSocket Connection**

```javascript
// React component - real-time journal analysis
import { useEffect, useState } from 'react';

export function JournalAnalysis({ workerId, journalText }) {
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Submit journal
  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Fast request
    const response = await fetch('/api/v1/journal/analyze', {
      method: 'POST',
      body: JSON.stringify({
        worker_id: workerId,
        journal_text: journalText
      })
    });
    
    const quickResult = await response.json();
    setJobId(quickResult.job_id);
    setResult(quickResult.quick_result);
    
    // WebSocket for enriched result
    connectWebSocket(quickResult.job_id);
  };

  const connectWebSocket = (job_id) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/analysis/${job_id}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.status === 'completed') {
        setResult(data.result);
        setIsLoading(false);
        ws.close();
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsLoading(false);
    };
  };

  return (
    <div className="journal-analysis">
      <button onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze Journal'}
      </button>
      
      {result && (
        <>
          <ScoreCard score={result.score} label={result.label} />
          
          {result.trend_analysis && (
            <TrendChart 
              avgScore={result.trend_analysis['7_day_avg']}
              trend={result.trend_analysis.trend_direction}
              pattern={result.trend_analysis.pattern}
            />
          )}
          
          <FlagIndicators flags={result.flags} />
          <InterventionRecommendation recommendation={result.trend_analysis?.recommendation} />
        </>
      )}
    </div>
  );
}
```

### **8.2 Dashboard Display: Trend Visualization**

```
┌─────────────────────────────────────────────────────────────────┐
│                   DASHBOARD: Worker Status                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ QUICK METRICS:                                                   │
│ ┌───────────────────┐  ┌───────────────────┐                   │
│ │ Today's Score: 6  │  │ Trend: ⚠️ Declining│                   │
│ │ Label: KUNING     │  │ 7-day Avg: 5.4    │                   │
│ └───────────────────┘  └───────────────────┘                   │
│                                                                   │
│ 7-DAY TREND CHART:                                              │
│                                                                   │
│  Score                                                           │
│    10 |                                                          │
│     8 |          ╱╲                                              │
│     6 |    ╱╲  ╱  ╲  ╱╲  ╱╲  ╱╲  ●                             │
│     4 |  ╱    ╱    ╲╱    ╱  ╲╱     (today)                      │
│     2 |╱                                                         │
│     0 |───────────────────────────────────────────────           │
│        Fri   Sat   Sun  Mon  Tue  Wed  Thu  (today)             │
│                                                                   │
│ PATTERN DETECTED:                                               │
│ • Weekday stress (Mon-Fri): avg 5.8                             │
│ • Weekend relief (Sat-Sun): avg 4.5                             │
│ • Overall trend: Declining from 4 → 6                          │
│ • Social withdrawal signals increasing                           │
│                                                                   │
│ INTERVENTION STATUS:                                            │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ ✓ Recommend: Offer mentoring                            │   │
│ │ ✓ Monitor: Check-in next 2-3 days                      │   │
│ │ ✗ Escalate: Only if reaches score 7+ or signals       │   │
│ │            of relapse/self-harm                        │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│ HISTORICAL CONTEXT USED:                                        │
│ • Retrieved 5 journals from last 7 days                         │
│ • Avg similarity score: 0.78 (high relevance)                   │
│ • Database retrieval: 100ms | LLM analysis: 2000ms            │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 **9. Monitoring & Performance Metrics**

### **9.1 Key Metrics to Track**

```python
# Prometheus metrics for monitoring

from prometheus_client import Counter, Histogram, Gauge

# Latency
latency_histogram = Histogram(
    'rag_analysis_duration_seconds',
    'Total RAG analysis duration',
    buckets=(0.5, 1, 2, 3, 5, 10),
    labelnames=['path', 'status']
)

# Throughput
request_counter = Counter(
    'rag_requests_total',
    'Total RAG requests',
    labelnames=['endpoint', 'status']
)

# Cache hit rate
cache_hits = Counter('cache_hits_total', 'Cache hits', labelnames=['type'])
cache_misses = Counter('cache_misses_total', 'Cache misses', labelnames=['type'])

# Vector search quality
retrieval_quality = Histogram(
    'vector_search_similarity_scores',
    'Top-k similarity scores',
    buckets=(0.3, 0.5, 0.7, 0.85, 0.95)
)

# Cost tracking
llm_cost_counter = Counter(
    'llm_api_cost_usd',
    'Cumulative LLM API cost',
    labelnames=['model']
)

# Define alerts
@app.get("/metrics")
def metrics():
    """Prometheus endpoint"""
    return metrics_registry.collect()
```

### **9.2 Dashboards (using Grafana)**

```
Dashboard 1: RAG System Health
├─ P50/P95/P99 latency (target: <3s for enriched, <2s for quick)
├─ Cache hit rate (target: >70%)
├─ Vector search quality (avg similarity: >0.75)
├─ Error rate (target: <0.5%)
└─ Cost per analysis (target: <$0.001)

Dashboard 2: LLM Performance
├─ Analysis score distribution
├─ Label distribution (Hijau/Kuning/Merah)
├─ Flag trigger rates (self_harm, relapse, violence)
├─ Alert accuracy (vs. manual validation)
└─ Trend detection accuracy

Dashboard 3: Database Performance
├─ Vector DB query latency
├─ Index usage & performance
├─ Supabase connection pool
├─ Backup status
└─ Storage growth
```

---

## 🔐 **10. Privacy & Security Considerations**

### **10.1 Data Security**

```python
# PII Handling in RAG

class RAGDataSecurityManager:
    
    @staticmethod
    def anonymize_for_embedding(journal_text: str) -> str:
        """
        Remove PII before embedding:
        - Names
        - Addresses
        - Phone numbers
        - Email addresses
        """
        import re
        
        # Replace patterns
        text = re.sub(r'\b[A-Z][a-z]+\b', '[NAME]', journal_text)
        text = re.sub(r'\d{3}-\d{3}-\d{4}', '[PHONE]', text)
        text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL]', text)
        
        return text
    
    @staticmethod
    def encrypt_vectors(embedding: np.ndarray, key: bytes) -> bytes:
        """
        Encrypt vectors before storing in pgvector
        (Optional: only if super high security needed)
        """
        from cryptography.fernet import Fernet
        
        cipher = Fernet(key)
        embedding_bytes = embedding.tobytes()
        encrypted = cipher.encrypt(embedding_bytes)
        return encrypted
```

### **10.2 Access Control**

```sql
-- RBAC for RAG data

CREATE TABLE role_permissions (
    role VARCHAR(50),
    resource VARCHAR(100),
    permission VARCHAR(50),
    
    PRIMARY KEY (role, resource, permission)
);

INSERT INTO role_permissions VALUES
-- Admin can see all data
('admin', 'rag_analyses', 'read_all'),
('admin', 'journal_embeddings', 'manage'),

-- Bapas (officer) can see their assigned workers
('bapas', 'rag_analyses', 'read_assigned'),
('bapas', 'journal_embeddings', 'read_assigned'),

-- UMKM can only see their own workers
('umkm', 'rag_analyses', 'read_own_workers'),
('umkm', 'journal_embeddings', 'read_own_workers'),

-- Worker can only see own data
('worker', 'rag_analyses', 'read_self'),
('worker', 'journal_embeddings', 'read_self');
```

---

## 📋 **11. Deployment Checklist**

```
RAG System Deployment Phase:

PRE-DEPLOYMENT (Week 13-14):
├─ [ ] Vector embedding model tested locally (all-MiniLM-L6-v2)
├─ [ ] pgvector extension enabled on Supabase
├─ [ ] Database schema deployed (embeddings table + indices)
├─ [ ] Redis instance set up (cache layer)
├─ [ ] FastAPI app deployed to Azure App Service / Railway
├─ [ ] WebSocket infrastructure tested
└─ [ ] Load testing: 100 concurrent requests

PRODUCTION DEPLOYMENT (Week 15+):
├─ [ ] Monitoring setup (Prometheus + Grafana)
├─ [ ] Logging configured (CloudWatch / ELK)
├─ [ ] Error alerting set up (Slack notifications)
├─ [ ] Database backup automated (daily)
├─ [ ] Rate limiting configured (per worker, per IP)
├─ [ ] Gradual rollout: 10% → 50% → 100% users
├─ [ ] User documentation & training
├─ [ ] Bapas/Admin trained on new RAG features
└─ [ ] SLA defined: 99.9% uptime, <3s latency

POST-DEPLOYMENT (Week 16+):
├─ [ ] Monitor metrics daily (first week)
├─ [ ] Collect feedback from Bapas/UMKM
├─ [ ] Iterate on system prompt if needed
├─ [ ] Fine-tune embedding model on real data (optional)
├─ [ ] Expand to other languages (if needed)
└─ [ ] Plan Phase 2 enhancements
```

---

## 🎯 **12. Roadmap: MVP → Production → Scale**

### **Phase 1: MVP (Current - Week 7-12)**
- ✅ LLM analysis without RAG context
- ✅ 200 synthetic dataset
- ✅ Basic dashboard
- ❌ No trend analysis

### **Phase 2: RAG Integration (Week 13-15)**
- ✅ Vector embeddings (all-MiniLM-L6-v2)
- ✅ pgvector similarity search
- ✅ 7-day context retrieval
- ✅ Trend analysis
- ✅ Fast-path + background enrichment API
- ✅ Real-time WebSocket updates
- ✅ Production monitoring

### **Phase 3: Advanced Features (Week 16+)**
- [ ] Fine-tune embedding model on validated ex-napi journals
- [ ] Multi-modal: video journal analysis
- [ ] Causal inference: what interventions actually work?
- [ ] Personalized recommendation engine
- [ ] Cross-worker pattern analysis
- [ ] Predictive escalation (forecast crisis before it happens)

---

## ✅ **Summary: RAG Benefits**

```
With RAG:
✅ Detect trend escalation → intervene early
✅ Understand individual baselines → personalized alerts
✅ Provide context for human decision-makers
✅ Reduce false positives (know if "this is normal for them")
✅ Build accountability: "here's the 7-day context"

Timeline Impact:
├─ Without RAG: score = binary signal (alert or not)
├─ With RAG: score + trend + pattern = holistic view
└─ Result: Better interventions, fewer false alarms, higher trust

Cost Impact:
├─ Additional LLM calls: ~30% more API cost
├─ Vector DB: negligible (<$1/month at scale)
├─ Infrastructure: covered by existing Supabase tier
└─ ROI: Excellent (tiny additional cost for massive UX improvement)
```

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*For: BinaHub RAG Implementation*
