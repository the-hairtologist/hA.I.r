
-- Phase 1: Enable Realtime Updates & Storage Tracking

-- 1. Enable realtime on messages table (appointments already has it)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication
  END;
END $$;

-- 2. Enable realtime on client_profiles
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE client_profiles;
  EXCEPTION
    WHEN duplicate_object THEN
      NULL; -- Table already in publication
  END;
END $$;

-- 3. Create function to track storage uploads (for analytics)
CREATE OR REPLACE FUNCTION public.log_storage_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Track file uploads for analytics
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_data
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid),
    'STORAGE_UPLOAD',
    'storage.objects',
    NEW.id,
    jsonb_build_object(
      'bucket_id', NEW.bucket_id,
      'name', NEW.name,
      'size', COALESCE((NEW.metadata->>'size')::bigint, 0)
    )
  );
  RETURN NEW;
END;
$$;

-- 4. Add trigger for storage upload logging
DROP TRIGGER IF EXISTS track_storage_uploads ON storage.objects;
CREATE TRIGGER track_storage_uploads
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_storage_upload();

COMMENT ON FUNCTION public.log_storage_upload IS 'Tracks file uploads to storage buckets for analytics and audit trail';
