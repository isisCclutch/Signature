
/**
 * We use pdf-lib to manipulate PDFs entirely in the browser.
 * Note: In a real-world scenario, you'd install 'pdf-lib' via npm.
 * Here we load it from a CDN to ensure it works in this environment.
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
  template: any // ContractTemplate
): Promise<Uint8Array> {
  const { PDFDocument, rgb, degrees } = await loadPdfLib() as any;

  // Load existing PDF
  const existingPdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  // 1. Add Employee Signature
  if (signatureBase64) {
    const sigImage = await pdfDoc.embedPng(signatureBase64);
    const { x, y, width, height, page } = template.employeeSignaturePos;
    const targetPage = pages[page - 1] || pages[0];
    
    targetPage.drawImage(sigImage, {
      x: x,
      y: y,
      width: width,
      height: height,
    });
  }

  // 2. Add Client Highlight
  const { x, y, width, height, page } = template.clientHighlightPos;
  const targetPage = pages[page - 1] || pages[0];
  
  // Create a semi-transparent yellow highlight
  targetPage.drawRectangle({
    x: x,
    y: y,
    width: width,
    height: height,
    color: rgb(1, 1, 0), // Yellow
    opacity: 0.3,
  });

  return await pdfDoc.save();
}
