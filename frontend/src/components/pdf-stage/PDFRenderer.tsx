"use client";

import { Document, pdfjs } from "react-pdf";
import useMeasure from "react-use-measure";
import { PDFPage } from "./PDFPage";
import { useAppState } from "@/store/useAppState";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFRendererProps {
  url: string;
}

export function PDFRenderer({ url }: PDFRendererProps) {
  const [containerRef, { width }] = useMeasure();
  const { scale, currentPage, setNumPages, numPages } = useAppState();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12 min-h-screen w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px]">
      <div ref={containerRef} className="w-full max-w-5xl px-4 flex flex-col items-center gap-12"> 
        <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col gap-12 items-center w-full"
            loading={
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-b-primary animate-spin" />
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Illuminating document...</span>
                </div>
            }
            error={
                <div className="flex items-center justify-center p-10 text-destructive font-bold uppercase text-xs tracking-widest bg-destructive/10 border border-destructive/20 rounded-2xl">
                    Failed to synthesize document.
                </div>
            }
        >
            {numPages > 0 ? (
                Array.from(new Array(numPages), (el, index) => (
                    <div 
                        key={`page_${index + 1}`} 
                        className="relative group/pdf shadow-2xl rounded-sm overflow-visible transition-all duration-500 hover:shadow-primary/20 border-white/10"
                        id={`pdf-page-${index + 1}`}
                    >
                        <PDFPage
                            pageNumber={index + 1}
                            scale={scale}
                            width={width > 0 ? width : undefined}
                        />
                        
                        {/* Page Label */}
                        <div className="absolute top-4 left-4 z-30 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg opacity-0 group-hover/pdf:opacity-100 transition-opacity">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Page {index + 1}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="relative group/pdf shadow-2xl rounded-sm overflow-visible">
                    <PDFPage
                        pageNumber={1}
                        scale={scale}
                        width={width > 0 ? width : undefined}
                    />
                </div>
            )}
        </Document>
      </div>
    </div>
  );
}
