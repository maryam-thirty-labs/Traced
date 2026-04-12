CREATE TABLE IF NOT EXISTS disease_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    investigation_name VARCHAR(200) NOT NULL,
    rationale TEXT NOT NULL,
    display_order INT NOT NULL,
    CONSTRAINT disease_investigation_order_unique UNIQUE (disease_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_disease_investigations_disease_id
  ON disease_investigations(disease_id);

-- Seed investigations for Cholelithiasis
INSERT INTO disease_investigations (disease_id, investigation_name, rationale, display_order)
SELECT d.id, v.investigation_name, v.rationale, v.display_order
FROM diseases d
CROSS JOIN (VALUES
    ('Abdominal ultrasound', 'First-line imaging to detect gallstones; high sensitivity and specificity, non-invasive, no radiation.', 1),
    ('Liver function tests', 'Screens for biliary obstruction; elevated ALP and bilirubin suggest a stone in the common bile duct.', 2),
    ('MRCP', 'Non-invasive detailed imaging of the biliary tree when common bile duct stones are suspected but ultrasound is inconclusive.', 3)
) AS v(investigation_name, rationale, display_order)
WHERE d.canonical_id = 'DIS_CHOLELITHIASIS_001'
  AND NOT EXISTS (
    SELECT 1 FROM disease_investigations i
    WHERE i.disease_id = d.id AND i.display_order = v.display_order
  );

-- Seed investigations for Cholecystitis
INSERT INTO disease_investigations (disease_id, investigation_name, rationale, display_order)
SELECT d.id, v.investigation_name, v.rationale, v.display_order
FROM diseases d
CROSS JOIN (VALUES
    ('Abdominal ultrasound', 'Shows gallbladder wall thickening, pericholecystic fluid, and a sonographic Murphy sign — key diagnostic features.', 1),
    ('Full blood count and CRP', 'Leukocytosis and raised CRP support the diagnosis of acute inflammation.', 2),
    ('HIDA scan', 'Used when ultrasound is equivocal; non-visualisation of the gallbladder indicates cystic duct obstruction.', 3)
) AS v(investigation_name, rationale, display_order)
WHERE d.canonical_id = 'DIS_CHOLECYSTITIS_001'
  AND NOT EXISTS (
    SELECT 1 FROM disease_investigations i
    WHERE i.disease_id = d.id AND i.display_order = v.display_order
  );
