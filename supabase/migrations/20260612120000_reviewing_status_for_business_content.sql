ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_status_check;

ALTER TABLE events
  ADD CONSTRAINT events_status_check
  CHECK (status IN ('draft', 'reviewing', 'published', 'closed', 'archived'));

ALTER TABLE opportunities
  DROP CONSTRAINT IF EXISTS opportunities_status_check;

ALTER TABLE opportunities
  ADD CONSTRAINT opportunities_status_check
  CHECK (status IN ('draft', 'reviewing', 'published', 'closed', 'archived'));
