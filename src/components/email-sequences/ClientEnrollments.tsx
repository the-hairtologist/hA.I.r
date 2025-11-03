import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { UserPlus, StopCircle, Play, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export const ClientEnrollments = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedSequence, setSelectedSequence] = useState('');

  // Fetch enrollments
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['email_enrollments'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile?.id) return [];

      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select(
          `
          *,
          client:client_profiles!email_sequence_enrollments_client_id_fkey(full_name, email),
          sequence:email_sequences!email_sequence_enrollments_sequence_id_fkey(name, trigger_type)
        `
        )
        .eq('stylist_id', stylistProfile.id)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch stylist's clients
  const { data: clients } = useQuery({
    queryKey: ['stylist_clients'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile?.id) return [];

      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, full_name, email')
        .eq('preferred_stylist_id', stylistProfile.id)
        .order('full_name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch active sequences
  const { data: sequences } = useQuery({
    queryKey: ['active_sequences'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile?.id) return [];

      const { data, error } = await supabase
        .from('email_sequences')
        .select('id, name, trigger_type')
        .eq('stylist_id', stylistProfile.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Check for duplicate enrollment
  const checkDuplicateEnrollment = async () => {
    if (!selectedClient || !selectedSequence) return null;

    const { data } = await supabase
      .from('email_sequence_enrollments')
      .select('id, status')
      .eq('client_id', selectedClient)
      .eq('sequence_id', selectedSequence)
      .maybeSingle();

    return data;
  };

  // Enroll client
  const enrollMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check for duplicate before enrolling
      const existing = await checkDuplicateEnrollment();
      if (existing && existing.status === 'active') {
        throw new Error('This client is already enrolled in this sequence');
      }

      const { data: stylistProfile } = await supabase
        .from('stylist_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stylistProfile?.id) throw new Error('Stylist profile not found');

      const { data, error } = await supabase.functions.invoke(
        'enroll-in-sequence',
        {
          body: {
            client_id: selectedClient,
            sequence_id: selectedSequence,
            stylist_id: stylistProfile.id,
          },
        }
      );

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success(
        'Client enrolled',
        "They'll receive the first email based on the sequence timing"
      );
      queryClient.invalidateQueries({ queryKey: ['email_enrollments'] });
      setIsEnrollDialogOpen(false);
      setSelectedClient('');
      setSelectedSequence('');
    },
    onError: (error: Error) => {
      toast.error('Failed to enroll client', error.message);
    },
  });

  // Unenroll client
  const unenrollMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update({
          status: 'stopped',
          unenrolled_at: new Date().toISOString(),
          unenrolled_reason: 'Manually stopped by stylist',
        })
        .eq('id', enrollmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Client unenrolled');
      queryClient.invalidateQueries({ queryKey: ['email_enrollments'] });
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-success/10 text-success border-success/20',
      paused: 'bg-warning/10 text-warning-foreground border-warning/20',
      completed: 'bg-info/10 text-info border-info/20',
      unsubscribed: 'bg-destructive/10 text-destructive border-destructive/20',
      stopped: 'bg-muted text-muted-foreground border-border',
    };
    return colors[status] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Enrollments</h2>
          <p className="text-sm text-muted-foreground">
            Manage which clients are enrolled in your sequences
          </p>
        </div>
        <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Enroll Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enroll Client in Sequence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Select Client *</Label>
                <Select
                  value={selectedClient}
                  onValueChange={setSelectedClient}
                >
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sequence">Select Sequence *</Label>
                <Select
                  value={selectedSequence}
                  onValueChange={setSelectedSequence}
                >
                  <SelectTrigger id="sequence">
                    <SelectValue placeholder="Choose a sequence" />
                  </SelectTrigger>
                  <SelectContent>
                    {sequences?.map(seq => (
                      <SelectItem key={seq.id} value={seq.id}>
                        {seq.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => enrollMutation.mutate()}
                disabled={
                  !selectedClient ||
                  !selectedSequence ||
                  enrollMutation.isPending
                }
                className="w-full"
              >
                {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enrollments List */}
      {isLoading ? (
        <Card className="p-12 text-center border-2">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground">Loading enrollments...</p>
          </div>
        </Card>
      ) : enrollments?.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed">
          <Mail className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Enrollments Yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by enrolling clients in your active sequences
          </p>
          <Button onClick={() => setIsEnrollDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll First Client
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {enrollments?.map((enrollment: any) => (
            <Card key={enrollment.id} className="p-6 border-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">
                      {enrollment.client?.full_name || 'Unknown Client'}
                    </h3>
                    <Badge
                      className={getStatusColor(enrollment.status)}
                      variant="outline"
                    >
                      {enrollment.status}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Sequence:</span>{' '}
                      {enrollment.sequence?.name}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Email:</span>{' '}
                      {enrollment.client?.email}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-medium">Enrolled:</span>{' '}
                      {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                    </p>
                    {enrollment.status === 'active' &&
                      enrollment.next_send_at && (
                        <p className="text-muted-foreground">
                          <span className="font-medium">Next Email:</span>{' '}
                          {format(
                            new Date(enrollment.next_send_at),
                            "MMM d, yyyy 'at' h:mm a"
                          )}
                        </p>
                      )}
                    <p className="text-muted-foreground">
                      <span className="font-medium">Current Step:</span>{' '}
                      {enrollment.current_step}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {enrollment.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unenrollMutation.mutate(enrollment.id)}
                      disabled={unenrollMutation.isPending}
                      className="gap-2"
                    >
                      <StopCircle className="h-4 w-4" />
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
