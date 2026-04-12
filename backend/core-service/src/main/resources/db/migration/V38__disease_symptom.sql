CREATE TABLE IF NOT EXISTS disease_symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_id UUID NOT NULL REFERENCES diseases(id) ON DELETE CASCADE,
    symptom_name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    CONSTRAINT disease_symptom_severity_chk
      CHECK (severity IN ('CARDINAL', 'COMMON', 'VARIABLE'))
);

CREATE INDEX IF NOT EXISTS idx_disease_symptoms_disease_id
  ON disease_symptoms(disease_id);

-- Seed symptoms for Cholelithiasis
INSERT INTO disease_symptoms (disease_id, symptom_name, description, severity, emoji, display_order)
SELECT d.id, v.symptom_name, v.description, v.severity, v.emoji, v.display_order
FROM diseases d
CROSS JOIN (VALUES
    ('Biliary colic', 'Severe, steady right upper quadrant or epigastric pain lasting 30 minutes to hours, often after a fatty meal.', 'CARDINAL', E'\U0001F525', 1),
    ('Nausea and vomiting', 'Frequently accompanies colic episodes; may be triggered by fatty food intake.', 'COMMON', E'\U0001F922', 2),
    ('Bloating and indigestion', 'Non-specific upper abdominal discomfort and fullness after meals.', 'VARIABLE', E'\U0001F32C', 3),
    ('Referred shoulder pain', 'Pain radiating to the right shoulder or scapular tip due to diaphragmatic irritation.', 'VARIABLE', E'\U0001F4A2', 4)
) AS v(symptom_name, description, severity, emoji, display_order)
WHERE d.canonical_id = 'DIS_CHOLELITHIASIS_001'
  AND NOT EXISTS (
    SELECT 1 FROM disease_symptoms s
    WHERE s.disease_id = d.id AND s.symptom_name = v.symptom_name
  );

-- Seed symptoms for Cholecystitis
INSERT INTO disease_symptoms (disease_id, symptom_name, description, severity, emoji, display_order)
SELECT d.id, v.symptom_name, v.description, v.severity, v.emoji, v.display_order
FROM diseases d
CROSS JOIN (VALUES
    ('Right upper quadrant pain', 'Constant severe pain in the right upper abdomen, often worsening over hours and not relieved by rest.', 'CARDINAL', E'\U0001F525', 1),
    ('Fever', 'Low-grade to moderate fever indicating inflammation or secondary infection.', 'CARDINAL', E'\U0001F321', 2),
    ('Positive Murphy sign', 'Arrest of inspiration during deep palpation under the right costal margin due to tenderness.', 'COMMON', E'\U0001FA7A', 3),
    ('Nausea and vomiting', 'Common accompanying gastrointestinal symptoms during acute attacks.', 'COMMON', E'\U0001F922', 4)
) AS v(symptom_name, description, severity, emoji, display_order)
WHERE d.canonical_id = 'DIS_CHOLECYSTITIS_001'
  AND NOT EXISTS (
    SELECT 1 FROM disease_symptoms s
    WHERE s.disease_id = d.id AND s.symptom_name = v.symptom_name
  );
