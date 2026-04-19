import Link from "next/link";

const FEATURES = [
  {
    title: "Daily 5-minute lessons",
    description:
      "Recall, explore, and one aha moment — every day, always under five minutes.",
  },
  {
    title: "Etymology that sticks",
    description:
      "Every structure's name is a story. Learn the root and the anatomy becomes unforgettable.",
  },
  {
    title: "Mystery cases weekly",
    description:
      "Earn a clinical vignette every week when your streak holds — diagnose from symptoms.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FBF9F5", color: "#16112E" }}>
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span
          className="text-xl font-bold"
          style={{ color: "#5A2B94", fontFamily: "var(--font-display)" }}
        >
          Traced
        </span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm" style={{ color: "#5C5472" }}>
            Sign in
          </Link>
          <Link
            href="/welcome"
            className="text-sm font-medium px-4 py-2 rounded-lg text-white"
            style={{ backgroundColor: "#5A2B94" }}
          >
            Start learning
          </Link>
        </div>
      </nav>

      <section className="flex flex-col items-center text-center px-6 py-20 max-w-3xl mx-auto gap-6">
        <h1
          className="text-4xl sm:text-5xl leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "#16112E" }}
        >
          Textbooks give you labels.<br />Traced gives you reasons.
        </h1>
        <p className="text-lg max-w-xl" style={{ color: "#5C5472" }}>
          The anatomy learning app that makes the human body click.
        </p>
        <Link
          href="/welcome"
          className="mt-2 px-8 py-3 text-base font-semibold rounded-lg text-white"
          style={{ backgroundColor: "#5A2B94" }}
        >
          Start learning, it&apos;s free
        </Link>
        <p className="text-xs" style={{ color: "#9B95B8" }}>
          No medical background needed.
        </p>
      </section>

      <section className="px-6 py-12 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-5 space-y-2"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E8E3D9",
                borderRadius: 12,
              }}
            >
              <h3
                className="text-base font-semibold"
                style={{ color: "#16112E", fontFamily: "var(--font-display)" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5C5472" }}>
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 max-w-3xl mx-auto text-center space-y-3">
        <p
          className="italic text-xl"
          style={{ color: "#5A2B94", fontFamily: "var(--font-display)" }}
        >
          kardia
        </p>
        <p className="text-[10px] uppercase tracking-[0.08em]" style={{ color: "#9B95B8" }}>
          Greek
        </p>
        <p style={{ color: "#16112E" }}>
          heart — cardiac, cardiology, cardiomyopathy all come from the same root.
        </p>
        <p className="text-sm italic mt-4" style={{ color: "#5C5472" }}>
          Learn one root a day. In a year you&apos;ve learned the human body.
        </p>
      </section>

      <footer className="px-6 py-10 mt-8" style={{ borderTop: "1px solid #E8E3D9" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold" style={{ color: "#5A2B94" }}>
            Traced
          </span>
          <div className="flex gap-6">
            <Link href="/welcome" className="text-xs" style={{ color: "#5C5472" }}>
              Start learning
            </Link>
            <Link href="/login" className="text-xs" style={{ color: "#5C5472" }}>
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
