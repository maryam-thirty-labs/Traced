import type { EtymologyEntry } from "../types/etymology.types";

const WIDTH = 1080;
const HEIGHT = 1920;
const PURPLE = "#5A2B94";
const CREAM = "#FBF9F5";
const LIGHT_PURPLE = "#F3EBFF";

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

/**
 * Paints a 1080x1920 share card to a canvas and returns a Blob.
 * Respects the daily-lesson-reveal variant (purple background).
 */
export async function generateShareCard(entry: EtymologyEntry): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  // Background
  ctx.fillStyle = PURPLE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // "Did you know?"
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 48px system-ui, sans-serif";
  ctx.fillText("Did you know?", 80, 220);

  // Root word (Fraunces italic analog — system-ui italic fallback)
  ctx.fillStyle = CREAM;
  ctx.font = "italic 144px Georgia, 'Times New Roman', serif";
  ctx.fillText(entry.root, 80, 420);

  // Origin label
  if (entry.origin) {
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "600 22px system-ui, sans-serif";
    ctx.fillText(entry.origin.toUpperCase(), 80, 480);
  }

  // Meaning
  if (entry.meaning) {
    ctx.fillStyle = LIGHT_PURPLE;
    ctx.font = "400 56px system-ui, sans-serif";
    drawWrappedText(ctx, entry.meaning, 80, 640, WIDTH - 160, 72);
  }

  // Usage examples
  if (entry.exampleUsage) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "italic 36px Georgia, serif";
    drawWrappedText(ctx, entry.exampleUsage, 80, 1000, WIDTH - 160, 52);
  }

  // Traced wordmark
  ctx.fillStyle = CREAM;
  ctx.font = "700 48px system-ui, sans-serif";
  const mark = "Traced";
  const markWidth = ctx.measureText(mark).width;
  ctx.fillText(mark, WIDTH - 80 - markWidth, HEIGHT - 80);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
      0.92,
    );
  });
}

export async function shareOrDownloadCard(entry: EtymologyEntry): Promise<void> {
  const blob = await generateShareCard(entry);
  const file = new File([blob], `${entry.root}-traced.png`, { type: "image/png" });

  const nav = navigator as Navigator & {
    share?: (d: ShareData) => Promise<void>;
    canShare?: (d: ShareData) => boolean;
  };

  const shareData: ShareData = {
    title: "Traced",
    text: `"${entry.root}" — ${entry.origin ?? ""} for "${entry.meaning ?? ""}".`,
    files: [file],
  };

  if (nav.share && (!nav.canShare || nav.canShare(shareData))) {
    try {
      await nav.share(shareData);
      return;
    } catch {
      // cancelled — fall through to download
    }
  }

  // Download fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${entry.root}-traced.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
