"use client";

import { useRef, useState, useEffect } from "react";
import { useAppState, PDFCoordinates } from "@/store/useAppState";
import { cn } from "@/lib/utils";
import { FloatingContextMenu } from "./FloatingContextMenu";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { X, Check } from "lucide-react";

interface InteractionLayerProps {
  pageNumber: number;
  width: number;
  height: number;
}

export function InteractionLayer({ pageNumber, width, height }: InteractionLayerProps) {
  const { 
    toolMode, 
    setCurrentSelection, 
    currentSelection, 
    addAnnotation, 
    strokeColor, 
    sendMessage,
    setSidebarOpen
  } = useAppState();
  const { theme } = useTheme();
  
  const layerRef = useRef<HTMLDivElement>(null);
  
  // Area Selection State
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Text Tool State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");

  const handleContextAction = (action: string) => {
    if (!currentSelection) return;
    
    if (action === 'more') return;

    let prompt = "";
    if (action === 'explain') prompt = "Provide a concise explanation of this selection.";
    if (action === 'summarize') prompt = "Summarize this selection in a few bullet points.";
    if (action === 'ask_ai') {
        setSidebarOpen(true);
        // Do NOT null selection here so user can type their own question
        return;
    }

    if (prompt) {
        sendMessage(prompt, currentSelection);
        setCurrentSelection(null); // Clear to close menu and prevent redundant calls
    }
  };

  const captureAreaImage = (rect: { x: number; y: number; w: number; h: number }) => {
    // Find the canvas in the parent (react-pdf Page)
    const canvas = layerRef.current?.parentElement?.querySelector('canvas');
    if (!canvas) return null;

    const cropCanvas = document.createElement('canvas');
    const ctx = cropCanvas.getContext('2d', { alpha: false });
    if (!ctx) return null;

    // Calculate ratio between canvas actual size and our rendered style size
    const ratio = canvas.width / width; 
    
    cropCanvas.width = rect.w * ratio;
    cropCanvas.height = rect.h * ratio;

    ctx.drawImage(
      canvas,
      rect.x * ratio,
      rect.y * ratio,
      rect.w * ratio,
      rect.h * ratio,
      0, 0,
      rect.w * ratio,
      rect.h * ratio
    );

    return cropCanvas.toDataURL('image/png', 0.9);
  };

  // ----------------------------------------------------------------------
  // Text Selection Handling
  // ----------------------------------------------------------------------
  useEffect(() => {
    const handleMouseUpText = () => {
        if (toolMode !== 'select' && toolMode !== 'highlight') return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

         if (layerRef.current && layerRef.current.parentElement) {
              const range = selection.getRangeAt(0);
              const pageNode = layerRef.current.parentElement;
              
              if (pageNode && pageNode.contains(range.commonAncestorContainer)) {
                  const text = selection.toString();
                  const pageRect = layerRef.current.getBoundingClientRect();
                  
                  // Get ALL rects for precise highlighting (text-only)
                  const clientRects = Array.from(range.getClientRects());
                  const normalizedRects = clientRects.map(r => ({
                      x1: (r.left - pageRect.left) / width,
                      y1: (r.top - pageRect.top) / height,
                      x2: (r.right - pageRect.left) / width,
                      y2: (r.bottom - pageRect.top) / height,
                  }));

                  const selectionRect = range.getBoundingClientRect();
                  const normalized = {
                      x1: (selectionRect.left - pageRect.left) / width,
                      y1: (selectionRect.top - pageRect.top) / height,
                      x2: (selectionRect.right - pageRect.left) / width,
                      y2: (selectionRect.bottom - pageRect.top) / height,
                  };

                  if (toolMode === 'highlight') {
                      addAnnotation({
                          id: uuidv4(),
                          type: 'highlight',
                          pageNumber,
                          coordinates: normalized,
                          rects: normalizedRects,
                          color: strokeColor,
                          createdAt: Date.now()
                      });
                      selection.removeAllRanges();
                  } else {
                      setCurrentSelection({
                          type: 'text',
                          content: text,
                          pageNumber,
                          coordinates: normalized
                      });
                  }
              }
         }
    }

    document.addEventListener('mouseup', handleMouseUpText);
    return () => document.removeEventListener('mouseup', handleMouseUpText);
  }, [toolMode, pageNumber, width, height, addAnnotation, setCurrentSelection, strokeColor]);


  // Pen State
  const [isPenDown, setIsPenDown] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  // ----------------------------------------------------------------------
  // Area / Drawing / Text Handling
  // ----------------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent) => {
    if (toolMode === 'eraser') return;
    
    if (toolMode === 'area') {
        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setStartPoint({ x, y });
        setIsDrawingArea(true);
        setCurrentRect({ x, y, w: 0, h: 0 });
        if (currentSelection?.pageNumber !== pageNumber) setCurrentSelection(null);
    } else if (toolMode === 'text' || toolMode === 'sticky') {
        if (!textInputPos) {
            const rect = layerRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setTextInputPos({ x, y });
        } else {
            if (!textValue.trim()) {
                setTextInputPos(null);
            }
        }
    } else if (toolMode === 'pen') {
        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setIsPenDown(true);
        setCurrentPath([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (toolMode === 'area' && isDrawingArea && startPoint) {
        const x = Math.min(startPoint.x, currentX);
        const y = Math.min(startPoint.y, currentY);
        const w = Math.abs(currentX - startPoint.x);
        const h = Math.abs(currentY - startPoint.y);
        setCurrentRect({ x, y, w, h });
    } else if (toolMode === 'pen' && isPenDown) {
        setCurrentPath(prev => [...prev, { x: currentX, y: currentY }]);
    }
  };

  const handleMouseUp = () => {
    if (toolMode === 'area' && isDrawingArea && currentRect && currentRect.w > 5) {
        setIsDrawingArea(false);
        const imgData = captureAreaImage(currentRect);
        
        const normalized = {
            x1: currentRect.x / width,
            y1: currentRect.y / height,
            x2: (currentRect.x + currentRect.w) / width,
            y2: (currentRect.y + currentRect.h) / height,
        };
        
        setCurrentSelection({
            type: 'area',
            content: '[Visual Selection Captured]',
            imageUrl: imgData || undefined,
            pageNumber,
            coordinates: normalized
        });
        setStartPoint(null);
        setCurrentRect(null);
    } else {
        setIsDrawingArea(false);
        setIsPenDown(false);
        if (toolMode === 'pen' && currentPath.length > 1) {
            const normalizedPath = currentPath.map(p => ({ x1: p.x / width, y1: p.y / height, x2: 0, y2: 0 }));
            const xs = currentPath.map(p => p.x);
            const ys = currentPath.map(p => p.y);
            addAnnotation({
                id: uuidv4(),
                type: 'pen',
                pageNumber,
                coordinates: { x1: Math.min(...xs)/width, y1: Math.min(...ys)/height, x2: Math.max(...xs)/width, y2: Math.max(...ys)/height },
                path: normalizedPath,
                color: strokeColor,
                createdAt: Date.now()
            });
        }
        setCurrentPath([]);
    }
  };

  const commitText = () => {
      if (textInputPos && textValue.trim()) {
           const normalized = {
             x1: textInputPos.x / width,
             y1: textInputPos.y / height,
             x2: (textInputPos.x + (toolMode === 'sticky' ? 180 : 150)) / width,
             y2: (textInputPos.y + (toolMode === 'sticky' ? 180 : 30)) / height,
           };
           
           addAnnotation({
               id: uuidv4(),
               type: toolMode === 'sticky' ? 'sticky' : 'text',
               pageNumber,
               coordinates: normalized,
               content: textValue,
               color: toolMode === 'sticky' ? '#fef08a' : (strokeColor === '#fde047' ? undefined : strokeColor),
               createdAt: Date.now()
           });
      }
      setTextInputPos(null);
      setTextValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          commitText();
      }
      if (e.key === 'Escape') {
          setTextInputPos(null);
          setTextValue("");
      }
  };

  return (
    <div
      ref={layerRef}
      className={cn(
        "absolute inset-0 z-10",
        toolMode === 'area' ? "cursor-crosshair" : 
        (toolMode === 'pen' ? "cursor-pen" : 
        (toolMode === 'text' || toolMode === 'sticky' ? "cursor-text" : 
        (toolMode === 'eraser' ? "cursor-pointer" : "pointer-events-none")))
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
          if (isDrawingArea) handleMouseUp();
          if (isPenDown) handleMouseUp();
      }}
    >
      {isPenDown && currentPath.length > 1 && (
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
           <path d={`M ${currentPath.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {isDrawingArea && currentRect && (
        <div
          className="absolute border-2 border-primary bg-primary/10 shadow-[0_0_15px_rgba(45,122,95,0.2)]"
          style={{ left: currentRect.x, top: currentRect.y, width: currentRect.w, height: currentRect.h }}
        />
      )}
      
      {textInputPos && (
          <div
            className="absolute z-[100] p-2 bg-background/95 backdrop-blur-md rounded-xl shadow-2xl border border-primary/20 animate-in zoom-in-95 duration-200"
            style={{ left: textInputPos.x, top: textInputPos.y }}
            onMouseDown={(e) => e.stopPropagation()}
          >
              <Input 
                autoFocus
                className={cn(
                    "min-h-10 bg-transparent border-none focus-visible:ring-0 text-sm font-medium",
                    toolMode === 'sticky' ? "w-56 italic p-0" : "w-72"
                )}
                placeholder={toolMode === 'sticky' ? "What's on your mind?" : "Type your note..."}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ color: toolMode === 'sticky' ? '#1d1d1b' : strokeColor }} 
              />
              <div className="flex justify-end gap-2 px-1 pt-1 opacity-60">
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg" onClick={() => { setTextInputPos(null); setTextValue(""); }}><X className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg text-primary" onClick={commitText}><Check className="h-4 w-4" /></Button>
              </div>
          </div>
      )}

      {currentSelection?.pageNumber === pageNumber && !isDrawingArea && (
         <>
            {currentSelection.type === 'area' && (
                <div
                    className="absolute border-4 border-primary ring-[200vw] ring-black/40"
                    style={{
                        left: currentSelection.coordinates.x1 * width,
                        top: currentSelection.coordinates.y1 * height,
                        width: (currentSelection.coordinates.x2 - currentSelection.coordinates.x1) * width,
                        height: (currentSelection.coordinates.y2 - currentSelection.coordinates.y1) * height,
                    }}
                />
            )}
            
            <FloatingContextMenu
                position={{
                    x: (currentSelection.coordinates.x2) * width, 
                    y: (currentSelection.coordinates.y1) * height
                }}
                onAction={handleContextAction}
            />
         </>
      )}
    </div>
  );
}
