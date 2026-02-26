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
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] [background-size:32px_32px]" />


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
