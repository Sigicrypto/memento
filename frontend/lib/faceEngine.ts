import * as faceapi from 'face-api.js';

// We'll use local models to ensure reliability and speed
const MODEL_URL = '/models';

let tinyLoaded = false;
let ssdLoaded = false;

// ── Match Threshold (Cosine Similarity) ──
// The Supabase RPC uses cosine similarity (1 - cosine_distance).
// Higher = stricter match. Lower = more permissive.
//   0.75+ = very strict (nearly identical photo)
//   0.60  = good balance for same person, different expressions/angles
//   0.45  = too loose — matches different people (BAD)
export const MATCH_THRESHOLD = 0.6;

// Minimum face box area as a fraction of image area.
// Prevents false positives from tiny "ghost" detections.
const MIN_FACE_AREA_RATIO = 0.01; // At least 1% of image area

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
 * Validate that a detected face is large enough to be a real face.
 * Rejects tiny ghost detections that produce garbage descriptors.
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

  if (imageArea === 0) return true; // Can't validate, allow it

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
 * Includes face-size validation to reject false detections.
 */
export async function extractFaceDescriptor(
  imageElement: HTMLImageElement | HTMLVideoElement, 
  mode: 'tiny' | 'ssd' = 'ssd'
): Promise<Float32Array | null> {
  if (mode === 'tiny') {
    await loadTinyModels();
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!detection || !isValidFaceDetection(detection, imageElement)) return null;
    return detection.descriptor;
  } else {
    await loadSSDModels();
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!detection || !isValidFaceDetection(detection, imageElement)) return null;
    return detection.descriptor;
  }
}

/**
 * Robust face descriptor extraction that tries SSD first, then Tiny as fallback.
 * Both models use reasonable confidence thresholds to avoid false detections.
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
  console.log(`AI Vision: ${preferredMode} didn't find a face, trying ${fallback}...`);
  descriptor = await extractFaceDescriptor(imageElement, fallback);
  return descriptor;
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
