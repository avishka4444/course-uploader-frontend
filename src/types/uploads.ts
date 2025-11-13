// Matches ContentResponse from backend
export interface UploadedFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string; // ISO string from Instant
  fileUrl: string;
}

export interface UploadResponse {
  id: number;
  message: string;
}

