import { useState, useRef } from 'react';
import { Upload, Video, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { uploadToStorage } from '@/utils/supabaseStorageHelper';

interface VideoUploadProps {
  onVideoUploaded: (videoUrl: string, videoBase64: string) => void;
  maxSizeMB?: number;
}

export const VideoUpload = ({
  onVideoUploaded,
  maxSizeMB = 50,
}: VideoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Video must be less than ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setProgress(30);

      // Upload directly to storage with progress tracking
      const { url: publicUrl } = await uploadToStorage(
        file,
        'client-videos',
        undefined,
        ({ progress }) => {
          setProgress(30 + progress * 0.7); // 30-100%
        }
      );

      setProgress(100);

      // For AI analysis, we still need base64 (but this is now async, not blocking upload)
      const reader = new FileReader();
      reader.onloadend = () => {
        const videoBase64 = reader.result as string;
        onVideoUploaded(publicUrl, videoBase64);
      };
      reader.readAsDataURL(file);

      toast.success('Video uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
      setVideoPreview(null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearVideo = () => {
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {!videoPreview ? (
        <Card
          className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">Upload a hair video</p>
              <p className="text-sm text-muted-foreground">
                MP4, MOV, or WEBM (max {maxSizeMB}MB)
              </p>
            </div>
            <Button variant="outline" size="sm" disabled={uploading}>
              <Video className="h-4 w-4 mr-2" />
              Choose Video
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="relative">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Video Preview</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearVideo}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <video
              src={videoPreview}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '300px' }}
            />
          </div>
        </Card>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
