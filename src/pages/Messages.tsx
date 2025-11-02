import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  getConversationsByUser,
  getMessageThread,
} from '@/lib/queries/messageQueries';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  Upload,
  Video,
  Loader2,
  User,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { format } from 'date-fns';
import { NewConversationDialog } from '@/components/NewConversationDialog';
import { KeyboardShortcutHint } from '@/components/KeyboardShortcut';
import { logger } from '@/lib/logging/productionLogger';

const Messages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: roleLoading } = useUserRole(user?.id);

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { handleSubmit: sendMessage, isSubmitting: sending } = useFormSubmit(
    async () => {
      if (!messageText.trim() || !selectedConversation) {
        throw new Error('Cannot send empty message');
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.from('messages').insert({
        sender_id: session.user.id,
        recipient_id: selectedConversation.id,
        message_text: messageText.trim(),
      });

      if (error) throw error;

      setMessageText('');
      await loadMessages(selectedConversation.id);
      await loadConversations(session.user.id);
    },
    {
      successMessage: undefined, // Silent success (realtime will update)
      errorMessage: 'Failed to send message',
      preventDoubleSubmit: true,
    }
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Enter to send message (if not shift+enter for newline)
      if (
        e.key === 'Enter' &&
        !e.shiftKey &&
        selectedConversation &&
        messageText.trim() &&
        !sending
      ) {
        e.preventDefault();
        sendMessage();
      }
      // Escape to close conversation
      if (e.key === 'Escape' && selectedConversation) {
        setSelectedConversation(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedConversation, messageText, sending, sendMessage]);

  useEffect(() => {
    if (!authLoading && !roleLoading && user && roles.length > 0) {
      const primaryRole = roles.includes('stylist') ? 'stylist' : roles[0];
      setUserRole(primaryRole);
      loadData(user);
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, roleLoading, user, roles]);

  useEffect(() => {
    if (!user) return;

    // Set up realtime subscription for all messages
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          logger.debug('Realtime message update', { payload });

          // Reload data when any message changes
          if (user) {
            loadData(user);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async (sessionUser: any) => {
    try {
      if (!sessionUser) {
        navigate('/auth');
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      setUserProfile(profile);

      // Get conversations
      await loadConversations(sessionUser.id);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Error loading messages');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async (userId: string) => {
    try {
      // Use optimized query with request deduplication
      const allMessages = await getConversationsByUser(userId);

      if (!allMessages) return;

      // Group by conversation partner
      const conversationsMap = new Map();

      allMessages.forEach((msg: any) => {
        const partnerId =
          msg.sender_id === userId ? msg.recipient_id : msg.sender_id;
        const partner = msg.sender_id === userId ? msg.recipient : msg.sender;

        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, {
            id: partnerId,
            partner: partner,
            lastMessage: msg,
            unreadCount: msg.recipient_id === userId && !msg.is_read ? 1 : 0,
          });
        } else {
          const conv = conversationsMap.get(partnerId);
          if (msg.recipient_id === userId && !msg.is_read) {
            conv.unreadCount++;
          }
        }
      });

      setConversations(Array.from(conversationsMap.values()));
    } catch (error: any) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // Use optimized query with request deduplication
      const data = await getMessageThread(session.user.id, partnerId);

      setMessages(data || []);

      // Mark messages as read
      const unreadMessages = data?.filter(
        (msg: any) => msg.recipient_id === session.user.id && !msg.is_read
      );

      if (unreadMessages && unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in(
            'id',
            unreadMessages.map((msg: any) => msg.id)
          );
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const subscribeToMessages = (partnerId: string) => {
    const channel = supabase
      .channel(`messages-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (
              (payload.new.sender_id === partnerId &&
                payload.new.recipient_id === session?.user.id) ||
              (payload.new.sender_id === session?.user.id &&
                payload.new.recipient_id === partnerId)
            ) {
              loadMessages(partnerId);
              loadConversations(session?.user.id || '');
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleStartConversation = (partnerId: string) => {
    const partner = { id: partnerId };
    setSelectedConversation(partner);
    loadMessages(partnerId);
  };

  const handleVideoUpload = async (file: File) => {
    if (!selectedConversation) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // Validate file size (50MB limit)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Video must be less than 50MB');
      return;
    }

    setUploading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-videos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('client-videos').getPublicUrl(fileName);

      const { error } = await supabase.from('messages').insert({
        sender_id: session.user.id,
        recipient_id: selectedConversation.id,
        video_url: publicUrl,
        message_text: 'Sent a video',
      });

      if (error) throw error;

      toast.success('Video sent successfully!');
      await loadMessages(selectedConversation.id);
      await loadConversations(session.user.id);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error('Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
      <PageHeader
        title="Messages"
        icon={<MessageSquare className="h-6 w-6" />}
        backTo="/dashboard"
        actions={
          <Button
            size="sm"
            onClick={() => setNewConversationOpen(true)}
            className="border-2 border-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full flex gap-4 py-4">
          {/* Conversations List */}
          <Card className="w-80 flex flex-col border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-yellow-300">
            <CardHeader>
              <CardTitle className="font-pixel text-foreground">
                Conversations
              </CardTitle>
              <CardDescription className="text-foreground/80 font-sans font-medium">
                Your recent chats
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-foreground/40" />
                  <p className="text-sm font-sans font-semibold text-foreground mb-1">
                    No conversations yet
                  </p>
                  <p className="text-xs font-sans text-foreground/70 mb-3">
                    Start chatting with stylists or clients
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNewConversationOpen(true)}
                    className="border-2 border-foreground"
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Start a Chat
                  </Button>
                </div>
              ) : (
                conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/50 ${
                      selectedConversation?.id === conv.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedConversation(conv)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm truncate">
                            {conv.partner?.full_name || conv.partner?.email}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage?.message_text || 'Video message'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(
                            new Date(conv.lastMessage?.created_at),
                            'MMM d, h:mm a'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-blue-400 to-cyan-400">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-card/20 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-primary-foreground mb-2">
                    Ready to Connect?
                  </h3>
                  <p className="text-primary-foreground/80 mb-4">
                    Select a conversation or start a new chat to begin messaging
                  </p>
                  <Button
                    onClick={() => setNewConversationOpen(true)}
                    className="bg-card text-primary hover:bg-card/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversation.partner?.full_name ||
                          selectedConversation.partner?.email}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {selectedConversation.partner?.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(message => {
                    const isOwnMessage = message.sender_id === userProfile?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div
                          className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            {message.video_url ? (
                              <div className="space-y-2">
                                <video
                                  src={message.video_url}
                                  controls
                                  className="rounded-lg max-w-full"
                                  style={{ maxHeight: '300px' }}
                                />
                                <p className="text-sm">
                                  {message.message_text}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.message_text}
                              </p>
                            )}
                          </div>
                          <p
                            className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}
                          >
                            {format(new Date(message.created_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="mb-2 px-1">
                    <KeyboardShortcutHint
                      shortcut="Enter"
                      description="Send message"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      id="video-upload"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file);
                      }}
                      disabled={uploading}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        document.getElementById('video-upload')?.click()
                      }
                      disabled={uploading}
                      title="Upload video"
                      aria-label="Upload video"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Video className="h-4 w-4" />
                      )}
                    </Button>
                    <Textarea
                      placeholder="Type your message... (Shift+Enter for new line)"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => {
                        if (
                          e.key === 'Enter' &&
                          !e.shiftKey &&
                          !sending &&
                          messageText.trim()
                        ) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={sending}
                      className="min-h-[60px] max-h-[120px] resize-none"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!messageText.trim() || sending}
                      size="icon"
                      className="h-[60px] w-[60px] min-h-[44px]"
                      aria-label={sending ? 'Sending message' : 'Send message'}
                      aria-busy={sending}
                    >
                      {sending ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <NewConversationDialog
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        userRole={userRole}
        onConversationStarted={handleStartConversation}
      />
    </div>
  );
};

export default Messages;
