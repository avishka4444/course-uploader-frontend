import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { isAxiosError } from "../services";
import { fetchFiles, uploadFile, type UploadFilePayload } from "../services/FileUploadService";
import type { UploadResponse } from "../types/uploads";

const FILES_QUERY_KEY = ["files"];

export const useFiles = () =>
  useQuery({
    queryKey: FILES_QUERY_KEY,
    queryFn: fetchFiles,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on connection errors (backend not running)
      if (isAxiosError(error)) {
        const code = error.code || error.response?.status;
        // Network errors or connection refused
        if (
          !error.response &&
          (code === "ECONNREFUSED" ||
            code === "ERR_NETWORK" ||
            code === "ETIMEDOUT")
        ) {
          return false;
        }
      }
      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
  });

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadFile(payload),
    onSuccess: () => {
      // Refetch the file list after successful upload
      queryClient.invalidateQueries({ queryKey: FILES_QUERY_KEY });
    },
  });
};

