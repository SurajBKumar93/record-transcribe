import { useCallback } from "react";
import RecordButton from "@/components/RecordButton";
import AudioPlayer from "@/components/AudioPlayer";
import TranscriptCard from "@/components/TranscriptCard";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const { toast } = useToast();
  const { 
    isRecording, 
    audioUrl, 
    startRecording, 
    stopRecording 
  } = useAudioRecorder();

  const {
    transcript,
    isTranscribing,
    startTranscription,
    stopTranscription,
    resetTranscript,
    isSupported: isSpeechSupported,
  } = useSpeechRecognition();

  const handleRecordToggle = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      stopTranscription();
    } else {
      resetTranscript();
      await startRecording();
      if (isSpeechSupported) {
        startTranscription();
      } else {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Audio will still be recorded.",
          variant: "destructive",
        });
      }
    }
  }, [
    isRecording, 
    stopRecording, 
    stopTranscription, 
    startRecording, 
    startTranscription, 
    resetTranscript,
    isSpeechSupported,
    toast
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">Voice Memo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record and transcribe audio
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 gap-8">
        {/* Record Button */}
        <RecordButton
          isRecording={isRecording}
          onClick={handleRecordToggle}
        />

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-recording animate-pulse">
            <span className="w-2 h-2 rounded-full bg-recording" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}

        {/* Audio Player - show after recording */}
        {audioUrl && !isRecording && (
          <AudioPlayer audioUrl={audioUrl} />
        )}

        {/* Transcript Card */}
        {(transcript || isTranscribing || audioUrl) && (
          <TranscriptCard 
            transcript={transcript} 
            isTranscribing={isTranscribing} 
          />
        )}

        {/* Browser support warning */}
        {!isSpeechSupported && (
          <div className="flex items-center gap-2 px-4 py-3 bg-accent rounded-xl max-w-sm">
            <AlertCircle className="w-5 h-5 text-accent-foreground flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              Speech recognition is not supported in this browser. Try Chrome or Edge.
            </p>
          </div>
        )}
      </main>

      {/* Footer hint */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Tap the button to start recording
        </p>
      </footer>
    </div>
  );
};

export default Index;
