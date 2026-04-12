CREATE TABLE speciality_anatomy_focus (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    speciality_id       UUID NOT NULL REFERENCES specialities(id),
    anatomy_part_id     UUID NOT NULL REFERENCES anatomy_parts(id),
    focus_reason        TEXT,
    clinical_relevance  TEXT,
    UNIQUE (speciality_id, anatomy_part_id)
);

CREATE INDEX idx_speciality_anatomy_focus_speciality ON speciality_anatomy_focus (speciality_id);
CREATE INDEX idx_speciality_anatomy_focus_anatomy ON speciality_anatomy_focus (anatomy_part_id);

-- Seed: gallbladder and liver under General Surgery + Gastroenterology;
-- heart + coronary arteries + aortic valve under Cardiology;
-- femur + patella + lumbar spine under Orthopaedics
INSERT INTO speciality_anatomy_focus (speciality_id, anatomy_part_id, focus_reason, clinical_relevance)
SELECT s.id, ap.id, v.reason, v.relevance
FROM (VALUES
    ('SPEC_GENERAL_SURGERY_001', 'ANAT_GALLBLADDER_001',
        'Cholecystectomy is the commonest abdominal operation; biliary pathology is core general surgery.',
        'Acute cholecystitis and symptomatic gallstones are routine surgical admissions.'),
    ('SPEC_GENERAL_SURGERY_001', 'ANAT_LIVER_001',
        'Hepatic resections, trauma, and hepatobiliary emergencies fall under surgical care.',
        'Liver trauma and HPB disease are managed by general or HPB surgeons.'),
    ('SPEC_GASTROENTEROLOGY_001', 'ANAT_LIVER_001',
        'Hepatology is a core gastroenterology subspecialty.',
        'Chronic liver disease, hepatitis, and cirrhosis are medically managed.'),
    ('SPEC_GASTROENTEROLOGY_001', 'ANAT_GALLBLADDER_001',
        'Biliary medicine and ERCP sit within gastroenterology.',
        'Medical work-up of biliary disease precedes surgical referral.'),
    ('SPEC_CARDIOLOGY_001', 'ANAT_HEART_001',
        'Cardiology centres on the heart and coronary circulation.',
        'Ischaemic heart disease, heart failure, and arrhythmia are core cardiology.'),
    ('SPEC_CARDIOLOGY_001', 'ANAT_CORONARY_ARTERY_001',
        'Coronary angiography and PCI are cardiology procedures.',
        'STEMI and NSTEMI are the commonest cardiology emergencies.'),
    ('SPEC_CARDIOLOGY_001', 'ANAT_AORTIC_VALVE_001',
        'Valvular disease is managed jointly with cardiothoracic surgery.',
        'Aortic stenosis is diagnosed and followed up in cardiology clinics.'),
    ('SPEC_ORTHOPAEDICS_001', 'ANAT_FEMUR_001',
        'Femoral fractures are a major orthopaedic workload.',
        'Neck of femur fractures are common in the elderly.'),
    ('SPEC_ORTHOPAEDICS_001', 'ANAT_PATELLA_001',
        'Patellar injuries and patellofemoral syndrome are orthopaedic bread and butter.',
        'Common in athletes and post-trauma.'),
    ('SPEC_ORTHOPAEDICS_001', 'ANAT_LUMBAR_SPINE_001',
        'Lumbar spine pathology is managed by spinal orthopaedic surgeons.',
        'Disc herniation and degenerative spine are common referrals.')
) AS v(spec_cid, anat_cid, reason, relevance)
JOIN specialities s ON s.canonical_id = v.spec_cid
JOIN anatomy_parts ap ON ap.canonical_id = v.anat_cid
ON CONFLICT (speciality_id, anatomy_part_id) DO NOTHING;
