import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Annotation } from '../store/useAppState';

function hexToRgb(hex: string) {
    if (!hex) return { r: 0.176, g: 0.478, b: 0.373 };
    let sHex = hex.replace('#', '');
    if (sHex.length === 3) {
        sHex = sHex.split('').map(char => char + char).join('');
    }
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(sHex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : { r: 0.176, g: 0.478, b: 0.373 };
}

export async function exportAnnotatedPDF(originalUrl: string, annotations: Annotation[]) {
    if (!originalUrl) {
        console.error('Missing original URL for PDF export');
        return;
    }
    
    console.log('Exporting PDF with annotations:', annotations.length);
    try {
        const existingPdfBytes = await fetch(originalUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.statusText}`);
            return res.arrayBuffer();
        });
        
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        for (const ann of annotations) {
            const pageIndex = ann.pageNumber - 1;
            if (pageIndex < 0 || pageIndex >= pages.length) continue;
            
            const page = pages[pageIndex];
            const { width, height } = page.getSize();

            if (ann.type === 'highlight') {
                const color = hexToRgb(ann.color || '#fde047');
                const rects = (ann.rects && ann.rects.length > 0) ? ann.rects : [ann.coordinates];
                
                for (const r of rects) {
                    const rx1 = r.x1 * width;
                    const ry1 = height - (r.y1 * height);
                    const rx2 = r.x2 * width;
                    const ry2 = height - (r.y2 * height);
                    
                    page.drawRectangle({
                        x: rx1,
                        y: ry2,
                        width: Math.max(1, rx2 - rx1),
                        height: Math.max(1, ry1 - ry2),
                        color: rgb(color.r, color.g, color.b),
                        opacity: 0.4,
                    });
                }
            } else if (ann.type === 'text') {
                const color = hexToRgb(ann.color || '#000000');
                const tx = ann.coordinates.x1 * width;
                const ty = height - (ann.coordinates.y1 * height);
                const size = ann.fontSize || 12;
                
                if (ann.content) {
                    page.drawText(ann.content, {
                        x: tx,
                        y: ty - size,
                        size: size,
                        font: font,
                        color: rgb(color.r, color.g, color.b),
                    });
                }
            } else if (ann.type === 'sticky') {
                const bgColor = hexToRgb(ann.color || '#fef08a');
                const sx1 = ann.coordinates.x1 * width;
                const sy1 = height - (ann.coordinates.y1 * height);
                const sw = (ann.coordinates.x2 - ann.coordinates.x1) * width;
                const sh = (ann.coordinates.y2 - ann.coordinates.y1) * height;

                page.drawRectangle({
                    x: sx1,
                    y: sy1 - sh,
                    width: Math.max(20, sw),
                    height: Math.max(20, sh),
                    color: rgb(bgColor.r, bgColor.g, bgColor.b),
                    opacity: 0.9,
                });

                if (ann.content) {
                    page.drawText(ann.content, {
                        x: sx1 + 10,
                        y: sy1 - 25,
                        size: 10,
                        font: font,
                        color: rgb(0.1, 0.1, 0.1),
                        lineHeight: 12,
                        maxWidth: Math.max(10, sw - 20),
                    });
                }
            } else if (ann.type === 'pen' && ann.path && ann.path.length > 1) {
                const color = hexToRgb(ann.color || '#000000');
                for (let i = 0; i < ann.path.length - 1; i++) {
                    const p1 = ann.path[i];
                    const p2 = ann.path[i+1];
                    page.drawLine({
                        start: { x: p1.x1 * width, y: height - (p1.y1 * height) },
                        end: { x: p2.x1 * width, y: height - (p2.y1 * height) },
                        thickness: 2,
                        color: rgb(color.r, color.g, color.b),
                    });
                }
            }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `margin_studio_export_${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
        
        console.log('PDF export successful');
    } catch (err) {
        console.error('Failed to export PDF:', err);
    }
}
