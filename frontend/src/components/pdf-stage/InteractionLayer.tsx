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
    setSidebarOpen,
    setToolMode,
    activeDocumentId,
    addWhiteboardElement,
    setActiveTab
  } = useAppState();
  const { theme } = useTheme();
  
  const layerRef = useRef<HTMLDivElement>(null);
  
  // Clear selection when clicking outside PDF
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (layerRef.current && !layerRef.current.contains(e.target as Node)) {
        // Check if click is outside all PDF layers
        const pdfContainer = layerRef.current.closest('.pdf-container');
        if (pdfContainer && !pdfContainer.contains(e.target as Node)) {
          setCurrentSelection(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setCurrentSelection]);
  
  // Area Selection State
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Text Tool State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");

  const handleContextAction = (action: string) => {
    if (!currentSelection) return;
    
    // Clear browser selection immediately to prevent re-trigger on subsequent mouse events
    window.getSelection()?.removeAllRanges();

    if (action === 'more') return;

    let prompt = "";
    if (action === 'explain') prompt = "Provide a concise explanation of this selection.";
    if (action === 'summarize') prompt = "Summarize this selection in a few bullet points.";
    if (action === 'ask_ai') {
        setSidebarOpen(true);
        // We keep currentSelection so it stays attached to the ChatInput
        return;
    }

    if (action === 'send_to_canvas') {
        addWhiteboardElement({
            id: uuidv4(),
            type: currentSelection.type === 'area' ? 'image' : 'text',
            x: 100 + Math.random() * 200,
            y: 100 + Math.random() * 200,
            content: currentSelection.content,
            imageUrl: currentSelection.imageUrl,
        });
        setActiveTab('whiteboard');
        setCurrentSelection(null);
        return;
    }

    if (prompt) {
        sendMessage(prompt, currentSelection);
        setCurrentSelection(null); // Clear to close menu
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
                          documentId: activeDocumentId!,
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
                      setSidebarOpen(true);
                  }
              }
         }
    }

    document.addEventListener('mouseup', handleMouseUpText);
    return () => document.removeEventListener('mouseup', handleMouseUpText);
  }, [toolMode, pageNumber, width, height, addAnnotation, setCurrentSelection, strokeColor, activeDocumentId]);


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
        // Immediately create annotation with empty content
        const rect = layerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const normalized = {
          x1: x / width,
          y1: y / height,
          x2: (x + (toolMode === 'sticky' ? 180 : 150)) / width,
          y2: (y + (toolMode === 'sticky' ? 180 : 30)) / height,
        };
        
        addAnnotation({
            id: uuidv4(),
            type: toolMode === 'sticky' ? 'sticky' : 'text',
            pageNumber,
            documentId: activeDocumentId!,
            coordinates: normalized,
            content: "", // Empty content triggers auto-edit in AnnotationItem
            color: toolMode === 'sticky' ? '#fef08a' : (strokeColor === '#fde047' ? undefined : strokeColor),
            createdAt: Date.now()
        });
        // Single-use for text/sticky: revert to select to prevent accidental creation
        setToolMode('select');
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
        setSidebarOpen(true);
        setToolMode('select'); // Untoggle after one use
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
                documentId: activeDocumentId!,
                coordinates: { x1: Math.min(...xs)/width, y1: Math.min(...ys)/height, x2: Math.max(...xs)/width, y2: Math.max(...ys)/height },
                path: normalizedPath,
                color: strokeColor,
                createdAt: Date.now()
            });
        }
        setCurrentPath([]);
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
          className="absolute border-2 border-primary bg-primary/5 rounded shadow-[0_0_20px_rgba(45,122,95,0.3)] animate-pulse"
          style={{ 
            left: currentRect.x, 
            top: currentRect.y, 
            width: currentRect.w, 
            height: currentRect.h,
            boxShadow: '0 0 0 100vw rgba(0,0,0,0.1)'
          }}
        >
            <div className="absolute top-0 right-0 -translate-y-full px-2 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-t">Capturing Region</div>
        </div>
      )}
      
      
      {currentSelection?.pageNumber === pageNumber && !isDrawingArea && (
         <>
            {currentSelection.type === 'area' && (
                <div
                    className="absolute border-2 border-primary bg-primary/5 rounded-lg ring-[100vw] ring-black/40 shadow-[0_0_40px_rgba(45,122,95,0.4)] animate-in zoom-in-95 duration-300"
                    style={{
                        left: currentSelection.coordinates.x1 * width,
                        top: currentSelection.coordinates.y1 * height,
                        width: (currentSelection.coordinates.x2 - currentSelection.coordinates.x1) * width,
                        height: (currentSelection.coordinates.y2 - currentSelection.coordinates.y1) * height,
                    }}
                >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-12 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <Check className="h-3 w-3 text-white" />
                    </div>
                </div>
            )}
            
            <FloatingContextMenu
                position={{
                    x: (currentSelection.coordinates.x1 + (currentSelection.coordinates.x2 - currentSelection.coordinates.x1)/2) * width, 
                    y: (currentSelection.coordinates.y2) * height
                }}
                onAction={handleContextAction}
            />
         </>
      )}
    </div>
  );
}
