const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image';
  }
  return null;
}

export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return 'Please upload an MP4, MOV, or WebM video';
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return 'Video must be under 500MB';
  }
  return null;
}

export function generateStoragePath(type: 'image' | 'video', filename: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin';
  return `${type}s/${timestamp}-${randomId}.${ext}`;
}

export function getImageDerivativePath(originalPath: string, size: 'thumb' | 'card' | 'full'): string {
  const parts = originalPath.split('.');
  const ext = parts.pop();
  return `${parts.join('.')}_${size}.${ext}`;
}

export const IMAGE_SIZES = {
  thumb: { width: 480, label: 'Thumbnail' },
  card: { width: 960, label: 'Card' },
  full: { width: 1600, label: 'Full' },
} as const;
