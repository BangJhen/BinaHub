-- ==============================================================================
-- Migration: Add AI analysis columns to checkins table
-- Run this in Supabase Dashboard > SQL Editor
-- ==============================================================================

ALTER TABLE checkins 
ADD COLUMN IF NOT EXISTS ai_score INT CHECK (ai_score >= 1 AND ai_score <= 10),
ADD COLUMN IF NOT EXISTS ai_label VARCHAR(10) CHECK (ai_label IN ('Hijau', 'Kuning', 'Merah')),
ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
ADD COLUMN IF NOT EXISTS ai_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS dominant_emotions TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS intervention_note TEXT,
ADD COLUMN IF NOT EXISTS trend_direction VARCHAR(20);

-- Index for quick lookup by label (for UMKM dashboard filtering)
CREATE INDEX IF NOT EXISTS idx_checkins_ai_label ON checkins(worker_id, ai_label, submitted_at DESC);

-- ==============================================================================
-- Stored Procedure for pgvector similarity search (used by RAG Retriever)
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_journals_7d(
  query_embedding vector(384),
  worker_id_param UUID,
  match_count INT DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  date DATE,
  text TEXT,
  score INT,
  label VARCHAR,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    c.id,
    c.submitted_at::DATE as date,
    c.content as text,
    c.ai_score as score,
    c.ai_label as label,
    1 - (je.embedding <=> query_embedding) AS similarity
  FROM checkins c
  JOIN journal_embeddings je ON c.id = je.journal_id
  WHERE c.worker_id = worker_id_param
    AND c.submitted_at >= NOW() - INTERVAL '7 days'
    AND c.submitted_at < NOW()
    AND c.ai_score IS NOT NULL
  ORDER BY je.embedding <=> query_embedding
  LIMIT match_count;
$$;
