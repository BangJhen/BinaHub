/* 
  Migrasi Schema Check-In untuk Dukungan RAG & Guided Prompts
  Tanggal: 30 Mei 2026
*/

-- 1. Tambah kolom rating metrik di tabel checkins (Opsional dari diskusi kita, tapi berguna untuk backup metrik)
-- Kita akan tambahkan physical_rating dan mental_rating.
-- (Bypass error jika kolom sudah ada)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkins' AND column_name='physical_rating') THEN
        ALTER TABLE public.checkins ADD COLUMN physical_rating int2 CHECK (physical_rating >= 1 AND physical_rating <= 5);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='checkins' AND column_name='mental_rating') THEN
        ALTER TABLE public.checkins ADD COLUMN mental_rating int2 CHECK (mental_rating >= 1 AND mental_rating <= 5);
    END IF;
END $$;

-- 2. Buat tabel checkin_answers untuk menyimpan relasi prompt spesifik
CREATE TABLE IF NOT EXISTS public.checkin_answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    checkin_id uuid REFERENCES public.checkins(id) ON DELETE CASCADE,
    prompt_category varchar(100) NOT NULL,
    prompt_question text NOT NULL,
    answer_text text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.checkin_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can insert their own checkin answers" 
    ON public.checkin_answers FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.checkins c 
            WHERE c.id = checkin_id 
            AND c.worker_id = auth.uid()
        )
    );

CREATE POLICY "Workers can view their own checkin answers" 
    ON public.checkin_answers FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.checkins c 
            WHERE c.id = checkin_id 
            AND c.worker_id = auth.uid()
        )
    );
