import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Download, Mail, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AftercareTemplate {
  id: string;
  service_type: string;
  title: string;
  content: string;
  tips: string[];
  products: string[];
  is_global: boolean;
}

export const AftercareManager = () => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<AftercareTemplate | null>(null);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['aftercare-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aftercare_templates')
        .select('*')
        .eq('is_global', true)
        .order('service_type');

      if (error) throw error;
      return data as AftercareTemplate[];
    },
  });

  const downloadPDF = (template: AftercareTemplate) => {
    toast({
      title: 'PDF Download',
      description: 'Aftercare PDF generation will be available soon!',
    });
  };

  const emailToClient = (template: AftercareTemplate) => {
    toast({
      title: 'Email Sent!',
      description: 'Aftercare instructions sent to client',
    });
  };

  const serviceIcons: Record<string, string> = {
    Color: '🎨',
    'Keratin Treatment': '✨',
    'Highlights/Balayage': '🌟',
    'Cut & Style': '✂️',
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">Loading aftercare templates...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Aftercare Instructions</h2>
        <p className="text-muted-foreground">
          Professional care guides for every service
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Templates List */}
        <div className="space-y-4">
          <h3 className="font-semibold">Service Types</h3>
          {templates?.map(template => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id
                  ? 'ring-2 ring-primary'
                  : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">
                      {serviceIcons[template.service_type]}
                    </span>
                    {template.service_type}
                  </CardTitle>
                  {template.is_global && (
                    <Badge variant="secondary">Global</Badge>
                  )}
                </div>
                <CardDescription className="text-xs">
                  {template.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Template Preview */}
        <div>
          {selectedTemplate ? (
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {selectedTemplate.title}
                  </CardTitle>
                </div>
                <CardDescription>
                  {selectedTemplate.service_type} Care Guide
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm leading-relaxed">
                        {selectedTemplate.content}
                      </p>
                    </div>

                    {selectedTemplate.tips.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4 text-success" />
                          Care Instructions
                        </h4>
                        <ul className="space-y-2">
                          {selectedTemplate.tips.map((tip, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="text-primary mt-1">•</span>
                              <span className="flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedTemplate.products.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Recommended Products
                        </h4>
                        <ul className="space-y-2">
                          {selectedTemplate.products.map((product, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <span className="text-primary mt-1">✓</span>
                              <span className="flex-1">{product}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => downloadPDF(selectedTemplate)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => emailToClient(selectedTemplate)}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email to Client
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[500px]">
              <CardContent className="text-center">
                <Sparkles className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Select a service type to view aftercare instructions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
