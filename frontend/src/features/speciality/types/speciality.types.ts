export type Speciality = {
  canonicalId: string;
  name: string;
  displayName: string;
  focusDescription: string;
};

export type FocusAnatomy = {
  anatomyCanonicalId: string;
  displayName: string;
  focusReason: string;
  clinicalRelevance: string;
};

export type SpecialityDetail = Speciality & {
  focusAnatomy: FocusAnatomy[];
};
