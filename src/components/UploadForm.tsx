import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosError } from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useUploadFile } from "../features/uploads/hooks";
import { formatBytes } from "../lib/format";

const ACCEPTED_TYPES = [
  "application/pdf",
  "video/mp4",
  "image/jpeg",
  "image/png",
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const schema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => ACCEPTED_TYPES.includes(file.type), {
      message: "Unsupported file type. Allowed: PDF, MP4, JPG, PNG",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File is too large. Max size ${formatBytes(MAX_FILE_SIZE)}`,
    }),
});

type FormValues = z.infer<typeof schema>;

export const UploadForm = () => {
  const uploadMutation = useUploadFile();
  const [progress, setProgress] = useState<number | null>(null);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
  });

  const onSubmit = handleSubmit(async ({ file }) => {
    setProgress(0);

    try {
      await uploadMutation.mutateAsync({
        file,
        onUploadProgress: (event) => {
          if (!event.total) return;
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        },
      });
      reset();
      setDroppedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProgress(null);
    }
  });

  useEffect(() => {
    if (!droppedFile) return;
    setValue("file", droppedFile, { shouldValidate: true });
  }, [droppedFile, setValue]);

  const errorMessage = useMemo(() => {
    if (errors.file?.message) return errors.file.message;

    if (uploadMutation.error) {
      const err = uploadMutation.error as AxiosError<{ message?: string }>;
      return (
        err.response?.data?.message ??
        err.response?.statusText ??
        "Upload failed. Try again."
      );
    }

    return null;
  }, [errors.file?.message, uploadMutation.error]);

  const isUploading = uploadMutation.isPending;

  const fileField = register("file");

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    fileField.onChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setDroppedFile(file);
      setValue("file", file, { shouldValidate: true });
    }
  };

  const handleDrop: React.DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setDroppedFile(file);
      setValue("file", file, { shouldValidate: true });
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
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/40 px-6 py-10 text-center transition hover:border-primary-400 hover:bg-slate-900"
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
        />
        <span className="rounded-full bg-primary-500/20 px-4 py-1 text-sm font-medium text-primary-200">
          Click to select or drag & drop
        </span>
        <p className="text-sm text-slate-400">
          {droppedFile
            ? `${droppedFile.name} • ${formatBytes(droppedFile.size)}`
            : "No file chosen"}
        </p>
      </label>

      {progress !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>Uploading</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-primary-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {errorMessage && <p className="text-sm text-rose-400">{errorMessage}</p>}

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white shadow-lg shadow-primary-900/40 transition hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-slate-700"
        disabled={isUploading}
      >
        {isUploading ? "Uploading…" : "Upload"}
      </button>
    </form>
  );
};
