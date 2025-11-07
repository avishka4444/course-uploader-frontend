export interface UploadedFile {
  id: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  downloadUrl: string;
}

export interface FileMetadataResponse {
  items: UploadedFile[];
}
