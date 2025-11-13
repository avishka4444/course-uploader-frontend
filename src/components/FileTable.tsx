import { useEffect, useMemo, useRef, useState } from "react";

import { axios } from "../services";
import {
  canViewInBrowser,
  getFileDownloadUrl,
  getFileViewUrl,
} from "../services/FileUploadService";
import { useFiles } from "../hooks/useFiles";
import type { UploadedFile } from "../types/uploads";
import { formatBytes, formatDate } from "../lib/format";

// File Viewer Modal Component
const FileViewerModal = ({
  file,
  isOpen,
  onClose,
}: {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewUrlRef = useRef<string | null>(null);

  // Fetch file blob when modal opens
  useEffect(() => {
    if (!isOpen || !file) {
      // Cleanup blob URL when modal closes
      if (viewUrlRef.current) {
        window.URL.revokeObjectURL(viewUrlRef.current);
        viewUrlRef.current = null;
        setViewUrl(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    const fetchFile = async () => {
      try {
        const response = await axios.get(getFileViewUrl(file.id), {
          responseType: "blob",
        });
        const blob = new Blob([response.data], { type: file.fileType });
        const url = window.URL.createObjectURL(blob);
        viewUrlRef.current = url;
        setViewUrl(url);
      } catch (err) {
        console.error("Failed to load file:", err);
        setError("Failed to load file. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFile();

    // Cleanup function
    return () => {
      if (viewUrlRef.current) {
        window.URL.revokeObjectURL(viewUrlRef.current);
        viewUrlRef.current = null;
      }
    };
  }, [isOpen, file]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const renderFileContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 animate-spin text-primary-400"
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
            <p className="mt-4 text-slate-400">Loading file...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="text-center text-rose-400">
            <svg
              className="mx-auto h-12 w-12"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="mt-4">{error}</p>
          </div>
        </div>
      );
    }

    if (!viewUrl) return null;

    // Render based on file type
    if (file.fileType.startsWith("image/")) {
      return (
        <div className="flex h-full items-center justify-center bg-slate-900 p-4">
          <img
            src={viewUrl}
            alt={file.fileName}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }

    if (file.fileType === "application/pdf") {
      return (
        <div className="h-full w-full">
          <iframe
            src={viewUrl}
            className="h-full w-full border-0"
            title={file.fileName}
          />
        </div>
      );
    }

    if (file.fileType === "video/mp4") {
      return (
        <div className="flex h-full items-center justify-center bg-slate-900 p-4">
          <video
            src={viewUrl}
            controls
            className="max-h-full max-w-full"
            title={file.fileName}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400">Preview not available for this file type.</p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[90vh] w-full max-w-6xl flex-col rounded-lg bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{file.fileName}</h3>
            <p className="text-sm text-slate-400">
              {file.fileType} • {formatBytes(file.fileSize)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 overflow-hidden">{renderFileContent()}</div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="card flex flex-col items-center justify-center gap-3 p-12 text-center text-slate-400">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-10 w-10 text-slate-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 7.5h9M7.5 12h4.5m-8.25 6h12A2.25 2.25 0 0 0 18 15.75V6.75A2.25 2.25 0 0 0 15.75 4.5h-12A2.25 2.25 0 0 0 1.5 6.75v9a2.25 2.25 0 0 0 2.25 2.25Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 16.5l3 3m0 0 3-3m-3 3V12"
      />
    </svg>
    <div>
      <p className="text-lg font-semibold text-slate-200">No files yet</p>
      <p className="text-sm text-slate-400">
        Your uploaded files will appear here with metadata.
      </p>
    </div>
  </div>
);

const LoadingTable = () => (
  <div className="card divide-y divide-slate-800 overflow-hidden">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="grid grid-cols-[2fr_repeat(3,minmax(0,1fr))_auto] items-center gap-4 px-6 py-4"
      >
        <div className="h-4 animate-pulse rounded bg-slate-800" />
        <div className="h-4 animate-pulse rounded bg-slate-800" />
        <div className="h-4 animate-pulse rounded bg-slate-800" />
        <div className="h-4 animate-pulse rounded bg-slate-800" />
        <div className="h-5 w-20 animate-pulse rounded bg-slate-800" />
      </div>
    ))}
  </div>
);

const FileActions = ({
  file,
  onView,
}: {
  file: UploadedFile;
  onView: () => void;
}) => {
  const downloadUrl = getFileDownloadUrl(file.id);
  const canView = canViewInBrowser(file.fileType);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDownloading(true);

    try {
      // Fetch file as blob with authentication
      const response = await axios.get(downloadUrl, {
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Download failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {canView && (
        <button
          onClick={onView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-primary-400 hover:text-primary-200"
          title="View file"
        >
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-primary-400 hover:text-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Download file"
      >
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {isDownloading ? "Downloading..." : ""}
      </button>
    </div>
  );
};

const FilesTable = ({
  files,
  onViewFile,
}: {
  files: UploadedFile[];
  onViewFile: (file: UploadedFile) => void;
}) => (
  <div className="card overflow-hidden">
    <div className="grid grid-cols-[2fr_repeat(3,minmax(0,1fr))_auto] items-center gap-4 border-b border-slate-800 bg-slate-900/70 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
      <span>Name</span>
      <span>Type</span>
      <span>Size</span>
      <span>Date</span>
      <span className="text-right">Actions</span>
    </div>
    <ul className="divide-y divide-slate-800">
      {files.map((file) => (
        <li
          key={file.id}
          className="grid grid-cols-[2fr_repeat(3,minmax(0,1fr))_auto] items-center gap-4 px-6 py-4 text-sm text-slate-200"
        >
          <span
            className="truncate font-medium text-white"
            title={file.fileName}
          >
            {file.fileName}
          </span>
          <span className="truncate text-slate-400" title={file.fileType}>
            {file.fileType}
          </span>
          <span>{formatBytes(file.fileSize)}</span>
          <span>{formatDate(file.uploadDate)}</span>
          <span className="flex justify-end">
            <FileActions file={file} onView={() => onViewFile(file)} />
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export const FileTable = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useFiles();
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewFile = (file: UploadedFile) => {
    setViewingFile(file);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Cleanup after a delay to allow modal to close
    setTimeout(() => {
      setViewingFile(null);
    }, 300);
  };

  const content = useMemo(() => {
    if (isLoading) return <LoadingTable />;
    if (isError)
      return (
        <div className="card flex flex-col items-center gap-4 p-12 text-center text-slate-300">
          <p className="text-lg font-semibold text-rose-300">
            Failed to load files
          </p>
          <p className="text-sm text-slate-400">{(error as Error).message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-primary-400 hover:text-primary-200"
          >
            Try again
          </button>
        </div>
      );
    if (!data || data.length === 0) return <EmptyState />;
    return <FilesTable files={data} onViewFile={handleViewFile} />;
  }, [data, error, isError, isLoading, refetch]);

  return (
    <>
      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Uploaded files</h2>
            <p className="text-sm text-slate-400">
              Browse and download files you have uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-primary-400 hover:text-primary-200"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </header>
        {content}
      </section>

      <FileViewerModal
        file={viewingFile}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
