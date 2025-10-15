/**
 * Unit Tests for Image Compression Utility
 * Testing critical image optimization functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { compressImage } from '../imageCompression';

// Mock browser-image-compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file, options) => {
    // Return a mock compressed file
    return Promise.resolve(new File(['compressed'], file.name, { type: file.type }));
  }),
}));

describe('imageCompression', () => {
  it('compresses large images', async () => {
    const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    
    const compressed = await compressImage(largeFile);
    
    expect(compressed).toBeDefined();
    expect(compressed.name).toBe('large.jpg');
    expect(compressed.type).toBe('image/jpeg');
  });

  it('handles JPEG images', async () => {
    const jpegFile = new File(['jpeg'], 'photo.jpg', { type: 'image/jpeg' });
    
    const compressed = await compressImage(jpegFile);
    
    expect(compressed.type).toBe('image/jpeg');
  });

  it('handles PNG images', async () => {
    const pngFile = new File(['png'], 'graphic.png', { type: 'image/png' });
    
    const compressed = await compressImage(pngFile);
    
    expect(compressed.type).toBe('image/png');
  });

  it('handles WebP images', async () => {
    const webpFile = new File(['webp'], 'modern.webp', { type: 'image/webp' });
    
    const compressed = await compressImage(webpFile);
    
    expect(compressed.type).toBe('image/webp');
  });

  it('rejects non-image files', async () => {
    const textFile = new File(['text'], 'document.txt', { type: 'text/plain' });
    
    await expect(compressImage(textFile)).rejects.toThrow();
  });

  it('handles compression errors gracefully', async () => {
    const imageCompression = await import('browser-image-compression');
    vi.mocked(imageCompression.default).mockRejectedValueOnce(new Error('Compression failed'));
    
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    
    await expect(compressImage(file)).rejects.toThrow('Compression failed');
  });

  it('preserves file name after compression', async () => {
    const file = new File(['image'], 'my-photo.jpg', { type: 'image/jpeg' });
    
    const compressed = await compressImage(file);
    
    expect(compressed.name).toBe('my-photo.jpg');
  });

  it('uses correct compression options for high quality', async () => {
    const imageCompression = await import('browser-image-compression');
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    
    await compressImage(file, { maxSizeMB: 1, maxWidthOrHeight: 2048 });
    
    expect(imageCompression.default).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        maxSizeMB: 1,
        maxWidthOrHeight: 2048,
      })
    );
  });

  it('uses correct compression options for standard quality', async () => {
    const imageCompression = await import('browser-image-compression');
    const file = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
    
    await compressImage(file);
    
    expect(imageCompression.default).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
      })
    );
  });
});
