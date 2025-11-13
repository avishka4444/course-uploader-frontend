import type { AxiosProgressEvent } from "axios";

import { axios } from "./index";
import type { UploadedFile, UploadResponse } from "../types/uploads";

const formDataHeaders = {
  headers: { "Content-Type": "multipart/form-data" },
};

export interface UploadFilePayload {
  file: File;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}

export const uploadFile = async ({
  file,
  onUploadProgress,
}: UploadFilePayload): Promise<UploadResponse> => {
  const data = new FormData();
  data.append("file", file);

  const response = await axios.post<UploadResponse>("/file/upload", data, {
    ...formDataHeaders,
    onUploadProgress,
  });

  return response.data;
};

export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await axios.get<UploadedFile[]>("/file/getAll");
  return response.data;
};

export const getFileDownloadUrl = (fileId: number): string => `/file/download/${fileId}`;

export const getFileViewUrl = (fileId: number): string => `/file/download/${fileId}`;

export const canViewInBrowser = (fileType: string): boolean => {
  const viewableTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "video/mp4",
  ];
  return viewableTypes.includes(fileType);
};

