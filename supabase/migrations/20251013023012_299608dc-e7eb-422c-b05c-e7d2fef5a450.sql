-- Move pg_net extension from public schema to extensions schema (security best practice)
-- This prevents potential security issues with extensions in public schema

-- Drop extension from public schema
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Install pg_net in extensions schema
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on extensions schema to necessary roles
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Update any existing function references to pg_net
-- (The extension will now be accessed via extensions.http_post, etc.)

COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions to improve security and organization';