-- Sprint 33: link anatomy structures to their primary etymology root.
-- Many structures share roots (e.g., Heart + Coronary artery both from "cor")
-- so this is many-to-one, not a junction table.
ALTER TABLE anatomy_parts
    ADD COLUMN IF NOT EXISTS etymology_root_id UUID REFERENCES etymology_roots(id);
