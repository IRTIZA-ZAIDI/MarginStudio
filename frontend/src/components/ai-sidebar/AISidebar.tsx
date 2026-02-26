"use client";

import { Button } from "@/components/ui/button";
import { X, ChevronDown, Cpu, Sparkles, MessageSquare } from "lucide-react";
import { useAppState, AIModel } from "@/store/useAppState";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const MODELS: { id: AIModel; name: string; desc: string }[] = [
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', desc: 'Balanced & intelligent' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', desc: 'Maximum reasoning' },
  { id: 'gpt-4o', name: 'GPT-4o', desc: 'Multimodal & fast' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', desc: 'Large context window' },
];

export function AISidebar() {
  const {
    isSidebarOpen, toggleSidebar,
    chatHistory, sendMessage,
    currentSelection, setCurrentSelection,
    isLoading,
    selectedModel, setSelectedModel
  } = useAppState();

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, currentSelection);
    setCurrentSelection(null);
  };

  const currentModelData = MODELS.find(m => m.id === selectedModel);

  // No need for!isSidebarOpen UI here anymore, handled in parent

  return (
    <div className="flex flex-col h-full w-full border-l border-border bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">AI Assistant</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors ml-1 px-1.5 py-0.5 rounded bg-secondary/50">
                <Cpu className="h-3 w-3" />
                {currentModelData?.name || 'Claude'}
                <ChevronDown className="h-2.5 w-2.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 rounded-lg p-1">
              {MODELS.map(model => (
                <DropdownMenuItem
                  key={model.id}
                  className={cn(
                    "flex flex-col items-start gap-0 p-2 rounded-md cursor-pointer",
                    selectedModel === model.id && "bg-primary/10 text-primary"
                  )}
                  onClick={() => setSelectedModel(model.id)}
                >
                  <span className="text-xs font-medium">{model.name}</span>
                  <span className="text-[10px] text-muted-foreground">{model.desc}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={toggleSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat History */}
      <ChatHistory messages={chatHistory} isLoading={isLoading} />

      {/* Input */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
