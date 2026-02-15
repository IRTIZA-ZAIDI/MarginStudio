"use client";

import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Message } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { Bot, User, Image as ImageIcon, FileText } from "lucide-react";

interface ChatHistoryProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
          <Bot className="h-12 w-12 mb-4 opacity-20" />
          <p className="font-medium">Welcome to MarginStudio</p>
          <p className="text-sm">Select text or an area in the PDF to start asking questions.</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex gap-3",
            message.role === "user" ? "flex-row-reverse" : "flex-row"
          )}
        >
          <Avatar className="h-8 w-8 mt-1 border">
            {message.role === "user" ? (
              <>
                 <AvatarImage src="/user-avatar.png" />
                 <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
              </>
            ) : (
              <>
                 <AvatarImage src="/ai-avatar.png" />
                 <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
              </>
            )}
          </Avatar>

          <div
            className={cn(
              "flex flex-col max-w-[90%] rounded-[24px] px-5 py-4 shadow-sm transition-all",
              message.role === "user"
                ? "bg-primary text-primary-foreground !rounded-tr-none"
                : "bg-card border border-border text-foreground !rounded-tl-none"
            )}
          >
            {message.relatedSelection && (
              <div className={cn(
                  "mb-4 p-3 rounded-xl flex flex-col gap-1.5 text-[12px] border",
                  message.role === 'user' 
                    ? "bg-white/10 border-white/20 text-primary-foreground/90" 
                    : "bg-secondary border-border text-muted-foreground"
              )}>
                 <div className="flex items-center justify-between opacity-80 mb-0.5">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-[0.1em] text-[10px]">
                        {message.relatedSelection.type === 'area' ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        <span>{message.relatedSelection.type === 'area' ? 'Visual Snippet' : 'Text Selection'}</span>
                    </div>
                    {message.relatedSelection.pageNumber && (
                        <span className="text-[10px] font-bold">Page {message.relatedSelection.pageNumber}</span>
                    )}
                 </div>
                 
                 <div className={cn(
                      "leading-relaxed italic font-serif",
                      message.role === 'user' ? "text-primary-foreground/80" : "text-foreground/80"
                  )}>
                     {message.relatedSelection.type === 'area' ? (
                        <div className="flex flex-col gap-2 mt-1">
                            {message.relatedSelection.imageUrl ? (
                                <div className="relative group">
                                    <img 
                                        src={message.relatedSelection.imageUrl} 
                                        alt="Selected Area" 
                                        className="max-w-full rounded-lg border-2 border-white/20 shadow-xl bg-white/5 transition-transform hover:scale-[1.02]" 
                                    />
                                    <div className="absolute inset-0 rounded-lg bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                            ) : (
                                <span className="text-[11px] opacity-60">[Region captured for vision analysis]</span>
                            )}
                        </div>
                     ) : (
                        <span className="line-clamp-4">"{message.relatedSelection.content}"</span>
                     )}
                  </div>
              </div>
            )}
            
            <div className="text-[15px] leading-relaxed font-sans font-medium">
                {message.role === "user" ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif prose-headings:italic prose-headings:font-bold prose-headings:tracking-tight">
                        <MarkdownRenderer content={message.content} />
                    </div>
                )}
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Avatar className="h-8 w-8 mt-1 border grayscale opacity-50">
            <AvatarFallback className="bg-secondary text-muted-foreground"><Bot className="h-4 w-4" /></AvatarFallback>
          </Avatar>
          <div className="bg-card border border-border rounded-[24px] !rounded-tl-none px-5 py-4">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-bounce"></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
