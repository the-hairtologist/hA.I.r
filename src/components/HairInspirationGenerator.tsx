import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Sparkles, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';

export function HairInspirationGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt required',
        description: 'Please describe the hair style you want to generate',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'generate-hair-image',
        {
          body: { prompt },
        }
      );

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      toast({
        title: 'Image generated!',
        description: 'Your hair inspiration image is ready',
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `hair-inspiration-${Date.now()}.png`;
    link.click();
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Generate Hair Inspiration
        </h3>
        <p className="text-sm text-muted-foreground">
          Describe the hair style you want to visualize
        </p>
      </div>

      <Textarea
        placeholder="e.g., Balayage blonde on brown hair with beach waves, or Curly pixie cut with honey highlights"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={3}
        className="resize-none"
      />

      <Button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </Button>

      {generatedImage && (
        <div className="space-y-3">
          <OptimizedImage
            src={generatedImage}
            alt="Generated hair style"
            width={800}
            height={600}
            className="w-full rounded-lg border"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
