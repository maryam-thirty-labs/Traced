"use client";

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

export function ErrorState({
  message = "Couldn't load structure data",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
      <p className="text-sm text-text-secondary">{message}</p>
      <button
        onClick={onRetry}
        className="text-xs font-medium text-accent-text hover:underline"
      >
        Retry
      </button>
    </div>
  );
}
