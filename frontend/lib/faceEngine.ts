import * as faceapi from 'face-api.js';

// We'll use local models to ensure reliability and speed
const MODEL_URL = '/models';

let modelsLoaded = false;

/**
 * Load the necessary vision models for face detection and recognition.
 */
export async function loadModels() {
  if (modelsLoaded) return;
  
  console.log("AI Vision: Loading models from", MODEL_URL);
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  
  modelsLoaded = true;
  console.log("AI Vision: Models loaded successfully.");
}

/**
 * Extract a 128-float face descriptor (fingerprint) from an image.
 */
export async function extractFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Float32Array | null> {
  await loadModels();
  
  // Detect a single face and get its markings/descriptor
  // Using higher accuracy SSD MobileNet v1 instead of Tiny detector
  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.3 }))
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
