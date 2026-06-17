ALTER TABLE consultations
  ADD COLUMN IF NOT EXISTS assigned_to_member_id UUID REFERENCES organization_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS primary_advisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS collaborator_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE consultation_messages
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS member_name TEXT;

ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS assigned_advisors JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_consultations_assigned_member_status_updated
  ON consultations (assigned_to_member_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_primary_advisor_status_updated
  ON consultations (primary_advisor_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_consultations_collaborator_ids_gin
  ON consultations USING GIN (collaborator_ids);

CREATE INDEX IF NOT EXISTS idx_consultation_messages_organization_created
  ON consultation_messages (organization_id, created_at DESC);
