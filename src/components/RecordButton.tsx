import { Mic, Square } from "lucide-react";

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const RecordButton = ({ isRecording, onClick, disabled }: RecordButtonProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when recording */}
      {isRecording && (
        <>
          <div className="absolute w-40 h-40 rounded-full bg-recording/30 animate-pulse-ring" />
          <div className="absolute w-40 h-40 rounded-full bg-recording/20 animate-pulse-ring [animation-delay:0.5s]" />
        </>
      )}
      
      {/* Main button */}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          relative z-10 w-40 h-40 rounded-full
          flex flex-col items-center justify-center gap-2
          font-semibold text-lg
          transition-all duration-300 ease-out
          shadow-xl hover:shadow-2xl
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isRecording 
            ? 'bg-recording text-recording-foreground animate-pulse-dot' 
            : 'bg-primary text-primary-foreground hover:brightness-110'
          }
        `}
      >
        {isRecording ? (
          <>
            <Square className="w-8 h-8" fill="currentColor" />
            <span className="text-sm font-medium">Tap to Stop</span>
          </>
        ) : (
          <>
            <Mic className="w-10 h-10" />
            <span className="text-sm font-medium">Tap to Record</span>
          </>
        )}
      </button>
    </div>
  );
};

export default RecordButton;
