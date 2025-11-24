import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, GripVertical, FileText, Users } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface IntakeTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  is_active: boolean;
  is_global: boolean;
}

const SortableField = ({
  field,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 bg-card space-y-3"
    >
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>
        <Input
          placeholder="Field Label"
          value={field.label}
          onChange={e => onUpdate({ ...field, label: e.target.value })}
          className="flex-1"
        />
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Field Type</Label>
          <Select
            value={field.type}
            onValueChange={(value: any) => onUpdate({ ...field, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="textarea">Long Text</SelectItem>
              <SelectItem value="select">Dropdown</SelectItem>
              <SelectItem value="checkbox">Checkbox</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.required}
              onCheckedChange={checked =>
                onUpdate({ ...field, required: checked })
              }
            />
            <Label className="text-xs">Required</Label>
          </div>
        </div>
      </div>

      <Input
        placeholder="Placeholder text (optional)"
        value={field.placeholder || ''}
        onChange={e => onUpdate({ ...field, placeholder: e.target.value })}
      />

      {field.type === 'select' && (
        <Textarea
          placeholder="Options (one per line)"
          value={field.options?.join('\n') || ''}
          onChange={e =>
            onUpdate({
              ...field,
              options: e.target.value.split('\n').filter(Boolean),
            })
          }
          rows={3}
        />
      )}
    </div>
  );
};

export const IntakeFormBuilder = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  });
  const [fields, setFields] = useState<FormField[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: stylistProfile } = useQuery({
    queryKey: ['stylist-profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('stylist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['intake-templates', stylistProfile?.id],
    queryFn: async () => {
      if (!stylistProfile) return [];

      const { data, error } = await supabase
        .from('intake_form_templates')
        .select('*')
        .or(`stylist_id.eq.${stylistProfile.id},is_global.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        fields: t.fields as unknown as FormField[],
      })) as IntakeTemplate[];
    },
    enabled: !!stylistProfile,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!stylistProfile) throw new Error('Stylist profile not found');
      if (!formData.name) throw new Error('Template name is required');
      if (fields.length === 0) throw new Error('Add at least one field');

      const { error } = await supabase.from('intake_form_templates').insert([
        {
          stylist_id: stylistProfile.id,
          name: formData.name,
          description: formData.description || null,
          fields: fields as any,
          is_active: formData.is_active,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Success!', description: 'Intake form template created' });
      queryClient.invalidateQueries({ queryKey: ['intake-templates'] });
      setFormData({ name: '', description: '', is_active: true });
      setFields([]);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addField = () => {
    setFields([
      ...fields,
      {
        id: `field_${Date.now()}`,
        label: '',
        type: 'text',
        required: false,
        placeholder: '',
      },
    ]);
  };

  const updateField = (id: string, updatedField: FormField) => {
    setFields(fields.map(f => (f.id === id ? updatedField : f)));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Client Intake Forms</h2>
          <p className="text-muted-foreground">
            Create customizable forms for new clients
          </p>
        </div>
      </div>

      {/* Existing Templates */}
      {templates && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.fields.length} fields •{' '}
                      {template.is_global ? 'Global' : 'Custom'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.is_active && (
                      <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Build a custom intake form for your clients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., New Client Consultation"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of this form"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={checked =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label>Active (show to clients)</Label>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Form Fields</Label>
              <Button onClick={addField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            {fields.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={fields.map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {fields.map(field => (
                      <SortableField
                        key={field.id}
                        field={field}
                        onUpdate={updated => updateField(field.id, updated)}
                        onDelete={() => deleteField(field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  No fields yet. Click "Add Field" to start building your form.
                </p>
              </div>
            )}
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={
              saveMutation.isPending || !formData.name || fields.length === 0
            }
            className="w-full"
            size="lg"
          >
            {saveMutation.isPending
              ? 'Creating...'
              : 'Create Intake Form Template'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
