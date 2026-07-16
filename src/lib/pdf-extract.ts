/**
 * Client-side text extraction for uploaded course materials.
 * PDFs are parsed with pdfjs (loaded lazily so it never enters the main
 * bundle); plain-text formats are read directly. Returns null when the
 * format has no extractable text (images, scanned PDFs, docx).
 */

const MAX_EXTRACT_CHARS = 100_000;

const TEXT_EXTENSIONS = [".txt", ".md", ".csv", ".html", ".htm", ".json"];

export async function extractMaterialText(file: File): Promise<string | null> {
  const name = file.name.toLowerCase();

  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    return extractPdfText(file);
  }

  if (file.type.startsWith("text/") || TEXT_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    const text = await file.text();
    return text.trim() ? text.slice(0, MAX_EXTRACT_CHARS) : null;
  }

  return null;
}

async function extractPdfText(file: File): Promise<string | null> {
  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;

  const chunks: string[] = [];
  let total = 0;
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) {
      chunks.push(pageText);
      total += pageText.length;
    }
    if (total >= MAX_EXTRACT_CHARS) break;
  }
  await (doc as any).cleanup?.();

  const text = chunks.join("\n\n").slice(0, MAX_EXTRACT_CHARS).trim();
  return text.length > 0 ? text : null;
}
