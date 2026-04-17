import * as faceapi from 'face-api.js';

// We'll use high-quality models from a public CDN to avoid bloating the bundle
const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let modelsLoaded = false;

/**
 * Load the necessary vision models for face detection and recognition.
 */
export async function loadModels() {
  if (modelsLoaded) return;
  
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  
  modelsLoaded = true;
  console.log("AI Vision models loaded successfully.");
}

/**
 * Extract a 128-float face descriptor (fingerprint) from an image.
 */
export async function extractFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> {
  await loadModels();
  
  // Detect a single face and get its markings/descriptor
  // Lowered the scoreThreshold to make it more sensitive to webcam captures (prevents 'low light' errors)
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.2 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
    
  if (!detection) {
    console.log("No face detected in image.");
    return null;
  }
  
  return detection.descriptor;
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
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
