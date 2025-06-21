// utils/pdfExport.ts
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export const downloadPDF = async (htmlContent: string, filename: string = 'document.pdf') => {
    if (!htmlContent) return;

    // Create container and inject HTML
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    container.style.padding = '20px';
    document.body.appendChild(container);

    try {
        // Convert HTML to canvas with html2canvas-pro
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#FFFFFF',
            // Pro version specific options
            ignoreElements: (element) => false,
            onclone: (clonedDoc) => {
                // Final cleanup of cloned document if needed
                clonedDoc.querySelectorAll('*').forEach((el: Element) => {
                    const htmlEl = el as HTMLElement;
                    const style = window.getComputedStyle(htmlEl);
                    if (style.color.includes('oklch')) htmlEl.style.color = '#000000';
                    if (style.backgroundColor.includes('oklch')) htmlEl.style.backgroundColor = '#ffffff';
                });
            }
        });

        // Convert canvas to PDF
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add new pages if content is taller than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save the PDF
        pdf.save(filename);
    } catch (error: any) {
        console.error('PDF export error:', error);
        throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
        // Clean up
        document.body.removeChild(container);
    }
};