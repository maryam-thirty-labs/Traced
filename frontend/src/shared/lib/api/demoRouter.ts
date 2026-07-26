// Routes requests to canned fixtures when demo mode is on, so the frontend
// can run as a static Vercel deploy with no core-service or intelligence-service.
import { getDemoState, updateDemoState } from "./demoState";
import {
  DEMO_ROOTS,
  demoAdaptiveExplanation,
  demoAnatomyCases,
  demoAnatomyDiseases,
  demoAnatomyMechanisms,
  demoAnatomyPart,
  demoAuthResponse,
  demoGroundedExplanation,
  demoLeaderboard,
  levelFromXp,
} from "./demoFixtures";
import type { UserBackground } from "@/shared/lib/auth/auth";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const DEMO_CASE = {
  caseId: "MC_HEART_001",
  title: "The Marathon Runner",
  subtitle: "A 34-year-old collapses near the finish line",
  difficulty: "MEDIUM" as const,
  xpReward: 100,
  linkedAnatomyId: "ANAT_HEART_001",
  vignette: {
    patientAge: 34,
    patientSex: "male",
    presentingComplaint: "Collapse and palpitations near the finish line of a marathon",
    fullVignetteText:
      "A 34-year-old man collapses 200 metres from the finish line. He is conscious but reports his heart 'fluttering' before he went down. He has no prior cardiac history.",
  },
  clues: [
    { clueType: "vital", label: "Heart rate", value: "182 bpm, irregular", isAbnormal: true, displayOrder: 1 },
    { clueType: "vital", label: "Blood pressure", value: "98/62 mmHg", isAbnormal: true, displayOrder: 2 },
    { clueType: "history", label: "Prior episodes", value: "None reported", isAbnormal: false, displayOrder: 3 },
  ],
  questions: [
    {
      questionId: "Q1",
      stepNumber: 1,
      questionText: "Which structure is most likely responsible for this irregular rhythm?",
      questionType: "single_choice",
      options: [
        { optionKey: "A", optionText: "Sinoatrial node" },
        { optionKey: "B", optionText: "Femur" },
        { optionKey: "C", optionText: "Gallbladder" },
      ],
    },
  ],
};

function parsePath(path: string): { base: string; query: URLSearchParams } {
  const [base, qs] = path.split("?");
  return { base, query: new URLSearchParams(qs ?? "") };
}

function matchStructureId(base: string, prefix: string, suffix = ""): string | null {
  if (!base.startsWith(prefix)) return null;
  const rest = base.slice(prefix.length);
  if (suffix) {
    if (!rest.endsWith(suffix)) return null;
    return rest.slice(0, -suffix.length);
  }
  return rest;
}

export function tryResolveDemoRequest(
  method: Method,
  path: string,
  body: unknown,
): { handled: true; data: unknown } | { handled: false } {
  const { base, query } = parsePath(path);
  const state = getDemoState();
  const b = (body ?? {}) as Record<string, unknown>;

  // --- Auth ---
  if (method === "POST" && base === "/api/auth/login") {
    const email = typeof b.email === "string" ? b.email : state.email;
    return { handled: true, data: demoAuthResponse(state.displayName, email) };
  }
  if (method === "POST" && base === "/api/auth/register") {
    const displayName = typeof b.displayName === "string" ? b.displayName : state.displayName;
    const email = typeof b.email === "string" ? b.email : state.email;
    updateDemoState({ displayName, email });
    return { handled: true, data: demoAuthResponse(displayName, email) };
  }
  if (method === "GET" && base === "/api/auth/me") {
    return {
      handled: true,
      data: {
        userId: "demo-user-1",
        displayName: state.displayName,
        email: state.email,
        learning_activated: state.learningActivated,
        account_mode: "free",
        background: state.background,
      },
    };
  }

  // --- Learning loop ---
  if (method === "GET" && base === "/api/learning/next-action") {
    const nextRoot = DEMO_ROOTS.find((r) => !state.collectedRootIds.includes(r.id)) ?? DEMO_ROOTS[0];
    return {
      handled: true,
      data: {
        lessonAvailableToday: !state.lessonCompletedToday,
        lessonCompleted: state.lessonCompletedToday,
        streakDays: state.streakDays,
        nextRootPreview: { root: nextRoot.root, origin: nextRoot.origin, meaning: nextRoot.meaning },
        currentSystemId: "cardiovascular",
        exploredStructureIds: state.exploredCanonicalIds,
        exploredCanonicalIds: state.exploredCanonicalIds,
        onboardingCompleted: state.learningActivated,
      },
    };
  }
  {
    const structureId = matchStructureId(base, "/api/learning/structures/", "/explored");
    if (method === "POST" && structureId) {
      const wasFirst = !state.learningActivated;
      const exploredCanonicalIds = state.exploredCanonicalIds.includes(structureId)
        ? state.exploredCanonicalIds
        : [...state.exploredCanonicalIds, structureId];
      updateDemoState({ exploredCanonicalIds, learningActivated: true });
      return { handled: true, data: { firstTime: wasFirst } };
    }
  }

  // --- Lessons ---
  if (method === "GET" && base === "/api/lessons/today") {
    return {
      handled: true,
      data: {
        lessonId: state.lessonCompletedToday ? null : "demo-lesson-1",
        lessonDate: new Date().toISOString().slice(0, 10),
        completed: state.lessonCompletedToday,
        retrieval: [
          {
            structureId: "ANAT_HEART_001",
            canonicalId: "ANAT_HEART_001",
            displayName: "Heart",
            options: [
              { text: "Pumps blood through the body", correct: true },
              { text: "Filters waste from blood", correct: false },
            ],
            displayOrder: 1,
          },
        ],
        explore: {
          structureId: "ANAT_GALLBLADDER_001",
          canonicalId: "ANAT_GALLBLADDER_001",
          displayName: "Gallbladder",
          system: "digestive",
          etymologyRootId: "ROOT_CHOLE",
          etymologyPreviewRoot: "chole-",
        },
        expectedXp: 50,
      },
    };
  }
  if (method === "POST" && base === "/api/lessons/today/complete") {
    const wasFirst = !state.learningActivated;
    const newXp = state.totalXp + 50;
    const streakDays = state.streakDays + 1;
    updateDemoState({
      totalXp: newXp,
      streakDays,
      lessonCompletedToday: true,
      learningActivated: true,
    });
    return {
      handled: true,
      data: {
        xpAwarded: 50,
        newXp,
        streakDays,
        etymologyRootId: "ROOT_CHOLE",
        onboardingCompleted: wasFirst,
      },
    };
  }

  // --- Etymology garden ---
  if (method === "GET" && base === "/api/etymology/garden") {
    const roots = DEMO_ROOTS.map((r) => ({
      id: r.id,
      root: r.root,
      origin: r.origin,
      meaning: r.meaning,
      exampleStructures: [...r.exampleStructures],
      exampleUsage: r.exampleUsage,
      collected: state.collectedRootIds.includes(r.id),
      collectedAt: state.collectedRootIds.includes(r.id) ? new Date().toISOString() : null,
    }));
    return {
      handled: true,
      data: { totalRoots: 500, collected: state.collectedRootIds.length, roots },
    };
  }
  {
    const rootId = matchStructureId(base, "/api/etymology/", "/collect");
    if (method === "POST" && rootId) {
      const firstTime = !state.collectedRootIds.includes(rootId);
      updateDemoState({ collectedRootIds: [...new Set([...state.collectedRootIds, rootId])] });
      return { handled: true, data: { collected: true, firstTime } };
    }
  }

  // --- Profile / progression ---
  if (method === "GET" && base === "/api/profile/me") {
    const { level, title } = levelFromXp(state.totalXp);
    return {
      handled: true,
      data: {
        displayName: state.displayName,
        totalXp: state.totalXp,
        currentLevel: level,
        levelTitle: title,
        currentStreak: state.streakDays,
        unlockedSystems: ["cardiovascular", "digestive"],
        etymologyEnabled: true,
        university: null,
      },
    };
  }
  if (method === "GET" && base === "/api/profile/me/progress") {
    const { level, xpToNextLevel } = levelFromXp(state.totalXp);
    return {
      handled: true,
      data: {
        totalXp: state.totalXp,
        currentLevel: level,
        xpToNextLevel,
        masteryRecords: [
          { systemCanonicalId: "cardiovascular", masteryPct: 40, casesAttempted: 1, casesCorrect: 1 },
          { systemCanonicalId: "digestive", masteryPct: 15, casesAttempted: 0, casesCorrect: 0 },
        ],
        recentAttempts: [],
        suggestedNext: "Explore the Gallbladder to unlock chole-",
      },
    };
  }
  if (method === "PATCH" && base === "/api/profile/me/preferences") {
    return { handled: true, data: null };
  }
  if (method === "DELETE" && base === "/api/profile/me/progress") {
    updateDemoState({
      learningActivated: false,
      streakDays: 0,
      totalXp: 0,
      lessonCompletedToday: false,
      exploredCanonicalIds: [],
      collectedRootIds: [],
    });
    return { handled: true, data: null };
  }
  if (method === "GET" && base === "/api/profile/me/friends") {
    return { handled: true, data: [] };
  }

  // --- Leaderboard ---
  if (method === "GET" && base.startsWith("/api/leaderboard/global")) {
    return { handled: true, data: demoLeaderboard(state.totalXp, state.displayName) };
  }
  if (method === "GET" && base.startsWith("/api/leaderboard/university")) {
    return { handled: true, data: [] };
  }
  if (method === "GET" && base.startsWith("/api/leaderboard/friends")) {
    return { handled: true, data: [] };
  }
  if (method === "GET" && base.startsWith("/api/leaderboard/me")) {
    const board = demoLeaderboard(state.totalXp, state.displayName);
    const meIndex = board.findIndex((e) => e.isMe);
    return {
      handled: true,
      data: { me: board[meIndex] ?? null, surrounding: board.slice(Math.max(0, meIndex - 1), meIndex + 2) },
    };
  }

  // --- Anatomy ---
  {
    const id = matchStructureId(base, "/api/anatomy/parts/", "/diseases");
    if (method === "GET" && id) return { handled: true, data: demoAnatomyDiseases(id) };
  }
  {
    const id = matchStructureId(base, "/api/anatomy/parts/", "/mechanisms");
    if (method === "GET" && id) return { handled: true, data: demoAnatomyMechanisms(id) };
  }
  {
    const id = matchStructureId(base, "/api/anatomy/parts/", "/cases");
    if (method === "GET" && id) return { handled: true, data: demoAnatomyCases(id) };
  }
  {
    const id = matchStructureId(base, "/api/anatomy/parts/");
    if (method === "GET" && id && !id.includes("/")) return { handled: true, data: demoAnatomyPart(id) };
  }

  // --- Explanations ---
  if (method === "POST" && base === "/api/intelligence/explanations/adaptive") {
    const structureId = typeof b.structureId === "string" ? b.structureId : "";
    const userBackground = (typeof b.userBackground === "string" ? b.userBackground : "curious_adult") as UserBackground;
    return { handled: true, data: demoAdaptiveExplanation(structureId, userBackground) };
  }
  if (method === "POST" && (base === "/api/explanations/anatomy" || base === "/api/explanations/speciality")) {
    const structureId = typeof b.canonicalId === "string" ? b.canonicalId : typeof b.anatomyPartCanonicalId === "string" ? b.anatomyPartCanonicalId : "";
    return { handled: true, data: demoGroundedExplanation(structureId) };
  }

  // --- Cases ---
  if (method === "GET" && base === "/api/cases/weekly") {
    const currentStreak = state.streakDays;
    return {
      handled: true,
      data: { available: currentStreak >= 3, streakRequired: 3, currentStreak, caseDetail: currentStreak >= 3 ? DEMO_CASE : null },
    };
  }
  {
    const caseId = matchStructureId(base, "/api/cases/", "/submit");
    if (method === "POST" && caseId) {
      const newXp = state.totalXp + DEMO_CASE.xpReward;
      updateDemoState({ totalXp: newXp });
      const { level } = levelFromXp(newXp);
      return {
        handled: true,
        data: { outcome: "CORRECT", score: 100, xpAwarded: DEMO_CASE.xpReward, currentLevel: level, totalXp: newXp, correctCount: 1, totalQuestions: 1 },
      };
    }
  }
  if (method === "GET" && base === "/api/cases") {
    return { handled: true, data: { content: [DEMO_CASE], totalElements: 1, totalPages: 1, number: 0 } };
  }
  {
    const caseId = matchStructureId(base, "/api/cases/");
    if (method === "GET" && caseId && caseId === DEMO_CASE.caseId) {
      return { handled: true, data: DEMO_CASE };
    }
  }

  // --- Specialities ---
  if (method === "GET" && base === "/api/specialities") {
    return {
      handled: true,
      data: [
        { canonicalId: "SPEC_CARDIOLOGY", name: "cardiology", displayName: "Cardiology", focusDescription: "Heart and vascular focus" },
      ],
    };
  }
  {
    const id = matchStructureId(base, "/api/specialities/");
    if (method === "GET" && id) {
      return {
        handled: true,
        data: {
          canonicalId: id,
          name: "cardiology",
          displayName: "Cardiology",
          focusDescription: "Heart and vascular focus",
          focusAnatomy: [
            {
              anatomyCanonicalId: "ANAT_HEART_001",
              displayName: "Heart",
              focusReason: "Primary organ of interest",
              clinicalRelevance: "Central to most cardiology presentations",
            },
          ],
        },
      };
    }
  }

  // --- Notifications (no-op in demo) ---
  if (method === "POST" && (base === "/api/notifications/subscribe" || base === "/api/notifications/unsubscribe")) {
    return { handled: true, data: null };
  }

  return { handled: false };
}
