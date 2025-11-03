import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { haptic } from '@/platform/haptics';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  className?: string;
  variant?: 'icon' | 'full';
}

export const VoiceInput = ({
  onTranscription,
  className,
  variant = 'icon',
}: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      haptic.tap();

      toast.info('Recording... Tap to stop', {
        duration: Infinity,
        id: 'recording-toast',
      });
    } catch (error) {
      console.error('Error starting recording:', error);

      const errorMessage = 'Could not access microphone';
      let errorDescription = 'Check microphone permissions in browser settings';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorDescription =
            'Please allow microphone access to use voice input';
        } else if (error.name === 'NotFoundError') {
          errorDescription =
            'No microphone detected. Please connect a microphone.';
        } else if (error.name === 'NotReadableError') {
          errorDescription = 'Microphone is being used by another app';
        }
      }

      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.dismiss('recording-toast');
      haptic.tap();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // Convert blob to base64
      const reader = new FileReader();

      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Send to edge function
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio },
      });

      if (error) throw error;

      if (data?.text) {
        onTranscription(data.text);
        haptic.success();
        toast.success('Transcription complete!');
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      haptic.error();
      toast.error('Failed to transcribe audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          'relative transition-all duration-200',
          isRecording &&
            'bg-destructive text-destructive-foreground animate-pulse',
          className
        )}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
        {isRecording && (
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={isRecording ? 'destructive' : 'outline'}
      onClick={handleClick}
      disabled={isProcessing}
      className={cn(
        'gap-2 transition-all duration-200',
        isRecording && 'animate-pulse',
        className
      )}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Transcribing...
        </>
      ) : isRecording ? (
        <>
          <MicOff className="h-4 w-4" />
          Stop Recording
        </>
      ) : (
        <>
          <Mic className="h-4 w-4" />
          Voice Input
        </>
      )}
    </Button>
  );
};
