"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/shared/lib/auth/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password, displayName);
      router.push("/explorer");
    } catch {
      setError("Registration failed. Email may already be taken.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="w-full max-w-sm p-6 rounded-lg border border-border-subtle bg-surface-panel space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-accent-text">T</h1>
          <h2 className="text-lg font-semibold text-text-primary mt-2">Create your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-text-secondary">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-secondary">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border-default bg-surface-card text-text-primary focus:border-accent focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-medium rounded-lg bg-accent text-white disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-text hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
