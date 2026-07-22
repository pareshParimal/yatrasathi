-- Fix travel_duration_pref column from INTERVAL to VARCHAR(100)
-- to align with the Java entity which stores it as a String (e.g. "2 days", "8 hours")
ALTER TABLE travel_plans
    ALTER COLUMN travel_duration_pref TYPE VARCHAR(100) USING travel_duration_pref::TEXT;
