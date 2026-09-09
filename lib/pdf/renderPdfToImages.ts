import { createCanvas } from '@napi-rs/canvas';
// The "legacy" build is the one meant for non-browser environments like Node.
// It falls back to running parsing on the main thread when no Worker is
// available, so no GlobalWorkerOptions.workerSrc setup is needed here.
// @ts-ignore - pdfjs-dist ships its own types but the legacy subpath isn't declared
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export interface RenderedPage {
  page: number;
  base64: string; // raw base64, no data: prefix
  mimeType: 'image/png';
}

// pdfjs needs a "canvas factory" so it can create the canvas (and any
// additional off-screen canvases it needs internally, e.g. for masks).
class NapiCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return { canvas, context };
  }
  reset(canvasAndContext: any, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: any) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

/**
 * Rasterizes every page of a PDF to a PNG so it can be handed to a
 * vision-capable model. Scale 1.8 is a decent balance between legibility
 * of small exam text/diagrams and keeping the request payload reasonable.
 */
export async function renderPdfToImages(
  buffer: Buffer,
  { scale = 1.8, maxPages = 20 }: { scale?: number; maxPages?: number } = {}
): Promise<RenderedPage[]> {
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    canvasFactory: new NapiCanvasFactory()
  } as any);
  const pdf = await loadingTask.promise;

  const pageCount = Math.min(pdf.numPages, maxPages);
  const pages: RenderedPage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({ canvasContext: context, viewport, canvasFactory: new NapiCanvasFactory() } as any)
      .promise;

    const pngBuffer = await canvas.encode('png');
    pages.push({ page: i, base64: pngBuffer.toString('base64'), mimeType: 'image/png' });
  }

  return pages;
}
