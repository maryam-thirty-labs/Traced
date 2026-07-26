// Static canned data for demo mode. Shapes mirror the real core-service DTOs
// consumed by each feature's lib/*Api.ts file.
import { canonicalDisplayName } from "@/features/anatomy/lib/anatomogramAdapter";
import type { UserBackground } from "@/shared/lib/auth/auth";

export const DEMO_ROOTS = [
  { id: "ROOT_CARDIO", root: "cardi-", origin: "Greek", meaning: "heart", exampleStructures: ["Heart", "Coronary artery"], exampleUsage: "cardiology, cardiomyopathy" },
  { id: "ROOT_HEPAT", root: "hepat-", origin: "Greek", meaning: "liver", exampleStructures: ["Liver"], exampleUsage: "hepatitis, hepatomegaly" },
  { id: "ROOT_CHOLE", root: "chole-", origin: "Greek", meaning: "bile", exampleStructures: ["Gallbladder"], exampleUsage: "cholelithiasis, cholecystitis" },
  { id: "ROOT_OSTE", root: "oste-", origin: "Greek", meaning: "bone", exampleStructures: ["Femur", "Patella"], exampleUsage: "osteoporosis, osteoarthritis" },
  { id: "ROOT_NEUR", root: "neur-", origin: "Greek", meaning: "nerve", exampleStructures: ["Vagus nerve"], exampleUsage: "neurology, neuralgia" },
  { id: "ROOT_PULMO", root: "pulmo-", origin: "Latin", meaning: "lung", exampleStructures: ["Lung"], exampleUsage: "pulmonary, pulmonology" },
  { id: "ROOT_GASTRO", root: "gastro-", origin: "Greek", meaning: "stomach", exampleStructures: ["Stomach"], exampleUsage: "gastritis, gastroenterology" },
  { id: "ROOT_NEPHR", root: "nephr-", origin: "Greek", meaning: "kidney", exampleStructures: ["Kidney"], exampleUsage: "nephrology, nephritis" },
  { id: "ROOT_DERMA", root: "derma-", origin: "Greek", meaning: "skin", exampleStructures: ["Skin"], exampleUsage: "dermatology, dermatitis" },
  { id: "ROOT_ANGI", root: "angi-", origin: "Greek", meaning: "vessel", exampleStructures: ["Aorta"], exampleUsage: "angiogram, angioplasty" },
  { id: "ROOT_MYO", root: "my-", origin: "Greek", meaning: "muscle", exampleStructures: ["Humerus"], exampleUsage: "myocardium, myalgia" },
  { id: "ROOT_SPONDYL", root: "spondyl-", origin: "Greek", meaning: "vertebra", exampleStructures: ["Cervical spine"], exampleUsage: "spondylosis, spondylitis" },
  { id: "ROOT_PELV", root: "pelv-", origin: "Latin", meaning: "basin", exampleStructures: ["Pelvis"], exampleUsage: "pelvic, pelvimetry" },
  { id: "ROOT_COL", root: "col-", origin: "Greek", meaning: "colon", exampleStructures: ["Colon"], exampleUsage: "colitis, colonoscopy" },
  { id: "ROOT_ESOPHAG", root: "esophag-", origin: "Greek", meaning: "gullet", exampleStructures: ["Esophagus"], exampleUsage: "esophagitis, esophagoscopy" },
  { id: "ROOT_PANCREAT", root: "pancreat-", origin: "Greek", meaning: "all-flesh", exampleStructures: ["Pancreas"], exampleUsage: "pancreatitis, pancreatectomy" },
] as const;

const HEART_CANONICAL_ID = "ANAT_HEART_001";
const GALLBLADDER_CANONICAL_ID = "ANAT_GALLBLADDER_001";

export function demoAuthResponse(displayName: string, email: string) {
  return {
    token: `demo-token-${Date.now()}`,
    userId: "demo-user-1",
    displayName,
    email,
  };
}

const LEVEL_TITLES = ["Novice", "Apprentice", "Adept", "Scholar", "Authority"];

export function levelFromXp(totalXp: number): { level: number; xpToNextLevel: number; title: string } {
  const perLevel = 200;
  const level = Math.max(1, Math.floor(totalXp / perLevel) + 1);
  const xpToNextLevel = level * perLevel - totalXp;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, xpToNextLevel, title };
}

export function demoLeaderboard(myXp: number, myName: string) {
  const names = ["Amara K.", "Theo R.", "Priya S.", "Jonas M.", "Liu W.", "Fatima Z.", "Noah B.", "Elena V."];
  const entries = names.map((displayName, i) => ({
    rank: i + 1,
    displayName,
    xp: 4200 - i * 380,
    currentLevel: 10 - i,
    currentStreak: 22 - i * 2,
    university: null as string | null,
    isMe: false,
  }));
  const myEntry = {
    rank: entries.length + 1,
    displayName: myName,
    xp: myXp,
    currentLevel: levelFromXp(myXp).level,
    currentStreak: 0,
    university: null as string | null,
    isMe: true,
  };
  return [...entries, myEntry].sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));
}

const CURATED_PARTS: Record<string, { region: string; overview: string; system: string }> = {
  [HEART_CANONICAL_ID]: {
    region: "Mediastinum, chest cavity",
    overview:
      "A fist-sized muscular pump with four chambers, beating roughly 100,000 times a day to circulate blood through the body and lungs. Its own blood supply comes from the coronary arteries, which branch off the aorta almost immediately after it leaves the heart.",
    system: "cardiovascular",
  },
  [GALLBLADDER_CANONICAL_ID]: {
    region: "Right upper quadrant",
    overview:
      "A small, pear-shaped organ tucked beneath the liver. It stores and concentrates bile produced by the liver, releasing it into the duodenum to aid fat digestion.",
    system: "digestive",
  },
};

export function demoAnatomyPart(canonicalId: string) {
  const curated = CURATED_PARTS[canonicalId];
  const displayName = canonicalDisplayName(canonicalId);
  return {
    canonicalId,
    displayName,
    system: curated?.system ?? "digestive",
    region: curated?.region ?? "See system overview",
    overview:
      curated?.overview ??
      `The ${displayName.toLowerCase()} plays a key role in its system. A grounded, source-cited explanation for this structure is generated by the RAG pipeline in the full app.`,
    status: "PUBLISHED",
  };
}

export function demoAnatomyDiseases(canonicalId: string) {
  if (canonicalId === GALLBLADDER_CANONICAL_ID) {
    return [
      {
        canonicalId: "DIS_CHOLELITHIASIS_001",
        name: "Cholelithiasis",
        etymology: [{ part: "chole-", meaning: "bile" }, { part: "-lith-", meaning: "stone" }],
        commonness: "VERY_COMMON",
        category: "Digestive",
      },
    ];
  }
  if (canonicalId === HEART_CANONICAL_ID) {
    return [
      {
        canonicalId: "DIS_ARRHYTHMIA_001",
        name: "Arrhythmia",
        etymology: [{ part: "a-", meaning: "without" }, { part: "-rhythm-", meaning: "rhythm" }],
        commonness: "COMMON",
        category: "Cardiovascular",
      },
    ];
  }
  return [];
}

export function demoAnatomyMechanisms(canonicalId: string) {
  if (canonicalId === GALLBLADDER_CANONICAL_ID) {
    return [{ canonicalId: "MECH_BILE_SUPERSATURATION_001", name: "Bile supersaturation", description: "" }];
  }
  return [];
}

export function demoAnatomyCases(canonicalId: string) {
  if (canonicalId === HEART_CANONICAL_ID) {
    return [
      { caseId: "MC_HEART_001", title: "The Marathon Runner", subtitle: "A 34-year-old collapses near the finish line", difficulty: "medium", xpReward: 100 },
    ];
  }
  return [];
}

const BACKGROUND_VOICE: Record<UserBackground, string> = {
  curious_adult:
    "Here's something worth knowing: {name} comes from a word that literally means what it does. Once you see the root, the whole structure clicks into place.",
  med_student:
    "{name} is clinically significant because of its relationships to adjacent structures and its role in several common presentations you'll be tested on.",
  fitness:
    "{name} adapts under training load — understanding how it responds to stress is the difference between training smart and training blind.",
  health_scare:
    "{name} usually just does its job quietly. Most changes here are benign and easily explained — understanding the normal function is often the most reassuring thing you can learn.",
};

export function demoAdaptiveExplanation(structureId: string, userBackground: UserBackground) {
  const name = canonicalDisplayName(structureId) || "This structure";
  const template = BACKGROUND_VOICE[userBackground] ?? BACKGROUND_VOICE.curious_adult;
  return {
    adaptedText: template.replace(/\{name\}/g, name),
    ahaFact: `"${name}" traces back further than you'd expect — etymology is the fastest way to make anatomy stick.`,
    citations: [{ title: "Gray's Anatomy, 42nd ed.", sourceType: "textbook", jurisdiction: null, freshness: "2024" }],
    userBackgroundApplied: userBackground,
  };
}

export function demoGroundedExplanation(structureId: string) {
  const name = canonicalDisplayName(structureId) || "This structure";
  return {
    explanationText: `${name} is described here using clinically grounded, source-cited text. In demo mode this is a placeholder — the live app retrieves this from NICE, MedlinePlus, PubMed, and other approved sources.`,
    citedClaimIds: ["CLAIM_DEMO_1"],
    citedChunkIds: ["CHUNK_DEMO_1"],
    citedSources: [{ title: "NHS overview", sourceType: "guideline", jurisdiction: "UK", freshness: "2025" }],
    confidenceLabel: "HIGH",
    contradictionNotice: null,
  };
}
