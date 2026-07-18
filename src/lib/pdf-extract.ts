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

export type ExtractedPageImage = {
  pageNumber: number;
  blob: Blob;
  /** Nearby page text, used as a caption/context hint for the extracted image. */
  captionText: string;
};

const MAX_IMAGE_PAGES = 5;
const RENDER_SCALE = 1.5;

/**
 * Rasterizes PDF pages that contain an embedded image/photo (detected via the
 * page's operator list, not just any page) so real diagrams/photos already in
 * the material can be attached to lessons instead of only sourcing images
 * from the web. Capped at MAX_IMAGE_PAGES to bound upload cost/time.
 */
export async function extractPdfPageImages(file: File): Promise<ExtractedPageImage[]> {
  const name = file.name.toLowerCase();
  if (!(file.type === "application/pdf" || name.endsWith(".pdf"))) return [];

  const pdfjs = await import("pdfjs-dist");
  const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;

  const IMAGE_OPS = new Set<number>(
    [
      pdfjs.OPS.paintImageXObject,
      pdfjs.OPS.paintImageXObjectRepeat,
      pdfjs.OPS.paintInlineImageXObject,
    ].filter((op): op is number => typeof op === "number"),
  );

  const results: ExtractedPageImage[] = [];

  for (let pageNumber = 1; pageNumber <= doc.numPages && results.length < MAX_IMAGE_PAGES; pageNumber++) {
    const page = await doc.getPage(pageNumber);

    const opList = await page.getOperatorList();
    const hasImage = opList.fnArray.some((fn: number) => IMAGE_OPS.has(fn));
    if (!hasImage) continue;

    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) continue;

    const content = await page.getTextContent();
    const captionText = content.items
      .map((item: any) => (typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 280);

    results.push({ pageNumber, blob, captionText });
  }

  await (doc as any).cleanup?.();
  return results;
}
