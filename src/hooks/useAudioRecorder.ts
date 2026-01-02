import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const requestMicrophoneWithRetry = async (maxRetries = 3, retryDelay = 500): Promise<MediaStream> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        // If permission is prompt, we need to request it
        if (permissionStatus.state === 'prompt' || permissionStatus.state === 'granted') {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          return stream;
        }
        
        // If denied, wait a bit and retry (Android WebView may update permission state)
        if (permissionStatus.state === 'denied') {
          if (attempt < maxRetries - 1) {
            await delay(retryDelay);
            continue;
          }
          throw new Error('Microphone permission denied');
        }
      } else {
        // Permissions API not available, try directly
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return stream;
      }
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown error');
      
      // If it's not a permission error, don't retry
      if (!lastError.message.includes('Permission') && 
          !lastError.message.includes('NotAllowed') &&
          !lastError.message.includes('denied')) {
        throw lastError;
      }
      
      // Wait before retrying (Android WebView may need time to process permission)
      if (attempt < maxRetries - 1) {
        await delay(retryDelay);
      }
    }
  }
  
  // Final attempt without permission check
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return stream;
  } catch (err) {
    throw lastError || new Error('Failed to access microphone');
  }
};

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission with retry logic for Android WebView
      const stream = await requestMicrophoneWithRetry(3, 500);
      streamRef.current = stream;
      
      // Create MediaRecorder with fallback mime types
      let mediaRecorder: MediaRecorder;
      const mimeTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', ''];
      
      for (const mimeType of mimeTypes) {
        try {
          const options = mimeType ? { mimeType } : undefined;
          mediaRecorder = new MediaRecorder(stream, options);
          break;
        } catch {
          continue;
        }
      }
      
      mediaRecorderRef.current = mediaRecorder!;
      chunksRef.current = [];

      mediaRecorder!.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder!.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder!.mimeType || "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder!.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording failed');
        toast({
          title: "Recording Error",
          description: "An error occurred during recording.",
          variant: "destructive",
        });
      };

      mediaRecorder!.start();
      setIsRecording(true);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to access microphone";
      setError(message);
      
      // Clean up any partial stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (message.includes("Permission") || message.includes("NotAllowed") || message.includes("denied")) {
        toast({
          title: "Microphone Access Required",
          description: "Please grant microphone permission in your device settings and try again.",
          variant: "destructive",
        });
      } else if (message.includes("NotFound") || message.includes("not found")) {
        toast({
          title: "No Microphone Found",
          description: "Please connect a microphone and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Recording Error",
          description: message,
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    audioUrl,
    startRecording,
    stopRecording,
    error,
  };
};
