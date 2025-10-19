import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, User, Edit, FileText, Calendar } from "lucide-react";
import { ClientRiskIndicator } from "@/components/ClientRiskIndicator";
import { ClientActivityIndicator } from "@/components/ClientActivityIndicator";

interface ClientCardProps {
  client: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    hair_type: string | null;
    total_appointments?: number;
    last_appointment_date?: string | null;
  };
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  onEdit: () => void;
  onViewHistory: () => void;
  onViewNotes: () => void;
  missedAppointments?: number;
}

export const ClientCard = memo(({ 
  client, 
  isSelected, 
  onToggleSelection, 
  onEdit, 
  onViewHistory, 
  onViewNotes,
  missedAppointments = 0
}: ClientCardProps) => {

  return (
    <Card className={isSelected ? "border-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(client.id)}
              className="h-4 w-4"
            />
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {client.full_name || "Unnamed Client"}
              </CardTitle>
              <div className="flex gap-2 mt-2">
                {client.hair_type && (
                  <Badge variant="secondary" className="text-xs">
                    {client.hair_type}
                  </Badge>
                )}
                <ClientActivityIndicator clientId={client.id} />
              </div>
            </div>
          </div>
          <ClientRiskIndicator
            lastAppointmentDate={client.last_appointment_date}
            totalAppointments={client.total_appointments || 0}
            missedAppointments={missedAppointments}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {client.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {client.total_appointments || 0} appointments
              {client.last_appointment_date && 
                ` • Last: ${new Date(client.last_appointment_date).toLocaleDateString()}`
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
            className="flex-1"
          >
            <Calendar className="h-4 w-4 mr-1" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewNotes}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ClientCard.displayName = "ClientCard";