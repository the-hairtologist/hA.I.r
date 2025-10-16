import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

type MessageType = 'retention' | 'followup' | 'birthday' | 'reengagement';

interface GeneratedMessage {
  subject: string;
  body: string;
  call_to_action: string;
  tone: 'warm' | 'professional' | 'casual';
}

interface MessageContext {
  messageType: MessageType;
  clientName: string;
  lastVisit?: string;
  favoriteServices?: string[];
  stylistName: string;
  customNote?: string;
}

export function useMessageGenerator() {
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<GeneratedMessage | null>(null);

  const generateMessage = async (context: MessageContext) => {
    setGenerating(true);
    
    try {
      logger.info('Generating message', 'MessageGenerator', { 
        type: context.messageType, 
        client: context.clientName 
      });

      const { data, error } = await supabase.functions.invoke('ai-message-generator', {
        body: context,
      });

      if (error) throw error;

      if (data) {
        setMessage(data);
        logger.info('Message generated', 'MessageGenerator', { tone: data.tone });
        toast.success('Message generated successfully');
        return data;
      }

      return null;
    } catch (error) {
      logger.error('Message generation failed', error);
      toast.error('Failed to generate message');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const generateBulkMessages = async (contexts: MessageContext[]) => {
    setGenerating(true);
    const messages: GeneratedMessage[] = [];
    
    try {
      for (const context of contexts) {
        const { data } = await supabase.functions.invoke('ai-message-generator', {
          body: context,
        });
        
        if (data) {
          messages.push(data);
        }
      }
      
      logger.info('Bulk messages generated', 'MessageGenerator', { count: messages.length });
      toast.success(`Generated ${messages.length} messages`);
      return messages;
    } catch (error) {
      logger.error('Bulk message generation failed', error);
      toast.error('Failed to generate messages');
      return [];
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    message,
    generateMessage,
    generateBulkMessages,
  };
}
