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

-- ============================================================
-- Sprint 2C.3 — Hepatobiliary disease seed + aliases
-- 3 diseases with etymology, 2 aliases for cholelithiasis
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO diseases (canonical_id, name, etymology_json, commonness, category, status) VALUES
  ('DIS_CHOLELITHIASIS_001', 'Cholelithiasis',
    '[{"part":"chole-","meaning":"bile"},{"part":"-lith-","meaning":"stone"},{"part":"-iasis","meaning":"condition"}]',
    'VERY_COMMON', 'Hepatobiliary', 'ACTIVE'),
  ('DIS_CHOLECYSTITIS_001', 'Cholecystitis',
    '[{"part":"chole-","meaning":"bile"},{"part":"-cyst-","meaning":"bladder"},{"part":"-itis","meaning":"inflammation"}]',
    'COMMON', 'Hepatobiliary', 'ACTIVE'),
  ('DIS_CHOLANGITIS_001', 'Cholangitis',
    '[{"part":"chol-","meaning":"bile"},{"part":"-angi-","meaning":"vessel"},{"part":"-itis","meaning":"inflammation"}]',
    'LESS_COMMON', 'Hepatobiliary', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- Cholelithiasis aliases
INSERT INTO disease_aliases (disease_id, alias, alias_type)
SELECT d.id, v.alias, v.alias_type
FROM diseases d
CROSS JOIN (VALUES
  ('Gallstones', 'LAYPERSON'),
  ('Biliary calculi', 'SYNONYM')
) AS v(alias, alias_type)
WHERE d.canonical_id = 'DIS_CHOLELITHIASIS_001'
  AND NOT EXISTS (
    SELECT 1 FROM disease_aliases a
    WHERE a.disease_id = d.id AND a.alias = v.alias
  );

-- Cholecystitis alias
INSERT INTO disease_aliases (disease_id, alias, alias_type)
SELECT d.id, v.alias, v.alias_type
FROM diseases d
CROSS JOIN (VALUES
  ('Gallbladder inflammation', 'LAYPERSON')
) AS v(alias, alias_type)
WHERE d.canonical_id = 'DIS_CHOLECYSTITIS_001'
  AND NOT EXISTS (
    SELECT 1 FROM disease_aliases a
    WHERE a.disease_id = d.id AND a.alias = v.alias
  );

-- ============================================================
-- Sprint 2C.4 — Mechanism seed (7 mechanisms)
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO mechanisms (canonical_id, name, description, status) VALUES
  ('MECH_BILE_SUPERSATURATION_001',   'Bile supersaturation',       'Excess cholesterol or reduced bile salts cause crystallisation in gallbladder bile.', 'ACTIVE'),
  ('MECH_GALLBLADDER_HYPOMOTILITY_001','Gallbladder hypomotility',  'Reduced gallbladder contraction leads to bile stasis and stone nucleation.',         'ACTIVE'),
  ('MECH_CYSTIC_DUCT_OBSTRUCTION_001','Cystic duct obstruction',   'A gallstone lodges in the cystic duct, blocking bile outflow and triggering inflammation.', 'ACTIVE'),
  ('MECH_BILE_DUCT_OBSTRUCTION_001',  'Bile duct obstruction',     'A stone migrates into the common bile duct, causing upstream pressure and jaundice.', 'ACTIVE'),
  ('MECH_BACTERIAL_ASCENT_001',       'Bacterial ascent',          'Bacteria ascend from the duodenum into an obstructed bile duct, causing infection.', 'ACTIVE'),
  ('MECH_MUCOSAL_INFLAMMATION_001',   'Mucosal inflammation',      'Trapped bile acids damage the gallbladder mucosa, triggering an inflammatory cascade.', 'ACTIVE'),
  ('MECH_PROSTAGLANDIN_RELEASE_001',  'Prostaglandin release',     'Mucosal injury triggers prostaglandin synthesis, increasing fluid secretion and wall distension.', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- ============================================================
-- Sprint 2C.5 — Treatment seed (5 treatments)
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

INSERT INTO treatments (canonical_id, name, treatment_class, status) VALUES
  ('TRT_CHOLECYSTECTOMY_001',    'Cholecystectomy',              'Surgical',       'ACTIVE'),
  ('TRT_URSODIOL_001',           'Ursodiol',                     'Pharmacological', 'ACTIVE'),
  ('TRT_ERCP_001',               'ERCP',                         'Procedural',     'ACTIVE'),
  ('TRT_ANTIBIOTICS_BILIARY_001','Antibiotics (biliary)',        'Pharmacological', 'ACTIVE'),
  ('TRT_ANALGESICS_001',         'Analgesics',                   'Pharmacological', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- ============================================================
-- Sprint 2C.6 — Relation seed
-- anatomy↔disease, disease↔mechanism, disease↔treatment
-- Idempotent: ON CONFLICT DO NOTHING
-- ============================================================

-- Anatomy ↔ Disease relations (gallbladder → 3 diseases)
INSERT INTO anatomy_disease_relations (anatomy_part_id, disease_id, relation_strength)
SELECT ap.id, d.id, v.strength
FROM (VALUES
  ('ANAT_GALLBLADDER_001', 'DIS_CHOLELITHIASIS_001', 'PRIMARY'),
  ('ANAT_GALLBLADDER_001', 'DIS_CHOLECYSTITIS_001',  'PRIMARY'),
  ('ANAT_GALLBLADDER_001', 'DIS_CHOLANGITIS_001',    'SECONDARY'),
  ('ANAT_LIVER_001',       'DIS_CHOLANGITIS_001',    'SECONDARY')
) AS v(anat_cid, dis_cid, strength)
JOIN anatomy_parts ap ON ap.canonical_id = v.anat_cid
JOIN diseases d ON d.canonical_id = v.dis_cid
ON CONFLICT (anatomy_part_id, disease_id) DO NOTHING;

-- Disease ↔ Mechanism relations
INSERT INTO disease_mechanism_relations (disease_id, mechanism_id)
SELECT d.id, m.id
FROM (VALUES
  ('DIS_CHOLELITHIASIS_001', 'MECH_BILE_SUPERSATURATION_001'),
  ('DIS_CHOLELITHIASIS_001', 'MECH_GALLBLADDER_HYPOMOTILITY_001'),
  ('DIS_CHOLECYSTITIS_001',  'MECH_CYSTIC_DUCT_OBSTRUCTION_001'),
  ('DIS_CHOLECYSTITIS_001',  'MECH_MUCOSAL_INFLAMMATION_001'),
  ('DIS_CHOLECYSTITIS_001',  'MECH_PROSTAGLANDIN_RELEASE_001'),
  ('DIS_CHOLANGITIS_001',    'MECH_BILE_DUCT_OBSTRUCTION_001'),
  ('DIS_CHOLANGITIS_001',    'MECH_BACTERIAL_ASCENT_001')
) AS v(dis_cid, mech_cid)
JOIN diseases d ON d.canonical_id = v.dis_cid
JOIN mechanisms m ON m.canonical_id = v.mech_cid
ON CONFLICT (disease_id, mechanism_id) DO NOTHING;

-- Disease ↔ Treatment relations (with treatment roles)
INSERT INTO disease_treatment_relations (disease_id, treatment_id, treatment_role, line_of_therapy)
SELECT d.id, t.id, v.role, v.line
FROM (VALUES
  ('DIS_CHOLELITHIASIS_001', 'TRT_CHOLECYSTECTOMY_001',    'CAUSE_TARGETING',   1),
  ('DIS_CHOLELITHIASIS_001', 'TRT_URSODIOL_001',           'DISEASE_MODIFYING', 2),
  ('DIS_CHOLELITHIASIS_001', 'TRT_ANALGESICS_001',         'SYMPTOMATIC',       NULL),
  ('DIS_CHOLECYSTITIS_001',  'TRT_CHOLECYSTECTOMY_001',    'CAUSE_TARGETING',   1),
  ('DIS_CHOLECYSTITIS_001',  'TRT_ANTIBIOTICS_BILIARY_001','SUPPORTIVE',        1),
  ('DIS_CHOLECYSTITIS_001',  'TRT_ANALGESICS_001',         'SYMPTOMATIC',       NULL),
  ('DIS_CHOLANGITIS_001',    'TRT_ERCP_001',               'CAUSE_TARGETING',   1),
  ('DIS_CHOLANGITIS_001',    'TRT_ANTIBIOTICS_BILIARY_001','CAUSE_TARGETING',   1),
  ('DIS_CHOLANGITIS_001',    'TRT_ANALGESICS_001',         'SYMPTOMATIC',       NULL)
) AS v(dis_cid, trt_cid, role, line)
JOIN diseases d ON d.canonical_id = v.dis_cid
JOIN treatments t ON t.canonical_id = v.trt_cid
ON CONFLICT (disease_id, treatment_id, treatment_role) DO NOTHING;
