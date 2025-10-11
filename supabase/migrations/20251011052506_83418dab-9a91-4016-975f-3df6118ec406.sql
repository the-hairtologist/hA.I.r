-- Phase 1: Add video analysis support to client_hair_posts
ALTER TABLE client_hair_posts
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS video_analysis jsonb;

-- Add comment for documentation
COMMENT ON COLUMN client_hair_posts.video_url IS 'URL to uploaded video file in storage';
COMMENT ON COLUMN client_hair_posts.video_analysis IS 'JSON object containing AI analysis of video: texture, movement, condition, damage_level, recommendations';

-- Update storage policy for videos (if needed)
-- Ensure client-videos bucket allows authenticated users to upload
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('client-videos', 'client-videos', false, 52428800, ARRAY['video/mp4', 'video/quicktime', 'video/webm'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/quicktime', 'video/webm'];