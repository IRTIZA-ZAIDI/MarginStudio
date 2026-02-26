"use client";

import { useState } from "react";
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
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export function MagicToolbar() {
  const { sendMessage, currentSelection, isGenerating, setActiveTab, setSidebarOpen } = useAppState();
  const [isExpanded, setIsExpanded] = useState(true);

  const actions: { id: GeneratedAsset['type'] | 'extract-text' | 'extract-images' | 'convert' | 'chat-pdf'; icon: React.ReactNode; label: string; prompt: string }[] = [
    { id: "chat-pdf", icon: <MessageSquare className="h-4 w-4" />, label: "Chat with PDF", prompt: "Let's discuss this document." },
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
    
    // For chat-pdf, we can just send an initial prompt without attaching selection if it doesn't exist?
    // The existing tool disables buttons if no selection. We should allow chat-pdf even if no selection!
    sendMessage(prompt, currentSelection, isAsset ? (type as any) : undefined);
    
    if (isAsset) {
        setActiveTab('assets');
    } else if (type === 'chat-pdf') {
        setSidebarOpen(true);
    }
  };

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-2 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-[24px] z-[60] transition-all hover:ring-1 hover:ring-primary/20">
      <div 
        className="flex items-center justify-center p-2 border-b border-border/50 mb-1 cursor-pointer hover:bg-secondary rounded-xl transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Toggle AI Tools"
      >
        <div className="flex flex-col items-center gap-1">
          {isGenerating ? (
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
          ) : (
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          )}
          {isExpanded ? <ChevronUp className="h-3 w-3 text-muted-foreground opacity-50" /> : <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50" />}
        </div>
      </div>
      
      <div className={cn("flex flex-col gap-1.5 overflow-hidden transition-all duration-300", isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none")}>
        {actions.map((action) => {
          // Allow chat-pdf to work without a selection!
          const requiresSelection = action.id !== "chat-pdf";
          const isDisabled = (requiresSelection && !currentSelection);
          return (
            <Tooltip key={action.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isGenerating}
                  onClick={() => handleAction(action.prompt, action.id)}
                  className={cn(
                      "h-10 w-10 rounded-xl transition-all hover:bg-primary/10 hover:text-primary active:scale-90 group relative",
                      isDisabled && "opacity-30 grayscale pointer-events-none"
                  )}
                >
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-0 bg-primary rounded-full transition-all group-hover:h-6" />
                  {action.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="rounded-xl font-black text-[10px] uppercase tracking-[0.1em] px-3 py-2 bg-foreground text-background shadow-2xl mr-2">
                {action.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
