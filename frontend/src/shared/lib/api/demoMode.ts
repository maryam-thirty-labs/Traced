// Frontend-only demo mode: when on, http.ts serves canned fixtures instead of
// calling core-service, so the app runs as a static Vercel deploy with no
// backend. Never true unless explicitly set at build time.
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}
