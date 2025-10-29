-- Seed program templates with fixed IDs
-- This migration adds the default program templates that were previously seeded via seed script

INSERT INTO program_template (id, template_name, description, config, created_at, updated_at) VALUES
(
  'ptmpl_crvqdeugnu5c',
  'Standard Referral Program',
  'A simple referral program with customizable rewards',
  '{"schemaVersion":1,"steps":[{"key":"brand","title":"Brand","description":"Set your brand color"},{"key":"reward","title":"Rewards","description":"Configure reward structure"}],"meta":{}}'::jsonb,
  NOW(),
  NOW()
);
