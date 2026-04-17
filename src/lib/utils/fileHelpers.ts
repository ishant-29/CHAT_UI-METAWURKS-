export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = {
  documents: [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  videos: ["video/mp4", "video/webm", "video/quicktime"],
};

export const ALL_ALLOWED_TYPES = [
  ...ALLOWED_FILE_TYPES.documents,
  ...ALLOWED_FILE_TYPES.videos,
];

export function isFileTypeAllowed(type: string): boolean {
  return ALL_ALLOWED_TYPES.includes(type);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getFileCategory(type: string): "document" | "video" | "other" {
  if (ALLOWED_FILE_TYPES.documents.includes(type)) return "document";
  if (ALLOWED_FILE_TYPES.videos.includes(type)) return "video";
  return "other";
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File ${file.name} exceeds 10MB limit`,
    };
  }

  if (!isFileTypeAllowed(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  return { valid: true };
}
