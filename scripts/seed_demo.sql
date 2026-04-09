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

-- ============================================================
-- Sprint 3C.1 — Case 01: "After every meal" (EASY, 80 XP)
-- Linked to DIS_CHOLELITHIASIS_001 / ANAT_GALLBLADDER_001
-- 4 clues, 4 questions, 4 options each
-- ============================================================

INSERT INTO cases (case_id, title, subtitle, linked_anatomy_id, linked_disease_id, difficulty, estimated_minutes, xp_reward, status)
SELECT 'MC_GALLBLADDER_001', 'After every meal',
  'A 42-year-old woman presents with sudden right upper quadrant pain after dinner.',
  ap.id, d.id, 'EASY', 10, 80, 'ACTIVE'
FROM anatomy_parts ap, diseases d
WHERE ap.canonical_id = 'ANAT_GALLBLADDER_001' AND d.canonical_id = 'DIS_CHOLELITHIASIS_001'
ON CONFLICT (case_id) DO NOTHING;

-- Vignette
INSERT INTO case_vignettes (case_id, patient_age, patient_sex, presenting_complaint, history_text, full_vignette_text)
SELECT c.id, 42, 'Female',
  'Sudden right upper quadrant pain after a large meal',
  'The patient describes episodic postprandial pain over the past 3 months, worsening after fatty meals. No fever. No jaundice.',
  'A 42-year-old woman presents to the emergency department with sudden-onset right upper quadrant pain that started 2 hours after a large holiday dinner. She describes the pain as crampy and radiating to her right shoulder. She reports similar but milder episodes over the past 3 months, always after fatty meals. She has no fever, no jaundice, and no vomiting.'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_001'
  AND NOT EXISTS (SELECT 1 FROM case_vignettes cv WHERE cv.case_id = c.id);

-- Clues
INSERT INTO case_clues (case_id, clue_type, label, value, is_abnormal, display_order)
SELECT c.id, v.clue_type, v.label, v.value, v.is_abnormal, v.display_order
FROM cases c
CROSS JOIN (VALUES
  ('vital',   'Temperature',  '36.8°C',          false, 1),
  ('lab',     'WBC',          '7.2 × 10⁹/L',    false, 2),
  ('lab',     'ALT',          '28 U/L',          false, 3),
  ('imaging', 'Ultrasound',   'Multiple gallstones, no wall thickening', true, 4)
) AS v(clue_type, label, value, is_abnormal, display_order)
WHERE c.case_id = 'MC_GALLBLADDER_001'
  AND NOT EXISTS (
    SELECT 1 FROM case_clues cc WHERE cc.case_id = c.id AND cc.display_order = v.display_order
  );

-- Q1
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 1, 'What is the most likely diagnosis?', 'DIAGNOSIS'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_001'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 1);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q
JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Acute cholecystitis',  false),
  ('B', 'Cholelithiasis',       true),
  ('C', 'Acute pancreatitis',   false),
  ('D', 'Peptic ulcer disease', false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_001' AND q.step_number = 1
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q2
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 2, 'Which clue most supports your diagnosis?', 'REASONING'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_001'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 2);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q
JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Normal temperature rules out infection',          false),
  ('B', 'Ultrasound showing multiple gallstones',          true),
  ('C', 'Normal WBC excludes biliary pathology',           false),
  ('D', 'Pain radiating to shoulder suggests cardiac cause', false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_001' AND q.step_number = 2
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q3
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 3, 'What is the primary underlying mechanism?', 'MECHANISM'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_001'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 3);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q
JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Bile supersaturation with cholesterol crystallisation', true),
  ('B', 'Cystic duct obstruction causing inflammation',         false),
  ('C', 'Bacterial infection ascending from the duodenum',      false),
  ('D', 'Autoimmune destruction of bile duct epithelium',       false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_001' AND q.step_number = 3
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q4
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 4, 'What is the first-line treatment for symptomatic gallstones?', 'TREATMENT'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_001'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 4);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q
JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Ursodiol dissolution therapy',        false),
  ('B', 'Laparoscopic cholecystectomy',         true),
  ('C', 'ERCP with sphincterotomy',             false),
  ('D', 'Watchful waiting with dietary changes', false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_001' AND q.step_number = 4
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- ============================================================
-- Sprint 3C.2 — Case 02: "The morning catch" (MEDIUM, 100 XP)
-- Linked to DIS_CHOLECYSTITIS_001 / ANAT_GALLBLADDER_001
-- ============================================================

INSERT INTO cases (case_id, title, subtitle, linked_anatomy_id, linked_disease_id, difficulty, estimated_minutes, xp_reward, status)
SELECT 'MC_GALLBLADDER_002', 'The morning catch',
  'A 55-year-old man presents with persistent RUQ pain and fever.',
  ap.id, d.id, 'MEDIUM', 15, 100, 'ACTIVE'
FROM anatomy_parts ap, diseases d
WHERE ap.canonical_id = 'ANAT_GALLBLADDER_001' AND d.canonical_id = 'DIS_CHOLECYSTITIS_001'
ON CONFLICT (case_id) DO NOTHING;

INSERT INTO case_vignettes (case_id, patient_age, patient_sex, presenting_complaint, history_text, full_vignette_text)
SELECT c.id, 55, 'Male',
  'Persistent right upper quadrant pain with fever',
  'Pain began 18 hours ago and has not resolved. History of gallstones diagnosed 2 years ago. No jaundice.',
  'A 55-year-old man presents with persistent right upper quadrant pain that began 18 hours ago after eating fried fish. Unlike previous biliary colic episodes, this pain has not resolved. He is febrile at 38.4°C. He has a known history of gallstones diagnosed 2 years ago but declined surgery. He denies jaundice or dark urine.'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_002'
  AND NOT EXISTS (SELECT 1 FROM case_vignettes cv WHERE cv.case_id = c.id);

INSERT INTO case_clues (case_id, clue_type, label, value, is_abnormal, display_order)
SELECT c.id, v.clue_type, v.label, v.value, v.is_abnormal, v.display_order
FROM cases c
CROSS JOIN (VALUES
  ('vital',   'Temperature', '38.4°C',           true,  1),
  ('lab',     'WBC',         '14.8 × 10⁹/L',    true,  2),
  ('lab',     'Bilirubin',   '18 µmol/L',        false, 3),
  ('imaging', 'Ultrasound',  'Gallstones with wall thickening >4mm and pericholecystic fluid', true, 4)
) AS v(clue_type, label, value, is_abnormal, display_order)
WHERE c.case_id = 'MC_GALLBLADDER_002'
  AND NOT EXISTS (SELECT 1 FROM case_clues cc WHERE cc.case_id = c.id AND cc.display_order = v.display_order);

-- Q1
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 1, 'What is the most likely diagnosis?', 'DIAGNOSIS'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_002'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 1);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Uncomplicated cholelithiasis', false),
  ('B', 'Acute cholecystitis',          true),
  ('C', 'Ascending cholangitis',        false),
  ('D', 'Acute pancreatitis',           false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_002' AND q.step_number = 1
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q2
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 2, 'Which combination of findings distinguishes this from simple biliary colic?', 'REASONING'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_002'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 2);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Fever, raised WBC, and persistent pain >6 hours', true),
  ('B', 'Elevated bilirubin with dark urine',              false),
  ('C', 'Normal ultrasound with epigastric tenderness',    false),
  ('D', 'Postprandial pain that resolves within 1 hour',   false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_002' AND q.step_number = 2
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q3
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 3, 'What is the initiating mechanism?', 'MECHANISM'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_002'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 3);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Bile supersaturation causing new stone formation',                 false),
  ('B', 'Cystic duct obstruction by an impacted gallstone',                true),
  ('C', 'Common bile duct obstruction with upstream dilation',             false),
  ('D', 'Bacterial translocation from the portal venous system',           false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_002' AND q.step_number = 3
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q4
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 4, 'What is the definitive management?', 'TREATMENT'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_002'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 4);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'IV antibiotics alone and discharge',          false),
  ('B', 'Cholecystectomy within 72 hours',             true),
  ('C', 'ERCP with stent placement',                   false),
  ('D', 'Oral ursodiol and outpatient follow-up',      false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_002' AND q.step_number = 4
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- ============================================================
-- Sprint 3C.3 — Case 03: "Yellow and confused" (HARD, 120 XP)
-- Linked to DIS_CHOLANGITIS_001 / ANAT_GALLBLADDER_001
-- Deliberate distractor options
-- ============================================================

INSERT INTO cases (case_id, title, subtitle, linked_anatomy_id, linked_disease_id, difficulty, estimated_minutes, xp_reward, status)
SELECT 'MC_GALLBLADDER_003', 'Yellow and confused',
  'A 68-year-old presents with fever, jaundice, and altered mental status.',
  ap.id, d.id, 'HARD', 20, 120, 'ACTIVE'
FROM anatomy_parts ap, diseases d
WHERE ap.canonical_id = 'ANAT_GALLBLADDER_001' AND d.canonical_id = 'DIS_CHOLANGITIS_001'
ON CONFLICT (case_id) DO NOTHING;

INSERT INTO case_vignettes (case_id, patient_age, patient_sex, presenting_complaint, history_text, full_vignette_text)
SELECT c.id, 68, 'Male',
  'Fever, jaundice, and confusion',
  'Found confused by family. Known history of CBD stones. Recent ERCP 3 weeks ago. Rigors and yellow discolouration noted by family.',
  'A 68-year-old man is brought to the emergency department by his family who found him confused and shivering. He has a known history of common bile duct stones and underwent ERCP with incomplete clearance 3 weeks ago. His family reports progressive yellowing of his skin over the past 2 days. On examination he is febrile at 39.2°C, jaundiced, and oriented only to person.'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_003'
  AND NOT EXISTS (SELECT 1 FROM case_vignettes cv WHERE cv.case_id = c.id);

INSERT INTO case_clues (case_id, clue_type, label, value, is_abnormal, display_order)
SELECT c.id, v.clue_type, v.label, v.value, v.is_abnormal, v.display_order
FROM cases c
CROSS JOIN (VALUES
  ('vital',   'Temperature',  '39.2°C',           true,  1),
  ('lab',     'WBC',          '19.6 × 10⁹/L',    true,  2),
  ('lab',     'Bilirubin',    '85 µmol/L',        true,  3),
  ('lab',     'ALP',          '420 U/L',          true,  4),
  ('clinical','Mental status', 'Oriented to person only', true, 5)
) AS v(clue_type, label, value, is_abnormal, display_order)
WHERE c.case_id = 'MC_GALLBLADDER_003'
  AND NOT EXISTS (SELECT 1 FROM case_clues cc WHERE cc.case_id = c.id AND cc.display_order = v.display_order);

-- Q1
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 1, 'What clinical triad is demonstrated?', 'DIAGNOSIS'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_003'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 1);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Beck''s triad (hypotension, JVD, muffled heart sounds)',         false),
  ('B', 'Charcot''s triad (fever, jaundice, RUQ pain)',                   true),
  ('C', 'Virchow''s triad (stasis, endothelial injury, hypercoagulability)', false),
  ('D', 'Cushing''s triad (hypertension, bradycardia, irregular breathing)', false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_003' AND q.step_number = 1
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q2
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 2, 'The addition of confusion and hypotension to the triad defines which syndrome?', 'REASONING'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_003'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 2);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Mirizzi syndrome',                    false),
  ('B', 'Reynolds'' pentad (acute cholangitis)', true),
  ('C', 'Courvoisier''s sign',                 false),
  ('D', 'Murphy''s sign',                      false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_003' AND q.step_number = 2
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q3
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 3, 'What is the primary pathophysiological mechanism?', 'MECHANISM'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_003'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 3);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Gallbladder mucosal inflammation from trapped bile acids',   false),
  ('B', 'Bile duct obstruction with bacterial ascent from duodenum',  true),
  ('C', 'Portal vein thrombosis causing hepatic congestion',          false),
  ('D', 'Pancreatic duct obstruction with autodigestion',             false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_003' AND q.step_number = 3
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- Q4
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, 4, 'What is the most urgent intervention?', 'TREATMENT'
FROM cases c WHERE c.case_id = 'MC_GALLBLADDER_003'
  AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id = c.id AND cq.step_number = 4);

INSERT INTO case_options (question_id, option_key, option_text, is_correct)
SELECT q.id, v.key, v.text, v.correct
FROM case_questions q JOIN cases c ON c.id = q.case_id
CROSS JOIN (VALUES
  ('A', 'Elective cholecystectomy in 6 weeks',                false),
  ('B', 'Oral antibiotics and outpatient review',             false),
  ('C', 'Emergency ERCP with biliary decompression',          true),
  ('D', 'Percutaneous cholecystostomy drain',                 false)
) AS v(key, text, correct)
WHERE c.case_id = 'MC_GALLBLADDER_003' AND q.step_number = 4
  AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id = q.id AND co.option_key = v.key);

-- ============================================================
-- Sprint 4C.1 — NICE guideline source documents
-- ============================================================

INSERT INTO source_documents (url, title, source_type, trust_score, jurisdiction, raw_text) VALUES
  ('https://www.nice.org.uk/guidance/cg188',
   'NICE CG188: Gallstone disease — diagnosis and management',
   'GUIDELINE', 0.95, 'UK',
   'Gallstone disease encompasses cholelithiasis, cholecystitis, and choledocholithiasis. Laparoscopic cholecystectomy is recommended as the treatment of choice for symptomatic gallstones. Early cholecystectomy (within 1 week of diagnosis) should be offered for acute cholecystitis. ERCP should be considered for common bile duct stones. Ursodeoxycholic acid may be considered for patients unfit for surgery.'),
  ('https://www.nice.org.uk/guidance/ng104',
   'NICE NG104: Acute cholangitis — antimicrobial prescribing',
   'GUIDELINE', 0.95, 'UK',
   'Acute cholangitis is a bacterial infection of the biliary system caused by obstruction. Charcot''s triad (fever, jaundice, right upper quadrant pain) is the classic presentation. Reynolds'' pentad adds hypotension and confusion. IV antibiotics should be started immediately. Biliary drainage via ERCP is the definitive treatment for acute cholangitis with biliary obstruction.')
ON CONFLICT (url) DO NOTHING;

-- ============================================================
-- Sprint 4C.2 — MedlinePlus hepatobiliary source documents
-- One per disease: cholelithiasis, cholecystitis, cholangitis
-- ============================================================

INSERT INTO source_documents (url, title, source_type, trust_score, jurisdiction, raw_text) VALUES
  ('https://medlineplus.gov/gallstones.html',
   'MedlinePlus: Gallstones',
   'REFERENCE', 0.85, NULL,
   'Gallstones are hard, pebble-like pieces of material that form in the gallbladder. They are made of cholesterol or bilirubin. Gallstones can range in size from a grain of sand to a golf ball. The gallbladder can develop a single large stone, hundreds of tiny stones, or both. If gallstones block a bile duct, bile can build up in the gallbladder, causing a gallbladder attack. The pain usually lasts from 1 to several hours. Surgery to remove the gallbladder is the most common treatment.'),
  ('https://medlineplus.gov/cholecystitis.html',
   'MedlinePlus: Cholecystitis',
   'REFERENCE', 0.85, NULL,
   'Cholecystitis is inflammation of the gallbladder. It usually happens when a gallstone blocks the cystic duct. This leads to a build-up of bile that causes inflammation. Acute cholecystitis causes sudden, severe pain in the upper right abdomen, fever, and nausea. Treatment usually involves hospital stay, IV antibiotics, and cholecystectomy. Without treatment, cholecystitis can lead to serious complications including perforation and peritonitis.'),
  ('https://medlineplus.gov/bileductdiseases.html',
   'MedlinePlus: Bile Duct Diseases',
   'REFERENCE', 0.85, NULL,
   'Bile ducts carry bile from the liver and gallbladder to the small intestine. Cholangitis is an infection of the bile ducts, usually caused by bacteria ascending from the small intestine into bile ducts obstructed by gallstones. Symptoms include fever, jaundice, and abdominal pain (Charcot''s triad). Severe cases may present with confusion and hypotension. Urgent treatment includes antibiotics and biliary drainage, typically via ERCP.')
ON CONFLICT (url) DO NOTHING;
