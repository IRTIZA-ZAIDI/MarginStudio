"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppState, ToolMode } from "@/store/useAppState";
import {
  MousePointer2,
  Highlighter,
  Type,
  Crop,
  StickyNote,
  PenTool,
  Eraser,
  Undo,
  Redo,
  History,
  Save,
  Check,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { exportAnnotatedPDF } from "@/lib/pdf-export";

export function AnnotationToolbar() {
  const { 
    toolMode, setToolMode, 
    zoomIn, zoomOut, scale, 
    strokeColor, setStrokeColor,
    undo, redo, history, future,
    versionHistory, saveVersion, restoreVersion,
    annotations, documents, activeDocumentId
  } = useAppState();

  const activeDoc = documents.find(d => d.id === activeDocumentId);

  const [versionName, setVersionName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const tools: { mode: ToolMode; icon: React.ReactNode; label: string }[] = [
    { mode: "select", icon: <MousePointer2 className="h-4 w-4" />, label: "Select Text" },
    { mode: "highlight", icon: <Highlighter className="h-4 w-4" />, label: "Highlight" },
    { mode: "text", icon: <Type className="h-4 w-4" />, label: "Add Text" },
    { mode: "area", icon: <Crop className="h-4 w-4" />, label: "Area Select (for AI)" },
    { mode: "sticky", icon: <StickyNote className="h-4 w-4" />, label: "Sticky Note" },
    { mode: "pen", icon: <PenTool className="h-4 w-4" />, label: "Draw" },
    { mode: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
  ];

  const colors = [
    { name: 'Teal', value: '#0f766e' },
    { name: 'Yellow', value: '#fde047' },
    { name: 'Green', value: '#86efac' },
    { name: 'Blue', value: '#93c5fd' },
    { name: 'Purple', value: '#d8b4fe' },
    { name: 'Red', value: '#fca5a5' },
  ];

  const handleSaveVersion = () => {
    if (!versionName.trim()) return;
    saveVersion(versionName);
    setVersionName("");
    setIsSaving(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/80 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 p-2.5 rounded-3xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12">
      <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-2xl border border-white/10">
        {tools.map((tool) => (
          <Tooltip key={tool.mode}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setToolMode(tool.mode)}
                className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-300",
                    toolMode === tool.mode 
                        ? (tool.mode === 'select' || tool.mode === 'area' || tool.mode === 'eraser' 
                            ? "bg-foreground text-background shadow-lg scale-110" 
                            : "bg-primary text-primary-foreground shadow-lg scale-110 ring-4 ring-primary/20")
                        : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                )}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="rounded-lg font-bold text-[10px] uppercase tracking-wider mb-2">
              {tool.label}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Color Picker (Only for relevant tools) */}
        {(toolMode === 'highlight' || toolMode === 'pen' || toolMode === 'text') && (
            <div className="flex items-center gap-2 px-3 animate-in fade-in slide-in-from-left-4">
                <div className="w-px h-6 bg-border mx-1" />
                {colors.map((c) => (
                    <button
                        key={c.value}
                        onClick={() => setStrokeColor(c.value)}
                        className={cn(
                            "w-5 h-5 rounded-full transition-all duration-300 ring-offset-2 ring-offset-background/80",
                            strokeColor === c.value ? "ring-2 ring-primary scale-125 shadow-md" : "hover:scale-110 opacity-70 hover:opacity-100"
                        )}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                    />
                ))}
            </div>
        )}
      </div>

      <div className="w-px h-8 bg-border" />

      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-10 w-10 rounded-xl transition-all hover:bg-background/80", history.length === 0 && "opacity-30 pointer-events-none")} 
                        onClick={() => undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">Undo</TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-10 w-10 rounded-xl transition-all hover:bg-background/80", future.length === 0 && "opacity-30 pointer-events-none")} 
                        onClick={() => redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">Redo</TooltipContent>
            </Tooltip>
        </div>

        {/* Version History */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10">
            <DropdownMenu>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background/80">
                                <History className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">Versions</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="center" side="top" className="w-64 mb-4 rounded-xl shadow-2xl p-2 border-white/10">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                        Version History
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 hover:text-primary rounded-full" onClick={() => setIsSaving(!isSaving)}>
                            <Save className="h-3 w-3" />
                        </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isSaving && (
                        <div className="p-2 flex gap-2 animate-in slide-in-from-top-2">
                            <Input 
                                placeholder="v1.0 Basic Notes" 
                                className="h-8 text-xs font-medium" 
                                value={versionName} 
                                onChange={(e) => setVersionName(e.target.value)}
                                autoFocus
                            />
                            <Button size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={handleSaveVersion}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="max-h-[300px] overflow-y-auto">
                        {versionHistory.length === 0 ? (
                            <div className="p-4 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No versions saved</div>
                        ) : (
                            versionHistory.map((v) => (
                                <DropdownMenuItem key={v.id} className="flex flex-col items-start p-3 rounded-lg cursor-pointer gap-0.5" onClick={() => restoreVersion(v.id)}>
                                    <div className="font-bold text-sm">{v.name}</div>
                                    <div className="text-[10px] opacity-50 uppercase tracking-tighter">
                                        {new Date(v.timestamp).toLocaleString()} • {v.annotations.length} items
                                    </div>
                                </DropdownMenuItem>
                            ))
                        )}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-white/10">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background/80" onClick={() => zoomOut()}>
                <span className="text-sm font-bold leading-none">-</span>
            </Button>
            <div className="text-[10px] font-bold w-12 text-center text-muted-foreground tracking-widest uppercase px-1">
                {Math.round(scale * 100)}%
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background/80" onClick={() => zoomIn()}>
                <span className="text-sm font-bold leading-none">+</span>
            </Button>
        </div>

        {/* Download */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-background/80"
                onClick={() => {
                  if (activeDoc) {
                    exportAnnotatedPDF(activeDoc.url, annotations);
                  }
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">Download PDF</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
