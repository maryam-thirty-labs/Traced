"use client";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
      <div className="rounded-lg border border-red-400/30 bg-red-400/5 p-6 max-w-sm">
        <h2 className="text-base font-semibold text-red-400">Something went wrong</h2>
        <p className="text-xs text-text-secondary mt-2">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="mt-4 px-4 py-2 text-xs font-medium rounded-lg bg-accent text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
