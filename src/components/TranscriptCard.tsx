import { FileText, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptCardProps {
  transcript: string;
  isTranscribing: boolean;
}

const TranscriptCard = ({ transcript, isTranscribing }: TranscriptCardProps) => {
  return (
    <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Transcript</h3>
        {isTranscribing && (
          <Loader2 className="w-4 h-4 ml-auto text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-48">
        <div className="p-5">
          {isTranscribing ? (
            <p className="text-muted-foreground text-sm italic">
              Listening...
            </p>
          ) : transcript ? (
            <p className="text-foreground leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              Record audio to see the transcript here
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TranscriptCard;
