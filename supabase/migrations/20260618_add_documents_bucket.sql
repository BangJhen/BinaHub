-- ==============================================================================
-- Migration: Create Storage Bucket 'documents' for registration file uploads
-- ==============================================================================
-- The signup server action (actions.ts) uploads worker CV / legal documents
-- to this bucket using the service role key (bypasses RLS).
-- We still define RLS policies for future non-admin access patterns.
-- ==============================================================================

-- 1. Create the 'documents' bucket (private — only admins / service role can read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,                          -- private bucket
  5242880,                        -- 5 MB
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies (service role bypasses these, but they protect against anon access)

-- Only service role / authenticated admin can read documents
CREATE POLICY "documents_select_authenticated"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Only service role can insert (registration upload uses service role)
CREATE POLICY "documents_insert_service"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'documents');

-- Only service role can update
CREATE POLICY "documents_update_service"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'documents');

-- Only service role can delete
CREATE POLICY "documents_delete_service"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'documents');
