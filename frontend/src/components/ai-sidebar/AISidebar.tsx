"use client";

import { Button } from "@/components/ui/button";
import { X, ChevronDown, Cpu, Sparkles } from "lucide-react";
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

const MODELS: { id: AIModel; name: string; description: string; provider: string }[] = [
    { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', description: 'Most balanced & intelligent', provider: 'Anthropic' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Maximum reasoning power', provider: 'Anthropic' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Multimodal & high speed', provider: 'OpenAI' },
    { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', description: 'Massive context window', provider: 'Google' },
];

export function AISidebar() {
  const { 
    isSidebarOpen, toggleSidebar, 
    chatHistory, sendMessage, 
    currentSelection, setCurrentSelection, 
    isLoading,
    selectedModel, setSelectedModel 
  } = useAppState();

  if (!isSidebarOpen) return null;

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, currentSelection);
    setCurrentSelection(null); // Clear selection after manual send
  };

  const currentModelData = MODELS.find(m => m.id === selectedModel);

  return (
    <div className="flex bg-background h-full flex-col border-l border-border transition-colors shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between border-b px-6 bg-secondary/30 backdrop-blur-md">
        <div className="flex flex-col">
            <span className="font-serif italic font-black text-lg tracking-tight text-foreground">AI Assistant</span>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity">
                        <Cpu className="h-3 w-3" />
                        {currentModelData?.name || 'Claude'}
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 rounded-xl p-1 shadow-2xl border-border">
                    {MODELS.map(model => (
                        <DropdownMenuItem 
                            key={model.id} 
                            className={cn(
                                "flex flex-col items-start gap-0.5 p-2 rounded-lg cursor-pointer transition-colors",
                                selectedModel === model.id ? "bg-primary/10 text-primary" : "hover:bg-secondary"
                            )}
                            onClick={() => setSelectedModel(model.id)}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className="font-bold text-[11px] uppercase tracking-wider">{model.name}</span>
                                {selectedModel === model.id && <Sparkles className="h-3 w-3" />}
                            </div>
                            <span className="text-[10px] opacity-60 leading-tight">{model.description}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-background" onClick={() => toggleSidebar()}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat History */}
      <ChatHistory messages={chatHistory} isLoading={isLoading} />

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
