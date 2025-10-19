import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TeamMessage {
  id: string;
  stylist_id: string;
  message: string;
  created_at: string;
  stylist_profiles?: {
    business_name: string;
  };
}

interface TeamChatProps {
  stylistId: string;
}

export function TeamChat({ stylistId }: TeamChatProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel('team-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_messages'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new as TeamMessage]);
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('team_messages')
      .select('*, stylist_profiles(business_name)')
      .order('created_at', { ascending: true })
      .limit(100);
    
    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('team_messages')
        .insert({
          stylist_id: stylistId,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      toast({
        title: 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm">
                  {msg.stylist_profiles?.business_name || 'Stylist'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(msg.created_at), 'h:mm a')}
                </span>
              </div>
              <p className="text-sm bg-muted p-2 rounded-lg">{msg.message}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
