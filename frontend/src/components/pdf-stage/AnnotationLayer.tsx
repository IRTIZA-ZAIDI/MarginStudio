"use client";

import { useAppState } from "@/store/useAppState";
import { cn } from "@/lib/utils";

interface AnnotationLayerProps {
  pageNumber: number;
  width: number;
  height: number;
}

import { AnnotationItem } from "./AnnotationItem";

interface AnnotationLayerProps {
  pageNumber: number;
  width: number;
  height: number;
}

export function AnnotationLayer({ pageNumber, width, height }: AnnotationLayerProps) {
  const { annotations, toolMode, activeDocumentId } = useAppState();

  const pageAnnotations = annotations.filter((a) => a.pageNumber === pageNumber && a.documentId === activeDocumentId);
  const isInteractive = toolMode === 'select' || toolMode === 'eraser';

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {pageAnnotations.map((annotation) => (
        <AnnotationItem 
            key={annotation.id} 
            annotation={annotation} 
            width={width} 
            height={height} 
        />
      ))}
    </div>
  );
}
