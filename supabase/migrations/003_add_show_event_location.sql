-- Let moderators decide whether a submitted location should appear publicly
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS show_event_location BOOLEAN NOT NULL DEFAULT false;
