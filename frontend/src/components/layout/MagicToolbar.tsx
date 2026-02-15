"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppState, GeneratedAsset } from "@/store/useAppState";
import {
  BrainCircuit,
  FileText,
  ListTodo,
  Presentation,
  Mic,
  GitBranch,
  ScanText,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  Loader2
} from "lucide-react";

export function MagicToolbar() {
  const { sendMessage, currentSelection, isGenerating } = useAppState();

  const actions: { id: GeneratedAsset['type'] | 'extract-text' | 'extract-images' | 'convert'; icon: React.ReactNode; label: string; prompt: string }[] = [
    { id: "flashcards", icon: <BrainCircuit className="h-4 w-4" />, label: "Make Flashcards", prompt: "Convert this into active recall flashcards." },
    { id: "summary", icon: <FileText className="h-4 w-4" />, label: "Full Summary", prompt: "Provide a comprehensive summary of this content." },
    { id: "pointers", icon: <ListTodo className="h-4 w-4" />, label: "Key Pointers", prompt: "Extract the most important bullet points." },
    { id: "slidedeck", icon: <Presentation className="h-4 w-4" />, label: "Slide Deck Outline", prompt: "Create a 5-slide presentation outline based on this." },
    { id: "podcast", icon: <Mic className="h-4 w-4" />, label: "Podcast Script", prompt: "Turn this selection into a compelling podcast script for two hosts." },
    { id: "diagram", icon: <GitBranch className="h-4 w-4" />, label: "Diagram / Flow", prompt: "Describe how to represent this as a Mermaid diagram or flowchart." },
    { id: "extract-text", icon: <ScanText className="h-4 w-4" />, label: "Extract Text", prompt: "Extract and clean up all text from this selection." },
    { id: "extract-images", icon: <ImageIcon className="h-4 w-4" />, label: "Extract Images", prompt: "Identify and describe all visual elements in this region." },
    { id: "convert", icon: <RefreshCw className="h-4 w-4" />, label: "Convert Content", prompt: "Convert this information into a different technical format (e.g. JSON, LaTeX)." },
  ];

  const handleAction = (prompt: string, type: string) => {
    // Only pass type for the physical asset generation
    const isAsset = ['flashcards', 'summary', 'pointers', 'slidedeck', 'podcast', 'diagram'].includes(type);
    sendMessage(prompt, currentSelection, isAsset ? (type as any) : undefined);
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-2 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-[24px] z-[60] transition-all hover:ring-1 hover:ring-primary/20">
      <div className="flex items-center justify-center p-2 border-b border-border/50 mb-1">
        {isGenerating ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : (
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        )}
      </div>
      
      {actions.map((action) => (
        <Tooltip key={action.id} delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isGenerating}
              onClick={() => handleAction(action.prompt, action.id)}
              className={cn(
                  "h-10 w-10 rounded-xl transition-all hover:bg-primary/10 hover:text-primary active:scale-90 group relative",
                  !currentSelection && "opacity-30 grayscale pointer-events-none"
              )}
            >
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-full transition-all group-hover:h-6" />
              {action.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="rounded-xl font-black text-[10px] uppercase tracking-[0.1em] px-3 py-2 bg-foreground text-background shadow-2xl">
            {action.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
