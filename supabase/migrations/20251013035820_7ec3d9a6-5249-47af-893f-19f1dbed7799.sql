-- Drop trigger and function, then recreate with proper search_path
DROP TRIGGER IF EXISTS trigger_update_ai_conversation_timestamp ON public.ai_conversation_messages;
DROP FUNCTION IF EXISTS update_ai_conversation_updated_at() CASCADE;

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION update_ai_conversation_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.ai_conversations
  SET updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER trigger_update_ai_conversation_timestamp
  AFTER INSERT ON public.ai_conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_conversation_updated_at();