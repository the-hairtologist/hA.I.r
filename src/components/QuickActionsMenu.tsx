/**
 * Quick Actions Context Menu
 * Right-click context menus for faster workflows
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/logger';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import {
  Calendar,
  User,
  Edit,
  Trash2,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface QuickActionsMenuProps {
  children: React.ReactNode;
  type: 'appointment' | 'client' | 'task';
  data: any;
  onAction?: (action: string) => void;
}

export function QuickActionsMenu({
  children,
  type,
  data,
  onAction,
}: QuickActionsMenuProps) {
  const navigate = useNavigate();

  const handleAction = async (action: string) => {
    onAction?.(action);

    switch (action) {
      case 'view':
        if (type === 'appointment') navigate(`/appointments/${data.id}`);
        if (type === 'client') navigate(`/clients/${data.id}`);
        break;

      case 'edit':
        if (type === 'appointment') navigate(`/appointments/${data.id}/edit`);
        if (type === 'client') navigate(`/clients/${data.id}/edit`);
        break;

      case 'delete':
        // Confirmation handled by parent component
        toast.info('Delete action triggered');
        break;

      case 'reschedule':
        // Open reschedule modal
        toast.info('Opening reschedule dialog...');
        break;

      case 'complete':
        await handleComplete();
        break;

      case 'cancel':
        await handleCancel();
        break;

      case 'email':
        window.location.href = `mailto:${data.email}`;
        break;

      case 'call':
        window.location.href = `tel:${data.phone}`;
        break;

      default:
        logger.warn('Unknown action:', action);
    }
  };

  const handleComplete = async () => {
    try {
      if (type === 'appointment') {
        await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .eq('id', data.id);

        // Trigger Zapier webhook
        try {
          const { triggerAppointmentCompleted } = await import(
            '@/lib/zapierTriggers'
          );
          await triggerAppointmentCompleted(data.stylist_id, {
            appointment_id: data.id,
            appointment_date: data.appointment_date,
            service_type: data.service_type,
            client_id: data.client_id,
          });
        } catch (error) {
          console.error(
            '[Zapier] Failed to trigger appointment completed webhook:',
            error
          );
        }

        toast.success('Appointment marked as completed');
      } else if (type === 'task') {
        // Task completion handled by parent component
        onAction?.('complete');
        toast.success('Task completed');
      }
    } catch (error) {
      console.error('Error completing:', error);
      toast.error('Failed to complete');
    }
  };

  const handleCancel = async () => {
    try {
      if (type === 'appointment') {
        await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', data.id);
        toast.success('Appointment cancelled');
      }
    } catch (error) {
      console.error('Error cancelling:', error);
      toast.error('Failed to cancel');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Appointment Actions */}
        {type === 'appointment' && (
          <>
            <ContextMenuItem onClick={() => handleAction('view')}>
              <Calendar className="mr-2 h-4 w-4" />
              View Details
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction('edit')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Appointment
              <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction('reschedule')}>
              <Clock className="mr-2 h-4 w-4" />
              Reschedule
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => handleAction('complete')}>
              <CheckCircle className="mr-2 h-4 w-4 text-success" />
              Mark as Completed
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction('cancel')}>
              <XCircle className="mr-2 h-4 w-4 text-destructive" />
              Cancel Appointment
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleAction('delete')}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          </>
        )}

        {/* Client Actions */}
        {type === 'client' && (
          <>
            <ContextMenuItem onClick={() => handleAction('view')}>
              <User className="mr-2 h-4 w-4" />
              View Profile
              <ContextMenuShortcut>⌘V</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction('edit')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Client
              <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Quick Contact
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => handleAction('email')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </ContextMenuItem>
                <ContextMenuItem onClick={() => handleAction('call')}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Client
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleAction('delete')}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Client
            </ContextMenuItem>
          </>
        )}

        {/* Task Actions */}
        {type === 'task' && (
          <>
            <ContextMenuItem onClick={() => handleAction('complete')}>
              <CheckCircle className="mr-2 h-4 w-4 text-success" />
              Mark as Done
              <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => handleAction('edit')}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => handleAction('delete')}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
