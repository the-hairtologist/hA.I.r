/**
 * Memoized Client Card Component
 * Optimized for list rendering performance
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface ClientCardProps {
  client: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    created_at: string;
    total_appointments?: number;
    last_appointment_date?: string;
  };
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ClientCardComponent = ({ client, onClick, onEdit, onDelete }: ClientCardProps) => {
  // Memoize computed values
  const memberSince = useMemo(
    () => format(new Date(client.created_at), "MMM yyyy"),
    [client.created_at]
  );

  const lastVisit = useMemo(
    () =>
      client.last_appointment_date
        ? format(new Date(client.last_appointment_date), "MMM d, yyyy")
        : "No appointments",
    [client.last_appointment_date]
  );

  const appointmentCount = client.total_appointments || 0;

  return (
    <Card
      className="brutal-border hover:shadow-brutal-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{client.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Member since {memberSince}
              </p>
            </div>
          </div>
          {appointmentCount > 0 && (
            <Badge variant="secondary">{appointmentCount} visits</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span>{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Last visit: {lastVisit}</span>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 mt-4">
            {onEdit && (
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="sm" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Memoize the component with custom comparison
export const ClientCard = React.memo(ClientCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.client.id === nextProps.client.id &&
    prevProps.client.full_name === nextProps.client.full_name &&
    prevProps.client.email === nextProps.client.email &&
    prevProps.client.phone === nextProps.client.phone &&
    prevProps.client.total_appointments === nextProps.client.total_appointments &&
    prevProps.client.last_appointment_date === nextProps.client.last_appointment_date
  );
});

ClientCard.displayName = "ClientCard";
