-- Add overview prose column to diseases for the full-page Overview tab
ALTER TABLE diseases
  ADD COLUMN IF NOT EXISTS overview TEXT;

UPDATE diseases
SET overview = 'Cholelithiasis is the presence of hardened deposits (gallstones) in the gallbladder. Stones form when bile becomes supersaturated with cholesterol or bilirubin and crystallises. Many patients remain asymptomatic; when a stone obstructs the cystic duct, pain and inflammation follow.'
WHERE canonical_id = 'DIS_CHOLELITHIASIS_001' AND overview IS NULL;

UPDATE diseases
SET overview = 'Cholecystitis is inflammation of the gallbladder, most often triggered when a gallstone obstructs the cystic duct. Bile accumulates, the wall distends, and secondary bacterial infection may follow. It presents with right upper quadrant pain, fever, and a positive Murphy sign.'
WHERE canonical_id = 'DIS_CHOLECYSTITIS_001' AND overview IS NULL;

UPDATE diseases
SET overview = 'Cholangitis is inflammation of the bile duct system, usually caused by bacterial infection superimposed on biliary obstruction. The classic Charcot triad is fever, jaundice, and right upper quadrant pain. Prompt biliary drainage is the definitive treatment.'
WHERE canonical_id = 'DIS_CHOLANGITIS_001' AND overview IS NULL;
