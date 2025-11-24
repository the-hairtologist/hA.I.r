/**
 * Optimized Appointment List Component
 * Uses virtualization and memoization for better performance
 */

import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VirtualizedList } from './VirtualizedList';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  appointment_date: string;
  service_type: string;
  status: string;
  client?: {
    user?: {
      full_name: string;
    };
  };
}

interface OptimizedAppointmentListProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const AppointmentCard = memo(
  ({
    appointment,
    onClick,
  }: {
    appointment: Appointment;
    onClick: (appointment: Appointment) => void;
  }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'confirmed':
          return 'bg-success/10 text-success border-success/20';
        case 'scheduled':
          return 'bg-info/10 text-info border-info/20';
        case 'completed':
          return 'bg-muted text-muted-foreground border-border';
        case 'cancelled':
          return 'bg-destructive/10 text-destructive border-destructive/20';
        default:
          return 'bg-muted text-muted-foreground';
      }
    };

    return (
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5',
          'border-2 border-foreground/10 hover:border-primary/50'
        )}
        onClick={() => onClick(appointment)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate mb-1">
                {appointment.client?.user?.full_name || 'Unknown Client'}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {appointment.service_type}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {format(
                    new Date(appointment.appointment_date),
                    'MMM d, h:mm a'
                  )}
                </span>
              </div>
            </div>
            <Badge
              className={cn('shrink-0', getStatusColor(appointment.status))}
            >
              {appointment.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AppointmentCard.displayName = 'AppointmentCard';

export const OptimizedAppointmentList = memo(
  ({
    appointments,
    onAppointmentClick,
    loading = false,
    emptyMessage = 'No appointments found',
  }: OptimizedAppointmentListProps) => {
    const sortedAppointments = useMemo(
      () =>
        [...appointments].sort(
          (a, b) =>
            new Date(a.appointment_date).getTime() -
            new Date(b.appointment_date).getTime()
        ),
      [appointments]
    );

    const renderAppointment = (appointment: Appointment) => (
      <AppointmentCard
        key={appointment.id}
        appointment={appointment}
        onClick={onAppointmentClick}
      />
    );

    const emptyState = (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );

    return (
      <VirtualizedList
        items={sortedAppointments}
        itemHeight={120}
        renderItem={renderAppointment}
        className="h-[min(70vh,600px)] space-y-3"
        loading={loading}
        emptyState={emptyState}
        overscan={5}
      />
    );
  }
);

OptimizedAppointmentList.displayName = 'OptimizedAppointmentList';
