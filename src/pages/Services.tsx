import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  getServicesByStylist,
  type StylistServiceSummary,
} from '@/lib/queries/serviceQueries';
import { useFormSubmit } from '@/hooks/useFormSubmit';
import { serviceSchema, type ServiceInput } from '@/lib/validation';
import { StandardFormField } from '@/components/forms/StandardFormField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  DollarSign,
  Plus,
  Edit,
  Loader2,
  Trash2,
  Info,
  Palette,
} from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { HelpTooltip } from '@/components/HelpTooltip';
import { ServiceTypeColorManager } from '@/components/ServiceTypeColorManager';
import { ServiceTemplatesDialog } from '@/components/ServiceTemplatesDialog';
import type { StylistProfile } from '@/types/common';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { mobileFirst, touchButton } from '@/lib/responsive/mobile-first-utils';
import { typography } from '@/lib/design/typography';

const Services = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<StylistServiceSummary[]>([]);
  const [stylistProfile, setStylistProfile] = useState<StylistProfile | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<StylistServiceSummary | null>(null);

  // UI-only state (not form data)
  const [isActive, setIsActive] = useState(true);
  const [requireDeposit, setRequireDeposit] = useState(false);
  const [useCustomBuffer, setUseCustomBuffer] = useState(false);

  // Form state managed by useFormSubmit
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    handleSubmit: submitForm,
    isSubmitting,
    reset,
  } = useFormSubmit<ServiceInput>(
    async data => {
      if (!stylistProfile) {
        throw new Error(
          'Stylist profile not loaded. Please refresh and try again.'
        );
      }

      const serviceData = {
        stylist_id: stylistProfile.id,
        service_name: data.service_name.trim(),
        description: data.description?.trim() || null,
        duration_minutes: data.duration_minutes,
        price: data.price,
        is_active: isActive,
        require_deposit: requireDeposit,
        deposit_amount: requireDeposit ? (data.deposit_amount ?? 0) : 0,
        deposit_type: requireDeposit ? (data.deposit_type ?? 'fixed') : 'fixed',
        buffer_time_minutes:
          useCustomBuffer && data.buffer_time_minutes
            ? data.buffer_time_minutes
            : null,
      };

      if (editingService) {
        const { error } = await supabase
          .from('stylist_services')
          .update(serviceData)
          .eq('id', editingService.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('stylist_services')
          .insert(serviceData);
        if (error) throw error;
      }

      await loadData();
    },
    {
      schema: serviceSchema,
      initialValues: {
        service_name: '',
        description: '',
        duration_minutes: 90,
        price: 0,
        deposit_amount: 0,
        deposit_type: 'fixed',
        buffer_time_minutes: undefined,
      },
      successMessage: editingService
        ? 'Service updated successfully!'
        : 'Service added successfully!',
      onSuccess: () => {
        setDialogOpen(false);
        resetForm();
      },
    }
  );

  const loadData = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: stylist, error: stylistError } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (stylistError) {
        logger.error('Error fetching stylist profile', 'Services', stylistError as Error);
        toast.error('Failed to load stylist profile');
        navigate('/dashboard');
        return;
      }

      if (!stylist) {
        toast.error('Stylist profile not found');
        navigate('/dashboard');
        return;
      }

      setStylistProfile(stylist);

      const servicesData = await getServicesByStylist(stylist.id);
      setServices(servicesData);
    } catch (error: unknown) {
      logger.error('Error loading data', 'Services', error as Error);
      toast.error('Failed to load services', {
        description: 'Check connection and try again',
      });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const resetForm = () => {
    reset();
    setIsActive(true);
    setRequireDeposit(false);
    setUseCustomBuffer(false);
    setEditingService(null);
  };

  const handleEdit = (service: StylistServiceSummary) => {
    setEditingService(service);
    setFieldValue('service_name', service.service_name);
    setFieldValue('description', service.description || '');
    setFieldValue('duration_minutes', service.duration_minutes);
    setFieldValue('price', Number(service.price));
    setFieldValue('deposit_amount', service.deposit_amount ?? 0);
    setFieldValue('deposit_type', service.deposit_type ?? 'fixed');
    setFieldValue('buffer_time_minutes', service.buffer_time_minutes ?? undefined);
    setIsActive(service.is_active);
    setRequireDeposit(service.require_deposit ?? false);
    setUseCustomBuffer(service.buffer_time_minutes !== null);
    setDialogOpen(true);
  };

  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const serviceToDeleteRef = useRef<string | null>(null);

  const { handleSubmit: confirmDelete, isSubmitting: isDeletingService } =
    useFormSubmit(
      async () => {
        const targetServiceId = serviceToDeleteRef.current;
        if (!targetServiceId) return;

        const service = services.find(s => s.id === targetServiceId);
        const serviceName = service?.service_name || 'this service';

        const { error } = await supabase
          .from('stylist_services')
          .delete()
          .eq('id', targetServiceId);

        if (error) throw error;

        await loadData();
      },
      {
        successMessage: 'Service deleted successfully',
        errorMessage: 'Failed to delete service',
      }
    );

  const handleDelete = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    const serviceName = service?.service_name || 'this service';

    if (
      !confirm(
        `Delete "${serviceName}"?\n\nThis action cannot be undone. Clients won't be able to book this service anymore.`
      )
    )
      return;

    serviceToDeleteRef.current = serviceId;
    setServiceToDelete(serviceId);
    try {
      await confirmDelete();
    } finally {
      serviceToDeleteRef.current = null;
      setServiceToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-teal-400 to-blue-500">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>
      <PageHeader
        title="Service Pricing"
        icon={<DollarSign className="h-6 w-6" />}
        backTo="/dashboard"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <ServiceTemplatesDialog />
            <Button
              onClick={() => setDialogOpen(true)}
              className={cn(touchButton.md, "border-2 border-foreground flex-shrink-0")}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Service</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        }
      />

      {/* Service Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader className={mobileFirst.padding.sm}>
            <DialogTitle className={cn(mobileFirst.text.lg, "break-words")}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription className={cn(mobileFirst.text.sm, "break-words")}>
              Define your service offerings and pricing
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitForm} className={cn(mobileFirst.padding.sm, "space-y-4")}>
            <StandardFormField
              name="service_name"
              label="Service Name"
              type="text"
              value={values.service_name || ''}
              onChange={val => setFieldValue('service_name', String(val))}
              onBlur={() => setFieldTouched('service_name')}
              error={errors.service_name}
              touched={touched.service_name}
              required
              placeholder="e.g., Color & Cut"
              maxLength={100}
            />

            <StandardFormField
              name="description"
              label="Description"
              type="textarea"
              value={values.description || ''}
              onChange={val => setFieldValue('description', String(val || ''))}
              onBlur={() => setFieldTouched('description')}
              error={errors.description}
              touched={touched.description}
              placeholder="Brief description of the service"
              rows={3}
              maxLength={500}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <HelpTooltip
                    title="Service Duration"
                    content={{
                      stylist:
                        'Set realistic service times including consultation, application, processing, and styling. Underestimating leads to rushed work and scheduling conflicts.',
                    }}
                    examples={[
                      'Full highlight: 2.5-3 hours',
                      'Single process color: 1.5-2 hours',
                      "Women's haircut: 45-60 minutes",
                      "Men's haircut: 30-45 minutes",
                      'Balayage: 2-4 hours depending on length',
                    ]}
                    tips={[
                      'Build in time for difficult hair or clients who talk a lot',
                      "Consider your skill level - it's okay to need more time",
                      'Include blow dry and styling in your estimate',
                    ]}
                  />
                </div>
                <StandardFormField
                  name="duration_minutes"
                  label=""
                  type="number"
                  value={values.duration_minutes || 90}
                  onChange={val => setFieldValue('duration_minutes', Number(val))}
                  onBlur={() => setFieldTouched('duration_minutes')}
                  error={errors.duration_minutes}
                  touched={touched.duration_minutes}
                  required
                  min={15}
                  max={480}
                  step={15}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <HelpTooltip
                    title="Service Pricing"
                    content={{
                      stylist:
                        "Your pricing should cover product costs, time, expertise, and overhead (rent, utilities, tools). Don't undervalue your work - clients who only want cheap won't be loyal.",
                    }}
                    examples={[
                      'New stylist in small town: $60-80 color',
                      'Experienced stylist in city: $150-300 color',
                      'Master stylist in metro: $300-500+ color',
                    ]}
                    tips={[
                      'Price by value, not by how fast you work',
                      'Consider product costs - premium color costs more',
                      'Raise prices 10-15% annually as you gain experience',
                      'Offer new client discounts sparingly - they attract bargain hunters',
                    ]}
                  />
                </div>
                <StandardFormField
                  name="price"
                  label=""
                  type="number"
                  value={values.price || 0}
                  onChange={val => setFieldValue('price', Number(val))}
                  onBlur={() => setFieldTouched('price')}
                  error={errors.price}
                  touched={touched.price}
                  required
                  min={0}
                  max={10000}
                  step={0.01}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="isActive">Service is active and bookable</Label>
            </div>

            {/* Buffer Time Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="useCustomBuffer"
                  checked={useCustomBuffer}
                  onCheckedChange={setUseCustomBuffer}
                />
                <Label
                  htmlFor="useCustomBuffer"
                  className="flex items-center gap-2"
                >
                  Custom buffer time for this service
                  <HelpTooltip
                    title="Buffer Time"
                    content={{
                      stylist:
                        'Buffer time is the gap between appointments for cleanup, setup, and mental preparation. Different services need different buffers.',
                    }}
                    examples={[
                      'Quick trim: 10-15 min buffer',
                      'Color service: 20-30 min buffer (more cleanup)',
                      'Complex color correction: 30-45 min buffer',
                    ]}
                    tips={[
                      'Use buffers to prevent running late all day',
                      'Build in time for client questions and product recommendations',
                      'Messy services (color, bleach) need longer cleanup',
                    ]}
                  />
                </Label>
              </div>

              {useCustomBuffer && (
                <div className="ml-6 space-y-3 p-4 bg-muted/50 rounded-lg border-2 border-foreground/10">
                  <div className="space-y-2">
                    <Label htmlFor="customBufferTime">
                      Buffer Time (minutes)
                    </Label>
                    <Select
                      value={values.buffer_time_minutes?.toString() || '0'}
                      onValueChange={val =>
                        setFieldValue('buffer_time_minutes', parseInt(val))
                      }
                    >
                      <SelectTrigger id="customBufferTime">
                        <SelectValue placeholder="Select buffer time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">⚡ No buffer</SelectItem>
                        <SelectItem value="10">🏃 10 minutes</SelectItem>
                        <SelectItem value="15">✨ 15 minutes</SelectItem>
                        <SelectItem value="20">🌟 20 minutes</SelectItem>
                        <SelectItem value="30">😌 30 minutes</SelectItem>
                        <SelectItem value="45">🧘 45 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Total time slot:{' '}
                      {(values.duration_minutes || 90) +
                        (values.buffer_time_minutes || 0)}{' '}
                      minutes ({values.duration_minutes || 90} min service +{' '}
                      {values.buffer_time_minutes || 0} min buffer)
                    </p>
                  </div>
                </div>
              )}

              {!useCustomBuffer && (
                <p className="text-xs text-muted-foreground ml-6">
                  Using default buffer:{' '}
                  {stylistProfile?.buffer_time_minutes || 15} minutes
                </p>
              )}
            </div>

            {/* Deposit Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="requireDeposit"
                  checked={requireDeposit}
                  onCheckedChange={setRequireDeposit}
                />
                <Label
                  htmlFor="requireDeposit"
                  className="flex items-center gap-2"
                >
                  Require deposit for this service
                  <HelpTooltip
                    title="Service Deposits"
                    content={{
                      stylist:
                        "Deposits protect your time and income. They show client commitment and filter out people who aren't serious. Industry standard is 20-50% or $50-100 minimum.",
                      client:
                        "Deposits hold your appointment slot and show your stylist you're committed. They're applied to your final service cost and are usually non-refundable within 48 hours of your appointment.",
                    }}
                    examples={[
                      'All appointments over 2 hours',
                      "First-time clients (you don't know their reliability yet)",
                      'Expensive services (color corrections, extensions)',
                      'Holiday season bookings (high-demand times)',
                    ]}
                    tips={[
                      'Deposits dramatically reduce no-shows by 60-80%',
                      'Make it clear: deposit goes toward the service, not extra',
                      'Have a cancellation policy (48-72 hours notice)',
                      'Use deposits to filter serious clients from tire-kickers',
                    ]}
                  />
                </Label>
              </div>

              {requireDeposit && (
                <div className="ml-6 space-y-4 p-4 bg-muted/50 rounded-lg border-2 border-foreground/10">
                  <div className="space-y-2">
                    <Label>Deposit Type</Label>
                    <Select
                      value={values.deposit_type || 'fixed'}
                      onValueChange={(value: 'fixed' | 'percentage') =>
                        setFieldValue('deposit_type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <StandardFormField
                    name="deposit_amount"
                    label={`Deposit ${values.deposit_type === 'fixed' ? 'Amount ($)' : 'Percentage (%)'}`}
                    type="number"
                    value={values.deposit_amount || 0}
                    onChange={val => setFieldValue('deposit_amount', Number(val || 0))}
                    onBlur={() => setFieldTouched('deposit_amount')}
                    error={errors.deposit_amount}
                    touched={touched.deposit_amount}
                    required={requireDeposit}
                    min={0}
                    max={values.deposit_type === 'percentage' ? 100 : 10000}
                    step={values.deposit_type === 'fixed' ? 0.01 : 1}
                    placeholder={
                      values.deposit_type === 'fixed' ? '50.00' : '50'
                    }
                    description={
                      values.deposit_type === 'percentage' &&
                      values.deposit_amount
                        ? `= $${((values.price || 0) * ((values.deposit_amount || 0) / 100)).toFixed(2)} deposit`
                        : undefined
                    }
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(touchButton.md, "w-full border-2 border-foreground")}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingService ? 'Update' : 'Add'} Service</>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <main
        id="main-content"
        role="main"
        aria-label="Service Pricing"
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        {services.length === 0 ? (
          <Card className="border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] bg-gradient-to-br from-yellow-400 to-amber-400">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-16 w-16 text-foreground mb-4" />
              <p className="text-xl font-sans font-semibold mb-2 text-foreground">
                No services yet
              </p>
              <p className="text-foreground/80 mb-1 font-sans font-medium text-center max-w-md">
                Define your service menu with clear pricing
              </p>
              <p className="text-sm font-sans text-foreground/70 mb-4 text-center max-w-md">
                This helps clients know what you offer and book with confidence
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className={cn(touchButton.md, "border-2 border-foreground")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service, idx) => (
              <Card
                key={service.id}
                className={`border-[3px] border-foreground shadow-[5px_5px_0px_0px_hsl(var(--foreground))] hover:shadow-[7px_7px_0px_0px_hsl(var(--primary))] hover:-translate-y-1 transition-all ${
                  idx % 4 === 0
                    ? 'bg-blue-400'
                    : idx % 4 === 1
                      ? 'bg-green-400'
                      : idx % 4 === 2
                        ? 'bg-pink-400'
                        : 'bg-yellow-300'
                } ${!service.is_active ? 'opacity-60' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className={cn(typography.title.card, "flex items-center gap-2 text-foreground")}>
                        {service.service_name}
                        {!service.is_active && (
                          <span className={cn(typography.body.tiny, "text-foreground/70 font-normal")}>
                            (Inactive)
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className={cn(typography.description.default, "mt-1 text-foreground/80 font-medium space-y-1")}>
                        <div>
                          ⏱️ {service.duration_minutes} min service
                          {service.buffer_time_minutes !== null && (
                            <span className="ml-2 text-xs bg-card/50 text-foreground px-2 py-0.5 rounded-full border border-foreground/20">
                              + {service.buffer_time_minutes} min buffer
                            </span>
                          )}
                          {service.buffer_time_minutes === null && (
                            <span className="ml-2 text-xs opacity-70">
                              (using default{' '}
                              {stylistProfile?.buffer_time_minutes || 15} min
                              buffer)
                            </span>
                          )}
                        </div>
                        <div>
                          💰 ${Number(service.price).toFixed(2)}
                          {service.require_deposit && (
                            <span className="ml-2 text-xs bg-yellow-300 text-foreground px-2 py-0.5 rounded-full border-2 border-foreground font-bold">
                              Requires $
                              {service.deposit_type === 'percentage'
                                ? (
                                    (Number(service.price) *
                                      Number(service.deposit_amount ?? 0)) /
                                    100
                                  ).toFixed(2)
                                : Number(service.deposit_amount ?? 0).toFixed(
                                    2
                                  )}{' '}
                              deposit
                            </span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(service)}
                        className="border-2 border-foreground bg-card hover:bg-secondary min-h-[44px] min-w-[44px] shadow-brutal"
                        aria-label="Edit service"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(service.id)}
                        disabled={
                          isDeletingService && serviceToDelete === service.id
                        }
                        className="border-2 border-foreground bg-card hover:bg-destructive hover:text-destructive-foreground min-h-[44px] min-w-[44px] shadow-brutal"
                        aria-label="Delete service"
                      >
                        {isDeletingService && serviceToDelete === service.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {service.description && (
                  <CardContent>
                    <p className="text-sm text-foreground/80 font-medium">
                      {service.description}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Service Color Customization */}
        {stylistProfile && (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <h2 className={typography.title.section}>Service Colors</h2>
            </div>
            <p className={cn(typography.description.default, "mb-4")}>
              Customize the colors that appear in your weekly schedule for each
              service type.
            </p>
            <ServiceTypeColorManager stylistId={stylistProfile.id} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Services;
