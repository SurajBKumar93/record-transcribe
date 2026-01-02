import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechRecognitionReturn {
  transcript: string;
  isTranscribing: boolean;
  startTranscription: () => void;
  stopTranscription: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

// Extend Window interface for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check if browser supports Speech Recognition
  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(prev => {
        const base = finalTranscript ? prev + finalTranscript : prev;
        return interimTranscript ? base + interimTranscript : base;
      });
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        setIsTranscribing(false);
      }
    };

    recognition.onend = () => {
      setIsTranscribing(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isSupported]);

  const startTranscription = useCallback(() => {
    if (recognitionRef.current && isSupported) {
      setTranscript("");
      setIsTranscribing(true);
      try {
        recognitionRef.current.start();
      } catch (err) {
        // Recognition might already be running
        console.log("Recognition already started");
      }
    }
  }, [isSupported]);

  const stopTranscription = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsTranscribing(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    transcript,
    isTranscribing,
    startTranscription,
    stopTranscription,
    resetTranscript,
    isSupported,
  };
};
