-- ==============================================================================
-- Migration: Create Tasks table, RAG schemas (pgvector) and Realtime configs
-- ==============================================================================

-- 1. Tasks Table (for proof of work)
CREATE TYPE task_status AS ENUM ('todo', 'waiting_approval', 'approved', 'rejected');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status NOT NULL DEFAULT 'todo',
    proof_text TEXT,
    proof_media_url TEXT,
    proof_media_type VARCHAR(50),
    feedback TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RAG System Setup
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE journal_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_id UUID NOT NULL UNIQUE REFERENCES checkins(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id),
  
  -- Vector (384-dim untuk all-MiniLM-L6-v2)
  embedding vector(384),
  
  embedding_model VARCHAR(50) DEFAULT 'all-MiniLM-L6-v2',
  embedding_created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(journal_id)
);

CREATE INDEX idx_journal_embeddings_vector 
  ON journal_embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

CREATE TABLE worker_context_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL UNIQUE REFERENCES users(id),
  
  last_7_days_summary TEXT,
  avg_score_7d FLOAT,
  trend_direction VARCHAR(20),
  
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  cache_ttl INTERVAL DEFAULT '1 hour'
);

CREATE INDEX idx_worker_context ON worker_context_cache(worker_id);

CREATE TABLE rag_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES users(id),
  journal_id UUID NOT NULL REFERENCES checkins(id),
  
  analysis_timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  retrieved_journals_count INT,
  similarity_scores FLOAT8[],
  
  rag_score INT,
  rag_label VARCHAR(10),
  rag_reasoning TEXT,
  trend_analysis TEXT,
  
  retrieval_time_ms INT,
  llm_inference_time_ms INT,
  total_latency_ms INT,
  
  model_version VARCHAR(20)
);

CREATE INDEX idx_rag_analyses_worker ON rag_analyses(worker_id, analysis_timestamp DESC);
CREATE INDEX idx_rag_analyses_journal ON rag_analyses(journal_id);

-- 3. Enable Realtime
-- This requires checking if supabase_realtime publication exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
