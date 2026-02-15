"use client";

import { useRef, useState, useEffect } from "react";
import { useAppState, Annotation } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    StickyNote, Move, Maximize2, Type, Bold, Italic, 
    Strikethrough, Palette, Check, X, Edit3, 
    ChevronDown, AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AnnotationItemProps {
  annotation: Annotation;
  width: number;
  height: number;
}

const FONTS = [
    { name: 'Default', value: 'font-sans', label: 'Sans' },
    { name: 'Classic', value: 'font-serif', label: 'Serif' },
    { name: 'Modern', value: 'font-outfit', label: 'Outfit' },
    { name: 'Elegant', value: 'font-playfair', label: 'Playfair' },
    { name: 'Mono', value: 'font-mono', label: 'Mono' },
];

const STICKY_COLORS = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Orange', value: '#fed7aa' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Pink', value: '#fbcfe8' },
    { name: 'Purple', value: '#e9d5ff' },
];

const TEXT_COLORS = [
    { name: 'Sage', value: '#2d7a5f' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
];

export function AnnotationItem({ annotation, width, height }: AnnotationItemProps) {
  const { toolMode, updateAnnotation, removeAnnotation } = useAppState();
  const { theme } = useTheme();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(annotation.content || "");
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showToolbar, setShowToolbar] = useState(false);
  
  const itemRef = useRef<HTMLDivElement>(null);

  const { coordinates, type, id, color, content, fontSize, fontWeight, fontStyle, fontFamily, textDecoration } = annotation;

  const style = {
    left: coordinates.x1 * width,
    top: coordinates.y1 * height,
    width: (coordinates.x2 - coordinates.x1) * width,
    height: (coordinates.y2 - coordinates.y1) * height,
  };

  // ----------------------------------------------------------------------
  // Interaction Handlers
  // ----------------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'eraser') {
        removeAnnotation(id);
        return;
    }

    if (toolMode === 'select') {
        e.stopPropagation();
        if (type === 'text' || type === 'sticky') {
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            setShowToolbar(true);
        }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (toolMode === 'select' && (type === 'text' || type === 'sticky')) {
        e.stopPropagation();
        startEditing();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(content || "");
    setShowToolbar(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCommitEdit = () => {
    updateAnnotation(id, { content: editValue });
    setIsEditing(false);
  };

  const toggleStyle = (prop: string, value: string, defaultValue: string) => {
    const current = (annotation as any)[prop];
    updateAnnotation(id, { [prop]: current === value ? defaultValue : value });
  };

  const changeFontSize = (delta: number) => {
    const current = fontSize || 14;
    updateAnnotation(id, { fontSize: Math.max(8, Math.min(72, current + delta)) });
  };

  // ----------------------------------------------------------------------
  // Mouse Move / Up for Drag/Resize
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
        const dx = (e.clientX - dragStart.x) / width;
        const dy = (e.clientY - dragStart.y) / height;

        if (isDragging) {
            updateAnnotation(id, {
                coordinates: {
                    x1: coordinates.x1 + dx,
                    y1: coordinates.y1 + dy,
                    x2: coordinates.x2 + dx,
                    y2: coordinates.y2 + dy,
                }
            }, false);
            setDragStart({ x: e.clientX, y: e.clientY });
        } else if (isResizing) {
            updateAnnotation(id, {
                coordinates: {
                    ...coordinates,
                    x2: coordinates.x2 + dx,
                    y2: coordinates.y2 + dy,
                }
            }, false);
            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        updateAnnotation(id, { coordinates }, true);
        setIsDragging(false);
        setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, id, coordinates, width, height, updateAnnotation]);

  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (itemRef.current && !itemRef.current.contains(e.target as Node)) {
            setShowToolbar(false);
            if (isEditing) handleCommitEdit();
        }
    };
    if (showToolbar || isEditing) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showToolbar, isEditing, editValue]);

  // Automatically start editing for fresh empty notes to save clicks
  useEffect(() => {
    if ((type === 'text' || type === 'sticky') && content === "" && !isEditing) {
        setIsEditing(true);
    }
  }, [type, content, isEditing]);

  // ----------------------------------------------------------------------
  // Render Components
  // ----------------------------------------------------------------------
  const StyleToolbar = () => (
    <div 
        className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background/95 backdrop-blur-md border border-primary/20 p-2 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-3 z-[100] pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
    >
        {/* Font Family Dropdown */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-2 px-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10">
                    {FONTS.find(f => f.value === fontFamily)?.label || 'Sans'}
                    <ChevronDown className="h-3 w-3" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl border-border p-1 shadow-2xl">
                {FONTS.map(f => (
                    <DropdownMenuItem 
                        key={f.value} 
                        className={cn("rounded-lg gap-2 text-xs", f.value)}
                        onClick={() => updateAnnotation(id, { fontFamily: f.value })}
                    >
                        {f.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center border-r border-border pr-2 mr-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10" onClick={() => changeFontSize(-1)} title="Decrease font size">
                <span className="text-xs font-bold">-</span>
            </Button>
            <span className="text-[11px] font-black w-7 text-center text-primary">{fontSize || 14}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10" onClick={() => changeFontSize(1)} title="Increase font size">
                <span className="text-xs font-bold">+</span>
            </Button>
        </div>
        
        <div className="flex items-center gap-1">
            <Button 
                variant={fontWeight === 'bold' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={cn("h-8 w-8 rounded-xl", fontWeight === 'bold' && "bg-primary text-white hover:bg-primary/90")}
                onClick={() => toggleStyle('fontWeight', 'bold', 'normal')}
            >
                <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button 
                variant={fontStyle === 'italic' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={cn("h-8 w-8 rounded-xl", fontStyle === 'italic' && "bg-primary text-white hover:bg-primary/90")}
                onClick={() => toggleStyle('fontStyle', 'italic', 'normal')}
            >
                <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button 
                variant={textDecoration === 'line-through' ? 'secondary' : 'ghost'} 
                size="icon" 
                className={cn("h-8 w-8 rounded-xl", textDecoration === 'line-through' && "bg-primary text-white hover:bg-primary/90")}
                onClick={() => toggleStyle('textDecoration', 'line-through', 'none')}
            >
                <Strikethrough className="h-3.5 w-3.5" />
            </Button>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="flex items-center gap-1.5 px-1">
            {(type === 'sticky' ? STICKY_COLORS : TEXT_COLORS).map(c => (
                <button 
                    key={c.value}
                    className={cn(
                        "w-5 h-5 rounded-full border border-black/10 transition-all hover:scale-125 hover:shadow-md",
                        color === c.value && "ring-2 ring-primary ring-offset-2 scale-110"
                    )}
                    style={{ backgroundColor: c.value }}
                    onClick={() => updateAnnotation(id, { color: c.value })}
                />
            ))}
        </div>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-primary/10" onClick={startEditing}>
           <Edit3 className="h-3.5 w-3.5" />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={() => removeAnnotation(id)}>
            <X className="h-4 w-4" />
        </Button>
    </div>
  );

  if (type === 'highlight') {
    const renderRect = (rect: any, key: any) => (
        <div
            key={key}
            className={cn(
                "absolute mix-blend-multiply opacity-50 transition-shadow",
                toolMode === 'eraser' ? "cursor-pointer hover:ring-2 hover:ring-red-500 hover:opacity-80 pointer-events-auto" : "pointer-events-none"
            )}
            style={{
                left: rect.x1 * width,
                top: rect.y1 * height,
                width: (rect.x2 - rect.x1) * width,
                height: (rect.y2 - rect.y1) * height,
                backgroundColor: color || 'var(--primary)',
            }}
            onClick={() => toolMode === 'eraser' && removeAnnotation(id)}
        />
    );

    if (annotation.rects && annotation.rects.length > 0) {
        return (
            <>
                {annotation.rects.map((r, i) => renderRect(r, `${id}-${i}`))}
            </>
        );
    }

    return renderRect(coordinates, id);
  }

  if (type === 'text') {
    return (
        <div
            ref={itemRef}
            className={cn(
                "absolute text-sm font-medium leading-tight group p-1 transition-all rounded",
                fontFamily || "font-sans",
                toolMode === 'select' && "cursor-move border-2 border-transparent hover:border-primary/20 pointer-events-auto",
                showToolbar && "border-primary/40 ring-4 ring-primary/5 shadow-lg",
                toolMode === 'eraser' && "cursor-pointer hover:bg-red-500/20 hover:border-red-500 pointer-events-auto",
                (toolMode !== 'select' && toolMode !== 'eraser') && "pointer-events-none"
            )}
            style={{
                left: style.left,
                top: style.top,
                width: style.width || 'auto',
                color: color || 'var(--foreground)',
                fontSize: `${fontSize || 14}px`,
                fontWeight: (fontWeight as any) || 'normal',
                fontStyle: (fontStyle as any) || 'normal',
                textDecoration: textDecoration || 'none',
                maxWidth: '600px',
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {showToolbar && !isEditing && <StyleToolbar />}
            
            <div className="relative min-h-[1.5em] min-w-[2em]">
                {isEditing ? (
                    <div className="flex flex-col gap-2 bg-card border border-primary p-2 rounded-lg shadow-2xl animate-in zoom-in-95 pointer-events-auto min-w-[200px]">
                        <textarea
                            autoFocus
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full resize-y min-h-[60px]"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCommitEdit();
                                if (e.key === 'Escape') setIsEditing(false);
                            }}
                        />
                        <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full" onClick={() => setIsEditing(false)}><X className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full text-primary" onClick={handleCommitEdit}><Check className="h-3.5 w-3.5" /></Button>
                        </div>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap">{content}</div>
                )}
                
                {toolMode === 'select' && !isEditing && (
                    <div 
                        className="absolute -right-2 -bottom-2 w-4 h-4 bg-white dark:bg-zinc-800 border border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-nwse-resize shadow-sm z-50 pointer-events-auto hover:bg-primary hover:text-white transition-colors"
                        onMouseDown={handleResizeStart}
                    >
                        <Maximize2 className="w-2.5 h-2.5" />
                    </div>
                )}
            </div>
        </div>
    );
  }

  if (type === 'sticky') {
    return (
        <div
            ref={itemRef}
            className={cn(
                "absolute p-4 shadow-xl rounded-[24px] rounded-tr-none flex flex-col gap-2 transition-all group pointer-events-auto border-2 border-transparent",
                fontFamily || "font-serif",
                toolMode === 'select' && "cursor-move hover:border-primary/20",
                showToolbar && "border-primary/40 ring-8 ring-primary/5 shadow-2xl",
                toolMode === 'eraser' && "cursor-pointer hover:scale-95 border-red-500"
            )}
            style={{
                left: style.left,
                top: style.top,
                width: style.width || 180,
                height: style.height || 180,
                backgroundColor: color || '#fef08a',
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {showToolbar && !isEditing && <StyleToolbar />}

            <div className="flex items-center justify-between opacity-30 mb-1">
                <StickyNote className="w-4 h-4" />
                <div className="flex gap-1">
                    <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {toolMode === 'select' && <Move className="w-3 h-3" />}
                </div>
            </div>

            {isEditing ? (
                <textarea
                    autoFocus
                    className="bg-transparent border-none focus:ring-0 text-sm font-bold italic w-full h-full resize-none text-slate-800 placeholder:text-slate-400"
                    placeholder="Type your thoughts..."
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCommitEdit();
                        if (e.key === 'Escape') setIsEditing(false);
                    }}
                />
            ) : (
                <p 
                    className={cn(
                        "leading-relaxed text-slate-800 break-words font-bold italic",
                        fontSize ? "" : "text-[14px]"
                    )}
                    style={{ fontSize: fontSize ? `${fontSize}px` : undefined }}
                >
                    {content}
                </p>
            )}
            
            {toolMode === 'select' && !isEditing && (
                <div 
                    className="absolute -right-2 -bottom-2 w-6 h-6 bg-white border-2 border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-nwse-resize shadow-xl z-50 pointer-events-auto hover:bg-primary hover:text-white transition-colors"
                    onMouseDown={handleResizeStart}
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                </div>
            )}
        </div>
    );
  }

  if (type === 'area') {
    return (
        <div
            className={cn(
                "absolute border-2 border-primary bg-primary/10",
                toolMode === 'eraser' ? "cursor-pointer hover:border-red-500 hover:bg-red-500/10 pointer-events-auto" : "pointer-events-none"
            )}
            style={style}
            onClick={() => toolMode === 'eraser' && removeAnnotation(id)}
        />
    );
  }

  if (type === 'pen' && annotation.path) {
    return (
        <svg 
            key={id} 
            className={cn(
                "absolute inset-0 pointer-events-none group",
                toolMode === 'eraser' && "pointer-events-auto cursor-pointer"
            )} 
            width={width} 
            height={height}
            onClick={() => toolMode === 'eraser' && removeAnnotation(id)}
        >
           <path
             d={`M ${annotation.path.map(p => `${p.x1 * width} ${p.y1 * height}`).join(' L ')}`}
             fill="none"
             stroke={color || 'black'}
             strokeWidth={toolMode === 'eraser' ? 20 : 3}
             strokeLinecap="round"
             strokeLinejoin="round"
             className={cn(
                 "transition-colors",
                 toolMode === 'eraser' ? "stroke-transparent hover:stroke-red-500/20" : ""
             )}
           />
           {toolMode === 'eraser' && (
                <path
                    d={`M ${annotation.path.map(p => `${p.x1 * width} ${p.y1 * height}`).join(' L ')}`}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={20}
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => removeAnnotation(id)}
                />
           )}
        </svg>
    );
  }

  return null;
}
