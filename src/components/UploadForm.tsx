import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUploadFile } from "../hooks/useFiles";
import { formatBytes } from "../lib/format";

const ACCEPTED_TYPES = [
  "application/pdf",
  "video/mp4",
  "image/jpeg",
  "image/png",
] as const;

const ACCEPTED_EXTENSIONS = [".pdf", ".mp4", ".jpg", ".jpeg", ".png"] as const;

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

// Helper function to validate file type
const isValidFileType = (file: File): boolean => {
  // Check MIME type
  if (ACCEPTED_TYPES.includes(file.type as any)) {
    return true;
  }
  // Fallback: check file extension
  const fileName = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
};

// Helper function to get file type error message
const getFileTypeError = (file: File): string => {
  if (!isValidFileType(file)) {
    return `Invalid file type "${file.type || "unknown"}". Allowed types: PDF, MP4, JPG, PNG`;
  }
  return "";
};

// Helper function to get file size error message
const getFileSizeError = (file: File): string => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size (${formatBytes(file.size)}) exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE)}`;
  }
  return "";
};

const schema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size > 0, {
      message: "File is empty. Please select a valid file.",
    })
    .refine((file) => isValidFileType(file), {
      message: getFileTypeError,
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: getFileSizeError,
    }),
});

type FormValues = z.infer<typeof schema>;

type ValidationError = {
  type: "fileType" | "fileSize" | "empty" | null;
  message: string;
};

export const UploadForm = () => {
  const uploadMutation = useUploadFile();
  const [progress, setProgress] = useState<number | null>(null);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Validate file before upload
  const validateFile = (file: File | null): ValidationError | null => {
    if (!file) {
      return { type: "empty", message: "Please select a file" };
    }

    if (file.size === 0) {
      return { type: "empty", message: "File is empty. Please select a valid file." };
    }

    if (!isValidFileType(file)) {
      return {
        type: "fileType",
        message: `Invalid file type. Allowed: PDF, MP4, JPG, PNG. Detected: ${file.type || "unknown"}`,
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        type: "fileSize",
        message: `File size (${formatBytes(file.size)}) exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE)}`,
      };
    }

    return null;
  };

  const onSubmit = handleSubmit(
    async ({ file }) => {
      // Final validation before upload
      const validation = validateFile(file);
      if (validation) {
        setValidationError(validation);
        return;
      }

      setValidationError(null);
      setProgress(0);
      setUploadStatus("uploading");

      try {
        await uploadMutation.mutateAsync({
          file,
          onUploadProgress: (event) => {
            if (!event.total) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          },
        });
        setUploadStatus("success");
        reset();
        setDroppedFile(null);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        // Reset success status after 3 seconds
        setTimeout(() => {
          setUploadStatus("idle");
          setProgress(null);
        }, 3000);
      } catch (error) {
        setUploadStatus("error");
        console.error("Upload error:", error);
        // Keep progress visible for a moment on error
        setTimeout(() => {
          setProgress(null);
        }, 2000);
      }
    },
    (formErrors) => {
      // Handle form validation errors
      if (formErrors.file) {
        const file = droppedFile;
        if (file) {
          const validation = validateFile(file);
          if (validation) {
            setValidationError(validation);
          }
        }
      }
    }
  );

  useEffect(() => {
    if (!droppedFile) {
      setValidationError(null);
      return;
    }
    
    // Validate immediately when file is selected
    const validation = validateFile(droppedFile);
    setValidationError(validation);
    
    setValue("file", droppedFile, { shouldValidate: true });
    trigger("file"); // Trigger validation
  }, [droppedFile, setValue, trigger]);

  const errorMessage = useMemo(() => {
    // Priority: validation error > form error > upload error
    if (validationError) {
      return validationError.message;
    }

    if (errors.file?.message) {
      return errors.file.message;
    }

    if (uploadMutation.error) {
      const err = uploadMutation.error as AxiosError<{ message?: string }>;
      
      // Handle different error types
      if (!err.response) {
        return "Network error. Please check your connection and try again.";
      }

      const status = err.response.status;
      const serverMessage = err.response.data?.message || err.response.statusText;

      switch (status) {
        case 400:
          return `Invalid request: ${serverMessage || "Please check the file and try again."}`;
        case 401:
          return "Authentication required. Please log in again.";
        case 403:
          return "You don't have permission to upload files.";
        case 413:
          return `File too large: ${serverMessage || "Maximum file size is 25MB."}`;
        case 415:
          return `Unsupported file type: ${serverMessage || "Please upload PDF, MP4, JPG, or PNG files."}`;
        case 500:
          return "Server error. Please try again later.";
        default:
          return serverMessage || `Upload failed (${status}). Please try again.`;
      }
    }

    return null;
  }, [validationError, errors.file?.message, uploadMutation.error]);

  const isUploading = uploadMutation.isPending;
  const isValidFile = droppedFile && !validationError;

  const fileField = register("file");

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    fileField.onChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setDroppedFile(file);
      setValue("file", file, { shouldValidate: true });
      trigger("file");
    } else {
      setDroppedFile(null);
      setValidationError(null);
    }
  };

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setDroppedFile(file);
      setValue("file", file, { shouldValidate: true });
      trigger("file");
    }
  };

  const handleDragOver: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Upload a file
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Supported formats: PDF, MP4, JPG, PNG. Maximum size{" "}
          {formatBytes(MAX_FILE_SIZE)}.
        </p>
      </header>

      <label
        htmlFor="file"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
          validationError
            ? "border-rose-500 bg-rose-950/20 hover:border-rose-400"
            : isValidFile
            ? "border-green-500 bg-green-950/20 hover:border-green-400"
            : "border-slate-700 bg-slate-900/40 hover:border-primary-400 hover:bg-slate-900"
        }`}
      >
        <input
          id="file"
          type="file"
          className="hidden"
          accept={ACCEPTED_TYPES.join(",")}
          {...fileField}
          ref={(element) => {
            fileField.ref(element);
            inputRef.current = element;
          }}
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <span className="rounded-full bg-primary-500/20 px-4 py-1 text-sm font-medium text-primary-200">
          Click to select or drag & drop
        </span>
        {droppedFile ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-slate-200">
              {droppedFile.name}
            </p>
            <p className="text-xs text-slate-400">
              {formatBytes(droppedFile.size)} • {droppedFile.type || "Unknown type"}
            </p>
            {validationError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{validationError.message}</span>
              </div>
            )}
            {isValidFile && !isUploading && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>File is valid and ready to upload</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No file chosen</p>
        )}
      </label>

      {/* Progress Bar */}
      {progress !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">
              {uploadStatus === "uploading" && "Uploading..."}
              {uploadStatus === "success" && "Upload complete!"}
              {uploadStatus === "error" && "Upload failed"}
            </span>
            <span className="font-medium text-slate-300">{progress}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ease-out ${
                uploadStatus === "success"
                  ? "bg-green-500"
                  : uploadStatus === "error"
                  ? "bg-rose-500"
                  : "bg-primary-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {uploadStatus === "success" && (
            <p className="text-xs text-green-400">
              File uploaded successfully! The file list will update shortly.
            </p>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && uploadStatus !== "success" && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/50 bg-rose-950/20 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 flex-shrink-0 text-rose-400"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="flex-1 text-sm text-rose-400">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:opacity-50"
        disabled={isUploading || !isValidFile || !!validationError}
        title={
          !droppedFile
            ? "Please select a file"
            : validationError
            ? validationError.message
            : isUploading
            ? "Upload in progress..."
            : "Upload file"
        }
      >
        {isUploading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading…
          </>
        ) : (
          "Upload"
        )}
      </button>
    </form>
  );
};
