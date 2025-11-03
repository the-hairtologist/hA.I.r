import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Sparkles, Camera } from 'lucide-react';
import { useHairAnalysis } from '@/hooks/useHairAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OptimizedImage } from '@/components/OptimizedImage';
import { logger } from '@/lib/logger';

interface HairPhotoAnalysisProps {
  clientId?: string;
  onAnalysisComplete?: (result: any) => void;
}

export const HairPhotoAnalysis = ({
  clientId,
  onAnalysisComplete,
}: HairPhotoAnalysisProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { analyzePhoto, isAnalyzing, result } = useHairAnalysis();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Please select an image under 10MB',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = clientId
        ? `${clientId}/${fileName}`
        : `analysis/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('hair-photos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        logger.error('Photo upload failed', 'HairPhotoAnalysis', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('hair-photos').getPublicUrl(filePath);

      // Analyze the photo
      const analysisResult = await analyzePhoto(publicUrl, clientId);

      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (error) {
      logger.error(
        'Hair photo analysis process failed',
        'HairPhotoAnalysis',
        error
      );
      // Error toast already shown by useHairAnalysis hook
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          AI Hair Photo Analysis
        </CardTitle>
        <CardDescription>
          Upload a photo for instant professional hair analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {!previewUrl && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="hair-photo-upload"
              disabled={isAnalyzing || isUploading}
            />
            <label htmlFor="hair-photo-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </p>
            </label>
          </div>
        )}

        {/* Preview */}
        {previewUrl && !result && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <OptimizedImage
                src={previewUrl}
                alt="Hair preview"
                width={800}
                height={400}
                className="w-full h-auto max-h-[400px] object-cover"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isUploading || isAnalyzing}
                className="flex-1"
              >
                {isUploading || isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUploading ? 'Uploading...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Hair
                  </>
                )}
              </Button>

              <Button
                onClick={handleClear}
                variant="outline"
                disabled={isUploading || isAnalyzing}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden mb-4">
              <OptimizedImage
                src={previewUrl!}
                alt="Analyzed hair"
                width={800}
                height={300}
                className="w-full h-auto max-h-[300px] object-cover"
              />
            </div>

            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Professional Analysis
              </h4>

              {result.analysis.sections &&
              Object.keys(result.analysis.sections).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(result.analysis.sections).map(
                    ([key, value]) => (
                      <div key={key}>
                        <h5 className="font-medium text-sm capitalize mb-1">
                          {key.replace(/_/g, ' ')}
                        </h5>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {result.rawAnalysis}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleClear}
                variant="outline"
                className="flex-1"
              >
                Analyze Another Photo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
