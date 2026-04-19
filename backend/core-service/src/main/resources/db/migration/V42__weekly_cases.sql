-- Sprint 23: weekly mystery case scheduling. Week start = Monday.
CREATE TABLE weekly_cases (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES cases(id),
    week_start  DATE NOT NULL,
    UNIQUE (week_start)
);

CREATE INDEX idx_weekly_cases_week_start ON weekly_cases (week_start DESC);
