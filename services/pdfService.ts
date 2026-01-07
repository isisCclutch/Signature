
/**
 * We use pdf-lib to manipulate PDFs entirely in the browser.
 */

const PDF_LIB_URL = 'https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js';

async function loadPdfLib() {
  if ((window as any).PDFLib) return (window as any).PDFLib;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PDF_LIB_URL;
    script.onload = () => resolve((window as any).PDFLib);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export async function processContract(
  pdfFile: File,
  signatureBase64: string,
  printName: string,
  template: any // ContractTemplate
): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts } = await loadPdfLib() as any;

  // Load existing PDF
  const existingPdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 1. Add Employee Signatures
  if (signatureBase64 && template.employeeSignatures) {
    const sigImage = await pdfDoc.embedPng(signatureBase64);
    for (const pos of template.employeeSignatures) {
      const targetPage = pages[pos.page - 1] || pages[0];
      targetPage.drawImage(sigImage, {
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      });
    }
  }

  // 2. Add Print Names (Text)
  if (printName && template.printNameZones) {
    for (const zone of template.printNameZones) {
      const targetPage = pages[zone.page - 1] || pages[0];
      targetPage.drawText(printName, {
        x: zone.x,
        y: zone.y,
        size: zone.fontSize || 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
    }
  }

  // 3. Add Client Highlights
  if (template.clientHighlights) {
    for (const pos of template.clientHighlights) {
      const targetPage = pages[pos.page - 1] || pages[0];
      targetPage.drawRectangle({
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
        color: rgb(1, 1, 0), // Yellow
        opacity: 0.3,
      });
    }
  }

  return await pdfDoc.save();
}
