/**
 * Client Card Component
 *
 * Displays a client's profile information in a card format with selection,
 * contact details, appointment history, and action buttons.
 *
 * Features:
 * - Selectable via checkbox for bulk operations
 * - Risk and activity indicators
 * - Quick action buttons (Edit, History, Notes)
 * - Responsive layout with truncated text
 *
 * @component
 * @memoized - Optimized with React.memo to prevent unnecessary re-renders
 */

import { memo } from 'react';
import { withMemo } from '@/lib/optimizations/withMemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, User, Edit, FileText, Calendar } from 'lucide-react';
import { ClientRiskIndicator } from '@/components/ClientRiskIndicator';
import { ClientActivityIndicator } from '@/components/ClientActivityIndicator';

/**
 * Client data structure for the card display
 */
interface ClientCardProps {
  /** Client profile data */
  client: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    hair_type: string | null;
    total_appointments?: number;
    last_appointment_date?: string | null;
  };
  /** Whether this client is currently selected */
  isSelected: boolean;
  /** Callback when selection checkbox is toggled */
  onToggleSelection: (id: string) => void;
  /** Callback when Edit button is clicked */
  onEdit: () => void;
  /** Callback when History button is clicked */
  onViewHistory: () => void;
  /** Callback when Notes button is clicked */
  onViewNotes: () => void;
  /** Number of missed appointments (for risk calculation) */
  missedAppointments?: number;
}

/**
 * Formats a date string for last appointment display
 */
const formatLastAppointmentDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Formats appointment count with last visit date if available
 */
const formatAppointmentInfo = (
  totalAppointments: number,
  lastAppointmentDate: string | null | undefined
): string => {
  const baseText = `${totalAppointments} appointments`;

  if (lastAppointmentDate) {
    return `${baseText} • Last: ${formatLastAppointmentDate(lastAppointmentDate)}`;
  }

  return baseText;
};

const ClientCardComponent = ({
  client,
  isSelected,
  onToggleSelection,
  onEdit,
  onViewHistory,
  onViewNotes,
  missedAppointments = 0,
}: ClientCardProps) => {
  // Derived values
  const clientName = client.full_name || 'Unnamed Client';
  const appointmentCount = client.total_appointments || 0;
  const cardClassName = isSelected ? 'border-primary' : '';

  return (
    <Card className={cardClassName}>
      {/* Header: Checkbox, Name, Hair Type Badge, Activity Indicator, Risk Badge */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Selection checkbox */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(client.id)}
              className="h-4 w-4"
              aria-label={`Select ${clientName}`}
            />

            {/* Client name and badges */}
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" aria-hidden="true" />
                {clientName}
              </CardTitle>

              {/* Hair type and activity badges */}
              <div className="flex gap-2 sm:gap-3 mt-2">
                {client.hair_type && (
                  <Badge variant="secondary" className="text-xs">
                    {client.hair_type}
                  </Badge>
                )}
                <ClientActivityIndicator clientId={client.id} />
              </div>
            </div>
          </div>

          {/* Risk indicator (churn risk based on appointment history) */}
          <ClientRiskIndicator
            lastAppointmentDate={client.last_appointment_date ?? null}
            totalAppointments={appointmentCount}
            missedAppointments={missedAppointments}
          />
        </div>
      </CardHeader>

      {/* Content: Contact info and action buttons */}
      <CardContent>
        {/* Contact information section */}
        <div className="space-y-2 text-sm">
          {/* Email */}
          {client.email && (
            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
              <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span className="truncate min-w-0">{client.email}</span>
            </div>
          )}

          {/* Phone */}
          {client.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{client.phone}</span>
            </div>
          )}

          {/* Appointment count and last visit */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>
              {formatAppointmentInfo(
                appointmentCount,
                client.last_appointment_date
              )}
            </span>
          </div>
        </div>

        {/* Action buttons section */}
        <div className="flex gap-2 sm:gap-3 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
            aria-label={`Edit ${clientName}`}
          >
            <Edit className="h-4 w-4 mr-1" aria-hidden="true" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
            className="flex-1"
            aria-label={`View ${clientName}'s appointment history`}
          >
            <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewNotes}
            aria-label={`View ${clientName}'s notes`}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ClientCard = withMemo(ClientCardComponent, [
  'client.id',
  'client.updated_at',
  'isSelected',
  'client.last_appointment_date',
]);
