-- ============================================================================
-- Sprint 36: run all v1 content seeds in dependency order.
--
-- Order matters:
--   1. etymology_roots  (referenced by anatomy_parts.etymology_root_id)
--   2. Cardiovascular system structures
--   3. Respiratory system structures
--
-- Usage:
--   psql -h localhost -p 5434 -U $POSTGRES_USER -d $POSTGRES_DB -f scripts/seed_all.sql
--
-- All three seeds are idempotent (ON CONFLICT DO NOTHING on canonical_id).
-- ============================================================================

\i scripts/seed_etymology.sql
\i scripts/seed_cardiovascular.sql
\i scripts/seed_respiratory.sql
