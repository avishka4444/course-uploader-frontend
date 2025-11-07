import { useMemo } from "react";

import { useFiles } from "../features/uploads/hooks";
import type { UploadedFile } from "../features/uploads/types";
import { formatBytes, formatDate } from "../lib/format";

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

const FilesTable = ({ files }: { files: UploadedFile[] }) => (
  <div className="card overflow-hidden">
    <div className="grid grid-cols-[2fr_repeat(3,minmax(0,1fr))_auto] items-center gap-4 border-b border-slate-800 bg-slate-900/70 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
      <span>Name</span>
      <span>Type</span>
      <span>Size</span>
      <span>Uploaded</span>
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
            title={file.originalName}
          >
            {file.originalName}
          </span>
          <span className="truncate text-slate-400" title={file.contentType}>
            {file.contentType}
          </span>
          <span>{formatBytes(file.size)}</span>
          <span>{formatDate(file.uploadedAt)}</span>
          <span className="flex justify-end">
            <a
              href={file.downloadUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-primary-400 hover:text-primary-200"
            >
              Download
            </a>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export const FileTable = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useFiles();

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
    return <FilesTable files={data} />;
  }, [data, error, isError, isLoading, refetch]);

  return (
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
  );
};
