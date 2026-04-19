"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { EtymologyReveal } from "@/features/lesson/components/EtymologyReveal";

type Step =
  | "tap"
  | "word"
  | "etymology"
  | "story"
  | "retrieval"
  | "xp"
  | "signup-gate"
  | "questions"
  | "notifications"
  | "tomorrow";

// Hand-curated onboarding path so the first session does not depend on seed
// content landing first. All from well-established sources (see
// scripts/seed_etymology.sql for citations).
const ONBOARDING_STRUCTURE = {
  canonicalId: "ANAT_HEART_001",
  displayName: "Heart",
  root: "kardia",
  origin: "Greek",
  meaning: "heart",
  exampleUsage: "cardiac, cardiology, cardiomyopathy — all from kardia",
  story: [
    "Your heart is a muscular pump the size of your fist, and it beats about 100,000 times a day without you having to think about it once.",
    "Every beat pushes oxygen-rich blood through the aorta — a tube whose Greek name meant \"the thing that is raised up\" — and out to every tissue in the body.",
    "The four chambers take turns: the atria (Latin for \"entrance halls\") fill first, then the ventricles (\"little bellies\") squeeze.",
    "When you learn the name, you learn the story — and the story makes the anatomy unforgettable.",
  ] as const,
  labels: [
    { key: "ventricle", text: "Left ventricle", correct: "A" },
    { key: "atrium", text: "Right atrium", correct: "B" },
    { key: "aorta", text: "Aorta", correct: "C" },
  ] as const,
};

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("tap");
  const [intent, setIntent] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string | null>(null);

  const advance = (next: Step) => setStep(next);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ backgroundColor: "#FBF9F5", color: "#16112E" }}
    >
      <div className="w-full max-w-xl">
        {step === "tap" && <TapStep onTap={() => advance("word")} />}
        {step === "word" && <WordStep onNext={() => advance("etymology")} />}
        {step === "etymology" && <EtymologyStep onNext={() => advance("story")} />}
        {step === "story" && <StoryStep onNext={() => advance("retrieval")} />}
        {step === "retrieval" && <RetrievalStep onNext={() => advance("xp")} />}
        {step === "xp" && <XpStep onNext={() => advance("signup-gate")} />}
        {step === "signup-gate" && <SignupGateStep router={router} onContinue={() => advance("questions")} />}
        {step === "questions" && (
          <QuestionsStep
            intent={intent}
            minutes={minutes}
            setIntent={setIntent}
            setMinutes={setMinutes}
            onNext={() => advance("notifications")}
          />
        )}
        {step === "notifications" && <NotificationsStep onNext={() => advance("tomorrow")} />}
        {step === "tomorrow" && <TomorrowStep onFinish={() => router.push("/explorer")} />}
      </div>
    </div>
  );
}

function TapStep({ onTap }: { onTap: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-wider" style={{ color: "#5C5472" }}>
        00:00
      </p>
      <h1 className="text-2xl leading-tight" style={{ fontFamily: "var(--font-display)" }}>
        Tap something you&apos;ve always wondered about.
      </h1>
      <button
        onClick={onTap}
        className="inline-block px-8 py-6 rounded-2xl border text-lg font-semibold"
        style={{ borderColor: "rgba(90,43,148,0.2)", color: "#5A2B94", backgroundColor: "#FFFFFF" }}
      >
        The heart
      </button>
      <p className="text-xs" style={{ color: "#9B95B8" }}>
        (no signup yet — just curiosity)
      </p>
    </div>
  );
}

function WordStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-wider" style={{ color: "#5C5472" }}>
        00:05
      </p>
      <p className="text-xl" style={{ color: "#16112E" }}>
        This is your{" "}
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {ONBOARDING_STRUCTURE.displayName}
        </span>
        .
      </p>
      <p className="text-sm italic" style={{ color: "#5C5472" }}>
        And its name comes from a word you already know.
      </p>
      <button
        onClick={onNext}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#5A2B94" }}
      >
        Show me
      </button>
    </div>
  );
}

function EtymologyStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm uppercase tracking-wider text-center" style={{ color: "#5C5472" }}>
        00:10
      </p>
      <EtymologyReveal
        root={ONBOARDING_STRUCTURE.root}
        origin={ONBOARDING_STRUCTURE.origin}
        meaning={ONBOARDING_STRUCTURE.meaning}
        exampleUsage={ONBOARDING_STRUCTURE.exampleUsage}
      />
      <div className="text-center">
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#5A2B94" }}
        >
          Keep going
        </button>
      </div>
    </div>
  );
}

function StoryStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm uppercase tracking-wider text-center" style={{ color: "#5C5472" }}>
        00:30
      </p>
      <div className="space-y-4">
        {ONBOARDING_STRUCTURE.story.map((p, i) => (
          <p key={i} style={{ color: "#16112E", lineHeight: 1.7 }}>
            {p}
          </p>
        ))}
      </div>
      <p className="text-[10px] italic" style={{ color: "#9B95B8" }}>
        This is not medical advice.
      </p>
      <div className="text-center">
        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#5A2B94" }}
        >
          Quiz me
        </button>
      </div>
    </div>
  );
}

function RetrievalStep({ onNext }: { onNext: () => void }) {
  const [placed, setPlaced] = useState<Set<string>>(new Set());

  function place(key: string) {
    setPlaced((prev) => new Set(prev).add(key));
  }

  const done = placed.size === ONBOARDING_STRUCTURE.labels.length;

  return (
    <div className="space-y-6">
      <p className="text-sm uppercase tracking-wider text-center" style={{ color: "#5C5472" }}>
        01:30
      </p>
      <h2 className="text-xl text-center" style={{ fontFamily: "var(--font-display)" }}>
        Drag each label onto the heart
      </h2>
      <div className="flex flex-col gap-2">
        {ONBOARDING_STRUCTURE.labels.map((l) => {
          const tapped = placed.has(l.key);
          return (
            <button
              key={l.key}
              onClick={() => place(l.key)}
              className="flex items-center justify-between px-4 py-3 rounded-lg border text-sm"
              style={{
                borderColor: tapped ? "rgba(30,122,62,0.4)" : "#E8E3D9",
                backgroundColor: tapped ? "rgba(30,122,62,0.06)" : "#FFFFFF",
                color: tapped ? "#1E7A3E" : "#16112E",
              }}
            >
              {l.text}
              {tapped && <Check size={16} />}
            </button>
          );
        })}
      </div>
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!done}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: "#5A2B94" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function XpStep({ onNext }: { onNext: () => void }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setValue((v) => (v < 20 ? v + 1 : v)), 40);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="space-y-6 text-center">
      <p className="text-sm uppercase tracking-wider" style={{ color: "#5C5472" }}>
        02:00
      </p>
      <div className="text-6xl font-bold tabular-nums" style={{ color: "#5A2B94" }}>
        +{value} XP
      </div>
      <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
        Level 1: Apprentice Anatomist
      </p>
      <button
        onClick={onNext}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#5A2B94" }}
      >
        Keep going
      </button>
    </div>
  );
}

function SignupGateStep({
  onContinue,
  router,
}: {
  onContinue: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="space-y-5 text-center">
      <p className="text-sm uppercase tracking-wider" style={{ color: "#5C5472" }}>
        02:30
      </p>
      <h2 className="text-2xl" style={{ fontFamily: "var(--font-display)" }}>
        Want to keep your progress?
      </h2>
      <p className="text-sm" style={{ color: "#5C5472" }}>
        Save your streak, your XP, and your etymology garden.
      </p>
      <div className="flex flex-col gap-2 max-w-xs mx-auto">
        <button
          onClick={() => router.push("/register")}
          className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: "#5A2B94" }}
        >
          Create account
        </button>
        <button
          onClick={onContinue}
          className="text-xs"
          style={{ color: "#5C5472" }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function QuestionsStep({
  intent,
  minutes,
  setIntent,
  setMinutes,
  onNext,
}: {
  intent: string | null;
  minutes: string | null;
  setIntent: (v: string) => void;
  setMinutes: (v: string) => void;
  onNext: () => void;
}) {
  const INTENTS = ["curious", "fitness", "med student", "health scare", "other"];
  const MINS = ["3", "5", "10", "15"];
  const ready = intent !== null && minutes !== null;
  return (
    <div className="space-y-6">
      <p className="text-sm uppercase tracking-wider text-center" style={{ color: "#5C5472" }}>
        03:00
      </p>
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: "#16112E" }}>
          What brought you here?
        </p>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((key) => (
            <button
              key={key}
              onClick={() => setIntent(key)}
              className="px-3 py-1.5 rounded-full border text-xs font-medium"
              style={{
                borderColor: intent === key ? "#5A2B94" : "#E8E3D9",
                backgroundColor: intent === key ? "#F3EBFF" : "#FFFFFF",
                color: intent === key ? "#5A2B94" : "#16112E",
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: "#16112E" }}>
          How many minutes a day?
        </p>
        <div className="flex gap-2">
          {MINS.map((key) => (
            <button
              key={key}
              onClick={() => setMinutes(key)}
              className="px-4 py-2 rounded-lg border text-sm font-semibold"
              style={{
                borderColor: minutes === key ? "#5A2B94" : "#E8E3D9",
                backgroundColor: minutes === key ? "#F3EBFF" : "#FFFFFF",
                color: minutes === key ? "#5A2B94" : "#16112E",
              }}
            >
              {key} min
            </button>
          ))}
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={onNext}
          disabled={!ready}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: "#5A2B94" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function NotificationsStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <p className="text-sm uppercase tracking-wider" style={{ color: "#5C5472" }}>
        03:30
      </p>
      <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
        Remind you tomorrow?
      </h2>
      <p className="text-sm" style={{ color: "#5C5472" }}>
        You can enable daily reminders from your profile once you create an account.
      </p>
      <button
        onClick={onNext}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#5A2B94" }}
      >
        Continue
      </button>
    </div>
  );
}

function TomorrowStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="space-y-5 text-center">
      <p className="text-sm uppercase tracking-wider" style={{ color: "#5C5472" }}>
        04:00
      </p>
      <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
        Come back tomorrow for:
      </h2>
      <p className="text-lg italic" style={{ color: "#5A2B94", fontFamily: "var(--font-display)" }}>
        Aorta
      </p>
      <p className="text-xs" style={{ color: "#9B95B8" }}>
        Greek for &ldquo;the thing that is raised up&rdquo;
      </p>
      <button
        onClick={onFinish}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: "#5A2B94" }}
      >
        Take me to Explorer
      </button>
      <div className="pt-2">
        <Link href="/login" className="text-xs" style={{ color: "#5C5472" }}>
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
