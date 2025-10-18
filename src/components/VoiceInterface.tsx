import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AudioRecorder, encodeAudioForAPI, AudioQueue } from '@/utils/RealtimeAudio';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const VoiceInterface = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      console.log('Connecting to voice assistant...');
      
      // Initialize audio context and queue
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      audioQueueRef.current = new AudioQueue(audioContextRef.current);

      // Connect to WebSocket - using full URL
      const ws = new WebSocket('wss://iyotklwiwyljospfqnoy.supabase.co/functions/v1/realtime-voice');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success('Voice assistant connected!');
        startRecording();
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message type:', data.type);

          switch (data.type) {
            case 'session.created':
              console.log('Session created');
              break;

            case 'session.updated':
              console.log('Session configured');
              break;

            case 'response.audio.delta':
              // Play audio chunk
              if (data.delta) {
                const binaryString = atob(data.delta);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                await audioQueueRef.current?.addToQueue(bytes);
                setIsSpeaking(true);
              }
              break;

            case 'response.audio.done':
              console.log('Audio response complete');
              setIsSpeaking(false);
              break;

            case 'response.audio_transcript.delta':
              // Accumulate transcript
              if (data.delta) {
                setCurrentTranscript(prev => prev + data.delta);
              }
              break;

            case 'response.audio_transcript.done':
              // Complete transcript
              if (data.transcript) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: data.transcript,
                  timestamp: new Date()
                }]);
                setCurrentTranscript('');
              }
              break;

            case 'input_audio_buffer.speech_started':
              console.log('User started speaking');
              setIsRecording(true);
              break;

            case 'input_audio_buffer.speech_stopped':
              console.log('User stopped speaking');
              setIsRecording(false);
              break;

            case 'conversation.item.input_audio_transcription.completed':
              // User's speech transcribed
              if (data.transcript) {
                setMessages(prev => [...prev, {
                  role: 'user',
                  content: data.transcript,
                  timestamp: new Date()
                }]);
              }
              break;

            case 'error':
              console.error('Error from server:', data.error);
              toast.error(data.error || 'An error occurred');
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
        disconnect();
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsRecording(false);
        setIsSpeaking(false);
        stopRecording();
      };

    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect to voice assistant');
    }
  };

  const startRecording = async () => {
    try {
      console.log('Starting microphone recording...');
      recorderRef.current = new AudioRecorder((audioData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64Audio = encodeAudioForAPI(audioData);
          wsRef.current.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          }));
        }
      });
      
      await recorderRef.current.start();
      console.log('Microphone recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    console.log('Stopping microphone recording...');
    recorderRef.current?.stop();
    recorderRef.current = null;
  };

  const disconnect = () => {
    console.log('Disconnecting...');
    stopRecording();
    audioQueueRef.current?.clear();
    audioContextRef.current?.close();
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setIsRecording(false);
    setIsSpeaking(false);
    setMessages([]);
    setCurrentTranscript('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Voice Assistant</h2>
          {isConnected && (
            <div className="flex items-center gap-2">
              {isRecording && (
                <div className="flex items-center gap-2 text-destructive">
                  <Mic className="h-5 w-5 animate-pulse" />
                  <span className="text-sm">Listening...</span>
                </div>
              )}
              {isSpeaking && (
                <div className="flex items-center gap-2 text-primary">
                  <Volume2 className="h-5 w-5 animate-pulse" />
                  <span className="text-sm">Speaking...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                  : 'bg-muted max-w-[80%]'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-70">
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
          {currentTranscript && (
            <div className="p-3 rounded-lg bg-muted/50 max-w-[80%]">
              <p className="text-sm opacity-70">{currentTranscript}...</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!isConnected ? (
            <Button onClick={connect} className="w-full" size="lg">
              <Mic className="mr-2 h-5 w-5" />
              Start Voice Assistant
            </Button>
          ) : (
            <Button onClick={disconnect} variant="destructive" className="w-full" size="lg">
              <MicOff className="mr-2 h-5 w-5" />
              End Conversation
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Speak naturally to book appointments, check availability, or get hair care advice
        </p>
      </CardContent>
    </Card>
  );
};
