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

      {/* 4-pillar strip */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-center text-center gap-3 p-4">
              <span className="text-3xl">{pillar.icon}</span>
              <h3 className="text-sm font-semibold text-text-primary">{pillar.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Etymology demo */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-text-primary">Words have roots. So does disease.</h2>
          <p className="text-sm text-text-secondary mt-2">Every disease name tells a story. Traced breaks it down.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ETYMOLOGY_DEMOS.map((demo) => (
            <div key={demo.name} className="rounded-lg border border-border-subtle bg-surface-card p-5 space-y-3">
              <h4 className="text-sm font-semibold text-text-primary">{demo.name}</h4>
              <div className="flex flex-wrap gap-1">
                {demo.parts.map((part, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded bg-accent-muted text-accent-text">
                    {part.root} <span className="text-text-muted">= {part.meaning}</span>
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-secondary italic">{demo.plain}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const ETYMOLOGY_DEMOS = [
  {
    name: "Cholecystitis",
    parts: [
      { root: "chole-", meaning: "bile" },
      { root: "-cyst-", meaning: "bladder" },
      { root: "-itis", meaning: "inflammation" },
    ],
    plain: "Inflammation of the gallbladder",
  },
  {
    name: "Osteoporosis",
    parts: [
      { root: "osteo-", meaning: "bone" },
      { root: "por-", meaning: "pore" },
      { root: "-osis", meaning: "condition" },
    ],
    plain: "A condition of porous, weakened bones",
  },
  {
    name: "Myocardial infarction",
    parts: [
      { root: "myo-", meaning: "muscle" },
      { root: "cardi-", meaning: "heart" },
      { root: "infarct-", meaning: "tissue death" },
    ],
    plain: "Death of heart muscle tissue — a heart attack",
  },
];

const PILLARS = [
  {
    title: "Explore",
    icon: "\u{1F9EC}",
    description: "Click the body map. Navigate anatomy systems. See every structure in context.",
  },
  {
    title: "Connect",
    icon: "\u{1F517}",
    description: "Trace the links from structure to disease, mechanism, and treatment.",
  },
  {
    title: "Play",
    icon: "\u{1F9EA}",
    description: "Solve mystery cases. Diagnose, reason, and treat — then earn XP.",
  },
  {
    title: "Understand",
    icon: "\u{1F4A1}",
    description: "Read grounded explanations backed by NICE, PubMed, and MedlinePlus evidence.",
  },
];
