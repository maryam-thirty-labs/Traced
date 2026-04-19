-- ============================================================================
-- Sprint 34: Respiratory system seed (12 structures).
--
-- Sources (cross-referenced per CLAUDE.md content rules):
--   * Gray's Anatomy of the Human Body, 20th American ed., Bartleby (public domain)
--   * Moore KL, Dalley AF. Clinically Oriented Anatomy, 8th ed. (LWW, 2017)
--   * Dorland's Illustrated Medical Dictionary, 33rd ed. (Elsevier, 2020)
--   * NHS Inform — patient-facing plain-English summaries (UK, accessed 2026-04)
--
-- Idempotent: ON CONFLICT DO NOTHING on canonical_id.
-- ============================================================================

INSERT INTO body_systems (canonical_id, name, display_order) VALUES
    ('SYS_RESPIRATORY_001', 'Respiratory', 2)
ON CONFLICT (canonical_id) DO NOTHING;

INSERT INTO anatomy_parts (canonical_id, display_name, system_id, region, overview, etymology_root_id)
SELECT v.canonical_id, v.display_name, s.id, v.region, v.overview, e.id
FROM body_systems s
LEFT JOIN etymology_roots e ON e.root = v.root_key
CROSS JOIN LATERAL (VALUES
    ('ANAT_LEFT_LUNG_001', 'Left lung', 'Thorax', 'pneumon',
     'The smaller of the two lungs, with only two lobes to leave room for the heart. Air enters through the left main bronchus, which branches repeatedly until it reaches the alveoli where gas exchange happens.'),

    ('ANAT_RIGHT_LUNG_001', 'Right lung', 'Thorax', 'pneumon',
     'Slightly larger than the left lung and divided into three lobes. Because the right main bronchus is more vertical and wider, inhaled foreign objects tend to lodge there rather than on the left.'),

    ('ANAT_TRACHEA_001', 'Trachea', 'Neck / Thorax', 'tracheia',
     'The windpipe — a flexible tube about 10 cm long, reinforced by C-shaped rings of cartilage that keep it from collapsing. It runs from the larynx and splits at the carina into left and right main bronchi. Named from the Greek "tracheia arteria" (rough artery).'),

    ('ANAT_LEFT_BRONCHUS_001', 'Left main bronchus', 'Thorax', 'bronchos',
     'The left airway trunk that branches from the trachea at the carina and enters the left lung. Longer and more horizontal than the right main bronchus to pass over the heart.'),

    ('ANAT_RIGHT_BRONCHUS_001', 'Right main bronchus', 'Thorax', 'bronchos',
     'The right airway trunk, shorter and more vertical than the left. It enters the right lung and branches into the lobar bronchi for the upper, middle, and lower lobes.'),

    ('ANAT_BRONCHIOLE_001', 'Bronchiole', 'Thorax', 'bronchos',
     'The smallest airways, less than 1 mm in diameter, that sit between the bronchi and the alveolar ducts. Unlike larger airways, bronchioles have no cartilage — their calibre is controlled entirely by smooth muscle.'),

    ('ANAT_ALVEOLUS_001', 'Alveolus', 'Thorax', 'alveolus',
     'The tiny balloon-like sacs at the end of the airway tree where oxygen enters the blood and carbon dioxide leaves. Each lung holds roughly 300 million alveoli; together their surface area would cover a tennis court.'),

    ('ANAT_DIAPHRAGM_001', 'Diaphragm', 'Thorax / Abdomen', 'diaphragma',
     'A dome-shaped sheet of muscle that separates the chest from the abdomen. Its contraction flattens it downward, enlarging the thorax and drawing air into the lungs. The most important muscle of quiet breathing.'),

    ('ANAT_PLEURA_001', 'Pleura', 'Thorax', 'pleura',
     'A thin double-layered membrane. The visceral layer hugs each lung; the parietal layer lines the inside of the chest wall. A thin film of fluid between them lets the lungs slide smoothly during breathing.'),

    ('ANAT_LARYNX_001', 'Larynx', 'Neck', 'larynx',
     'The voice box — a cartilage framework at the top of the trachea that houses the vocal cords. It also guards the airway: the epiglottis folds down to seal the larynx whenever you swallow.'),

    ('ANAT_PHARYNX_001', 'Pharynx', 'Neck', 'pharynx',
     'The common passage for air and food behind the mouth and nose, divided into nasopharynx, oropharynx, and laryngopharynx. It is where the airway and the digestive tract briefly share a route.'),

    ('ANAT_EPIGLOTTIS_001', 'Epiglottis', 'Neck', 'epi',
     'A leaf-shaped flap of elastic cartilage that covers the laryngeal opening during swallowing, preventing food and liquid from entering the trachea. Its name literally means "upon the glottis".')
) AS v(canonical_id, display_name, region, root_key, overview)
WHERE s.canonical_id = 'SYS_RESPIRATORY_001'
ON CONFLICT (canonical_id) DO NOTHING;
