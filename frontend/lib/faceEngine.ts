import * as faceapi from 'face-api.js';

// We'll use local models to ensure reliability and speed
const MODEL_URL = '/models';

let tinyLoaded = false;
let ssdLoaded = false;

// ── Match Threshold (Cosine Similarity) ──
export const MATCH_THRESHOLD = 0.80;

// Minimum face box area as a fraction of image area.
const MIN_FACE_AREA_RATIO = 0.015;

/**
 * Timeout wrapper for model fetching to prevent silent hangs on slow connections.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 12000, errorMessage: string = 'Model loading timed out'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Load models for the lightweight Tiny Face Detector (Best for mobile).
 */
export async function loadTinyModels() {
  if (tinyLoaded) return;
  console.log("AI Vision: Loading Tiny models...");
  try {
    await withTimeout(
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]),
      12000,
      "AI Vision: Tiny models took too long to load."
    );
    tinyLoaded = true;
    console.log("AI Vision: Tiny models ready.");
  } catch (err: any) {
    console.warn("AI Vision: Tiny models failed to load:", err?.message || err);
    throw err;
  }
}

/**
 * Load models for the high-accuracy SSD MobileNet Detector (Best for desktop/wall).
 */
export async function loadSSDModels() {
  if (ssdLoaded) return;
  console.log("AI Vision: Loading SSD models...");
  try {
    await withTimeout(
      Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]),
      12000,
      "AI Vision: SSD models took too long to load."
    );
    ssdLoaded = true;
    console.log("AI Vision: SSD models ready.");
  } catch (err: any) {
    console.warn("AI Vision: SSD models failed to load:", err?.message || err);
    throw err;
  }
}

/**
 * Validate that a detected face is large enough to be a real face.
 */
function isValidFaceDetection(
  detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>>,
  imageElement: HTMLImageElement | HTMLVideoElement
): boolean {
  const box = detection.detection.box;
  const faceArea = box.width * box.height;
  const imgWidth = 'videoWidth' in imageElement ? imageElement.videoWidth : imageElement.naturalWidth;
  const imgHeight = 'videoHeight' in imageElement ? imageElement.videoHeight : imageElement.naturalHeight;
  const imageArea = (imgWidth || imageElement.width) * (imgHeight || imageElement.height);

  if (imageArea === 0) return true;

  const ratio = faceArea / imageArea;
  const score = detection.detection.score;

  console.log(`AI Vision: Face box ${Math.round(box.width)}x${Math.round(box.height)} (${(ratio * 100).toFixed(1)}% of image), confidence: ${score.toFixed(3)}`);

  if (ratio < MIN_FACE_AREA_RATIO) {
    console.warn(`AI Vision: Rejected — face too small (${(ratio * 100).toFixed(2)}% < ${MIN_FACE_AREA_RATIO * 100}%)`);
    return false;
  }

  return true;
}

/**
 * Extract a 128-float face descriptor using the specified engine.
 */
export async function extractFaceDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement, 
  mode: 'tiny' | 'ssd' = 'ssd'
): Promise<Float32Array | null> {
  try {
    if (mode === 'tiny') {
      await loadTinyModels();
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection || !isValidFaceDetection(detection, imageElement)) return null;
      return detection.descriptor;
    } else {
      await loadSSDModels();
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.6 }))
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!detection || !isValidFaceDetection(detection, imageElement)) return null;
      return detection.descriptor;
    }
  } catch (err: any) {
    console.error(`AI Vision: Failed to extract descriptor with ${mode} mode:`, err?.message || err);
    return null;
  }
}

/**
 * Robust face descriptor extraction that tries SSD first, then Tiny as fallback.
 */
export async function extractFaceDescriptorRobust(
  imageElement: HTMLImageElement | HTMLVideoElement,
  preferredMode: 'tiny' | 'ssd' = 'ssd'
): Promise<Float32Array | null> {
  try {
    let descriptor = await extractFaceDescriptor(imageElement, preferredMode);
    if (descriptor) return descriptor;

    const fallback = preferredMode === 'ssd' ? 'tiny' : 'ssd';
    console.log(`AI Vision: ${preferredMode} didn't find a face, trying ${fallback}...`);
    descriptor = await extractFaceDescriptor(imageElement, fallback);
    return descriptor;
  } catch (err: any) {
    console.error("AI Vision: Robust face extraction failed:", err?.message || err);
    return null;
  }
}

/**
 * Convert a File object to an HTMLImageElement for processing.
 */
export function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => {
        console.error("Image load failed", err);
        reject(new Error("Image could not be loaded for scanning."));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
