"use client";

import { useState } from "react";
import { Document, pdfjs } from "react-pdf";
import useMeasure from "react-use-measure";
import { PDFPage } from "./PDFPage";
import { useAppState } from "@/store/useAppState";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFRendererProps {
  url: string;
}

export function PDFRenderer({ url }: PDFRendererProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerRef, { width }] = useMeasure();
  const { scale, setScale } = useAppState();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Calculate width based on logic:
  // If scale is default (1), maybe fill width?
  // Let's assume we want to use the explicit 'scale' from store to drive size.
  // react-pdf 'scale' prop multiplies the page's original size.
  // If we pass 'width', it ignores 'scale'.
  // So we should decide: do we use width or scale?
  // User wants control. Button Zoom controls 'scale'.
  // So we should primarily use 'scale'.
  // But we need initial "Fit Width".
  // Let's default to scale=1.0. If user zooms, scale changes.

  return (
    <div className="flex flex-col items-center gap-4 py-8 min-h-full w-full">
      <div ref={containerRef} className="w-full max-w-5xl px-4"> 
      {/* Container to measure available width if we wanted Fit Width. 
          For now, let's just use scale and let user zoom. 
          Or use width if scale is 'auto'? (not supported by our store yet)
      */}
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col gap-4 items-center"
        loading={
            <div className="flex items-center justify-center p-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }
        error={
            <div className="flex items-center justify-center p-10 text-red-500">
                Failed to load PDF.
            </div>
        }
      >
        {Array.from(new Array(numPages), (el, index) => (
          <PDFPage
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            scale={scale}
            // Passing width=undefined forces react-pdf to use 'scale' prop
          />
        ))}
      </Document>
      </div>
    </div>
  );
}
