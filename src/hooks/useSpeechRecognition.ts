import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionReturn {
  transcript: string;
  isTranscribing: boolean;
  startTranscription: () => void;
  stopTranscription: () => void;
  resetTranscript: () => void;
  isSupported: boolean;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Check if browser supports Speech Recognition
  const isSupported = typeof window !== "undefined" && 
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    return recognition;
  }, [isSupported]);

  const startTranscription = useCallback(() => {
    if (!isSupported) return;

    // Clear previous transcript
    setTranscript("");
    setIsTranscribing(true);

    const recognition = createRecognition();
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      // Only process final results
      const result = event.results[0];
      if (result && result.isFinal) {
        const finalTranscript = result[0].transcript;
        setTranscript(prev => prev ? prev + " " + finalTranscript : finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        // Restart if no speech detected and still transcribing
        if (isTranscribing) {
          try {
            recognition.start();
          } catch (err) {
            // Ignore
          }
        }
      } else {
        setIsTranscribing(false);
      }
    };

    recognition.onend = () => {
      // Restart recognition if still in transcribing mode (continuous listening)
      if (isTranscribing && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (err) {
          // Recognition might be stopped intentionally
        }
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsTranscribing(false);
    }
  }, [isSupported, createRecognition, isTranscribing]);

  const stopTranscription = useCallback(() => {
    setIsTranscribing(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore errors when stopping
      }
      recognitionRef.current = null;
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
