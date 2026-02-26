"use client";

import { useAppState } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    Bold, Italic, List, 
    ListOrdered, Heading1, Heading2, 
    Quote, Type, Sparkles, Save,
    CheckCircle2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

export function NotesEditor() {
  const { workspaces, activeWorkspaceId, updateWorkspaceNotes } = useAppState();
  const activeWS = workspaces.find(w => w.id === activeWorkspaceId);
  
  const [content, setContent] = useState(activeWS?.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (activeWS?.notes !== undefined) {
      setContent(activeWS.notes);
    }
  }, [activeWorkspaceId, activeWS?.notes]);

  const handleSave = () => {
    if (activeWorkspaceId) {
      setIsSaving(true);
      updateWorkspaceNotes(activeWorkspaceId, content);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
        if (activeWorkspaceId && content !== activeWS?.notes) {
            updateWorkspaceNotes(activeWorkspaceId, content);
        }
    }, 2000);
    return () => clearTimeout(timer);
  }, [content, activeWorkspaceId]);

  const handleSelection = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setToolbarPos({
            top: rect.top - 60,
            left: rect.left + rect.width / 2
        });
        setShowToolbar(true);
    } else {
        setShowToolbar(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="h-full w-full bg-background overflow-y-auto px-6 py-12 md:px-20 lg:px-40 transition-all duration-700">
      <div className="max-w-3xl mx-auto min-h-screen">
        
        {/* Header/Status */}
        <div className="flex items-center justify-between mb-16 px-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Research Notebook • {activeWS?.name}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                    isSaving ? "text-primary opacity-100" : "text-muted-foreground/0"
                )}>
                    {isSaving ? "Syncing..." : "Saved"}
                </span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSave}
                    className="rounded-xl hover:bg-secondary group"
                >
                    <Save className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
            </div>
        </div>

        {/* Medium-Style Content Editable */}
        <div className="prose prose-zinc dark:prose-invert prose-lg max-w-none">
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                onMouseUp={handleSelection}
                onKeyUp={handleSelection}
                className="outline-none min-h-[60vh] leading-relaxed text-foreground/90 selection:bg-primary/20"
                style={{ 
                    fontFamily: 'var(--font-serif), serif',
                    fontSize: '1.25rem'
                }}
            >
                {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                ) : (
                    <h1 className="text-5xl font-bold mb-8 italic tracking-tight opacity-20 capitalize">Start your research synthesis here...</h1>
                )}
            </div>
        </div>
      </div>

      {/* Floating Toolbar */}
      {showToolbar && (
          <div 
            className="fixed z-[100] flex items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 -translate-x-1/2"
            style={{ 
               top: toolbarPos.top, 
               left: toolbarPos.left,
               pointerEvents: 'auto'
            }}
          >
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => execCommand('bold')}>
                <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => execCommand('italic')}>
                <Italic className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => execCommand('formatBlock', 'H2')}>
                <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => execCommand('formatBlock', 'H3')}>
                <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => execCommand('insertUnorderedList')}>
                <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10" onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')}>
                <Quote className="h-4 w-4" />
            </Button>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <Button variant="ghost" size="sm" className="h-8 px-2 text-[9px] font-black uppercase text-primary hover:bg-white/10 gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                AI Refine
            </Button>
          </div>
      )}

      {/* Empty State Ornament */}
      {!content && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.4em] opacity-10 pointer-events-none">
             Long-form Neural Synthesis Engine
          </div>
      )}
    </div>
  );
}
