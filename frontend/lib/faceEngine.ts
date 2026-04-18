import * as faceapi from 'face-api.js';

// We'll use local models to ensure reliability and speed
const MODEL_URL = '/models';

let tinyLoaded = false;
let ssdLoaded = false;

// face-api.js Euclidean distance threshold for face matching:
// < 0.4 = very strict (exact same photo)
// < 0.6 = standard (recommended)
// < 0.75 = loose (more variations, some false positives)
// The Supabase RPC uses cosine similarity (1 - cosine_distance).
// Cosine similarity 0.4 ≈ Euclidean distance ~1.1 (very loose)
// Cosine similarity 0.6 ≈ Euclidean distance ~0.9 (loose)
// Cosine similarity 0.8 ≈ Euclidean distance ~0.63 (moderate)
export const MATCH_THRESHOLD = 0.45; // Cosine similarity - good balance for face variations

/**
 * Load models for the lightweight Tiny Face Detector (Best for mobile).
 */
export async function loadTinyModels() {
  if (tinyLoaded) return;
  console.log("AI Vision: Loading Tiny models...");
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  tinyLoaded = true;
  console.log("AI Vision: Tiny models ready.");
}

/**
 * Load models for the high-accuracy SSD MobileNet Detector (Best for desktop/wall).
 */
export async function loadSSDModels() {
  if (ssdLoaded) return;
  console.log("AI Vision: Loading SSD models...");
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  ssdLoaded = true;
  console.log("AI Vision: SSD models ready.");
}

/**
 * Extract a 128-float face descriptor using the specified engine.
 */
export async function extractFaceDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement, 
  mode: 'tiny' | 'ssd' = 'ssd'
): Promise<Float32Array | null> {
  if (mode === 'tiny') {
    await loadTinyModels();
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.15 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection?.descriptor || null;
  } else {
    await loadSSDModels();
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.2 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection?.descriptor || null;
  }
}

/**
 * Robust face descriptor extraction that tries multiple strategies.
 * First tries with the preferred model, then falls back to the other.
 * This ensures maximum face detection rate across different photo conditions.
 */
export async function extractFaceDescriptorRobust(
  imageElement: HTMLImageElement | HTMLVideoElement,
  preferredMode: 'tiny' | 'ssd' = 'ssd'
): Promise<Float32Array | null> {
  // Try preferred model first
  let descriptor = await extractFaceDescriptor(imageElement, preferredMode);
  if (descriptor) return descriptor;

  // Fallback to the other model
  const fallback = preferredMode === 'ssd' ? 'tiny' : 'ssd';
  console.log(`AI Vision: ${preferredMode} failed, trying ${fallback} fallback...`);
  descriptor = await extractFaceDescriptor(imageElement, fallback);
  if (descriptor) return descriptor;

  // Last resort: try SSD with even lower confidence
  if (preferredMode !== 'ssd') {
    await loadSSDModels();
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection?.descriptor) {
      console.log('AI Vision: Got face with ultra-low confidence fallback');
      return detection.descriptor;
    }
  }

  return null;
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
