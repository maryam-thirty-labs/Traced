-- ============================================================
-- Sprint 2C.1 — Body systems seed (7 systems)
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO body_systems (canonical_id, name, display_order, status) VALUES
  ('SYS_DIGESTIVE_001',      'Digestive',      1, 'ACTIVE'),
  ('SYS_SKELETAL_001',       'Skeletal',        2, 'ACTIVE'),
  ('SYS_CARDIOVASCULAR_001', 'Cardiovascular',  3, 'ACTIVE'),
  ('SYS_NERVOUS_001',        'Nervous',         4, 'ACTIVE'),
  ('SYS_RESPIRATORY_001',    'Respiratory',     5, 'ACTIVE'),
  ('SYS_MUSCULAR_001',       'Muscular',        6, 'ACTIVE'),
  ('SYS_VASCULAR_001',       'Vascular',        7, 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- ============================================================
-- Sprint 2C.2 — Hepatobiliary anatomy parts + synonyms
-- 5 digestive parts, ≥2 synonyms for gallbladder
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO anatomy_parts (canonical_id, display_name, system_id, region, overview, status) VALUES
  ('ANAT_GALLBLADDER_001', 'Gallbladder',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_DIGESTIVE_001'),
    'Right upper quadrant',
    'A small, pear-shaped organ tucked beneath the liver. It stores and concentrates bile produced by the liver, releasing it into the duodenum to aid fat digestion. Problems arise when bile composition changes or the cystic duct becomes blocked.',
    'ACTIVE'),
  ('ANAT_LIVER_001', 'Liver',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_DIGESTIVE_001'),
    'Right upper quadrant',
    'The largest solid organ in the body, responsible for bile production, detoxification, protein synthesis, and glycogen storage.',
    'ACTIVE'),
  ('ANAT_PANCREAS_001', 'Pancreas',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_DIGESTIVE_001'),
    'Retroperitoneal',
    'A dual-function gland producing digestive enzymes (exocrine) and hormones including insulin and glucagon (endocrine).',
    'ACTIVE'),
  ('ANAT_STOMACH_001', 'Stomach',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_DIGESTIVE_001'),
    'Left upper quadrant',
    'A muscular organ that receives food from the esophagus and begins chemical digestion with hydrochloric acid and pepsin.',
    'ACTIVE'),
  ('ANAT_COLON_001', 'Colon',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_DIGESTIVE_001'),
    'Abdominal cavity',
    'The large intestine, responsible for water absorption and formation of faeces from indigestible food matter.',
    'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- Gallbladder synonyms
INSERT INTO anatomy_synonyms (anatomy_part_id, synonym, synonym_type)
SELECT ap.id, v.synonym, v.synonym_type
FROM anatomy_parts ap
CROSS JOIN (VALUES
  ('Vesica biliaris', 'LATIN'),
  ('Cholecyst', 'COMMON'),
  ('GB', 'ABBREVIATION')
) AS v(synonym, synonym_type)
WHERE ap.canonical_id = 'ANAT_GALLBLADDER_001'
  AND NOT EXISTS (
    SELECT 1 FROM anatomy_synonyms s
    WHERE s.anatomy_part_id = ap.id AND s.synonym = v.synonym
  );

-- Liver synonyms
INSERT INTO anatomy_synonyms (anatomy_part_id, synonym, synonym_type)
SELECT ap.id, v.synonym, v.synonym_type
FROM anatomy_parts ap
CROSS JOIN (VALUES
  ('Hepar', 'LATIN'),
  ('Hepatic organ', 'COMMON')
) AS v(synonym, synonym_type)
WHERE ap.canonical_id = 'ANAT_LIVER_001'
  AND NOT EXISTS (
    SELECT 1 FROM anatomy_synonyms s
    WHERE s.anatomy_part_id = ap.id AND s.synonym = v.synonym
  );
