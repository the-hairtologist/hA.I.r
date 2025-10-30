import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Shield, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface AdminFeedbackActionsProps {
  feedbackId: string;
  currentStatus: string;
  currentPriority: string;
  currentAdminResponse?: string;
}

export const AdminFeedbackActions = ({
  feedbackId,
  currentStatus,
  currentPriority,
  currentAdminResponse,
}: AdminFeedbackActionsProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [priority, setPriority] = useState(currentPriority);
  const [adminResponse, setAdminResponse] = useState(
    currentAdminResponse || ''
  );

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('product_feedback')
        .update({
          status,
          priority,
          admin_response: adminResponse.trim() || null,
        })
        .eq('id', feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Feedback updated', 'Changes saved successfully');
      queryClient.invalidateQueries({ queryKey: ['product_feedback'] });
      setIsOpen(false);
    },
    onError: error => {
      toast.error('Update failed', error.message);
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-2 hover:bg-primary/5"
        >
          <Shield className="h-4 w-4" />
          Moderate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Moderation
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">🆕 New</SelectItem>
                <SelectItem value="under_review">👀 Under Review</SelectItem>
                <SelectItem value="planned">📋 Planned</SelectItem>
                <SelectItem value="in_progress">⚡ In Progress</SelectItem>
                <SelectItem value="completed">✅ Completed</SelectItem>
                <SelectItem value="wont_fix">❌ Won't Fix</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority" className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🔴 High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-response">Team Response</Label>
            <Textarea
              id="admin-response"
              placeholder="Add a response to the user..."
              value={adminResponse}
              onChange={e => setAdminResponse(e.target.value)}
              rows={4}
              maxLength={500}
              className="border-2 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {adminResponse.length}/500
            </p>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? (
              <>
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
