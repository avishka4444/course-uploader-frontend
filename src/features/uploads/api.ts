import type { AxiosProgressEvent } from "axios";

import { axios } from "../../lib/axios";
import type { FileMetadataResponse, UploadedFile } from "./types";

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
}: UploadFilePayload): Promise<UploadedFile> => {
  const data = new FormData();
  data.append("file", file);

  const response = await axios.post<UploadedFile>("/files", data, {
    ...formDataHeaders,
    onUploadProgress,
  });

  return response.data;
};

export const fetchFiles = async (): Promise<UploadedFile[]> => {
  const response = await axios.get<FileMetadataResponse | UploadedFile[]>(
    "/files"
  );
  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  return data.items;
};
