type EmptyStateProps = {
  message?: string;
  icon?: string;
};

export function EmptyState({
  message = "Nothing here yet",
  icon = "\u{1F4ED}",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}
