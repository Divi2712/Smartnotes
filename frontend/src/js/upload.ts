/* ============================================================
   UPLOAD.TS  –  File upload tracking & helpers
   ============================================================ */

/* ---- Types ---- */
export type FileCategory = 'text' | 'image' | 'audio' | 'video';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;          // bytes
  category: FileCategory;
  mimeType: string;
  uploadedAt: string;    // human-readable
  timestamp: number;
  status: 'success' | 'pending';
}

/* ---- Storage Key ---- */
const UPLOADS_KEY = 'ai_notes_uploads';

/* ---- Helpers ---- */
function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Determine category from MIME type */
export function getCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/'))  return 'image';
  if (mimeType.startsWith('audio/'))  return 'audio';
  if (mimeType.startsWith('video/'))  return 'video';
  return 'text';
}

/** Emoji icon for each category */
export function categoryIcon(cat: FileCategory): string {
  const map: Record<FileCategory, string> = {
    text:  '📄',
    image: '🖼️',
    audio: '🎙️',
    video: '🎥',
  };
  return map[cat];
}

/** Human-friendly file size string */
export function formatBytes(bytes: number): string {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ---- Public API ---- */

/** Load all uploads from localStorage */
export function getUploads(): UploadedFile[] {
  const raw = localStorage.getItem(UPLOADS_KEY);
  const uploads: UploadedFile[] = raw ? JSON.parse(raw) : [];
  return uploads.sort((a, b) => b.timestamp - a.timestamp);
}

/** Record a new uploaded file */
export function addUpload(file: File): UploadedFile {
  const uploads = getUploads();
  const cat = getCategory(file.type);

  const record: UploadedFile = {
    id: uid(),
    name: file.name,
    size: file.size,
    category: cat,
    mimeType: file.type,
    uploadedAt: new Date().toLocaleString(),
    timestamp: Date.now(),
    status: 'success',
  };

  const updated = [record, ...uploads];
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(updated));
  return record;
}

/** Remove an upload record by id */
export function removeUpload(id: string): void {
  const uploads = getUploads().filter(u => u.id !== id);
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(uploads));
}

/** Clear all upload records */
export function clearUploads(): void {
  localStorage.removeItem(UPLOADS_KEY);
}

/** Accepted MIME types per category */
export const acceptMap: Record<FileCategory, string> = {
  text:  '.txt,.pdf,.doc,.docx',
  image: 'image/*',
  audio: 'audio/*',
  video: 'video/*',
};

/** Card definitions for the four upload zones */
export interface UploadZoneDef {
  category: FileCategory;
  label: string;
  icon: string;
  description: string;
}

export const uploadZones: UploadZoneDef[] = [
  {
    category: 'text',
    label: 'Text / PDF / Doc',
    icon: '📄',
    description: 'Upload .txt, .pdf, .doc or .docx files.',
  },
  {
    category: 'image',
    label: 'Images',
    icon: '🖼️',
    description: 'Upload JPG, PNG, GIF, WebP or other images.',
  },
  {
    category: 'audio',
    label: 'Audio',
    icon: '🎙️',
    description: 'Upload MP3, WAV, M4A or other audio files.',
  },
  {
    category: 'video',
    label: 'Video',
    icon: '🎥',
    description: 'Upload MP4, MOV, AVI or other video files.',
  },
];
