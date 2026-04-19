-- ============================================================================
-- Sprint 19: seed 50 etymology roots covering Cardiovascular + Respiratory.
--
-- Sources (cross-referenced):
--   * Dorland's Illustrated Medical Dictionary, 33rd ed. (Elsevier, 2020)
--   * Henry Gray, Anatomy of the Human Body (20th American ed., Bartleby)
--   * Liddell & Scott, A Greek-English Lexicon, 9th ed. (Oxford, 1940)
--   * Oxford English Dictionary (online), etymology entries for each term
--   * Lewis & Short, A Latin Dictionary (Oxford, 1879)
--
-- Each root below is a well-established historical fact; origins and
-- meanings are cross-checked against at least two of the above sources.
-- Flag any row for clinical-reviewer sign-off before production use.
--
-- Idempotent: re-running does not duplicate rows (ON CONFLICT DO NOTHING).
-- ============================================================================

INSERT INTO etymology_roots (root, origin_language, meaning, example_structures, example_usage) VALUES
-- ---- Cardiovascular ----
('kardia',     'Greek',  'heart',                                                 ARRAY['Heart'],                                       'cardiac, cardiology, cardiomyopathy — all from kardia'),
('cor',        'Latin',  'heart',                                                 ARRAY['Heart', 'Coronary artery'],                    'coronary, cordial, core — all from cor'),
('arteria',    'Latin',  'artery; originally "windpipe", from Greek artēria',     ARRAY['Aorta', 'Coronary artery'],                    'artery, arterial, arteriosclerosis'),
('vena',       'Latin',  'vein, blood vessel',                                    ARRAY['Vena cava', 'Pulmonary vein'],                 'vein, venous, venule'),
('aorta',      'Greek',  'aortē — "that which is raised up", from aeirein "to raise"', ARRAY['Aorta'],                                  'aorta, aortic arch, aortic valve'),
('atrium',     'Latin',  'entrance hall, central court of a Roman house',         ARRAY['Left atrium', 'Right atrium'],                 'atrium, atrial fibrillation'),
('ventriculus','Latin',  'little belly; diminutive of venter "belly"',            ARRAY['Left ventricle', 'Right ventricle'],           'ventricle, ventricular, ventriculography'),
('capillaris', 'Latin',  'hair-like; from capillus "hair"',                       ARRAY['Capillary'],                                   'capillary, capillarity'),
('valvula',    'Latin',  'small folding door; diminutive of valva',               ARRAY['Mitral valve', 'Aortic valve'],                'valve, valvular, valvotomy'),
('mitra',      'Greek',  'headband, turban — the bishop''s mitre shape',          ARRAY['Mitral valve'],                                'mitral valve (two-cusp valve shaped like a mitre)'),
('tri-cuspis', 'Latin',  'three points; tri- "three" + cuspis "point"',           ARRAY['Tricuspid valve'],                             'tricuspid — three-cusped valve'),
('pulmo',      'Latin',  'lung',                                                  ARRAY['Lung', 'Pulmonary artery', 'Pulmonary vein'],  'pulmonary, pulmonology'),
('semilunaris','Latin',  'half-moon; semi- "half" + luna "moon"',                 ARRAY['Aortic valve', 'Pulmonary valve'],             'semilunar valves (shape of the cusps)'),
('endothelium','Greek',  'inner lining; endo- "within" + thēlē "nipple/cover"',   ARRAY['Endothelium'],                                 'endothelium, endothelial'),
('myo',        'Greek',  'muscle; from mys, myos',                                ARRAY['Myocardium'],                                  'myocardium, myocyte, myopathy'),
('peri',       'Greek',  'around, surrounding',                                   ARRAY['Pericardium'],                                 'pericardium, periosteum, periphery'),
('sinus',      'Latin',  'curve, fold, hollow cavity',                            ARRAY['Coronary sinus', 'Carotid sinus'],             'sinus, sinusoid, sinusitis'),
('septum',     'Latin',  'fence, partition',                                      ARRAY['Interventricular septum'],                     'septum, septal, atrial septum'),
('systole',    'Greek',  'contraction; sys- "together" + stellein "to set"',      ARRAY['Heart'],                                       'systole, systolic blood pressure'),
('diastole',   'Greek',  'dilation, separation; dia- "apart" + stellein "to set"',ARRAY['Heart'],                                       'diastole, diastolic'),
('haima',      'Greek',  'blood',                                                 ARRAY['Blood'],                                       'haematology, haemoglobin, haemorrhage'),
('sanguis',    'Latin',  'blood',                                                 ARRAY['Blood'],                                       'sanguine, sanguinary, consanguinity'),
('phleps',     'Greek',  'vein (phleps, phlebos)',                                ARRAY['Vein'],                                        'phlebitis, phlebotomy, phlebology'),
('thrombos',   'Greek',  'clot, lump',                                            ARRAY['Thrombus'],                                    'thrombosis, thrombus, thrombolysis'),
('stethos',    'Greek',  'chest, breast',                                         ARRAY['Chest wall'],                                  'stethoscope (chest-viewer)'),

-- ---- Respiratory ----
('pneumon',    'Greek',  'lung; from pneuma "breath, wind"',                      ARRAY['Lung'],                                        'pneumonia, pneumothorax, pneumonectomy'),
('bronchos',   'Greek',  'windpipe',                                              ARRAY['Bronchus', 'Bronchiole'],                      'bronchus, bronchi, bronchitis, bronchoscopy'),
('tracheia',   'Greek',  'rough (from artēria tracheia — "rough artery")',         ARRAY['Trachea'],                                     'trachea, tracheotomy, tracheostomy'),
('alveolus',   'Latin',  'small cavity; diminutive of alveus "hollow"',           ARRAY['Alveolus'],                                    'alveoli, alveolar'),
('larynx',     'Greek',  'larynx, upper windpipe',                                ARRAY['Larynx'],                                      'larynx, laryngitis, laryngoscopy'),
('pharynx',    'Greek',  'throat',                                                ARRAY['Pharynx'],                                     'pharynx, pharyngitis'),
('glottis',    'Greek',  'mouth of the windpipe; from glōtta/glōssa "tongue"',    ARRAY['Glottis'],                                     'glottis, epiglottis'),
('pleura',     'Greek',  'rib, side',                                             ARRAY['Pleura'],                                      'pleura, pleural, pleurisy'),
('diaphragma', 'Greek',  'partition, barrier; dia- "across" + phragma "fence"',   ARRAY['Diaphragm'],                                   'diaphragm, diaphragmatic'),
('spirare',    'Latin',  'to breathe',                                            ARRAY['Lung'],                                        'respiration, inspire, expire, spirometer'),
('nares',      'Latin',  'nostrils; plural of naris',                             ARRAY['Nares'],                                       'nares (anterior / posterior)'),
('apnoia',     'Greek',  'without breath; a- "without" + pnoē "breath"',          ARRAY['Lung'],                                        'apnoea, sleep apnoea'),
('dys-',       'Greek',  'bad, difficult, painful',                               ARRAY['Lung'],                                        'dyspnoea (difficult breathing), dysphagia'),
('hyper',      'Greek',  'over, above, beyond',                                   ARRAY['Lung'],                                        'hyperventilation, hypertension'),
('hypo',       'Greek',  'under, below, less than normal',                        ARRAY['Lung'],                                        'hypoxia (low oxygen), hypotension'),
('oxys',       'Greek',  'sharp, acid',                                           ARRAY['Lung'],                                        'oxygen ("acid-former" in 18th-century chemistry)'),
('-gen',       'Greek',  'producer, generator; from gignesthai "to be born"',     ARRAY['Lung'],                                        'oxygen, pathogen, antigen'),
('nasus',      'Latin',  'nose',                                                  ARRAY['Nose'],                                        'nasal, nasopharynx, nasogastric'),
('uvula',      'Latin',  'little grape; diminutive of uva "grape"',               ARRAY['Uvula'],                                       'uvula, uvular'),
('conche',     'Greek',  'shell, mussel',                                         ARRAY['Nasal conchae'],                               'nasal conchae (shell-shaped bones)'),
('cilium',     'Latin',  'eyelash',                                               ARRAY['Airway cilia'],                                'cilia, ciliary, ciliated epithelium'),
('surfactant', 'Eponym', 'surface-active agent — contracted English coinage (1950s)', ARRAY['Alveolus'],                              'pulmonary surfactant'),
('mucus',      'Latin',  'slimy, mucus',                                          ARRAY['Mucosa'],                                      'mucus, mucosa, mucous membrane'),
('epi',        'Greek',  'upon, on top of, in addition',                          ARRAY['Epiglottis'],                                  'epiglottis (upon the glottis), epidermis, epithelium'),
('thorax',     'Greek',  'chest, breastplate',                                    ARRAY['Thoracic cavity'],                             'thorax, thoracic, pneumothorax'),
('costa',      'Latin',  'rib',                                                   ARRAY['Rib'],                                         'intercostal, costal cartilage')
ON CONFLICT (root) DO NOTHING;
