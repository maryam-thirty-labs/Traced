import Link from "next/link";

export function ComingSoon() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-full w-full px-6 py-16 gap-4"
      style={{ backgroundColor: "#FBF9F5" }}
    >
      <h1
        className="text-2xl font-semibold tracking-tight"
        style={{ color: "#16112E", fontFamily: "var(--font-display)" }}
      >
        Traced
      </h1>
      <p className="text-sm" style={{ color: "#5C5472" }}>
        This is coming soon.
      </p>
      <Link
        href="/explorer"
        className="text-sm underline-offset-4 hover:underline"
        style={{ color: "#5A2B94" }}
      >
        Back to Explorer
      </Link>
    </div>
  );
}
