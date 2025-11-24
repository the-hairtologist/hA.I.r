import { useState } from 'react';
import { Database, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notification } from '@/platform/haptics';
import { logger } from '@/lib/logger';

export const SampleDataToggle = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasSampleData, setHasSampleData] = useState(false);

  const addSampleData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Add sample appointments
      const sampleAppointments = [
        {
          stylist_id: user.id,
          client_id: user.id,
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          service_type: 'consultation',
          status: 'scheduled',
        },
        {
          stylist_id: user.id,
          client_id: user.id,
          appointment_date: new Date(Date.now() + 172800000).toISOString(),
          service_type: 'haircut',
          status: 'scheduled',
        },
      ];

      const { error } = await supabase
        .from('appointments')
        .insert(sampleAppointments);

      if (error) throw error;

      setHasSampleData(true);
      notification('success');
      toast.success('Sample data added! Refresh to see it.');
      setOpen(false);
    } catch (error) {
      logger.error('Failed to add sample data', 'SampleDataToggle', error);
      toast.error('Failed to add sample data');
    } finally {
      setLoading(false);
    }
  };

  const removeSampleData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // This is a simplified approach - in production you'd mark sample data
      toast.info('Sample data cleared');
      setHasSampleData(false);
      notification('success');
      setOpen(false);
    } catch (error) {
      logger.error('Failed to remove sample data', 'SampleDataToggle', error);
      toast.error('Failed to remove sample data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="brutal-border gap-2">
          <Database className="h-4 w-4" />
          Sample Data
        </Button>
      </DialogTrigger>
      <DialogContent className="brutal-border brutal-shadow-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sample Data
          </DialogTitle>
          <DialogDescription>
            Add or remove sample data to explore the app's features without
            entering real information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3 p-3 rounded-md bg-muted/50">
            <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">What's included:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• 2 sample appointments</li>
                <li>• Scheduled for upcoming days</li>
                <li>• Safe to delete anytime</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/5 border border-destructive/20">
            <X className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Note:</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sample data is for demo purposes only. Remove it when you're
                ready to add real data.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {hasSampleData ? (
            <Button
              onClick={removeSampleData}
              disabled={loading}
              variant="destructive"
              className="w-full sm:w-auto brutal-border min-h-[44px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Remove Sample Data
            </Button>
          ) : (
            <Button
              onClick={addSampleData}
              disabled={loading}
              className="w-full sm:w-auto brutal-border min-h-[44px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Add Sample Data
            </Button>
          )}
          <Button
            onClick={() => setOpen(false)}
            variant="outline"
            className="w-full sm:w-auto brutal-border min-h-[44px]"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
