export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 animate-pulse">
      <div className="h-4 w-2/3 rounded bg-surface-elevated" />
      <div className="h-3 w-full rounded bg-surface-elevated" />
      <div className="h-3 w-5/6 rounded bg-surface-elevated" />
      <div className="h-20 w-full rounded bg-surface-elevated mt-2" />
      <div className="h-20 w-full rounded bg-surface-elevated" />
    </div>
  );
}
