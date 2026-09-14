export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
export const ACCEPTED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export type ImageErrorCode =
  | "svg-not-supported"
  | "invalid-type"
  | "too-large"
  | "decode-failed"
  | "network-failed"
  | "unsupported";

export class PuzzleImageError extends Error {
  readonly code: ImageErrorCode;
  constructor(code: ImageErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "PuzzleImageError";
  }
}

/**
 * Rejects unsupported uploads before any decoding is attempted. The
 * browser-reported MIME type is useful but not fully trustworthy, so this
 * also checks the file extension; SVG is rejected outright since it can
 * embed scripts and isn't safe to render unsanitized.
 */
export function validateUploadedFile(file: File): void {
  const name = file.name.toLowerCase();
  const looksLikeSvg = file.type === "image/svg+xml" || name.endsWith(".svg");
  if (looksLikeSvg) {
    throw new PuzzleImageError(
      "svg-not-supported",
      "SVG files aren't supported. Please choose a JPEG, PNG, or WebP image."
    );
  }

  const typeOk = (ACCEPTED_UPLOAD_TYPES as readonly string[]).includes(file.type);
  const extOk = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!typeOk && !extOk) {
    throw new PuzzleImageError(
      "invalid-type",
      "Unsupported file type. Please choose a JPEG, PNG, or WebP image."
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new PuzzleImageError(
      "too-large",
      `That image is too large (max ${Math.round(MAX_UPLOAD_BYTES / (1024 * 1024))}MB).`
    );
  }
}

export type SquareImage = ImageBitmap | HTMLCanvasElement;

/**
 * Decodes `source` (a local Blob/File for uploads, or a same-origin URL for
 * built-in images) and returns a center-cropped, distortion-free square
 * image sized to `targetSize` px. Uploaded files never touch the network —
 * a URL source is only ever a local built-in asset path.
 */
export async function loadSquareImage(
  source: Blob | string,
  targetSize: number
): Promise<SquareImage> {
  const blob = typeof source === "string" ? await fetchAsBlob(source) : source;

  if (typeof createImageBitmap === "function") {
    try {
      return await cropWithImageBitmap(blob, targetSize);
    } catch {
      // Fall through to the <img> + <canvas> fallback below.
    }
  }

  return cropWithHtmlImage(blob, targetSize);
}

async function fetchAsBlob(url: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new PuzzleImageError("network-failed", "Couldn't load that image. Please try another one.");
  }
  if (!response.ok) {
    throw new PuzzleImageError("network-failed", "Couldn't load that image. Please try another one.");
  }
  return response.blob();
}

async function cropWithImageBitmap(blob: Blob, targetSize: number): Promise<ImageBitmap> {
  let full: ImageBitmap;
  try {
    full = await createImageBitmap(blob);
  } catch {
    throw new PuzzleImageError(
      "decode-failed",
      "That image couldn't be read. It may be corrupted or in an unsupported format."
    );
  }

  const side = Math.min(full.width, full.height);
  const sx = (full.width - side) / 2;
  const sy = (full.height - side) / 2;

  try {
    const cropped = await createImageBitmap(full, sx, sy, side, side, {
      resizeWidth: targetSize,
      resizeHeight: targetSize,
      resizeQuality: "high",
    });
    full.close();
    return cropped;
  } catch {
    full.close();
    throw new PuzzleImageError("decode-failed", "That image couldn't be processed. Please try another one.");
  }
}

function cropWithHtmlImage(blob: Blob, targetSize: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    const cleanup = () => URL.revokeObjectURL(url);

    img.onload = () => {
      try {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - side) / 2;
        const sy = (img.naturalHeight - side) / 2;

        const canvas = document.createElement("canvas");
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new PuzzleImageError("unsupported", "Canvas isn't available in this browser."));
          return;
        }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, targetSize, targetSize);
        resolve(canvas);
      } catch {
        reject(
          new PuzzleImageError("decode-failed", "That image couldn't be processed. Please try another one.")
        );
      } finally {
        cleanup();
      }
    };

    img.onerror = () => {
      cleanup();
      reject(
        new PuzzleImageError(
          "decode-failed",
          "That image couldn't be read. It may be corrupted or in an unsupported format."
        )
      );
    };

    img.src = url;
  });
}
