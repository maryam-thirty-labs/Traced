CREATE TABLE case_vignettes (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id              UUID NOT NULL UNIQUE REFERENCES cases(id),
    patient_age          INTEGER,
    patient_sex          VARCHAR(20),
    presenting_complaint TEXT,
    history_text         TEXT,
    full_vignette_text   TEXT NOT NULL
);
