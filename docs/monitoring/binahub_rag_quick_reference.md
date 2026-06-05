# BinaHub RAG System - Quick Reference & Code Examples

---

## 🎯 **Quick Architecture Overview**

```
USER SUBMITS JOURNAL
        ↓
    [FAST PATH - < 2s]
        ↓
   Quick LLM Call (no context)
        ↓
Return preliminary score to dashboard ✅
        ↓
[BACKGROUND ENRICHMENT - async, 10-30s]
        ↓
Retrieve 7-day history from vector DB
        ↓
Build augmented prompt with trend
        ↓
Full LLM call with RAG context
        ↓
Update dashboard with trend analysis ✅
        ↓
Send alert if crisis detected
```

---

## 💾 **Database Schema (Copy-Paste Ready)**

```sql
-- ============================================================
-- 1. Main journals table (sudah ada, no changes)
-- ============================================================
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ============================================================
-- 2. NEW: Enable pgvector extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 3. NEW: Vector embeddings table
-- ============================================================
CREATE TABLE journal_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL UNIQUE REFERENCES journals(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id),
  
  -- Vector (384-dim untuk all-MiniLM-L6-v2)
  embedding vector(384),
  
  embedding_model VARCHAR(50) DEFAULT 'all-MiniLM-L6-v2',
  embedding_created_at TIMESTAMP DEFAULT NOW(),
  
  -- Indices
  UNIQUE(journal_id),
  UNIQUE(worker_id, embedding_created_at)
);

-- Create vector index (cosine similarity)
CREATE INDEX idx_journal_embeddings_vector 
  ON journal_embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Date-based index for fast 7-day retrieval
CREATE INDEX idx_journals_date 
  ON journals(worker_id, date DESC);

-- ============================================================
-- 4. NEW: Worker context cache (optional but recommended)
-- ============================================================
CREATE TABLE worker_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL UNIQUE REFERENCES workers(id),
  
  last_7_days_summary TEXT,  -- JSON
  avg_score_7d FLOAT,
  trend_direction VARCHAR(20),
  
  last_updated TIMESTAMP DEFAULT NOW(),
  cache_ttl INTERVAL DEFAULT '1 hour'
);

CREATE INDEX idx_worker_context ON worker_context_cache(worker_id);

-- ============================================================
-- 5. NEW: RAG analysis audit trail
-- ============================================================
CREATE TABLE rag_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id),
  journal_id UUID NOT NULL REFERENCES journals(id),
  
  analysis_timestamp TIMESTAMP DEFAULT NOW(),
  
  -- Retrieval info
  retrieved_journals_count INT,
  similarity_scores FLOAT8[],  -- Top-k similarities
  
  -- Results
  rag_score INT,
  rag_label VARCHAR(10),
  rag_reasoning TEXT,
  trend_analysis TEXT,
  
  -- Performance
  retrieval_time_ms INT,
  llm_inference_time_ms INT,
  total_latency_ms INT,
  
  model_version VARCHAR(20),
  
  FOREIGN KEY (worker_id) REFERENCES workers(id)
);

CREATE INDEX idx_rag_analyses_worker ON rag_analyses(worker_id, analysis_timestamp DESC);
CREATE INDEX idx_rag_analyses_journal ON rag_analyses(journal_id);
```

---

## 🔍 **Vector Search: SQLAlchemy ORM Example**

```python
# ============================================================
# SQLAlchemy models for RAG
# ============================================================

from sqlalchemy import Column, String, Float, DateTime, ARRAY, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
import uuid

class JournalEmbedding(Base):
    __tablename__ = 'journal_embeddings'
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    journal_id = Column(UUID, ForeignKey('journals.id'), unique=True, nullable=False)
    worker_id = Column(UUID, ForeignKey('workers.id'), nullable=False)
    
    # Vector column
    embedding = Column(Vector(384), nullable=False)
    
    embedding_model = Column(String(50), default='all-MiniLM-L6-v2')
    embedding_created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    journal = relationship('Journal')


class RAGAnalysis(Base):
    __tablename__ = 'rag_analyses'
    
    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    worker_id = Column(UUID, ForeignKey('workers.id'), nullable=False)
    journal_id = Column(UUID, ForeignKey('journals.id'), nullable=False)
    
    analysis_timestamp = Column(DateTime, default=datetime.utcnow)
    
    retrieved_journals_count = Column(Integer)
    similarity_scores = Column(ARRAY(Float))
    
    rag_score = Column(Integer)
    rag_label = Column(String(10))
    rag_reasoning = Column(Text)
    trend_analysis = Column(Text)
    
    retrieval_time_ms = Column(Integer)
    llm_inference_time_ms = Column(Integer)
    total_latency_ms = Column(Integer)
    
    model_version = Column(String(20))

# ============================================================
# Vector similarity search using SQLAlchemy
# ============================================================

from sqlalchemy import func
from datetime import timedelta

def retrieve_similar_journals(
    session: Session,
    worker_id: UUID,
    embedding_vector: np.ndarray,
    k: int = 5,
    days: int = 7
) -> List[dict]:
    """
    Find top-k similar journals from last N days using pgvector
    """
    
    # Create vector from numpy array
    from pgvector.sqlalchemy import Vector
    query_vector = Vector(embedding_vector.tolist())
    
    cutoff_date = datetime.utcnow().date() - timedelta(days=days)
    
    results = (
        session.query(
            Journal.id,
            Journal.text_content,
            Journal.score,
            Journal.label,
            Journal.date,
            # Cosine similarity: 1 - (a <=> b)
            (1 - func.cast(
                JournalEmbedding.embedding.op('<=>')(query_vector),
                Float
            )).label('similarity')
        )
        .join(JournalEmbedding, Journal.id == JournalEmbedding.journal_id)
        .filter(
            JournalEmbedding.worker_id == worker_id,
            Journal.date >= cutoff_date,
            Journal.date < datetime.utcnow().date()  # Exclude today
        )
        .order_by(JournalEmbedding.embedding.op('<=>')(query_vector))  # Closest first
        .limit(k)
        .all()
    )
    
    return [
        {
            'id': r.id,
            'text': r.text_content,
            'score': r.score,
            'label': r.label,
            'date': r.date.isoformat(),
            'similarity': float(r.similarity)
        }
        for r in results
    ]
```

---

## ⚡ **FastAPI Endpoint: Complete Example**

```python
# ============================================================
# FastAPI server with RAG integration
# ============================================================

from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
import json
from typing import Optional
import time
from datetime import datetime
import uuid

app = FastAPI()

# ============================================================
# Dependencies
# ============================================================

class RAGService:
    def __init__(self, db_session, redis_client, llm_client, embedding_model):
        self.db = db_session
        self.redis = redis_client
        self.llm = llm_client
        self.embedding = embedding_model
        
    async def analyze_with_rag(self, worker_id: str, journal_text: str) -> dict:
        """
        Full RAG analysis pipeline
        """
        start_time = time.time()
        
        # 1. Generate embedding
        embedding = self.embedding.encode(journal_text)
        
        # 2. Retrieve context (5 similar journals from last 7 days)
        retrieval_start = time.time()
        similar_journals = retrieve_similar_journals(
            self.db, worker_id, embedding, k=5
        )
        retrieval_time = time.time() - retrieval_start
        
        # 3. Build augmented prompt
        context_str = self._format_context(similar_journals)
        augmented_prompt = f"""
HISTORICAL CONTEXT (Last 7 Days):
{context_str}

TODAY'S JOURNAL:
---
{journal_text}
---

Analyze with RAG context."""
        
        # 4. Call LLM with augmented prompt
        llm_start = time.time()
        rag_result = await self.llm.analyze(
            system_prompt=SYSTEM_PROMPT,
            user_prompt=augmented_prompt,
            temperature=0.2
        )
        llm_time = time.time() - llm_start
        
        # 5. Post-processing
        final_result = apply_safety_override(rag_result)
        
        # 6. Log metrics
        total_time = time.time() - start_time
        
        return {
            'result': final_result,
            'metrics': {
                'retrieval_time_ms': int(retrieval_time * 1000),
                'llm_time_ms': int(llm_time * 1000),
                'total_time_ms': int(total_time * 1000),
                'similar_journals_count': len(similar_journals),
                'similarity_scores': [j['similarity'] for j in similar_journals]
            },
            'context': {
                'retrieved_journals': similar_journals
            }
        }
    
    def _format_context(self, journals: list) -> str:
        """Format journals into readable context"""
        lines = []
        for j in journals:
            lines.append(f"""
Date: {j['date']} | Score: {j['score']} | Label: {j['label']} | Similarity: {j['similarity']:.2f}
"{j['text'][:150]}..."
""")
        return "\n".join(lines)


# ============================================================
# Endpoints
# ============================================================

rag_service: Optional[RAGService] = None

@app.on_event("startup")
async def startup():
    global rag_service
    # Initialize RAG service
    from sentence_transformers import SentenceTransformer
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    rag_service = RAGService(
        db_session=get_db_session(),
        redis_client=Redis(),
        llm_client=AzureOpenAIClient(),
        embedding_model=embedding_model
    )

# Store active WebSocket connections
active_connections: dict[str, WebSocket] = {}

@app.post("/api/v1/journal/analyze")
async def analyze_journal(
    request: JournalAnalysisRequest,
    background_tasks: BackgroundTasks
):
    """
    Fast-path API: return preliminary result, enrich in background
    """
    
    worker_id = request.worker_id
    journal_text = request.journal_text
    job_id = str(uuid.uuid4())
    
    # Handle audio
    if request.voice_url:
        journal_text = await transcribe_audio(request.voice_url)
    
    # ===== FAST PATH (no RAG, < 2s) =====
    start = time.time()
    
    # Quick LLM analysis
    quick_result = await rag_service.llm.analyze(
        system_prompt=QUICK_SYSTEM_PROMPT,
        user_prompt=journal_text,
        temperature=0.2
    )
    quick_result = apply_safety_override(quick_result)
    
    fast_latency = time.time() - start
    
    # Cache preliminary result
    cache_key = f"preliminary_result:{job_id}"
    rag_service.redis.setex(
        cache_key,
        3600,  # 1 hour TTL
        json.dumps(quick_result, default=str)
    )
    
    # ===== BACKGROUND ENRICHMENT (async) =====
    background_tasks.add_task(
        rag_enrich_task,
        rag_service=rag_service,
        job_id=job_id,
        worker_id=worker_id,
        journal_text=journal_text,
        quick_result=quick_result
    )
    
    return {
        "status": "analyzing",
        "job_id": job_id,
        "quick_result": quick_result,
        "is_preliminary": True,
        "fast_latency_ms": int(fast_latency * 1000),
        "websocket_url": f"ws://localhost:8000/ws/analysis/{job_id}"
    }


async def rag_enrich_task(
    rag_service,
    job_id: str,
    worker_id: str,
    journal_text: str,
    quick_result: dict
):
    """Background task for RAG enrichment"""
    
    try:
        # Full RAG analysis
        rag_output = await rag_service.analyze_with_rag(worker_id, journal_text)
        
        # Combine results
        enriched_result = {
            **rag_output['result'],
            'trend_analysis': compute_trend_analysis(rag_output['context']),
            'context_metrics': rag_output['metrics']
        }
        
        # Cache enriched result
        rag_service.redis.setex(
            f"enriched_result:{job_id}",
            3600,
            json.dumps(enriched_result, default=str)
        )
        
        # Save to database
        save_rag_analysis(
            worker_id=worker_id,
            job_id=job_id,
            result=enriched_result,
            metrics=rag_output['metrics']
        )
        
        # Notify via WebSocket if client connected
        if job_id in active_connections:
            await active_connections[job_id].send_json({
                "status": "completed",
                "job_id": job_id,
                "result": enriched_result,
                "is_preliminary": False
            })
        
        # Send alert if crisis
        if enriched_result['flags']['crisis_immediate']:
            await send_crisis_alert(worker_id, enriched_result)
        
        print(f"✅ RAG enrichment completed for job {job_id}")
        
    except Exception as e:
        print(f"❌ RAG enrichment failed: {e}")
        if job_id in active_connections:
            await active_connections[job_id].send_json({
                "status": "error",
                "error": str(e)
            })


@app.websocket("/ws/analysis/{job_id}")
async def websocket_analysis(websocket: WebSocket, job_id: str):
    """WebSocket for real-time updates"""
    
    await websocket.accept()
    active_connections[job_id] = websocket
    
    try:
        # Send initial status
        preliminary = rag_service.redis.get(f"preliminary_result:{job_id}")
        if preliminary:
            await websocket.send_json({
                "status": "preliminary_ready",
                "result": json.loads(preliminary)
            })
        
        # Poll for enriched result
        while True:
            enriched = rag_service.redis.get(f"enriched_result:{job_id}")
            if enriched:
                await websocket.send_json({
                    "status": "completed",
                    "result": json.loads(enriched),
                    "is_preliminary": False
                })
                break
            
            # Keep connection alive
            await asyncio.sleep(1)
            try:
                await websocket.send_json({"status": "analyzing"})
            except:
                break  # Client disconnected
    
    except WebSocketDisconnect:
        del active_connections[job_id]
        print(f"Client disconnected: {job_id}")
    except Exception as e:
        del active_connections[job_id]
        print(f"WebSocket error: {e}")


# ============================================================
# Health & Metrics Endpoint
# ============================================================

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "active_connections": len(active_connections)
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics"""
    # Return Prometheus-compatible metrics
    return PlainTextResponse(generate_metrics())
```

---

## 🎯 **Embedding Generation & Caching**

```python
# ============================================================
# Embedding generation with caching
# ============================================================

from sentence_transformers import SentenceTransformer
import hashlib

class EmbeddingCache:
    def __init__(self, redis_client, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        self.redis = redis_client
        self.model_name = model_name
        
    def encode(self, text: str, use_cache=True) -> np.ndarray:
        """
        Encode text with caching
        """
        # Create cache key from text hash
        text_hash = hashlib.md5(text.encode()).hexdigest()
        cache_key = f"embedding:{self.model_name}:{text_hash}"
        
        if use_cache:
            cached = self.redis.get(cache_key)
            if cached:
                return np.frombuffer(cached, dtype=np.float32)
        
        # Generate embedding
        embedding = self.model.encode(text, convert_to_numpy=True)
        
        # Cache for 24 hours (embeddings are deterministic)
        self.redis.setex(
            cache_key,
            86400,  # 24 hours
            embedding.astype(np.float32).tobytes()
        )
        
        return embedding


# ============================================================
# Batch embedding generation (for historical data)
# ============================================================

async def batch_embed_journals(worker_ids: list[str], batch_size=100):
    """
    Generate embeddings for all journals in batch
    Useful for initial setup or backfill
    """
    
    embedding_cache = EmbeddingCache(redis_client)
    
    # Get all journals for workers
    journals = db.query(Journal).filter(
        Journal.worker_id.in_(worker_ids)
    ).all()
    
    print(f"Embedding {len(journals)} journals...")
    
    for i in range(0, len(journals), batch_size):
        batch = journals[i:i+batch_size]
        
        for journal in batch:
            # Skip if already embedded
            existing = db.query(JournalEmbedding).filter(
                JournalEmbedding.journal_id == journal.id
            ).first()
            
            if existing:
                continue
            
            # Generate embedding
            embedding = embedding_cache.encode(journal.text_content)
            
            # Save to database
            db_embedding = JournalEmbedding(
                journal_id=journal.id,
                worker_id=journal.worker_id,
                embedding=embedding,
                embedding_model='all-MiniLM-L6-v2'
            )
            db.add(db_embedding)
        
        db.commit()
        print(f"Processed {min(i+batch_size, len(journals))}/{len(journals)}")
```

---

## 📊 **Trend Analysis Function**

```python
# ============================================================
# Trend analysis from historical data
# ============================================================

import numpy as np
from scipy.stats import linregress
from datetime import datetime

def compute_trend_analysis(context: dict) -> dict:
    """
    Analyze trends from retrieved journal context
    """
    
    journals = context['retrieved_journals']
    if len(journals) < 2:
        return {"status": "insufficient_data"}
    
    scores = [j['score'] for j in journals]
    dates = [j['date'] for j in journals]
    
    # Basic stats
    avg_score = np.mean(scores)
    std_dev = np.std(scores)
    min_score = min(scores)
    max_score = max(scores)
    
    # Trend direction
    first_half_avg = np.mean(scores[:len(scores)//2])
    second_half_avg = np.mean(scores[len(scores)//2:])
    diff = second_half_avg - first_half_avg
    
    if abs(diff) < 1:
        trend_direction = "stable"
    elif diff > 0:
        trend_direction = "deteriorating"
    else:
        trend_direction = "improving"
    
    # Linear regression for slope
    x = np.arange(len(scores))
    slope, intercept, r_value, p_value, std_err = linregress(x, scores)
    
    return {
        "status": "success",
        "average_score": float(avg_score),
        "std_dev": float(std_dev),
        "min_score": int(min_score),
        "max_score": int(max_score),
        "trend_direction": trend_direction,
        "trend_slope": float(slope),
        "trend_r_squared": float(r_value ** 2),
        "summary": f"7-day average: {avg_score:.1f}. {trend_direction.capitalize()} trend (slope: {slope:.2f}/day)"
    }
```

---

## 🔐 **Safety Override (Post-Processing)**

```python
# ============================================================
# Post-processing: Safety critical override
# ============================================================

def apply_safety_override(llm_output: dict) -> dict:
    """
    Ensure safety: any flag → force Merah + alert
    """
    
    # Validate JSON structure
    required_fields = ["score", "label", "flags", "reasoning"]
    if not all(field in llm_output for field in required_fields):
        return {
            "score": 5,
            "label": "Kuning",
            "reasoning": "JSON parsing error - defaulting to cautious",
            "flags": {
                "self_harm_risk": False,
                "relapse_risk": False,
                "violence_risk": False,
                "crisis_immediate": False
            }
        }
    
    # Validate score range
    score = llm_output.get("score", 5)
    if not (1 <= score <= 10):
        score = max(1, min(10, score))
        llm_output["score"] = score
    
    # ⚠️  CRITICAL OVERRIDE
    flags = llm_output.get("flags", {})
    
    if any([
        flags.get("self_harm_risk", False),
        flags.get("relapse_risk", False),
        flags.get("violence_risk", False),
        flags.get("crisis_immediate", False)
    ]):
        # Force to Merah
        llm_output["label"] = "Merah"
        llm_output["score"] = max(8, score)
        
        print(f"⚠️ SAFETY OVERRIDE: Flags triggered: {flags}")
    
    return llm_output
```

---

## 📈 **Monitoring & Logging**

```python
# ============================================================
# Logging & monitoring setup
# ============================================================

import logging
from pythonjsonlogger import jsonlogger

# Configure JSON logging
logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

# Log RAG analysis
def log_rag_analysis(job_id: str, metrics: dict, result: dict):
    """Log analysis metrics for monitoring"""
    
    logger.info(
        "rag_analysis_completed",
        extra={
            "job_id": job_id,
            "retrieval_time_ms": metrics['retrieval_time_ms'],
            "llm_time_ms": metrics['llm_inference_time_ms'],
            "total_time_ms": metrics['total_latency_ms'],
            "score": result['score'],
            "label": result['label'],
            "retrieved_journals": metrics['retrieved_journals_count'],
            "avg_similarity": float(np.mean(metrics['similarity_scores'])) if metrics['similarity_scores'] else 0
        }
    )

# Example output (JSON):
# {
#   "job_id": "a1b2c3d4",
#   "retrieval_time_ms": 120,
#   "llm_time_ms": 2100,
#   "total_time_ms": 3050,
#   "score": 6,
#   "label": "Kuning",
#   "retrieved_journals": 5,
#   "avg_similarity": 0.76
# }
```

---

## 🚀 **Deployment: Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  # FastAPI RAG service
  rag-api:
    build: ./rag-api
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://user:pass@postgres:5432/binahub
      REDIS_URL: redis://redis:6379
      AZURE_OPENAI_KEY: ${AZURE_OPENAI_KEY}
      AZURE_OPENAI_ENDPOINT: ${AZURE_OPENAI_ENDPOINT}
    depends_on:
      - postgres
      - redis
    volumes:
      - ./rag-api:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  # PostgreSQL with pgvector
  postgres:
    image: ankane/pgvector
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: binahub
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Monitoring: Prometheus
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  # Monitoring: Grafana
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
```

---

## 📋 **Checklist: Implementation Roadmap**

```
WEEK 13-14: Foundation
□ Install pgvector on Supabase
□ Create embedding tables + indices
□ Set up Redis cache layer
□ Implement embedding function (all-MiniLM)
□ Write vector similarity search query
□ Batch embed all historical journals

WEEK 14-15: API Development
□ Build FastAPI endpoint /api/v1/journal/analyze
□ Implement fast-path (quick LLM)
□ Implement background enrichment task
□ Set up WebSocket /ws/analysis/{job_id}
□ Add caching layer
□ Error handling & fallbacks

WEEK 15: Testing & Optimization
□ Load test: 100 concurrent requests
□ Benchmark latency (P50/P95/P99)
□ Test vector search quality (similarity scores)
□ Validate trend detection accuracy
□ Test cache hit rates

WEEK 15-16: Production Deployment
□ Set up monitoring (Prometheus + Grafana)
□ Configure alerting (errors, latency)
□ Database backup automation
□ Rate limiting & quotas
□ Gradual rollout (10% → 100%)
□ User training & documentation

WEEK 16+: Monitoring & Iteration
□ Daily metric review (first week)
□ Collect user feedback
□ Refine system prompt if needed
□ Plan Phase 2 enhancements
```

---

*Document Version: 1.0 - Quick Reference*  
*For: Fast implementation of BinaHub RAG*
