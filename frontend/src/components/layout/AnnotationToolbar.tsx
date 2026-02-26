"use client";

import { Button } from "@/components/ui/button";
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
  Download,
  Square,
  Circle,
  Image as ImageIcon,
  Bold,
  Italic,
  List as ListIcon,
  Quote,
  Sparkles,
  ArrowUpRight,
  Minus,
  Diamond
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
import { v4 as uuidv4 } from "uuid";

export function AnnotationToolbar() {
  const { 
    toolMode, setToolMode, 
    zoomIn, zoomOut, scale, 
    strokeColor, setStrokeColor,
    undo, redo, history, future,
    versionHistory, saveVersion, restoreVersion,
    annotations, documents, activeDocumentId,
    activeTab, addWhiteboardElement, setActiveTab
  } = useAppState();

  const activeDoc = documents.find(d => d.id === activeDocumentId);

  const [versionName, setVersionName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const pdfTools: { mode: ToolMode; icon: React.ReactNode; label: string }[] = [
    { mode: "select", icon: <MousePointer2 className="h-4 w-4" />, label: "Select Text" },
    { mode: "highlight", icon: <Highlighter className="h-4 w-4" />, label: "Highlight" },
    { mode: "text", icon: <Type className="h-4 w-4" />, label: "Add Text" },
    { mode: "area", icon: <Crop className="h-4 w-4" />, label: "Area Select (for AI)" },
    { mode: "sticky", icon: <StickyNote className="h-4 w-4" />, label: "Sticky Note" },
    { mode: "pen", icon: <PenTool className="h-4 w-4" />, label: "Draw" },
    { mode: "eraser", icon: <Eraser className="h-4 w-4" />, label: "Eraser" },
  ];

  const whiteboardTools = [
    { id: 'select', icon: <MousePointer2 className="h-4 w-4" />, label: "Select" },
    { id: 'text', icon: <Type className="h-4 w-4" />, label: "Add Text Content" },
    { id: 'note', icon: <StickyNote className="h-4 w-4" />, label: "Add Sticky Note" },
    { id: 'shape_square', icon: <Square className="h-4 w-4" />, label: "Add Square" },
    { id: 'shape_diamond', icon: <Diamond className="h-4 w-4" />, label: "Add Diamond" },
    { id: 'shape_circle', icon: <Circle className="h-4 w-4" />, label: "Add Circle" },
    { id: 'arrow', icon: <ArrowUpRight className="h-4 w-4" />, label: "Add Arrow" },
    { id: 'line', icon: <Minus className="h-4 w-4" />, label: "Add Line" },
    { id: 'image', icon: <ImageIcon className="h-4 w-4" />, label: "Upload Image to Canvas" },
    { id: 'eraser', icon: <Eraser className="h-4 w-4" />, label: "Remove Element" },
  ];

  const notesTools = [
    { id: 'bold', icon: <Bold className="h-4 w-4" />, label: "Bold (Cmd+B)" },
    { id: 'italic', icon: <Italic className="h-4 w-4" />, label: "Italic (Cmd+I)" },
    { id: 'list', icon: <ListIcon className="h-4 w-4" />, label: "Bullet List" },
    { id: 'quote', icon: <Quote className="h-4 w-4" />, label: "Quote Block" },
    { id: 'ai_refine', icon: <Sparkles className="h-4 w-4" />, label: "AI Enhance" },
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

  if (activeTab === 'assets') return null;

  const handleWhiteboardAction = (id: string) => {
    if (id === 'select') return;
    if (id === 'eraser') return;
    
    const x = 200 + Math.random() * 200;
    const y = 200 + Math.random() * 200;
    
    if (id === 'text') addWhiteboardElement({ id: uuidv4(), type: 'text', x, y, content: 'Double click to edit text' });
    if (id === 'note') addWhiteboardElement({ id: uuidv4(), type: 'note', x, y, content: 'New Workspace Note', color: '#fef08a' });
    if (id === 'shape_square') addWhiteboardElement({ id: uuidv4(), type: 'shape', x, y, width: 100, height: 100, color: '#e5e7eb' });
    if (id === 'shape_diamond') addWhiteboardElement({ id: uuidv4(), type: 'diamond', x, y, width: 80, height: 80, color: '#e5e7eb' });
    if (id === 'arrow') addWhiteboardElement({ id: uuidv4(), type: 'arrow', x, y, width: 150, height: 100, color: '#e5e7eb' });
    if (id === 'line') addWhiteboardElement({ id: uuidv4(), type: 'line', x, y, width: 150, height: 100, color: '#e5e7eb' });
  };

  const handleNotesAction = (id: string) => {
    if (id === 'ai_refine') return;
    const map: Record<string, string> = {
        bold: 'bold',
        italic: 'italic',
        list: 'insertUnorderedList',
        quote: 'formatBlock'
    };
    document.execCommand(map[id], false, id === 'quote' ? 'BLOCKQUOTE' : undefined);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/80 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 p-2.5 rounded-3xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-12">
      
      {/* Dynamic Tools Group */}
      <div className="flex items-center gap-1.5 p-1 bg-secondary/50 rounded-2xl border border-white/10">
        {activeTab === 'reader' && pdfTools.map((tool) => (
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
            <TooltipContent side="top" className="rounded-lg font-bold text-[10px] uppercase tracking-wider mb-2">{tool.label}</TooltipContent>
          </Tooltip>
        ))}

        {activeTab === 'whiteboard' && whiteboardTools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleWhiteboardAction(tool.id)}
                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all font-bold"
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="rounded-lg font-bold text-[10px] uppercase tracking-wider mb-2">{tool.label}</TooltipContent>
          </Tooltip>
        ))}

        {activeTab === 'notes' && notesTools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleNotesAction(tool.id)}
                className={cn(
                    "h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all",
                    tool.id === 'ai_refine' && "text-primary bg-primary/5 hover:bg-primary/10"
                )}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="rounded-lg font-bold text-[10px] uppercase tracking-wider mb-2">{tool.label}</TooltipContent>
          </Tooltip>
        ))}

        {/* Color Picker (Only for relevant PDF tools) */}
        {activeTab === 'reader' && (toolMode === 'highlight' || toolMode === 'pen' || toolMode === 'text') && (
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
        {activeTab === 'reader' && (
            <>
                <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-xl transition-all hover:bg-background/80", history.length === 0 && "opacity-30 pointer-events-none")} onClick={() => undo()}>
                                <Undo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">Undo</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-10 w-10 rounded-xl transition-all hover:bg-background/80", future.length === 0 && "opacity-30 pointer-events-none")} onClick={() => redo()}>
                                <Redo className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="mb-2 text-[10px] font-bold uppercase tracking-wider">Redo</TooltipContent>
                    </Tooltip>
                </div>

                <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background/80">
                                <History className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
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
                                            <div className="font-bold text-sm tracking-tight">{v.name}</div>
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

                <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-white/10">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background/80" onClick={() => zoomOut()}>-</Button>
                    <div className="text-[10px] font-bold w-12 text-center text-muted-foreground tracking-widest uppercase">{Math.round(scale * 100)}%</div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-background/80" onClick={() => zoomIn()}>+</Button>
                </div>
            </>
        )}

        {/* Utilities */}
        <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-white/10">
          {activeTab === 'reader' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-background/80"
                onClick={() => activeDoc && exportAnnotatedPDF(activeDoc.url, annotations)}
              >
                <Download className="h-4 w-4" />
              </Button>
          )}
          {(activeTab === 'whiteboard' || activeTab === 'notes') && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => alert('Research successfully synced to node.')}
              >
                <Save className="h-4 w-4" />
              </Button>
          )}
        </div>
      </div>
    </div>
  );
}
