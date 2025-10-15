/**
 * Browser-Based Background Removal Utility
 * Uses @huggingface/transformers with WebGPU acceleration
 * Privacy-first: All processing happens in the browser
 */

import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true; // Cache models for faster subsequent uses

const MAX_IMAGE_DIMENSION = 1024;

/**
 * Resize image if it exceeds max dimensions
 * Maintains aspect ratio
 */
function resizeImageIfNeeded(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement
): boolean {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

/**
 * Check if WebGPU is available in the browser
 */
export const isWebGPUAvailable = async (): Promise<boolean> => {
  // Check if navigator has gpu property (WebGPU support)
  if (!('gpu' in navigator)) {
    return false;
  }
  
  try {
    const gpu = (navigator as any).gpu;
    const adapter = await gpu.requestAdapter();
    return adapter !== null;
  } catch {
    return false;
  }
};

/**
 * Remove background from an image
 * @param imageElement - The HTMLImageElement to process
 * @param onProgress - Optional callback for progress updates
 * @returns Promise<Blob> - The processed image as a PNG blob
 */
export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (stage: string, progress: number) => void
): Promise<Blob> => {
  try {
    console.log('[BG Removal] Starting background removal process');
    onProgress?.('Initializing AI model...', 10);

    // Check WebGPU availability
    const hasWebGPU = await isWebGPUAvailable();
    console.log(`[BG Removal] WebGPU ${hasWebGPU ? 'available' : 'not available'}`);

    // Load the segmentation model
    const segmenter = await pipeline(
      'image-segmentation',
      'Xenova/segformer-b0-finetuned-ade-512-512',
      { device: hasWebGPU ? 'webgpu' : 'wasm' }
    );
    
    onProgress?.('Model loaded', 30);
    console.log('[BG Removal] Model loaded successfully');

    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(
      `[BG Removal] Image ${wasResized ? 'resized' : 'processed'} - Dimensions: ${canvas.width}x${canvas.height}`
    );
    
    onProgress?.('Processing image...', 50);

    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Process the image with the segmentation model
    console.log('[BG Removal] Running AI segmentation...');
    const result = await segmenter(imageData);
    
    onProgress?.('Applying mask...', 70);
    console.log('[BG Removal] Segmentation complete');
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create output canvas
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask to remove background
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    // (1 - mask value) to keep subject instead of background
    for (let i = 0; i < result[0].mask.data.length; i++) {
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha; // Set alpha channel
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('[BG Removal] Mask applied successfully');
    
    onProgress?.('Finalizing...', 90);

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('[BG Removal] Successfully created final blob');
            onProgress?.('Complete!', 100);
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('[BG Removal] Error:', error);
    throw error;
  }
};

/**
 * Load an image from a File/Blob
 * @param file - The file to load
 * @returns Promise<HTMLImageElement>
 */
export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src); // Clean up
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Download a blob as a file
 * @param blob - The blob to download
 * @param filename - The filename to save as
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
