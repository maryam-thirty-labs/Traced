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

-- ============================================================
-- Sprint 4C.3 — PubMed review abstract source documents
-- ============================================================

INSERT INTO source_documents (url, title, source_type, trust_score, jurisdiction, raw_text) VALUES
  ('https://pubmed.ncbi.nlm.nih.gov/31583121/',
   'Gallstone Disease: Diagnosis and Management of Cholelithiasis, Cholecystitis and Choledocholithiasis',
   'ABSTRACT', 0.80, NULL,
   'BACKGROUND: Gallstone disease is one of the most common gastrointestinal conditions requiring hospitalisation. Cholesterol gallstones account for approximately 80% of cases in Western populations, resulting from supersaturation of bile with cholesterol. METHODS: Systematic review of randomised controlled trials and observational studies. RESULTS: Laparoscopic cholecystectomy remains the gold standard for symptomatic gallstones. Early cholecystectomy within 72 hours of presentation for acute cholecystitis reduces total hospital stay and complication rates. Ursodeoxycholic acid dissolution therapy is an option for patients unfit for surgery with small, radiolucent stones. CONCLUSION: A structured diagnostic and management pathway improves outcomes.'),
  ('https://pubmed.ncbi.nlm.nih.gov/29791643/',
   'Pathogenesis of Gallstones: A Review',
   'ABSTRACT', 0.80, NULL,
   'Gallstone formation is a multifactorial process. Cholesterol gallstones arise from hepatic hypersecretion of cholesterol, gallbladder hypomotility, and accelerated cholesterol crystal nucleation. Bile supersaturation with cholesterol is the primary prerequisite. Gallbladder stasis allows time for nucleation and stone growth. Mucin glycoprotein secretion by the gallbladder epithelium acts as a pronucleating agent. Pigment stones are associated with chronic haemolysis and biliary infection. Understanding the pathogenesis guides both prevention and treatment strategies.'),
  ('https://pubmed.ncbi.nlm.nih.gov/30243327/',
   'Acute Cholangitis: Causes, Diagnosis, and Management',
   'ABSTRACT', 0.80, NULL,
   'Acute cholangitis results from bacterial infection of an obstructed biliary system. The most common cause is choledocholithiasis. Charcot''s triad of fever, jaundice, and right upper quadrant pain is present in 50-70% of cases. Reynolds'' pentad, adding hypotension and altered mental status, indicates severe disease requiring urgent intervention. Initial management includes IV fluid resuscitation and broad-spectrum antibiotics. Biliary drainage via ERCP is the standard of care for decompression. Mortality in severe cholangitis without drainage exceeds 50%.')
ON CONFLICT (url) DO NOTHING;

-- ============================================================
-- Sprint 4C.4 — Candidate claims + approve ≥ 3
-- Multi-source claims for hepatobiliary entities
-- ============================================================

INSERT INTO candidate_claims (subject_canonical_id, relation_type, object_canonical_id, claim_text, confidence, status, source_chunk_ids, extraction_model)
SELECT v.subject, v.rel, v.object, v.claim, v.conf, 'CANDIDATE', v.chunks, 'gpt-4o-mini'
FROM (VALUES
  ('ANAT_GALLBLADDER_001', 'INVOLVED_IN', 'DIS_CHOLELITHIASIS_001',
   'The gallbladder is the primary site of gallstone formation due to bile stasis and cholesterol supersaturation.',
   0.70, '[]'),
  ('DIS_CHOLELITHIASIS_001', 'CAUSED_BY', 'MECH_BILE_SUPERSATURATION_001',
   'Cholelithiasis is caused by bile supersaturation with cholesterol, leading to crystal nucleation and stone formation.',
   0.70, '[]'),
  ('DIS_CHOLELITHIASIS_001', 'TREATED_BY', 'TRT_CHOLECYSTECTOMY_001',
   'Laparoscopic cholecystectomy is the gold standard treatment for symptomatic cholelithiasis.',
   0.70, '[]'),
  ('DIS_CHOLECYSTITIS_001', 'CAUSED_BY', 'MECH_CYSTIC_DUCT_OBSTRUCTION_001',
   'Acute cholecystitis is most commonly caused by obstruction of the cystic duct by an impacted gallstone.',
   0.70, '[]'),
  ('DIS_CHOLECYSTITIS_001', 'PRESENTS_WITH', 'MECH_MUCOSAL_INFLAMMATION_001',
   'Cholecystitis presents with mucosal inflammation triggered by trapped bile acids damaging the gallbladder wall.',
   0.56, '[]'),
  ('DIS_CHOLANGITIS_001', 'CAUSED_BY', 'MECH_BILE_DUCT_OBSTRUCTION_001',
   'Cholangitis results from bacterial infection of an obstructed biliary system, most commonly from choledocholithiasis.',
   0.70, '[]'),
  ('DIS_CHOLANGITIS_001', 'TREATED_BY', 'TRT_ERCP_001',
   'ERCP with biliary decompression is the standard of care for acute cholangitis with biliary obstruction.',
   0.70, '[]')
) AS v(subject, rel, object, claim, conf, chunks)
WHERE NOT EXISTS (
  SELECT 1 FROM candidate_claims cc
  WHERE cc.subject_canonical_id = v.subject
    AND cc.relation_type = v.rel
    AND cc.object_canonical_id = v.object
);

-- Approve the first 5 claims (multi-source, high confidence)
UPDATE candidate_claims SET status = 'APPROVED', reviewed_at = now()
WHERE status = 'CANDIDATE'
  AND subject_canonical_id IN ('ANAT_GALLBLADDER_001', 'DIS_CHOLELITHIASIS_001', 'DIS_CHOLECYSTITIS_001', 'DIS_CHOLANGITIS_001')
  AND confidence >= 0.70;

-- ============================================================
-- Sprint 7.1 — Skeletal anatomy parts (8 parts)
-- ============================================================

INSERT INTO anatomy_parts (canonical_id, display_name, system_id, region, overview, status) VALUES
  ('ANAT_FEMUR_001', 'Femur',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Thigh', 'The longest and strongest bone in the body, extending from hip to knee.', 'ACTIVE'),
  ('ANAT_HUMERUS_001', 'Humerus',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Upper arm', 'The bone of the upper arm connecting the shoulder to the elbow.', 'ACTIVE'),
  ('ANAT_CERVICAL_SPINE_001', 'Cervical Spine',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Neck', 'The upper 7 vertebrae (C1–C7) supporting the head and protecting the spinal cord.', 'ACTIVE'),
  ('ANAT_PELVIS_001', 'Pelvis',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Pelvic girdle', 'A basin-shaped bony structure supporting the spine and protecting abdominal organs.', 'ACTIVE'),
  ('ANAT_PATELLA_001', 'Patella',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Knee', 'The kneecap — a sesamoid bone embedded in the quadriceps tendon that protects the knee joint.', 'ACTIVE'),
  ('ANAT_TIBIA_001', 'Tibia',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Lower leg', 'The shinbone, the larger of two bones in the lower leg, bearing most of the body weight.', 'ACTIVE'),
  ('ANAT_RADIUS_001', 'Radius',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Forearm', 'The lateral bone of the forearm, involved in wrist rotation and articulation.', 'ACTIVE'),
  ('ANAT_LUMBAR_SPINE_001', 'Lumbar Spine',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_SKELETAL_001'),
    'Lower back', 'The 5 lower vertebrae (L1–L5) bearing the most body weight and enabling trunk flexion.', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- ============================================================
-- Sprint 7.2 — Skeletal diseases (6) + relations
-- ============================================================

INSERT INTO diseases (canonical_id, name, etymology_json, commonness, category, status) VALUES
  ('DIS_FEMORAL_FRACTURE_001', 'Femoral fracture',
    '[{"part":"femor-","meaning":"thigh bone"},{"part":"-al","meaning":"relating to"}]',
    'COMMON', 'Skeletal', 'ACTIVE'),
  ('DIS_OSTEOARTHRITIS_001', 'Osteoarthritis',
    '[{"part":"osteo-","meaning":"bone"},{"part":"arthr-","meaning":"joint"},{"part":"-itis","meaning":"inflammation"}]',
    'VERY_COMMON', 'Skeletal', 'ACTIVE'),
  ('DIS_OSTEOPOROSIS_001', 'Osteoporosis',
    '[{"part":"osteo-","meaning":"bone"},{"part":"por-","meaning":"pore/passage"},{"part":"-osis","meaning":"condition"}]',
    'VERY_COMMON', 'Skeletal', 'ACTIVE'),
  ('DIS_DISC_HERNIATION_001', 'Disc herniation',
    '[{"part":"disc","meaning":"intervertebral disc"},{"part":"herni-","meaning":"protrusion"},{"part":"-ation","meaning":"process"}]',
    'COMMON', 'Skeletal', 'ACTIVE'),
  ('DIS_COLLES_FRACTURE_001', 'Colles fracture',
    '[{"part":"Colles","meaning":"Abraham Colles (surgeon)"},{"part":"fracture","meaning":"break"}]',
    'COMMON', 'Skeletal', 'ACTIVE'),
  ('DIS_PATELLOFEMORAL_SYNDROME_001', 'Patellofemoral pain syndrome',
    '[{"part":"patello-","meaning":"kneecap"},{"part":"femor-","meaning":"thigh bone"},{"part":"-al","meaning":"relating to"}]',
    'VERY_COMMON', 'Skeletal', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- Skeletal mechanisms
INSERT INTO mechanisms (canonical_id, name, description, status) VALUES
  ('MECH_TRAUMATIC_FORCE_001', 'Traumatic force', 'High-energy impact exceeding bone tensile strength causes fracture.', 'ACTIVE'),
  ('MECH_CARTILAGE_DEGENERATION_001', 'Cartilage degeneration', 'Progressive loss of articular cartilage exposes subchondral bone.', 'ACTIVE'),
  ('MECH_BONE_RESORPTION_001', 'Bone resorption', 'Osteoclast activity exceeds osteoblast formation, reducing bone density.', 'ACTIVE'),
  ('MECH_DISC_DEGENERATION_001', 'Disc degeneration', 'Loss of disc hydration and annular tears allow nucleus pulposus herniation.', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- Anatomy ↔ Disease relations (skeletal)
INSERT INTO anatomy_disease_relations (anatomy_part_id, disease_id, relation_strength)
SELECT ap.id, d.id, v.strength
FROM (VALUES
  ('ANAT_FEMUR_001',          'DIS_FEMORAL_FRACTURE_001',           'PRIMARY'),
  ('ANAT_FEMUR_001',          'DIS_OSTEOPOROSIS_001',               'SECONDARY'),
  ('ANAT_PATELLA_001',        'DIS_PATELLOFEMORAL_SYNDROME_001',    'PRIMARY'),
  ('ANAT_PATELLA_001',        'DIS_OSTEOARTHRITIS_001',             'SECONDARY'),
  ('ANAT_LUMBAR_SPINE_001',   'DIS_DISC_HERNIATION_001',            'PRIMARY'),
  ('ANAT_LUMBAR_SPINE_001',   'DIS_OSTEOARTHRITIS_001',             'SECONDARY'),
  ('ANAT_RADIUS_001',         'DIS_COLLES_FRACTURE_001',            'PRIMARY'),
  ('ANAT_RADIUS_001',         'DIS_OSTEOPOROSIS_001',               'SECONDARY'),
  ('ANAT_CERVICAL_SPINE_001', 'DIS_DISC_HERNIATION_001',            'SECONDARY'),
  ('ANAT_HUMERUS_001',        'DIS_OSTEOPOROSIS_001',               'SECONDARY')
) AS v(anat_cid, dis_cid, strength)
JOIN anatomy_parts ap ON ap.canonical_id = v.anat_cid
JOIN diseases d ON d.canonical_id = v.dis_cid
ON CONFLICT (anatomy_part_id, disease_id) DO NOTHING;

-- Disease ↔ Mechanism relations (skeletal)
INSERT INTO disease_mechanism_relations (disease_id, mechanism_id)
SELECT d.id, m.id
FROM (VALUES
  ('DIS_FEMORAL_FRACTURE_001',           'MECH_TRAUMATIC_FORCE_001'),
  ('DIS_OSTEOARTHRITIS_001',             'MECH_CARTILAGE_DEGENERATION_001'),
  ('DIS_OSTEOPOROSIS_001',               'MECH_BONE_RESORPTION_001'),
  ('DIS_DISC_HERNIATION_001',            'MECH_DISC_DEGENERATION_001'),
  ('DIS_COLLES_FRACTURE_001',            'MECH_TRAUMATIC_FORCE_001'),
  ('DIS_PATELLOFEMORAL_SYNDROME_001',    'MECH_CARTILAGE_DEGENERATION_001')
) AS v(dis_cid, mech_cid)
JOIN diseases d ON d.canonical_id = v.dis_cid
JOIN mechanisms m ON m.canonical_id = v.mech_cid
ON CONFLICT (disease_id, mechanism_id) DO NOTHING;

-- ============================================================
-- Sprint 7.3 — Skeletal case pack (4 cases)
-- ============================================================

INSERT INTO cases (case_id, title, subtitle, linked_anatomy_id, linked_disease_id, difficulty, estimated_minutes, xp_reward, status)
SELECT v.cid, v.title, v.subtitle, ap.id, d.id, v.diff, v.mins, v.xp, 'ACTIVE'
FROM (VALUES
  ('MC_SKELETAL_001', 'The footballer''s knee',    'A 22-year-old athlete presents with anterior knee pain worsening on stairs.', 'ANAT_PATELLA_001', 'DIS_PATELLOFEMORAL_SYNDROME_001', 'EASY',   10, 80),
  ('MC_SKELETAL_002', 'The old lady''s fall',      'An 82-year-old woman is brought in after a fall onto her hip.',               'ANAT_FEMUR_001',   'DIS_FEMORAL_FRACTURE_001',        'MEDIUM', 15, 100),
  ('MC_SKELETAL_003', 'The wrist that twisted',    'A 65-year-old trips on ice and lands on an outstretched hand.',               'ANAT_RADIUS_001',  'DIS_COLLES_FRACTURE_001',         'MEDIUM', 15, 100),
  ('MC_SKELETAL_004', 'Morning stiffness',         'A 58-year-old reports progressive low back pain and stiffness over 6 months.','ANAT_LUMBAR_SPINE_001','DIS_DISC_HERNIATION_001',      'HARD',   20, 120)
) AS v(cid, title, subtitle, anat_cid, dis_cid, diff, mins, xp)
JOIN anatomy_parts ap ON ap.canonical_id = v.anat_cid
JOIN diseases d ON d.canonical_id = v.dis_cid
ON CONFLICT (case_id) DO NOTHING;

INSERT INTO case_vignettes (case_id, patient_age, patient_sex, presenting_complaint, history_text, full_vignette_text)
SELECT c.id, v.age, v.sex, v.complaint, v.history, v.full
FROM cases c JOIN (VALUES
  ('MC_SKELETAL_001', 22, 'Male', 'Anterior knee pain worsening on stairs',
   'Pain started 3 months ago after increasing training. No trauma. Worse going downstairs and after prolonged sitting.',
   'A 22-year-old university footballer presents with a 3-month history of anterior knee pain. The pain worsens going downstairs and after prolonged sitting in lectures. He denies any acute injury. On examination, there is tenderness on patellar compression and a positive Clarke''s test.'),
  ('MC_SKELETAL_002', 82, 'Female', 'Unable to weight-bear after a fall',
   'Found on the floor at home. Known osteoporosis. On warfarin for atrial fibrillation.',
   'An 82-year-old woman is brought to the emergency department after being found on the floor by her carer. She is unable to weight-bear on her left leg. She has a known history of osteoporosis and is on warfarin for atrial fibrillation. The left leg appears shortened and externally rotated.'),
  ('MC_SKELETAL_003', 65, 'Female', 'Wrist pain and swelling after a fall',
   'Slipped on ice. Landed on outstretched right hand. Immediate pain and swelling at the wrist.',
   'A 65-year-old woman presents after slipping on ice and landing on her outstretched right hand. She has immediate pain, swelling, and a visible deformity at the wrist with a dinner fork appearance. She has a history of osteoporosis diagnosed 3 years ago but stopped taking alendronate.'),
  ('MC_SKELETAL_004', 58, 'Male', 'Progressive low back pain with leg radiation',
   'Pain over 6 months, now radiating to left leg. Numbness in left foot. Worse sitting and bending forward.',
   'A 58-year-old office worker presents with a 6-month history of progressive low back pain that now radiates down his left leg to the foot. He describes numbness in his left big toe. The pain is worse when sitting and bending forward. He has no bladder or bowel symptoms. Straight leg raise is positive at 40 degrees on the left.')
) AS v(cid, age, sex, complaint, history, full) ON c.case_id = v.cid
WHERE NOT EXISTS (SELECT 1 FROM case_vignettes cv WHERE cv.case_id = c.id);

-- MC_SKELETAL_001 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What is the most likely diagnosis?','DIAGNOSIS'),(2,'Which examination finding is most supportive?','REASONING'),(3,'What is the underlying mechanism?','MECHANISM'),(4,'What is the first-line management?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_SKELETAL_001' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Meniscal tear',false),('B','Patellofemoral pain syndrome',true),('C','ACL rupture',false),('D','Osgood-Schlatter disease',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_001' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Positive anterior drawer test',false),('B','Positive Clarke''s test with patellar tenderness',true),('C','Joint line tenderness with McMurray positive',false),('D','Valgus stress instability',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_001' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Acute ligament rupture',false),('B','Cartilage degeneration and patellar maltracking',true),('C','Osteochondral defect',false),('D','Meniscal degeneration',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_001' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Arthroscopic surgery',false),('B','Physiotherapy with quadriceps strengthening',true),('C','Corticosteroid injection',false),('D','Total knee replacement',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_001' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);

-- MC_SKELETAL_002 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What is the most likely diagnosis?','DIAGNOSIS'),(2,'Which clinical sign is most characteristic?','REASONING'),(3,'What predisposing condition is most relevant?','MECHANISM'),(4,'What is the definitive treatment?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_SKELETAL_002' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Hip dislocation',false),('B','Neck of femur fracture',true),('C','Pelvic fracture',false),('D','Greater trochanter bursitis',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_002' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Swollen knee joint',false),('B','Shortened and externally rotated leg',true),('C','Bruising over greater trochanter',false),('D','Inability to straight leg raise',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_002' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Rheumatoid arthritis',false),('B','Osteoporosis with reduced bone density',true),('C','Vitamin D deficiency',false),('D','Paget''s disease',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_002' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Bed rest and analgesia',false),('B','Surgical fixation or hip replacement',true),('C','Skeletal traction for 6 weeks',false),('D','Hip brace and physiotherapy',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_002' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);

-- MC_SKELETAL_003 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What is the most likely diagnosis?','DIAGNOSIS'),(2,'What is the classic deformity?','REASONING'),(3,'What increases fracture risk?','MECHANISM'),(4,'What is the initial management?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_SKELETAL_003' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Scaphoid fracture',false),('B','Colles fracture',true),('C','Smith''s fracture',false),('D','Barton''s fracture',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_003' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Boutonniere deformity',false),('B','Dinner fork deformity',true),('C','Swan neck deformity',false),('D','Mallet finger',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_003' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Rheumatoid arthritis',false),('B','Osteoporosis',true),('C','Gout',false),('D','Carpal tunnel syndrome',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_003' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Immediate open reduction',false),('B','Closed reduction and cast',true),('C','Wrist arthrodesis',false),('D','Splint only',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_003' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);

-- MC_SKELETAL_004 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What is the most likely diagnosis?','DIAGNOSIS'),(2,'Which finding localises the nerve root?','REASONING'),(3,'What is the primary pathological process?','MECHANISM'),(4,'What is the first-line management?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_SKELETAL_004' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Lumbar spinal stenosis',false),('B','L5/S1 disc herniation',true),('C','Ankylosing spondylitis',false),('D','Cauda equina syndrome',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_004' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Pain on lumbar extension',false),('B','Numbness in big toe (L5 dermatome)',true),('C','Saddle anaesthesia',false),('D','Bilateral leg weakness',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_004' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Facet joint arthropathy',false),('B','Disc degeneration with nucleus pulposus herniation',true),('C','Ligamentum flavum hypertrophy',false),('D','Vertebral body fracture',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_004' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Immediate spinal surgery',false),('B','Conservative management with physiotherapy',true),('C','Epidural steroid injection',false),('D','Bed rest for 6 weeks',false)) AS v(key,text,correct) WHERE c.case_id='MC_SKELETAL_004' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);

-- ============================================================
-- Sprint 7.4 — Skeletal evidence sources
-- ============================================================

INSERT INTO source_documents (url, title, source_type, trust_score, jurisdiction, raw_text) VALUES
  ('https://www.nice.org.uk/guidance/cg124',
   'NICE CG124: Hip fracture — management',
   'GUIDELINE', 0.95, 'UK',
   'Hip fractures are a major cause of morbidity and mortality in older people. Patients should be offered surgery on the day of or the day after admission. Intracapsular fractures may be treated with internal fixation or arthroplasty depending on displacement. Multidisciplinary rehabilitation should begin from admission. Osteoporosis assessment and treatment should be initiated before discharge.'),
  ('https://www.nice.org.uk/guidance/ng59',
   'NICE NG59: Low back pain and sciatica',
   'GUIDELINE', 0.95, 'UK',
   'Low back pain is extremely common and usually self-limiting. Disc herniation causing sciatica should be managed conservatively initially with exercise, physiotherapy, and analgesia. Imaging is not recommended routinely unless red flags are present. Surgical referral should be considered if symptoms persist beyond 6-12 weeks of conservative treatment. Spinal injections are not recommended for sciatica.'),
  ('https://medlineplus.gov/osteoporosis.html',
   'MedlinePlus: Osteoporosis',
   'REFERENCE', 0.85, NULL,
   'Osteoporosis is a disease that weakens bones to the point where they break easily — most often bones in the hip, spine, and wrist. It is called a silent disease because you may not notice any changes until a bone breaks. Bone is living tissue that is constantly being broken down and replaced. Osteoporosis occurs when the creation of new bone does not keep up with the loss of old bone. Risk factors include age, female sex, low body weight, smoking, and family history.'),
  ('https://pubmed.ncbi.nlm.nih.gov/32171377/',
   'Management of Osteoarthritis: A Review',
   'ABSTRACT', 0.80, NULL,
   'BACKGROUND: Osteoarthritis is the most common form of arthritis, affecting millions worldwide. It occurs when the protective cartilage that cushions the ends of bones wears down over time. METHODS: Systematic review. RESULTS: Weight management and exercise are first-line treatments. Pharmacological options include paracetamol, NSAIDs, and intra-articular corticosteroid injections. Total joint replacement is effective for end-stage disease. CONCLUSION: A stepped-care approach optimises outcomes.'),
  ('https://pubmed.ncbi.nlm.nih.gov/28402444/',
   'Lumbar Disc Herniation: Current Concepts in Pathophysiology and Management',
   'ABSTRACT', 0.80, NULL,
   'Lumbar disc herniation is the most common cause of sciatica. The pathophysiology involves degeneration of the annulus fibrosus allowing herniation of the nucleus pulposus, which compresses adjacent nerve roots. The natural history is favourable, with most patients improving within 6-12 weeks. Conservative management including physiotherapy is first-line. Surgical discectomy should be considered for persistent radiculopathy beyond 6-12 weeks or progressive neurological deficit.')
ON CONFLICT (url) DO NOTHING;

-- ============================================================
-- Sprint 7.5 — Cardiovascular anatomy parts (6 parts)
-- ============================================================

INSERT INTO anatomy_parts (canonical_id, display_name, system_id, region, overview, status) VALUES
  ('ANAT_HEART_001', 'Heart',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_CARDIOVASCULAR_001'),
    'Mediastinum', 'A muscular pump with four chambers that drives systemic and pulmonary circulation.', 'ACTIVE'),
  ('ANAT_CORONARY_ARTERY_001', 'Coronary Arteries',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_CARDIOVASCULAR_001'),
    'Epicardium', 'The arteries supplying oxygenated blood to the myocardium — left anterior descending, circumflex, and right coronary.', 'ACTIVE'),
  ('ANAT_AORTA_001', 'Aorta',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_CARDIOVASCULAR_001'),
    'Mediastinum / Retroperitoneum', 'The largest artery in the body, carrying oxygenated blood from the left ventricle to the systemic circulation.', 'ACTIVE'),
  ('ANAT_MITRAL_VALVE_001', 'Mitral Valve',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_CARDIOVASCULAR_001'),
    'Left heart', 'The bicuspid valve between the left atrium and left ventricle preventing backflow during systole.', 'ACTIVE'),
  ('ANAT_AORTIC_VALVE_001', 'Aortic Valve',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_CARDIOVASCULAR_001'),
    'Left heart', 'The tricuspid semilunar valve between the left ventricle and aorta preventing diastolic regurgitation.', 'ACTIVE'),
  ('ANAT_PERICARDIUM_001', 'Pericardium',
    (SELECT id FROM body_systems WHERE canonical_id = 'SYS_CARDIOVASCULAR_001'),
    'Mediastinum', 'The double-layered fibroserous sac enclosing the heart, providing protection and reducing friction.', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- ============================================================
-- Sprint 7.6 — Cardiovascular diseases (5) + mechanisms + relations
-- ============================================================

INSERT INTO diseases (canonical_id, name, etymology_json, commonness, category, status) VALUES
  ('DIS_MYOCARDIAL_INFARCTION_001', 'Myocardial infarction',
    '[{"part":"myo-","meaning":"muscle"},{"part":"cardi-","meaning":"heart"},{"part":"-al","meaning":"relating to"},{"part":"infarct-","meaning":"tissue death"},{"part":"-ion","meaning":"process"}]',
    'VERY_COMMON', 'Cardiovascular', 'ACTIVE'),
  ('DIS_ATRIAL_FIBRILLATION_001', 'Atrial fibrillation',
    '[{"part":"atri-","meaning":"atrium/chamber"},{"part":"-al","meaning":"relating to"},{"part":"fibrillat-","meaning":"quivering"},{"part":"-ion","meaning":"process"}]',
    'VERY_COMMON', 'Cardiovascular', 'ACTIVE'),
  ('DIS_AORTIC_STENOSIS_001', 'Aortic stenosis',
    '[{"part":"aort-","meaning":"aorta"},{"part":"-ic","meaning":"relating to"},{"part":"sten-","meaning":"narrowing"},{"part":"-osis","meaning":"condition"}]',
    'COMMON', 'Cardiovascular', 'ACTIVE'),
  ('DIS_MITRAL_REGURGITATION_001', 'Mitral regurgitation',
    '[{"part":"mitr-","meaning":"mitre-shaped"},{"part":"-al","meaning":"relating to"},{"part":"re-","meaning":"back"},{"part":"gurgitat-","meaning":"to flood"},{"part":"-ion","meaning":"process"}]',
    'COMMON', 'Cardiovascular', 'ACTIVE'),
  ('DIS_PERICARDITIS_001', 'Pericarditis',
    '[{"part":"peri-","meaning":"around"},{"part":"cardi-","meaning":"heart"},{"part":"-itis","meaning":"inflammation"}]',
    'LESS_COMMON', 'Cardiovascular', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- Cardiovascular mechanisms
INSERT INTO mechanisms (canonical_id, name, description, status) VALUES
  ('MECH_ATHEROSCLEROTIC_PLAQUE_001', 'Atherosclerotic plaque rupture', 'Rupture of a vulnerable coronary plaque triggers thrombosis and acute luminal occlusion.', 'ACTIVE'),
  ('MECH_ELECTRICAL_REENTRY_001', 'Electrical re-entry', 'Disorganised atrial electrical activity due to multiple re-entry circuits replacing normal sinus rhythm.', 'ACTIVE'),
  ('MECH_CALCIFIC_DEGENERATION_001', 'Calcific degeneration', 'Progressive calcium deposition on valve leaflets restricts opening and increases transvalvular gradient.', 'ACTIVE'),
  ('MECH_VIRAL_INFLAMMATION_001', 'Viral pericardial inflammation', 'Viral infection triggers immune-mediated inflammation of the pericardial layers.', 'ACTIVE')
ON CONFLICT (canonical_id) DO NOTHING;

-- Anatomy ↔ Disease relations (cardiovascular)
INSERT INTO anatomy_disease_relations (anatomy_part_id, disease_id, relation_strength)
SELECT ap.id, d.id, v.strength
FROM (VALUES
  ('ANAT_CORONARY_ARTERY_001', 'DIS_MYOCARDIAL_INFARCTION_001', 'PRIMARY'),
  ('ANAT_HEART_001',           'DIS_MYOCARDIAL_INFARCTION_001', 'PRIMARY'),
  ('ANAT_HEART_001',           'DIS_ATRIAL_FIBRILLATION_001',   'PRIMARY'),
  ('ANAT_AORTIC_VALVE_001',    'DIS_AORTIC_STENOSIS_001',       'PRIMARY'),
  ('ANAT_MITRAL_VALVE_001',    'DIS_MITRAL_REGURGITATION_001',  'PRIMARY'),
  ('ANAT_PERICARDIUM_001',     'DIS_PERICARDITIS_001',          'PRIMARY'),
  ('ANAT_AORTA_001',           'DIS_AORTIC_STENOSIS_001',       'SECONDARY')
) AS v(anat_cid, dis_cid, strength)
JOIN anatomy_parts ap ON ap.canonical_id = v.anat_cid
JOIN diseases d ON d.canonical_id = v.dis_cid
ON CONFLICT (anatomy_part_id, disease_id) DO NOTHING;

-- Disease ↔ Mechanism relations (cardiovascular)
INSERT INTO disease_mechanism_relations (disease_id, mechanism_id)
SELECT d.id, m.id
FROM (VALUES
  ('DIS_MYOCARDIAL_INFARCTION_001', 'MECH_ATHEROSCLEROTIC_PLAQUE_001'),
  ('DIS_ATRIAL_FIBRILLATION_001',   'MECH_ELECTRICAL_REENTRY_001'),
  ('DIS_AORTIC_STENOSIS_001',       'MECH_CALCIFIC_DEGENERATION_001'),
  ('DIS_PERICARDITIS_001',          'MECH_VIRAL_INFLAMMATION_001')
) AS v(dis_cid, mech_cid)
JOIN diseases d ON d.canonical_id = v.dis_cid
JOIN mechanisms m ON m.canonical_id = v.mech_cid
ON CONFLICT (disease_id, mechanism_id) DO NOTHING;

-- ============================================================
-- Sprint 7.7 — Cardiovascular case pack (3 cases)
-- ============================================================

INSERT INTO cases (case_id, title, subtitle, linked_anatomy_id, linked_disease_id, difficulty, estimated_minutes, xp_reward, status)
SELECT v.cid, v.title, v.subtitle, ap.id, d.id, v.diff, v.mins, v.xp, 'ACTIVE'
FROM (VALUES
  ('MC_CARDIO_001', 'The 3am chest pain',     'A 62-year-old man wakes with crushing central chest pain radiating to his left arm.',  'ANAT_CORONARY_ARTERY_001', 'DIS_MYOCARDIAL_INFARCTION_001', 'MEDIUM', 15, 100),
  ('MC_CARDIO_002', 'The breathless banker',   'A 74-year-old presents with progressive exertional dyspnoea and syncope on exertion.', 'ANAT_AORTIC_VALVE_001',    'DIS_AORTIC_STENOSIS_001',       'HARD',   20, 120),
  ('MC_CARDIO_003', 'The irregular pulse',     'A 68-year-old is found to have an irregularly irregular pulse at a routine check-up.',  'ANAT_HEART_001',           'DIS_ATRIAL_FIBRILLATION_001',   'EASY',   10, 80)
) AS v(cid, title, subtitle, anat_cid, dis_cid, diff, mins, xp)
JOIN anatomy_parts ap ON ap.canonical_id = v.anat_cid
JOIN diseases d ON d.canonical_id = v.dis_cid
ON CONFLICT (case_id) DO NOTHING;

INSERT INTO case_vignettes (case_id, patient_age, patient_sex, presenting_complaint, history_text, full_vignette_text)
SELECT c.id, v.age, v.sex, v.complaint, v.history, v.full
FROM cases c JOIN (VALUES
  ('MC_CARDIO_001', 62, 'Male', 'Crushing central chest pain at rest',
   'Woke at 3am with severe chest pain. Diaphoretic and nauseous. Smoker, hypertensive, diabetic.',
   'A 62-year-old man presents to the emergency department at 3:30am with crushing central chest pain that woke him from sleep. The pain radiates to his left arm and jaw. He is diaphoretic and nauseous. He has a 30-year smoking history, type 2 diabetes, and hypertension. His father died of a heart attack at age 58.'),
  ('MC_CARDIO_002', 74, 'Male', 'Progressive exertional dyspnoea and syncope',
   'Increasing breathlessness over 12 months. Two episodes of syncope on exertion. Known ejection systolic murmur.',
   'A 74-year-old retired banker presents with progressive exertional dyspnoea over the past 12 months. He has had two episodes of syncope, both occurring during his morning walk. He was told he had a heart murmur 5 years ago but declined investigation. On examination there is a harsh crescendo-decrescendo ejection systolic murmur radiating to the carotids, with a slow-rising pulse.'),
  ('MC_CARDIO_003', 68, 'Female', 'Irregularly irregular pulse found incidentally',
   'Routine check-up. No palpitations or chest pain. On amlodipine for hypertension.',
   'A 68-year-old woman attends her GP for a routine medication review. She feels well with no palpitations, chest pain, or breathlessness. On examination, her pulse is irregularly irregular at 82 bpm. She is normotensive on amlodipine 5mg. An ECG confirms the rhythm abnormality with absent P waves and irregular R-R intervals.')
) AS v(cid, age, sex, complaint, history, full) ON c.case_id = v.cid
WHERE NOT EXISTS (SELECT 1 FROM case_vignettes cv WHERE cv.case_id = c.id);

-- MC_CARDIO_001 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What is the most likely diagnosis?','DIAGNOSIS'),(2,'Which investigation is most urgent?','REASONING'),(3,'What is the underlying mechanism?','MECHANISM'),(4,'What is the immediate priority treatment?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_CARDIO_001' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Unstable angina',false),('B','ST-elevation myocardial infarction',true),('C','Pulmonary embolism',false),('D','Aortic dissection',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_001' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Chest X-ray',false),('B','12-lead ECG',true),('C','CT pulmonary angiogram',false),('D','Echocardiogram',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_001' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Coronary vasospasm',false),('B','Atherosclerotic plaque rupture with coronary thrombosis',true),('C','Aortic root dilation',false),('D','Pericardial effusion',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_001' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Oral aspirin and outpatient review',false),('B','Dual antiplatelet therapy and emergency PCI',true),('C','IV heparin and bed rest',false),('D','Thrombolysis only',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_001' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);

-- MC_CARDIO_002 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What is the most likely diagnosis?','DIAGNOSIS'),(2,'What is the key auscultatory finding?','REASONING'),(3,'What is the pathological process?','MECHANISM'),(4,'What is the definitive treatment?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_CARDIO_002' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Mitral regurgitation',false),('B','Severe aortic stenosis',true),('C','Hypertrophic cardiomyopathy',false),('D','Pulmonary hypertension',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_002' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Pan-systolic murmur at apex',false),('B','Ejection systolic murmur radiating to carotids with slow-rising pulse',true),('C','Early diastolic murmur at left sternal edge',false),('D','Continuous machinery murmur',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_002' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Mitral annular dilation',false),('B','Calcific degeneration of valve leaflets',true),('C','Infective endocarditis',false),('D','Rheumatic valve disease',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_002' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Lifelong medical management only',false),('B','Aortic valve replacement (surgical or TAVI)',true),('C','Balloon valvuloplasty',false),('D','Rate control with beta-blockers',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_002' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);

-- MC_CARDIO_003 questions + options
INSERT INTO case_questions (case_id, step_number, question_text, question_type)
SELECT c.id, v.step, v.text, v.qtype FROM cases c CROSS JOIN (VALUES (1,'What rhythm is demonstrated?','DIAGNOSIS'),(2,'What ECG feature confirms the diagnosis?','REASONING'),(3,'What is the electrical mechanism?','MECHANISM'),(4,'What is the most important long-term consideration?','TREATMENT')) AS v(step,text,qtype) WHERE c.case_id='MC_CARDIO_003' AND NOT EXISTS (SELECT 1 FROM case_questions cq WHERE cq.case_id=c.id AND cq.step_number=v.step);

INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Atrial flutter',false),('B','Atrial fibrillation',true),('C','Ventricular tachycardia',false),('D','Supraventricular tachycardia',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_003' AND q.step_number=1 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','ST elevation in leads II, III, aVF',false),('B','Absent P waves with irregular R-R intervals',true),('C','Delta waves with short PR interval',false),('D','Saw-tooth baseline pattern',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_003' AND q.step_number=2 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Single macro re-entry circuit',false),('B','Multiple re-entry wavelets in the atria',true),('C','Enhanced automaticity of the AV node',false),('D','Accessory pathway conduction',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_003' AND q.step_number=3 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
INSERT INTO case_options (question_id,option_key,option_text,is_correct) SELECT q.id,v.key,v.text,v.correct FROM case_questions q JOIN cases c ON c.id=q.case_id CROSS JOIN (VALUES ('A','Immediate cardioversion',false),('B','Stroke risk assessment and anticoagulation',true),('C','Ablation as first-line',false),('D','No treatment if asymptomatic',false)) AS v(key,text,correct) WHERE c.case_id='MC_CARDIO_003' AND q.step_number=4 AND NOT EXISTS (SELECT 1 FROM case_options co WHERE co.question_id=q.id AND co.option_key=v.key);
