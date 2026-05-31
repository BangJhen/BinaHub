-- ==============================================================================
-- Migration: Create Storage Bucket and RLS Policies for worker-media
-- ==============================================================================

-- 1. Create a new storage bucket named 'worker-media'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('worker-media', 'worker-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS for storage.objects
-- Note: 'storage.objects' is the table where all files are listed.
-- Assuming workers can insert into their own folders, or just any authenticated user can insert.
-- For simplicity, let's allow all authenticated users to insert files into 'worker-media' bucket.

CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'worker-media');

CREATE POLICY "Allow public read access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'worker-media');

CREATE POLICY "Allow authenticated update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'worker-media');

CREATE POLICY "Allow authenticated delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'worker-media');
