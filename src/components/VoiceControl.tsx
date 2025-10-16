import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { haptic } from "@/platform/haptics";
import { PrivacyConsentDialog, getStoredConsent } from "./PrivacyConsentDialog";

interface VoiceControlProps {
  onTranscription: (text: string, metadata?: VoiceMetadata) => void;
  onCommand?: (command: string) => void;
  context?: 'notes' | 'chat' | 'search' | 'formula';
  className?: string;
  variant?: "icon" | "full" | "minimal";
  enableCommands?: boolean;
  maxDuration?: number;
}

export interface VoiceMetadata {
  duration: number;
  confidence?: number;
  language?: string;
  recordedAt: string;
}

const VOICE_COMMANDS = {
  navigation: ['open formulas', 'show clients', 'view calendar', 'go to dashboard'],
  actions: ['save note', 'create formula', 'schedule appointment'],
  ai: ['analyze hair', 'suggest formula', 'show recommendations']
};

export const VoiceControl = ({ 
  onTranscription, 
  onCommand,
  context = 'notes',
  className,
  variant = "icon",
  enableCommands = false,
  maxDuration = 60
}: VoiceControlProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  const contextMessages = {
    notes: {
      hint: "Speak your notes naturally",
      starting: "Listening for notes...",
      placeholder: "Your notes will appear here..."
    },
    chat: {
      hint: "Ask me anything about hair color",
      starting: "Listening to your question...",
      placeholder: "Your question will appear here..."
    },
    search: {
      hint: "Speak what you're looking for",
      starting: "Listening for search...",
      placeholder: "Search terms will appear here..."
    },
    formula: {
      hint: "Describe the formula components",
      starting: "Listening to formula...",
      placeholder: "Formula details will appear here..."
    }
  };

  const messages = contextMessages[context];

  const setupAudioVisualization = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const detectVoiceCommand = (text: string): string | null => {
    if (!enableCommands) return null;

    const lowerText = text.toLowerCase().trim();
    
    for (const [category, commands] of Object.entries(VOICE_COMMANDS)) {
      for (const command of commands) {
        if (lowerText.includes(command)) {
          return command;
        }
      }
    }
    
    return null;
  };

  const startRecording = async () => {
    // Check for stored consent first
    const hasConsent = getStoredConsent('microphone');
    if (!hasConsent) {
      setShowConsentDialog(true);
      return;
    }

    await executeRecording();
  };

  const handleConsentResponse = async (granted: boolean) => {
    if (granted) {
      await executeRecording();
    } else {
      toast.error("Microphone permission denied", {
        description: "You can grant permission later in Settings"
      });
    }
  };

  const executeRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      setupAudioVisualization(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob, duration);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      await haptic.tap();
      
      // Update duration every 100ms
      timerRef.current = setInterval(() => {
        const duration = (Date.now() - startTimeRef.current) / 1000;
        setRecordingDuration(duration);
        
        // Auto-stop at max duration
        if (duration >= maxDuration) {
          stopRecording();
        }
      }, 100);
      
      toast.info(messages.starting, {
        duration: 2000,
        icon: <Mic className="h-4 w-4" />
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      
      let errorMessage = "Could not access microphone";
      let errorDescription = "Check microphone permissions";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorDescription = "Please allow microphone access";
        } else if (error.name === 'NotFoundError') {
          errorDescription = "No microphone detected";
        } else if (error.name === 'NotReadableError') {
          errorDescription = "Microphone is being used by another app";
        }
      }
      
      await haptic.error();
      toast.error(errorMessage, {
        description: errorDescription,
        duration: 5000
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      haptic.tap();
    }
  };

  const processAudio = async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      if (data?.text) {
        const transcribedText = data.text;
        setLiveTranscript(transcribedText);
        
        const metadata: VoiceMetadata = {
          duration,
          confidence: data.confidence,
          language: data.language,
          recordedAt: new Date().toISOString()
        };

        // Check for voice commands
        const command = detectVoiceCommand(transcribedText);
        if (command && onCommand) {
          await haptic.success();
          toast.success("Voice Command", {
            description: `Executing: "${command}"`,
            icon: <Sparkles className="h-4 w-4" />
          });
          onCommand(command);
        } else {
          onTranscription(transcribedText, metadata);
          await haptic.success();
          toast.success("Transcription complete!", {
            description: `${transcribedText.slice(0, 50)}${transcribedText.length > 50 ? '...' : ''}`
          });
        }
        
        setTimeout(() => setLiveTranscript(""), 3000);
      } else {
        throw new Error("No transcription received");
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      await haptic.error();
      toast.error("Failed to transcribe audio", {
        description: "Please try again or check your connection"
      });
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Icon variant
  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isProcessing}
        className={cn(
          "relative transition-all duration-200",
          isRecording && "bg-destructive text-destructive-foreground animate-pulse border-destructive ring-4 ring-destructive/20",
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
          <>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full animate-pulse" />
            <span className="absolute inset-0 rounded-md" 
                  style={{ 
                    boxShadow: `0 0 ${audioLevel / 5}px rgba(239, 68, 68, 0.5)` 
                  }} 
            />
          </>
        )}
      </Button>
    );
  }

  // Minimal variant
  if (variant === "minimal") {
    return (
      <div className={cn("relative", className)}>
        <Button
          type="button"
          variant={isRecording ? "destructive" : "ghost"}
          size="sm"
          onClick={handleClick}
          disabled={isProcessing}
          className={cn(
            "gap-2",
            isRecording && "animate-pulse"
          )}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              {recordingDuration.toFixed(1)}s
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Voice
            </>
          )}
        </Button>
        {liveTranscript && (
          <div className="absolute top-full mt-2 left-0 right-0 p-2 bg-card border rounded-lg shadow-lg text-sm animate-in fade-in-50 slide-in-from-top-2">
            {liveTranscript}
          </div>
        )}
      </div>
    );
  }

  // Full-featured variant
  return (
    <>
      <PrivacyConsentDialog
        open={showConsentDialog}
        onOpenChange={setShowConsentDialog}
        type="microphone"
        onConsent={handleConsentResponse}
        context={context}
      />
      <Card className={cn("p-6 space-y-4", className)}>
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full transition-all",
            isRecording 
              ? "bg-destructive animate-pulse" 
              : "bg-gradient-to-br from-primary to-secondary"
          )}>
            {isRecording ? (
              <MicOff className="h-5 w-5 text-primary-foreground" />
            ) : (
              <Mic className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">
              {isRecording ? "Recording..." : "Voice Input"}
            </h3>
            <p className="text-sm text-muted-foreground">{messages.hint}</p>
          </div>
        </div>
        {enableCommands && !isRecording && (
          <Sparkles className="h-5 w-5 text-primary" />
        )}
      </div>

      {isRecording && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Recording</span>
            <span className="font-mono">{recordingDuration.toFixed(1)}s / {maxDuration}s</span>
          </div>
          <Progress value={(recordingDuration / maxDuration) * 100} className="h-2" />
          
          {/* Audio visualization */}
          <div className="flex items-center gap-1 justify-center h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-destructive rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(4, (audioLevel / 255) * 48 * (Math.sin((i + Date.now() / 100) / 3) + 1))}px`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {liveTranscript && (
        <div className="p-4 rounded-lg bg-muted animate-in fade-in-50">
          <p className="text-sm">{liveTranscript}</p>
        </div>
      )}

      <Button
        onClick={handleClick}
        disabled={isProcessing}
        variant={isRecording ? "destructive" : "default"}
        className={cn(
          "w-full h-12",
          !isRecording && "bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground"
        )}
        aria-label={isRecording ? "Stop recording" : "Start voice recording"}
        aria-live="polite"
        aria-atomic="true"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Transcribing...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="mr-2 h-5 w-5" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-5 w-5" />
            Start Recording
          </>
        )}
      </Button>

      {enableCommands && !isRecording && (
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Voice Commands Available:</p>
          <div className="flex flex-wrap gap-1">
            {Object.values(VOICE_COMMANDS).flat().slice(0, 4).map((cmd) => (
              <span key={cmd} className="text-xs px-2 py-1 bg-muted rounded-full">
                "{cmd}"
              </span>
            ))}
          </div>
        </div>
      )}
      </Card>
    </>
  );
};
