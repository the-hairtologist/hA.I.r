import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, MessageSquare, Loader2, AlertTriangle, Send } from 'lucide-react';
import { useSmartAutomation } from '@/hooks/useSmartAutomation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ReEngagementDialogProps {
  selectedClients: Array<{
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    last_appointment_date?: string | null;
  }>;
  stylistId: string;
}

export const ReEngagementDialog: React.FC<ReEngagementDialogProps> = ({
  selectedClients,
  stylistId,
}) => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const { smartReminders, loading: loadingReminders, refreshReminders } = useSmartAutomation(stylistId);

  useEffect(() => {
    if (open && stylistId) {
      refreshReminders();
    }
  }, [open, stylistId]);

  // Filter reminders for selected clients
  const relevantReminders = smartReminders.filter(reminder =>
    selectedClients.some(client => client.id === reminder.clientId)
  );

  const handleSendMessages = async () => {
    if (selectedClients.length === 0) {
      toast.error('No clients selected');
      return;
    }

    setSending(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const client of selectedClients) {
        const reminder = relevantReminders.find(r => r.clientId === client.id);
        const message = customMessage || reminder?.message || `Hi ${client.full_name || 'there'}! We'd love to see you again. Book your next appointment today!`;

        try {
          // Send via SMS/Email based on what's available
          if (client.phone) {
            await supabase.functions.invoke('send-sms-notification', {
              body: {
                to: client.phone,
                message: message,
                clientId: client.id,
                stylistId: stylistId,
              },
            });
            successCount++;
          } else if (client.email) {
            // Fallback to email if no phone
            await supabase.functions.invoke('send-email-notification', {
              body: {
                to: client.email,
                subject: 'We Miss You!',
                message: message,
                clientId: client.id,
                stylistId: stylistId,
              },
            });
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Failed to send message to ${client.full_name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} message${successCount > 1 ? 's' : ''}!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to send ${errorCount} message${errorCount > 1 ? 's' : ''}`);
      }

      setOpen(false);
      setCustomMessage('');
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages');
    } finally {
      setSending(false);
    }
  };

  if (selectedClients.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className="gap-2"
          disabled={selectedClients.length === 0}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Re-Engage</span>
          <Badge variant="secondary" className="ml-1">
            {selectedClients.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Re-Engagement Campaign
          </DialogTitle>
          <DialogDescription>
            Send personalized messages to {selectedClients.length} selected client{selectedClients.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning for clients without contact info */}
          {selectedClients.some(c => !c.email && !c.phone) && (
            <Card className="border-2 border-destructive/50 bg-destructive/5">
              <CardContent className="pt-4">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Missing Contact Information</p>
                    <p className="text-muted-foreground">
                      {selectedClients.filter(c => !c.email && !c.phone).length} client(s) don't have email or phone. 
                      They won't receive messages.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI-Generated Message Previews */}
          {loadingReminders ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Generating personalized messages...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-medium">AI-Generated Message Previews</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {relevantReminders.slice(0, 3).map((reminder, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium">{reminder.clientName}</p>
                        <Badge variant={reminder.urgency === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {reminder.urgency} priority
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Optimal send time: {format(new Date(reminder.suggestedTime), 'EEE, MMM d @ h:mm a')}
                      </p>
                      <p className="text-sm bg-muted p-2 rounded">{reminder.message}</p>
                    </CardContent>
                  </Card>
                ))}
                {relevantReminders.length > 3 && (
                  <p className="text-xs text-center text-muted-foreground">
                    + {relevantReminders.length - 3} more personalized message{relevantReminders.length - 3 > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Custom Message Override */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Custom Message (Optional)</label>
            <Textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Override AI messages with your own text..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to use AI-personalized messages for each client
            </p>
          </div>

          {/* Selected Clients List */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipients ({selectedClients.length})</label>
            <div className="max-h-40 overflow-y-auto space-y-1 p-2 border rounded-lg bg-muted/20">
              {selectedClients.map((client) => (
                <div key={client.id} className="flex items-center justify-between text-sm p-2 bg-background rounded">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{client.full_name || 'Unnamed Client'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {client.phone && <MessageSquare className="h-3 w-3" />}
                    {client.email && <Mail className="h-3 w-3" />}
                    {!client.phone && !client.email && (
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessages}
              disabled={sending || selectedClients.length === 0}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Messages
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
