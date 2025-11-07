import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchFiles, uploadFile, type UploadFilePayload } from "./api";
import type { UploadedFile } from "./types";

const FILES_QUERY_KEY = ["files"];

export const useFiles = () =>
  useQuery({
    queryKey: FILES_QUERY_KEY,
    queryFn: fetchFiles,
    refetchOnWindowFocus: false,
  });

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UploadFilePayload) => uploadFile(payload),
    onSuccess: (uploaded: UploadedFile) => {
      queryClient.setQueryData<UploadedFile[]>(FILES_QUERY_KEY, (existing) => {
        if (!existing) {
          return [uploaded];
        }

        const index = existing.findIndex((item) => item.id === uploaded.id);
        if (index !== -1) {
          const cloned = [...existing];
          cloned[index] = uploaded;
          return cloned;
        }

        return [uploaded, ...existing];
      });
    },
  });
};
