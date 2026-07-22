CREATE TABLE travel_plans (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES users(id),
    title               VARCHAR(255) NOT NULL,
    destination_id      UUID REFERENCES places(id),
    travel_medium       VARCHAR(30) NOT NULL,
    boarding_time_pref  TIME,
    deboarding_time_pref TIME,
    travel_duration_pref INTERVAL,
    hotel_max_distance_km NUMERIC(5,2),
    budget_min          NUMERIC(10,2),
    budget_max          NUMERIC(10,2),
    food_preference     VARCHAR(20),
    start_date          DATE,
    end_date            DATE,
    num_travellers      INTEGER DEFAULT 1,
    special_requirements TEXT,
    status              VARCHAR(20) DEFAULT 'DRAFT',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE plan_itinerary_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id         UUID NOT NULL REFERENCES travel_plans(id) ON DELETE CASCADE,
    day_number      INTEGER NOT NULL,
    time_slot       TIME,
    activity        VARCHAR(500) NOT NULL,
    place_id        UUID REFERENCES places(id),
    location_name   VARCHAR(255),
    notes           TEXT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
