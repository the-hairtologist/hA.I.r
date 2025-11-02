import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, Plus, Palette } from 'lucide-react';
import { logger } from '@/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface ServiceTypeColor {
  id: string;
  service_type: string;
  color: string;
}

interface ServiceTypeColorManagerProps {
  stylistId: string;
}

export const ServiceTypeColorManager = ({
  stylistId,
}: ServiceTypeColorManagerProps) => {
  const [serviceColors, setServiceColors] = useState<ServiceTypeColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [newServiceType, setNewServiceType] = useState('');
  const [newColor, setNewColor] = useState('hsl(270 85% 60%)');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const loadServiceColors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('service_type_colors')
        .select('*')
        .eq('stylist_id', stylistId)
        .order('service_type');

      if (error) throw error;
      setServiceColors(data || []);
    } catch (error) {
      logger.error('Failed to load service colors', 'ServiceTypeColorManager', error);
      toast.error('Failed to load service colors');
    }
  }, [stylistId]);
  useEffect(() => {
    loadServiceColors();
  }, [loadServiceColors]);

  const updateColor = async (id: string, newColor: string) => {
    try {
      const { error } = await supabase
        .from('service_type_colors')
        .update({ color: newColor })
        .eq('id', id);

      if (error) throw error;

      setServiceColors(prev =>
        prev.map(sc => (sc.id === id ? { ...sc, color: newColor } : sc))
      );
      toast.success('Color updated');
    } catch (error) {
      logger.error('Failed to update color', 'ServiceTypeColorManager', error);
      toast.error('Failed to update color');
    }
  };

  const addServiceType = async () => {
    if (!newServiceType.trim()) {
      toast.error('Please enter a service type name');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_type_colors')
        .insert({
          stylist_id: stylistId,
          service_type: newServiceType.trim(),
          color: newColor,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setServiceColors(prev => [...prev, data]);
      }
      setNewServiceType('');
      setNewColor('hsl(270 85% 60%)');
      setAddDialogOpen(false);
      toast.success('Service type added');
    } catch (error: any) {
      logger.error('Failed to add service type', 'ServiceTypeColorManager', error);
      if (error.code === '23505') {
        toast.error('This service type already exists');
      } else {
        toast.error('Failed to add service type');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteServiceType = async (id: string, serviceType: string) => {
    const confirmed = window.confirm(
      `Remove custom color for "${serviceType}"?\n\nThis won't delete the service, just its custom color. The service will use the default color.`
    );
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('service_type_colors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServiceColors(prev => prev.filter(sc => sc.id !== id));
      toast.success('Service type deleted');
    } catch (error) {
      logger.error('Failed to delete service type', 'ServiceTypeColorManager', error);
      toast.error('Failed to delete service type');
    }
  };

  const presetColors = [
    { name: 'Cyan', value: 'hsl(190 95% 55%)' },
    { name: 'Purple', value: 'hsl(270 85% 60%)' },
    { name: 'Pink', value: 'hsl(340 90% 65%)' },
    { name: 'Orange', value: 'hsl(25 95% 60%)' },
    { name: 'Green', value: 'hsl(142 76% 45%)' },
    { name: 'Blue', value: 'hsl(217 91% 60%)' },
    { name: 'Yellow', value: 'hsl(45 93% 58%)' },
    { name: 'Red', value: 'hsl(0 84% 60%)' },
  ];

  return (
    <Card className="brutal-border brutal-shadow-xs">
      <CardHeader className="brutal-border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="font-pixel flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Service Type Colors
            </CardTitle>
            <CardDescription className="font-sans">
              Customize colors for your service types in the schedule view
            </CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="min-h-[44px] flex-shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Service Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Service Type Color</DialogTitle>
                <DialogDescription>
                  Create a new service type with a custom color
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type Name</Label>
                  <Input
                    id="service-type"
                    value={newServiceType}
                    onChange={e => setNewServiceType(e.target.value)}
                    placeholder="e.g., Highlights, Balayage, etc."
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Choose Color</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {presetColors.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setNewColor(preset.value)}
                        className={`h-12 rounded-lg brutal-border transition-all hover:scale-105 ${
                          newColor === preset.value ? 'brutal-shadow-xs' : ''
                        }`}
                        style={{ backgroundColor: preset.value }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addServiceType} disabled={loading}>
                  Add Service Type
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {serviceColors.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No service types configured. Add your first service type to get
            started.
          </p>
        ) : (
          <div className="space-y-4">
            {serviceColors.map(sc => (
              <div
                key={sc.id}
                className="flex items-center gap-4 p-4 brutal-border rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div
                  className="w-12 h-12 rounded-lg brutal-border brutal-shadow-xs flex-shrink-0"
                  style={{ backgroundColor: sc.color }}
                />
                <div className="flex-1">
                  <p className="font-semibold">{sc.service_type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Change Color
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Change Color for {sc.service_type}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-4 gap-2">
                          {presetColors.map(preset => (
                            <button
                              key={preset.value}
                              onClick={() => updateColor(sc.id, preset.value)}
                              className="h-12 rounded-lg brutal-border hover:border-foreground transition-all hover:scale-105"
                              style={{ backgroundColor: preset.value }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteServiceType(sc.id, sc.service_type)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
