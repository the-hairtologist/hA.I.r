import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/productionLogger';

interface ConversationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: any[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onConversationsChange: () => void;
}

export const ConversationSelector = ({
  open,
  onOpenChange,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onConversationsChange,
}: ConversationSelectorProps) => {
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Conversation deleted');
      onConversationsChange();

      if (id === currentConversationId) {
        onNewConversation();
      }
    } catch (error: any) {
      logger.error('Error deleting conversation', error, {
        component: 'ConversationSelector',
        conversationId: id,
      });
      toast.error('Failed to delete conversation');
    }
  };

  const handleSelect = (id: string) => {
    onSelectConversation(id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversation History
          </DialogTitle>
          <DialogDescription>
            Continue a previous conversation or start a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={() => {
              onNewConversation();
              onOpenChange(false);
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>

          <ScrollArea className="h-[min(70vh,400px)] pr-4">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No previous conversations yet
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelect(conv.id)}
                    className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      conv.id === currentConversationId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conv.title || 'Untitled Conversation'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(conv.updated_at), {
                            addSuffix: true,
                          })}
                        </p>
                        {conv.context_type === 'client' && (
                          <p className="text-xs text-accent mt-1">
                            📋 Client Context
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={e => handleDelete(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
