import * as faceapi from 'face-api.js';

// We'll use local models to ensure reliability and speed
const MODEL_URL = '/models';

let tinyLoaded = false;
let ssdLoaded = false;

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
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection?.descriptor || null;
  } else {
    await loadSSDModels();
    const detection = await faceapi
      .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection?.descriptor || null;
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
