import type { AnatomyPartDto } from "../types/anatomy.types";

export const gallbladderMock: AnatomyPartDto = {
  canonicalId: "ANAT_GALLBLADDER_001",
  displayName: "Gallbladder",
  system: "digestive",
  region: "Right upper quadrant",
  overview:
    "A small, pear-shaped organ tucked beneath the liver. It stores and concentrates bile produced by the liver, releasing it into the duodenum to aid fat digestion. Problems arise when bile composition changes or the cystic duct becomes blocked.",
  diseases: [
    {
      canonicalId: "DIS_CHOLELITHIASIS_001",
      name: "Cholelithiasis",
      etymology: [
        { part: "chole-", meaning: "bile" },
        { part: "-lith-", meaning: "stone" },
        { part: "-iasis", meaning: "condition" },
      ],
      plainEnglish: "Gallstones — hardened deposits of bile in the gallbladder",
      commonness: "VERY_COMMON",
      mechanismNames: ["Bile supersaturation", "Gallbladder hypomotility"],
    },
    {
      canonicalId: "DIS_CHOLECYSTITIS_001",
      name: "Cholecystitis",
      etymology: [
        { part: "chole-", meaning: "bile" },
        { part: "-cyst-", meaning: "bladder" },
        { part: "-itis", meaning: "inflammation" },
      ],
      plainEnglish: "Inflammation of the gallbladder, usually from a trapped gallstone",
      commonness: "COMMON",
      mechanismNames: ["Cystic duct obstruction"],
    },
    {
      canonicalId: "DIS_CHOLANGITIS_001",
      name: "Cholangitis",
      etymology: [
        { part: "chol-", meaning: "bile" },
        { part: "-angi-", meaning: "vessel" },
        { part: "-itis", meaning: "inflammation" },
      ],
      plainEnglish: "Infection of the bile ducts, often caused by an obstructing stone",
      commonness: "LESS_COMMON",
      mechanismNames: ["Bile duct obstruction", "Bacterial ascent"],
    },
  ],
  mechanisms: [
    { canonicalId: "MECH_BILE_SUPERSATURATION_001", name: "Bile supersaturation" },
    { canonicalId: "MECH_CYSTIC_DUCT_OBSTRUCTION_001", name: "Cystic duct obstruction" },
  ],
  aliases: [
    { canonical: "Gallbladder", alternatives: ["Vesica biliaris", "Cholecyst"] },
    { canonical: "Cystic duct", alternatives: ["Ductus cysticus"] },
  ],
  cases: [
    {
      caseId: "MC_GALLBLADDER_001",
      title: "The Holiday Feast",
      subtitle: "A 42-year-old woman presents with sudden right upper quadrant pain after dinner",
      difficulty: "easy",
      xpReward: 50,
    },
    {
      caseId: "MC_GALLBLADDER_002",
      title: "The Recurring Ache",
      subtitle: "A 55-year-old man reports intermittent postprandial discomfort over three months",
      difficulty: "medium",
      xpReward: 100,
    },
    {
      caseId: "MC_GALLBLADDER_003",
      title: "Fever and Jaundice",
      subtitle: "A 68-year-old presents with Charcot's triad after a recent procedure",
      difficulty: "hard",
      xpReward: 150,
    },
  ],
};
