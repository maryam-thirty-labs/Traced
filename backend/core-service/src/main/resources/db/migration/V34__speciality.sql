CREATE TABLE specialities (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_id       VARCHAR(100) NOT NULL UNIQUE,
    name               VARCHAR(255) NOT NULL,
    display_name       VARCHAR(255) NOT NULL,
    focus_description  TEXT,
    status             VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
);

INSERT INTO specialities (canonical_id, name, display_name, focus_description) VALUES
  ('SPEC_GENERAL_SURGERY_001', 'general_surgery', 'General Surgery',
    'Surgical management of the abdomen, gastrointestinal tract, and hepatobiliary system.'),
  ('SPEC_GASTROENTEROLOGY_001', 'gastroenterology', 'Gastroenterology',
    'Medical management of the digestive tract, liver, pancreas, and biliary system.'),
  ('SPEC_CARDIOLOGY_001', 'cardiology', 'Cardiology',
    'Heart and cardiovascular system, including valvular disease, arrhythmia, and coronary disease.'),
  ('SPEC_RADIOLOGY_001', 'radiology', 'Radiology',
    'Imaging-based diagnosis across all systems with imaging-guided interventions.'),
  ('SPEC_ORTHOPAEDICS_001', 'orthopaedics', 'Orthopaedics',
    'Musculoskeletal system, fractures, joints, and sports injury.'),
  ('SPEC_NEUROLOGY_001', 'neurology', 'Neurology',
    'Nervous system disorders including stroke, epilepsy, and neurodegenerative disease.')
ON CONFLICT (canonical_id) DO NOTHING;
