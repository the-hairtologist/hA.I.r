import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar } from 'lucide-react';

interface ClientActivityIndicatorProps {
  clientId: string;
}

export function ClientActivityIndicator({
  clientId,
}: ClientActivityIndicatorProps) {
  const [isActive, setIsActive] = useState(false);
  const [activityType, setActivityType] = useState<
    'viewing' | 'booking' | null
  >(null);

  useEffect(() => {
    const channel = supabase
      .channel(`client-presence-${clientId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const clients = Object.values(state).flat() as any[];

        if (clients.length > 0 && clients[0]?.activity) {
          setIsActive(true);
          setActivityType(clients[0].activity as 'viewing' | 'booking');

          // Auto-hide after 30s
          setTimeout(() => {
            setIsActive(false);
            setActivityType(null);
          }, 30000);
        } else {
          setIsActive(false);
          setActivityType(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  if (!isActive || !activityType) return null;

  return (
    <Badge
      variant="secondary"
      className="bg-green-500/10 text-green-600 border-green-500/20 animate-pulse"
    >
      {activityType === 'booking' ? (
        <>
          <Calendar className="w-3 h-3 mr-1" />
          Booking now
        </>
      ) : (
        <>
          <Eye className="w-3 h-3 mr-1" />
          Viewing appointments
        </>
      )}
    </Badge>
  );
}
