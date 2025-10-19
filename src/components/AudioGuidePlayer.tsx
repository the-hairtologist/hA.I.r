import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, Volume2, Loader2, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AudioGuidePlayerProps {
  text: string;
  title?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  className?: string;
}

export const AudioGuidePlayer = ({ 
  text, 
  title = "Audio Guide",
  voice = 'nova',
  className 
}: AudioGuidePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const generateAudio = async () => {
    if (audioUrl) return audioUrl;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) {
        console.error('Audio generation error:', error);
        toast.error(error.message || 'Failed to generate audio guide');
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      if (!data?.audioContent) {
        toast.error('No audio content received');
        return null;
      }

      // Convert base64 to blob
      const binaryString = atob(data.audioContent);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
      return url;
    } catch (error: any) {
      console.error('Error generating audio:', error);
      const errorMsg = error?.message || 'Failed to generate audio guide';
      toast.error(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      let url = audioUrl;
      if (!url) {
        url = await generateAudio();
        if (!url) return;
      }

      if (!audioRef.current) {
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.addEventListener('timeupdate', () => {
          const progress = (audio.currentTime / audio.duration) * 100;
          setProgress(progress);
        });

        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setProgress(0);
        });
      }

      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = async () => {
    let url = audioUrl;
    if (!url) {
      url = await generateAudio();
      if (!url) return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audio guide downloaded!');
  };

  return (
    <Card className={cn("p-4 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5", className)}>
      <div className="flex items-center gap-3">
        <Button
          onClick={handlePlayPause}
          disabled={isLoading}
          size="icon"
          variant="outline"
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium truncate">{title}</p>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isLoading}
          size="icon"
          variant="ghost"
          className="shrink-0"
          title="Download audio guide"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
