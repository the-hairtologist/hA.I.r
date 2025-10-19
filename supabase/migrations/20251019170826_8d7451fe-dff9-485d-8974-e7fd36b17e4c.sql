-- Fix stylist_todos table to use user_id instead of stylist_id
-- This aligns with the RLS policies which expect stylist_id = auth.uid()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own todos" ON stylist_todos;
DROP POLICY IF EXISTS "Users can delete their own todos" ON stylist_todos;
DROP POLICY IF EXISTS "Users can update their own todos" ON stylist_todos;
DROP POLICY IF EXISTS "Users can view their own todos" ON stylist_todos;

-- Rename column
ALTER TABLE stylist_todos RENAME COLUMN stylist_id TO user_id;

-- Recreate policies with corrected logic
CREATE POLICY "Users can create their own todos"
  ON stylist_todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON stylist_todos FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON stylist_todos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own todos"
  ON stylist_todos FOR SELECT
  USING (auth.uid() = user_id);