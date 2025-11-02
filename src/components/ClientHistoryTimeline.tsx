import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, FileText, History } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ClientHistoryTimelineProps {
  clientId: string;
}

export const ClientHistoryTimeline = ({
  clientId,
}: ClientHistoryTimelineProps) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, [clientId]);

  const loadHistory = async () => {
    try {
      // Load appointments
      const { data: appointmentsData, error: aptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false })
        .limit(10);

      if (aptError) throw aptError;

      // Load formulas
      const { data: formulasData, error: formulasError } = await supabase
        .from('formulas')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (formulasError) throw formulasError;

      setAppointments(appointmentsData || []);
      setFormulas(formulasData || []);
    } catch (error) {
      console.error('Error loading client history:', error);
      toast.error('Failed to load client history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-info',
      confirmed: 'bg-success',
      completed: 'bg-muted',
      cancelled: 'bg-destructive',
    };
    return colors[status] || 'bg-muted-foreground';
  };

  // Combine and sort by date
  const timeline = [
    ...appointments.map(apt => ({
      type: 'appointment',
      date: apt.appointment_date,
      data: apt,
    })),
    ...formulas.map(formula => ({
      type: 'formula',
      date: formula.created_at,
      data: formula,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No history yet for this client</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutal-border brutal-shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Client History Timeline
        </CardTitle>
        <CardDescription>Recent appointments and formulas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((item, idx) => (
            <div
              key={item.data.id || `${item.type}-${item.date}-${idx}`}
              className="flex gap-4 relative"
            >
              {/* Timeline connector */}
              {idx < timeline.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-foreground z-10',
                  item.type === 'appointment'
                    ? getStatusColor(item.data.status)
                    : 'bg-primary'
                )}
              >
                {item.type === 'appointment' ? (
                  <Calendar className="h-4 w-4 text-on-surface-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-on-surface-primary" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {item.type === 'appointment'
                          ? 'Appointment'
                          : 'Formula Created'}
                      </span>
                      {item.type === 'appointment' && (
                        <Badge variant="outline" className="text-xs">
                          {item.data.status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {format(new Date(item.date), 'PPP')}
                    </p>
                    {item.type === 'appointment' ? (
                      <p className="text-sm">
                        {item.data.service_type}
                        {item.data.duration_minutes &&
                          ` • ${item.data.duration_minutes} min`}
                      </p>
                    ) : (
                      <p className="text-sm truncate">
                        {item.data.color_line && `${item.data.color_line} • `}
                        {item.data.formula_text.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (item.type === 'appointment') {
                        navigate('/appointments');
                      } else {
                        navigate(`/formulas?formula=${item.data.id}`);
                      }
                    }}
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/appointments')}
            className="flex-1"
          >
            All Appointments
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/formulas?client=${clientId}`)}
            className="flex-1"
          >
            All Formulas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
