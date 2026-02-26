"use client";

import { useAppState, WhiteboardElement } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { 
    MousePointer2, Type, StickyNote, 
    Square, Circle, Image as ImageIcon, 
    Trash2, Move, RotateCcw, Plus
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function Whiteboard() {
  const { whiteboardElements, addWhiteboardElement, updateWhiteboardElement, removeWhiteboardElement } = useAppState();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddNote = () => {
    const id = Math.random().toString(36).substr(2, 9);
    addWhiteboardElement({
      id,
      type: 'note',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      content: 'Double click to edit',
      color: '#fef08a' // yellow-200
    });
    setSelectedId(id);
  };

  const handleAddText = () => {
    const id = Math.random().toString(36).substr(2, 9);
    addWhiteboardElement({
      id,
      type: 'text',
      x: 150,
      y: 150,
      content: 'New Text Block',
    });
    setSelectedId(id);
  };

  const handleMouseDown = (e: React.MouseEvent, el: WhiteboardElement) => {
    setSelectedId(el.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - el.x,
      y: e.clientY - el.y
    });
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedId) {
      updateWhiteboardElement(selectedId, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
        ref={containerRef}
        className="h-full w-full bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={() => setSelectedId(null)}
    >
      {/* Grid Background Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Toolbar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50">
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedId(null)}>
            <MousePointer2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border/50 mx-1" />
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleAddText}>
            <Type className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleAddNote}>
            <StickyNote className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
            <Square className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
            <Circle className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border/50 mx-1" />
        <Button variant="destructive" size="icon" className="rounded-xl h-8 w-8" disabled={!selectedId} onClick={() => selectedId && removeWhiteboardElement(selectedId)}>
            <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Canvas Elements */}
      <div className="relative w-full h-full">
        {whiteboardElements.map((el) => (
          <div
            key={el.id}
            style={{
              left: el.x,
              top: el.y,
              backgroundColor: el.color,
              zIndex: selectedId === el.id ? 100 : 1,
            }}
            onMouseDown={(e) => handleMouseDown(e, el)}
            className={cn(
                "absolute cursor-move select-none p-4 rounded-xl shadow-sm transition-shadow",
                el.type === 'note' && "min-w-[180px] min-h-[180px] shadow-lg rotate-1",
                el.type === 'text' && "bg-transparent font-bold text-lg",
                el.type === 'image' && "p-1 bg-white border border-border shadow-xl",
                selectedId === el.id && "ring-2 ring-primary ring-offset-4 dark:ring-offset-zinc-950 shadow-2xl"
            )}
          >
            {el.type === 'image' && el.imageUrl && (
              <img src={el.imageUrl} className="max-w-[400px] rounded-lg pointer-events-none" />
            )}
            {el.type === 'text' && (
              <div 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => updateWhiteboardElement(el.id, { content: e.currentTarget.textContent || "" })}
                className="outline-none min-w-[50px]"
              >
                {el.content}
              </div>
            )}
            {el.type === 'note' && (
              <div 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => updateWhiteboardElement(el.id, { content: e.currentTarget.textContent || "" })}
                className="outline-none h-full text-zinc-900 font-medium"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {el.content}
              </div>
            )}
            
            {/* Selection Controls */}
            {selectedId === el.id && (
                <div className="absolute -top-3 -right-3 h-6 w-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-background">
                    <Move className="h-3 w-3" />
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {whiteboardElements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 capitalize tracking-widest font-black text-sm">
            Interactive Studio Canvas
          </div>
      )}
    </div>
  );
}
