"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Sparkles } from "lucide-react";
import { useAppState } from "@/store/useAppState";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const { currentSelection, setCurrentSelection } = useAppState();

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 border-t bg-background transition-colors">
      {currentSelection && (
        <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="group relative flex flex-col gap-1 rounded-[20px] bg-secondary border border-border p-4 text-[13px] text-foreground shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-[0.2em] text-[10px] opacity-60">
                        <Sparkles className="w-3 h-3 text-primary" />
                        <span>Attached Context</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full hover:bg-background transition-colors"
                        onClick={() => setCurrentSelection(null)}
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <div className="truncate font-serif italic text-sm pr-6 opacity-80">
                    {currentSelection.type === 'area' ? 'Selected region captured' : `"${currentSelection.content}"`}
                </div>
            </div>
        </div>
      )}
      
      <div className="relative group">
        <Textarea
          placeholder={currentSelection ? "Query AI about this selection..." : "Ask MarginStudio to analyze..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[120px] w-full bg-secondary/50 border-border focus-visible:ring-primary rounded-[24px] px-6 py-4 pb-12 resize-none transition-all duration-300 placeholder:text-muted-foreground/50 font-medium font-sans"
        />
        <div className="absolute right-4 bottom-4 flex items-center gap-3">
            <span className="text-[10px] font-bold text-muted-foreground/40 hidden group-focus-within:block animate-in fade-in tracking-wider uppercase">Shift + Enter for new line</span>
            <Button
                size="sm"
                className={cn(
                    "h-10 px-5 rounded-full shadow-lg transition-all active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground",
                    !input.trim() && "opacity-40 grayscale shadow-none"
                )}
                disabled={!input.trim() || isLoading}
                onClick={handleSend}
            >
                {isLoading ? (
                    <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-bounce delay-150" />
                    </div>
                ) : (
                    <>
                        <span className="font-bold tracking-tight">Send</span>
                        <Send className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}
