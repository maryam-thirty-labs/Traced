export type AnatomySystem =
  | "digestive" | "skeletal" | "nervous"
  | "vascular" | "muscular" | "respiratory" | "cardiovascular"

export type BodyView = "front" | "back"

export type AnatomySelectionState = {
  selectedSystem: AnatomySystem
  selectedView: BodyView
  selectedCanonicalId: string | null
}

export type AnatomyPartDto = {
  canonicalId: string
  displayName: string
  system: AnatomySystem
  region: string
  overview: string
  diseases: Array<{
    canonicalId: string
    name: string
    etymology: Array<{ part: string; meaning: string }>
    plainEnglish: string
    commonness: "VERY_COMMON" | "COMMON" | "LESS_COMMON" | "RARE"
    mechanismNames: string[]
  }>
  mechanisms: Array<{ canonicalId: string; name: string }>
  aliases: Array<{ canonical: string; alternatives: string[] }>
  cases: Array<{
    caseId: string
    title: string
    subtitle: string
    difficulty: "easy" | "medium" | "hard"
    xpReward: number
  }>
}
