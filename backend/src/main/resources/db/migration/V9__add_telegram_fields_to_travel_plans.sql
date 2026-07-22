ALTER TABLE travel_plans
ADD COLUMN share_location_telegram BOOLEAN DEFAULT FALSE,
ADD COLUMN location_share_interval_hours INTEGER,
ADD COLUMN last_location_shared_at TIMESTAMP;
