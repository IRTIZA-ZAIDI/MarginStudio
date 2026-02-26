"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, FileText, List, MoreHorizontal, Layout } from "lucide-react";
import { useAppState } from "@/store/useAppState";

interface FloatingContextMenuProps {
  position: { x: number; y: number };
  onAction: (action: string) => void;
}

export function FloatingContextMenu({ position, onAction }: FloatingContextMenuProps) {
  return (
    <div
      className="absolute z-50 flex flex-col gap-1 rounded-xl border bg-popover p-1.5 shadow-2xl animate-in fade-in zoom-in-95 pointer-events-auto transition-colors"
      style={{
        left: position.x,
        top: position.y + 10, // Offset slightly below
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-3 h-9 rounded-lg font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary"
        onClick={() => onAction("explain")}
      >
        <FileText className="h-4 w-4 text-primary" />
        Explain
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-3 h-9 rounded-lg font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary"
        onClick={() => onAction("summarize")}
      >
        <List className="h-4 w-4 text-primary" />
        Summarize
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="justify-start gap-3 h-9 rounded-lg font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary"
        onClick={() => onAction("send_to_canvas")}
      >
        <Layout className="h-4 w-4 text-primary" />
        Send to Canvas
      </Button>
      <div className="my-1 h-[1px] bg-border mx-1" />
      <Button
        variant="default"
        size="sm"
        className="justify-start gap-3 h-9 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
        onClick={() => onAction("ask_ai")}
      >
        <Sparkles className="h-4 w-4" />
        Ask AI
      </Button>
    </div>
  );
}
