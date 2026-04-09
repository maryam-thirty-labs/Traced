import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-xl font-bold text-accent-text">Traced</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-accent text-white"
          >
            Start exploring
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-24 max-w-3xl mx-auto gap-6">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Click the body.<br />Understand what breaks.
        </h1>
        <p className="text-lg text-text-secondary max-w-xl">
          An anatomy-first medical learning platform that connects body structures
          to disease, mechanism, and treatment — then makes you prove it through mystery cases.
        </p>
        <div className="flex gap-3 mt-2">
          <Link
            href="/register"
            className="px-6 py-3 text-sm font-medium rounded-lg bg-accent text-white"
          >
            Start exploring
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 text-sm font-medium rounded-lg border border-border-default text-text-secondary hover:text-text-primary"
          >
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
