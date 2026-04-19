-- ============================================================================
-- Sprint 33: Cardiovascular system seed (16 structures).
--
-- Sources (cross-referenced per CLAUDE.md content rules):
--   * Gray's Anatomy of the Human Body, 20th American ed., Bartleby (public domain)
--   * Moore KL, Dalley AF. Clinically Oriented Anatomy, 8th ed. (LWW, 2017)
--   * Dorland's Illustrated Medical Dictionary, 33rd ed. (Elsevier, 2020)
--   * NHS Inform — patient-facing plain-English summaries (UK, accessed 2026-04)
--
-- Every overview is drawn from standard references and cross-checked against
-- at least two sources. Flag for clinical-reviewer sign-off before production.
--
-- Idempotent: ON CONFLICT DO NOTHING on canonical_id.
-- ============================================================================

INSERT INTO body_systems (canonical_id, name, display_order) VALUES
    ('SYS_CARDIOVASCULAR_001', 'Cardiovascular', 1)
ON CONFLICT (canonical_id) DO NOTHING;

-- Each INSERT uses SELECTs to resolve the system_id and optional etymology_root_id.
-- This keeps the seed idempotent and independent of insert order.

INSERT INTO anatomy_parts (canonical_id, display_name, system_id, region, overview, etymology_root_id)
SELECT v.canonical_id, v.display_name, s.id, v.region, v.overview, e.id
FROM body_systems s
LEFT JOIN etymology_roots e ON e.root = v.root_key
CROSS JOIN LATERAL (VALUES
    ('ANAT_HEART_001', 'Heart', 'Thorax', 'kardia',
     'A muscular pump about the size of your fist, sitting between the lungs and tilted slightly to the left. It has four chambers — two atria on top, two ventricles below — that contract in a choreographed sequence roughly 100,000 times a day. The right side sends deoxygenated blood to the lungs; the left side sends oxygenated blood to the body.'),

    ('ANAT_LEFT_VENTRICLE_001', 'Left ventricle', 'Thorax', 'ventriculus',
     'The thickest-walled chamber of the heart, responsible for pushing oxygenated blood out through the aorta to the entire body. Its wall is about three times thicker than the right ventricle because it works against the far higher systemic circulation pressure.'),

    ('ANAT_RIGHT_VENTRICLE_001', 'Right ventricle', 'Thorax', 'ventriculus',
     'Pumps deoxygenated blood received from the right atrium into the pulmonary artery and onward to the lungs. Its wall is thinner than the left ventricle because pulmonary circulation runs at much lower pressure.'),

    ('ANAT_LEFT_ATRIUM_001', 'Left atrium', 'Thorax', 'atrium',
     'The upper left chamber that receives freshly oxygenated blood returning from the lungs via the pulmonary veins, then passes it through the mitral valve into the left ventricle.'),

    ('ANAT_RIGHT_ATRIUM_001', 'Right atrium', 'Thorax', 'atrium',
     'The upper right chamber that receives deoxygenated blood from the body via the superior and inferior vena cavae and passes it through the tricuspid valve into the right ventricle.'),

    ('ANAT_AORTA_001', 'Aorta', 'Thorax', 'aorta',
     'The largest artery in the body. It arches up and over from the left ventricle and then descends through the chest and abdomen, branching to supply every organ with oxygenated blood. Its name in Greek meant literally "the thing that is raised up".'),

    ('ANAT_PULMONARY_ARTERY_001', 'Pulmonary artery', 'Thorax', 'pulmo',
     'The only artery in the body that carries deoxygenated blood. It leaves the right ventricle, quickly divides into left and right branches, and delivers blood to the lungs for gas exchange.'),

    ('ANAT_PULMONARY_VEIN_001', 'Pulmonary vein', 'Thorax', 'vena',
     'The only veins that carry oxygenated blood. Four pulmonary veins return fresh blood from the lungs into the left atrium, where the systemic circuit begins again.'),

    ('ANAT_SUPERIOR_VENA_CAVA_001', 'Superior vena cava', 'Thorax', 'vena',
     'The large vein that drains deoxygenated blood from the head, neck, and upper limbs into the right atrium.'),

    ('ANAT_INFERIOR_VENA_CAVA_001', 'Inferior vena cava', 'Abdomen', 'vena',
     'The largest vein in the body, returning deoxygenated blood from the abdomen, pelvis, and lower limbs to the right atrium.'),

    ('ANAT_MITRAL_VALVE_001', 'Mitral valve', 'Thorax', 'mitra',
     'A two-cusp (bicuspid) valve between the left atrium and left ventricle. It was named after a bishop''s mitre because of its shape, and prevents backflow when the left ventricle contracts.'),

    ('ANAT_TRICUSPID_VALVE_001', 'Tricuspid valve', 'Thorax', 'tri-cuspis',
     'A three-cusp valve between the right atrium and right ventricle. It closes during right-ventricular contraction to stop blood flowing back into the atrium.'),

    ('ANAT_AORTIC_VALVE_001', 'Aortic valve', 'Thorax', 'semilunaris',
     'A semilunar (three half-moon cusps) valve at the exit of the left ventricle into the aorta. It snaps shut after each heartbeat to prevent aortic blood from falling back into the ventricle.'),

    ('ANAT_PULMONARY_VALVE_001', 'Pulmonary valve', 'Thorax', 'semilunaris',
     'A semilunar valve at the exit of the right ventricle into the pulmonary artery. Along with the aortic valve, it produces the second heart sound ("dub") when it closes.'),

    ('ANAT_CORONARY_ARTERY_001', 'Coronary artery', 'Thorax', 'cor',
     'The arteries that supply the heart muscle itself. They arise from the aorta just above the aortic valve and wrap around the heart like a crown — which is exactly what the Latin root "coronaria" meant.'),

    ('ANAT_CAPILLARY_001', 'Capillary', 'Systemic', 'capillaris',
     'The smallest blood vessels, so thin that red blood cells pass through single-file. Oxygen and nutrients cross their walls into tissues; carbon dioxide and waste cross back in. Named from the Latin for "hair-like".')
) AS v(canonical_id, display_name, region, root_key, overview)
WHERE s.canonical_id = 'SYS_CARDIOVASCULAR_001'
ON CONFLICT (canonical_id) DO NOTHING;
