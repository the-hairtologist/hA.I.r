import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useCreateAppointment } from '@/hooks/appointments/useAppointments';
import { toast } from 'sonner';
import { Loader2, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Validation schema with security best practices
const appointmentSchema = z.object({
  client_id: z.string().uuid({ message: 'Please select a client' }),
  service_id: z.string().uuid().optional(),
  service_type: z
    .string()
    .trim()
    .min(1, { message: 'Service type is required' })
    .max(200, { message: 'Service type must be less than 200 characters' }),
  appointment_date: z.date({ message: 'Please select a date and time' }),
  appointment_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: 'Please enter a valid time (HH:MM)',
    }),
  duration_minutes: z
    .number()
    .min(15, { message: 'Duration must be at least 15 minutes' })
    .max(480, { message: 'Duration cannot exceed 8 hours' })
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, { message: 'Notes must be less than 1000 characters' })
    .optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stylistId: string;
}

interface Client {
  id: string;
  full_name: string | null;
  email: string | null;
  phone?: string | null;
}

interface Service {
  id: string;
  service_name: string;
  duration_minutes: number;
  price: number;
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  stylistId,
}: CreateAppointmentDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  const createAppointment = useCreateAppointment();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      service_type: '',
      duration_minutes: 60,
      notes: '',
      appointment_time: '09:00',
    },
  });

  // Load clients and services
  useEffect(() => {
    if (open) {
      loadClients();
      loadServices();
    }
  }, [open, stylistId]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const { data, error } = await supabase
        .from('client_profiles')
        .select('id, full_name, email, phone')
        .order('full_name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error('Failed to load clients');
    } finally {
      setLoadingClients(false);
    }
  };

  const loadServices = async () => {
    try {
      setLoadingServices(true);
      const { data, error } = await supabase
        .from('stylist_services')
        .select('id, service_name, duration_minutes, price')
        .eq('stylist_id', stylistId)
        .order('service_name');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error('Failed to load services');
    } finally {
      setLoadingServices(false);
    }
  };

  // Update service_type and duration when service is selected
  const handleServiceSelect = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      form.setValue('service_type', service.service_name);
      form.setValue('duration_minutes', service.duration_minutes);
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      // Combine date and time
      const [hours, minutes] = data.appointment_time.split(':').map(Number);
      const appointmentDateTime = new Date(data.appointment_date);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      await createAppointment.mutateAsync({
        stylist_id: stylistId,
        client_id: data.client_id,
        service_id: data.service_id || null,
        service_type: data.service_type,
        appointment_date: appointmentDateTime.toISOString(),
        duration_minutes: data.duration_minutes || 60,
        status: 'scheduled',
        notes: data.notes || null,
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      // Error is already handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogDescription>
            Manually book an appointment for a client
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Client Selection */}
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingClients}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingClients ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Loading clients...
                        </div>
                      ) : clients.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No clients found
                        </div>
                      ) : (
                        clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{client.full_name || 'Unnamed Client'}</span>
                              <span className="text-xs text-muted-foreground">
                                {client.email || 'No email'}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Selection (Optional) */}
            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service (Optional)</FormLabel>
                  <Select
                    onValueChange={value => {
                      field.onChange(value);
                      handleServiceSelect(value);
                    }}
                    value={field.value}
                    disabled={loadingServices}
                  >
                    <FormControl>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue placeholder="Select a service or enter custom" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingServices ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          Loading services...
                        </div>
                      ) : services.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">
                          No services found. Enter custom service below.
                        </div>
                      ) : (
                        services.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{service.service_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {service.duration_minutes} min • ${service.price}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Service Type */}
            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Full Color, Cut & Style"
                      maxLength={200}
                      className="min-h-[44px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Picker */}
            <FormField
              control={form.control}
              name="appointment_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'min-h-[44px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={date => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Input */}
            <FormField
              control={form.control}
              name="appointment_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                      className="min-h-[44px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min={15}
                      max={480}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      className="min-h-[44px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any special requests or notes..."
                      maxLength={1000}
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 min-h-[44px]"
                disabled={createAppointment.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 min-h-[44px]"
                disabled={createAppointment.isPending}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Appointment'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
