const sizes = ["B", "KB", "MB", "GB", "TB"] as const;

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const magnitude = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  );
  const value = bytes / 1024 ** magnitude;
  return `${value.toFixed(decimals)} ${sizes[magnitude]}`;
};

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
