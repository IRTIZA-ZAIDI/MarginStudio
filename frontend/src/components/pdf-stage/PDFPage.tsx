"use client";

import { useState } from "react";
import { Page } from "react-pdf";
import { InteractionLayer } from "./InteractionLayer";
import { AnnotationLayer } from "./AnnotationLayer";

interface PDFPageProps {
  pageNumber: number;
  scale: number;
  width?: number;
}

export function PDFPage({ pageNumber, scale, width }: PDFPageProps) {
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);

  return (
    <div className="relative shadow-lg">
      <Page
        pageNumber={pageNumber}
        scale={scale}
        width={width}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        onLoadSuccess={(page) => {
          setPageDimensions({ width: page.width, height: page.height });
        }}
      >
        {pageDimensions && (
          <>
            <AnnotationLayer
                pageNumber={pageNumber}
                width={pageDimensions.width}
                height={pageDimensions.height}
            />
            <InteractionLayer
                pageNumber={pageNumber}
                width={pageDimensions.width}
                height={pageDimensions.height}
            />
          </>
        )}
      </Page>
    </div>
  );
}
