const workerCode = `
  importScripts('https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js');

  self.onmessage = async (e) => {
    try {
      const { fileBlob } = e.data;
      const convertedBlob = await heic2any({
        blob: fileBlob,
        toType: 'image/jpeg',
        quality: 0.8,
      });
      
      const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      self.postMessage({ success: true, blob: finalBlob });
    } catch (error) {
      self.postMessage({ success: false, error: error.message || 'HEIC conversion failed' });
    }
  };
`;

let worker: Worker | null = null;

export function convertHeicToJpeg(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Cannot use worker in SSR'));
      return;
    }

    if (!worker) {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      worker = new Worker(URL.createObjectURL(blob));
    }

    const handler = (e: MessageEvent) => {
      worker?.removeEventListener('message', handler);
      if (e.data.success) {
        resolve(e.data.blob);
      } else {
        reject(new Error(e.data.error));
      }
    };

    worker.addEventListener('message', handler);
    worker.postMessage({ fileBlob: file });
  });
}
