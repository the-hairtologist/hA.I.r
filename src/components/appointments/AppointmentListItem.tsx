/**
 * Optimized Appointment List Item Component
 * Memoized for better rendering performance
 */

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Edit, Trash2, User } from "lucide-react";
import { format } from "date-fns";

interface AppointmentListItemProps {
  appointment: any;
  onEdit: (appointment: any) => void;
  onDelete: (id: string) => void;
}

export const AppointmentListItem = memo(({
  appointment,
  onEdit,
  onDelete,
}: AppointmentListItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "completed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    }
  };

  return (
    <Card className="brutal-border brutal-shadow hover:brutal-shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {appointment.client_profiles?.full_name || "Client"}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {appointment.service_type}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(appointment.status)} text-[10px] xs:text-xs shrink-0`}
            >
              {appointment.status}
            </Badge>
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{format(new Date(appointment.appointment_date), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{format(new Date(appointment.appointment_date), "h:mm a")}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(appointment)}
              className="flex-1 gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(appointment.id)}
              className="flex-1 gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

AppointmentListItem.displayName = "AppointmentListItem";
