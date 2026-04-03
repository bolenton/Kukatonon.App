-- Add optional location fields for stories submitted from mobile
-- These track where the events in the story took place
ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS event_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS event_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS event_location_name TEXT;

-- Add a check constraint to ensure both lat/lng are provided together
ALTER TABLE stories
  ADD CONSTRAINT stories_location_both_or_neither
  CHECK (
    (event_latitude IS NULL AND event_longitude IS NULL)
    OR (event_latitude IS NOT NULL AND event_longitude IS NOT NULL)
  );
